/**
 * Contrôleur Authentification - ImmoLomé
 * Gestion de l'inscription, connexion, tokens
 */

const crypto = require('crypto');
const { User, Log } = require('../models');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { success, created, error, unauthorized } = require('../utils/response');
const { asyncHandler, Errors } = require('../middlewares/errorHandler');
const { getClientInfo } = require('../middlewares/auth');
const config = require('../config/env');

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, role } = req.body;

  // Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw Errors.Conflict('Cet email est déjà utilisé');
  }

  // Vérifier si le téléphone existe déjà
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    throw Errors.Conflict('Ce numéro de téléphone est déjà utilisé');
  }

  // Créer l'utilisateur
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role: role === 'owner' ? 'owner' : 'user', // Seul owner ou user autorisé
  });

  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Sauvegarder le refresh token
  const clientInfo = getClientInfo(req);
  user.refreshTokens.push({
    token: refreshToken,
    userAgent: clientInfo.userAgent,
    ipAddress: clientInfo.ipAddress,
  });
  user.lastLoginAt = new Date();
  user.lastLoginIp = clientInfo.ipAddress;
  await user.save({ validateBeforeSave: false });

  // Logger l'événement
  await Log.info('auth.register', `Nouvel utilisateur inscrit: ${email}`, {
    actor: {
      user: user._id,
      role: user.role,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    },
    target: {
      type: 'user',
      id: user._id,
    },
  });

  // Définir le cookie refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.cookieMaxAge,
  });

  // Réponse
  created(res, {
    user: user.toSafeObject(),
    accessToken,
  }, 'Inscription réussie');
});

/**
 * @desc    Connexion utilisateur
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const clientInfo = getClientInfo(req);

  // Trouver l'utilisateur avec le mot de passe
  const user = await User.findByEmailWithPassword(email);

  if (!user) {
    await Log.warn('auth.login_failed', `Tentative de connexion: email inconnu - ${email}`, {
      actor: { ipAddress: clientInfo.ipAddress, userAgent: clientInfo.userAgent },
    });
    throw Errors.Unauthorized('Email ou mot de passe incorrect');
  }

  // Vérifier si le compte est actif
  if (!user.isActive) {
    throw Errors.Unauthorized('Votre compte a été désactivé');
  }

  // Vérifier le mot de passe
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await Log.warn('auth.login_failed', `Tentative de connexion: mot de passe incorrect - ${email}`, {
      actor: {
        user: user._id,
        ipAddress: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
      },
    });
    throw Errors.Unauthorized('Email ou mot de passe incorrect');
  }

  // Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Nettoyer les anciens refresh tokens (garder les 5 derniers)
  if (user.refreshTokens.length >= 5) {
    user.refreshTokens = user.refreshTokens.slice(-4);
  }

  // Sauvegarder le nouveau refresh token
  user.refreshTokens.push({
    token: refreshToken,
    userAgent: clientInfo.userAgent,
    ipAddress: clientInfo.ipAddress,
  });
  user.lastLoginAt = new Date();
  user.lastLoginIp = clientInfo.ipAddress;
  await user.save({ validateBeforeSave: false });

  // Logger la connexion
  await Log.info('auth.login', `Connexion réussie: ${email}`, {
    actor: {
      user: user._id,
      role: user.role,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    },
  });

  // Cookie refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.cookieMaxAge,
  });

  success(res, {
    user: user.toSafeObject(),
    accessToken,
  }, 'Connexion réussie');
});

/**
 * @desc    Déconnexion
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken && req.user) {
    // Supprimer le refresh token de la BDD
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (rt) => rt.token !== refreshToken
    );
    await req.user.save({ validateBeforeSave: false });

    // Logger
    await Log.info('auth.logout', `Déconnexion: ${req.user.email}`, {
      actor: {
        user: req.user._id,
        role: req.user.role,
      },
    });
  }

  // Supprimer le cookie
  res.clearCookie('refreshToken');

  success(res, null, 'Déconnexion réussie');
});

/**
 * @desc    Rafraîchir le token d'accès
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw Errors.Unauthorized('Refresh token manquant');
  }

  // Vérifier le refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw Errors.Unauthorized('Refresh token invalide ou expiré');
  }

  // Trouver l'utilisateur
  const user = await User.findById(decoded.id);
  if (!user) {
    throw Errors.Unauthorized('Utilisateur non trouvé');
  }

  // Vérifier que le refresh token existe en BDD
  const tokenExists = user.refreshTokens.some((rt) => rt.token === refreshToken);
  if (!tokenExists) {
    throw Errors.Unauthorized('Refresh token révoqué');
  }

  // Générer un nouveau access token
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

  // Remplacer l'ancien refresh token
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);
  user.refreshTokens.push({
    token: newRefreshToken,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip,
  });
  await user.save({ validateBeforeSave: false });

  // Logger
  await Log.debug('auth.token_refresh', `Token rafraîchi: ${user.email}`, {
    actor: { user: user._id },
  });

  // Nouveau cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.cookieMaxAge,
  });

  success(res, { accessToken }, 'Token rafraîchi');
});

/**
 * @desc    Demander réinitialisation mot de passe
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Toujours retourner succès (sécurité)
  if (!user) {
    return success(res, null, 'Si cet email existe, vous recevrez un lien de réinitialisation');
  }

  // Générer le token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Envoyer l'email avec le token
  // Pour l'instant, on log le token (dev only)
  if (config.env === 'development') {
    console.log('Reset Token:', resetToken);
  }

  // Logger
  await Log.info('auth.password_reset_request', `Demande reset password: ${email}`, {
    actor: { user: user._id, ipAddress: req.ip },
  });

  success(res, null, 'Si cet email existe, vous recevrez un lien de réinitialisation');
});

/**
 * @desc    Réinitialiser le mot de passe
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Hasher le token pour comparer
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Trouver l'utilisateur avec ce token non expiré
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw Errors.BadRequest('Token invalide ou expiré');
  }

  // Mettre à jour le mot de passe
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = []; // Révoquer toutes les sessions
  await user.save();

  // Logger
  await Log.info('auth.password_reset_complete', `Mot de passe réinitialisé: ${user.email}`, {
    actor: { user: user._id, ipAddress: req.ip },
  });

  success(res, null, 'Mot de passe réinitialisé avec succès');
});

/**
 * @desc    Changer le mot de passe (connecté)
 * @route   POST /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Récupérer l'utilisateur avec le mot de passe
  const user = await User.findById(req.user._id).select('+password');

  // Vérifier l'ancien mot de passe
  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    throw Errors.Unauthorized('Mot de passe actuel incorrect');
  }

  // Mettre à jour
  user.password = newPassword;
  user.refreshTokens = []; // Révoquer toutes les autres sessions
  await user.save();

  // Générer nouveaux tokens
  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshTokens.push({
    token: refreshToken,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip,
  });
  await user.save({ validateBeforeSave: false });

  // Logger
  await Log.info('auth.password_changed', `Mot de passe changé: ${user.email}`, {
    actor: { user: user._id },
  });

  // Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'strict',
    maxAge: config.jwt.cookieMaxAge,
  });

  success(res, { accessToken }, 'Mot de passe modifié avec succès');
});

/**
 * @desc    Obtenir l'utilisateur connecté
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  success(res, { user: user.toSafeObject() });
});

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};
