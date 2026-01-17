/**
 * Composant RoomFilters - ImmoLomé
 * Filtres pour la recherche de chambres
 */

import { useState } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useRoomStore } from '@/store/roomStore';
import { QUARTIERS, ROOM_TYPES, SORT_OPTIONS, PRICE_RANGES } from '@/utils/constants';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';

export default function RoomFilters({ onSearch }) {
  const { filters, setFilters, resetFilters, fetchRooms } = useRoomStore();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleApplyFilters = () => {
    fetchRooms(true);
    setShowMobileFilters(false);
  };

  const handleReset = () => {
    resetFilters();
    fetchRooms(true);
    setShowMobileFilters(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== '' && v !== undefined
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par quartier, titre..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <Button type="submit" className="px-6">
          Rechercher
        </Button>
        
        {/* Mobile Filter Toggle */}
        <button
          type="button"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </form>

      {/* Desktop Filters */}
      <div className="hidden md:grid md:grid-cols-5 gap-4 mt-4">
        {/* Quartier */}
        <Select
          value={filters.quartier}
          onChange={(e) => handleFilterChange('quartier', e.target.value)}
          placeholder="Tous les quartiers"
          options={QUARTIERS.map((q) => ({ value: q, label: q }))}
        />

        {/* Type */}
        <Select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          placeholder="Type de logement"
          options={ROOM_TYPES.map((t) => ({ value: t.value, label: t.label }))}
        />

        {/* Prix Min */}
        <Input
          type="number"
          value={filters.minPrice}
          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          placeholder="Prix min"
        />

        {/* Prix Max */}
        <Input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          placeholder="Prix max"
        />

        {/* Tri */}
        <Select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          placeholder="Trier par"
          options={SORT_OPTIONS}
        />
      </div>

      {/* Desktop Filter Actions */}
      <div className="hidden md:flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          {/* Meublé toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.furnished === true}
              onChange={(e) => handleFilterChange('furnished', e.target.checked || undefined)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-600">Meublé uniquement</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Réinitialiser les filtres
            </button>
          )}
          <Button onClick={handleApplyFilters}>
            Appliquer les filtres
          </Button>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold">Filtres</h3>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]">
            <Select
              label="Quartier"
              value={filters.quartier}
              onChange={(e) => handleFilterChange('quartier', e.target.value)}
              placeholder="Tous les quartiers"
              options={QUARTIERS.map((q) => ({ value: q, label: q }))}
            />

            <Select
              label="Type de logement"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              placeholder="Tous les types"
              options={ROOM_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prix minimum"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="Min"
              />
              <Input
                label="Prix maximum"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="Max"
              />
            </div>

            <Select
              label="Trier par"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              options={SORT_OPTIONS}
            />

            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={filters.furnished === true}
                onChange={(e) => handleFilterChange('furnished', e.target.checked || undefined)}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700">Meublé uniquement</span>
            </label>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3">
            <Button variant="outline" fullWidth onClick={handleReset}>
              Réinitialiser
            </Button>
            <Button fullWidth onClick={handleApplyFilters}>
              Voir les résultats
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Quick Filters (Pills)
 */
export function QuickFilters({ onSelect }) {
  const popularFilters = [
    { label: 'Moins de 20K', filter: { maxPrice: 20000 } },
    { label: 'Meublé', filter: { furnished: true } },
    { label: 'Tokoin', filter: { quartier: 'Tokoin' } },
    { label: 'Bè', filter: { quartier: 'Bè' } },
    { label: 'Adidogomé', filter: { quartier: 'Adidogomé' } },
    { label: 'Chambre salon', filter: { type: 'chambre_salon' } },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {popularFilters.map((item) => (
        <button
          key={item.label}
          onClick={() => onSelect(item.filter)}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
