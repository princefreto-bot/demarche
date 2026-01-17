/**
 * Application principale - ImmoLomé
 */

import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Components
import Loader from '@/components/ui/Loader';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Pages - Chargement différé pour optimisation
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const RoomsListPage = lazy(() => import('@/pages/public/RoomsListPage'));
const RoomDetailPage = lazy(() => import('@/pages/public/RoomDetailPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

// User pages
const UserDashboard = lazy(() => import('@/pages/user/DashboardPage'));
const MyContactsPage = lazy(() => import('@/pages/user/MyContactsPage'));
const ContactDetailPage = lazy(() => import('@/pages/user/ContactDetailPage'));
const PaymentHistoryPage = lazy(() => import('@/pages/user/PaymentHistoryPage'));
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage'));

// Owner pages
const OwnerDashboard = lazy(() => import('@/pages/owner/OwnerDashboard'));
const MyRoomsPage = lazy(() => import('@/pages/owner/MyRoomsPage'));
const AddRoomPage = lazy(() => import('@/pages/owner/AddRoomPage'));
const EditRoomPage = lazy(() => import('@/pages/owner/EditRoomPage'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const ManageRoomsPage = lazy(() => import('@/pages/admin/ManageRoomsPage'));
const ManageUsersPage = lazy(() => import('@/pages/admin/ManageUsersPage'));
const ManagePaymentsPage = lazy(() => import('@/pages/admin/ManagePaymentsPage'));
const ManageContactsPage = lazy(() => import('@/pages/admin/ManageContactsPage'));
const ManageLogsPage = lazy(() => import('@/pages/admin/ManageLogsPage'));

// Payment pages
const PaymentPage = lazy(() => import('@/pages/payment/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('@/pages/payment/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('@/pages/payment/PaymentCancelPage'));

// Error pages
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));

/**
 * Composant de chargement
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader size="lg" />
  </div>
);

/**
 * Application
 */
function App() {
  const { fetchUser, accessToken } = useAuthStore();

  // Récupérer l'utilisateur au démarrage si un token existe
  useEffect(() => {
    if (accessToken) {
      fetchUser();
    }
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ============================================ */}
        {/* ROUTES PUBLIQUES */}
        {/* ============================================ */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chambres" element={<RoomsListPage />} />
          <Route path="/chambres/:id" element={<RoomDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* ============================================ */}
        {/* ROUTES AUTHENTIFICATION */}
        {/* ============================================ */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ============================================ */}
        {/* ROUTES PAIEMENT */}
        {/* ============================================ */}
        <Route element={<MainLayout />}>
          <Route 
            path="/payment/:roomId" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        </Route>

        {/* ============================================ */}
        {/* ROUTES UTILISATEUR */}
        {/* ============================================ */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="contacts" element={<MyContactsPage />} />
          <Route path="contacts/:id" element={<ContactDetailPage />} />
          <Route path="payments" element={<PaymentHistoryPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* ============================================ */}
        {/* ROUTES PROPRIÉTAIRE */}
        {/* ============================================ */}
        <Route 
          path="/owner" 
          element={
            <ProtectedRoute allowedRoles={['owner', 'admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OwnerDashboard />} />
          <Route path="rooms" element={<MyRoomsPage />} />
          <Route path="rooms/new" element={<AddRoomPage />} />
          <Route path="rooms/:id/edit" element={<EditRoomPage />} />
        </Route>

        {/* ============================================ */}
        {/* ROUTES ADMIN */}
        {/* ============================================ */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout isAdmin />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<ManageRoomsPage />} />
          <Route path="users" element={<ManageUsersPage />} />
          <Route path="payments" element={<ManagePaymentsPage />} />
          <Route path="contacts" element={<ManageContactsPage />} />
          <Route path="logs" element={<ManageLogsPage />} />
        </Route>

        {/* ============================================ */}
        {/* ROUTES ERREUR */}
        {/* ============================================ */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
