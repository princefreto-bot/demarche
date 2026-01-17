/**
 * Middleware de gestion des rôles - ImmoLomé
 * Contrôle d'accès basé sur les rôles
 */

const { forbidden } = require('../utils/response');

/**
 * Rôles disponibles
 */
const ROLES = {
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin',
};

/**
 * Hiérarchie des rôles (pour héritage de permissions)
 */
const ROLE_HIERARCHY = {
  admin: ['admin', 'owner', 'user'],
  owner: ['owner', 'user'],
  user: ['user'],
};

/**
 * Middleware de restriction par rôle
 * @param  {...string} allowedRoles - Rôles autorisés
 * @returns {Function} Middleware Express
 */
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Authentification requise');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return forbidden(res, 'Vous n\'avez pas les permissions nécessaires');
    }

    next();
  };
};

/**
 * Middleware réservé aux admins
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return forbidden(res, 'Accès réservé aux administrateurs');
  }
  next();
};

/**
 * Middleware réservé aux propriétaires (et admins)
 */
const ownerOnly = (req, res, next) => {
  if (!req.user || !['owner', 'admin'].includes(req.user.role)) {
    return forbidden(res, 'Accès réservé aux propriétaires');
  }
  next();
};

/**
 * Middleware pour vérifier si l'utilisateur est propriétaire de la ressource
 * @param {Function} getResourceOwnerId - Fonction qui retourne l'ID du propriétaire
 */
const isOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      // Admin a toujours accès
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      // Obtenir l'ID du propriétaire de la ressource
      const ownerId = await getResourceOwnerId(req);
      
      if (!ownerId) {
        return forbidden(res, 'Ressource non trouvée');
      }

      // Vérifier si l'utilisateur est le propriétaire
      if (ownerId.toString() !== req.user._id.toString()) {
        return forbidden(res, 'Vous n\'êtes pas autorisé à modifier cette ressource');
      }

      next();
    } catch (error) {
      console.error('Erreur vérification propriétaire:', error);
      return forbidden(res, 'Erreur de vérification des permissions');
    }
  };
};

/**
 * Vérifier si l'utilisateur a un rôle spécifique
 * @param {Object} user - Utilisateur
 * @param {string} role - Rôle à vérifier
 * @returns {boolean}
 */
const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

/**
 * Vérifier si l'utilisateur a au moins un des rôles spécifiés
 * @param {Object} user - Utilisateur
 * @param {Array} roles - Rôles à vérifier
 * @returns {boolean}
 */
const hasAnyRole = (user, roles) => {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
};

/**
 * Vérifier si le rôle de l'utilisateur hérite du rôle spécifié
 * @param {Object} user - Utilisateur
 * @param {string} role - Rôle à vérifier
 * @returns {boolean}
 */
const hasRoleOrHigher = (user, role) => {
  if (!user || !user.role) return false;
  const userRoles = ROLE_HIERARCHY[user.role] || [];
  return userRoles.includes(role);
};

/**
 * Middleware de self-or-admin
 * Permet l'accès à l'utilisateur lui-même ou aux admins
 */
const selfOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    const targetId = req.params[paramName];
    
    // Admin a toujours accès
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    // Vérifier si c'est le même utilisateur
    if (req.user._id.toString() !== targetId) {
      return forbidden(res, 'Vous ne pouvez accéder qu\'à vos propres données');
    }

    next();
  };
};

/**
 * Définitions de permissions par action
 */
const PERMISSIONS = {
  // Chambres
  'room:create': ['owner', 'admin'],
  'room:read': ['user', 'owner', 'admin'],
  'room:update': ['owner', 'admin'],
  'room:delete': ['owner', 'admin'],
  'room:validate': ['admin'],
  
  // Contacts
  'contact:create': ['user', 'admin'],
  'contact:read:own': ['user', 'owner', 'admin'],
  'contact:read:all': ['admin'],
  'contact:update': ['admin'],
  
  // Paiements
  'payment:create': ['user', 'admin'],
  'payment:read:own': ['user', 'owner', 'admin'],
  'payment:read:all': ['admin'],
  'payment:refund': ['admin'],
  
  // Utilisateurs
  'user:read:own': ['user', 'owner', 'admin'],
  'user:read:all': ['admin'],
  'user:update:own': ['user', 'owner', 'admin'],
  'user:update:all': ['admin'],
  'user:delete': ['admin'],
  
  // Admin
  'admin:dashboard': ['admin'],
  'admin:settings': ['admin'],
  'admin:logs': ['admin'],
};

/**
 * Middleware de vérification de permission
 * @param {string} permission - Permission requise
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Authentification requise');
    }

    const allowedRoles = PERMISSIONS[permission];
    
    if (!allowedRoles) {
      console.warn(`Permission non définie: ${permission}`);
      return forbidden(res, 'Permission non configurée');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return forbidden(res, `Permission '${permission}' requise`);
    }

    next();
  };
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  restrictTo,
  adminOnly,
  ownerOnly,
  isOwnerOrAdmin,
  hasRole,
  hasAnyRole,
  hasRoleOrHigher,
  selfOrAdmin,
  requirePermission,
};
