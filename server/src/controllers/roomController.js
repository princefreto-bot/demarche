/**
 * Contrôleur Chambres - ImmoLomé
 * Gestion complète des annonces de chambres
 */

const { Room, User, Log } = require('../models');
const { success, created, noContent, paginated, notFound } = require('../utils/response');
const { asyncHandler, Errors } = require('../middlewares/errorHandler');
const { getPaginationParams } = require('../utils/helpers');
const { deleteImage, deleteImages } = require('../config/cloudinary');

/**
 * @desc    Lister les chambres disponibles (public)
 * @route   GET /api/v1/rooms
 * @access  Public
 */
const getRooms = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);
  
  // Construire les filtres
  const filters = { status: { $in: ['available', 'processing'] } };
  
  // Filtre par quartier
  if (req.query.quartier) {
    filters['location.quartier'] = new RegExp(req.query.quartier, 'i');
  }
  
  // Filtre par type
  if (req.query.type) {
    filters['features.type'] = req.query.type;
  }
  
  // Filtre par prix
  if (req.query.minPrice || req.query.maxPrice) {
    filters['pricing.monthlyRent'] = {};
    if (req.query.minPrice) {
      filters['pricing.monthlyRent'].$gte = parseInt(req.query.minPrice, 10);
    }
    if (req.query.maxPrice) {
      filters['pricing.monthlyRent'].$lte = parseInt(req.query.maxPrice, 10);
    }
  }
  
  // Filtre meublé
  if (req.query.furnished !== undefined) {
    filters['features.furnished'] = req.query.furnished === 'true';
  }

  // Tri
  // Supporte les valeurs frontend historiques et le schéma Joi.
  let sort = { publishedAt: -1 }; // Par défaut : plus récentes
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'createdAt':
        sort = { publishedAt: 1 };
        break;
      case '-createdAt':
        sort = { publishedAt: -1 };
        break;
      case 'price':
      case 'pricing.monthlyRent':
        sort = { 'pricing.monthlyRent': 1 };
        break;
      case '-price':
      case '-pricing.monthlyRent':
        sort = { 'pricing.monthlyRent': -1 };
        break;
      case 'views':
      case '-views':
      case '-stats.views':
        sort = { 'stats.views': -1 };
        break;
      default:
        sort = { publishedAt: -1 };
    }
  }

  // Exécuter la requête
  const [rooms, total] = await Promise.all([
    Room.find(filters)
      .select('-location.address -location.indications -location.coordinates')
      .populate('owner', 'firstName')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Room.countDocuments(filters),
  ]);

  // Transformer pour l'affichage public
  const publicRooms = rooms.map((room) => ({
    ...room,
    owner: room.owner ? { firstName: room.owner.firstName } : null,
  }));

  paginated(res, publicRooms, { page, limit, total }, 'Chambres récupérées');
});

/**
 * @desc    Obtenir une chambre par ID (public)
 * @route   GET /api/v1/rooms/:id
 * @access  Public
 */
const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate('owner', 'firstName');

  if (!room) {
    throw Errors.NotFound('Chambre');
  }

  // Vérifier si visible publiquement
  if (!room.isPubliclyVisible() && (!req.user || req.user.role !== 'admin')) {
    throw Errors.NotFound('Chambre');
  }

  // Incrémenter les vues (async, sans bloquer)
  room.incrementViews().catch(console.error);

  // Retourner version publique ou complète selon le rôle
  if (req.user && (req.user.role === 'admin' || req.user._id.equals(room.owner._id))) {
    success(res, { room });
  } else {
    success(res, { room: room.toPublicObject() });
  }
});

/**
 * @desc    Créer une chambre (propriétaire)
 * @route   POST /api/v1/rooms
 * @access  Private (Owner, Admin)
 */
const createRoom = asyncHandler(async (req, res) => {
  // Assigner le propriétaire
  req.body.owner = req.user._id;
  
  // Statut initial
  req.body.status = 'draft';

  const room = await Room.create(req.body);

  // Mettre à jour les stats du propriétaire
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { 'stats.totalRooms': 1 },
  });

  // Logger
  await Log.info('room.created', `Nouvelle chambre créée: ${room.title}`, {
    actor: { user: req.user._id, role: req.user.role },
    target: { type: 'room', id: room._id },
  });

  created(res, { room }, 'Chambre créée avec succès');
});

/**
 * @desc    Mettre à jour une chambre
 * @route   PUT /api/v1/rooms/:id
 * @access  Private (Owner de la chambre, Admin)
 */
const updateRoom = asyncHandler(async (req, res) => {
  let room = await Room.findById(req.params.id);

  if (!room) {
    throw Errors.NotFound('Chambre');
  }

  // Vérifier les permissions
  if (req.user.role !== 'admin' && !room.owner.equals(req.user._id)) {
    throw Errors.Forbidden('Vous ne pouvez pas modifier cette chambre');
  }

  // Empêcher la modification de certains champs
  delete req.body.owner;
  delete req.body.status; // Le statut se change via une autre route
  delete req.body.validation;
  delete req.body.stats;

  // Si la chambre était validée, repasser en pending
  if (room.validation.isValidated && req.user.role !== 'admin') {
    req.body.status = 'pending';
    req.body['validation.isValidated'] = false;
  }

  // Mettre à jour
  room = await Room.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  // Logger
  await Log.info('room.updated', `Chambre modifiée: ${room.title}`, {
    actor: { user: req.user._id, role: req.user.role },
    target: { type: 'room', id: room._id },
    data: { changedFields: Object.keys(req.body) },
  });

  success(res, { room }, 'Chambre mise à jour');
});

/**
 * @desc    Supprimer une chambre
 * @route   DELETE /api/v1/rooms/:id
 * @access  Private (Owner, Admin)
 */
const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    throw Errors.NotFound('Chambre');
  }

  // Vérifier les permissions
  if (req.user.role !== 'admin' && !room.owner.equals(req.user._id)) {
    throw Errors.Forbidden('Vous ne pouvez pas supprimer cette chambre');
  }

  // Supprimer les photos de Cloudinary
  if (room.photos && room.photos.length > 0) {
    const publicIds = room.photos.map((p) => p.publicId).filter(Boolean);
    if (publicIds.length > 0) {
      await deleteImages(publicIds).catch(console.error);
    }
  }

  // Supprimer la chambre
  await room.deleteOne();

  // Mettre à jour les stats du propriétaire
  await User.findByIdAndUpdate(room.owner, {
    $inc: { 'stats.totalRooms': -1 },
  });

  // Logger
  await Log.info('room.deleted', `Chambre supprimée: ${room.title}`, {
    actor: { user: req.user._id, role: req.user.role },
    target: { type: 'room', id: room._id },
  });

  noContent(res);
});

/**
 * @desc    Soumettre une chambre pour validation
 * @route   POST /api/v1/rooms/:id/submit
 * @access  Private (Owner)
 */
const submitRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    throw Errors.NotFound('Chambre');
  }

  // Vérifier les permissions
  if (!room.owner.equals(req.user._id)) {
    throw Errors.Forbidden('Vous ne pouvez pas soumettre cette chambre');
  }

  // Vérifier que la chambre est en brouillon
  if (room.status !== 'draft') {
    throw Errors.BadRequest('Cette chambre a déjà été soumise');
  }

  // Vérifier qu'il y a au moins 3 photos
  if (!room.photos || room.photos.length < 3) {
    throw Errors.BadRequest('Au moins 3 photos sont requises');
  }

  // Passer en pending
  room.status = 'pending';
  await room.save();

  // Logger
  await Log.info('room.submitted', `Chambre soumise pour validation: ${room.title}`, {
    actor: { user: req.user._id, role: req.user.role },
    target: { type: 'room', id: room._id },
  });

  success(res, { room }, 'Chambre soumise pour validation');
});

/**
 * @desc    Ajouter des photos à une chambre
 * @route   POST /api/v1/rooms/:id/photos
 * @access  Private (Owner, Admin)
 */
const addPhotos = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    throw Errors.NotFound('Chambre');
  }

  // Vérifier les permissions
  if (req.user.role !== 'admin' && !room.owner.equals(req.user._id)) {
    throw Errors.Forbidden('Vous ne pouvez pas modifier cette chambre');
  }

  // Vérifier qu'il y a des fichiers
  if (!req.files || req.files.length === 0) {
    throw Errors.BadRequest('Aucune photo fournie');
  }

  // Limiter à 10 photos max
  if (room.photos.length + req.files.length > 10) {
    throw Errors.BadRequest('Maximum 10 photos par chambre');
  }

  // Ajouter les photos
  const newPhotos = req.files.map((file, index) => ({
    url: file.path,
    publicId: file.filename,
    order: room.photos.length + index,
    isMain: room.photos.length === 0 && index === 0,
  }));

  room.photos.push(...newPhotos);
  await room.save();

  // Logger
  await Log.info('room.photos_added', `${req.files.length} photos ajoutées`, {
    actor: { user: req.user._id, role: req.user.role },
    target: { type: 'room', id: room._id },
  });

  success(res, { photos: room.photos }, 'Photos ajoutées');
});

/**
 * @desc    Supprimer une photo
 * @route   DELETE /api/v1/rooms/:id/photos/:photoId
 * @access  Private (Owner, Admin)
 */
const deletePhoto = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (!room) {
    throw Errors.NotFound('Chambre');
  }

  // Vérifier les permissions
  if (req.user.role !== 'admin' && !room.owner.equals(req.user._id)) {
    throw Errors.Forbidden('Vous ne pouvez pas modifier cette chambre');
  }

  // Trouver la photo
  const photoIndex = room.photos.findIndex(
    (p) => p._id.toString() === req.params.photoId
  );

  if (photoIndex === -1) {
    throw Errors.NotFound('Photo');
  }

  const photo = room.photos[photoIndex];

  // Supprimer de Cloudinary
  if (photo.publicId) {
    await deleteImage(photo.publicId).catch(console.error);
  }

  // Supprimer du tableau
  room.photos.splice(photoIndex, 1);
  await room.save();

  // Logger
  await Log.info('room.photos_deleted', `Photo supprimée`, {
    actor: { user: req.user._id, role: req.user.role },
    target: { type: 'room', id: room._id },
  });

  success(res, { photos: room.photos }, 'Photo supprimée');
});

/**
 * @desc    Obtenir mes chambres (propriétaire)
 * @route   GET /api/v1/rooms/my-rooms
 * @access  Private (Owner)
 */
const getMyRooms = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);

  const filters = { owner: req.user._id };

  if (req.query.status) {
    filters.status = req.query.status;
  }

  const [rooms, total] = await Promise.all([
    Room.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Room.countDocuments(filters),
  ]);

  paginated(res, rooms, { page, limit, total }, 'Mes chambres');
});

/**
 * @desc    Recherche de chambres
 * @route   GET /api/v1/rooms/search
 * @access  Public
 */
const searchRooms = asyncHandler(async (req, res) => {
  const { q, page, limit, skip } = {
    q: req.query.q,
    ...getPaginationParams(req.query.page, req.query.limit),
  };

  if (!q || q.length < 2) {
    throw Errors.BadRequest('Terme de recherche trop court');
  }

  const [rooms, total] = await Promise.all([
    Room.find(
      {
        $text: { $search: q },
        status: { $in: ['available', 'processing'] },
      },
      { score: { $meta: 'textScore' } }
    )
      .select('-location.address -location.indications')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean(),
    Room.countDocuments({
      $text: { $search: q },
      status: { $in: ['available', 'processing'] },
    }),
  ]);

  paginated(res, rooms, { page, limit, total }, `Résultats pour "${q}"`);
});

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  submitRoom,
  addPhotos,
  deletePhoto,
  getMyRooms,
  searchRooms,
};
