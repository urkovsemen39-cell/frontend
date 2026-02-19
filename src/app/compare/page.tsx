'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Product } from '@/types';
import { getApiUrl } from '@/config/api';

export default function ComparePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const stored = sessionStorage.getItem('compareProducts');
      if (!stored) {
        router.push('/');
        return;
      }

      const productsData = JSON.parse(stored);
      if (productsData.length < 2) {
        alert('Выберите минимум 2 товара для сравнения');
        router.push('/');
        return;
      }

      setProducts(productsData);

      // Получаем сравнительные метрики с бэкенда
      const response = await fetch(`${getApiUrl()}/api/v1/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsData }),
      });

      if (response.ok) {
        const data = await response.json();
        setComparison(data);
      }
    } catch (err) {
      console.error('Failed to load comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    if (updated.length < 2) {
      alert('Минимум 2 товара для сравнения');
      return;
    }
    setProducts(updated);
    sessionStorage.setItem('compareProducts', JSON.stringify(updated));
    window.location.reload();
  };

  const handleClear = () => {
    sessionStorage.removeItem('compareProducts');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Нет товаров для сравнения</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Сравнение товаров ({products.length})
          </h1>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Очистить и вернуться
          </button>
        </div>

        {/* Сводка */}
        {comparison && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Сводка</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Лучшая цена</p>
                <p className="text-2xl font-bold text-green-600">
                  {comparison.bestPrice.price.toLocaleString('ru-RU')} ₽
                </p>
                <p className="text-sm text-gray-600 mt-1">{comparison.bestPrice.marketplace}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Лучший рейтинг</p>
                <p className="text-2xl font-bold text-blue-600">
                  ⭐ {comparison.bestRating.rating}
                </p>
                <p className="text-sm text-gray-600 mt-1">{comparison.bestRating.marketplace}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Быстрая доставка</p>
                <p className="text-2xl font-bold text-purple-600">
                  {comparison.fastestDelivery.deliveryDays} дн.
                </p>
                <p className="text-sm text-gray-600 mt-1">{comparison.fastestDelivery.marketplace}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Средняя цена: <span className="font-bold">{Math.round(comparison.averagePrice).toLocaleString('ru-RU')} ₽</span>
                {' • '}
                Разброс цен: <span className="font-bold">{comparison.priceRange.min.toLocaleString('ru-RU')} - {comparison.priceRange.max.toLocaleString('ru-RU')} ₽</span>
              </p>
            </div>
          </div>
        )}

        {/* Таблица сравнения */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                  Характеристика
                </th>
                {products.map((product) => (
                  <th key={product.id} className="px-4 py-3 text-center text-sm font-medium text-gray-700 min-w-[200px]">
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="float-right text-red-500 hover:text-red-700"
                      title="Удалить из сравнения"
                    >
                      ✕
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Изображения */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                  Фото
                </td>
                {products.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-32 h-32 object-cover mx-auto rounded"
                    />
                  </td>
                ))}
              </tr>

              {/* Название */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                  Название
                </td>
                {products.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-sm text-gray-900">
                    {product.name}
                  </td>
                ))}
              </tr>

              {/* Цена */}
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                  Цена
                </td>
                {products.map((product) => {
                  const isBest = comparison && product.id === comparison.bestPrice.id;
                  return (
                    <td key={product.id} className="px-4 py-3 text-center">
                      <div className={`text-2xl font-bold ${isBest ? 'text-green-600' : 'text-gray-900'}`}>
                        {product.price.toLocaleString('ru-RU')} ₽
                        {isBest && <span className="ml-2 text-sm">🏆</span>}
                      </div>
                      {product.oldPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          {product.oldPrice.toLocaleString('ru-RU')} ₽
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Рейтинг */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                  Рейтинг
                </td>
                {products.map((product) => {
                  const isBest = comparison && product.id === comparison.bestRating.id;
                  return (
                    <td key={product.id} className="px-4 py-3 text-center">
                      <div className={`text-lg font-bold ${isBest ? 'text-blue-600' : 'text-gray-900'}`}>
                        ⭐ {product.rating}
                        {isBest && <span className="ml-2 text-sm">🏆</span>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.reviewCount} отзывов
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Магазин */}
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                  Магазин
                </td>
                {products.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-center text-sm text-gray-900">
                    {product.marketplace}
                  </td>
                ))}
              </tr>

              {/* Доставка */}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                  Доставка
                </td>
                {products.map((product) => {
                  const isBest = comparison && product.id === comparison.fastestDelivery.id;
                  return (
                    <td key={product.id} className="px-4 py-3 text-center">
                      <div className={`font-bold ${isBest ? 'text-purple-600' : 'text-gray-900'}`}>
                        {product.deliveryDays} дн.
                        {isBest && <span className="ml-2 text-sm">🏆</span>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.deliveryCost === 0 ? (
                          <span className="text-green-600">Бесплатно</span>
                        ) : (
                          `${product.deliveryCost} ₽`
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Наличие */}
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                  Наличие
                </td>
                {products.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      product.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'В наличии' : 'Нет в наличии'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Smart Score */}
              {products.some(p => p.smartScore) && (
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                    Общая оценка
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-4 py-3 text-center">
                      {product.smartScore ? (
                        <div className="text-lg font-bold text-gray-900">
                          {(product.smartScore * 100).toFixed(0)}/100
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {/* Кнопки покупки */}
              <tr className="bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                  Действие
                </td>
                {products.map((product) => (
                  <td key={product.id} className="px-4 py-3 text-center">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Купить
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Рекомендация */}
        {comparison && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Наша рекомендация</h3>
            <p className="text-blue-800">
              {comparison.bestPrice.id === comparison.bestRating.id && comparison.bestPrice.id === comparison.fastestDelivery.id ? (
                <>
                  <strong>{comparison.bestPrice.marketplace}</strong> предлагает лучшее соотношение по всем параметрам: 
                  самая низкая цена, высокий рейтинг и быстрая доставка!
                </>
              ) : comparison.bestPrice.id === comparison.bestRating.id ? (
                <>
                  <strong>{comparison.bestPrice.marketplace}</strong> предлагает лучшее соотношение цены и качества.
                </>
              ) : (
                <>
                  Если важна цена — выбирайте <strong>{comparison.bestPrice.marketplace}</strong>. 
                  Если качество — <strong>{comparison.bestRating.marketplace}</strong>. 
                  Если скорость — <strong>{comparison.fastestDelivery.marketplace}</strong>.
                </>
              )}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
