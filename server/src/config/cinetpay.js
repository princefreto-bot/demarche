/**
 * Configuration CinetPay - ImmoLomé
 * Intégration paiement mobile money et cartes
 */

const axios = require('axios');
const crypto = require('crypto');
const config = require('./env');

/**
 * Client Axios configuré pour CinetPay
 */
const cinetpayClient = axios.create({
  baseURL: config.cinetpay.baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Générer un ID de transaction unique
 */
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `TXN-${timestamp}-${random}`.toUpperCase();
};

/**
 * Initialiser un paiement CinetPay
 * @param {Object} params - Paramètres du paiement
 * @returns {Object} Réponse CinetPay avec URL de paiement
 */
const initializePayment = async ({
  amount,
  transactionId,
  description,
  customerName,
  customerEmail,
  customerPhone,
  metadata = {},
}) => {
  try {
    const payload = {
      apikey: config.cinetpay.apiKey,
      site_id: config.cinetpay.siteId,
      transaction_id: transactionId,
      amount: Math.round(amount), // CinetPay n'accepte que les entiers
      currency: config.cinetpay.currency,
      description: description.substring(0, 255), // Max 255 caractères
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone_number: customerPhone,
      customer_address: 'Lomé, Togo',
      customer_city: 'Lomé',
      customer_country: 'TG',
      customer_state: 'Maritime',
      customer_zip_code: '00228',
      notify_url: config.cinetpay.notifyUrl,
      return_url: config.cinetpay.returnUrl,
      cancel_url: config.cinetpay.cancelUrl,
      channels: config.cinetpay.channels,
      lang: config.cinetpay.lang,
      metadata: JSON.stringify({
        ...config.cinetpay.metadata,
        ...metadata,
      }),
    };

    console.log('📤 Initialisation paiement CinetPay:', {
      transactionId,
      amount,
      customer: customerEmail,
    });

    const response = await cinetpayClient.post('/payment', payload);

    if (response.data.code === '201') {
      console.log('✅ Paiement initialisé:', response.data.data.payment_url);
      return {
        success: true,
        paymentUrl: response.data.data.payment_url,
        paymentToken: response.data.data.payment_token,
        transactionId,
        data: response.data,
      };
    } else {
      console.error('❌ Erreur CinetPay:', response.data);
      return {
        success: false,
        error: response.data.message || 'Erreur initialisation paiement',
        code: response.data.code,
        data: response.data,
      };
    }
  } catch (error) {
    console.error('❌ Erreur API CinetPay:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      code: error.response?.status,
    };
  }
};

/**
 * Vérifier le statut d'un paiement
 * @param {string} transactionId - ID de transaction
 * @param {string} siteId - Site ID (optionnel)
 * @returns {Object} Statut du paiement
 */
const checkPaymentStatus = async (transactionId, siteId = null) => {
  try {
    const payload = {
      apikey: config.cinetpay.apiKey,
      site_id: siteId || config.cinetpay.siteId,
      transaction_id: transactionId,
    };

    const response = await cinetpayClient.post('/payment/check', payload);

    console.log('📋 Vérification paiement:', {
      transactionId,
      status: response.data.data?.status,
    });

    return {
      success: true,
      status: response.data.data?.status,
      amount: response.data.data?.amount,
      currency: response.data.data?.currency,
      paymentMethod: response.data.data?.payment_method,
      paymentDate: response.data.data?.payment_date,
      data: response.data.data,
    };
  } catch (error) {
    console.error('❌ Erreur vérification paiement:', error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

/**
 * Valider la signature du webhook CinetPay
 * @param {Object} payload - Corps de la requête webhook
 * @param {string} signature - Signature reçue
 * @returns {boolean} Signature valide ou non
 */
const validateWebhookSignature = (payload, signature, rawBody = null) => {
  try {
    // CinetPay utilise une signature HMAC SHA256.
    // En production, on doit signer le payload EXACT reçu (raw body) pour éviter les divergences.
    const bodyToSign = rawBody
      ? (Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody))
      : JSON.stringify(payload);

    const expectedSignature = crypto
      .createHmac('sha256', config.cinetpay.secretKey)
      .update(bodyToSign)
      .digest('hex');

    const sig = (signature || '').trim();

    // Éviter timingSafeEqual si longueurs différentes (sinon exception)
    if (!sig || sig.length !== expectedSignature.length) {
      return false;
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(sig, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );

    return isValid;
  } catch (error) {
    console.error('❌ Erreur validation signature:', error.message);
    return false;
  }
};

/**
 * Parser les données du webhook
 * @param {Object} body - Corps de la requête
 * @returns {Object} Données parsées
 */
const parseWebhookData = (body = {}) => {
  const transactionId = body.cpm_trans_id || body.transaction_id || body.cpm_transid;

  const prefix = body.cpm_phone_prefixe || body.phone_prefixe || '';
  const phone = body.cel_phone_num || body.customer_phone_number || body.cpm_phone || '';

  return {
    transactionId,
    cinetpayTransactionId: transactionId,
    paymentId: body.cpm_payment_id || body.cpm_payid || body.payment_id,
    siteId: body.cpm_site_id || body.site_id,
    amount: body.cpm_amount !== undefined ? parseFloat(body.cpm_amount) : undefined,
    currency: body.cpm_currency || body.currency,
    phoneNumber: (prefix || '') + (phone || ''),
    paymentMethod: body.payment_method || body.cpm_payment_method,
    paymentDate: body.cpm_payment_date || body.payment_date,
    status: body.cpm_result || body.status,
    errorMessage: body.cpm_error_message || body.error_message,
    signature: body.signature || body.cpm_signature,
    rawData: body,
  };
};

/**
 * Statuts de paiement CinetPay
 */
const PaymentStatus = {
  ACCEPTED: '00', // Paiement réussi
  PENDING: '600', // En attente
  REFUSED: '602', // Refusé
  CANCELLED: '603', // Annulé par l'utilisateur
  FAILED: '604', // Échec technique
  EXPIRED: '605', // Expiré
};

/**
 * Vérifier si le paiement est réussi
 */
const isPaymentSuccessful = (status) => {
  if (!status) return false;
  const s = String(status).toUpperCase();
  return (
    s === '00' ||
    s === PaymentStatus.ACCEPTED ||
    s === 'ACCEPTED' ||
    s === 'SUCCESS' ||
    s === 'SUCCEEDED' ||
    s === 'COMPLETED'
  );
};

/**
 * Obtenir le message de statut
 */
const getStatusMessage = (status) => {
  const messages = {
    '00': 'Paiement réussi',
    '600': 'Paiement en attente',
    '602': 'Paiement refusé',
    '603': 'Paiement annulé',
    '604': 'Échec technique',
    '605': 'Paiement expiré',
  };
  return messages[status] || 'Statut inconnu';
};

/**
 * Vérifier si CinetPay est configuré
 */
const isConfigured = () => {
  return !!(
    config.cinetpay.siteId &&
    config.cinetpay.apiKey &&
    config.cinetpay.secretKey
  );
};

/**
 * Mode sandbox/demo
 */
const isSandbox = () => {
  return config.env !== 'production';
};

module.exports = {
  cinetpayClient,
  generateTransactionId,
  initializePayment,
  checkPaymentStatus,
  validateWebhookSignature,
  parseWebhookData,
  PaymentStatus,
  isPaymentSuccessful,
  getStatusMessage,
  isConfigured,
  isSandbox,
};
