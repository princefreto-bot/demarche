/**
 * Composant ProtectedRoute - ImmoLomé
 * Protection des routes par authentification et rôle
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { FullPageLoader } from '@/components/ui/Loader';

export default function ProtectedRoute({ 
  children, 
  allowedRoles = null,
  redirectTo = '/login' 
}) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Afficher le loader pendant la vérification
  if (isLoading) {
    return <FullPageLoader text="Vérification..." />;
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Vérifier les rôles si spécifiés
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = allowedRoles.includes(user?.role);
    
    if (!hasRole) {
      // Rediriger vers la page appropriée selon le rôle
      if (user?.role === 'admin') {
        return <Navigate to="/admin" replace />;
      }
      if (user?.role === 'owner') {
        return <Navigate to="/owner" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

/**
 * HOC pour protéger un composant
 */
export function withAuth(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
