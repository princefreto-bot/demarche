/**
 * Middleware de gestion des erreurs - ImmoLomé
 * Gestion centralisée de toutes les erreurs
 */

const { logger } = require('../utils/logger');
const config = require('../config/env');

/**
 * Classe d'erreur personnalisée
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erreurs prédéfinies
 */
const Errors = {
  BadRequest: (message = 'Requête invalide') => 
    new AppError(message, 400, 'BAD_REQUEST'),
  
  Unauthorized: (message = 'Non autorisé') => 
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  Forbidden: (message = 'Accès interdit') => 
    new AppError(message, 403, 'FORBIDDEN'),
  
  NotFound: (resource = 'Ressource') => 
    new AppError(`${resource} non trouvé(e)`, 404, 'NOT_FOUND'),
  
  Conflict: (message = 'Conflit') => 
    new AppError(message, 409, 'CONFLICT'),
  
  ValidationError: (message = 'Erreur de validation') => 
    new AppError(message, 422, 'VALIDATION_ERROR'),
  
  TooManyRequests: (message = 'Trop de requêtes') => 
    new AppError(message, 429, 'TOO_MANY_REQUESTS'),
  
  InternalError: (message = 'Erreur interne du serveur') => 
    new AppError(message, 500, 'INTERNAL_ERROR'),
  
  PaymentError: (message = 'Erreur de paiement') => 
    new AppError(message, 402, 'PAYMENT_ERROR'),
};

/**
 * Gérer les erreurs de validation Mongoose
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  
  const error = new AppError('Erreur de validation des données', 422);
  error.errors = errors;
  return error;
};

/**
 * Gérer les erreurs de cast Mongoose (ID invalide)
 */
const handleCastError = (err) => {
  return new AppError(`ID invalide: ${err.value}`, 400, 'INVALID_ID');
};

/**
 * Gérer les erreurs de duplicat MongoDB
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(
    `${field} '${value}' existe déjà`,
    409,
    'DUPLICATE_KEY'
  );
};

/**
 * Gérer les erreurs JWT
 */
const handleJWTError = () => {
  return new AppError('Token invalide', 401, 'INVALID_TOKEN');
};

const handleJWTExpiredError = () => {
  return new AppError('Token expiré', 401, 'TOKEN_EXPIRED');
};

/**
 * Envoyer l'erreur en développement (détaillée)
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    code: err.code,
    errors: err.errors,
    stack: err.stack,
    error: err,
  });
};

/**
 * Envoyer l'erreur en production (sécurisée)
 */
const sendErrorProd = (err, res) => {
  // Erreur opérationnelle, on peut montrer le message
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.errors && { errors: err.errors }),
    });
  } else {
    // Erreur de programmation ou inconnue
    logger.error('Erreur non-opérationnelle:', err);
    
    res.status(500).json({
      success: false,
      message: 'Une erreur inattendue s\'est produite',
      code: 'INTERNAL_ERROR',
    });
  }
};

/**
 * Middleware principal de gestion des erreurs
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Logger l'erreur
  if (err.statusCode >= 500) {
    logger.error(`${err.statusCode} - ${err.message}`, {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      stack: err.stack,
    });
  } else {
    logger.warn(`${err.statusCode} - ${err.message}`, {
      path: req.path,
      method: req.method,
    });
  }

  // Transformer certaines erreurs
  let error = { ...err, message: err.message };

  if (err.name === 'ValidationError') {
    error = handleMongooseValidationError(err);
  }
  
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }
  
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }
  
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Envoyer la réponse appropriée selon l'environnement
  if (config.env === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Middleware pour les routes non trouvées
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route non trouvée: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Wrapper async pour éviter les try-catch répétitifs
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  Errors,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
