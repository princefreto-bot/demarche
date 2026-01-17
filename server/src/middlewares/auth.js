/**
 * Middleware d'authentification - ImmoLomé
 * Vérifie et valide les tokens JWT
 */

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/jwt');
const { unauthorized } = require('../utils/response');
const { User } = require('../models');
const { Log } = require('../models');

/**
 * Middleware principal d'authentification
 * Vérifie le token JWT et attache l'utilisateur à la requête
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. Extraire le token du header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return unauthorized(res, 'Authentification requise');
    }

    // 2. Vérifier le token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      return unauthorized(res, error.message);
    }

    // 3. Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    
    if (!user) {
      return unauthorized(res, 'Utilisateur non trouvé');
    }

    // 4. Vérifier que l'utilisateur est actif
    if (!user.isActive) {
      return unauthorized(res, 'Compte désactivé');
    }

    // 5. Vérifier si le mot de passe a changé après l'émission du token
    if (user.changedPasswordAfter(decoded.iat)) {
      return unauthorized(res, 'Mot de passe modifié, veuillez vous reconnecter');
    }

    // 6. Attacher l'utilisateur à la requête
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;

    next();
  } catch (error) {
    console.error('Erreur authentification:', error);
    return unauthorized(res, 'Erreur d\'authentification');
  }
};

/**
 * Middleware optionnel d'authentification
 * Attache l'utilisateur s'il est authentifié, sinon continue
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return next();
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
      }
    } catch {
      // Ignorer les erreurs de token en mode optionnel
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Middleware de vérification email
 * Vérifie que l'email de l'utilisateur est vérifié
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Veuillez vérifier votre adresse email',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }
  next();
};

/**
 * Middleware de vérification propriétaire
 * Vérifie que le propriétaire est vérifié par l'admin
 */
const requireOwnerVerified = (req, res, next) => {
  if (req.user.role === 'owner' && !req.user.ownerInfo?.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Votre compte propriétaire est en attente de validation',
      code: 'OWNER_NOT_VERIFIED',
    });
  }
  next();
};

/**
 * Middleware pour logger les tentatives de connexion échouées
 */
const logFailedAuth = async (req, reason) => {
  try {
    await Log.warn('auth.login_failed', `Tentative de connexion échouée: ${reason}`, {
      actor: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
      request: {
        method: req.method,
        path: req.path,
        body: { email: req.body?.email }, // Ne pas logger le password
      },
    });
  } catch (error) {
    console.error('Erreur logging auth:', error);
  }
};

/**
 * Extraire les infos client de la requête
 */
const getClientInfo = (req) => {
  return {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    referer: req.get('Referer'),
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireEmailVerified,
  requireOwnerVerified,
  logFailedAuth,
  getClientInfo,
};
