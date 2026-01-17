/**
 * Service Contacts - ImmoLomé
 */

import { get, post } from './api';

const contactService = {
  /**
   * Obtenir mes demandes de contact
   */
  getMyContacts: async (params = {}) => {
    return get('/contacts/my-contacts', params);
  },

  /**
   * Obtenir une demande par ID
   */
  getContactById: async (id) => {
    return get(`/contacts/${id}`);
  },

  /**
   * Obtenir la timeline d'une demande
   */
  getContactTimeline: async (id) => {
    return get(`/contacts/${id}/timeline`);
  },

  /**
   * Annuler une demande
   */
  cancelContact: async (id) => {
    return post(`/contacts/${id}/cancel`);
  },

  /**
   * Ajouter un feedback
   */
  addFeedback: async (id, rating, feedback) => {
    return post(`/contacts/${id}/feedback`, { rating, feedback });
  },

  /**
   * Labels des statuts
   */
  getStatusLabel: (status) => {
    const labels = {
      pending: 'En attente',
      processing: 'En cours de traitement',
      contacted: 'Propriétaire contacté',
      visit_scheduled: 'Visite programmée',
      visited: 'Visite effectuée',
      negotiating: 'En négociation',
      successful: 'Location confirmée',
      cancelled: 'Annulée',
      failed: 'Non abouti',
    };
    return labels[status] || status;
  },

  /**
   * Couleurs des statuts
   */
  getStatusColor: (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      contacted: 'bg-indigo-100 text-indigo-800',
      visit_scheduled: 'bg-purple-100 text-purple-800',
      visited: 'bg-cyan-100 text-cyan-800',
      negotiating: 'bg-orange-100 text-orange-800',
      successful: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },
};

export default contactService;
