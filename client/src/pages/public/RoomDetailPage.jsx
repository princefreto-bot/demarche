/**
 * Page Détail Chambre - ImmoLomé
 * Affichage complet d'une chambre avec galerie photos
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPinIcon,
  CubeIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ShareIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useRoomStore } from '@/store/roomStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, formatDate, formatRoomType, formatSurface } from '@/utils/formatters';
import { FEATURES, RULES, CONTACT_FEE } from '@/utils/constants';
import { FullPageLoader } from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Badge, { RoomStatusBadge } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRoom, isLoading, error, fetchRoomById, clearCurrentRoom } = useRoomStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchRoomById(id);
    
    return () => clearCurrentRoom();
  }, [id]);

  if (isLoading) {
    return <FullPageLoader text="Chargement de la chambre..." />;
  }

  if (error || !currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chambre introuvable</h2>
          <p className="text-gray-600 mb-6">{error || 'Cette chambre n\'existe pas ou n\'est plus disponible.'}</p>
          <Link to="/chambres">
            <Button>Voir les chambres disponibles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const room = currentRoom;
  const photos = room.photos || [];
  const mainPhoto = photos[currentPhotoIndex]?.url || '/placeholder-room.jpg';

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/chambres/${id}` } });
      return;
    }
    navigate(`/payment/${id}`);
  };

  const features = FEATURES.filter((f) => room.features?.[f.key]);
  const rules = RULES.map((r) => ({
    ...r,
    allowed: room.rules?.[r.key],
  }));

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Accueil</Link>
            <span className="text-gray-300">/</span>
            <Link to="/chambres" className="text-gray-500 hover:text-gray-700">Chambres</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900">{room.location?.quartier}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galerie photos */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {/* Photo principale */}
              <div 
                className="relative aspect-[16/10] cursor-pointer"
                onClick={() => setShowGalleryModal(true)}
              >
                <img
                  src={mainPhoto}
                  alt={room.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 rounded-full text-white text-sm">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>

                {/* Status */}
                <div className="absolute top-4 left-4">
                  <RoomStatusBadge status={room.status} />
                </div>
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto hide-scrollbar">
                  {photos.map((photo, index) => (
                    <button
                      key={photo._id || index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={clsx(
                        'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                        currentPhotoIndex === index
                          ? 'border-primary-500'
                          : 'border-transparent hover:border-gray-300'
                      )}
                    >
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Infos principales */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-primary-600 uppercase tracking-wide mb-1">
                    {formatRoomType(room.features?.type)}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {room.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{room.location?.quartier}, {room.location?.ville || 'Lomé'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                    <ShareIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {room.description}
                </p>
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Caractéristiques</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {features.map((feature) => (
                  <div 
                    key={feature.key}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-xl">{feature.icon}</span>
                    <span className="text-sm text-gray-700">{feature.label}</span>
                  </div>
                ))}
              </div>

              {/* Dimensions */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-3">Dimensions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary-50 rounded-xl">
                    <div className="text-2xl font-bold text-primary-600">
                      {room.dimensions?.length}m
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Longueur</div>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-xl">
                    <div className="text-2xl font-bold text-primary-600">
                      {room.dimensions?.width}m
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Largeur</div>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-xl">
                    <div className="text-2xl font-bold text-primary-600">
                      {room.dimensions?.height}m
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Hauteur</div>
                  </div>
                  <div className="text-center p-4 bg-secondary-50 rounded-xl">
                    <div className="text-2xl font-bold text-secondary-600">
                      {room.dimensions?.surface}m²
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Surface</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Défauts (transparence) */}
            {room.defects && room.defects.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                  Points à noter (transparence)
                </h3>
                
                <div className="space-y-3">
                  {room.defects.map((defect, index) => (
                    <div 
                      key={index}
                      className={clsx(
                        'p-4 rounded-xl border',
                        defect.severity === 'mineur' && 'bg-green-50 border-green-200',
                        defect.severity === 'modéré' && 'bg-yellow-50 border-yellow-200',
                        defect.severity === 'important' && 'bg-red-50 border-red-200'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant={
                            defect.severity === 'mineur' ? 'green' :
                            defect.severity === 'modéré' ? 'yellow' : 'red'
                          }
                        >
                          {defect.severity}
                        </Badge>
                        <p className="text-sm text-gray-700">{defect.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Règles */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Règles du propriétaire</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {rules.map((rule) => (
                  <div key={rule.key} className="flex items-center gap-3">
                    {rule.allowed ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700">
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>

              {room.rules?.maxOccupants && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">
                    Nombre maximum d'occupants : <strong>{room.rules.maxOccupants} personne(s)</strong>
                  </span>
                </div>
              )}

              {room.rules?.otherRules && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">{room.rules.otherRules}</p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne latérale - Prix et Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Card Prix */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600">
                    {formatPrice(room.pricing?.monthlyRent)}
                  </div>
                  <div className="text-gray-500">par mois</div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Durée du contrat</span>
                    <span className="font-medium">{room.pricing?.contractDuration || 12} mois</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Montant total</span>
                    <span className="font-medium">{formatPrice(room.pricing?.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Caution</span>
                    <span className="font-medium">{room.pricing?.cautionMonths || 1} mois</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avance</span>
                    <span className="font-medium">{room.pricing?.advanceMonths || 1} mois</span>
                  </div>
                  {room.pricing?.chargesIncluded ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Charges</span>
                      <span className="font-medium text-green-600">Incluses</span>
                    </div>
                  ) : room.pricing?.chargesAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Charges</span>
                      <span className="font-medium">{formatPrice(room.pricing.chargesAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>Disponible {room.availableFrom ? `dès le ${formatDate(room.availableFrom)}` : 'immédiatement'}</span>
                  </div>
                </div>

                {room.status === 'available' && (
                  <Button 
                    fullWidth 
                    size="lg" 
                    onClick={handleContact}
                    icon={PhoneIcon}
                  >
                    Contacter pour cette chambre
                  </Button>
                )}

                {room.status === 'processing' && (
                  <div className="text-center p-4 bg-yellow-50 rounded-xl">
                    <p className="text-sm text-yellow-800">
                      Cette chambre est en cours de traitement. 
                      Vous pouvez toujours manifester votre intérêt.
                    </p>
                    <Button 
                      fullWidth 
                      size="lg" 
                      className="mt-4"
                      onClick={handleContact}
                    >
                      Je suis intéressé
                    </Button>
                  </div>
                )}

                <p className="text-xs text-center text-gray-500 mt-4">
                  Frais de mise en relation : {formatPrice(CONTACT_FEE)}
                </p>
              </div>

              {/* Note de confiance */}
              <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                <h4 className="font-semibold text-primary-900 mb-2">
                  🛡️ Plateforme de confiance
                </h4>
                <p className="text-sm text-primary-700">
                  ImmoLomé vérifie chaque annonce et vous accompagne dans vos démarches. 
                  Vous ne contactez jamais directement le propriétaire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Galerie */}
      <Modal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        size="xl"
        showCloseButton={true}
      >
        <div className="relative">
          <img
            src={photos[currentPhotoIndex]?.url || mainPhoto}
            alt={room.title}
            className="w-full max-h-[70vh] object-contain"
          />
          
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </>
          )}
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 rounded-full text-white text-sm">
            {currentPhotoIndex + 1} / {photos.length}
          </div>
        </div>
      </Modal>
    </div>
  );
}
