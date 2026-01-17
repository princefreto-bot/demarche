/**
 * Service Paiements - ImmoLomé
 * Intégration CinetPay
 */

import { get, post } from './api';

const paymentService = {
  /**
   * Initier un paiement pour contacter
   * @param {string} roomId - ID de la chambre
   * @param {string} message - Message de contact
   */
  initiatePayment: async (roomId, message) => {
    return post('/payments/initiate', { roomId, message });
  },

  /**
   * Vérifier le statut d'un paiement
   * @param {string} paymentId - ID du paiement
   */
  getPaymentStatus: async (paymentId) => {
    return get(`/payments/${paymentId}/status`);
  },

  /**
   * Obtenir un paiement par référence
   * @param {string} reference - Référence du paiement
   */
  getPaymentByReference: async (reference) => {
    return get(`/payments/reference/${reference}`);
  },

  /**
   * Obtenir l'historique de mes paiements
   */
  getMyPayments: async () => {
    return get('/payments/my-payments');
  },

  /**
   * Obtenir les frais de contact actuels
   */
  getContactFee: () => {
    // Frais de contact en FCFA
    return 1000;
  },

  /**
   * Formater le prix
   */
  formatPrice: (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  },
};

export default paymentService;
