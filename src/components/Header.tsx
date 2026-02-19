'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OwnerPanel from './owner/OwnerPanel';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  // Проверка - является ли пользователь админом или owner
  const isAdmin = user && (user.role === 'admin' || user.role === 'owner');

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">SmartPrice</h1>
            </Link>

            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/favorites"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Избранное
                  </Link>
                  <Link
                    href="/price-tracking"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Отслеживание цен
                  </Link>
                  
                  {/* Кнопка админки - видна только для admin */}
                  {isAdmin && (
                    <button
                      onClick={() => setShowOwnerPanel(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
                      title="Панель администратора"
                    >
                      👑 Админка
                    </button>
                  )}
                  
                  <span className="text-gray-600">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Регистрация
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Owner Panel */}
      {showOwnerPanel && (
        <OwnerPanel onClose={() => setShowOwnerPanel(false)} />
      )}
    </>
  );
}
