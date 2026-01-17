/**
 * Logger Winston - ImmoLomé
 * Logging structuré pour production
 */

const winston = require('winston');
const path = require('path');
const config = require('../config/env');

// Format personnalisé
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Ajouter la stack trace pour les erreurs
    if (stack) {
      log += `\n${stack}`;
    }
    
    // Ajouter les métadonnées
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Format JSON pour production
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configuration des transports
const transports = [];

// Console (toujours actif)
transports.push(
  new winston.transports.Console({
    format: config.env === 'production' 
      ? jsonFormat 
      : winston.format.combine(
          winston.format.colorize(),
          customFormat
        ),
  })
);

// Fichiers en production
if (config.env === 'production') {
  // Logs d'erreur
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 5242880, // 5 MB
      maxFiles: 5,
    })
  );

  // Tous les logs
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: jsonFormat,
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

// Créer le logger
const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'immolome-api' },
  transports,
  // Ne pas quitter sur les erreurs non gérées
  exitOnError: false,
});

// Stream pour Morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Logger avec contexte utilisateur
 */
const logWithContext = (level, message, context = {}) => {
  logger.log(level, message, {
    ...context,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log d'une requête API
 */
const logRequest = (req, message = 'API Request') => {
  logger.info(message, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id,
    userAgent: req.get('User-Agent'),
  });
};

/**
 * Log d'une erreur avec contexte
 */
const logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    code: error.code,
    ...context,
  });
};

/**
 * Log d'un paiement
 */
const logPayment = (action, data) => {
  logger.info(`Payment: ${action}`, {
    type: 'payment',
    ...data,
  });
};

/**
 * Log de sécurité
 */
const logSecurity = (action, data) => {
  logger.warn(`Security: ${action}`, {
    type: 'security',
    ...data,
  });
};

module.exports = {
  logger,
  logWithContext,
  logRequest,
  logError,
  logPayment,
  logSecurity,
};
