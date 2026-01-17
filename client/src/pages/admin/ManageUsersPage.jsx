/**
 * Page Gestion Utilisateurs Admin - ImmoLomé (API réelle)
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckBadgeIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/formatters';
import Card from '@/components/ui/Card';
import { RoleBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import api from '@/services/api';

export default function ManageUsersPage() {
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0, hasNext: false, hasPrev: false });

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          page,
          limit: pagination.limit,
          ...(roleFilter ? { role: roleFilter } : {}),
        },
      });
      setUsers(res.data?.data || []);
      setPagination(res.data?.pagination || pagination);
    } catch (e) {
      toast.error(e.message || 'Erreur chargement utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const toggleActive = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-active`);
      toast.success('Statut mis à jour');
      fetchUsers(pagination.page);
    } catch (e) {
      toast.error(e.message || 'Erreur');
    }
  };

  const verifyOwner = async (id) => {
    try {
      await api.post(`/admin/users/${id}/verify-owner`);
      toast.success('Propriétaire vérifié');
      fetchUsers(pagination.page);
    } catch (e) {
      toast.error(e.message || 'Erreur vérification');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-600 mt-1">Gérez les comptes utilisateurs et propriétaires</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: '', label: 'Tous les rôles' },
              { value: 'user', label: 'Utilisateurs' },
              { value: 'owner', label: 'Propriétaires' },
              { value: 'admin', label: 'Admins' },
            ]}
            className="w-48"
          />
          <span className="text-sm text-gray-500">{pagination.total} utilisateur(s)</span>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscription</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-gray-500 font-mono">{u._id}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div>{u.email}</div>
                      <div className="text-gray-500">{u.phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <RoleBadge role={u.role} />
                      {u.role === 'owner' && u.ownerInfo?.isVerified && (
                        <CheckBadgeIcon className="w-4 h-4 text-green-500 inline ml-1" />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {u.isActive ? <Badge variant="green">Actif</Badge> : <Badge variant="red">Inactif</Badge>}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {u.role === 'owner' && !u.ownerInfo?.isVerified && (
                          <Button variant="outline" size="sm" onClick={() => verifyOwner(u._id)}>
                            Vérifier
                          </Button>
                        )}
                        {u.role !== 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={u.isActive ? NoSymbolIcon : CheckBadgeIcon}
                            className={u.isActive ? 'text-red-600' : 'text-green-600'}
                            onClick={() => toggleActive(u._id)}
                          />
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
            <Button variant="outline" disabled={!pagination.hasPrev} onClick={() => fetchUsers(pagination.page - 1)}>Précédent</Button>
            <Button variant="outline" disabled={!pagination.hasNext} onClick={() => fetchUsers(pagination.page + 1)}>Suivant</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
