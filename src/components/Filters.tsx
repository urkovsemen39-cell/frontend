'use client';

import { SearchFilters, SortOption } from '@/types';

interface FiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function Filters({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: FiltersProps) {
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-bold mb-4">Фильтры</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Сортировка
          </label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="smart">Лучшее предложение</option>
            <option value="price_asc">Сначала дешевые</option>
            <option value="price_desc">Сначала дорогие</option>
            <option value="rating">По рейтингу</option>
            <option value="delivery">Быстрая доставка</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена от
          </label>
          <input
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена до
          </label>
          <input
            type="number"
            value={filters.maxPrice || ''}
            onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="∞"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Минимальный рейтинг
          </label>
          <select
            value={filters.minRating || ''}
            onChange={(e) => updateFilter('minRating', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Любой</option>
            <option value="4">4+ звезды</option>
            <option value="4.5">4.5+ звезды</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="freeDelivery"
            checked={filters.freeDelivery || false}
            onChange={(e) => updateFilter('freeDelivery', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="freeDelivery" className="ml-2 text-sm text-gray-700">
            Бесплатная доставка
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="inStockOnly"
            checked={filters.inStockOnly || false}
            onChange={(e) => updateFilter('inStockOnly', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="inStockOnly" className="ml-2 text-sm text-gray-700">
            Только в наличии
          </label>
        </div>
      </div>
    </div>
  );
}
