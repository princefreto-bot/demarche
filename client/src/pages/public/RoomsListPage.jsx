/**
 * Page Liste des Chambres - ImmoLomé
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRoomStore } from '@/store/roomStore';
import RoomCard from '@/components/room/RoomCard';
import RoomFilters, { QuickFilters } from '@/components/room/RoomFilters';
import { RoomListSkeleton } from '@/components/ui/Loader';
import Button from '@/components/ui/Button';

export default function RoomsListPage() {
  const [searchParams] = useSearchParams();
  const {
    rooms,
    pagination,
    filters,
    isLoading,
    error,
    fetchRooms,
    searchRooms,
    setFilters,
    setPage,
  } = useRoomStore();

  // Charger les chambres au montage et quand les params changent
  useEffect(() => {
    const quartier = searchParams.get('quartier');
    const type = searchParams.get('type');
    
    if (quartier || type) {
      setFilters({
        quartier: quartier || '',
        type: type || '',
      });
    }
    
    fetchRooms(true);
  }, [searchParams]);

  const handleSearch = async (query) => {
    if (query.trim()) {
      await searchRooms(query);
    }
  };

  const handleQuickFilter = (filter) => {
    setFilters(filter);
    fetchRooms(true);
  };

  const handleLoadMore = () => {
    setPage(pagination.page + 1);
    fetchRooms();
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-8">
          <h1 className="heading-2 text-gray-900">Chambres disponibles à Lomé</h1>
          <p className="text-gray-600 mt-2">
            {pagination.total > 0
              ? `${pagination.total} chambre${pagination.total > 1 ? 's' : ''} trouvée${pagination.total > 1 ? 's' : ''}`
              : 'Trouvez votre prochain logement'}
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Filters */}
        <RoomFilters onSearch={handleSearch} />

        {/* Quick Filters */}
        <div className="mt-6">
          <QuickFilters onSelect={handleQuickFilter} />
        </div>

        {/* Results */}
        <div className="mt-8">
          {isLoading && rooms.length === 0 ? (
            <RoomListSkeleton count={9} />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <Button onClick={() => fetchRooms(true)} className="mt-4">
                Réessayer
              </Button>
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🏠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune chambre trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos critères de recherche
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    quartier: '',
                    type: '',
                    minPrice: '',
                    maxPrice: '',
                    furnished: undefined,
                  });
                  fetchRooms(true);
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <RoomCard key={room._id} room={room} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.hasNext && (
                <div className="text-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    loading={isLoading}
                  >
                    Charger plus de chambres
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Page {pagination.page} sur {pagination.pages}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
