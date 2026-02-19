'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import { getApiUrl } from '@/config/api';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadFavorites();
  }, [page]);

  const loadFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/v1/favorites?page=${page}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load favorites');
      }

      const data = await response.json();
      setFavorites(data.favorites);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(`${getApiUrl()}/api/v1/favorites/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setFavorites(favorites.filter(f => f.product_id !== productId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Избранное</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Нет избранных товаров</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((fav) => (
                <div key={fav.id} className="relative">
                  <ProductCard
                    product={{
                      id: fav.product_id,
                      name: fav.product_name,
                      price: Number(fav.product_price),
                      rating: 0,
                      reviewCount: 0,
                      image: fav.product_image,
                      url: fav.product_url,
                      marketplace: fav.marketplace,
                      deliveryDays: 0,
                      deliveryCost: 0,
                      inStock: true,
                    }}
                  />
                  <button
                    onClick={() => handleRemove(fav.product_id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Назад
                </button>
                <span className="px-4 py-2 bg-white border border-gray-300 rounded">
                  Страница {page} из {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Вперед →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
