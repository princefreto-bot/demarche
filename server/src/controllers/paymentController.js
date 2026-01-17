/**
 * Contrôleur Paiements - ImmoLomé
 * Intégration CinetPay pour les frais de contact
 */

const { Payment, Contact, Room, User, Log } = require('../models');
const { success } = require('../utils/response');
const { asyncHandler, Errors } = require('../middlewares/errorHandler');
const { generateId } = require('../utils/helpers');
const config = require('../config/env');
const cinetpay = require('../config/cinetpay');

/**
 * @desc    Initier un paiement pour contacter une chambre
 * @route   POST /api/v1/payments/initiate
 * @access  Private (User)
 */
const initiatePayment = asyncHandler(async (req, res) => {
  const { roomId, message } = req.body;

  const room = await Room.findById(roomId).populate('owner', 'firstName lastName');
  if (!room) throw Errors.NotFound('Chambre');
  if (!room.isPubliclyVisible()) throw Errors.BadRequest('Cette chambre n\'est plus disponible');

  const existingContact = await Contact.findOne({ user: req.user._id, room: roomId });
  if (existingContact) throw Errors.Conflict('Vous avez déjà contacté pour cette chambre');

  const reference = `PAY-${Date.now().toString(36).toUpperCase()}-${generateId().slice(0, 6).toUpperCase()}`;
  const amount = config.fees.contactFee;

  const payment = await Payment.create({
    user: req.user._id,
    room: roomId,
    reference,
    type: 'contact_fee',
    amount,
    currency: 'XOF',
    status: 'pending',
    customerInfo: {
      name: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
    },
    productInfo: {
      description: `Frais de contact - ${room.title}`,
      roomTitle: room.title,
      quartier: room.location.quartier,
    },
    metadata: {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      platform: 'web',
      message,
    },
  });

  const cinetpayResult = await cinetpay.initializePayment({
    amount,
    transactionId: reference,
    description: `ImmoLomé - Contact pour: ${room.title}`,
    customerName: req.user.fullName,
    customerEmail: req.user.email,
    customerPhone: req.user.phone,
    metadata: {
      paymentId: payment._id.toString(),
      roomId,
      userId: req.user._id.toString(),
    },
  });

  if (!cinetpayResult.success) {
    payment.status = 'failed';
    payment.failureReason = cinetpayResult.error;
    await payment.save();
    throw Errors.PaymentError(cinetpayResult.error || 'Erreur d\'initialisation du paiement');
  }

  payment.cinetpayTransactionId = reference;
  payment.cinetpay.paymentUrl = cinetpayResult.paymentUrl;
  payment.cinetpay.paymentToken = cinetpayResult.paymentToken;
  payment.cinetpay.initResponse = cinetpayResult.data;
  payment.status = 'processing';
  await payment.save();

  await Log.info('payment.initiated', `Paiement initié: ${reference}`, {
    actor: { user: req.user._id, role: req.user.role },
    target: { type: 'payment', id: payment._id, reference },
    data: { amount, roomId, roomTitle: room.title },
  });

  success(
    res,
    {
      payment: {
        id: payment._id,
        reference: payment.reference,
        amount: payment.amount,
        status: payment.status,
      },
      paymentUrl: cinetpayResult.paymentUrl,
    },
    'Paiement initié - Redirection vers CinetPay'
  );
});

/**
 * Créer le contact après paiement réussi (idempotent)
 */
const createContactAfterPayment = async (payment) => {
  const [room, user] = await Promise.all([
    Room.findById(payment.room),
    User.findById(payment.user),
  ]);

  if (!room || !user) {
    console.error('Room ou User non trouvé pour créer le contact');
    return;
  }

  // Idempotence: si déjà lié, on stop
  if (payment.contact) return;

  try {
    const contact = await Contact.create({
      user: user._id,
      room: room._id,
      payment: payment._id,
      amountPaid: payment.amount,
      message: {
        content: payment.metadata?.message || 'Demande de contact',
        sentAt: new Date(),
      },
      userInfo: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
      roomInfo: {
        title: room.title,
        quartier: room.location.quartier,
        monthlyRent: room.pricing.monthlyRent,
        mainPhoto: room.mainPhoto,
      },
      status: 'pending',
      priority: 'normal',
    });

    payment.contact = contact._id;
    await payment.save();

    room.stats.contactRequests += 1;
    if (room.status === 'available') room.status = 'processing';
    await room.save();

    user.stats.totalContacts += 1;
    user.stats.totalPayments += 1;
    user.stats.totalSpent += payment.amount;
    await user.save();

    await Log.info('contact.created', `Contact créé après paiement: ${contact.reference}`, {
      actor: { user: user._id },
      target: { type: 'contact', id: contact._id, reference: contact.reference },
      data: { roomId: room._id, paymentId: payment._id },
    });
  } catch (err) {
    // Index unique (user, room) => éviter crash en cas de double webhook
    if (err?.code === 11000) {
      return;
    }
    throw err;
  }
};

/**
 * @desc    Webhook CinetPay
 * @route   POST /api/v1/payments/webhook
 * @access  Public (CinetPay)
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const webhookData = cinetpay.parseWebhookData(req.body);

  await Log.info('payment.webhook_received', `Webhook reçu: ${webhookData.transactionId}`, {
    actor: { ipAddress: req.ip },
    data: { webhookData },
  });

  if (!webhookData.transactionId) {
    return res.status(200).json({ message: 'OK' });
  }

  const payment = await Payment.findOne({ reference: webhookData.transactionId });
  if (!payment) {
    return res.status(200).json({ message: 'OK' });
  }

  // Idempotence: si déjà complété, répondre 200 rapidement
  if (payment.status === 'completed') {
    return res.status(200).json({ message: 'OK' });
  }

  // Signature: accepter header ou body
  const signature =
    req.get('x-cinetpay-signature') ||
    req.get('x-signature') ||
    webhookData.signature;

  const signatureValid = cinetpay.validateWebhookSignature(req.body, signature, req.rawBody);

  await payment.recordWebhook(webhookData.rawData, req.ip, signature, signatureValid);

  // Vérification serveur (source de vérité)
  const verification = await cinetpay.checkPaymentStatus(webhookData.transactionId);
  payment.cinetpay.verificationData = verification.data;

  const isSuccess =
    cinetpay.isPaymentSuccessful(webhookData.status) ||
    (verification.success && cinetpay.isPaymentSuccessful(verification.status));

  if (isSuccess) {
    await payment.markAsCompleted(webhookData.rawData);
    await createContactAfterPayment(payment);

    await Log.info('payment.completed', `Paiement réussi: ${payment.reference}`, {
      target: { type: 'payment', id: payment._id },
      data: { amount: payment.amount },
    });
  } else {
    await payment.markAsFailed(
      cinetpay.getStatusMessage(webhookData.status || verification.status),
      webhookData.status || verification.status
    );

    await Log.warn('payment.failed', `Paiement échoué: ${payment.reference}`, {
      target: { type: 'payment', id: payment._id },
      data: { status: webhookData.status, error: webhookData.errorMessage },
    });
  }

  return res.status(200).json({ message: 'OK' });
});

/**
 * @desc    Vérifier le statut d'un paiement
 * @route   GET /api/v1/payments/:id/status
 * @access  Private
 */
const getPaymentStatus = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('room', 'title location.quartier')
    .populate('contact');

  if (!payment) throw Errors.NotFound('Paiement');

  if (req.user.role !== 'admin' && !payment.user.equals(req.user._id)) {
    throw Errors.Forbidden('Accès non autorisé');
  }

  if (payment.status === 'processing') {
    const verification = await cinetpay.checkPaymentStatus(payment.reference);

    if (verification.success && cinetpay.isPaymentSuccessful(verification.status)) {
      await payment.markAsCompleted(verification.data);

      if (!payment.contact) {
        await createContactAfterPayment(payment);
        await payment.populate('contact');
      }
    }
  }

  success(res, {
    payment: {
      id: payment._id,
      reference: payment.reference,
      amount: payment.amount,
      status: payment.status,
      type: payment.type,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      room: payment.room,
      contact: payment.contact
        ? {
            id: payment.contact._id,
            reference: payment.contact.reference,
            status: payment.contact.status,
          }
        : null,
    },
  });
});

/**
 * @desc    Obtenir mes paiements
 * @route   GET /api/v1/payments/my-payments
 * @access  Private
 */
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate('room', 'title location.quartier pricing.monthlyRent')
    .sort({ createdAt: -1 })
    .limit(50);

  success(res, { payments });
});

/**
 * @desc    Obtenir un paiement par référence
 * @route   GET /api/v1/payments/reference/:reference
 * @access  Private
 */
const getPaymentByReference = asyncHandler(async (req, res) => {
  const payment = await Payment.findByReference(req.params.reference);
  if (!payment) throw Errors.NotFound('Paiement');

  if (req.user.role !== 'admin' && !payment.user._id.equals(req.user._id)) {
    throw Errors.Forbidden('Accès non autorisé');
  }

  success(res, { payment });
});

/**
 * @desc    Page de retour après paiement
 * @route   GET /api/v1/payments/return
 * @access  Public
 */
const handleReturn = asyncHandler(async (req, res) => {
  const transactionId = req.query.transaction_id || req.query.cpm_trans_id || req.query.transactionId;

  if (!transactionId) {
    return res.redirect(`${config.cinetpay.returnUrl}?error=missing_transaction`);
  }

  const payment = await Payment.findOne({ reference: transactionId });

  if (!payment) {
    return res.redirect(`${config.cinetpay.returnUrl}?error=payment_not_found`);
  }

  const redirectUrl = `${config.cinetpay.returnUrl}?payment=${payment._id}&status=${payment.status}`;
  return res.redirect(redirectUrl);
});

/**
 * @desc    Page d'annulation de paiement
 * @route   GET /api/v1/payments/cancel
 * @access  Public
 */
const handleCancel = asyncHandler(async (req, res) => {
  const transactionId = req.query.transaction_id || req.query.cpm_trans_id || req.query.transactionId;

  if (transactionId) {
    const payment = await Payment.findOne({ reference: transactionId });
    if (payment && payment.status === 'processing') {
      payment.status = 'cancelled';
      await payment.save();

      await Log.info('payment.cancelled', `Paiement annulé: ${transactionId}`, {
        target: { type: 'payment', id: payment._id },
      });
    }
  }

  return res.redirect(`${config.cinetpay.cancelUrl}?cancelled=true`);
});

module.exports = {
  initiatePayment,
  handleWebhook,
  getPaymentStatus,
  getMyPayments,
  getPaymentByReference,
  handleReturn,
  handleCancel,
};
