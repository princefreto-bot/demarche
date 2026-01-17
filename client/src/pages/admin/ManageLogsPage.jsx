/**
 * Page Gestion Logs Admin - ImmoLomé
 */

import { useEffect, useState } from 'react';
import {
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import Badge from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import api from '@/services/api';
import { formatDateTime } from '@/utils/formatters';

const levelVariant = (level) => {
  switch (level) {
    case 'critical':
    case 'error':
      return 'red';
    case 'warn':
      return 'yellow';
    case 'info':
      return 'blue';
    case 'debug':
      return 'gray';
    default:
      return 'gray';
  }
};

export default function ManageLogsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ level: '', event: '', userId: '' });

  const fetchLogs = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/logs', {
        params: {
          page,
          limit: pagination.limit,
          ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
        },
      });

      setLogs(res.data.data || []);
      setPagination(res.data.pagination || pagination);
    } catch (e) {
      console.error('Erreur logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.level, filters.event, filters.userId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Logs (Audit)</h1>
        <p className="text-gray-600 mt-1">Audit trail complet des actions et incidents.</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="label">Filtrer par event</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                className="input pl-10"
                placeholder="ex: payment.completed, room.validated..."
                value={filters.event}
                onChange={(e) => setFilters((s) => ({ ...s, event: e.target.value }))}
              />
            </div>
          </div>

          <div className="w-full md:w-56">
            <Select
              label="Niveau"
              value={filters.level}
              onChange={(e) => setFilters((s) => ({ ...s, level: e.target.value }))}
              options={[
                { value: '', label: 'Tous' },
                { value: 'debug', label: 'debug' },
                { value: 'info', label: 'info' },
                { value: 'warn', label: 'warn' },
                { value: 'error', label: 'error' },
                { value: 'critical', label: 'critical' },
              ]}
            />
          </div>

          <div className="w-full md:w-56">
            <label className="label">UserId (optionnel)</label>
            <input
              className="input"
              placeholder="ObjectId"
              value={filters.userId}
              onChange={(e) => setFilters((s) => ({ ...s, userId: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setFilters({ level: '', event: '', userId: '' })}>
              Réinitialiser
            </Button>
            <Button onClick={() => fetchLogs(1)}>Actualiser</Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Événements</CardTitle>
        </CardHeader>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun log trouvé.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-600">{formatDateTime(l.createdAt)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={levelVariant(l.level)}>{l.level}</Badge>
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-gray-800">{l.event}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 max-w-xl truncate">{l.message}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {l.actor?.user ? (
                        <span>
                          {l.actor.user.firstName} {l.actor.user.lastName}
                        </span>
                      ) : (
                        <span className="text-gray-400">system/anonymous</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Page {pagination.page} / {pagination.pages} — Total: {pagination.total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => fetchLogs(pagination.page - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => fetchLogs(pagination.page + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
