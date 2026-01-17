/**
 * Configuration Express - ImmoLomé
 * Application principale
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const config = require('./config/env');
const { logger } = require('./utils/logger');
const { globalLimiter } = require('./middlewares/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Import des routes
const routes = require('./routes');

// Créer l'application Express
const app = express();

// ============================================
// MIDDLEWARES DE SÉCURITÉ
// ============================================

// Helmet - Headers de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: config.env === 'production' ? undefined : false,
}));

// CORS
app.use(cors(config.cors));

// Options pré-vol
app.options('*', cors(config.cors));

// Rate limiting global
app.use(globalLimiter);

// Protection NoSQL injection
app.use(mongoSanitize());

// Protection XSS
app.use(xss());

// Protection pollution des paramètres
app.use(hpp({
  whitelist: ['price', 'quartier', 'type', 'sort'],
}));

// ============================================
// MIDDLEWARES UTILITAIRES
// ============================================

// Compression des réponses
app.use(compression());

// Parser JSON
// NOTE: on capture le raw body (Buffer) pour la validation de signature webhook (CinetPay)
app.use(express.json({
  limit: '200kb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));

// Parser URL encoded
app.use(express.urlencoded({
  extended: true,
  limit: '200kb',
  verify: (req, res, buf) => {
    // Ne pas écraser un rawBody déjà présent (JSON), mais le compléter si nécessaire
    if (!req.rawBody) req.rawBody = buf;
  },
}));

// Parser cookies
app.use(cookieParser());

// Logging des requêtes
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Servir les fichiers statiques (si nécessaire)
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// HEADERS PERSONNALISÉS
// ============================================

app.use((req, res, next) => {
  // Ajouter un ID de requête pour le tracking
  req.requestId = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  
  // Timing
  req.startTime = Date.now();
  
  // Log de fin de requête
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    if (duration > 1000) { // Log les requêtes lentes (> 1s)
      logger.warn(`Requête lente: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
});

// ============================================
// ROUTES DE SANTÉ
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ImmoLomé API is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

app.get('/api/v1/health', (req, res) => {
  const mongoose = require('mongoose');
  
  res.status(200).json({
    success: true,
    message: 'API Health Check',
    timestamp: new Date().toISOString(),
    environment: config.env,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// ============================================
// ROUTES API
// ============================================

app.use(config.apiPrefix, routes);

// ============================================
// GESTION DES ERREURS
// ============================================

// Route non trouvée
app.use(notFoundHandler);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// ============================================
// GESTION DES ERREURS NON CAPTURÉES
// ============================================

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // En production, on pourrait vouloir redémarrer le processus
  if (config.env === 'production') {
    process.exit(1);
  }
});

module.exports = app;
