/**
 * Composant Loader - ImmoLomé
 * Indicateur de chargement
 */

import clsx from 'clsx';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

const colors = {
  primary: 'border-primary-600 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent',
};

export default function Loader({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = '' 
}) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={clsx(
          'rounded-full animate-spin',
          sizes[size],
          colors[color]
        )}
      />
      {text && (
        <p className="text-sm text-gray-500 animate-pulse">{text}</p>
      )}
    </div>
  );
}

/**
 * Loader plein écran
 */
export function FullPageLoader({ text = 'Chargement...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center">
        <Loader size="xl" />
        <p className="mt-4 text-gray-600">{text}</p>
      </div>
    </div>
  );
}

/**
 * Skeleton loader pour les cartes
 */
export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour liste de cartes
 */
export function RoomListSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
