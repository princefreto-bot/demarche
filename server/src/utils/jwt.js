/**
 * Utilitaires JWT - ImmoLomé
 * Gestion des tokens d'authentification
 */

const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Générer un Access Token
 * @param {Object} payload - Données à encoder
 * @returns {string} Token JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'immolome',
    audience: 'immolome-users',
  });
};

/**
 * Générer un Refresh Token
 * @param {Object} payload - Données à encoder
 * @returns {string} Refresh Token JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'immolome',
    audience: 'immolome-users',
  });
};

/**
 * Générer les deux tokens
 * @param {Object} user - Utilisateur
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokens = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Vérifier un Access Token
 * @param {string} token - Token à vérifier
 * @returns {Object} Payload décodé
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'immolome',
      audience: 'immolome-users',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expiré');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token invalide');
    }
    throw error;
  }
};

/**
 * Vérifier un Refresh Token
 * @param {string} token - Token à vérifier
 * @returns {Object} Payload décodé
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'immolome',
      audience: 'immolome-users',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expiré');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Refresh token invalide');
    }
    throw error;
  }
};

/**
 * Décoder un token sans vérification (pour debug)
 * @param {string} token - Token à décoder
 * @returns {Object} Payload décodé
 */
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

/**
 * Vérifier si un token est proche de l'expiration
 * @param {string} token - Token à vérifier
 * @param {number} thresholdSeconds - Seuil en secondes (default: 5 min)
 * @returns {boolean} True si proche de l'expiration
 */
const isTokenExpiringSoon = (token, thresholdSeconds = 300) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp - now < thresholdSeconds;
  } catch {
    return true;
  }
};

/**
 * Extraire le token du header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token ou null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpiringSoon,
  extractTokenFromHeader,
};
