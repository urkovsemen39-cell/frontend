'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';
import { Users, Activity, Shield, Database, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardData {
  users: {
    total_users: number;
    verified_users: number;
    locked_users: number;
    new_users_24h: number;
    new_users_7d: number;
  };
  activity: {
    total_searches: number;
    active_users: number;
    searches_24h: number;
  };
  security: {
    total_events: number;
    critical_events: number;
    high_events: number;
    unresolved_events: number;
  };
  system: {
    database: any;
    cache: any;
  };
}

interface OwnerDashboardProps {
  sessionId: string;
}

export default function OwnerDashboard({ sessionId }: OwnerDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeStats, setRealtimeStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchRealtimeStats();

    // Обновление real-time данных каждые 10 секунд
    const interval = setInterval(fetchRealtimeStats, 10000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/owner/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-Owner-Session': sessionId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeStats = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/owner/realtime/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'X-Owner-Session': sessionId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRealtimeStats(data);
      }
    } catch (error) {
      console.error('Error fetching realtime stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-gray-400">Failed to load dashboard data</div>;
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-gray-400">Real-time system statistics and metrics</p>
      </div>

      {/* Real-time Stats */}
      {realtimeStats && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="text-lg font-semibold">Live Activity</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{realtimeStats.activeUsers}</p>
              <p className="text-sm text-gray-400">Active Users (5 min)</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{realtimeStats.recentSearches?.length || 0}</p>
              <p className="text-sm text-gray-400">Recent Searches</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{realtimeStats.recentRegistrations?.length || 0}</p>
              <p className="text-sm text-gray-400">New Registrations</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={data.users.total_users}
          subtitle={`+${data.users.new_users_24h} today`}
          color="blue"
        />
        <StatCard
          icon={Activity}
          title="Active Users"
          value={data.activity.active_users}
          subtitle={`${data.activity.searches_24h} searches today`}
          color="green"
        />
        <StatCard
          icon={Shield}
          title="Security Events"
          value={data.security.unresolved_events}
          subtitle={`${data.security.critical_events} critical`}
          color="red"
        />
        <StatCard
          icon={Database}
          title="Cache Hit Rate"
          value={`${Math.round((data.system.cache?.hitRate || 0) * 100)}%`}
          subtitle="Performance metric"
          color="purple"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Stats */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Verified Users</span>
              <span className="font-semibold">{data.users.verified_users}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Locked Accounts</span>
              <span className="font-semibold text-red-400">{data.users.locked_users}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">New (7 days)</span>
              <span className="font-semibold text-green-400">+{data.users.new_users_7d}</span>
            </div>
          </div>
        </div>

        {/* Security Stats */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Events (24h)</span>
              <span className="font-semibold">{data.security.total_events}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">High Severity</span>
              <span className="font-semibold text-orange-400">{data.security.high_events}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Critical</span>
              <span className="font-semibold text-red-400">{data.security.critical_events}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {realtimeStats?.recentSearches && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
          <div className="space-y-2">
            {realtimeStats.recentSearches.slice(0, 5).map((search: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">{search.query}</span>
                <span className="text-gray-500">
                  {new Date(search.searched_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
