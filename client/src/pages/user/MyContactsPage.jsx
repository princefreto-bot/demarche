/**
 * Page Mes Demandes de Contact - ImmoLomé
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FunnelIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import contactService from '@/services/contactService';
import { formatPrice, formatDate, formatRelativeDate } from '@/utils/formatters';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { ContactStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import Modal from '@/components/ui/Modal';

export default function MyContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await contactService.getMyContacts(params);
      setContacts(response.data || []);
    } catch (error) {
      console.error('Erreur chargement contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTimeline = async (contact) => {
    setSelectedContact(contact);
    try {
      const response = await contactService.getContactTimeline(contact._id);
      setTimeline(response.data?.timeline || []);
      setShowTimelineModal(true);
    } catch (error) {
      console.error('Erreur chargement timeline:', error);
    }
  };

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'processing', label: 'En traitement' },
    { value: 'contacted', label: 'Propriétaire contacté' },
    { value: 'visit_scheduled', label: 'Visite programmée' },
    { value: 'successful', label: 'Réussi' },
    { value: 'failed', label: 'Non abouti' },
    { value: 'cancelled', label: 'Annulé' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>
          <p className="text-gray-600 mt-1">
            Suivez l'avancement de vos demandes de contact
          </p>
        </div>
        <Link to="/chambres">
          <Button>Nouvelle recherche</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="w-64"
          />
          <span className="text-sm text-gray-500">
            {contacts.length} demande{contacts.length > 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      {/* Contacts List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      ) : contacts.length === 0 ? (
        <Card className="py-12 text-center">
          <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune demande
          </h3>
          <p className="text-gray-500 mb-6">
            {statusFilter
              ? 'Aucune demande ne correspond à ce filtre'
              : 'Vous n\'avez pas encore contacté pour une chambre'}
          </p>
          <Link to="/chambres">
            <Button>Chercher une chambre</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <Card key={contact._id} className="p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-48 flex-shrink-0">
                  <img
                    src={contact.roomInfo?.mainPhoto || contact.room?.photos?.[0]?.url || '/placeholder-room.jpg'}
                    alt={contact.roomInfo?.title}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <ContactStatusBadge status={contact.status} />
                        <span className="text-xs text-gray-500">
                          Réf: {contact.reference}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contact.roomInfo?.title || contact.room?.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{contact.roomInfo?.quartier}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary-600">
                        {formatPrice(contact.roomInfo?.monthlyRent)}
                      </div>
                      <div className="text-sm text-gray-500">/mois</div>
                    </div>
                  </div>

                  {/* Message preview */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {contact.message?.content}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatRelativeDate(contact.createdAt)}</span>
                      </div>
                      {contact.visit?.scheduledDate && (
                        <div className="flex items-center gap-1 text-primary-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Visite le {formatDate(contact.visit.scheduledDate)}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={EyeIcon}
                      onClick={() => handleViewTimeline(contact)}
                    >
                      Voir le suivi
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Timeline Modal */}
      <Modal
        isOpen={showTimelineModal}
        onClose={() => setShowTimelineModal(false)}
        title={`Suivi - ${selectedContact?.roomInfo?.title || 'Demande'}`}
        size="md"
      >
        {timeline.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun événement pour le moment
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {timeline.map((event, index) => (
                <div key={index} className="relative flex gap-4 pl-10">
                  {/* Dot */}
                  <div className={`absolute left-2.5 w-3 h-3 rounded-full ${
                    event.event === 'successful' ? 'bg-green-500' :
                    event.event === 'failed' || event.event === 'cancelled' ? 'bg-red-500' :
                    'bg-primary-500'
                  }`} />

                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{event.label}</h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <Button
            fullWidth
            variant="outline"
            onClick={() => setShowTimelineModal(false)}
          >
            Fermer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
