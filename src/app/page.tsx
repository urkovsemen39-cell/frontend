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
  const [showHero, setShowHero] = useState(true);

  useEffect(() => {
    loadPopularQueries();
  }, []);

  const loadPopularQueries = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/v1/analytics/popular-queries?limit=5`);
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

    setShowHero(false);
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

      const response = await fetch(`${apiUrl}/api/v1/search?${params}`, { headers });

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
    sessionStorage.setItem('compareProducts', JSON.stringify(compareProducts));
    window.location.href = '/compare';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showHero && products.length === 0 && !loading ? (
          /* Hero Section */
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Найдите лучшую цену
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Сравнивайте цены на миллионы товаров из разных магазинов и экономьте до 50%
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="glass-effect rounded-2xl p-6 hover-lift">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center floating">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Умный поиск</h3>
                <p className="text-gray-600 text-sm">Находим лучшие предложения за секунды</p>
              </div>

              <div className="glass-effect rounded-2xl p-6 hover-lift animation-delay-200">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center floating animation-delay-1000">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Сравнение цен</h3>
                <p className="text-gray-600 text-sm">Сравнивайте до 4 товаров одновременно</p>
              </div>

              <div className="glass-effect rounded-2xl p-6 hover-lift animation-delay-400">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center floating animation-delay-2000">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Отслеживание</h3>
                <p className="text-gray-600 text-sm">Получайте уведомления о снижении цен</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Popular Queries */}
        {suggestions.length > 0 && products.length === 0 && !loading && (
          <div className="mt-6 text-center fade-in-up">
            <p className="text-sm text-gray-600 mb-3">Популярные запросы:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((query, index) => (
                <button
                  key={query}
                  onClick={() => handleSearch(query)}
                  className="px-4 py-2 glass-effect rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6 fade-in-up">
            <aside className="lg:col-span-1">
              <Filters
                filters={filters}
                onFiltersChange={setFilters}
                sort={sort}
                onSortChange={setSort}
              />
              
              {compareProducts.length > 0 && (
                <div className="mt-4 glass-effect rounded-2xl p-4 hover-lift">
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
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Сравнить
                  </button>
                  <button
                    onClick={() => setCompareProducts([])}
                    className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300"
                  >
                    Очистить
                  </button>
                </div>
              )}
            </aside>

            <div className="lg:col-span-3">
              <div className="mb-4 text-gray-600 font-medium">
                Найдено товаров: <span className="text-blue-600">{total}</span>
              </div>
              <ProductList 
                products={products} 
                onCompareToggle={handleCompareToggle}
                compareProducts={compareProducts}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 fade-in">
            <div className="inline-block relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Ищем лучшие предложения...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-8 glass-effect border-2 border-red-300 rounded-2xl p-6 fade-in-up">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-150 {
          animation-delay: 0.15s;
        }
      `}</style>
    </div>
  );
}
