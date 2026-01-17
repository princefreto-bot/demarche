# 💳 ImmoLomé — Intégration CinetPay (Sandbox/Production)

Ce document décrit l’intégration CinetPay côté backend (Express) et le flux fonctionnel côté frontend.

---

## 1) Variables d’environnement

### Backend (`server/.env`)
```env
CINETPAY_SITE_ID=...
CINETPAY_API_KEY=...
CINETPAY_SECRET_KEY=...

CINETPAY_NOTIFY_URL=http://localhost:5000/api/v1/payments/webhook
CINETPAY_RETURN_URL=http://localhost:3000/payment/success
CINETPAY_CANCEL_URL=http://localhost:3000/payment/cancel
```

### Frontend (`client/.env.local`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_CINETPAY_SITE_ID=...
```

---

## 2) Flux métier (non négociable)

1. L’utilisateur consulte les annonces gratuitement.
2. Il initie un paiement `contact_fee` (1000 FCFA).
3. Après paiement réussi (webhook + vérification), l’API crée :
   - `Payment` (status `completed`)
   - `Contact` (status `pending`)
4. L’admin traite le contact, organise la visite.
5. Si location réussie : commission = 1 mois de loyer (suivi dans `Contact` + `Room`).

---

## 3) Endpoints utilisés

### 3.1 Initier un paiement
`POST /api/v1/payments/initiate`

Body:
```json
{ "roomId": "...", "message": "..." }
```

Réponse : `paymentUrl` pour redirection.

### 3.2 Webhook
`POST /api/v1/payments/webhook`

⚠️ Toujours répondre `200 OK` à CinetPay.

### 3.3 Vérification côté API
L’API effectue un `POST /payment/check` vers CinetPay pour confirmer le statut.

---

## 4) Signature webhook (HMAC SHA256)

Implémentation : `server/src/config/cinetpay.js`.

- La signature attendue est calculée avec :
  - clé: `CINETPAY_SECRET_KEY`
  - message: `JSON.stringify(payload)`
  - algo: `sha256`

Pseudo:
```js
expected = hmacSHA256(secretKey, JSON.stringify(payload))
```

On compare ensuite via `timingSafeEqual`.

---

## 5) Mapping statuts CinetPay

`00` : succès
`600` : pending
`602` : refusé
`603` : annulé
`604` : échec
`605` : expiré

Le backend mappe ces statuts via `isPaymentSuccessful()` et `getStatusMessage()`.

---

## 6) Sandbox — numéros de test (indicatif)

Selon la doc CinetPay, vous pouvez disposer de numéros sandbox.

Exemples (à confirmer sur votre compte):
- MTN (succès)
- MTN (échec)
- Moov (succès)

---

## 7) Idempotence & anti-doublons

- Le modèle `Payment` supporte une `idempotencyKey` (optionnel).
- Le modèle `Contact` empêche les doublons via index unique `(user, room)`.

Recommandation prod :
- Rejeter tout webhook déjà traité (`payment.webhook.received === true` + `payment.status === completed`).

---

## 8) Sécurité production (checklist rapide)

- HTTPS obligatoire
- CORS strict (domaines exacts)
- Webhook accessible publiquement, stable
- Timeout webhook < 3s
- Logs: stocker `webhookData`, `verificationData`, `signatureValid`, IP
- Activer un monitoring (UptimeRobot sur `/health`)

---

## 9) Frontend

Le frontend :
- appelle `/payments/initiate`
- récupère `paymentUrl`
- redirige l’utilisateur
- reçoit ensuite un retour sur `/payment/success?payment=<id>&status=<status>`
- appelle `/payments/:id/status` pour afficher un statut fiable

---

## 10) Dépannage

### Paiement bloqué en `processing`
- Vérifier que le webhook arrive sur `/payments/webhook`.
- Vérifier l’accès public à l’URL webhook.
- Vérifier le `payment/check`.

### Signature invalide
- Vérifier la clé `CINETPAY_SECRET_KEY`.
- Vérifier que le payload utilisé pour HMAC est exactement le corps JSON reçu.

### Contact non créé
- Vérifier logs `payment.completed` et `contact.created`.
- Vérifier que `payment.metadata.message` existe.
