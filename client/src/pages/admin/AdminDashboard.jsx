/**
 * Dashboard Admin - ImmoLomé
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, formatRelativeDate } from '@/utils/formatters';
import Card, { StatsCard, CardHeader, CardTitle } from '@/components/ui/Card';
import { ContactStatusBadge, RoomStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import api from '@/services/api';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalRooms: 0,
    pendingRooms: 0,
    pendingContacts: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
  });
  const [recentContacts, setRecentContacts] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        // 1) Dashboard stats
        const dashRes = await api.get('/admin/dashboard');
        const d = dashRes.data?.data;

        setStats({
          totalUsers: d?.overview?.totalUsers || 0,
          totalOwners: d?.overview?.totalOwners || 0,
          totalRooms: d?.overview?.totalRooms || 0,
          pendingRooms: d?.overview?.pendingRooms || 0,
          pendingContacts: d?.overview?.pendingContacts || 0,
          monthlyRevenue: d?.revenue?.thisMonth || 0,
          revenueGrowth: d?.revenue?.growth || 0,
        });

        setRecentPayments(d?.recentPayments || []);

        // 2) Recent contacts (list view)
        const contactsRes = await api.get('/admin/contacts', {
          params: { page: 1, limit: 5 },
        });
        setRecentContacts(contactsRes.data?.data || []);
      } catch (e) {
        console.error('Erreur chargement admin dashboard:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Administrateur
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenue, {user?.firstName}. Voici l'état de la plateforme.
        </p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Utilisateurs"
          value={stats.totalUsers}
          icon={UsersIcon}
        />
        <StatsCard
          title="Propriétaires"
          value={stats.totalOwners}
          icon={BuildingOfficeIcon}
        />
        <StatsCard
          title="Chambres"
          value={stats.totalRooms}
          icon={BuildingOfficeIcon}
        />
        <StatsCard
          title="Revenus du mois"
          value={formatPrice(stats.monthlyRevenue)}
          icon={CurrencyDollarIcon}
          trend={`+${stats.revenueGrowth}%`}
          trendUp={true}
        />
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin/rooms?status=pending">
          <Card hover className="border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Chambres en attente</h3>
                  <p className="text-sm text-gray-500">À valider</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-yellow-600">
                {stats.pendingRooms}
              </span>
            </div>
          </Card>
        </Link>

        <Link to="/admin/contacts?status=pending">
          <Card hover className="border-l-4 border-l-primary-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Demandes en attente</h3>
                  <p className="text-sm text-gray-500">À traiter</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-primary-600">
                {stats.pendingContacts}
              </span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Demandes récentes */}
      <Card>
        <CardHeader
          action={
            <Link to="/admin/contacts">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          }
        >
          <CardTitle>Demandes récentes</CardTitle>
        </CardHeader>

        {recentContacts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune demande récente</p>
        ) : (
          <div className="space-y-4">
            {recentContacts.map((contact) => (
              <div
                key={contact._id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <ContactStatusBadge status={contact.status} />
                    <span className="text-xs font-mono text-gray-500">
                      {contact.reference}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">
                    {contact.userInfo?.fullName || `${contact.user?.firstName || ''} ${contact.user?.lastName || ''}`.trim() || 'Client'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {(contact.roomInfo?.title || contact.room?.title || 'Chambre')} - {formatPrice(contact.roomInfo?.monthlyRent || contact.room?.pricing?.monthlyRent)}/mois
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {formatRelativeDate(contact.createdAt)}
                  </p>
                  <Link to={`/admin/contacts`}>
                    <Button variant="outline" size="sm" className="mt-2">
                      Traiter
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Paiements récents */}
      <Card>
        <CardHeader
          action={
            <Link to="/admin/payments">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          }
        >
          <CardTitle>Paiements récents</CardTitle>
        </CardHeader>

        {recentPayments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucun paiement récent</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Référence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Montant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPayments.map((payment) => (
                  <tr key={payment.id || payment._id || payment.reference}>
                    <td className="px-4 py-4 font-mono text-sm">
                      {payment.reference}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {payment.user || payment.userName || 'N/A'}
                    </td>
                    <td className="px-4 py-4 font-semibold text-green-600">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatRelativeDate(payment.date || payment.completedAt || payment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link to="/admin/rooms">
          <Card hover>
            <div className="text-center">
              <BuildingOfficeIcon className="w-8 h-8 text-primary-600 mx-auto" />
              <h4 className="font-medium text-gray-900 mt-2">Gérer les chambres</h4>
            </div>
          </Card>
        </Link>
        <Link to="/admin/users">
          <Card hover>
            <div className="text-center">
              <UsersIcon className="w-8 h-8 text-secondary-600 mx-auto" />
              <h4 className="font-medium text-gray-900 mt-2">Gérer les utilisateurs</h4>
            </div>
          </Card>
        </Link>
        <Link to="/admin/payments">
          <Card hover>
            <div className="text-center">
              <CreditCardIcon className="w-8 h-8 text-accent-600 mx-auto" />
              <h4 className="font-medium text-gray-900 mt-2">Voir les paiements</h4>
            </div>
          </Card>
        </Link>
        <Link to="/admin/contacts">
          <Card hover>
            <div className="text-center">
              <ClipboardDocumentListIcon className="w-8 h-8 text-purple-600 mx-auto" />
              <h4 className="font-medium text-gray-900 mt-2">Gérer les demandes</h4>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
