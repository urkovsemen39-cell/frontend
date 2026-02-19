'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { getApiUrl } from '@/config/api';

interface PriceHistoryEntry {
  id: number;
  product_id: string;
  marketplace: string;
  price: number;
  recorded_at: string;
}

function PriceHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const marketplace = searchParams.get('marketplace');
  const productName = searchParams.get('name');

  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (productId && marketplace) {
      loadHistory();
    }
  }, [productId, marketplace, days]);

  const loadHistory = async () => {
    if (!productId || !marketplace) return;

    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/price-history/${productId}?marketplace=${marketplace}&days=${days}`
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to load price history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!productId || !marketplace) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Некорректные параметры</p>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const minPrice = history.length > 0 ? Math.min(...history.map(h => Number(h.price))) : 0;
  const maxPrice = history.length > 0 ? Math.max(...history.map(h => Number(h.price))) : 0;
  const avgPrice = history.length > 0 
    ? history.reduce((sum, h) => sum + Number(h.price), 0) / history.length 
    : 0;
  const currentPrice = history.length > 0 ? Number(history[history.length - 1].price) : 0;
  const priceChange = history.length > 1 
    ? ((currentPrice - Number(history[0].price)) / Number(history[0].price)) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Назад
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">История цен</h1>
          {productName && (
            <p className="text-gray-600">{productName}</p>
          )}
          <p className="text-sm text-gray-500">{marketplace}</p>
        </div>

        {/* Фильтр периода */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Период
          </label>
          <div className="flex gap-2">
            {[7, 14, 30, 60, 90, 180, 365].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  days === d
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d} дн.
              </button>
            ))}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Нет данных за выбранный период</p>
          </div>
        ) : (
          <>
            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Текущая цена</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentPrice.toLocaleString('ru-RU')} ₽
                </p>
                {priceChange !== 0 && (
                  <p className={`text-sm mt-1 ${priceChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {priceChange > 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(1)}%
                  </p>
                )}
              </div>

              <div className="bg-green-50 rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Минимальная</p>
                <p className="text-2xl font-bold text-green-600">
                  {minPrice.toLocaleString('ru-RU')} ₽
                </p>
              </div>

              <div className="bg-red-50 rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Максимальная</p>
                <p className="text-2xl font-bold text-red-600">
                  {maxPrice.toLocaleString('ru-RU')} ₽
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">Средняя</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(avgPrice).toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>

            {/* График (простая визуализация) */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">График изменения цены</h2>
              <div className="relative h-64">
                <svg className="w-full h-full" viewBox="0 0 800 200">
                  {/* Сетка */}
                  <line x1="0" y1="0" x2="0" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="0" y1="200" x2="800" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                  
                  {/* Линия графика */}
                  {history.length > 1 && (
                    <polyline
                      points={history.map((entry, index) => {
                        const x = (index / (history.length - 1)) * 800;
                        const y = 200 - ((Number(entry.price) - minPrice) / (maxPrice - minPrice || 1)) * 180;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                  )}
                  
                  {/* Точки */}
                  {history.map((entry, index) => {
                    const x = (index / (history.length - 1)) * 800;
                    const y = 200 - ((Number(entry.price) - minPrice) / (maxPrice - minPrice || 1)) * 180;
                    return (
                      <circle
                        key={entry.id}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#3b82f6"
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Таблица истории */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                      Цена
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                      Изменение
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((entry, index) => {
                    const prevPrice = index > 0 ? Number(history[index - 1].price) : Number(entry.price);
                    const change = Number(entry.price) - prevPrice;
                    const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0;

                    return (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(entry.recorded_at).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                          {Number(entry.price).toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          {index === 0 ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <span className={change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600'}>
                              {change > 0 ? '+' : ''}{change.toFixed(2)} ₽
                              {changePercent !== 0 && ` (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)`}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}


export default function PriceHistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PriceHistoryContent />
    </Suspense>
  );
}
