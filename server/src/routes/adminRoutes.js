/**
 * Routes Admin - ImmoLomé
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');

const adminController = require('../controllers/adminController');
const { authenticate } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/roles');
const { validate, commonSchemas } = require('../middlewares/validate');

// Toutes les routes admin nécessitent authentification + rôle admin
router.use(authenticate);
router.use(adminOnly);

// ============================================
// DASHBOARD
// ============================================

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Dashboard principal
 * @access  Private (Admin)
 */
router.get('/dashboard', adminController.getDashboard);

// ============================================
// GESTION DES CHAMBRES
// ============================================

/**
 * @route   GET /api/v1/admin/rooms
 * @desc    Lister toutes les chambres
 * @access  Private (Admin)
 */
router.get('/rooms', adminController.getAllRooms);

/**
 * @route   POST /api/v1/admin/rooms/:id/validate
 * @desc    Valider une chambre
 * @access  Private (Admin)
 */
router.post(
  '/rooms/:id/validate',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
    body: Joi.object({ notes: Joi.string().max(500) }),
  }),
  adminController.validateRoom
);

/**
 * @route   POST /api/v1/admin/rooms/:id/reject
 * @desc    Rejeter une chambre
 * @access  Private (Admin)
 */
router.post(
  '/rooms/:id/reject',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
    body: Joi.object({ reason: Joi.string().required().max(500) }),
  }),
  adminController.rejectRoom
);

/**
 * @route   PUT /api/v1/admin/rooms/:id/status
 * @desc    Changer le statut d'une chambre
 * @access  Private (Admin)
 */
router.put(
  '/rooms/:id/status',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
    body: Joi.object({
      status: Joi.string().valid('draft', 'pending', 'available', 'processing', 'reserved', 'rented').required(),
    }),
  }),
  adminController.updateRoomStatus
);

// ============================================
// GESTION DES CONTACTS
// ============================================

/**
 * @route   GET /api/v1/admin/contacts
 * @desc    Lister tous les contacts
 * @access  Private (Admin)
 */
router.get('/contacts', adminController.getAllContacts);

/**
 * @route   PUT /api/v1/admin/contacts/:id
 * @desc    Mettre à jour un contact
 * @access  Private (Admin)
 */
router.put(
  '/contacts/:id',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
    body: Joi.object({
      status: Joi.string().valid(
        'pending', 'processing', 'contacted', 'visit_scheduled',
        'visited', 'negotiating', 'successful', 'cancelled', 'failed'
      ),
      priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
      note: Joi.string().max(500),
    }),
  }),
  adminController.updateContact
);

/**
 * @route   POST /api/v1/admin/contacts/:id/assign
 * @desc    Assigner un contact
 * @access  Private (Admin)
 */
router.post(
  '/contacts/:id/assign',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
    body: Joi.object({ adminId: commonSchemas.objectId }),
  }),
  adminController.assignContact
);

/**
 * @route   POST /api/v1/admin/contacts/:id/schedule-visit
 * @desc    Programmer une visite
 * @access  Private (Admin)
 */
router.post(
  '/contacts/:id/schedule-visit',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
    body: Joi.object({
      date: Joi.date().required(),
      time: Joi.string().required(),
    }),
  }),
  adminController.scheduleVisit
);

/**
 * @route   POST /api/v1/admin/contacts/:id/success
 * @desc    Marquer comme réussi
 * @access  Private (Admin)
 */
router.post(
  '/contacts/:id/success',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
  }),
  adminController.markContactSuccess
);

// ============================================
// GESTION DES UTILISATEURS
// ============================================

/**
 * @route   GET /api/v1/admin/users
 * @desc    Lister tous les utilisateurs
 * @access  Private (Admin)
 */
router.get('/users', adminController.getAllUsers);

/**
 * @route   PUT /api/v1/admin/users/:id/toggle-active
 * @desc    Activer/Désactiver un utilisateur
 * @access  Private (Admin)
 */
router.put(
  '/users/:id/toggle-active',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
  }),
  adminController.toggleUserActive
);

/**
 * @route   POST /api/v1/admin/users/:id/verify-owner
 * @desc    Vérifier un propriétaire
 * @access  Private (Admin)
 */
router.post(
  '/users/:id/verify-owner',
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
  }),
  adminController.verifyOwner
);

// ============================================
// GESTION DES PAIEMENTS
// ============================================

/**
 * @route   GET /api/v1/admin/payments
 * @desc    Lister tous les paiements
 * @access  Private (Admin)
 */
router.get('/payments', adminController.getAllPayments);

/**
 * @route   GET /api/v1/admin/payments/stats
 * @desc    Statistiques des paiements
 * @access  Private (Admin)
 */
router.get('/payments/stats', adminController.getPaymentStats);

// ============================================
// LOGS
// ============================================

/**
 * @route   GET /api/v1/admin/logs
 * @desc    Consulter les logs
 * @access  Private (Admin)
 */
router.get('/logs', adminController.getLogs);

module.exports = router;
