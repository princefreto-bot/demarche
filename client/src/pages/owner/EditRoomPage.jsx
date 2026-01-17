/**
 * Page Modifier une Chambre - ImmoLomé
 * Placeholder - Structure similaire à AddRoomPage
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import roomService from '@/services/roomService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';

export default function EditRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await roomService.getRoomById(id);
        setRoom(response.data.room);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!room) {
    return (
      <Card className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Chambre introuvable</h2>
        <Link to="/owner/rooms">
          <Button>Retour à mes chambres</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Modifier la chambre</h1>
        <p className="text-gray-600 mt-1">{room.title}</p>
      </div>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-6">
            L'éditeur complet sera similaire au formulaire d'ajout avec les données pré-remplies.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to={`/chambres/${id}`}>
              <Button variant="outline">Voir l'annonce</Button>
            </Link>
            <Link to="/owner/rooms">
              <Button>Retour à mes chambres</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
