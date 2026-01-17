/**
 * Composant Badge - ImmoLomé
 * Badge pour statuts et labels
 */

import clsx from 'clsx';

const variants = {
  gray: 'bg-gray-100 text-gray-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
  orange: 'bg-orange-100 text-orange-800',
  cyan: 'bg-cyan-100 text-cyan-800',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

export default function Badge({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className = '',
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'green' && 'bg-green-500',
            variant === 'yellow' && 'bg-yellow-500',
            variant === 'red' && 'bg-red-500',
            variant === 'blue' && 'bg-blue-500',
            variant === 'gray' && 'bg-gray-500',
            variant === 'orange' && 'bg-orange-500',
            variant === 'purple' && 'bg-purple-500'
          )}
        />
      )}
      {children}
    </span>
  );
}

/**
 * Status Badge pour les chambres
 */
export function RoomStatusBadge({ status }) {
  const config = {
    draft: { label: 'Brouillon', variant: 'gray' },
    pending: { label: 'En attente', variant: 'yellow' },
    available: { label: 'Disponible', variant: 'green' },
    processing: { label: 'En cours', variant: 'blue' },
    reserved: { label: 'Réservée', variant: 'orange' },
    rented: { label: 'Louée', variant: 'purple' },
  };

  const { label, variant } = config[status] || config.draft;

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}

/**
 * Status Badge pour les contacts
 */
export function ContactStatusBadge({ status }) {
  const config = {
    pending: { label: 'En attente', variant: 'yellow' },
    processing: { label: 'En traitement', variant: 'blue' },
    contacted: { label: 'Contacté', variant: 'indigo' },
    visit_scheduled: { label: 'Visite prévue', variant: 'purple' },
    visited: { label: 'Visité', variant: 'cyan' },
    negotiating: { label: 'Négociation', variant: 'orange' },
    successful: { label: 'Réussi', variant: 'green' },
    cancelled: { label: 'Annulé', variant: 'gray' },
    failed: { label: 'Échoué', variant: 'red' },
  };

  const { label, variant } = config[status] || config.pending;

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}

/**
 * Role Badge
 */
export function RoleBadge({ role }) {
  const config = {
    user: { label: 'Utilisateur', variant: 'blue' },
    owner: { label: 'Propriétaire', variant: 'purple' },
    admin: { label: 'Admin', variant: 'red' },
  };

  const { label, variant } = config[role] || config.user;

  return <Badge variant={variant}>{label}</Badge>;
}
