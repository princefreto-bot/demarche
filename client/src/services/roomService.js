/**
 * Service Chambres - ImmoLomé
 */

import { get, post, put, del, upload } from './api';

const roomService = {
  /**
   * Lister les chambres disponibles
   */
  getRooms: async (params = {}) => {
    return get('/rooms', params);
  },

  /**
   * Rechercher des chambres
   */
  searchRooms: async (query, params = {}) => {
    return get('/rooms/search', { q: query, ...params });
  },

  /**
   * Obtenir une chambre par ID
   */
  getRoomById: async (id) => {
    return get(`/rooms/${id}`);
  },

  /**
   * Obtenir mes chambres (propriétaire)
   */
  getMyRooms: async (params = {}) => {
    return get('/rooms/owner/my-rooms', params);
  },

  /**
   * Créer une chambre
   */
  createRoom: async (data) => {
    return post('/rooms', data);
  },

  /**
   * Modifier une chambre
   */
  updateRoom: async (id, data) => {
    return put(`/rooms/${id}`, data);
  },

  /**
   * Supprimer une chambre
   */
  deleteRoom: async (id) => {
    return del(`/rooms/${id}`);
  },

  /**
   * Soumettre pour validation
   */
  submitRoom: async (id) => {
    return post(`/rooms/${id}/submit`);
  },

  /**
   * Ajouter des photos
   */
  addPhotos: async (id, files, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });
    return upload(`/rooms/${id}/photos`, formData, onProgress);
  },

  /**
   * Supprimer une photo
   */
  deletePhoto: async (roomId, photoId) => {
    return del(`/rooms/${roomId}/photos/${photoId}`);
  },

  /**
   * Obtenir les quartiers disponibles (pour filtres)
   */
  getQuartiers: async () => {
    // À implémenter côté backend si nécessaire
    return {
      data: [
        'Bè',
        'Tokoin',
        'Adidogomé',
        'Agoè',
        'Kégué',
        'Nyékonakpoè',
        'Hédzranawoé',
        'Amadahomé',
        'Djidjolé',
        'Akodessewa',
        'Baguida',
        'Aflao-Gakli',
      ],
    };
  },

  /**
   * Obtenir les types de logement
   */
  getRoomTypes: () => {
    return [
      { value: 'chambre_simple', label: 'Chambre simple' },
      { value: 'chambre_salon', label: 'Chambre salon' },
      { value: 'appartement', label: 'Appartement' },
      { value: 'studio', label: 'Studio' },
      { value: 'maison', label: 'Maison' },
      { value: 'villa', label: 'Villa' },
    ];
  },
};

export default roomService;
