/**
 * Routes Contacts - ImmoLomé
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');

const contactController = require('../controllers/contactController');
const { authenticate } = require('../middlewares/auth');
const { validate, commonSchemas } = require('../middlewares/validate');

// ============================================
// ROUTES PROTÉGÉES
// ============================================

/**
 * @route   GET /api/v1/contacts/my-contacts
 * @desc    Mes demandes de contact
 * @access  Private (User)
 */
router.get('/my-contacts', authenticate, contactController.getMyContacts);

/**
 * @route   GET /api/v1/contacts/:id
 * @desc    Détails d'une demande
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }),
  contactController.getContact
);

/**
 * @route   GET /api/v1/contacts/:id/timeline
 * @desc    Timeline d'une demande
 * @access  Private
 */
router.get(
  '/:id/timeline',
  authenticate,
  validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }),
  contactController.getContactTimeline
);

/**
 * @route   POST /api/v1/contacts/:id/cancel
 * @desc    Annuler une demande
 * @access  Private (User)
 */
router.post(
  '/:id/cancel',
  authenticate,
  validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }),
  contactController.cancelContact
);

/**
 * @route   POST /api/v1/contacts/:id/feedback
 * @desc    Ajouter un feedback
 * @access  Private (User)
 */
router.post(
  '/:id/feedback',
  authenticate,
  validate({
    params: Joi.object({ id: commonSchemas.objectId.required() }),
    body: Joi.object({
      rating: Joi.number().min(1).max(5).required(),
      feedback: Joi.string().max(500),
    }),
  }),
  contactController.addVisitFeedback
);

module.exports = router;
