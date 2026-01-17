/**
 * Configuration des variables d'environnement - ImmoLomé
 * Centralise et valide toutes les variables d'environnement
 */

const dotenv = require('dotenv');
const path = require('path');

// Charger le fichier .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Valide qu'une variable d'environnement existe
 */
const requireEnv = (key, defaultValue = null) => {
  const value = process.env[key] || defaultValue;
  if (value === null && process.env.NODE_ENV === 'production') {
    throw new Error(`Variable d'environnement manquante: ${key}`);
  }
  return value;
};

/**
 * Configuration centralisée
 */
const config = {
  // ============================================
  // SERVEUR
  // ============================================
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: '/api/v1',
  
  // ============================================
  // BASE DE DONNÉES
  // ============================================
  mongodb: {
    uri: requireEnv('MONGODB_URI', 'mongodb://localhost:27017/immolome'),
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },

  // ============================================
  // JWT
  // ============================================
  jwt: {
    secret: requireEnv('JWT_SECRET', 'dev-secret-key-change-in-production'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
  },

  // ============================================
  // BCRYPT
  // ============================================
  bcrypt: {
    saltRounds: 12,
  },

  // ============================================
  // CLOUDINARY
  // ============================================
  cloudinary: {
    cloudName: requireEnv('CLOUDINARY_CLOUD_NAME', 'demo'),
    apiKey: requireEnv('CLOUDINARY_API_KEY', ''),
    apiSecret: requireEnv('CLOUDINARY_API_SECRET', ''),
    folder: 'immolome',
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },

  // ============================================
  // CINETPAY
  // ============================================
  cinetpay: {
    siteId: requireEnv('CINETPAY_SITE_ID', ''),
    apiKey: requireEnv('CINETPAY_API_KEY', ''),
    secretKey: requireEnv('CINETPAY_SECRET_KEY', ''),
    baseUrl: 'https://api-checkout.cinetpay.com/v2',
    notifyUrl: requireEnv('CINETPAY_NOTIFY_URL', 'http://localhost:5000/api/v1/payments/webhook'),
    returnUrl: requireEnv('CINETPAY_RETURN_URL', 'http://localhost:3000/payment/success'),
    cancelUrl: requireEnv('CINETPAY_CANCEL_URL', 'http://localhost:3000/payment/cancel'),
    currency: 'XOF',
    channels: 'ALL', // MOBILE_MONEY, CREDIT_CARD, WALLET, ALL
    lang: 'fr',
    metadata: {
      platform: 'ImmoLomé',
      version: '1.0.0',
    },
  },

  // ============================================
  // FRAIS ET COMMISSIONS
  // ============================================
  fees: {
    contactFee: 1000, // Frais de mise en relation en FCFA
    commissionRate: 1, // 1 mois de loyer
  },

  // ============================================
  // EMAIL (OPTIONNEL - Phase 2)
  // ============================================
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@immolome.com',
  },

  // ============================================
  // RATE LIMITING
  // ============================================
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite par IP
    authMax: 5, // Limite pour auth (login/register)
    authWindowMs: 60 * 60 * 1000, // 1 heure
  },

  // ============================================
  // CORS
  // ============================================
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // ============================================
  // UPLOAD
  // ============================================
  upload: {
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    tempDir: path.join(__dirname, '../../temp'),
  },

  // ============================================
  // PAGINATION
  // ============================================
  pagination: {
    defaultLimit: 12,
    maxLimit: 50,
  },

  // ============================================
  // ADMIN INITIAL
  // ============================================
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@immolome.com',
    password: process.env.ADMIN_PASSWORD || 'AdminSecure123!',
    firstName: 'Admin',
    lastName: 'ImmoLomé',
  },
};

// Validation en production
if (config.env === 'production') {
  const requiredInProduction = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGODB_URI',
    'CINETPAY_SITE_ID',
    'CINETPAY_API_KEY',
    'CINETPAY_SECRET_KEY',
  ];

  requiredInProduction.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Variable d'environnement requise en production: ${key}`);
    }
  });
}

module.exports = config;
