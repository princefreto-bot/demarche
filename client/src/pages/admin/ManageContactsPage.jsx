/**
 * Page Gestion Demandes Admin - ImmoLomé (API réelle)
 */

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { formatPrice, formatRelativeDate, formatDate } from '@/utils/formatters';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { ContactStatusBadge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import api from '@/services/api';

export default function ManageContactsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0, hasNext: false, hasPrev: false });

  const [selectedContact, setSelectedContact] = useState(null);

  const fetchContacts = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/contacts', {
        params: {
          page,
          limit: pagination.limit,
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(priorityFilter ? { priority: priorityFilter } : {}),
        },
      });

      setContacts(res.data?.data || []);
      setPagination(res.data?.pagination || pagination);
    } catch (e) {
      toast.error(e.message || 'Erreur chargement demandes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  const updateContact = async (id, payload) => {
    try {
      await api.put(`/admin/contacts/${id}`, payload);
      toast.success('Contact mis à jour');
      fetchContacts(pagination.page);
    } catch (e) {
      toast.error(e.message || 'Erreur mise à jour');
    }
  };

  const assignToMe = async (id) => {
    try {
      await api.post(`/admin/contacts/${id}/assign`, {});
      toast.success('Assigné');
      fetchContacts(pagination.page);
    } catch (e) {
      toast.error(e.message || 'Erreur assignation');
    }
  };

  const scheduleVisit = async (id) => {
    const date = window.prompt('Date visite (YYYY-MM-DD) :');
    const time = window.prompt('Heure (ex: 10:00) :');
    if (!date || !time) return;

    try {
      await api.post(`/admin/contacts/${id}/schedule-visit`, { date, time });
      toast.success('Visite programmée');
      fetchContacts(pagination.page);
    } catch (e) {
      toast.error(e.message || 'Erreur visite');
    }
  };

  const markSuccess = async (id) => {
    try {
      await api.post(`/admin/contacts/${id}/success`);
      toast.success('Marqué comme réussi');
      fetchContacts(pagination.page);
    } catch (e) {
      toast.error(e.message || 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des demandes</h1>
        <p className="text-gray-600 mt-1">Traitez les demandes et organisez les visites</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="w-full md:w-64">
            <Select
              label="Statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'Tous' },
                { value: 'pending', label: 'En attente' },
                { value: 'processing', label: 'En traitement' },
                { value: 'contacted', label: 'Contacté' },
                { value: 'visit_scheduled', label: 'Visite programmée' },
                { value: 'visited', label: 'Visite effectuée' },
                { value: 'negotiating', label: 'Négociation' },
                { value: 'successful', label: 'Réussi' },
                { value: 'failed', label: 'Échoué' },
                { value: 'cancelled', label: 'Annulé' },
              ]}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              label="Priorité"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: '', label: 'Toutes' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'Haute' },
                { value: 'normal', label: 'Normale' },
                { value: 'low', label: 'Basse' },
              ]}
            />
          </div>
          <div className="text-sm text-gray-500 md:ml-auto">{pagination.total} demande(s)</div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demandes</CardTitle>
        </CardHeader>

        {isLoading ? (
          <div className="py-16 flex justify-center"><Loader size="lg" /></div>
        ) : contacts.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Aucune demande</div>
        ) : (
          <div className="space-y-4 p-6">
            {contacts.map((c) => (
              <div key={c._id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <ContactStatusBadge status={c.status} />
                      <span className="text-xs font-mono text-gray-500">{c.reference}</span>
                      {c.priority && c.priority !== 'normal' && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">{c.priority}</span>
                      )}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {c.userInfo?.fullName || `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.trim() || 'Client'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {c.roomInfo?.title || c.room?.title || 'Chambre'} — {formatPrice(c.roomInfo?.monthlyRent || c.room?.pricing?.monthlyRent)}/mois
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{formatRelativeDate(c.createdAt)}</div>

                    {c.visit?.scheduledDate && (
                      <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-800">
                          Visite: {formatDate(c.visit.scheduledDate)} {c.visit.scheduledTime ? `à ${c.visit.scheduledTime}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" icon={EyeIcon} onClick={() => setSelectedContact(c)}>
                      Détails
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => assignToMe(c._id)}>
                      Assigner
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => updateContact(c._id, { status: 'processing' })}>
                      En cours
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => scheduleVisit(c._id)}>
                      Programmer visite
                    </Button>
                    <Button variant="primary" size="sm" icon={CheckCircleIcon} onClick={() => markSuccess(c._id)}>
                      Réussi
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">Page {pagination.page} / {pagination.pages}</div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!pagination.hasPrev} onClick={() => fetchContacts(pagination.page - 1)}>Précédent</Button>
            <Button variant="outline" disabled={!pagination.hasNext} onClick={() => fetchContacts(pagination.page + 1)}>Suivant</Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title={selectedContact ? `Demande ${selectedContact.reference}` : 'Demande'}
        size="lg"
      >
        {!selectedContact ? null : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Client</div>
                <div className="text-sm text-gray-700">{selectedContact.userInfo?.fullName}</div>
                <div className="text-xs text-gray-500">{selectedContact.userInfo?.email}</div>
                <div className="text-xs text-gray-500">{selectedContact.userInfo?.phone}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Chambre</div>
                <div className="text-sm text-gray-700">{selectedContact.roomInfo?.title}</div>
                <div className="text-xs text-gray-500">{selectedContact.roomInfo?.quartier}</div>
                <div className="text-sm font-semibold text-primary-600">{formatPrice(selectedContact.roomInfo?.monthlyRent)}/mois</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-900 mb-1">Message</div>
              <div className="text-sm text-gray-700 p-4 bg-gray-50 rounded-xl whitespace-pre-line">{selectedContact.message?.content}</div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedContact(null)} fullWidth>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
