/**
 * Contrôleur Admin - ImmoLomé
 * Tableau de bord et gestion complète
 */

const { User, Room, Contact, Payment, Log } = require('../models');
const { success, paginated } = require('../utils/response');
const { asyncHandler, Errors } = require('../middlewares/errorHandler');
const { getPaginationParams, startOfDay, endOfDay } = require('../utils/helpers');

// ============================================
// DASHBOARD
// ============================================

/**
 * @desc    Dashboard principal
 * @route   GET /api/v1/admin/dashboard
 * @access  Private (Admin)
 */
const getDashboard = asyncHandler(async (req, res) => {
  const today = startOfDay(new Date());
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  // Stats globales
  const [
    totalUsers,
    totalOwners,
    totalRooms,
    roomsByStatus,
    pendingRooms,
    pendingContacts,
    recentPayments,
    monthlyRevenue,
    lastMonthRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: 'user', isActive: true }),
    User.countDocuments({ role: 'owner', isActive: true }),
    Room.countDocuments(),
    Room.getStats(),
    Room.countDocuments({ status: 'pending' }),
    Contact.countDocuments({ status: 'pending' }),
    Payment.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName')
      .populate('room', 'title'),
    Payment.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: thisMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    Payment.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: lastMonth, $lt: thisMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Calculer les commissions
  const commissions = await Contact.getTotalCommission(thisMonth, new Date());

  // Formater les stats des chambres
  const roomStats = {};
  roomsByStatus.forEach((stat) => {
    roomStats[stat._id] = {
      count: stat.count,
      avgPrice: Math.round(stat.avgPrice || 0),
    };
  });

  success(res, {
    overview: {
      totalUsers,
      totalOwners,
      totalRooms,
      pendingRooms,
      pendingContacts,
    },
    rooms: roomStats,
    revenue: {
      thisMonth: monthlyRevenue[0]?.total || 0,
      thisMonthCount: monthlyRevenue[0]?.count || 0,
      lastMonth: lastMonthRevenue[0]?.total || 0,
      lastMonthCount: lastMonthRevenue[0]?.count || 0,
      growth: lastMonthRevenue[0]?.total
        ? Math.round(((monthlyRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total * 100)
        : 0,
    },
    commissions: {
      thisMonth: commissions.total,
      count: commissions.count,
    },
    recentPayments: recentPayments.map((p) => ({
      id: p._id,
      reference: p.reference,
      amount: p.amount,
      user: p.user ? `${p.user.firstName} ${p.user.lastName}` : 'N/A',
      room: p.room?.title || 'N/A',
      date: p.completedAt,
    })),
  });
});

// ============================================
// GESTION DES CHAMBRES
// ============================================

/**
 * @desc    Lister toutes les chambres (admin)
 * @route   GET /api/v1/admin/rooms
 * @access  Private (Admin)
 */
const getAllRooms = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);

  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.quartier) filters['location.quartier'] = new RegExp(req.query.quartier, 'i');

  const [rooms, total] = await Promise.all([
    Room.find(filters)
      .populate('owner', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Room.countDocuments(filters),
  ]);

  paginated(res, rooms, { page, limit, total });
});

/**
 * @desc    Valider une chambre
 * @route   POST /api/v1/admin/rooms/:id/validate
 * @access  Private (Admin)
 */
const validateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    throw Errors.NotFound('Chambre');
  }

  if (room.status !== 'pending') {
    throw Errors.BadRequest('Cette chambre n\'est pas en attente de validation');
  }

  // Valider
  room.status = 'available';
  room.validation = {
    isValidated: true,
    validatedAt: new Date(),
    validatedBy: req.user._id,
    validationNotes: req.body.notes,
  };
  room.publishedAt = new Date();
  await room.save();

  // Logger
  await Log.info('room.validated', `Chambre validée: ${room.title}`, {
    actor: { user: req.user._id, role: 'admin' },
    target: { type: 'room', id: room._id },
  });

  success(res, { room }, 'Chambre validée et publiée');
});

/**
 * @desc    Rejeter une chambre
 * @route   POST /api/v1/admin/rooms/:id/reject
 * @access  Private (Admin)
 */
const rejectRoom = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    throw Errors.BadRequest('La raison du rejet est obligatoire');
  }

  const room = await Room.findById(req.params.id);

  if (!room) {
    throw Errors.NotFound('Chambre');
  }

  // Rejeter (retour en draft)
  room.status = 'draft';
  room.rejectionReason = reason;
  room.validation.isValidated = false;
  await room.save();

  // Logger
  await Log.info('room.rejected', `Chambre rejetée: ${room.title}`, {
    actor: { user: req.user._id, role: 'admin' },
    target: { type: 'room', id: room._id },
    data: { reason },
  });

  success(res, { room }, 'Chambre rejetée');
});

/**
 * @desc    Changer le statut d'une chambre
 * @route   PUT /api/v1/admin/rooms/:id/status
 * @access  Private (Admin)
 */
const updateRoomStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['draft', 'pending', 'available', 'processing', 'reserved', 'rented'];

  if (!validStatuses.includes(status)) {
    throw Errors.BadRequest('Statut invalide');
  }

  const room = await Room.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!room) {
    throw Errors.NotFound('Chambre');
  }

  // Logger
  await Log.info('room.status_changed', `Statut chambre changé: ${room.title} -> ${status}`, {
    actor: { user: req.user._id, role: 'admin' },
    target: { type: 'room', id: room._id },
    data: { newStatus: status },
  });

  success(res, { room });
});

// ============================================
// GESTION DES CONTACTS
// ============================================

/**
 * @desc    Lister tous les contacts
 * @route   GET /api/v1/admin/contacts
 * @access  Private (Admin)
 */
const getAllContacts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);

  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.priority) filters.priority = req.query.priority;

  const [contacts, total] = await Promise.all([
    Contact.find(filters)
      .populate('user', 'firstName lastName email phone')
      .populate('room', 'title location.quartier pricing.monthlyRent')
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Contact.countDocuments(filters),
  ]);

  paginated(res, contacts, { page, limit, total });
});

/**
 * @desc    Mettre à jour un contact (admin)
 * @route   PUT /api/v1/admin/contacts/:id
 * @access  Private (Admin)
 */
const updateContact = asyncHandler(async (req, res) => {
  const { status, priority, note } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw Errors.NotFound('Contact');
  }

  // Mettre à jour le statut
  if (status && status !== contact.status) {
    contact.status = status;
    
    // Logger le changement
    await Log.info('contact.status_changed', `Statut contact: ${contact.reference} -> ${status}`, {
      actor: { user: req.user._id, role: 'admin' },
      target: { type: 'contact', id: contact._id },
    });
  }

  // Mettre à jour la priorité
  if (priority) {
    contact.priority = priority;
  }

  // Ajouter une note
  if (note) {
    await contact.addAdminNote(note, req.user._id);
  }

  await contact.save();

  success(res, { contact });
});

/**
 * @desc    Assigner un contact à un admin
 * @route   POST /api/v1/admin/contacts/:id/assign
 * @access  Private (Admin)
 */
const assignContact = asyncHandler(async (req, res) => {
  const { adminId } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw Errors.NotFound('Contact');
  }

  contact.assignedTo = adminId || req.user._id;
  contact.assignedAt = new Date();
  if (contact.status === 'pending') {
    contact.status = 'processing';
  }
  await contact.save();

  // Logger
  await Log.info('contact.assigned', `Contact assigné: ${contact.reference}`, {
    actor: { user: req.user._id, role: 'admin' },
    target: { type: 'contact', id: contact._id },
  });

  success(res, { contact }, 'Contact assigné');
});

/**
 * @desc    Programmer une visite
 * @route   POST /api/v1/admin/contacts/:id/schedule-visit
 * @access  Private (Admin)
 */
const scheduleVisit = asyncHandler(async (req, res) => {
  const { date, time } = req.body;

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    throw Errors.NotFound('Contact');
  }

  await contact.scheduleVisit(new Date(date), time);

  // Logger
  await Log.info('contact.visit_scheduled', `Visite programmée: ${contact.reference}`, {
    actor: { user: req.user._id, role: 'admin' },
    target: { type: 'contact', id: contact._id },
    data: { date, time },
  });

  success(res, { contact }, 'Visite programmée');
});

/**
 * @desc    Marquer comme réussi (location effective)
 * @route   POST /api/v1/admin/contacts/:id/success
 * @access  Private (Admin)
 */
const markContactSuccess = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id)
    .populate('room');

  if (!contact) {
    throw Errors.NotFound('Contact');
  }

  // Commission = 1 mois de loyer
  const commissionAmount = contact.room.pricing.monthlyRent;

  await contact.markAsSuccessful(commissionAmount, req.user._id);

  // Mettre à jour la chambre
  const room = await Room.findById(contact.room._id);
  room.status = 'rented';
  room.rentedAt = new Date();
  room.rentedTo = contact.user;
  room.commissionReceived = {
    amount: commissionAmount,
    receivedAt: new Date(),
  };
  await room.save();

  // Mettre à jour les stats du propriétaire
  await User.findByIdAndUpdate(room.owner, {
    $inc: { 'stats.totalRented': 1 },
  });

  // Logger
  await Log.info('contact.successful', `Location confirmée: ${contact.reference}`, {
    actor: { user: req.user._id, role: 'admin' },
    target: { type: 'contact', id: contact._id },
    data: { commission: commissionAmount },
  });

  success(res, { contact }, 'Location confirmée');
});

// ============================================
// GESTION DES UTILISATEURS
// ============================================

/**
 * @desc    Lister tous les utilisateurs
 * @route   GET /api/v1/admin/users
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);

  const filters = {};
  if (req.query.role) filters.role = req.query.role;
  if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

  const [users, total] = await Promise.all([
    User.find(filters)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .setOptions({ includeInactive: true }),
    User.countDocuments(filters),
  ]);

  paginated(res, users, { page, limit, total });
});

/**
 * @desc    Activer/Désactiver un utilisateur
 * @route   PUT /api/v1/admin/users/:id/toggle-active
 * @access  Private (Admin)
 */
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).setOptions({ includeInactive: true });

  if (!user) {
    throw Errors.NotFound('Utilisateur');
  }

  if (user.role === 'admin') {
    throw Errors.Forbidden('Impossible de désactiver un admin');
  }

  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });

  // Logger
  await Log.info(user.isActive ? 'user.reactivated' : 'user.deactivated', 
    `Utilisateur ${user.isActive ? 'réactivé' : 'désactivé'}: ${user.email}`, {
    actor: { user: req.user._id, role: 'admin' },
    target: { type: 'user', id: user._id },
  });

  success(res, { user: user.toSafeObject() });
});

/**
 * @desc    Vérifier un propriétaire
 * @route   POST /api/v1/admin/users/:id/verify-owner
 * @access  Private (Admin)
 */
const verifyOwner = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw Errors.NotFound('Utilisateur');
  }

  if (user.role !== 'owner') {
    throw Errors.BadRequest('Cet utilisateur n\'est pas un propriétaire');
  }

  user.ownerInfo.isVerified = true;
  user.ownerInfo.verifiedAt = new Date();
  user.ownerInfo.verifiedBy = req.user._id;
  await user.save({ validateBeforeSave: false });

  // Logger
  await Log.info('user.owner_verified', `Propriétaire vérifié: ${user.email}`, {
    actor: { user: req.user._id, role: 'admin' },
    target: { type: 'user', id: user._id },
  });

  success(res, { user: user.toSafeObject() }, 'Propriétaire vérifié');
});

// ============================================
// GESTION DES PAIEMENTS
// ============================================

/**
 * @desc    Lister tous les paiements
 * @route   GET /api/v1/admin/payments
 * @access  Private (Admin)
 */
const getAllPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);

  const filters = {};
  if (req.query.status) filters.status = req.query.status;
  if (req.query.type) filters.type = req.query.type;

  const [payments, total] = await Promise.all([
    Payment.find(filters)
      .populate('user', 'firstName lastName email')
      .populate('room', 'title location.quartier')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filters),
  ]);

  paginated(res, payments, { page, limit, total });
});

/**
 * @desc    Statistiques des paiements
 * @route   GET /api/v1/admin/payments/stats
 * @access  Private (Admin)
 */
const getPaymentStats = asyncHandler(async (req, res) => {
  const [stats, revenueByDay] = await Promise.all([
    Payment.getStats(),
    Payment.getRevenueByPeriod('day', 30),
  ]);

  success(res, { stats, revenueByDay });
});

// ============================================
// LOGS
// ============================================

/**
 * @desc    Consulter les logs
 * @route   GET /api/v1/admin/logs
 * @access  Private (Admin)
 */
const getLogs = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query.page, req.query.limit);

  const filters = {};
  if (req.query.event) filters.event = req.query.event;
  if (req.query.level) filters.level = req.query.level;
  if (req.query.userId) filters.userId = req.query.userId;

  const result = await Log.search(filters, { page, limit });

  paginated(res, result.logs, result.pagination);
});

module.exports = {
  getDashboard,
  getAllRooms,
  validateRoom,
  rejectRoom,
  updateRoomStatus,
  getAllContacts,
  updateContact,
  assignContact,
  scheduleVisit,
  markContactSuccess,
  getAllUsers,
  toggleUserActive,
  verifyOwner,
  getAllPayments,
  getPaymentStats,
  getLogs,
};
