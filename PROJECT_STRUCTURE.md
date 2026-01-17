# 📂 Structure des Fichiers - ImmoLomé

## Commandes d'initialisation

```bash
# Créer le dossier principal
mkdir immolome && cd immolome

# Initialiser le frontend avec Vite + React
npm create vite@latest client -- --template react
cd client
npm install

# Installer les dépendances frontend
npm install axios react-router-dom zustand react-hook-form @hookform/resolvers zod
npm install @headlessui/react @heroicons/react
npm install react-image-gallery react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Retour à la racine et création backend
cd ..
mkdir server && cd server
npm init -y

# Installer les dépendances backend
npm install express mongoose dotenv cors helmet morgan
npm install jsonwebtoken bcryptjs
npm install multer sharp cloudinary
npm install joi uuid
npm install axios  # Pour appels CinetPay

npm install -D nodemon
```

## Variables d'environnement

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_CINETPAY_SITE_ID=your_site_id
VITE_CINETPAY_API_KEY=your_api_key
```

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/immolome

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CinetPay
CINETPAY_SITE_ID=your_site_id
CINETPAY_API_KEY=your_api_key
CINETPAY_SECRET_KEY=your_secret_key
CINETPAY_NOTIFY_URL=https://your-domain.com/api/payments/webhook
CINETPAY_RETURN_URL=https://your-domain.com/payment/success
CINETPAY_CANCEL_URL=https://your-domain.com/payment/cancel

# Admin initial
ADMIN_EMAIL=admin@immolome.com
ADMIN_PASSWORD=SecurePassword123!
```

---

## Étapes suivantes

1. ✅ Architecture globale (FAIT)
2. ⏳ Modélisation MongoDB (PROCHAINE ÉTAPE)
3. ⏳ Backend API
4. ⏳ Frontend React
5. ⏳ Intégration CinetPay
6. ⏳ Tests & Déploiement
