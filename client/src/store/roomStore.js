/**
 * Store Chambres - ImmoLomé
 * Gestion d'état des chambres avec Zustand
 */

import { create } from 'zustand';
import roomService from '@/services/roomService';

export const useRoomStore = create((set, get) => ({
  // ============================================
  // STATE
  // ============================================
  rooms: [],
  currentRoom: null,
  myRooms: [],
  
  // Pagination
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
  
  // Filtres
  filters: {
    quartier: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    furnished: undefined,
    sort: '-createdAt',
  },
  
  // UI State
  isLoading: false,
  error: null,

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Récupérer les chambres disponibles
   */
  fetchRooms: async (resetPage = false) => {
    set({ isLoading: true, error: null });
    
    try {
      const { filters, pagination } = get();
      
      // Construire les params
      const params = {
        page: resetPage ? 1 : pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      
      // Nettoyer les params vides
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await roomService.getRooms(params);
      
      set({
        rooms: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
      
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  /**
   * Récupérer une chambre par ID
   */
  fetchRoomById: async (id) => {
    set({ isLoading: true, error: null, currentRoom: null });
    
    try {
      const response = await roomService.getRoomById(id);
      
      set({
        currentRoom: response.data.room,
        isLoading: false,
      });
      
      return response.data.room;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  /**
   * Rechercher des chambres
   */
  searchRooms: async (query) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await roomService.searchRooms(query);
      
      set({
        rooms: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
      
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  /**
   * Récupérer mes chambres (propriétaire)
   */
  fetchMyRooms: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await roomService.getMyRooms();
      
      set({
        myRooms: response.data,
        isLoading: false,
      });
      
      return response;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  /**
   * Mettre à jour les filtres
   */
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  /**
   * Réinitialiser les filtres
   */
  resetFilters: () => {
    set({
      filters: {
        quartier: '',
        type: '',
        minPrice: '',
        maxPrice: '',
        furnished: undefined,
        sort: '-createdAt',
      },
    });
  },

  /**
   * Changer de page
   */
  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
  },

  /**
   * Effacer la chambre courante
   */
  clearCurrentRoom: () => {
    set({ currentRoom: null });
  },

  /**
   * Effacer les erreurs
   */
  clearError: () => {
    set({ error: null });
  },
}));
