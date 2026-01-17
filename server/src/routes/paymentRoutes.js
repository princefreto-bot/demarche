/**
 * Routes Paiements - ImmoLomé
 * Intégration CinetPay
 */

const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/roles');
const { validate, paymentSchemas, commonSchemas } = require('../middlewares/validate');
const { paymentLimiter, webhookLimiter } = require('../middlewares/rateLimiter');

// ============================================
// WEBHOOKS (Public - CinetPay)
// ============================================

/**
 * @route   POST /api/v1/payments/webhook
 * @desc    Webhook CinetPay
 * @access  Public (CinetPay)
 */
router.post('/webhook', webhookLimiter, paymentController.handleWebhook);

/**
 * @route   GET /api/v1/payments/return
 * @desc    Retour après paiement
 * @access  Public
 */
router.get('/return', paymentController.handleReturn);

/**
 * @route   GET /api/v1/payments/cancel
 * @desc    Annulation paiement
 * @access  Public
 */
router.get('/cancel', paymentController.handleCancel);

// ============================================
// ROUTES PROTÉGÉES
// ============================================

/**
 * @route   POST /api/v1/payments/initiate
 * @desc    Initier un paiement
 * @access  Private (User)
 */
router.post(
  '/initiate',
  authenticate,
  restrictTo('user', 'admin'),
  paymentLimiter,
  validate(paymentSchemas.initiate),
  paymentController.initiatePayment
);

/**
 * @route   GET /api/v1/payments/my-payments
 * @desc    Mes paiements
 * @access  Private
 */
router.get('/my-payments', authenticate, paymentController.getMyPayments);

/**
 * @route   GET /api/v1/payments/reference/:reference
 * @desc    Paiement par référence
 * @access  Private
 */
router.get(
  '/reference/:reference',
  authenticate,
  paymentController.getPaymentByReference
);

/**
 * @route   GET /api/v1/payments/:id/status
 * @desc    Statut d'un paiement
 * @access  Private
 */
router.get(
  '/:id/status',
  authenticate,
  validate({ params: require('joi').object({ id: commonSchemas.objectId.required() }) }),
  paymentController.getPaymentStatus
);

module.exports = router;
