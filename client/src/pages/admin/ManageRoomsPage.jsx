/**
 * Page Gestion Chambres Admin - ImmoLomé (API réelle)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { formatPrice, formatRelativeDate } from '@/utils/formatters';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { RoomStatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import api from '@/services/api';

export default function ManageRoomsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0, hasNext: false, hasPrev: false });

  const fetchRooms = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/rooms', {
        params: {
          page,
          limit: pagination.limit,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
      });

      setRooms(res.data?.data || []);
      setPagination(res.data?.pagination || pagination);
    } catch (e) {
      toast.error(e.message || 'Erreur chargement chambres');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleValidate = async (id) => {
    try {
      await api.post(`/admin/rooms/${id}/validate`, { notes: '' });
      toast.success('Chambre validée');
      fetchRooms(pagination.page);
    } catch (e) {
      toast.error(e.message || 'Erreur validation');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Raison du rejet (obligatoire) :');
    if (!reason) return;

    try {
      await api.post(`/admin/rooms/${id}/reject`, { reason });
      toast.success('Chambre rejetée');
      fetchRooms(pagination.page);
    } catch (e) {
      toast.error(e.message || 'Erreur rejet');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des chambres</h1>
          <p className="text-gray-600 mt-1">Validez, modifiez et gérez toutes les annonces</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'draft', label: 'Brouillon' },
              { value: 'pending', label: 'En attente' },
              { value: 'available', label: 'Disponible' },
              { value: 'processing', label: 'En cours' },
              { value: 'reserved', label: 'Réservée' },
              { value: 'rented', label: 'Louée' },
            ]}
            className="w-56"
          />
          <span className="text-sm text-gray-500">{pagination.total} chambre(s)</span>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
        </CardHeader>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Aucune chambre</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chambre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propriétaire</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{room.title}</div>
                        <div className="text-sm text-gray-500">{room.location?.quartier}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {room.owner ? `${room.owner.firstName} ${room.owner.lastName}` : '—'}
                    </td>
                    <td className="px-4 py-4 font-semibold">{formatPrice(room.pricing?.monthlyRent)}</td>
                    <td className="px-4 py-4"><RoomStatusBadge status={room.status} /></td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatRelativeDate(room.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Link to={`/chambres/${room._id}`}>
                          <Button variant="ghost" size="sm" icon={EyeIcon} />
                        </Link>
                        {room.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={CheckCircleIcon}
                              className="text-green-600"
                              onClick={() => handleValidate(room._id)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={XCircleIcon}
                              className="text-red-600"
                              onClick={() => handleReject(room._id)}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">Page {pagination.page} / {pagination.pages}</div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!pagination.hasPrev} onClick={() => fetchRooms(pagination.page - 1)}>Précédent</Button>
            <Button variant="outline" disabled={!pagination.hasNext} onClick={() => fetchRooms(pagination.page + 1)}>Suivant</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
