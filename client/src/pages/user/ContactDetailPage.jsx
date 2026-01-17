/**
 * Page Détail Demande de Contact - ImmoLomé
 * Affiche les infos de la demande + timeline + actions utilisateur (annuler, feedback si applicable)
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  MapPinIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  XCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

import contactService from '@/services/contactService';
import { formatDate, formatDateTime, formatPrice } from '@/utils/formatters';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { ContactStatusBadge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Input';

export default function ContactDetailPage() {
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [contact, setContact] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);

  const canCancel = useMemo(() => {
    return contact && ['pending', 'processing'].includes(contact.status);
  }, [contact]);

  const canGiveFeedback = useMemo(() => {
    // Le backend exige visit.completed === true
    return !!(contact?.visit?.completed);
  }, [contact]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([
        contactService.getContactById(id),
        contactService.getContactTimeline(id),
      ]);

      setContact(cRes.data?.contact);
      setTimeline(tRes.data?.timeline || []);
    } catch (e) {
      toast.error(e.message || 'Impossible de charger la demande');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    if (!canCancel) return;

    const ok = window.confirm('Annuler cette demande ?');
    if (!ok) return;

    setIsActionLoading(true);
    try {
      await contactService.cancelContact(id);
      toast.success('Demande annulée');
      await fetchAll();
    } catch (e) {
      toast.error(e.message || 'Erreur annulation');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!canGiveFeedback) {
      toast.error('La visite n\'est pas encore marquée comme effectuée');
      return;
    }

    setIsActionLoading(true);
    try {
      await contactService.addFeedback(id, rating, feedback);
      toast.success('Feedback enregistré');
      await fetchAll();
    } catch (e) {
      toast.error(e.message || 'Erreur feedback');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!contact) {
    return (
      <Card className="py-12 text-center">
        <p className="text-gray-600">Demande introuvable.</p>
        <Link to="/dashboard/contacts" className="inline-block mt-4">
          <Button variant="outline">Retour</Button>
        </Link>
      </Card>
    );
  }

  const room = contact.room;
  const roomTitle = contact.roomInfo?.title || room?.title;
  const roomQuartier = contact.roomInfo?.quartier || room?.location?.quartier;
  const roomRent = contact.roomInfo?.monthlyRent || room?.pricing?.monthlyRent;
  const roomPhoto = contact.roomInfo?.mainPhoto || room?.photos?.[0]?.url || '/placeholder-room.jpg';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/dashboard/contacts"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour aux demandes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Détail de la demande</h1>
          <div className="flex items-center gap-3 mt-2">
            <ContactStatusBadge status={contact.status} />
            <span className="text-xs text-gray-500">Réf: {contact.reference}</span>
          </div>
        </div>

        {canCancel && (
          <Button
            variant="danger"
            size="sm"
            icon={XCircleIcon}
            loading={isActionLoading}
            onClick={handleCancel}
          >
            Annuler
          </Button>
        )}
      </div>

      {/* Room recap */}
      <Card className="p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-64 flex-shrink-0">
            <img src={roomPhoto} alt={roomTitle} className="w-full h-48 md:h-full object-cover" />
          </div>
          <div className="p-6 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{roomTitle}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{roomQuartier}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary-600">{formatPrice(roomRent)}</div>
                <div className="text-sm text-gray-500">/mois</div>
              </div>
            </div>

            {/* Message */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-500" />
                Votre message
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {contact.message?.content}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Envoyé le {formatDateTime(contact.message?.sentAt || contact.createdAt)}
              </p>
            </div>

            {/* Visit */}
            {contact.visit?.scheduledDate && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-2 text-sm font-medium text-purple-900">
                  <CalendarIcon className="w-4 h-4" />
                  Visite programmée
                </div>
                <p className="text-sm text-purple-800 mt-1">
                  {formatDate(contact.visit.scheduledDate)} {contact.visit.scheduledTime ? `à ${contact.visit.scheduledTime}` : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Suivi de la demande</CardTitle>
        </CardHeader>

        {timeline.length === 0 ? (
          <p className="text-gray-500 text-center py-6">Aucun événement pour le moment.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {timeline.map((event, idx) => (
                <div key={idx} className="relative flex gap-4 pl-10">
                  <div
                    className={`absolute left-2.5 w-3 h-3 rounded-full ${
                      event.event === 'successful'
                        ? 'bg-green-500'
                        : event.event === 'failed' || event.event === 'cancelled'
                          ? 'bg-red-500'
                          : 'bg-primary-500'
                    }`}
                  />
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{event.label}</h4>
                      <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback visite</CardTitle>
        </CardHeader>

        {!canGiveFeedback ? (
          <p className="text-sm text-gray-600">
            Le feedback est disponible uniquement après que la visite soit marquée comme effectuée.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">Note (1 à 5)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`p-2 rounded-lg border ${rating === n ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    aria-label={`Noter ${n}`}
                  >
                    <StarIcon className={`w-5 h-5 ${rating >= n ? 'text-yellow-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Votre commentaire (optionnel)"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Votre retour sur la visite..."
            />

            <div className="flex justify-end">
              <Button loading={isActionLoading} onClick={handleFeedback}>
                Envoyer le feedback
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
