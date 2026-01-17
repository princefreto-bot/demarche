/**
 * Composant RoomCard - ImmoLomé
 * Carte d'affichage d'une chambre
 */

import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  CubeIcon,
  HeartIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { formatPrice, formatSurface, formatRoomType } from '@/utils/formatters';
import { RoomStatusBadge } from '@/components/ui/Badge';

export default function RoomCard({ 
  room, 
  showStatus = false,
  showStats = false,
  onFavorite,
  isFavorite = false,
}) {
  const mainPhoto = room.photos?.[0]?.url || room.mainPhoto || '/placeholder-room.jpg';
  
  return (
    <Link 
      to={`/chambres/${room._id}`}
      className="room-card group block"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainPhoto}
          alt={room.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Status Badge */}
        {showStatus && (
          <div className="absolute top-3 left-3">
            <RoomStatusBadge status={room.status} />
          </div>
        )}
        
        {/* Favorite Button */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite(room._id);
            }}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
          >
            {isFavorite ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}
        
        {/* Price Tag */}
        <div className="absolute bottom-3 left-3">
          <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
            <span className="text-lg font-bold text-primary-600">
              {formatPrice(room.pricing?.monthlyRent)}
            </span>
            <span className="text-xs text-gray-500">/mois</span>
          </div>
        </div>
        
        {/* Stats (views) */}
        {showStats && room.stats?.views > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs">
            <EyeIcon className="w-4 h-4" />
            {room.stats.views}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Type */}
        <div className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-1">
          {formatRoomType(room.features?.type)}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
          {room.title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
          <MapPinIcon className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{room.location?.quartier}, {room.location?.ville || 'Lomé'}</span>
        </div>
        
        {/* Features */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          {/* Surface */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <CubeIcon className="w-4 h-4" />
            <span>{formatSurface(room.dimensions?.surface)}</span>
          </div>
          
          {/* Room count */}
          <div className="text-sm text-gray-600">
            {room.features?.rooms || 1} pièce{(room.features?.rooms || 1) > 1 ? 's' : ''}
          </div>
          
          {/* Furnished */}
          {room.features?.furnished && (
            <div className="text-sm text-green-600 font-medium">
              Meublé
            </div>
          )}
        </div>
        
        {/* Contract Duration */}
        <div className="mt-3 text-xs text-gray-500">
          Contrat : {room.pricing?.contractDuration || 12} mois • 
          Total : {formatPrice(room.pricing?.totalAmount)}
        </div>
      </div>
    </Link>
  );
}

/**
 * Version compacte de la carte
 */
export function RoomCardCompact({ room }) {
  const mainPhoto = room.photos?.[0]?.url || room.mainPhoto || '/placeholder-room.jpg';
  
  return (
    <Link 
      to={`/chambres/${room._id}`}
      className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
        <img
          src={mainPhoto}
          alt={room.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 line-clamp-1">{room.title}</h4>
        
        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
          <MapPinIcon className="w-4 h-4" />
          <span>{room.location?.quartier}</span>
        </div>
        
        <div className="mt-2">
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(room.pricing?.monthlyRent)}
          </span>
          <span className="text-xs text-gray-500">/mois</span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Version horizontale
 */
export function RoomCardHorizontal({ room, showStatus = false }) {
  const mainPhoto = room.photos?.[0]?.url || room.mainPhoto || '/placeholder-room.jpg';
  
  return (
    <Link 
      to={`/chambres/${room._id}`}
      className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="sm:w-72 aspect-[4/3] sm:aspect-auto flex-shrink-0 overflow-hidden">
        <img
          src={mainPhoto}
          alt={room.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 sm:p-6">
        {showStatus && (
          <div className="mb-2">
            <RoomStatusBadge status={room.status} />
          </div>
        )}
        
        <div className="text-xs font-medium text-primary-600 uppercase tracking-wide">
          {formatRoomType(room.features?.type)}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-1">
          {room.title}
        </h3>
        
        <div className="flex items-center gap-1 mt-2 text-gray-500">
          <MapPinIcon className="w-4 h-4" />
          <span>{room.location?.quartier}, {room.location?.ville || 'Lomé'}</span>
        </div>
        
        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
          {room.description}
        </p>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              {formatPrice(room.pricing?.monthlyRent)}
            </span>
            <span className="text-sm text-gray-500">/mois</span>
          </div>
          
          <div className="text-sm text-gray-500">
            {formatSurface(room.dimensions?.surface)} • {room.features?.rooms || 1} pièce{(room.features?.rooms || 1) > 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </Link>
  );
}
