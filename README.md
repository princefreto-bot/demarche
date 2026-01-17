# 🏠 ImmoLomé - Plateforme d'Intermédiation Immobilière

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![CinetPay](https://img.shields.io/badge/Payment-CinetPay-orange.svg)](https://cinetpay.com/)

> Plateforme web de confiance pour la location de chambres à Lomé, Togo.

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Déploiement](#-déploiement)
- [API Documentation](#-api-documentation)
- [Contribution](#-contribution)

---

## 🎯 Présentation

**ImmoLomé** est une plateforme d'intermédiation immobilière qui connecte les personnes cherchant une chambre avec les propriétaires à Lomé (Togo).

### Concept clé

La plateforme agit comme **tiers de confiance** :
- Les utilisateurs ne contactent jamais directement les propriétaires
- Chaque demande de contact est payante (1 000 FCFA)
- L'équipe ImmoLomé organise les visites
- Commission de 1 mois de loyer perçue après location effective

---

## ✨ Fonctionnalités

### 👤 Visiteurs (non connectés)
- ✅ Consulter toutes les chambres disponibles
- ✅ Voir les détails, photos HD, dimensions
- ✅ Filtrer par quartier, prix, type
- ✅ Recherche textuelle

### 👥 Utilisateurs (connectés)
- ✅ Créer un compte gratuit
- ✅ Payer pour contacter (CinetPay)
- ✅ Suivre ses demandes en temps réel
- ✅ Historique des paiements
- ✅ Donner un feedback après visite

### 🏠 Propriétaires
- ✅ Publier des chambres gratuitement
- ✅ Upload de photos HD (min. 3)
- ✅ Tableau de bord avec statistiques
- ✅ Suivi des demandes reçues

### 👨‍💼 Administrateurs
- ✅ Valider/rejeter les chambres
- ✅ Gérer les demandes de contact
- ✅ Organiser les visites
- ✅ Marquer les locations réussies
- ✅ Dashboard avec analytics
- ✅ Gestion des utilisateurs
- ✅ Logs complets

---

## 🏗 Architecture

```
immolome/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Services API (Axios)
│   │   ├── store/          # État global (Zustand)
│   │   ├── hooks/          # Hooks personnalisés
│   │   └── utils/          # Utilitaires
│   └── package.json
│
├── server/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── config/         # Configurations
│   │   ├── controllers/    # Contrôleurs
│   │   ├── middlewares/    # Middlewares
│   │   ├── models/         # Modèles Mongoose
│   │   ├── routes/         # Routes API
│   │   └── utils/          # Utilitaires
│   └── package.json
│
├── docs/                   # Documentation
├── ARCHITECTURE.md         # Architecture détaillée
└── README.md               # Ce fichier
```

### Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Backend | Node.js 20, Express.js |
| Base de données | MongoDB Atlas |
| Authentification | JWT (access + refresh tokens) |
| Paiement | CinetPay (Mobile Money + Cartes) |
| Stockage images | Cloudinary |
| Validation | Joi (backend), Zod (frontend) |

---

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte MongoDB Atlas (gratuit)
- Compte Cloudinary (gratuit)
- Compte CinetPay (sandbox)

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/immolome.git
cd immolome
```

### 2. Installer les dépendances

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

---

## ⚙️ Configuration

### Backend (`server/.env`)

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/immolome

# JWT
JWT_SECRET=votre_secret_jwt_super_securise_32_caracteres_minimum
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=votre_refresh_secret_different_du_premier
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# CinetPay (Sandbox)
CINETPAY_SITE_ID=votre_site_id
CINETPAY_API_KEY=votre_api_key
CINETPAY_SECRET_KEY=votre_secret_key
CINETPAY_NOTIFY_URL=https://votre-api.com/api/v1/payments/webhook
CINETPAY_RETURN_URL=https://votre-site.com/payment/success
CINETPAY_CANCEL_URL=https://votre-site.com/payment/cancel

# Admin initial
ADMIN_EMAIL=admin@immolome.com
ADMIN_PASSWORD=MotDePasseSecurise123!
```

### Frontend (`client/.env.local`)

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_CINETPAY_SITE_ID=votre_site_id
```

---

## 🏃 Démarrage

### Mode développement

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API: http://localhost:5000/api/v1

### Compte Admin par défaut

Au premier démarrage, un compte admin est créé automatiquement :
- Email: `admin@immolome.com` (ou celui configuré)
- Password: celui configuré dans `.env`

⚠️ **Changez le mot de passe après la première connexion !**

---

## 🌐 Déploiement

### Frontend (Vercel)

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend (Railway / Render)

1. Connectez votre repo GitHub
2. Sélectionnez le dossier `server`
3. Configurez les variables d'environnement
4. Start command: `npm start`

### Base de données (MongoDB Atlas)

1. Créez un cluster gratuit (M0)
2. Créez un utilisateur avec mot de passe
3. Ajoutez les IPs autorisées (0.0.0.0/0 pour Railway/Render)
4. Copiez l'URI de connexion

### Images (Cloudinary)

1. Créez un compte gratuit
2. Récupérez les credentials dans le dashboard
3. Configurez les variables d'environnement

---

## 📚 API Documentation

### Endpoints principaux

#### Authentification
```
POST /api/v1/auth/register     # Inscription
POST /api/v1/auth/login        # Connexion
POST /api/v1/auth/logout       # Déconnexion
POST /api/v1/auth/refresh      # Rafraîchir token
```

#### Chambres
```
GET  /api/v1/rooms             # Liste (public)
GET  /api/v1/rooms/:id         # Détails (public)
POST /api/v1/rooms             # Créer (owner)
PUT  /api/v1/rooms/:id         # Modifier (owner)
POST /api/v1/rooms/:id/photos  # Ajouter photos (owner)
```

#### Paiements
```
POST /api/v1/payments/initiate     # Initier paiement
POST /api/v1/payments/webhook      # Webhook CinetPay
GET  /api/v1/payments/my-payments  # Historique
```

#### Contacts
```
GET  /api/v1/contacts/my-contacts  # Mes demandes
GET  /api/v1/contacts/:id/timeline # Suivi
POST /api/v1/contacts/:id/cancel   # Annuler
```

#### Admin
```
GET  /api/v1/admin/dashboard           # Dashboard
POST /api/v1/admin/rooms/:id/validate  # Valider chambre
POST /api/v1/admin/contacts/:id/success # Marquer succès
```

---

## 🧪 Tests

```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

---

## 🔒 Sécurité

- ✅ Authentification JWT avec refresh tokens
- ✅ Passwords hashés (bcrypt, 12 rounds)
- ✅ Rate limiting (global, auth, paiements)
- ✅ Protection CORS
- ✅ Headers sécurisés (Helmet)
- ✅ Validation des entrées (Joi/Zod)
- ✅ Protection XSS et NoSQL injection
- ✅ Vérification signature webhooks CinetPay

---

## 📈 Roadmap

### Phase 1 - MVP ✅
- [x] Authentification
- [x] CRUD Chambres
- [x] Intégration CinetPay
- [x] Dashboard admin

### Phase 2 - Améliorations
- [ ] Notifications email
- [ ] Chat intégré
- [ ] Favoris
- [ ] Géolocalisation

### Phase 3 - Mobile
- [ ] Application React Native
- [ ] Push notifications

---

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commitez (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Contact

- **Email**: contact@immolome.com
- **Site**: https://immolome.com
- **WhatsApp**: +228 90 00 00 00

---

Fait avec ❤️ à Lomé, Togo
