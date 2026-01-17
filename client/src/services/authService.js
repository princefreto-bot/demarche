/**
 * Service Authentification - ImmoLomé
 */

import api, { post, get } from './api';

const authService = {
  /**
   * Inscription
   */
  register: async (data) => {
    return post('/auth/register', data);
  },

  /**
   * Connexion
   */
  login: async (email, password) => {
    return post('/auth/login', { email, password });
  },

  /**
   * Déconnexion
   */
  logout: async () => {
    return post('/auth/logout');
  },

  /**
   * Rafraîchir le token
   */
  refreshToken: async () => {
    return post('/auth/refresh');
  },

  /**
   * Obtenir le profil
   */
  getMe: async () => {
    return get('/auth/me');
  },

  /**
   * Demander réinitialisation mot de passe
   */
  forgotPassword: async (email) => {
    return post('/auth/forgot-password', { email });
  },

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword: async (token, password) => {
    return post('/auth/reset-password', { token, password });
  },

  /**
   * Changer le mot de passe
   */
  changePassword: async (currentPassword, newPassword) => {
    return post('/auth/change-password', { currentPassword, newPassword });
  },
};

export default authService;
