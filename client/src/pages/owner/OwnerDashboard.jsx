/**
 * Dashboard Propriétaire - ImmoLomé
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HomeIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/authStore';
import roomService from '@/services/roomService';
import { formatPrice, formatRelativeDate } from '@/utils/formatters';
import Card, { StatsCard, CardHeader, CardTitle } from '@/components/ui/Card';
import { RoomStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';

export default function OwnerDashboard() {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    pending: 0,
    rented: 0,
    totalViews: 0,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomService.getMyRooms();
      const data = response.data || [];
      setRooms(data);

      // Calculer les stats
      setStats({
        total: data.length,
        available: data.filter((r) => r.status === 'available').length,
        pending: data.filter((r) => r.status === 'pending').length,
        rented: data.filter((r) => r.status === 'rented').length,
        totalViews: data.reduce((sum, r) => sum + (r.stats?.views || 0), 0),
      });
    } catch (error) {
      console.error('Erreur chargement chambres:', error);
    } finally {
      setIsLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {user?.firstName} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos annonces et suivez leurs performances
          </p>
        </div>
        <Link to="/owner/rooms/new">
          <Button icon={PlusCircleIcon}>
            Nouvelle chambre
          </Button>
        </Link>
      </div>

      {/* Verification Warning */}
      {!user?.ownerInfo?.isVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <ClockIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">
                Compte en attente de vérification
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Votre compte propriétaire est en cours de vérification par notre équipe.
                Vous pouvez commencer à créer vos annonces, mais elles ne seront publiées
                qu'après validation de votre compte.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total chambres"
          value={stats.total}
          icon={BuildingOfficeIcon}
        />
        <StatsCard
          title="Disponibles"
          value={stats.available}
          icon={CheckCircleIcon}
        />
        <StatsCard
          title="En attente"
          value={stats.pending}
          icon={ClockIcon}
        />
        <StatsCard
          title="Louées"
          value={stats.rented}
          icon={HomeIcon}
        />
        <StatsCard
          title="Vues totales"
          value={stats.totalViews}
          icon={EyeIcon}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/owner/rooms/new">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                <PlusCircleIcon className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ajouter une chambre</h3>
                <p className="text-sm text-gray-500">
                  Publiez une nouvelle annonce gratuitement
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/owner/rooms">
          <Card hover className="h-full">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="w-7 h-7 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gérer mes chambres</h3>
                <p className="text-sm text-gray-500">
                  Voir et modifier vos annonces
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Rooms */}
      <Card>
        <CardHeader
          action={
            <Link to="/owner/rooms">
              <Button variant="ghost" size="sm">Voir tout</Button>
            </Link>
          }
        >
          <CardTitle>Mes chambres récentes</CardTitle>
        </CardHeader>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune chambre
            </h3>
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore publié de chambre
            </p>
            <Link to="/owner/rooms/new">
              <Button icon={PlusCircleIcon}>
                Créer ma première annonce
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.slice(0, 5).map((room) => (
              <Link
                key={room._id}
                to={`/owner/rooms/${room._id}/edit`}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <img
                  src={room.photos?.[0]?.url || '/placeholder-room.jpg'}
                  alt={room.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <RoomStatusBadge status={room.status} />
                  </div>
                  <h4 className="font-medium text-gray-900 truncate">
                    {room.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {room.location?.quartier} • {formatPrice(room.pricing?.monthlyRent)}/mois
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <EyeIcon className="w-4 h-4" />
                    <span>{room.stats?.views || 0}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeDate(room.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Conseils pour de meilleures annonces</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Ajoutez au moins 5 photos HD de qualité (minimum 3 obligatoires)</li>
          <li>• Indiquez les dimensions exactes et tous les équipements</li>
          <li>• Soyez transparent sur les petits défauts - ça inspire confiance</li>
          <li>• Répondez rapidement aux demandes de notre équipe</li>
        </ul>
      </Card>
    </div>
  );
}
