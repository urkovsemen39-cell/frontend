'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { getApiUrl } from '@/config/api';

export default function PriceTrackingPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadAlerts();
  }, [page]);

  const loadAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/v1/price-tracking?page=${page}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      setAlerts(data.alerts);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(`${getApiUrl()}/api/v1/price-tracking/${alertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (err) {
      console.error('Failed to delete alert:', err);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Отслеживание цен</h1>

        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Нет активных отслеживаний</p>
            <p className="text-gray-500 text-sm mt-2">
              Добавьте товары в отслеживание из карточки товара
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{alert.product_name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{alert.marketplace}</p>
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Целевая цена: </span>
                          <span className="font-bold text-green-600">
                            {Number(alert.target_price).toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Текущая цена: </span>
                          <span className="font-bold">
                            {Number(alert.current_price).toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </div>
                      {alert.notified && (
                        <p className="mt-2 text-sm text-green-600">✓ Цена достигнута!</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Создано: {new Date(alert.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Удалить
                    </button>
                  </div>
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
