/**
 * Page Gestion Paiements Admin - ImmoLomé (API réelle)
 */

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import api from '@/services/api';

export default function ManagePaymentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0, hasNext: false, hasPrev: false });

  const fetchAll = async (page = 1) => {
    setIsLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        api.get('/admin/payments', { params: { page, limit: pagination.limit } }),
        api.get('/admin/payments/stats'),
      ]);

      setPayments(pRes.data?.data || []);
      setPagination(pRes.data?.pagination || pagination);
      setStats(sRes.data?.data || {});
    } catch (e) {
      toast.error(e.message || 'Erreur chargement paiements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    // stats.stats est un tableau agrégé par type (backend)
    const rows = stats.stats || [];
    const total = rows.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const contactFees = rows.find((r) => r._id === 'contact_fee')?.totalAmount || 0;
    const commissions = rows.find((r) => r._id === 'commission')?.totalAmount || 0;
    return { total, contactFees, commissions };
  }, [stats]);

  const badgeForStatus = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="green" dot>Réussi</Badge>;
      case 'processing':
      case 'pending':
        return <Badge variant="yellow" dot>En cours</Badge>;
      case 'failed':
        return <Badge variant="red" dot>Échoué</Badge>;
      case 'cancelled':
        return <Badge variant="gray" dot>Annulé</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des paiements</h1>
        <p className="text-gray-600 mt-1">Suivez tous les paiements et revenus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-900">{formatPrice(summary.total)}</div>
          <div className="text-sm text-gray-500 mt-1">Revenus (completed)</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">{formatPrice(summary.contactFees)}</div>
          <div className="text-sm text-gray-500 mt-1">Frais de contact</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-secondary-600">{formatPrice(summary.commissions)}</div>
          <div className="text-sm text-gray-500 mt-1">Commissions</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
        </CardHeader>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader size="lg" /></div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Aucun paiement</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chambre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-mono text-sm">{p.reference}</td>
                    <td className="px-4 py-4">
                      <Badge variant={p.type === 'commission' ? 'purple' : 'blue'}>
                        {p.type === 'commission' ? 'Commission' : 'Frais contact'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm">{p.user ? `${p.user.firstName} ${p.user.lastName}` : p.customerInfo?.name || '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{p.room?.title || p.productInfo?.roomTitle || '—'}</td>
                    <td className="px-4 py-4 font-semibold text-green-600">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-4">{badgeForStatus(p.status)}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDateTime(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">Page {pagination.page} / {pagination.pages}</div>
          <div className="flex gap-2">
            <button
              className="btn btn-outline"
              disabled={!pagination.hasPrev}
              onClick={() => fetchAll(pagination.page - 1)}
            >
              Précédent
            </button>
            <button
              className="btn btn-outline"
              disabled={!pagination.hasNext}
              onClick={() => fetchAll(pagination.page + 1)}
            >
              Suivant
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
