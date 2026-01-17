/**
 * Helpers utilitaires - ImmoLomé
 */

const crypto = require('crypto');

/**
 * Générer un ID unique
 * @param {string} prefix - Préfixe optionnel
 * @returns {string} ID unique
 */
const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

/**
 * Générer un code aléatoire (pour vérification)
 * @param {number} length - Longueur du code
 * @returns {string} Code numérique
 */
const generateCode = (length = 6) => {
  return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
};

/**
 * Formater un prix en FCFA
 * @param {number} amount - Montant
 * @returns {string} Prix formaté
 */
const formatPrice = (amount) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

/**
 * Formater un numéro de téléphone togolais
 * @param {string} phone - Numéro brut
 * @returns {string} Numéro formaté
 */
const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Nettoyer le numéro
  let cleaned = phone.replace(/\D/g, '');
  
  // Ajouter le préfixe +228 si nécessaire
  if (cleaned.length === 8) {
    cleaned = '228' + cleaned;
  }
  
  // Formater
  if (cleaned.startsWith('228') && cleaned.length === 11) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  
  return phone;
};

/**
 * Valider un numéro de téléphone togolais
 * @param {string} phone - Numéro à valider
 * @returns {boolean} Valide ou non
 */
const isValidTogoPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  
  // 8 chiffres ou 11 avec préfixe 228
  if (cleaned.length === 8) {
    return /^[79]\d{7}$/.test(cleaned);
  }
  if (cleaned.length === 11) {
    return /^228[79]\d{7}$/.test(cleaned);
  }
  
  return false;
};

/**
 * Normaliser un numéro de téléphone
 * @param {string} phone - Numéro brut
 * @returns {string} Numéro normalisé (+228XXXXXXXX)
 */
const normalizePhone = (phone) => {
  if (!phone) return '';
  
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 8) {
    cleaned = '228' + cleaned;
  }
  
  return '+' + cleaned;
};

/**
 * Slugify une chaîne
 * @param {string} text - Texte à transformer
 * @returns {string} Slug
 */
const slugify = (text) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

/**
 * Tronquer un texte
 * @param {string} text - Texte à tronquer
 * @param {number} length - Longueur max
 * @returns {string} Texte tronqué
 */
const truncate = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

/**
 * Calculer les coordonnées de pagination
 * @param {number} page - Page courante
 * @param {number} limit - Limite par page
 * @returns {Object} { skip, limit }
 */
const getPaginationParams = (page = 1, limit = 12) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  
  return {
    skip: (pageNum - 1) * limitNum,
    limit: limitNum,
    page: pageNum,
  };
};

/**
 * Parser les filtres de requête
 * @param {Object} query - Query params
 * @param {Array} allowedFields - Champs autorisés
 * @returns {Object} Filtres MongoDB
 */
const parseFilters = (query, allowedFields = []) => {
  const filters = {};
  
  allowedFields.forEach((field) => {
    if (query[field] !== undefined && query[field] !== '') {
      // Gestion des ranges (min/max)
      if (field.startsWith('min') || field.startsWith('max')) {
        const realField = field.replace(/^(min|max)/, '').toLowerCase();
        const operator = field.startsWith('min') ? '$gte' : '$lte';
        
        if (!filters[realField]) filters[realField] = {};
        filters[realField][operator] = parseFloat(query[field]);
      } else {
        filters[field] = query[field];
      }
    }
  });
  
  return filters;
};

/**
 * Masquer partiellement un email
 * @param {string} email - Email à masquer
 * @returns {string} Email masqué
 */
const maskEmail = (email) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  const maskedLocal = local.charAt(0) + '***' + local.charAt(local.length - 1);
  return `${maskedLocal}@${domain}`;
};

/**
 * Masquer partiellement un téléphone
 * @param {string} phone - Téléphone à masquer
 * @returns {string} Téléphone masqué
 */
const maskPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.slice(0, 3) + '****' + cleaned.slice(-2);
};

/**
 * Calculer la surface
 * @param {number} length - Longueur
 * @param {number} width - Largeur
 * @returns {number} Surface en m²
 */
const calculateSurface = (length, width) => {
  return Math.round(length * width * 100) / 100;
};

/**
 * Calculer le montant total du contrat
 * @param {number} monthlyRent - Loyer mensuel
 * @param {number} duration - Durée en mois
 * @returns {number} Montant total
 */
const calculateTotalAmount = (monthlyRent, duration) => {
  return monthlyRent * duration;
};

/**
 * Vérifier si une date est passée
 * @param {Date} date - Date à vérifier
 * @returns {boolean}
 */
const isPastDate = (date) => {
  return new Date(date) < new Date();
};

/**
 * Obtenir le début de la journée
 * @param {Date} date - Date
 * @returns {Date}
 */
const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Obtenir la fin de la journée
 * @param {Date} date - Date
 * @returns {Date}
 */
const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Attendre un délai
 * @param {number} ms - Millisecondes
 * @returns {Promise}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  generateId,
  generateCode,
  formatPrice,
  formatPhone,
  isValidTogoPhone,
  normalizePhone,
  slugify,
  truncate,
  getPaginationParams,
  parseFilters,
  maskEmail,
  maskPhone,
  calculateSurface,
  calculateTotalAmount,
  isPastDate,
  startOfDay,
  endOfDay,
  sleep,
};
