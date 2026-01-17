# 📚 ImmoLomé API — Documentation (v1)

Base URL (dev): `http://localhost:5000/api/v1`

Cette API REST alimente la plateforme ImmoLomé (tiers de confiance). Les utilisateurs **ne contactent jamais directement** les propriétaires : toute mise en relation passe par un **paiement** puis la création d’un **Contact**.

---

## 0) Conventions

### Format standard des réponses

#### Succès
```json
{
  "success": true,
  "message": "Succès",
  "data": {}
}
```

#### Erreur
```json
{
  "success": false,
  "message": "Erreur",
  "code": "VALIDATION_ERROR",
  "errors": [{"field":"email","message":"Email invalide"}]
}
```

### Pagination
```json
{
  "success": true,
  "message": "Succès",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 120,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Auth
- Access token: JWT dans `Authorization: Bearer <token>`
- Refresh token: cookie httpOnly `refreshToken`

---

## 1) Health

### GET `/health`
Retourne l’état global du serveur.

### GET `/api/v1/health`
Retourne l’état API + DB.

---

## 2) Auth

### POST `/auth/register`
Créer un compte `user` ou `owner`.

**Body**
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "phone": "+22890123456",
  "password": "StrongPass1",
  "role": "user"
}
```

**Response**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "user": {"_id":"...","firstName":"Jean","role":"user"},
    "accessToken": "..."
  }
}
```

### POST `/auth/login`
Connexion.

**Body**
```json
{ "email": "jean@example.com", "password": "StrongPass1" }
```

### POST `/auth/logout`
Déconnexion (protégé).

### POST `/auth/refresh`
Renvoie un nouvel access token (cookie refreshToken requis).

### POST `/auth/forgot-password`
Demande réinitialisation.

### POST `/auth/reset-password`
Réinitialisation.

### POST `/auth/change-password`
Changement mot de passe (protégé).

### GET `/auth/me`
Profil connecté (protégé).

---

## 3) Rooms (Annonces)

### Règles métier
- Public: seules les chambres `available` et `processing` sont visibles.
- `reserved` et `rented` **ne doivent jamais apparaître** côté utilisateur.
- `address`, `indications`, `coordinates` sont masqués dans la vue publique.

### GET `/rooms`
Lister les chambres publiques.

**Query**
- `page` (default 1)
- `limit` (default 12)
- `quartier`
- `type` (`chambre_simple|chambre_salon|appartement|studio|maison|villa`)
- `minPrice`, `maxPrice`
- `furnished` (`true|false`)
- `sort` (`createdAt|-createdAt|price|-price|views|-views`)

### GET `/rooms/search`
Recherche full-text.

**Query**
- `q` (min 2 chars)
- `page`, `limit`

### GET `/rooms/:id`
Détails d’une chambre (public). Incrémente les vues.

> Selon le rôle, renvoie:
> - public: objet masqué
> - owner/admin: objet complet

### GET `/rooms/owner/my-rooms`
Mes chambres (owner/admin).

### POST `/rooms`
Créer une chambre (owner/admin).

**Body (exemple minimal)**
```json
{
  "title": "Chambre salon lumineuse à Tokoin",
  "description": "... (>= 50 chars) ...",
  "location": {"quartier":"Tokoin","ville":"Lomé"},
  "pricing": {
    "monthlyRent": 25000,
    "contractDuration": 10,
    "cautionMonths": 1,
    "advanceMonths": 1,
    "chargesIncluded": false,
    "chargesAmount": 0
  },
  "dimensions": {"length": 4, "width": 3, "height": 2.8},
  "features": {
    "type": "chambre_salon",
    "rooms": 2,
    "furnished": false,
    "hasWater": true,
    "hasElectricity": true
  },
  "defects": [{"description":"Petite fissure au plafond","severity":"mineur"}],
  "rules": {"petsAllowed": false, "maxOccupants": 2}
}
```

### PUT `/rooms/:id`
Modifier une chambre (owner/admin).

### DELETE `/rooms/:id`
Supprimer une chambre (owner/admin).

### POST `/rooms/:id/photos`
Upload photos (multipart/form-data) champ `photos` (min 3 total, max 10).

### DELETE `/rooms/:id/photos/:photoId`
Supprimer une photo.

### POST `/rooms/:id/submit`
Soumettre une chambre pour validation admin.

---

## 4) Payments (CinetPay)

### Règles métier
- Un paiement `contact_fee` débloque la création d’un **Contact**.
- Le webhook est la source de vérité + check API CinetPay.

### POST `/payments/initiate`
Initier un paiement de frais de contact.

**Body**
```json
{
  "roomId": "<roomObjectId>",
  "message": "Je suis intéressé(e)..."
}
```

**Response**
```json
{
  "success": true,
  "message": "Paiement initié - Redirection vers CinetPay",
  "data": {
    "payment": {"id":"...","reference":"PAY-...","amount":1000,"status":"processing"},
    "paymentUrl": "https://...cinetpay..."
  }
}
```

### POST `/payments/webhook`
Webhook CinetPay (public). Doit répondre `200 OK`.

### GET `/payments/:id/status`
Statut d’un paiement (protégé).

### GET `/payments/my-payments`
Mes paiements.

### GET `/payments/reference/:reference`
Paiement par référence.

### GET `/payments/return`
Retour CinetPay (redirige vers frontend).

### GET `/payments/cancel`
Annulation (redirige vers frontend).

---

## 5) Contacts (Demandes)

### Règles métier
- Un contact est créé **uniquement** après paiement réussi.
- Un user ne peut contacter qu’une fois une chambre (unique index).

### GET `/contacts/my-contacts`
Mes demandes.

### GET `/contacts/:id`
Détail d’une demande.

### GET `/contacts/:id/timeline`
Timeline d’avancement.

### POST `/contacts/:id/cancel`
Annuler (si `pending|processing`).

### POST `/contacts/:id/feedback`
Ajouter feedback visite.

---

## 6) Admin

Toutes les routes admin nécessitent `Authorization` + rôle `admin`.

### GET `/admin/dashboard`
Stats globales.

### Rooms
- GET `/admin/rooms`
- POST `/admin/rooms/:id/validate`
- POST `/admin/rooms/:id/reject`
- PUT `/admin/rooms/:id/status`

### Contacts
- GET `/admin/contacts`
- PUT `/admin/contacts/:id`
- POST `/admin/contacts/:id/assign`
- POST `/admin/contacts/:id/schedule-visit`
- POST `/admin/contacts/:id/success`

### Users
- GET `/admin/users`
- PUT `/admin/users/:id/toggle-active`
- POST `/admin/users/:id/verify-owner`

### Payments
- GET `/admin/payments`
- GET `/admin/payments/stats`

### Logs
- GET `/admin/logs`

---

## 7) Codes d’erreur (exemples)

- `VALIDATION_ERROR` (422)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `DUPLICATE_KEY` (409)
- `PAYMENT_ERROR` (402)

---

## 8) Sécurité & conformité

- Helmet, CORS strict, rate limiting
- Sanitization NoSQL + XSS
- Tokens JWT access + refresh
- Webhook signature (HMAC SHA256)
- Audit logs (Log model)
