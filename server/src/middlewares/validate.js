/**
 * Middleware de validation - ImmoLomé
 * Validation des requêtes avec Joi
 */

const Joi = require('joi');
const { validationError } = require('../utils/response');

/**
 * Middleware de validation
 * @param {Object} schema - Schéma Joi { body, query, params }
 * @returns {Function} Middleware Express
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Valider body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      
      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: detail.path.join('.'),
            message: detail.message,
            type: 'body',
          });
        });
      } else {
        req.body = schema.body.validate(req.body, { stripUnknown: true }).value;
      }
    }

    // Valider query
    if (schema.query) {
      const { error } = schema.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
      
      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: detail.path.join('.'),
            message: detail.message,
            type: 'query',
          });
        });
      } else {
        req.query = schema.query.validate(req.query, { stripUnknown: true }).value;
      }
    }

    // Valider params
    if (schema.params) {
      const { error } = schema.params.validate(req.params, {
        abortEarly: false,
      });
      
      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: detail.path.join('.'),
            message: detail.message,
            type: 'params',
          });
        });
      }
    }

    // Retourner les erreurs si présentes
    if (errors.length > 0) {
      return validationError(res, errors);
    }

    next();
  };
};

// ============================================
// SCHÉMAS DE VALIDATION COMMUNS
// ============================================

/**
 * Schémas réutilisables
 */
const commonSchemas = {
  // ID MongoDB
  objectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.pattern.base': 'ID invalide',
    }),

  // Email
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .messages({
      'string.email': 'Adresse email invalide',
    }),

  // Mot de passe
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
      'string.pattern.base': 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre',
    }),

  // Téléphone togolais
  phone: Joi.string()
    .pattern(/^(\+228)?[79]\d{7}$/)
    .messages({
      'string.pattern.base': 'Numéro de téléphone togolais invalide (ex: +22890123456)',
    }),

  // Pagination
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(12),
  },

  // Tri
  sort: Joi.string().valid('createdAt', '-createdAt', 'price', '-price', 'views', '-views'),
};

// ============================================
// SCHÉMAS D'AUTHENTIFICATION
// ============================================

const authSchemas = {
  register: {
    body: Joi.object({
      firstName: Joi.string().min(2).max(50).required().trim()
        .messages({ 'any.required': 'Le prénom est obligatoire' }),
      lastName: Joi.string().min(2).max(50).required().trim()
        .messages({ 'any.required': 'Le nom est obligatoire' }),
      email: commonSchemas.email.required()
        .messages({ 'any.required': 'L\'email est obligatoire' }),
      phone: commonSchemas.phone.required()
        .messages({ 'any.required': 'Le téléphone est obligatoire' }),
      password: commonSchemas.password.required()
        .messages({ 'any.required': 'Le mot de passe est obligatoire' }),
      role: Joi.string().valid('user', 'owner').default('user'),
    }),
  },

  login: {
    body: Joi.object({
      email: commonSchemas.email.required(),
      password: Joi.string().required(),
    }),
  },

  forgotPassword: {
    body: Joi.object({
      email: commonSchemas.email.required(),
    }),
  },

  resetPassword: {
    body: Joi.object({
      token: Joi.string().required(),
      password: commonSchemas.password.required(),
    }),
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: commonSchemas.password.required(),
    }),
  },
};

// ============================================
// SCHÉMAS CHAMBRES
// ============================================

const roomSchemas = {
  create: {
    body: Joi.object({
      title: Joi.string().min(10).max(100).required().trim(),
      description: Joi.string().min(50).max(2000).required().trim(),
      location: Joi.object({
        quartier: Joi.string().required().trim(),
        ville: Joi.string().default('Lomé').trim(),
        address: Joi.string().trim(),
        indications: Joi.string().max(500).trim(),
      }).required(),
      pricing: Joi.object({
        monthlyRent: Joi.number().min(5000).max(5000000).required(),
        contractDuration: Joi.number().min(1).max(36).default(12),
        cautionMonths: Joi.number().min(0).max(6).default(1),
        advanceMonths: Joi.number().min(1).max(12).default(1),
        chargesIncluded: Joi.boolean().default(false),
        chargesAmount: Joi.number().min(0).default(0),
      }).required(),
      dimensions: Joi.object({
        length: Joi.number().min(1).max(50).required(),
        width: Joi.number().min(1).max(50).required(),
        height: Joi.number().min(2).max(10).required(),
      }).required(),
      features: Joi.object({
        type: Joi.string().valid(
          'chambre_simple', 'chambre_salon', 'appartement', 
          'studio', 'maison', 'villa'
        ).required(),
        rooms: Joi.number().min(1).max(20).default(1),
        furnished: Joi.boolean().default(false),
        floor: Joi.number().min(0).max(30).default(0),
        hasWater: Joi.boolean().default(true),
        hasElectricity: Joi.boolean().default(true),
        hasInternalToilet: Joi.boolean().default(false),
        hasInternalShower: Joi.boolean().default(false),
        hasInternalKitchen: Joi.boolean().default(false),
        hasFan: Joi.boolean().default(false),
        hasAC: Joi.boolean().default(false),
        hasBalcony: Joi.boolean().default(false),
        hasParking: Joi.boolean().default(false),
        hasGuard: Joi.boolean().default(false),
      }).required(),
      defects: Joi.array().items(
        Joi.object({
          description: Joi.string().max(200).required(),
          severity: Joi.string().valid('mineur', 'modéré', 'important').default('mineur'),
        })
      ).min(1).required(),
      rules: Joi.object({
        petsAllowed: Joi.boolean().default(false),
        smokingAllowed: Joi.boolean().default(false),
        childrenAllowed: Joi.boolean().default(true),
        couplesAllowed: Joi.boolean().default(true),
        maxOccupants: Joi.number().min(1).max(10).default(2),
        otherRules: Joi.string().max(500),
      }),
      availableFrom: Joi.date().default(Date.now),
    }),
  },

  update: {
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
    body: Joi.object({
      title: Joi.string().min(10).max(100).trim(),
      description: Joi.string().min(50).max(2000).trim(),
      // ... autres champs similaires mais non required
    }).min(1),
  },

  list: {
    query: Joi.object({
      ...commonSchemas.pagination,
      sort: commonSchemas.sort,
      quartier: Joi.string().trim(),
      type: Joi.string().valid(
        'chambre_simple', 'chambre_salon', 'appartement',
        'studio', 'maison', 'villa'
      ),
      minPrice: Joi.number().min(0),
      maxPrice: Joi.number().min(0),
      furnished: Joi.boolean(),
      status: Joi.string().valid('available', 'processing', 'reserved', 'rented'),
    }),
  },
};

// ============================================
// SCHÉMAS CONTACTS
// ============================================

const contactSchemas = {
  create: {
    body: Joi.object({
      roomId: commonSchemas.objectId.required(),
      message: Joi.string().min(20).max(1000).required().trim(),
    }),
  },

  update: {
    params: Joi.object({
      id: commonSchemas.objectId.required(),
    }),
    body: Joi.object({
      status: Joi.string().valid(
        'pending', 'processing', 'contacted', 'visit_scheduled',
        'visited', 'negotiating', 'successful', 'cancelled', 'failed'
      ),
      note: Joi.string().max(500),
      priority: Joi.string().valid('low', 'normal', 'high', 'urgent'),
    }),
  },
};

// ============================================
// SCHÉMAS PAIEMENTS
// ============================================

const paymentSchemas = {
  initiate: {
    body: Joi.object({
      roomId: commonSchemas.objectId.required(),
      message: Joi.string().min(20).max(1000).required().trim(),
    }),
  },
};

module.exports = {
  validate,
  commonSchemas,
  authSchemas,
  roomSchemas,
  contactSchemas,
  paymentSchemas,
};
