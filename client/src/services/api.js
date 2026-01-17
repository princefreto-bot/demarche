/**
 * Configuration Axios - ImmoLomé
 * Client HTTP avec intercepteurs pour auth et erreurs
 */

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Créer l'instance Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Pour les cookies
});

// ============================================
// INTERCEPTEUR REQUÊTE
// ============================================

api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'accès si présent
    const token = useAuthStore.getState().accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTEUR RÉPONSE
// ============================================

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà en train de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Attendre que le refresh soit terminé
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tenter de rafraîchir le token
        const response = await api.post('/auth/refresh');
        const { accessToken } = response.data.data;

        // Mettre à jour le store
        useAuthStore.getState().setAccessToken(accessToken);

        // Réessayer les requêtes en attente
        processQueue(null, accessToken);

        // Réessayer la requête originale
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh échoué, déconnecter
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        
        // Rediriger vers login si nécessaire
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Formater l'erreur
    const formattedError = {
      message: error.response?.data?.message || 'Une erreur est survenue',
      status: error.response?.status,
      code: error.response?.data?.code,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(formattedError);
  }
);

export default api;

// ============================================
// HELPERS
// ============================================

/**
 * Effectuer une requête GET
 */
export const get = async (url, params = {}) => {
  const response = await api.get(url, { params });
  return response.data;
};

/**
 * Effectuer une requête POST
 */
export const post = async (url, data = {}) => {
  const response = await api.post(url, data);
  return response.data;
};

/**
 * Effectuer une requête PUT
 */
export const put = async (url, data = {}) => {
  const response = await api.put(url, data);
  return response.data;
};

/**
 * Effectuer une requête DELETE
 */
export const del = async (url) => {
  const response = await api.delete(url);
  return response.data;
};

/**
 * Upload de fichiers
 */
export const upload = async (url, formData, onProgress) => {
  const response = await api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};
