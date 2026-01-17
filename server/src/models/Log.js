const mongoose = require('mongoose');

/**
 * Schéma Log - ImmoLomé
 * Audit trail complet pour toutes les actions importantes
 */
const logSchema = new mongoose.Schema(
  {
    // ============================================
    // TYPE D'ÉVÉNEMENT
    // ============================================
    event: {
      type: String,
      required: true,
      index: true,
      enum: [
        // Authentification
        'auth.register',
        'auth.login',
        'auth.logout',
        'auth.login_failed',
        'auth.password_reset_request',
        'auth.password_reset_complete',
        'auth.email_verified',
        'auth.token_refresh',
        'auth.password_changed',

        // Utilisateurs
        'user.created',
        'user.updated',
        'user.deleted',
        'user.deactivated',
        'user.reactivated',
        'user.role_changed',
        'user.owner_verified',

        // Chambres
        'room.created',
        'room.updated',
        'room.deleted',
        'room.submitted',
        'room.validated',
        'room.rejected',
        'room.status_changed',
        'room.photos_added',
        'room.photos_deleted',
        'room.viewed',

        // Contacts
        'contact.created',
        'contact.status_changed',
        'contact.assigned',
        'contact.note_added',
        'contact.visit_scheduled',
        'contact.visit_completed',
        'contact.successful',
        'contact.failed',
        'contact.cancelled',
        'contact.feedback_added',

        // Paiements
        'payment.initiated',
        'payment.completed',
        'payment.failed',
        'payment.cancelled',
        'payment.refunded',
        'payment.webhook_received',
        'payment.webhook_verified',
        'payment.webhook_failed',

        // Admin
        'admin.settings_updated',
        'admin.report_generated',
        'admin.data_exported',
        'admin.user_impersonated',

        // Système
        'system.error',
        'system.startup',
        'system.shutdown',
        'system.maintenance_start',
        'system.maintenance_end',
        'system.backup_created',

        // Sécurité
        'security.suspicious_activity',
        'security.rate_limit_exceeded',
        'security.unauthorized_access',
        'security.ip_blocked',
      ],
    },

    // ============================================
    // NIVEAU DE LOG
    // ============================================
    level: {
      type: String,
      enum: ['debug', 'info', 'warn', 'error', 'critical'],
      default: 'info',
      index: true,
    },

    // ============================================
    // ACTEUR
    // ============================================
    actor: {
      // Utilisateur qui a effectué l'action
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
      // Rôle au moment de l'action
      role: {
        type: String,
        enum: ['user', 'owner', 'admin', 'system'],
      },
      // IP address
      ipAddress: {
        type: String,
      },
      // User agent
      userAgent: {
        type: String,
      },
      // Session ID
      sessionId: {
        type: String,
      },
    },

    // ============================================
    // CIBLE DE L'ACTION
    // ============================================
    target: {
      // Type de ressource
      type: {
        type: String,
        enum: ['user', 'room', 'contact', 'payment', 'system'],
      },
      // ID de la ressource
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      // Référence lisible
      reference: {
        type: String,
      },
    },

    // ============================================
    // DESCRIPTION
    // ============================================
    message: {
      type: String,
      required: true,
    },

    // ============================================
    // DONNÉES ADDITIONNELLES
    // ============================================
    data: {
      // Données avant modification
      before: {
        type: mongoose.Schema.Types.Mixed,
      },
      // Données après modification
      after: {
        type: mongoose.Schema.Types.Mixed,
      },
      // Champs modifiés
      changedFields: [{
        type: String,
      }],
      // Métadonnées additionnelles
      metadata: {
        type: mongoose.Schema.Types.Mixed,
      },
    },

    // ============================================
    // REQUÊTE HTTP (si applicable)
    // ============================================
    request: {
      method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      },
      path: {
        type: String,
      },
      query: {
        type: mongoose.Schema.Types.Mixed,
      },
      body: {
        type: mongoose.Schema.Types.Mixed,
      },
      headers: {
        type: mongoose.Schema.Types.Mixed,
      },
    },

    // ============================================
    // RÉPONSE (si applicable)
    // ============================================
    response: {
      statusCode: {
        type: Number,
      },
      duration: {
        type: Number, // en millisecondes
      },
      error: {
        type: String,
      },
    },

    // ============================================
    // GÉOLOCALISATION
    // ============================================
    geo: {
      country: String,
      city: String,
      region: String,
      timezone: String,
    },

    // ============================================
    // TAGS POUR FILTRAGE
    // ============================================
    tags: [{
      type: String,
      index: true,
    }],

    // ============================================
    // ENVIRONNEMENT
    // ============================================
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'development',
    },

    // ============================================
    // CORRÉLATION
    // ============================================
    correlationId: {
      type: String,
      index: true,
    },

    // Parent log (pour chaînes d'événements)
    parentLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Log',
    },
  },
  {
    timestamps: true,
    // Désactiver versionKey pour les logs
    versionKey: false,
  }
);

// ============================================
// INDEXES
// ============================================
logSchema.index({ createdAt: -1 });
logSchema.index({ event: 1, createdAt: -1 });
logSchema.index({ level: 1, createdAt: -1 });
logSchema.index({ 'actor.user': 1, createdAt: -1 });
logSchema.index({ 'target.type': 1, 'target.id': 1 });
logSchema.index({ correlationId: 1 });
logSchema.index({ tags: 1 });

// Index TTL pour suppression automatique après 90 jours
logSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 jours
);

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Créer un log facilement
logSchema.statics.log = async function (event, level, message, options = {}) {
  const logEntry = new this({
    event,
    level,
    message,
    actor: options.actor || {},
    target: options.target || {},
    data: options.data || {},
    request: options.request || {},
    response: options.response || {},
    tags: options.tags || [],
    correlationId: options.correlationId,
    environment: process.env.NODE_ENV || 'development',
  });

  return logEntry.save();
};

// Helpers pour chaque niveau
logSchema.statics.debug = function (event, message, options = {}) {
  return this.log(event, 'debug', message, options);
};

logSchema.statics.info = function (event, message, options = {}) {
  return this.log(event, 'info', message, options);
};

logSchema.statics.warn = function (event, message, options = {}) {
  return this.log(event, 'warn', message, options);
};

logSchema.statics.error = function (event, message, options = {}) {
  return this.log(event, 'error', message, options);
};

logSchema.statics.critical = function (event, message, options = {}) {
  return this.log(event, 'critical', message, options);
};

// Recherche avancée
logSchema.statics.search = async function (filters = {}, options = {}) {
  const query = {};

  if (filters.event) {
    query.event = filters.event;
  }
  if (filters.level) {
    query.level = filters.level;
  }
  if (filters.userId) {
    query['actor.user'] = filters.userId;
  }
  if (filters.targetType) {
    query['target.type'] = filters.targetType;
  }
  if (filters.targetId) {
    query['target.id'] = filters.targetId;
  }
  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }
  if (filters.tags && filters.tags.length) {
    query.tags = { $in: filters.tags };
  }
  if (filters.correlationId) {
    query.correlationId = filters.correlationId;
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor.user', 'firstName lastName email')
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Statistiques des événements
logSchema.statics.getEventStats = async function (startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          event: '$event',
          level: '$level',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.event',
        total: { $sum: '$count' },
        levels: {
          $push: {
            level: '$_id.level',
            count: '$count',
          },
        },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

// Activité utilisateur
logSchema.statics.getUserActivity = async function (userId, limit = 50) {
  return this.find({ 'actor.user': userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Erreurs récentes
logSchema.statics.getRecentErrors = async function (limit = 100) {
  return this.find({ level: { $in: ['error', 'critical'] } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('actor.user', 'firstName lastName email')
    .lean();
};

// ============================================
// EXPORT
// ============================================
const Log = mongoose.model('Log', logSchema);

module.exports = Log;
