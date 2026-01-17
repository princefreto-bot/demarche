/**
 * Store Authentification - ImmoLomé
 * Gestion d'état avec Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import authService from '@/services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ============================================
      // STATE
      // ============================================
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ============================================
      // ACTIONS
      // ============================================

      /**
       * Mettre à jour le token d'accès
       */
      setAccessToken: (token) => {
        set({ accessToken: token });
      },

      /**
       * Inscription
       */
      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(data);
          const { user, accessToken } = response.data;
          
          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });
          return { success: false, error: error.message };
        }
      },

      /**
       * Connexion
       */
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(email, password);
          const { user, accessToken } = response.data;
          
          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true };
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });
          return { success: false, error: error.message };
        }
      },

      /**
       * Déconnexion
       */
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      /**
       * Récupérer le profil utilisateur
       */
      fetchUser: async () => {
        if (!get().accessToken) return;
        
        set({ isLoading: true });
        
        try {
          const response = await authService.getMe();
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      /**
       * Mettre à jour le profil local
       */
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      /**
       * Effacer les erreurs
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Vérifier si l'utilisateur a un rôle
       */
      hasRole: (role) => {
        const user = get().user;
        if (!user) return false;
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        return user.role === role;
      },

      /**
       * Vérifier si admin
       */
      isAdmin: () => {
        return get().user?.role === 'admin';
      },

      /**
       * Vérifier si propriétaire
       */
      isOwner: () => {
        return ['owner', 'admin'].includes(get().user?.role);
      },
    }),
    {
      name: 'immolome-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
