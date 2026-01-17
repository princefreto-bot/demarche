/**
 * Constantes - ImmoLomé
 */

// URLs de l'API
export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Frais de contact en FCFA
export const CONTACT_FEE = 1000;

// Types de logement
export const ROOM_TYPES = [
  { value: 'chambre_simple', label: 'Chambre simple', icon: '🛏️' },
  { value: 'chambre_salon', label: 'Chambre salon', icon: '🏠' },
  { value: 'appartement', label: 'Appartement', icon: '🏢' },
  { value: 'studio', label: 'Studio', icon: '🎯' },
  { value: 'maison', label: 'Maison', icon: '🏡' },
  { value: 'villa', label: 'Villa', icon: '🏰' },
];

// Statuts des chambres
export const ROOM_STATUSES = {
  draft: { label: 'Brouillon', color: 'gray' },
  pending: { label: 'En attente', color: 'yellow' },
  available: { label: 'Disponible', color: 'green' },
  processing: { label: 'En cours', color: 'blue' },
  reserved: { label: 'Réservée', color: 'orange' },
  rented: { label: 'Louée', color: 'purple' },
};

// Statuts des contacts
export const CONTACT_STATUSES = {
  pending: { label: 'En attente', color: 'yellow' },
  processing: { label: 'En traitement', color: 'blue' },
  contacted: { label: 'Propriétaire contacté', color: 'indigo' },
  visit_scheduled: { label: 'Visite programmée', color: 'purple' },
  visited: { label: 'Visite effectuée', color: 'cyan' },
  negotiating: { label: 'En négociation', color: 'orange' },
  successful: { label: 'Réussi', color: 'green' },
  cancelled: { label: 'Annulé', color: 'gray' },
  failed: { label: 'Échoué', color: 'red' },
};

// Quartiers de Lomé
export const QUARTIERS = [
  'Bè',
  'Tokoin',
  'Adidogomé',
  'Agoè',
  'Kégué',
  'Nyékonakpoè',
  'Hédzranawoé',
  'Amadahomé',
  'Djidjolé',
  'Akodessewa',
  'Baguida',
  'Aflao-Gakli',
  'Kodjoviakopé',
  'Gbossimé',
  'Légbassito',
  'Attiégou',
  'Cacaveli',
  'Agoè-Nyivé',
  'Adakpamé',
  'Totsi',
];

// Options de tri
export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Plus récentes' },
  { value: 'createdAt', label: 'Plus anciennes' },
  { value: 'pricing.monthlyRent', label: 'Prix croissant' },
  { value: '-pricing.monthlyRent', label: 'Prix décroissant' },
  { value: '-stats.views', label: 'Plus vues' },
];

// Options de prix
export const PRICE_RANGES = [
  { min: 0, max: 15000, label: 'Moins de 15 000 FCFA' },
  { min: 15000, max: 25000, label: '15 000 - 25 000 FCFA' },
  { min: 25000, max: 40000, label: '25 000 - 40 000 FCFA' },
  { min: 40000, max: 60000, label: '40 000 - 60 000 FCFA' },
  { min: 60000, max: 100000, label: '60 000 - 100 000 FCFA' },
  { min: 100000, max: null, label: 'Plus de 100 000 FCFA' },
];

// Caractéristiques
export const FEATURES = [
  { key: 'hasWater', label: 'Eau courante', icon: '💧' },
  { key: 'hasElectricity', label: 'Électricité', icon: '⚡' },
  { key: 'hasInternalToilet', label: 'WC intérieur', icon: '🚽' },
  { key: 'hasInternalShower', label: 'Douche intérieure', icon: '🚿' },
  { key: 'hasInternalKitchen', label: 'Cuisine intérieure', icon: '🍳' },
  { key: 'hasFan', label: 'Ventilateur', icon: '🌀' },
  { key: 'hasAC', label: 'Climatisation', icon: '❄️' },
  { key: 'hasBalcony', label: 'Balcon', icon: '🌅' },
  { key: 'hasParking', label: 'Parking', icon: '🚗' },
  { key: 'hasGuard', label: 'Gardien', icon: '👮' },
  { key: 'furnished', label: 'Meublé', icon: '🛋️' },
];

// Règles
export const RULES = [
  { key: 'petsAllowed', label: 'Animaux acceptés', icon: '🐕' },
  { key: 'smokingAllowed', label: 'Fumeurs acceptés', icon: '🚬' },
  { key: 'childrenAllowed', label: 'Enfants acceptés', icon: '👶' },
  { key: 'couplesAllowed', label: 'Couples acceptés', icon: '💑' },
];

// Niveaux de sévérité des défauts
export const DEFECT_SEVERITIES = [
  { value: 'mineur', label: 'Mineur', color: 'green' },
  { value: 'modéré', label: 'Modéré', color: 'yellow' },
  { value: 'important', label: 'Important', color: 'red' },
];

// Rôles utilisateur
export const USER_ROLES = {
  user: { label: 'Utilisateur', color: 'blue' },
  owner: { label: 'Propriétaire', color: 'purple' },
  admin: { label: 'Administrateur', color: 'red' },
};

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 36, 48];
