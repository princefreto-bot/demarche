/**
 * Routes principales - ImmoLomé
 * Point d'entrée de toutes les routes API
 */

const express = require('express');
const router = express.Router();

// Import des routes
const authRoutes = require('./authRoutes');
const roomRoutes = require('./roomRoutes');
const userRoutes = require('./userRoutes');
const paymentRoutes = require('./paymentRoutes');
const contactRoutes = require('./contactRoutes');
const adminRoutes = require('./adminRoutes');

// ============================================
// ROUTES PUBLIQUES
// ============================================

// Authentification
router.use('/auth', authRoutes);

// Chambres (lecture publique)
router.use('/rooms', roomRoutes);

// ============================================
// ROUTES PROTÉGÉES
// ============================================

// Utilisateurs
router.use('/users', userRoutes);

// Paiements
router.use('/payments', paymentRoutes);

// Contacts / Demandes
router.use('/contacts', contactRoutes);

// ============================================
// ROUTES ADMIN
// ============================================

router.use('/admin', adminRoutes);

// ============================================
// ROUTE DE DOCUMENTATION
// ============================================

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API ImmoLomé',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    endpoints: {
      auth: {
        'POST /auth/register': 'Créer un compte',
        'POST /auth/login': 'Se connecter',
        'POST /auth/logout': 'Se déconnecter',
        'POST /auth/refresh': 'Rafraîchir le token',
        'POST /auth/forgot-password': 'Demander réinitialisation mot de passe',
        'POST /auth/reset-password': 'Réinitialiser le mot de passe',
      },
      rooms: {
        'GET /rooms': 'Lister les chambres disponibles',
        'GET /rooms/:id': 'Détails d\'une chambre',
        'POST /rooms': 'Créer une chambre (owner)',
        'PUT /rooms/:id': 'Modifier une chambre (owner)',
        'DELETE /rooms/:id': 'Supprimer une chambre (owner)',
        'POST /rooms/:id/photos': 'Ajouter des photos (owner)',
      },
      users: {
        'GET /users/me': 'Mon profil',
        'PUT /users/me': 'Modifier mon profil',
        'GET /users/me/contacts': 'Mes demandes de contact',
        'GET /users/me/payments': 'Mon historique de paiements',
      },
      payments: {
        'POST /payments/initiate': 'Initier un paiement',
        'GET /payments/:id': 'Détails d\'un paiement',
        'POST /payments/webhook': 'Webhook CinetPay',
      },
      contacts: {
        'POST /contacts': 'Créer une demande de contact',
        'GET /contacts/:id': 'Détails d\'une demande',
      },
      admin: {
        'GET /admin/dashboard': 'Dashboard admin',
        'GET /admin/rooms': 'Gérer les chambres',
        'GET /admin/users': 'Gérer les utilisateurs',
        'GET /admin/payments': 'Gérer les paiements',
        'GET /admin/contacts': 'Gérer les demandes',
      },
    },
  });
});

module.exports = router;
