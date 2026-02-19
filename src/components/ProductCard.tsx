'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { getApiUrl } from '@/config/api';

interface ProductCardProps {
  product: Product;
  onCompareToggle?: (product: Product) => void;
  isComparing?: boolean;
}

export default function ProductCard({ product, onCompareToggle, isComparing }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    checkFavorite();
  }, [product.id]);

  const checkFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/favorites/check/${product.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (err) {
      console.error('Failed to check favorite:', err);
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Войдите, чтобы добавить в избранное');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await fetch(`${getApiUrl()}/api/v1/favorites/${product.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setIsFavorite(false);
      } else {
        await fetch(`${getApiUrl()}/api/v1/favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product),
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = async () => {
    // Трекинг клика
    try {
      const token = localStorage.getItem('token');
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${getApiUrl()}/api/v1/analytics/click`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: product.id,
          marketplace: product.marketplace,
          query: sessionStorage.getItem('lastSearchQuery') || '',
        }),
      });
    } catch (err) {
      console.error('Failed to track click:', err);
    }

    // Открываем ссылку
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };

  const handleCreatePriceAlert = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Войдите, чтобы отслеживать цены');
      return;
    }

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0 || price >= product.price) {
      alert('Введите корректную целевую цену (меньше текущей)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/price-tracking`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          marketplace: product.marketplace,
          productName: product.name,
          targetPrice: price,
          currentPrice: product.price,
          productUrl: product.url,
        }),
      });

      if (response.ok) {
        alert('✅ Отслеживание цены создано!');
        setShowPriceAlert(false);
        setTargetPrice('');
      } else {
        const data = await response.json();
        alert(data.error || 'Ошибка создания отслеживания');
      }
    } catch (err) {
      console.error('Failed to create price alert:', err);
      alert('Ошибка создания отслеживания');
    } finally {
      setLoading(false);
    }
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={toggleFavorite}
          disabled={loading}
          className={`absolute top-2 left-2 p-2 rounded-full ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
          } hover:scale-110 transition-transform`}
          title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
        {onCompareToggle && (
          <button
            onClick={() => onCompareToggle(product)}
            className={`absolute top-2 right-2 p-2 rounded-full ${
              isComparing ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
            } hover:scale-110 transition-transform`}
            title={isComparing ? 'Убрать из сравнения' : 'Добавить к сравнению'}
          >
            ⚖️
          </button>
        )}
        {discount > 0 && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            -{discount}%
          </div>
        )}
        {product.smartScore && product.smartScore > 0.8 && (
          <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm font-bold">
            Лучшее предложение
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-700 ml-1">{product.rating}</span>
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviewCount} отзывов)
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {product.price.toLocaleString('ru-RU')} ₽
            </span>
            {product.oldPrice && (
              <span className="text-sm text-gray-500 line-through">
                {product.oldPrice.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-600 mb-3">
          <div>Доставка: {product.deliveryDays} дн.</div>
          <div>
            {product.deliveryCost === 0 ? (
              <span className="text-green-600 font-medium">Бесплатно</span>
            ) : (
              `${product.deliveryCost} ₽`
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">{product.marketplace}</span>
          <button
            onClick={handleBuyClick}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Купить
          </button>
        </div>

        <button
          onClick={() => setShowPriceAlert(!showPriceAlert)}
          className="w-full text-xs text-blue-600 hover:text-blue-700 py-1"
        >
          📊 Отслеживать цену
        </button>

        <a
          href={`/price-history?productId=${product.id}&marketplace=${encodeURIComponent(product.marketplace)}&name=${encodeURIComponent(product.name)}`}
          className="block w-full text-xs text-center text-gray-600 hover:text-gray-700 py-1"
        >
          📈 История цен
        </a>

        {showPriceAlert && (
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder={`Целевая цена (< ${product.price})`}
              disabled={loading}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2 disabled:bg-gray-100"
            />
            <button
              onClick={handleCreatePriceAlert}
              disabled={loading}
              className="w-full px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
