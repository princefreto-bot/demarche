/**
 * Layout Principal - ImmoLomé
 * Wrapper pour les pages publiques
 */

import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useUIStore } from '@/store/uiStore';
import { FullPageLoader } from '@/components/ui/Loader';

export default function MainLayout() {
  const { isGlobalLoading, loadingMessage } = useUIStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Loading Overlay */}
      {isGlobalLoading && <FullPageLoader text={loadingMessage} />}

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
