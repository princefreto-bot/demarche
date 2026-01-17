/**
 * Middleware Rate Limiting - ImmoLomé
 * Protection contre les abus et attaques DDoS
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const { logger } = require('../utils/logger');

/**
 * Store en mémoire (pour production, utiliser Redis)
 */
// const RedisStore = require('rate-limit-redis');
// const redis = require('../config/redis');

/**
 * Handler personnalisé pour les limites atteintes
 */
const limitHandler = (req, res, options) => {
  logger.warn('Rate limit atteint', {
    ip: req.ip,
    path: req.path,
    userAgent: req.get('User-Agent'),
  });

  res.status(429).json({
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(options.windowMs / 1000 / 60), // En minutes
  });
};

/**
 * Skip pour certaines conditions
 */
const skipSuccessfulRequests = false;
const skipFailedRequests = false;

/**
 * Rate limiter global
 * 100 requêtes par 15 minutes par IP
 */
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer dans 15 minutes',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler,
  skip: (req) => {
    // Exclure les routes de santé
    return req.path === '/health' || req.path === '/api/v1/health';
  },
});

/**
 * Rate limiter pour l'authentification
 * 5 tentatives par heure par IP
 */
const authLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 1 heure',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, options) => {
    logger.warn('Auth rate limit atteint', {
      ip: req.ip,
      email: req.body?.email,
    });
    
    res.status(429).json({
      success: false,
      message: 'Trop de tentatives de connexion, veuillez réessayer dans 1 heure',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    });
  },
  skipSuccessfulRequests: true, // Ne pas compter les connexions réussies
});

/**
 * Rate limiter pour la création de compte
 * 3 créations par heure par IP
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  message: {
    success: false,
    message: 'Trop de créations de compte, veuillez réessayer plus tard',
    code: 'REGISTER_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter pour les paiements
 * 10 initialisations par heure par utilisateur
 */
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10,
  keyGenerator: (req) => {
    // Utiliser l'ID utilisateur si authentifié, sinon IP
    return req.user?.id || req.ip;
  },
  message: {
    success: false,
    message: 'Trop de tentatives de paiement, veuillez réessayer plus tard',
    code: 'PAYMENT_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter pour l'upload de fichiers
 * 20 uploads par heure par utilisateur
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'Trop d\'uploads, veuillez réessayer plus tard',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter pour les recherches
 * 60 recherches par minute par IP
 */
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    message: 'Trop de recherches, veuillez ralentir',
    code: 'SEARCH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter pour les webhooks
 * Protection contre les attaques sur les endpoints webhook
 */
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // CinetPay peut envoyer plusieurs webhooks
  message: {
    success: false,
    message: 'Rate limit webhook',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Vérifier si c'est une IP CinetPay connue
    // TODO: Ajouter les IPs CinetPay en whitelist
    return false;
  },
});

/**
 * Rate limiter pour les demandes de réinitialisation de mot de passe
 * 3 demandes par heure par email
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3,
  keyGenerator: (req) => req.body?.email || req.ip,
  message: {
    success: false,
    message: 'Trop de demandes de réinitialisation, veuillez réessayer plus tard',
    code: 'PASSWORD_RESET_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Créer un rate limiter personnalisé
 * @param {Object} options - Options de configuration
 */
const createLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      message: 'Rate limit atteint',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    standardHeaders: true,
    legacyHeaders: false,
    handler: options.handler || limitHandler,
    skip: options.skip,
  });
};

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
  paymentLimiter,
  uploadLimiter,
  searchLimiter,
  webhookLimiter,
  passwordResetLimiter,
  createLimiter,
};
