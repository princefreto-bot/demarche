const mongoose = require('mongoose');

/**
 * Schéma Payment - ImmoLomé
 * Gère tous les paiements via CinetPay
 */
const paymentSchema = new mongoose.Schema(
  {
    // Utilisateur qui paie
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est obligatoire'],
      index: true,
    },

    // Chambre concernée (pour les frais de contact)
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      index: true,
    },

    // Contact créé suite au paiement
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
    },

    // ============================================
    // RÉFÉRENCES
    // ============================================
    // Notre référence interne unique
    reference: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    // ID de transaction CinetPay
    cinetpayTransactionId: {
      type: String,
      index: true,
    },

    // ID de paiement CinetPay
    cinetpayPaymentId: {
      type: String,
    },

    // ============================================
    // TYPE DE PAIEMENT
    // ============================================
    type: {
      type: String,
      enum: {
        values: [
          'contact_fee',     // Frais de mise en relation
          'commission',      // Commission sur location (1 mois)
          'premium',         // Abonnement premium (futur)
          'refund',          // Remboursement
        ],
        message: 'Type de paiement invalide',
      },
      required: true,
      index: true,
    },

    // ============================================
    // MONTANTS
    // ============================================
    amount: {
      type: Number,
      required: [true, 'Le montant est obligatoire'],
      min: [100, 'Le montant minimum est de 100 FCFA'],
    },

    // Devise
    currency: {
      type: String,
      default: 'XOF', // Franc CFA
      enum: ['XOF', 'XAF'],
    },

    // Frais CinetPay
    fees: {
      type: Number,
      default: 0,
    },

    // Montant net reçu
    netAmount: {
      type: Number,
    },

    // ============================================
    // STATUT
    // ============================================
    status: {
      type: String,
      enum: {
        values: [
          'pending',     // En attente de paiement
          'processing',  // Paiement en cours
          'completed',   // Paiement réussi
          'failed',      // Paiement échoué
          'cancelled',   // Paiement annulé
          'refunded',    // Remboursé
          'expired',     // Expiré (timeout)
        ],
        message: 'Statut invalide',
      },
      default: 'pending',
      index: true,
    },

    // Raison d'échec
    failureReason: {
      type: String,
    },

    // Code d'erreur CinetPay
    errorCode: {
      type: String,
    },

    // ============================================
    // MÉTHODE DE PAIEMENT
    // ============================================
    paymentMethod: {
      type: {
        type: String,
        enum: [
          'mobile_money',
          'card',
          'bank_transfer',
          'wallet',
        ],
      },
      operator: {
        type: String, // MTN, Moov, Flooz, etc.
      },
      phone: {
        type: String, // Numéro utilisé pour Mobile Money
      },
      last4: {
        type: String, // 4 derniers chiffres carte
      },
    },

    // ============================================
    // INFORMATIONS CLIENT (snapshot)
    // ============================================
    customerInfo: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },

    // ============================================
    // INFORMATIONS PRODUIT (snapshot)
    // ============================================
    productInfo: {
      description: {
        type: String,
        required: true,
      },
      roomTitle: {
        type: String,
      },
      quartier: {
        type: String,
      },
    },

    // ============================================
    // DONNÉES CINETPAY
    // ============================================
    cinetpay: {
      // URL de paiement générée
      paymentUrl: {
        type: String,
      },
      // Token de paiement
      paymentToken: {
        type: String,
      },
      // Données brutes de la réponse d'initialisation
      initResponse: {
        type: mongoose.Schema.Types.Mixed,
      },
      // Données brutes du webhook
      webhookData: {
        type: mongoose.Schema.Types.Mixed,
      },
      // Données de vérification
      verificationData: {
        type: mongoose.Schema.Types.Mixed,
      },
    },

    // ============================================
    // WEBHOOK
    // ============================================
    webhook: {
      received: {
        type: Boolean,
        default: false,
      },
      receivedAt: {
        type: Date,
      },
      signature: {
        type: String,
      },
      signatureValid: {
        type: Boolean,
      },
      ipAddress: {
        type: String,
      },
      attempts: {
        type: Number,
        default: 0,
      },
    },

    // ============================================
    // REMBOURSEMENT
    // ============================================
    refund: {
      isRefunded: {
        type: Boolean,
        default: false,
      },
      refundedAt: {
        type: Date,
      },
      refundAmount: {
        type: Number,
      },
      refundReason: {
        type: String,
      },
      refundedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      refundTransactionId: {
        type: String,
      },
    },

    // ============================================
    // MÉTADONNÉES
    // ============================================
    metadata: {
      ipAddress: {
        type: String,
      },
      userAgent: {
        type: String,
      },
      platform: {
        type: String,
        enum: ['web', 'mobile', 'api'],
        default: 'web',
      },
      source: {
        type: String, // D'où vient l'utilisateur (campagne, etc.)
      },
    },

    // ============================================
    // IDEMPOTENCY
    // ============================================
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true, // Permet null
    },

    // ============================================
    // DATES
    // ============================================
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },

    // ============================================
    // RÉCONCILIATION
    // ============================================
    reconciliation: {
      isReconciled: {
        type: Boolean,
        default: false,
      },
      reconciledAt: {
        type: Date,
      },
      reconciledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
paymentSchema.index({ reference: 1 });
paymentSchema.index({ cinetpayTransactionId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ type: 1, status: 1 });
paymentSchema.index({ completedAt: -1 });
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL pour nettoyer les pending expirés

// ============================================
// VIRTUALS
// ============================================

// Est complété
paymentSchema.virtual('isCompleted').get(function () {
  return this.status === 'completed';
});

// Est en attente
paymentSchema.virtual('isPending').get(function () {
  return ['pending', 'processing'].includes(this.status);
});

// Montant formaté
paymentSchema.virtual('amountDisplay').get(function () {
  return new Intl.NumberFormat('fr-FR').format(this.amount) + ' FCFA';
});

// ============================================
// MIDDLEWARES (HOOKS)
// ============================================

// Générer la référence avant création
paymentSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Générer référence unique
    if (!this.reference) {
      const date = new Date();
      const timestamp = date.getTime().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      this.reference = `PAY-${timestamp}-${random}`;
    }

    // Définir expiration (30 minutes)
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  // Calculer montant net
  if (this.amount && this.fees !== undefined) {
    this.netAmount = this.amount - this.fees;
  }

  // Mettre à jour completedAt
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

// ============================================
// MÉTHODES D'INSTANCE
// ============================================

// Marquer comme complété
paymentSchema.methods.markAsCompleted = async function (cinetpayData) {
  this.status = 'completed';
  this.completedAt = new Date();
  
  if (cinetpayData) {
    this.cinetpay.webhookData = cinetpayData;
    this.cinetpayTransactionId = cinetpayData.transaction_id || this.cinetpayTransactionId;
    
    if (cinetpayData.payment_method) {
      this.paymentMethod.type = cinetpayData.payment_method;
    }
    if (cinetpayData.operator) {
      this.paymentMethod.operator = cinetpayData.operator;
    }
  }
  
  return this.save();
};

// Marquer comme échoué
paymentSchema.methods.markAsFailed = async function (reason, errorCode) {
  this.status = 'failed';
  this.failureReason = reason;
  this.errorCode = errorCode;
  return this.save();
};

// Marquer webhook reçu
paymentSchema.methods.recordWebhook = async function (data, ipAddress, signature, isValid) {
  this.webhook.received = true;
  this.webhook.receivedAt = new Date();
  this.webhook.ipAddress = ipAddress;
  this.webhook.signature = signature;
  this.webhook.signatureValid = isValid;
  this.webhook.attempts += 1;
  this.cinetpay.webhookData = data;
  return this.save();
};

// Processus de remboursement
paymentSchema.methods.processRefund = async function (amount, reason, adminId) {
  this.status = 'refunded';
  this.refund.isRefunded = true;
  this.refund.refundedAt = new Date();
  this.refund.refundAmount = amount || this.amount;
  this.refund.refundReason = reason;
  this.refund.refundedBy = adminId;
  return this.save();
};

// Vérifier si expiré
paymentSchema.methods.isExpired = function () {
  if (this.status !== 'pending') return false;
  return this.expiresAt && new Date() > this.expiresAt;
};

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Trouver par référence avec populate
paymentSchema.statics.findByReference = function (reference) {
  return this.findOne({ reference })
    .populate('user', 'firstName lastName email phone')
    .populate('room', 'title location.quartier pricing.monthlyRent')
    .populate('contact');
};

// Trouver par transaction CinetPay
paymentSchema.statics.findByCinetpayTransaction = function (transactionId) {
  return this.findOne({ cinetpayTransactionId: transactionId });
};

// Statistiques de paiement
paymentSchema.statics.getStats = async function (startDate, endDate) {
  const matchStage = { status: 'completed' };
  
  if (startDate && endDate) {
    matchStage.completedAt = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: '$fees' },
        totalNet: { $sum: '$netAmount' },
      },
    },
  ]);
};

// Revenus par période
paymentSchema.statics.getRevenueByPeriod = async function (period = 'day', limit = 30) {
  const groupId = {
    day: {
      year: { $year: '$completedAt' },
      month: { $month: '$completedAt' },
      day: { $dayOfMonth: '$completedAt' },
    },
    week: {
      year: { $year: '$completedAt' },
      week: { $week: '$completedAt' },
    },
    month: {
      year: { $year: '$completedAt' },
      month: { $month: '$completedAt' },
    },
  };

  return this.aggregate([
    { $match: { status: 'completed' } },
    { $sort: { completedAt: -1 } },
    {
      $group: {
        _id: groupId[period] || groupId.day,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        fees: { $sum: '$fees' },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
    { $limit: limit },
  ]);
};

// Nettoyer les paiements expirés
paymentSchema.statics.cleanExpired = async function () {
  const result = await this.updateMany(
    {
      status: 'pending',
      expiresAt: { $lt: new Date() },
    },
    {
      $set: { status: 'expired' },
    }
  );
  return result.modifiedCount;
};

// ============================================
// EXPORT
// ============================================
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
