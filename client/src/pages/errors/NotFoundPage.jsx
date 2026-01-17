/**
 * Page 404 - ImmoLomé
 */

import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <span className="text-9xl">🏠</span>
          <div className="text-6xl font-bold text-gray-200 mt-4">404</div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page introuvable
        </h1>
        <p className="text-gray-600 mb-8">
          Oups ! La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Retour
          </button>
          <Link to="/">
            <Button size="lg" icon={HomeIcon}>
              Accueil
            </Button>
          </Link>
        </div>

        {/* Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Vous cherchez peut-être :</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/chambres" className="text-primary-600 hover:underline text-sm">
              Voir les chambres
            </Link>
            <Link to="/contact" className="text-primary-600 hover:underline text-sm">
              Nous contacter
            </Link>
            <Link to="/login" className="text-primary-600 hover:underline text-sm">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
