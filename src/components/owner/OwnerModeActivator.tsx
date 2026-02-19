'use client';

/**
 * Owner Mode Activator
 * Слушает секретную комбинацию клавиш: Ctrl+Shift+K (3 раза подряд за 2 секунды)
 * Активирует скрытую админ-панель
 */

import { useEffect, useState } from 'react';
import OwnerPanel from './OwnerPanel';

export default function OwnerModeActivator() {
  const [isActive, setIsActive] = useState(false);
  const [keyPresses, setKeyPresses] = useState<number[]>([]);

  // Проверка существующей сессии при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedSession = localStorage.getItem('owner_session');
    const savedExpiry = localStorage.getItem('owner_session_expiry');

    if (savedSession && savedExpiry) {
      const expiry = new Date(savedExpiry);
      if (expiry > new Date()) {
        // Сессия активна - автоматически открываем панель
        setIsActive(true);
      } else {
        // Сессия истекла - очищаем
        localStorage.removeItem('owner_session');
        localStorage.removeItem('owner_session_expiry');
      }
    }
  }, []);

  // Слушатель комбинации клавиш
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Проверка комбинации: Ctrl + Shift + K
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        
        const now = Date.now();
        const recentPresses = keyPresses.filter(time => now - time < 2000);
        const newPresses = [...recentPresses, now];
        
        setKeyPresses(newPresses);
        
        console.log(`Owner mode activation: ${newPresses.length}/3 presses`);

        // Если нажато 3 раза за 2 секунды - активируем
        if (newPresses.length >= 3) {
          console.log('Owner mode activated!');
          setIsActive(true);
          setKeyPresses([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyPresses]);

  // Очистка старых нажатий
  useEffect(() => {
    if (keyPresses.length > 0) {
      const timeout = setTimeout(() => {
        const now = Date.now();
        setKeyPresses(prev => prev.filter(time => now - time < 2000));
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [keyPresses]);

  // Синхронизация между вкладками через storage event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'owner_session') {
        if (e.newValue) {
          // Сессия создана в другой вкладке - открываем панель
          const savedExpiry = localStorage.getItem('owner_session_expiry');
          if (savedExpiry) {
            const expiry = new Date(savedExpiry);
            if (expiry > new Date()) {
              setIsActive(true);
            }
          }
        } else {
          // Сессия удалена в другой вкладке - закрываем панель
          setIsActive(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isActive) {
    return null;
  }

  return <OwnerPanel onClose={() => setIsActive(false)} />;
}
