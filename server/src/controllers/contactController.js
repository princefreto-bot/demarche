/**
 * Contrôleur Contacts - ImmoLomé
 * Gestion des demandes de contact (après paiement)
 */

const { Contact, Room, Log } = require('../models');
const { success, paginated, notFound } = require('../utils/response');
const { asyncHandler, Errors } = require('../middlewares/errorHandler');
const { getPaginationParams } = require('../utils/helpers');

/**
 * @desc    Obtenir mes demandes de contact
 * @route   GET /api/v1/contacts/my-contacts
 * @access  Private (User)
 */
const getMyContacts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);

  const filters = { user: req.user._id };

  if (req.query.status) {
    filters.status = req.query.status;
  }

  const [contacts, total] = await Promise.all([
    Contact.find(filters)
      .populate('room', 'title location.quartier pricing.monthlyRent photos')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Contact.countDocuments(filters),
  ]);

  paginated(res, contacts, { page, limit, total }, 'Mes demandes de contact');
});

/**
 * @desc    Obtenir une demande de contact
 * @route   GET /api/v1/contacts/:id
 * @access  Private
 */
const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id)
    .populate('room', 'title location pricing photos features')
    .populate('payment', 'reference amount status completedAt')
    .populate('assignedTo', 'firstName lastName');

  if (!contact) {
    throw Errors.NotFound('Demande de contact');
  }

  // Vérifier les permissions
  if (req.user.role !== 'admin' && !contact.user.equals(req.user._id)) {
    throw Errors.Forbidden('Accès non autorisé');
  }

  success(res, { contact });
});

/**
 * @desc    Obtenir le suivi d'une demande
 * @route   GET /api/v1/contacts/:id/timeline
 * @access  Private
 */
const getContactTimeline = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id)
    .select('status createdAt processedAt contactedOwnerAt visit closedAt adminNotes communications');

  if (!contact) {
    throw Errors.NotFound('Demande de contact');
  }

  // Vérifier les permissions
  if (req.user.role !== 'admin' && !contact.user.equals(req.user._id)) {
    throw Errors.Forbidden('Accès non autorisé');
  }

  // Construire la timeline
  const timeline = [];

  // Création
  timeline.push({
    date: contact.createdAt,
    event: 'created',
    label: 'Demande créée',
    description: 'Votre demande de contact a été enregistrée',
  });

  // Traitement
  if (contact.processedAt) {
    timeline.push({
      date: contact.processedAt,
      event: 'processing',
      label: 'En cours de traitement',
      description: 'Un conseiller analyse votre demande',
    });
  }

  // Contact propriétaire
  if (contact.contactedOwnerAt) {
    timeline.push({
      date: contact.contactedOwnerAt,
      event: 'contacted',
      label: 'Propriétaire contacté',
      description: 'Le propriétaire a été contacté par notre équipe',
    });
  }

  // Visite programmée
  if (contact.visit?.scheduledDate) {
    timeline.push({
      date: contact.visit.scheduledDate,
      event: 'visit_scheduled',
      label: 'Visite programmée',
      description: `Visite prévue le ${new Date(contact.visit.scheduledDate).toLocaleDateString('fr-FR')} à ${contact.visit.scheduledTime || 'confirmer'}`,
    });
  }

  // Visite effectuée
  if (contact.visit?.completedAt) {
    timeline.push({
      date: contact.visit.completedAt,
      event: 'visited',
      label: 'Visite effectuée',
      description: 'La visite a été réalisée',
    });
  }

  // Clôture
  if (contact.closedAt) {
    timeline.push({
      date: contact.closedAt,
      event: contact.status,
      label: contact.status === 'successful' ? 'Location confirmée' : 
             contact.status === 'failed' ? 'Non abouti' : 'Annulé',
      description: contact.status === 'successful' 
        ? 'Félicitations ! Vous avez obtenu le logement'
        : contact.outcome?.failureReason || 'Demande clôturée',
    });
  }

  // Trier par date
  timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

  success(res, { timeline, currentStatus: contact.status });
});

/**
 * @desc    Annuler une demande (avant traitement)
 * @route   POST /api/v1/contacts/:id/cancel
 * @access  Private (User)
 */
const cancelContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw Errors.NotFound('Demande de contact');
  }

  // Vérifier les permissions
  if (!contact.user.equals(req.user._id)) {
    throw Errors.Forbidden('Accès non autorisé');
  }

  // Vérifier que la demande peut être annulée
  if (!['pending', 'processing'].includes(contact.status)) {
    throw Errors.BadRequest('Cette demande ne peut plus être annulée');
  }

  // Annuler
  contact.status = 'cancelled';
  contact.closedAt = new Date();
  contact.outcome = {
    isSuccessful: false,
    concludedAt: new Date(),
    failureReason: 'Annulée par l\'utilisateur',
  };
  await contact.save();

  // Remettre la chambre en disponible si c'était la seule demande en cours
  const otherActiveContacts = await Contact.countDocuments({
    room: contact.room,
    status: { $in: ['pending', 'processing', 'contacted', 'visit_scheduled', 'visited', 'negotiating'] },
    _id: { $ne: contact._id },
  });

  if (otherActiveContacts === 0) {
    await Room.findByIdAndUpdate(contact.room, { status: 'available' });
  }

  // Logger
  await Log.info('contact.cancelled', `Demande annulée: ${contact.reference}`, {
    actor: { user: req.user._id },
    target: { type: 'contact', id: contact._id },
  });

  success(res, { contact }, 'Demande annulée');
});

/**
 * @desc    Donner un feedback sur la visite
 * @route   POST /api/v1/contacts/:id/feedback
 * @access  Private (User)
 */
const addVisitFeedback = asyncHandler(async (req, res) => {
  const { rating, feedback } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw Errors.NotFound('Demande de contact');
  }

  // Vérifier les permissions
  if (!contact.user.equals(req.user._id)) {
    throw Errors.Forbidden('Accès non autorisé');
  }

  // Vérifier que la visite a eu lieu
  if (!contact.visit?.completed) {
    throw Errors.BadRequest('La visite n\'a pas encore été effectuée');
  }

  // Ajouter le feedback
  contact.visit.feedback = feedback;
  contact.visit.rating = rating;
  await contact.save();

  // Logger
  await Log.info('contact.feedback_added', `Feedback ajouté: ${contact.reference}`, {
    actor: { user: req.user._id },
    target: { type: 'contact', id: contact._id },
    data: { rating },
  });

  success(res, { contact }, 'Feedback enregistré');
});

module.exports = {
  getMyContacts,
  getContact,
  getContactTimeline,
  cancelContact,
  addVisitFeedback,
};
