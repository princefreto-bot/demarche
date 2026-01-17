/**
 * Dashboard Utilisateur - ImmoLomé
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  CreditCardIcon,
  HomeIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import contactService from '@/services/contactService';
import paymentService from '@/services/paymentService';
import { formatPrice, formatRelativeDate } from '@/utils/formatters';
import Card, { StatsCard, CardHeader, CardTitle } from '@/components/ui/Card';
import { ContactStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, paymentsRes] = await Promise.all([
          contactService.getMyContacts({ limit: 5 }),
          paymentService.getMyPayments(),
        ]);
        
        setContacts(contactsRes.data || []);
        setPayments(paymentsRes.data?.payments || []);
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    totalContacts: user?.stats?.totalContacts || 0,
    totalPayments: user?.stats?.totalPayments || 0,
    totalSpent: user?.stats?.totalSpent || 0,
    activeContacts: contacts.filter(c => 
      !['successful', 'cancelled', 'failed'].includes(c.status)
    ).length,
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
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenue sur votre tableau de bord ImmoLomé
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Demandes actives"
          value={stats.activeContacts}
          icon={ClockIcon}
        />
        <StatsCard
          title="Total demandes"
          value={stats.totalContacts}
          icon={ClipboardDocumentListIcon}
        />
        <StatsCard
          title="Paiements"
          value={stats.totalPayments}
          icon={CreditCardIcon}
        />
        <StatsCard
          title="Total dépensé"
          value={formatPrice(stats.totalSpent)}
          icon={CreditCardIcon}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/chambres">
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <HomeIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Chercher une chambre</h4>
                <p className="text-sm text-gray-500">Parcourir les annonces</p>
              </div>
            </div>
          </Link>
          
          <Link to="/dashboard/contacts">
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Mes demandes</h4>
                <p className="text-sm text-gray-500">Suivre mes contacts</p>
              </div>
            </div>
          </Link>
          
          <Link to="/dashboard/payments">
            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Mes paiements</h4>
                <p className="text-sm text-gray-500">Historique</p>
              </div>
            </div>
          </Link>
        </div>
      </Card>

      {/* Recent Contacts */}
      <Card>
        <CardHeader
          action={
            <Link to="/dashboard/contacts">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          }
        >
          <CardTitle>Dernières demandes</CardTitle>
        </CardHeader>

        {contacts.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardDocumentListIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune demande pour le moment</p>
            <Link to="/chambres">
              <Button variant="outline" className="mt-4">
                Chercher une chambre
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.slice(0, 5).map((contact) => (
              <Link
                key={contact._id}
                to={`/dashboard/contacts/${contact._id}`}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <img
                  src={contact.roomInfo?.mainPhoto || '/placeholder-room.jpg'}
                  alt={contact.roomInfo?.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {contact.roomInfo?.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {contact.roomInfo?.quartier} • {formatPrice(contact.roomInfo?.monthlyRent)}/mois
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeDate(contact.createdAt)}
                  </p>
                </div>
                <ContactStatusBadge status={contact.status} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
