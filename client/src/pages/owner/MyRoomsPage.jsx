/**
 * Page Mes Chambres (Propriétaire) - ImmoLomé
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import roomService from '@/services/roomService';
import { formatPrice, formatRelativeDate } from '@/utils/formatters';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { RoomStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import { ConfirmModal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export default function MyRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, room: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, [statusFilter]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await roomService.getMyRooms(params);
      setRooms(response.data || []);
    } catch (error) {
      console.error('Erreur chargement chambres:', error);
      toast.error('Erreur lors du chargement des chambres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.room) return;
    
    setIsDeleting(true);
    try {
      await roomService.deleteRoom(deleteModal.room._id);
      toast.success('Chambre supprimée');
      setRooms(rooms.filter((r) => r._id !== deleteModal.room._id));
      setDeleteModal({ isOpen: false, room: null });
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'pending', label: 'En attente' },
    { value: 'available', label: 'Disponible' },
    { value: 'processing', label: 'En cours' },
    { value: 'reserved', label: 'Réservée' },
    { value: 'rented', label: 'Louée' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes chambres</h1>
          <p className="text-gray-600 mt-1">
            Gérez toutes vos annonces de chambres
          </p>
        </div>
        <Link to="/owner/rooms/new">
          <Button icon={PlusCircleIcon}>
            Nouvelle chambre
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="w-48"
          />
          <span className="text-sm text-gray-500">
            {rooms.length} chambre{rooms.length > 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {/* Rooms List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      ) : rooms.length === 0 ? (
        <Card className="py-12 text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune chambre
          </h3>
          <p className="text-gray-500 mb-6">
            {statusFilter
              ? 'Aucune chambre ne correspond à ce filtre'
              : 'Vous n\'avez pas encore créé de chambre'}
          </p>
          <Link to="/owner/rooms/new">
            <Button icon={PlusCircleIcon}>Créer ma première chambre</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room._id} className="p-0 overflow-hidden">
              {/* Image */}
              <div className="relative aspect-[4/3]">
                <img
                  src={room.photos?.[0]?.url || '/placeholder-room.jpg'}
                  alt={room.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <RoomStatusBadge status={room.status} />
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 rounded-lg text-white text-xs">
                  <EyeIcon className="w-4 h-4" />
                  {room.stats?.views || 0}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                  {room.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {room.location?.quartier}
                </p>
                <div className="mt-2">
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(room.pricing?.monthlyRent)}
                  </span>
                  <span className="text-gray-500 text-sm">/mois</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Créée {formatRelativeDate(room.createdAt)}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link to={`/chambres/${room._id}`} className="flex-1">
                    <Button variant="ghost" size="sm" fullWidth icon={EyeIcon}>
                      Voir
                    </Button>
                  </Link>
                  <Link to={`/owner/rooms/${room._id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" fullWidth icon={PencilSquareIcon}>
                      Modifier
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={TrashIcon}
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteModal({ isOpen: true, room })}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, room: null })}
        onConfirm={handleDelete}
        title="Supprimer la chambre"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteModal.room?.title}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
