/**
 * Store UI - ImmoLomé
 * Gestion de l'état de l'interface utilisateur
 */

import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  // ============================================
  // STATE
  // ============================================
  
  // Mobile menu
  isMobileMenuOpen: false,
  
  // Modal
  modal: {
    isOpen: false,
    type: null, // 'login', 'register', 'contact', 'payment', etc.
    data: null,
  },
  
  // Sidebar (admin/owner dashboard)
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  
  // Loading overlay
  isGlobalLoading: false,
  loadingMessage: '',
  
  // Notifications
  notifications: [],
  
  // Theme
  theme: 'light',

  // ============================================
  // ACTIONS
  // ============================================

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu: () => {
    set((state) => ({
      isMobileMenuOpen: !state.isMobileMenuOpen,
    }));
  },

  /**
   * Fermer mobile menu
   */
  closeMobileMenu: () => {
    set({ isMobileMenuOpen: false });
  },

  /**
   * Ouvrir un modal
   */
  openModal: (type, data = null) => {
    set({
      modal: {
        isOpen: true,
        type,
        data,
      },
    });
  },

  /**
   * Fermer le modal
   */
  closeModal: () => {
    set({
      modal: {
        isOpen: false,
        type: null,
        data: null,
      },
    });
  },

  /**
   * Toggle sidebar
   */
  toggleSidebar: () => {
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    }));
  },

  /**
   * Collapse/expand sidebar
   */
  toggleSidebarCollapse: () => {
    set((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed,
    }));
  },

  /**
   * Afficher loading global
   */
  showLoading: (message = '') => {
    set({
      isGlobalLoading: true,
      loadingMessage: message,
    });
  },

  /**
   * Cacher loading global
   */
  hideLoading: () => {
    set({
      isGlobalLoading: false,
      loadingMessage: '',
    });
  },

  /**
   * Ajouter une notification
   */
  addNotification: (notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      ...notification,
      createdAt: new Date(),
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
    
    // Auto-remove après 5 secondes
    if (notification.autoClose !== false) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration || 5000);
    }
    
    return id;
  },

  /**
   * Supprimer une notification
   */
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  /**
   * Effacer toutes les notifications
   */
  clearNotifications: () => {
    set({ notifications: [] });
  },

  /**
   * Toggle theme
   */
  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    }));
  },
}));
