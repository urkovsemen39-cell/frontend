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

        // Если нажато 3 раза за 2 секунды - активируем
        if (newPresses.length >= 3) {
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

  if (!isActive) {
    return null;
  }

  return <OwnerPanel onClose={() => setIsActive(false)} />;
}
