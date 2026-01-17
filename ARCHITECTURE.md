# 🏗️ ImmoLomé - Architecture Technique

## 📌 Vue d'ensemble

**ImmoLomé** est une plateforme web d'intermédiation immobilière destinée au marché de Lomé (Togo).
Elle agit comme **tiers de confiance** entre les chercheurs de logement et les propriétaires.

---

## 🎯 Logique Métier Centrale

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   UTILISATEUR   │────▶│   PLATEFORME    │────▶│  PROPRIÉTAIRE   │
│   (Chercheur)   │     │  (Tiers confiance)    │   (Bailleur)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │  1. Consulte         │                       │
        │     gratuitement     │                       │
        │                      │                       │
        │  2. Paie pour        │                       │
        │     contacter        │                       │
        │                      │  3. Analyse &         │
        │                      │     contacte          │
        │                      │                       │
        │                      │  4. Organise visite   │
        │                      │◀──────────────────────│
        │                      │                       │
        │  5. Location         │  6. Commission        │
        │     effective        │     (1 mois loyer)    │
        └──────────────────────┴───────────────────────┘
```

---

## 🧱 Stack Technique

### Frontend
- **Framework**: React 18+ avec Vite
- **Routing**: React Router v6
- **State Management**: Zustand (léger et performant)
- **HTTP Client**: Axios avec intercepteurs
- **UI Framework**: Tailwind CSS + Headless UI
- **Forms**: React Hook Form + Zod (validation)
- **Images**: React Image Gallery (pour les photos HD)

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js (API REST)
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Joi / Zod
- **File Upload**: Multer + Sharp (compression images)
- **Logging**: Winston + Morgan

### Base de données
- **Primary**: MongoDB Atlas (Free Tier)
- **ODM**: Mongoose
- **Cache**: Redis (optionnel, phase 2)

### Paiement
- **Provider**: CinetPay
- **Mode**: Sandbox/Demo
- **Webhooks**: Sécurisés avec signature HMAC

### DevOps
- **Frontend Hosting**: Vercel / Netlify
- **Backend Hosting**: Railway / Render
- **Storage Images**: Cloudinary (Free Tier)
- **Monitoring**: Sentry (erreurs)

---

## 📁 Structure du Projet

```
immolome/
├── client/                      # Frontend React
│   ├── public/
│   │   ├── favicon.ico
│   │   └── images/
│   ├── src/
│   │   ├── assets/              # Images, fonts, etc.
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── ui/              # Composants UI de base
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── Loader.jsx
│   │   │   ├── layout/          # Layout components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── MainLayout.jsx
│   │   │   ├── room/            # Composants liés aux chambres
│   │   │   │   ├── RoomCard.jsx
│   │   │   │   ├── RoomGallery.jsx
│   │   │   │   ├── RoomDetails.jsx
│   │   │   │   ├── RoomFilters.jsx
│   │   │   │   └── RoomStatus.jsx
│   │   │   ├── payment/         # Composants paiement
│   │   │   │   ├── PaymentForm.jsx
│   │   │   │   ├── PaymentStatus.jsx
│   │   │   │   └── CinetPayButton.jsx
│   │   │   └── auth/            # Composants authentification
│   │   │       ├── LoginForm.jsx
│   │   │       ├── RegisterForm.jsx
│   │   │       └── ProtectedRoute.jsx
│   │   ├── pages/               # Pages de l'application
│   │   │   ├── public/          # Pages accessibles sans auth
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── RoomsListPage.jsx
│   │   │   │   ├── RoomDetailPage.jsx
│   │   │   │   └── ContactPage.jsx
│   │   │   ├── auth/            # Pages authentification
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   └── ForgotPasswordPage.jsx
│   │   │   ├── user/            # Pages utilisateur
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── MyRequestsPage.jsx
│   │   │   │   ├── PaymentHistoryPage.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   ├── owner/           # Pages propriétaire
│   │   │   │   ├── OwnerDashboard.jsx
│   │   │   │   ├── MyRoomsPage.jsx
│   │   │   │   ├── AddRoomPage.jsx
│   │   │   │   └── EditRoomPage.jsx
│   │   │   └── admin/           # Pages administration
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── ManageRoomsPage.jsx
│   │   │       ├── ManageUsersPage.jsx
│   │   │       ├── ManagePaymentsPage.jsx
│   │   │       └── SettingsPage.jsx
│   │   ├── hooks/               # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useRooms.js
│   │   │   ├── usePayment.js
│   │   │   └── useApi.js
│   │   ├── services/            # Services API
│   │   │   ├── api.js           # Configuration Axios
│   │   │   ├── authService.js
│   │   │   ├── roomService.js
│   │   │   ├── paymentService.js
│   │   │   └── userService.js
│   │   ├── store/               # State management (Zustand)
│   │   │   ├── authStore.js
│   │   │   ├── roomStore.js
│   │   │   └── uiStore.js
│   │   ├── utils/               # Utilitaires
│   │   │   ├── constants.js
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   ├── styles/              # Styles globaux
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── routes.jsx
│   ├── .env.example
│   ├── .env.local
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── README.md
│
├── server/                      # Backend Node.js
│   ├── src/
│   │   ├── config/              # Configuration
│   │   │   ├── database.js      # Connexion MongoDB
│   │   │   ├── cloudinary.js    # Configuration Cloudinary
│   │   │   ├── cinetpay.js      # Configuration CinetPay
│   │   │   └── env.js           # Variables d'environnement
│   │   ├── controllers/         # Contrôleurs
│   │   │   ├── authController.js
│   │   │   ├── roomController.js
│   │   │   ├── userController.js
│   │   │   ├── paymentController.js
│   │   │   ├── contactController.js
│   │   │   └── adminController.js
│   │   ├── middlewares/         # Middlewares
│   │   │   ├── auth.js          # Vérification JWT
│   │   │   ├── roles.js         # Vérification rôles
│   │   │   ├── upload.js        # Gestion upload fichiers
│   │   │   ├── validate.js      # Validation requêtes
│   │   │   ├── errorHandler.js  # Gestion erreurs
│   │   │   └── rateLimiter.js   # Protection rate limiting
│   │   ├── models/              # Modèles Mongoose
│   │   │   ├── User.js
│   │   │   ├── Room.js
│   │   │   ├── Contact.js       # Demandes de contact
│   │   │   ├── Payment.js
│   │   │   └── Log.js           # Logs activité
│   │   ├── routes/              # Routes API
│   │   │   ├── index.js         # Router principal
│   │   │   ├── authRoutes.js
│   │   │   ├── roomRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── contactRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/            # Services métier
│   │   │   ├── authService.js
│   │   │   ├── roomService.js
│   │   │   ├── paymentService.js
│   │   │   ├── cinetpayService.js
│   │   │   ├── emailService.js
│   │   │   └── imageService.js
│   │   ├── validators/          # Schémas de validation
│   │   │   ├── authValidators.js
│   │   │   ├── roomValidators.js
│   │   │   └── paymentValidators.js
│   │   ├── utils/               # Utilitaires
│   │   │   ├── jwt.js
│   │   │   ├── hash.js
│   │   │   ├── logger.js
│   │   │   └── response.js
│   │   └── app.js               # Configuration Express
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── server.js                # Point d'entrée
│   └── README.md
│
├── docs/                        # Documentation
│   ├── API.md                   # Documentation API
│   ├── DEPLOYMENT.md            # Guide déploiement
│   └── CINETPAY.md              # Intégration CinetPay
│
├── .gitignore
├── docker-compose.yml           # Pour dev local
├── README.md
└── ARCHITECTURE.md              # Ce fichier
```

---

## 👥 Rôles & Permissions

### Matrice des permissions

| Fonctionnalité              | Visiteur | User | Owner | Admin |
|-----------------------------|----------|------|-------|-------|
| Voir annonces disponibles   | ✅       | ✅   | ✅    | ✅    |
| Voir détails chambre        | ✅       | ✅   | ✅    | ✅    |
| Créer un compte             | ✅       | -    | -     | -     |
| Payer pour contacter        | ❌       | ✅   | ❌    | ✅    |
| Voir historique contacts    | ❌       | ✅   | ❌    | ✅    |
| Publier une chambre         | ❌       | ❌   | ✅    | ✅    |
| Modifier ses chambres       | ❌       | ❌   | ✅    | ✅    |
| Voir demandes reçues        | ❌       | ❌   | ❌    | ✅    |
| Valider chambres            | ❌       | ❌   | ❌    | ✅    |
| Gérer utilisateurs          | ❌       | ❌   | ❌    | ✅    |
| Voir tous les paiements     | ❌       | ❌   | ❌    | ✅    |
| Accès logs complets         | ❌       | ❌   | ❌    | ✅    |

---

## 🔐 Sécurité

### Authentification
- JWT avec refresh token
- Tokens stockés en httpOnly cookies (sécurisé)
- Expiration: Access token 15min, Refresh token 7 jours

### Protection API
- Rate limiting par IP et par user
- Validation stricte des entrées (Joi/Zod)
- Sanitization des données
- CORS configuré strictement
- Helmet.js pour headers sécurisés

### Paiements
- Vérification signature webhook CinetPay
- Logs complets de toutes transactions
- Idempotency keys pour éviter doublons

---

## 📊 Statuts des Chambres

```
┌──────────────┐
│   BROUILLON  │ (draft) - Non visible
└──────┬───────┘
       │ Propriétaire soumet
       ▼
┌──────────────┐
│  EN ATTENTE  │ (pending) - En attente validation admin
└──────┬───────┘
       │ Admin valide
       ▼
┌──────────────┐
│  DISPONIBLE  │ (available) - Visible par tous
└──────┬───────┘
       │ Demande de contact payée
       ▼
┌──────────────┐
│ EN TRAITEMENT│ (processing) - Visible mais marquée
└──────┬───────┘
       │ Visite organisée, intérêt confirmé
       ▼
┌──────────────┐
│   RÉSERVÉE   │ (reserved) - Non visible users
└──────┬───────┘
       │ Contrat signé
       ▼
┌──────────────┐
│    LOUÉE     │ (rented) - Archivée, non visible
└──────────────┘
```

---

## 💰 Flux de Paiement

```
1. User clique "Contacter pour cette chambre"
           │
           ▼
2. Redirection vers page paiement
   - Affichage montant (frais de mise en relation)
   - Choix mode paiement (Mobile Money, etc.)
           │
           ▼
3. Intégration CinetPay (SDK JavaScript)
   - Création transaction côté serveur
   - Affichage widget CinetPay
           │
           ▼
4. Paiement effectué
   - Webhook CinetPay → notre serveur
   - Vérification signature
   - Mise à jour statut paiement
           │
           ▼
5. Contact créé
   - Enregistrement demande en BDD
   - Notification admin
   - Notification user (confirmation)
           │
           ▼
6. Suivi par admin
   - Contact propriétaire
   - Organisation visite
   - Mise à jour statut chambre
```

---

## 🚀 Phases de Développement

### Phase 1 - MVP (4-6 semaines)
- [ ] Setup projet (frontend + backend)
- [ ] Authentification complète
- [ ] CRUD chambres (propriétaires)
- [ ] Affichage annonces (public)
- [ ] Intégration CinetPay (sandbox)
- [ ] Dashboard admin basique
- [ ] Déploiement initial

### Phase 2 - Amélioration (4 semaines)
- [ ] Filtres avancés (quartier, prix, etc.)
- [ ] Système de favoris
- [ ] Notifications email
- [ ] Dashboard analytics admin
- [ ] Optimisation performances

### Phase 3 - Production (2 semaines)
- [ ] Passage CinetPay production
- [ ] Tests charge
- [ ] Monitoring Sentry
- [ ] Documentation finale
- [ ] Formation utilisateurs

### Phase 4 - Évolution (continue)
- [ ] Application mobile (React Native)
- [ ] Chat intégré
- [ ] Visites virtuelles
- [ ] API partenaires

---

## 📱 Responsive Design

L'application doit être **mobile-first** car la majorité des utilisateurs à Lomé utilisent leur smartphone.

### Breakpoints Tailwind
- `sm`: 640px (petits téléphones)
- `md`: 768px (tablettes)
- `lg`: 1024px (desktop)
- `xl`: 1280px (grands écrans)

---

## 🎨 Design System

### Couleurs principales
- **Primary**: #2563EB (Bleu professionnel)
- **Secondary**: #10B981 (Vert confiance)
- **Accent**: #F59E0B (Orange action)
- **Neutral**: Grays Tailwind
- **Error**: #EF4444
- **Success**: #22C55E

### Typography
- **Headings**: Inter (bold)
- **Body**: Inter (regular)
- **Tailles**: Échelle Tailwind standard

---

*Document généré pour le projet ImmoLomé*
*Version 1.0 - Architecture initiale*
