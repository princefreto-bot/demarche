/**
 * Utilitaires de réponse API - ImmoLomé
 * Standardisation des réponses JSON
 */

/**
 * Réponse de succès
 * @param {Object} res - Response Express
 * @param {Object} data - Données à retourner
 * @param {string} message - Message de succès
 * @param {number} statusCode - Code HTTP (default: 200)
 */
const success = (res, data = null, message = 'Succès', statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Réponse de création
 * @param {Object} res - Response Express
 * @param {Object} data - Données créées
 * @param {string} message - Message de succès
 */
const created = (res, data = null, message = 'Ressource créée avec succès') => {
  return success(res, data, message, 201);
};

/**
 * Réponse sans contenu
 * @param {Object} res - Response Express
 */
const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Réponse d'erreur
 * @param {Object} res - Response Express
 * @param {string} message - Message d'erreur
 * @param {number} statusCode - Code HTTP (default: 400)
 * @param {Object} errors - Détails des erreurs (optionnel)
 */
const error = (res, message = 'Erreur', statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Erreur de validation
 * @param {Object} res - Response Express
 * @param {Array|Object} errors - Erreurs de validation
 */
const validationError = (res, errors) => {
  return error(res, 'Erreur de validation', 422, errors);
};

/**
 * Erreur non autorisé
 * @param {Object} res - Response Express
 * @param {string} message - Message personnalisé
 */
const unauthorized = (res, message = 'Non autorisé') => {
  return error(res, message, 401);
};

/**
 * Erreur accès interdit
 * @param {Object} res - Response Express
 * @param {string} message - Message personnalisé
 */
const forbidden = (res, message = 'Accès interdit') => {
  return error(res, message, 403);
};

/**
 * Erreur ressource non trouvée
 * @param {Object} res - Response Express
 * @param {string} resource - Nom de la ressource
 */
const notFound = (res, resource = 'Ressource') => {
  return error(res, `${resource} non trouvé(e)`, 404);
};

/**
 * Erreur serveur
 * @param {Object} res - Response Express
 * @param {string} message - Message personnalisé
 */
const serverError = (res, message = 'Erreur interne du serveur') => {
  return error(res, message, 500);
};

/**
 * Réponse paginée
 * @param {Object} res - Response Express
 * @param {Array} data - Données
 * @param {Object} pagination - Infos de pagination
 * @param {string} message - Message
 */
const paginated = (res, data, pagination, message = 'Succès') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: pagination.pages || Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
  });
};

/**
 * Helper pour créer une pagination
 * @param {number} page - Page courante
 * @param {number} limit - Limite par page
 * @param {number} total - Total d'éléments
 */
const createPagination = (page, limit, total) => {
  const pages = Math.ceil(total / limit);
  return {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
};

module.exports = {
  success,
  created,
  noContent,
  error,
  validationError,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  paginated,
  createPagination,
};
