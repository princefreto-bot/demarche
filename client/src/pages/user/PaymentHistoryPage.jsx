/**
 * Page Historique des Paiements - ImmoLomé
 */

import { useEffect, useState } from 'react';
import {
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import paymentService from '@/services/paymentService';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentService.getMyPayments();
      const data = response.data?.payments || [];
      setPayments(data);

      // Calculer les stats
      const completed = data.filter((p) => p.status === 'completed');
      setStats({
        total: data.length,
        completed: completed.length,
        totalAmount: completed.reduce((sum, p) => sum + p.amount, 0),
      });
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="green" dot>Réussi</Badge>;
      case 'pending':
      case 'processing':
        return <Badge variant="yellow" dot>En cours</Badge>;
      case 'failed':
        return <Badge variant="red" dot>Échoué</Badge>;
      case 'cancelled':
        return <Badge variant="gray" dot>Annulé</Badge>;
      case 'refunded':
        return <Badge variant="blue" dot>Remboursé</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <CreditCardIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'contact_fee':
        return 'Frais de contact';
      case 'commission':
        return 'Commission';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historique des paiements</h1>
        <p className="text-gray-600 mt-1">
          Consultez tous vos paiements effectués sur ImmoLomé
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500 mt-1">Transactions totales</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500 mt-1">Paiements réussis</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">{formatPrice(stats.totalAmount)}</div>
          <div className="text-sm text-gray-500 mt-1">Montant total</div>
        </Card>
      </div>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>

        {payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun paiement
            </h3>
            <p className="text-gray-500">
              Vous n'avez effectué aucun paiement pour le moment
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chambre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(payment.status)}
                        <span className="font-mono text-sm">{payment.reference}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getPaymentTypeLabel(payment.type)}
                    </td>
                    <td className="px-4 py-4">
                      {payment.room ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {payment.room.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payment.room.location?.quartier}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(payment.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDateTime(payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Bon à savoir</h4>
        <p className="text-sm text-blue-800">
          Tous les paiements sont sécurisés par CinetPay. En cas de problème avec 
          un paiement, contactez notre support à <strong>support@immolome.com</strong>
        </p>
      </div>
    </div>
  );
}
