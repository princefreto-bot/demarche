/**
 * Page Paiement Réussi - ImmoLomé
 */

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, PhoneIcon } from '@heroicons/react/24/outline';
import paymentService from '@/services/paymentService';
import Button from '@/components/ui/Button';
import { FullPageLoader } from '@/components/ui/Loader';
import { formatPrice } from '@/utils/formatters';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const paymentId = searchParams.get('payment');
  const status = searchParams.get('status');

  useEffect(() => {
    const fetchPayment = async () => {
      if (paymentId) {
        try {
          const response = await paymentService.getPaymentStatus(paymentId);
          setPayment(response.data.payment);
        } catch (error) {
          // Cette page est publique : si l'utilisateur n'est pas authentifié, l'API peut répondre 401.
          // On affiche alors une page “succès” sans détails.
          console.error('Erreur récupération paiement:', error);
        }
      }
      setIsLoading(false);
    };

    fetchPayment();
  }, [paymentId]);

  if (isLoading) {
    return <FullPageLoader text="Vérification du paiement..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          <p className="text-gray-600 mb-6">
            Votre demande de contact a été enregistrée avec succès.
          </p>

          {/* Payment Details */}
          {payment && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Référence</span>
                  <span className="font-mono font-medium">{payment.reference}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Montant</span>
                  <span className="font-medium">{formatPrice(payment.amount)}</span>
                </div>
                {payment.room && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Chambre</span>
                    <span className="font-medium">{payment.room.title}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-primary-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Prochaines étapes
            </h3>
            <ol className="space-y-2 text-sm text-primary-800">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                <span>Notre équipe analyse votre demande sous 24h</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                <span>Nous contactons le propriétaire pour vous</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                <span>Nous vous appelons pour organiser la visite</span>
              </li>
            </ol>
          </div>

          {/* Contact */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
            <PhoneIcon className="w-4 h-4" />
            <span>Besoin d'aide ? +228 90 00 00 00</span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link to="/dashboard/contacts">
              <Button fullWidth>
                Suivre ma demande
              </Button>
            </Link>
            <Link to="/chambres">
              <Button variant="outline" fullWidth>
                Voir d'autres chambres
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
