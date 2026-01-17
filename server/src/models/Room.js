const mongoose = require('mongoose');

/**
 * Schéma Chambre - ImmoLomé
 * Contient toutes les informations obligatoires d'une annonce
 */
const roomSchema = new mongoose.Schema(
  {
    // Propriétaire de la chambre
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Une chambre doit avoir un propriétaire'],
      index: true,
    },

    // Titre de l'annonce
    title: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true,
      minlength: [10, 'Le titre doit contenir au moins 10 caractères'],
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },

    // Description détaillée
    description: {
      type: String,
      required: [true, 'La description est obligatoire'],
      trim: true,
      minlength: [50, 'La description doit contenir au moins 50 caractères'],
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },

    // ============================================
    // LOCALISATION
    // ============================================
    location: {
      // Quartier (obligatoire)
      quartier: {
        type: String,
        required: [true, 'Le quartier est obligatoire'],
        trim: true,
        index: true,
      },
      // Ville (par défaut Lomé)
      ville: {
        type: String,
        default: 'Lomé',
        trim: true,
      },
      // Adresse complète (visible uniquement après paiement)
      address: {
        type: String,
        trim: true,
      },
      // Indications pour trouver (visible uniquement après paiement)
      indications: {
        type: String,
        trim: true,
        maxlength: [500, 'Les indications ne peuvent pas dépasser 500 caractères'],
      },
      // Coordonnées GPS (optionnel, pour carte)
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          default: [1.2255, 6.1319], // Centre de Lomé par défaut
        },
      },
    },

    // ============================================
    // PRIX ET CONTRAT
    // ============================================
    pricing: {
      // Prix mensuel en FCFA
      monthlyRent: {
        type: Number,
        required: [true, 'Le prix mensuel est obligatoire'],
        min: [5000, 'Le prix minimum est de 5000 FCFA'],
        max: [5000000, 'Le prix maximum est de 5 000 000 FCFA'],
      },
      // Durée du contrat en mois
      contractDuration: {
        type: Number,
        required: [true, 'La durée du contrat est obligatoire'],
        min: [1, 'La durée minimum est de 1 mois'],
        max: [36, 'La durée maximum est de 36 mois'],
        default: 12,
      },
      // Montant total du contrat (calculé automatiquement)
      totalAmount: {
        type: Number,
      },
      // Caution (nombre de mois)
      cautionMonths: {
        type: Number,
        default: 1,
        min: [0, 'La caution ne peut pas être négative'],
        max: [6, 'La caution maximum est de 6 mois'],
      },
      // Avance (nombre de mois)
      advanceMonths: {
        type: Number,
        default: 1,
        min: [1, 'L\'avance minimum est de 1 mois'],
        max: [12, 'L\'avance maximum est de 12 mois'],
      },
      // Charges incluses ou non
      chargesIncluded: {
        type: Boolean,
        default: false,
      },
      // Montant des charges si non incluses
      chargesAmount: {
        type: Number,
        default: 0,
      },
    },

    // ============================================
    // DIMENSIONS (OBLIGATOIRES)
    // ============================================
    dimensions: {
      length: {
        type: Number,
        required: [true, 'La longueur est obligatoire'],
        min: [1, 'La longueur minimum est de 1 mètre'],
        max: [50, 'La longueur maximum est de 50 mètres'],
      },
      width: {
        type: Number,
        required: [true, 'La largeur est obligatoire'],
        min: [1, 'La largeur minimum est de 1 mètre'],
        max: [50, 'La largeur maximum est de 50 mètres'],
      },
      height: {
        type: Number,
        required: [true, 'La hauteur est obligatoire'],
        min: [2, 'La hauteur minimum est de 2 mètres'],
        max: [10, 'La hauteur maximum est de 10 mètres'],
      },
      // Surface calculée automatiquement
      surface: {
        type: Number,
      },
    },

    // ============================================
    // PHOTOS HD (OBLIGATOIRES)
    // ============================================
    photos: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          publicId: {
            type: String,
            required: true,
          },
          caption: {
            type: String,
            maxlength: [100, 'La légende ne peut pas dépasser 100 caractères'],
          },
          isMain: {
            type: Boolean,
            default: false,
          },
          order: {
            type: Number,
            default: 0,
          },
        },
      ],
      validate: {
        validator: function (photos) {
          // Autoriser la création en brouillon sans photos.
          // Exiger au moins 3 photos dès que la chambre sort du statut 'draft'.
          if (this.status === 'draft') return true;
          return photos && photos.length >= 3;
        },
        message: 'Au moins 3 photos sont obligatoires pour publier/soumettre une chambre',
      },
    },

    // ============================================
    // CARACTÉRISTIQUES
    // ============================================
    features: {
      // Type de logement
      type: {
        type: String,
        required: [true, 'Le type de logement est obligatoire'],
        enum: {
          values: [
            'chambre_simple',
            'chambre_salon',
            'appartement',
            'studio',
            'maison',
            'villa',
          ],
          message: 'Type de logement invalide',
        },
      },
      // Nombre de pièces
      rooms: {
        type: Number,
        default: 1,
        min: 1,
        max: 20,
      },
      // Meublé ou non
      furnished: {
        type: Boolean,
        default: false,
      },
      // Étage (0 = RDC)
      floor: {
        type: Number,
        default: 0,
        min: 0,
        max: 30,
      },
      // Eau courante
      hasWater: {
        type: Boolean,
        default: true,
      },
      // Électricité
      hasElectricity: {
        type: Boolean,
        default: true,
      },
      // Toilettes intérieures
      hasInternalToilet: {
        type: Boolean,
        default: false,
      },
      // Douche intérieure
      hasInternalShower: {
        type: Boolean,
        default: false,
      },
      // Cuisine intérieure
      hasInternalKitchen: {
        type: Boolean,
        default: false,
      },
      // Ventilateur
      hasFan: {
        type: Boolean,
        default: false,
      },
      // Climatisation
      hasAC: {
        type: Boolean,
        default: false,
      },
      // Balcon/Terrasse
      hasBalcony: {
        type: Boolean,
        default: false,
      },
      // Parking
      hasParking: {
        type: Boolean,
        default: false,
      },
      // Gardien
      hasGuard: {
        type: Boolean,
        default: false,
      },
    },

    // ============================================
    // DÉFAUTS (OBLIGATOIRE - TRANSPARENCE)
    // ============================================
    defects: {
      type: [
        {
          description: {
            type: String,
            required: true,
            trim: true,
            maxlength: [200, 'La description du défaut ne peut pas dépasser 200 caractères'],
          },
          severity: {
            type: String,
            enum: ['mineur', 'modéré', 'important'],
            default: 'mineur',
          },
          photoUrl: {
            type: String,
          },
        },
      ],
      validate: {
        validator: function (defects) {
          // Au moins un défaut doit être mentionné (transparence)
          return defects && defects.length >= 1;
        },
        message: 'Au moins un défaut doit être mentionné (même mineur) pour la transparence',
      },
    },

    // ============================================
    // RÈGLES DU PROPRIÉTAIRE
    // ============================================
    rules: {
      petsAllowed: {
        type: Boolean,
        default: false,
      },
      smokingAllowed: {
        type: Boolean,
        default: false,
      },
      childrenAllowed: {
        type: Boolean,
        default: true,
      },
      couplesAllowed: {
        type: Boolean,
        default: true,
      },
      maxOccupants: {
        type: Number,
        default: 2,
        min: 1,
        max: 10,
      },
      otherRules: {
        type: String,
        maxlength: [500, 'Les règles ne peuvent pas dépasser 500 caractères'],
      },
    },

    // ============================================
    // STATUT DE LA CHAMBRE
    // ============================================
    status: {
      type: String,
      enum: {
        values: ['draft', 'pending', 'available', 'processing', 'reserved', 'rented'],
        message: 'Statut invalide',
      },
      default: 'draft',
      index: true,
    },

    // Raison du rejet (si applicable)
    rejectionReason: {
      type: String,
      maxlength: [500, 'La raison du rejet ne peut pas dépasser 500 caractères'],
    },

    // ============================================
    // VALIDATION ADMIN
    // ============================================
    validation: {
      isValidated: {
        type: Boolean,
        default: false,
      },
      validatedAt: {
        type: Date,
      },
      validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      validationNotes: {
        type: String,
      },
    },

    // ============================================
    // STATISTIQUES
    // ============================================
    stats: {
      views: {
        type: Number,
        default: 0,
      },
      favorites: {
        type: Number,
        default: 0,
      },
      contactRequests: {
        type: Number,
        default: 0,
      },
      lastViewedAt: {
        type: Date,
      },
    },

    // ============================================
    // DATES IMPORTANTES
    // ============================================
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    publishedAt: {
      type: Date,
    },
    rentedAt: {
      type: Date,
    },

    // Utilisateur qui a loué (pour historique)
    rentedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Commission perçue (1 mois de loyer)
    commissionReceived: {
      amount: {
        type: Number,
        default: 0,
      },
      receivedAt: {
        type: Date,
      },
      paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
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
roomSchema.index({ status: 1, 'location.quartier': 1 });
roomSchema.index({ 'pricing.monthlyRent': 1 });
roomSchema.index({ 'features.type': 1 });
roomSchema.index({ createdAt: -1 });
roomSchema.index({ 'stats.views': -1 });
roomSchema.index({ 'location.coordinates': '2dsphere' }); // Index géospatial

// Index de recherche texte
roomSchema.index({
  title: 'text',
  description: 'text',
  'location.quartier': 'text',
});

// ============================================
// VIRTUALS
// ============================================

// Photo principale
roomSchema.virtual('mainPhoto').get(function () {
  if (!this.photos || this.photos.length === 0) return null;
  const main = this.photos.find((p) => p.isMain);
  return main ? main.url : this.photos[0].url;
});

// Surface en m²
roomSchema.virtual('surfaceDisplay').get(function () {
  if (this.dimensions && this.dimensions.surface) {
    return `${this.dimensions.surface} m²`;
  }
  return null;
});

// Prix formaté
roomSchema.virtual('priceDisplay').get(function () {
  if (this.pricing && this.pricing.monthlyRent) {
    return new Intl.NumberFormat('fr-FR').format(this.pricing.monthlyRent) + ' FCFA';
  }
  return null;
});

// Demandes de contact pour cette chambre
roomSchema.virtual('contacts', {
  ref: 'Contact',
  localField: '_id',
  foreignField: 'room',
  justOne: false,
});

// ============================================
// MIDDLEWARES (HOOKS)
// ============================================

// Calculer surface et montant total avant sauvegarde
roomSchema.pre('save', function (next) {
  // Calculer la surface
  if (this.dimensions && this.dimensions.length && this.dimensions.width) {
    this.dimensions.surface = Math.round(this.dimensions.length * this.dimensions.width * 100) / 100;
  }

  // Calculer le montant total du contrat
  if (this.pricing && this.pricing.monthlyRent && this.pricing.contractDuration) {
    this.pricing.totalAmount = this.pricing.monthlyRent * this.pricing.contractDuration;
  }

  // Mettre publishedAt si passage en available
  if (this.isModified('status') && this.status === 'available' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Mettre rentedAt si passage en rented
  if (this.isModified('status') && this.status === 'rented' && !this.rentedAt) {
    this.rentedAt = new Date();
  }

  next();
});

// ============================================
// MÉTHODES D'INSTANCE
// ============================================

// Incrémenter les vues
roomSchema.methods.incrementViews = async function () {
  this.stats.views += 1;
  this.stats.lastViewedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Vérifier si visible pour les utilisateurs publics
roomSchema.methods.isPubliclyVisible = function () {
  return ['available', 'processing'].includes(this.status);
};

// Obtenir les données publiques (sans infos sensibles)
roomSchema.methods.toPublicObject = function () {
  const obj = this.toObject();
  // Masquer l'adresse exacte et les indications
  if (obj.location) {
    delete obj.location.address;
    delete obj.location.indications;
    delete obj.location.coordinates;
  }
  // Masquer les infos du propriétaire
  if (obj.owner && typeof obj.owner === 'object') {
    obj.owner = {
      _id: obj.owner._id,
      firstName: obj.owner.firstName,
    };
  }
  return obj;
};

// ============================================
// MÉTHODES STATIQUES
// ============================================

// Trouver les chambres disponibles
roomSchema.statics.findAvailable = function (filters = {}) {
  const query = { status: { $in: ['available', 'processing'] } };
  
  if (filters.quartier) {
    query['location.quartier'] = new RegExp(filters.quartier, 'i');
  }
  if (filters.minPrice) {
    query['pricing.monthlyRent'] = { $gte: filters.minPrice };
  }
  if (filters.maxPrice) {
    query['pricing.monthlyRent'] = {
      ...query['pricing.monthlyRent'],
      $lte: filters.maxPrice,
    };
  }
  if (filters.type) {
    query['features.type'] = filters.type;
  }

  return this.find(query)
    .populate('owner', 'firstName lastName')
    .sort({ publishedAt: -1 });
};

// Statistiques globales pour admin
roomSchema.statics.getStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgPrice: { $avg: '$pricing.monthlyRent' },
      },
    },
  ]);
};

// ============================================
// EXPORT
// ============================================
const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
