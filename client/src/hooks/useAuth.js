/**
 * Hook Authentification - ImmoLomé
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook principal d'authentification
 */
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    fetchUser: store.fetchUser,
    hasRole: store.hasRole,
    isAdmin: store.isAdmin,
    isOwner: store.isOwner,
    clearError: store.clearError,
  };
};

/**
 * Hook pour protéger une route
 * Redirige vers login si non authentifié
 */
export const useRequireAuth = (redirectTo = '/login') => {
  const { isAuthenticated, isLoading, fetchUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Vérifier l'authentification au montage
    if (!isAuthenticated && !isLoading) {
      fetchUser();
    }
  }, []);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Sauvegarder l'URL courante pour redirection après login
      navigate(redirectTo, {
        state: { from: location.pathname },
        replace: true,
      });
    }
  }, [isAuthenticated, isLoading, navigate, location, redirectTo]);
  
  return { isAuthenticated, isLoading };
};

/**
 * Hook pour protéger une route par rôle
 */
export const useRequireRole = (roles, redirectTo = '/') => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const hasPermission = allowedRoles.some((role) => hasRole(role));
      
      if (!hasPermission) {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, roles, hasRole, navigate, redirectTo]);
  
  return { isAuthenticated, isLoading };
};

/**
 * Hook pour rediriger si déjà authentifié
 * Utile pour les pages login/register
 */
export const useRedirectIfAuth = (redirectTo = '/') => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Rediriger vers la page précédente ou la page par défaut
      const from = location.state?.from || redirectTo;
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location, redirectTo]);
  
  return { isAuthenticated, isLoading };
};

export default useAuth;
