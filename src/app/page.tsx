'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import ProductList from '@/components/ProductList';
import Filters from '@/components/Filters';
import Header from '@/components/Header';
import { Product, SearchFilters, SortOption } from '@/types';

import { getApiUrl } from '@/config/api';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sort, setSort] = useState<SortOption>('smart');
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadPopularQueries();
  }, []);

  const loadPopularQueries = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/analytics/popular-queries?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.queries || []);
      }
    } catch (err) {
      console.error('Failed to load popular queries:', err);
      setSuggestions([]);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // Сохраняем последний запрос для трекинга кликов
    sessionStorage.setItem('lastSearchQuery', query);

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        sort,
        ...(filters.minPrice && { minPrice: filters.minPrice.toString() }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters.minRating && { minRating: filters.minRating.toString() }),
        ...(filters.freeDelivery && { freeDelivery: 'true' }),
        ...(filters.inStockOnly && { inStockOnly: 'true' }),
      });

      const apiUrl = getApiUrl();
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/search?${params}`, { headers });

      if (!response.ok) {
        throw new Error('Ошибка поиска');
      }

      const data = await response.json();
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareToggle = (product: Product) => {
    setCompareProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= 4) {
          alert('Можно сравнивать максимум 4 товара');
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const handleCompare = () => {
    if (compareProducts.length < 2) {
      alert('Выберите минимум 2 товара для сравнения');
      return;
    }
    // Сохраняем в sessionStorage и переходим на страницу сравнения
    sessionStorage.setItem('compareProducts', JSON.stringify(compareProducts));
    window.location.href = '/compare';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-gray-600 text-center mb-4">Умный поиск товаров по лучшей цене</p>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {suggestions.length > 0 && products.length === 0 && !loading && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Популярные запросы:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((query) => (
                <button
                  key={query}
                  onClick={() => handleSearch(query)}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <Filters
                filters={filters}
                onFiltersChange={setFilters}
                sort={sort}
                onSortChange={setSort}
              />
              
              {compareProducts.length > 0 && (
                <div className="mt-4 bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-bold mb-2">Сравнение ({compareProducts.length}/4)</h3>
                  <div className="space-y-2 mb-3">
                    {compareProducts.map(p => (
                      <div key={p.id} className="text-xs text-gray-600 truncate">
                        {p.name}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleCompare}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Сравнить
                  </button>
                  <button
                    onClick={() => setCompareProducts([])}
                    className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Очистить
                  </button>
                </div>
              )}
            </aside>

            <div className="lg:col-span-3">
              <div className="mb-4 text-gray-600">
                Найдено товаров: {total}
              </div>
              <ProductList 
                products={products} 
                onCompareToggle={handleCompareToggle}
                compareProducts={compareProducts}
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Ищем лучшие предложения...</p>
          </div>
        )}

        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Введите запрос для поиска товаров
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
