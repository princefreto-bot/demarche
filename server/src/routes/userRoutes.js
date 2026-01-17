/**
 * Routes Utilisateurs - ImmoLomé
 */

const express = require('express');
const router = express.Router();
const Joi = require('joi');

const { User } = require('../models');
const { authenticate } = require('../middlewares/auth');
const { selfOrAdmin } = require('../middlewares/roles');
const { validate, commonSchemas } = require('../middlewares/validate');
const { asyncHandler, Errors } = require('../middlewares/errorHandler');
const { success } = require('../utils/response');
const { uploadAvatar } = require('../config/cloudinary');

/**
 * @route   GET /api/v1/users/me
 * @desc    Mon profil
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('rooms', 'title status location.quartier pricing.monthlyRent');
  
  success(res, { user: user.toSafeObject() });
}));

/**
 * @route   PUT /api/v1/users/me
 * @desc    Modifier mon profil
 * @access  Private
 */
router.put(
  '/me',
  authenticate,
  validate({
    body: Joi.object({
      firstName: Joi.string().min(2).max(50).trim(),
      lastName: Joi.string().min(2).max(50).trim(),
      phone: commonSchemas.phone,
    }).min(1),
  }),
  asyncHandler(async (req, res) => {
    // Empêcher la modification de certains champs
    delete req.body.email;
    delete req.body.password;
    delete req.body.role;
    delete req.body.isActive;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    );

    success(res, { user: user.toSafeObject() }, 'Profil mis à jour');
  })
);

/**
 * @route   PUT /api/v1/users/me/avatar
 * @desc    Modifier mon avatar
 * @access  Private
 */
router.put(
  '/me/avatar',
  authenticate,
  uploadAvatar.single('avatar'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw Errors.BadRequest('Aucune image fournie');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: {
          url: req.file.path,
          publicId: req.file.filename,
        },
      },
      { new: true }
    );

    success(res, { 
      avatar: user.avatar 
    }, 'Avatar mis à jour');
  })
);

/**
 * @route   GET /api/v1/users/me/stats
 * @desc    Mes statistiques
 * @access  Private
 */
router.get('/me/stats', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  success(res, { 
    stats: user.stats,
    memberSince: user.createdAt,
    lastLogin: user.lastLoginAt,
  });
}));

/**
 * @route   DELETE /api/v1/users/me
 * @desc    Désactiver mon compte
 * @access  Private
 */
router.delete('/me', authenticate, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    isActive: false,
  });

  success(res, null, 'Compte désactivé');
}));

/**
 * @route   GET /api/v1/users/:id
 * @desc    Profil d'un utilisateur (admin)
 * @access  Private (Admin ou soi-même)
 */
router.get(
  '/:id',
  authenticate,
  selfOrAdmin('id'),
  validate({ params: Joi.object({ id: commonSchemas.objectId.required() }) }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw Errors.NotFound('Utilisateur');
    }

    success(res, { user: user.toSafeObject() });
  })
);

module.exports = router;
