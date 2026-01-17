/**
 * Page Paiement Annulé - ImmoLomé
 */

import { Link, useSearchParams } from 'react-router-dom';
import { XCircleIcon, ArrowPathIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const cancelled = searchParams.get('cancelled');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircleIcon className="w-10 h-10 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement annulé
          </h1>
          <p className="text-gray-600 mb-6">
            Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
          </p>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-medium text-yellow-800 mb-2">
              Pourquoi le paiement a-t-il été annulé ?
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Vous avez annulé l'opération</li>
              <li>• Délai d'attente dépassé</li>
              <li>• Solde insuffisant</li>
              <li>• Erreur technique temporaire</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full"
            >
              <Button fullWidth icon={ArrowPathIcon}>
                Réessayer le paiement
              </Button>
            </button>
            
            <Link to="/chambres">
              <Button variant="outline" fullWidth>
                Retour aux chambres
              </Button>
            </Link>
          </div>

          {/* Help */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3">
              Un problème avec le paiement ?
            </p>
            <Link 
              to="/contact"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Contactez notre support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
