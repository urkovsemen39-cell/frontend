'use client';

/**
 * Owner Panel - Скрытая админ-панель
 * Активируется комбинацией Ctrl+Shift+K (3 раза)
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { getApiUrl } from '@/config/api';
import OwnerAuth from './OwnerAuth';
import OwnerDashboard from './OwnerDashboard';
import OwnerUsers from './OwnerUsers';
import OwnerSecurity from './OwnerSecurity';
import OwnerSystem from './OwnerSystem';
import OwnerLogs from './OwnerLogs';
import OwnerBackup from './OwnerBackup';

interface OwnerPanelProps {
  onClose: () => void;
}

type Tab = 'dashboard' | 'users' | 'security' | 'system' | 'backup' | 'logs';

export default function OwnerPanel({ onClose }: OwnerPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  // Проверка сессии при монтировании
  useEffect(() => {
    const savedSession = localStorage.getItem('owner_session');
    const savedExpiry = localStorage.getItem('owner_session_expiry');

    if (savedSession && savedExpiry) {
      const expiry = new Date(savedExpiry);
      if (expiry > new Date()) {
        setSessionId(savedSession);
        setExpiresAt(expiry);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('owner_session');
        localStorage.removeItem('owner_session_expiry');
      }
    }
  }, []);

  // Таймер до истечения сессии
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      if (now >= expiresAt) {
        handleLogout();
      }
    }, 60000); // Проверка каждую минуту

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleAuthSuccess = (session: string, expiry: Date) => {
    setSessionId(session);
    setExpiresAt(expiry);
    setIsAuthenticated(true);
    localStorage.setItem('owner_session', session);
    localStorage.setItem('owner_session_expiry', expiry.toISOString());
  };

  const handleLogout = async () => {
    if (sessionId) {
      try {
        await fetch(`${getApiUrl()}/api/v1/owner/deactivate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
        });
      } catch (error) {
        console.error('Error deactivating owner mode:', error);
      }
    }

    setIsAuthenticated(false);
    setSessionId(null);
    setExpiresAt(null);
    localStorage.removeItem('owner_session');
    localStorage.removeItem('owner_session_expiry');
    onClose();
  };

  const handleClose = () => {
    // Просто закрываем панель без удаления сессии
    onClose();
  };

  const getTimeRemaining = () => {
    if (!expiresAt) return '';
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl w-[95vw] h-[90vh] flex flex-col overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold">👑 Owner Panel</h2>
            {isAuthenticated && expiresAt && (
              <span className="text-sm opacity-80">
                Session expires in: {getTimeRemaining()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close (session remains active)"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-sm"
              title="Logout and end session"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <OwnerAuth onSuccess={handleAuthSuccess} />
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
              <nav className="space-y-2">
                {[
                  { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
                  { id: 'users', label: '👥 Users', icon: '👥' },
                  { id: 'security', label: '🔒 Security', icon: '🔒' },
                  { id: 'system', label: '⚙️ System', icon: '⚙️' },
                  { id: 'backup', label: '💾 Backup', icon: '💾' },
                  { id: 'logs', label: '📝 Logs', icon: '📝' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'dashboard' && <OwnerDashboard sessionId={sessionId!} />}
              {activeTab === 'users' && <OwnerUsers sessionId={sessionId!} />}
              {activeTab === 'security' && <OwnerSecurity sessionId={sessionId!} />}
              {activeTab === 'system' && <OwnerSystem sessionId={sessionId!} />}
              {activeTab === 'backup' && <OwnerBackup sessionId={sessionId!} />}
              {activeTab === 'logs' && <OwnerLogs sessionId={sessionId!} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
