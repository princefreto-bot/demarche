/**
 * Formateurs - ImmoLomé
 */

/**
 * Formater un prix en FCFA
 */
export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};

/**
 * Formater un prix court (ex: 25K)
 */
export const formatPriceShort = (amount) => {
  if (!amount) return '-';
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'K';
  }
  return amount.toString();
};

/**
 * Formater une date
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-';
  
  const d = new Date(date);
  
  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  
  return d.toLocaleDateString('fr-FR', defaultOptions);
};

/**
 * Formater date et heure
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formater une date relative
 */
export const formatRelativeDate = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (seconds < 60) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (weeks < 4) return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  if (months < 12) return `Il y a ${months} mois`;
  
  return formatDate(date);
};

/**
 * Formater un numéro de téléphone
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  
  // Nettoyer
  let cleaned = phone.replace(/\D/g, '');
  
  // Ajouter le préfixe +228 si nécessaire
  if (cleaned.length === 8) {
    cleaned = '228' + cleaned;
  }
  
  // Formater
  if (cleaned.startsWith('228') && cleaned.length === 11) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  
  return phone;
};

/**
 * Formater les dimensions
 */
export const formatDimensions = (dimensions) => {
  if (!dimensions) return '-';
  
  const { length, width, height, surface } = dimensions;
  
  if (surface) {
    return `${surface} m²`;
  }
  
  if (length && width) {
    return `${length} × ${width} m`;
  }
  
  return '-';
};

/**
 * Formater la surface
 */
export const formatSurface = (surface) => {
  if (!surface) return '-';
  return `${surface} m²`;
};

/**
 * Formater le type de chambre
 */
export const formatRoomType = (type) => {
  const types = {
    chambre_simple: 'Chambre simple',
    chambre_salon: 'Chambre salon',
    appartement: 'Appartement',
    studio: 'Studio',
    maison: 'Maison',
    villa: 'Villa',
  };
  return types[type] || type;
};

/**
 * Formater le statut de la chambre
 */
export const formatRoomStatus = (status) => {
  const statuses = {
    draft: 'Brouillon',
    pending: 'En attente',
    available: 'Disponible',
    processing: 'En cours',
    reserved: 'Réservée',
    rented: 'Louée',
  };
  return statuses[status] || status;
};

/**
 * Tronquer un texte
 */
export const truncate = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

/**
 * Formater un nombre
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '-';
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Obtenir les initiales
 */
export const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName.charAt(0).toUpperCase() : '';
  const l = lastName ? lastName.charAt(0).toUpperCase() : '';
  return f + l;
};

/**
 * Formater le nom complet
 */
export const formatFullName = (firstName, lastName) => {
  return [firstName, lastName].filter(Boolean).join(' ');
};
