const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schéma Utilisateur - ImmoLomé
 * Gère les 3 rôles : admin, owner (propriétaire), user (chercheur)
 */
const userSchema = new mongoose.Schema(
  {
    // Informations de base
    firstName: {
      type: String,
      required: [true, 'Le prénom est obligatoire'],
      trim: true,
      minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    email: {
      type: String,
      required: [true, 'L\'email est obligatoire'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez fournir un email valide',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Le numéro de téléphone est obligatoire'],
      trim: true,
      match: [
        /^(\+228)?[0-9]{8}$/,
        'Format de téléphone invalide (ex: +22890123456 ou 90123456)',
      ],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
      select: false, // Ne jamais renvoyer le mot de passe par défaut
    },

    // Rôle et permissions
    role: {
      type: String,
      enum: {
        values: ['user', 'owner', 'admin'],
        message: 'Le rôle doit être: user, owner ou admin',
      },
      default: 'user',
    },

    // Avatar utilisateur (optionnel)
    avatar: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },

    // Statut du compte
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // Réinitialisation mot de passe
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },

    // Refresh tokens (pour JWT)
    refreshTokens: [{
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800, // 7 jours en secondes
      },
      userAgent: String,
      ipAddress: String,
    }],

    // Informations propriétaire (si role === 'owner')
    ownerInfo: {
      idCardNumber: {
        type: String,
        trim: true,
      },
      idCardPhoto: {
        url: String,
        publicId: String,
      },
      address: {
        type: String,
        trim: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },

    // Statistiques
    stats: {
      totalContacts: {
        type: Number,
        default: 0,
      },
      totalPayments: {
        type: Number,
        default: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
      },
      // Pour les propriétaires
      totalRooms: {
        type: Number,
        default: 0,
      },
      totalRented: {
        type: Number,
        default: 0,
      },
    },

    // Dernière connexion
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatiques
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// ============================================
// VIRTUALS
// ============================================

// Nom complet
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Chambres du propriétaire (population virtuelle)
userSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'owner',
  justOne: false,
});

// Demandes de contact de l'utilisateur
userSchema.virtual('contacts', {
  ref: 'Contact',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

// ============================================
// MIDDLEWARES (HOOKS)
// ============================================

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) return next();

  // Hash avec un cost de 12
  this.password = await bcrypt.hash(this.password, 12);

  // Mettre à jour passwordChangedAt si ce n'est pas une création
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // -1s pour éviter les problèmes de timing JWT
  }

  next();
});

// Ne pas inclure les utilisateurs inactifs dans les requêtes find
userSchema.pre(/^find/, function (next) {
  // this pointe vers la requête courante
  // Seulement si on n'a pas explicitement demandé les inactifs
  if (this.getOptions().includeInactive !== true) {
    this.find({ isActive: { $ne: false } });
  }
  next();
});

// ============================================
// MÉTHODES D'INSTANCE
// ============================================

// Vérifier le mot de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Vérifier si le mot de passe a changé après l'émission du JWT
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// Générer un token de vérification email
userSchema.methods.createEmailVerificationToken = function () {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 heures

  return verificationToken;
};

// Générer un token de réinitialisation mot de passe
userSchema.methods.createPasswordResetToken = function () {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Nettoyer les données sensibles pour la réponse JSON
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Trouver par email avec mot de passe
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select('+password');
};

// Compter les utilisateurs par rôle
userSchema.statics.countByRole = async function () {
  return this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);
};

// ============================================
// EXPORT
// ============================================
const User = mongoose.model('User', userSchema);

module.exports = User;
