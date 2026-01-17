/**
 * Routes Chambres - ImmoLomé
 */

const express = require('express');
const router = express.Router();

const roomController = require('../controllers/roomController');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/roles');
const { validate, roomSchemas, commonSchemas } = require('../middlewares/validate');
const { uploadLimiter, searchLimiter } = require('../middlewares/rateLimiter');
const { uploadRoomPhotos } = require('../config/cloudinary');

// ============================================
// ROUTES PUBLIQUES
// ============================================

/**
 * @route   GET /api/v1/rooms
 * @desc    Lister les chambres disponibles
 * @access  Public
 */
router.get('/', validate(roomSchemas.list), roomController.getRooms);

/**
 * @route   GET /api/v1/rooms/search
 * @desc    Rechercher des chambres
 * @access  Public
 */
router.get('/search', searchLimiter, roomController.searchRooms);

// ============================================
// ROUTES PROPRIÉTAIRE
// ============================================

/**
 * @route   GET /api/v1/rooms/my-rooms
 * @desc    Mes chambres (propriétaire)
 * @access  Private (Owner)
 */
router.get(
  '/owner/my-rooms',
  authenticate,
  restrictTo('owner', 'admin'),
  roomController.getMyRooms
);

// ============================================
// ROUTES PUBLIQUES (détail) — IMPORTANT: après /owner/my-rooms
// ============================================

/**
 * @route   GET /api/v1/rooms/:id
 * @desc    Détails d'une chambre
 * @access  Public
 */
router.get(
  '/:id',
  optionalAuth,
  validate({ params: require('joi').object({ id: commonSchemas.objectId.required() }) }),
  roomController.getRoomById
);

/**
 * @route   POST /api/v1/rooms
 * @desc    Créer une chambre
 * @access  Private (Owner, Admin)
 */
router.post(
  '/',
  authenticate,
  restrictTo('owner', 'admin'),
  validate(roomSchemas.create),
  roomController.createRoom
);

/**
 * @route   PUT /api/v1/rooms/:id
 * @desc    Modifier une chambre
 * @access  Private (Owner de la chambre, Admin)
 */
router.put(
  '/:id',
  authenticate,
  restrictTo('owner', 'admin'),
  validate(roomSchemas.update),
  roomController.updateRoom
);

/**
 * @route   DELETE /api/v1/rooms/:id
 * @desc    Supprimer une chambre
 * @access  Private (Owner, Admin)
 */
router.delete(
  '/:id',
  authenticate,
  restrictTo('owner', 'admin'),
  roomController.deleteRoom
);

/**
 * @route   POST /api/v1/rooms/:id/submit
 * @desc    Soumettre pour validation
 * @access  Private (Owner)
 */
router.post(
  '/:id/submit',
  authenticate,
  restrictTo('owner', 'admin'),
  roomController.submitRoom
);

/**
 * @route   POST /api/v1/rooms/:id/photos
 * @desc    Ajouter des photos
 * @access  Private (Owner, Admin)
 */
router.post(
  '/:id/photos',
  authenticate,
  restrictTo('owner', 'admin'),
  uploadLimiter,
  uploadRoomPhotos.array('photos', 10),
  roomController.addPhotos
);

/**
 * @route   DELETE /api/v1/rooms/:id/photos/:photoId
 * @desc    Supprimer une photo
 * @access  Private (Owner, Admin)
 */
router.delete(
  '/:id/photos/:photoId',
  authenticate,
  restrictTo('owner', 'admin'),
  roomController.deletePhoto
);

module.exports = router;
