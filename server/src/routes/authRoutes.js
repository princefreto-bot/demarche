/**
 * Routes Authentification - ImmoLomé
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate, authSchemas } = require('../middlewares/validate');
const { authLimiter, registerLimiter, passwordResetLimiter } = require('../middlewares/rateLimiter');

// ============================================
// ROUTES PUBLIQUES
// ============================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Inscription
 * @access  Public
 */
router.post(
  '/register',
  registerLimiter,
  validate(authSchemas.register),
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Connexion
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validate(authSchemas.login),
  authController.login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Rafraîchir le token
 * @access  Public
 */
router.post('/refresh', authController.refreshAccessToken);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Demander réinitialisation mot de passe
 * @access  Public
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(authSchemas.forgotPassword),
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Réinitialiser le mot de passe
 * @access  Public
 */
router.post(
  '/reset-password',
  validate(authSchemas.resetPassword),
  authController.resetPassword
);

// ============================================
// ROUTES PROTÉGÉES
// ============================================

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Déconnexion
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Changer le mot de passe
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validate(authSchemas.changePassword),
  authController.changePassword
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Obtenir le profil connecté
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
