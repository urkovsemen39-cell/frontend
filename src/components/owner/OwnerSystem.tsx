'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';
import { Database, Zap, Trash2 } from 'lucide-react';

export default function OwnerSystem({ sessionId }: { sessionId: string }) {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/system/metrics`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleClearCache = async (pattern?: string) => {
    try {
      await fetch(
        `${getApiUrl()}/api/v1/owner/cache/clear`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
          body: JSON.stringify({ pattern }),
        }
      );
      alert('Cache cleared successfully');
      fetchMetrics();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  if (!metrics) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Metrics</h2>

      {/* Database Stats */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold">{metrics.database?.totalConnections || 0}</p>
            <p className="text-sm text-gray-400">Total Connections</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{metrics.database?.activeConnections || 0}</p>
            <p className="text-sm text-gray-400">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{metrics.database?.idleConnections || 0}</p>
            <p className="text-sm text-gray-400">Idle</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{metrics.database?.waitingConnections || 0}</p>
            <p className="text-sm text-gray-400">Waiting</p>
          </div>
        </div>
      </div>

      {/* Cache Stats */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Cache
          </h3>
          <button
            onClick={() => handleClearCache()}
            className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold">{Math.round((metrics.cache?.hitRate || 0) * 100)}%</p>
            <p className="text-sm text-gray-400">Hit Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{metrics.cache?.hits || 0}</p>
            <p className="text-sm text-gray-400">Hits</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{metrics.cache?.misses || 0}</p>
            <p className="text-sm text-gray-400">Misses</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{metrics.cache?.keys || 0}</p>
            <p className="text-sm text-gray-400">Keys</p>
          </div>
        </div>
      </div>

      {/* Redis Status */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Redis Status</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${metrics.redis?.connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>{metrics.redis?.connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  );
}
