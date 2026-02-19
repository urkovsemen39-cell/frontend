'use client';

import { getApiUrl } from '@/config/api';

import { useState, useEffect } from 'react';
import { FileText, Filter } from 'lucide-react';

export default function OwnerLogs({ sessionId }: { sessionId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100',
        ...(filter && { action: filter }),
      });

      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/audit/logs?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
        >
          <option value="">All Actions</option>
          <option value="USER_LOGIN">Login</option>
          <option value="USER_LOGOUT">Logout</option>
          <option value="USER_LOCKED">User Locked</option>
          <option value="USER_UNLOCKED">User Unlocked</option>
          <option value="OWNER_MODE_ACTIVATED">Owner Mode</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-900 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{log.action}</td>
                  <td className="px-6 py-4 text-sm">User #{log.user_id}</td>
                  <td className="px-6 py-4 text-sm font-mono">{log.ip_address}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {log.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
