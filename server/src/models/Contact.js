const mongoose = require('mongoose');

/**
 * Schéma Contact - ImmoLomé
 * Représente une demande de contact payée par un utilisateur
 * C'est le cœur du business model
 */
const contactSchema = new mongoose.Schema(
  {
    // Utilisateur qui fait la demande
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est obligatoire'],
      index: true,
    },

    // Chambre concernée
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'La chambre est obligatoire'],
      index: true,
    },

    // Référence unique de la demande
    reference: {
      type: String,
      unique: true,
      required: true,
    },

    // ============================================
    // MESSAGE DE L'UTILISATEUR
    // ============================================
    message: {
      // Message initial de l'utilisateur
      content: {
        type: String,
        required: [true, 'Le message est obligatoire'],
        minlength: [20, 'Le message doit contenir au moins 20 caractères'],
        maxlength: [1000, 'Le message ne peut pas dépasser 1000 caractères'],
      },
      // Date d'envoi
      sentAt: {
        type: Date,
        default: Date.now,
      },
    },

    // ============================================
    // INFORMATIONS DE L'UTILISATEUR (snapshot)
    // ============================================
    userInfo: {
      fullName: {
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
    // INFORMATIONS DE LA CHAMBRE (snapshot)
    // ============================================
    roomInfo: {
      title: {
        type: String,
        required: true,
      },
      quartier: {
        type: String,
        required: true,
      },
      monthlyRent: {
        type: Number,
        required: true,
      },
      mainPhoto: {
        type: String,
      },
    },

    // ============================================
    // PAIEMENT ASSOCIÉ
    // ============================================
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Le paiement est obligatoire'],
    },

    // Montant payé (frais de mise en relation)
    amountPaid: {
      type: Number,
      required: true,
    },

    // ============================================
    // STATUT DE LA DEMANDE
    // ============================================
    status: {
      type: String,
      enum: {
        values: [
          'pending',      // En attente de traitement
          'processing',   // Admin en train de traiter
          'contacted',    // Propriétaire contacté
          'visit_scheduled', // Visite programmée
          'visited',      // Visite effectuée
          'negotiating',  // En négociation
          'successful',   // Location confirmée
          'cancelled',    // Annulée
          'failed',       // Échec (pas d'accord)
        ],
        message: 'Statut invalide',
      },
      default: 'pending',
      index: true,
    },

    // ============================================
    // SUIVI PAR L'ADMIN
    // ============================================
    adminNotes: [
      {
        note: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // Admin assigné
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedAt: {
      type: Date,
    },

    // ============================================
    // VISITE
    // ============================================
    visit: {
      scheduledDate: {
        type: Date,
      },
      scheduledTime: {
        type: String,
      },
      confirmedByUser: {
        type: Boolean,
        default: false,
      },
      confirmedByOwner: {
        type: Boolean,
        default: false,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: {
        type: Date,
      },
      feedback: {
        type: String,
        maxlength: [500, 'Le feedback ne peut pas dépasser 500 caractères'],
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    // ============================================
    // RÉSULTAT FINAL
    // ============================================
    outcome: {
      // Location réussie ou non
      isSuccessful: {
        type: Boolean,
        default: false,
      },
      // Date de conclusion
      concludedAt: {
        type: Date,
      },
      // Raison d'échec si applicable
      failureReason: {
        type: String,
        maxlength: [500, 'La raison ne peut pas dépasser 500 caractères'],
      },
      // Commission perçue (1 mois de loyer)
      commission: {
        amount: {
          type: Number,
          default: 0,
        },
        isPaid: {
          type: Boolean,
          default: false,
        },
        paidAt: {
          type: Date,
        },
        paymentMethod: {
          type: String,
        },
      },
      // Notes finales
      finalNotes: {
        type: String,
      },
    },

    // ============================================
    // COMMUNICATION
    // ============================================
    communications: [
      {
        type: {
          type: String,
          enum: ['call', 'sms', 'whatsapp', 'email', 'visit', 'other'],
          required: true,
        },
        direction: {
          type: String,
          enum: ['outgoing', 'incoming'],
          required: true,
        },
        with: {
          type: String,
          enum: ['user', 'owner'],
          required: true,
        },
        summary: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // ============================================
    // PRIORITÉ
    // ============================================
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },

    // ============================================
    // DATES IMPORTANTES
    // ============================================
    processedAt: {
      type: Date,
    },
    contactedOwnerAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },

    // Rappel programmé
    reminderAt: {
      type: Date,
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
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ user: 1, room: 1 }, { unique: true }); // Un user ne peut contacter qu'une fois par chambre
contactSchema.index({ reference: 1 });
contactSchema.index({ assignedTo: 1, status: 1 });
contactSchema.index({ 'visit.scheduledDate': 1 });
contactSchema.index({ reminderAt: 1 });
contactSchema.index({ priority: 1, createdAt: -1 });

// ============================================
// VIRTUALS
// ============================================

// Durée depuis création
contactSchema.virtual('ageInDays').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Durée de traitement
contactSchema.virtual('processingTime').get(function () {
  if (!this.processedAt) return null;
  return this.processedAt - this.createdAt;
});

// Est en attente
contactSchema.virtual('isPending').get(function () {
  return this.status === 'pending';
});

// Est actif (pas fermé)
contactSchema.virtual('isActive').get(function () {
  return !['successful', 'cancelled', 'failed'].includes(this.status);
});

// ============================================
// MIDDLEWARES (HOOKS)
// ============================================

// Générer la référence unique avant création
contactSchema.pre('save', async function (next) {
  if (this.isNew && !this.reference) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.reference = `CTT-${year}${month}-${random}`;
  }

  // Mettre à jour les dates selon le statut
  if (this.isModified('status')) {
    const now = new Date();
    
    switch (this.status) {
      case 'processing':
        if (!this.processedAt) this.processedAt = now;
        break;
      case 'contacted':
        if (!this.contactedOwnerAt) this.contactedOwnerAt = now;
        break;
      case 'successful':
      case 'cancelled':
      case 'failed':
        if (!this.closedAt) this.closedAt = now;
        if (!this.outcome.concludedAt) this.outcome.concludedAt = now;
        break;
    }
  }

  next();
});

// ============================================
// MÉTHODES D'INSTANCE
// ============================================

// Ajouter une note admin
contactSchema.methods.addAdminNote = async function (note, adminId) {
  this.adminNotes.push({
    note,
    createdBy: adminId,
    createdAt: new Date(),
  });
  return this.save();
};

// Ajouter une communication
contactSchema.methods.addCommunication = async function (commData, adminId) {
  this.communications.push({
    ...commData,
    createdBy: adminId,
    createdAt: new Date(),
  });
  return this.save();
};

// Programmer une visite
contactSchema.methods.scheduleVisit = async function (date, time) {
  this.visit.scheduledDate = date;
  this.visit.scheduledTime = time;
  this.status = 'visit_scheduled';
  return this.save();
};

// Marquer comme réussi
contactSchema.methods.markAsSuccessful = async function (commissionAmount, adminId) {
  this.status = 'successful';
  this.outcome.isSuccessful = true;
  this.outcome.concludedAt = new Date();
  this.outcome.commission.amount = commissionAmount;
  
  this.adminNotes.push({
    note: `Location confirmée. Commission: ${commissionAmount} FCFA`,
    createdBy: adminId,
    createdAt: new Date(),
  });
  
  return this.save();
};

// Marquer comme échoué
contactSchema.methods.markAsFailed = async function (reason, adminId) {
  this.status = 'failed';
  this.outcome.isSuccessful = false;
  this.outcome.concludedAt = new Date();
  this.outcome.failureReason = reason;
  
  this.adminNotes.push({
    note: `Échec: ${reason}`,
    createdBy: adminId,
    createdAt: new Date(),
  });
  
  return this.save();
};

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Trouver les contacts en attente
contactSchema.statics.findPending = function () {
  return this.find({ status: 'pending' })
    .populate('user', 'firstName lastName email phone')
    .populate('room', 'title location.quartier pricing.monthlyRent')
    .sort({ createdAt: 1 }); // Les plus anciens d'abord
};

// Trouver les visites du jour
contactSchema.statics.findTodayVisits = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.find({
    'visit.scheduledDate': { $gte: today, $lt: tomorrow },
    status: 'visit_scheduled',
  })
    .populate('user', 'firstName lastName phone')
    .populate('room', 'title location');
};

// Statistiques pour dashboard
contactSchema.statics.getStats = async function (startDate, endDate) {
  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amountPaid' },
        avgProcessingTime: {
          $avg: {
            $subtract: ['$processedAt', '$createdAt'],
          },
        },
      },
    },
  ]);
};

// Commission totale perçue
contactSchema.statics.getTotalCommission = async function (startDate, endDate) {
  const matchStage = {
    'outcome.isSuccessful': true,
    'outcome.commission.isPaid': true,
  };
  
  if (startDate && endDate) {
    matchStage['outcome.commission.paidAt'] = { $gte: startDate, $lte: endDate };
  }

  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: '$outcome.commission.amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { total: 0, count: 0 };
};

// ============================================
// EXPORT
// ============================================
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
