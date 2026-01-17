# 🚀 Guide de Déploiement - ImmoLomé

Ce guide détaille le déploiement complet de la plateforme ImmoLomé en production.

---

## 📋 Table des matières

1. [Prérequis](#1-prérequis)
2. [MongoDB Atlas](#2-mongodb-atlas)
3. [Cloudinary](#3-cloudinary)
4. [CinetPay](#4-cinetpay)
5. [Backend (Railway)](#5-backend-railway)
6. [Frontend (Vercel)](#6-frontend-vercel)
7. [Configuration DNS](#7-configuration-dns)
8. [Checklist Production](#8-checklist-production)
9. [Monitoring](#9-monitoring)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prérequis

### Comptes nécessaires (tous gratuits pour démarrer)

| Service | Usage | Lien |
|---------|-------|------|
| GitHub | Code source | https://github.com |
| MongoDB Atlas | Base de données | https://mongodb.com/atlas |
| Cloudinary | Stockage images | https://cloudinary.com |
| CinetPay | Paiements | https://cinetpay.com |
| Railway | Hébergement backend | https://railway.app |
| Vercel | Hébergement frontend | https://vercel.com |

### Outils locaux

```bash
# Vérifier Node.js (18+)
node --version

# Vérifier npm
npm --version

# Installer Git si nécessaire
git --version
```

---

## 2. MongoDB Atlas

### 2.1 Créer un cluster

1. Connectez-vous à [MongoDB Atlas](https://mongodb.com/atlas)
2. Cliquez sur **"Build a Database"**
3. Sélectionnez **"M0 FREE"** (gratuit)
4. Choisissez la région **"Europe (Paris)"** ou proche
5. Nommez le cluster : `immolome-cluster`

### 2.2 Créer un utilisateur

1. Allez dans **"Database Access"**
2. Cliquez **"Add New Database User"**
3. Remplissez :
   - Username: `immolome-admin`
   - Password: (générez un mot de passe fort)
   - Role: `Atlas Admin`
4. **Notez le mot de passe !**

### 2.3 Configurer l'accès réseau

1. Allez dans **"Network Access"**
2. Cliquez **"Add IP Address"**
3. Sélectionnez **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Nécessaire pour Railway/Render
4. Confirmez

### 2.4 Obtenir l'URI de connexion

1. Allez dans **"Database" → "Connect"**
2. Sélectionnez **"Connect your application"**
3. Copiez l'URI :

```
mongodb+srv://immolome-admin:<password>@immolome-cluster.xxxxx.mongodb.net/immolome?retryWrites=true&w=majority
```

4. Remplacez `<password>` par votre mot de passe

---

## 3. Cloudinary

### 3.1 Créer un compte

1. Inscrivez-vous sur [Cloudinary](https://cloudinary.com)
2. Vérifiez votre email

### 3.2 Récupérer les credentials

1. Allez dans **"Dashboard"**
2. Notez les informations :
   - Cloud Name: `dxxxxxxxxx`
   - API Key: `123456789012345`
   - API Secret: `xxxxxxxxxxxxxxxxxxx`

### 3.3 Configurer les presets d'upload (optionnel)

1. Allez dans **"Settings" → "Upload"**
2. Créez un preset pour les chambres :
   - Name: `immolome_rooms`
   - Folder: `immolome/rooms`
   - Transformation: `c_limit,w_1920,h_1080,q_auto`

---

## 4. CinetPay

### 4.1 Créer un compte marchand

1. Inscrivez-vous sur [CinetPay](https://cinetpay.com)
2. Complétez le profil marchand :
   - Type : Entreprise ou Particulier
   - Pays : Togo
   - Documents requis (selon le type)

### 4.2 Mode Sandbox (Test)

1. Allez dans **"Intégration" → "API"**
2. Activez le **mode Sandbox**
3. Notez les credentials sandbox :
   - Site ID
   - API Key
   - Secret Key

### 4.3 Configurer les webhooks

1. Allez dans **"Paramètres" → "Webhooks"**
2. Ajoutez l'URL de notification :
   ```
   https://api.immolome.com/api/v1/payments/webhook
   ```
3. Activez les événements :
   - `payment.success`
   - `payment.failed`

### 4.4 Numéros de test (Sandbox)

| Opérateur | Numéro | Résultat |
|-----------|--------|----------|
| MTN | 07 00 00 00 00 | Succès |
| MTN | 07 00 00 00 01 | Échec |
| Moov | 05 00 00 00 00 | Succès |
| Orange | 08 00 00 00 00 | Succès |

### 4.5 Passage en Production

1. Soumettez votre demande de mise en production
2. Fournissez les documents requis
3. Attendez la validation (24-72h)
4. Récupérez les credentials de production
5. Mettez à jour les variables d'environnement

---

## 5. Backend (Railway)

### 5.1 Préparer le projet

Assurez-vous que votre `server/package.json` contient :

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 5.2 Déployer sur Railway

1. Connectez-vous à [Railway](https://railway.app)
2. Cliquez **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Autorisez l'accès à votre repo
5. Sélectionnez le repository `immolome`

### 5.3 Configurer le service

1. Cliquez sur le service créé
2. Allez dans **"Settings"**
3. Configurez :
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

### 5.4 Variables d'environnement

Allez dans **"Variables"** et ajoutez :

```env
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://immolome-admin:password@cluster.mongodb.net/immolome

# JWT (générez des secrets uniques !)
JWT_SECRET=votre_secret_jwt_production_64_caracteres_minimum_tres_securise
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=votre_refresh_secret_production_64_caracteres_different
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# CinetPay (Production)
CINETPAY_SITE_ID=votre_site_id_production
CINETPAY_API_KEY=votre_api_key_production
CINETPAY_SECRET_KEY=votre_secret_key_production
CINETPAY_NOTIFY_URL=https://votre-backend.railway.app/api/v1/payments/webhook
CINETPAY_RETURN_URL=https://immolome.com/payment/success
CINETPAY_CANCEL_URL=https://immolome.com/payment/cancel

# Admin
ADMIN_EMAIL=admin@immolome.com
ADMIN_PASSWORD=MotDePasseProductionTresSecurise123!

# CORS
CORS_ORIGIN=https://immolome.com,https://www.immolome.com
```

### 5.5 Générer un domaine

1. Allez dans **"Settings" → "Networking"**
2. Cliquez **"Generate Domain"**
3. Notez l'URL : `https://immolome-api-production.up.railway.app`

### 5.6 Domaine personnalisé (optionnel)

1. Ajoutez un Custom Domain : `api.immolome.com`
2. Configurez le CNAME dans votre DNS

---

## 6. Frontend (Netlify)

### 6.1 Déployer sur Netlify

1. Connectez-vous à [Netlify](https://netlify.com)
2. Cliquez **"Add new site" → "Import an existing project"**
3. Connectez votre Git provider (GitHub)
4. Sélectionnez le repository `immolome`

### 6.2 Configuration Build

> Ce repo est mono-repo : le frontend est dans `client/`.

Paramètres (Netlify UI) :
- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `client/dist`

Ou via `netlify.toml` (déjà ajouté à la racine) :
```toml
[build]
base = "client"
command = "npm run build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### 6.3 Redirections SPA (React Router)

Netlify doit rediriger toutes les routes vers `index.html` (sinon 404 sur `/chambres/:id`, `/dashboard/...`).
- Soit via `netlify.toml` (ci-dessus)
- Soit via `client/public/_redirects` (déjà ajouté) :
```
/* /index.html 200
```

### 6.4 Variables d'environnement (Netlify)

Dans **Site settings → Environment variables**, ajoutez :
```env
VITE_API_URL=https://api.immolome.com/api/v1
```

> `VITE_CINETPAY_SITE_ID` n'est pas requis côté frontend dans notre flow actuel (paiement initié côté backend puis redirection URL).

### 6.5 Domaine personnalisé

1. Allez dans **"Domain management"**
2. Ajoutez :
   - `immolome.com`
   - `www.immolome.com`
3. Configurez les DNS selon les instructions Netlify

---

## 7. Configuration DNS

### Chez votre registrar (ex: Namecheap, Gandi)

```dns
# Frontend (Netlify)
# Netlify fournit soit un CNAME vers <your-site>.netlify.app,
# soit des enregistrements A selon votre configuration.
# Suivez exactement les instructions affichées dans Netlify → Domain management.

# Exemple (souvent) :
# CNAME   www     <your-site>.netlify.app
# A       @       <IP fournie par Netlify>

# Backend (Railway / Render)
CNAME   api     immolome-api-production.up.railway.app
```

### Vérification

```bash
# Vérifier la propagation DNS
nslookup immolome.com
nslookup api.immolome.com
```

---

## 8. Checklist Production

### 🔐 Sécurité

- [ ] JWT secrets générés (64+ caractères)
- [ ] HTTPS activé partout
- [ ] CORS configuré avec domaines exacts
- [ ] Rate limiting activé
- [ ] Helmet.js activé
- [ ] Mot de passe admin fort
- [ ] Variables sensibles non commitées

### 🗄️ Base de données

- [ ] MongoDB Atlas configuré
- [ ] Indexes créés
- [ ] Backup automatique activé
- [ ] Utilisateur admin créé

### 💳 Paiements

- [ ] CinetPay en mode production
- [ ] Webhook URL configurée
- [ ] Tests de paiement effectués
- [ ] Signature webhook vérifiée

### 🖼️ Médias

- [ ] Cloudinary configuré
- [ ] Limits d'upload définies
- [ ] Transformations optimisées

### 📊 Monitoring

- [ ] Logs configurés
- [ ] Alertes email configurées
- [ ] Sentry (optionnel) intégré

### 🧪 Tests

- [ ] Inscription testée
- [ ] Connexion testée
- [ ] Création chambre testée
- [ ] Paiement testé (sandbox puis production)
- [ ] Flux complet testé

---

## 9. Monitoring

### 9.1 Logs Railway

```bash
# Voir les logs en temps réel
railway logs --follow
```

### 9.2 Intégration Sentry (optionnel)

1. Créez un compte sur [Sentry](https://sentry.io)
2. Créez un projet Node.js
3. Installez le SDK :

```bash
cd server
npm install @sentry/node
```

4. Configurez dans `app.js` :

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://xxx@xxx.ingest.sentry.io/xxx",
  environment: process.env.NODE_ENV,
});

// Avant les routes
app.use(Sentry.Handlers.requestHandler());

// Après les routes
app.use(Sentry.Handlers.errorHandler());
```

### 9.3 Uptime Monitoring

Utilisez [UptimeRobot](https://uptimerobot.com) (gratuit) :
- Moniteur HTTP pour `https://api.immolome.com/health`
- Alertes par email en cas de downtime

---

## 10. Troubleshooting

### Erreur : "MongoDB connection failed"

**Causes possibles :**
1. URI incorrecte
2. IP non autorisée
3. Mot de passe incorrect

**Solution :**
```bash
# Tester la connexion
mongosh "mongodb+srv://cluster.mongodb.net/immolome" --username immolome-admin
```

### Erreur : "CORS blocked"

**Solution :**
Vérifiez que `CORS_ORIGIN` contient exactement les domaines du frontend :
```env
CORS_ORIGIN=https://immolome.com,https://www.immolome.com
```

### Erreur : "JWT malformed"

**Causes possibles :**
1. Secret différent entre access et refresh
2. Token expiré
3. Secret changé en production

**Solution :**
Régénérez les secrets et déconnectez tous les utilisateurs.

### Erreur : "CinetPay webhook failed"

**Vérifications :**
1. URL webhook accessible publiquement
2. Signature correctement vérifiée
3. Réponse 200 renvoyée rapidement

**Debug :**
```javascript
// Loggez les webhooks reçus
console.log('Webhook reçu:', JSON.stringify(req.body));
```

### Images non uploadées

**Vérifications :**
1. Credentials Cloudinary corrects
2. Quota non dépassé
3. Format de fichier autorisé

### Paiement bloqué en "processing"

**Solution :**
Vérifiez manuellement le statut via l'API CinetPay :
```bash
curl -X POST https://api-checkout.cinetpay.com/v2/payment/check \
  -H "Content-Type: application/json" \
  -d '{"apikey":"xxx","site_id":"xxx","transaction_id":"xxx"}'
```

---

## 📞 Support

### CinetPay
- Email: support@cinetpay.com
- Documentation: https://docs.cinetpay.com

### MongoDB Atlas
- Documentation: https://docs.atlas.mongodb.com
- Support: via le dashboard Atlas

### Railway
- Discord: https://discord.gg/railway
- Documentation: https://docs.railway.app

### Vercel
- Documentation: https://vercel.com/docs
- Support: via le dashboard Vercel

---

## 🔄 Mise à jour en production

### Déploiement automatique

Railway et Vercel déploient automatiquement à chaque push sur `main`.

### Déploiement manuel

```bash
# Backend
cd server
railway up

# Frontend
cd client
vercel --prod
```

### Rollback

```bash
# Railway : via le dashboard, sélectionnez un déploiement précédent
# Vercel : via le dashboard, "Promote to Production" sur un déploiement antérieur
```

---

*Guide de déploiement ImmoLomé v1.0*
