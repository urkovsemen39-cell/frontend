'use client';

import { getApiUrl } from '@/config/api';

import { useState, useEffect } from 'react';
import { FileText, Filter, Server, Database } from 'lucide-react';

type LogType = 'audit' | 'system';

export default function OwnerLogs({ sessionId }: { sessionId: string }) {
  const [logType, setLogType] = useState<LogType>('audit');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    if (logType === 'audit') {
      fetchAuditLogs();
    } else {
      fetchSystemLogs();
    }
    
    // Auto-refresh каждые 5 секунд
    const interval = setInterval(() => {
      if (logType === 'audit') {
        fetchAuditLogs();
      } else {
        fetchSystemLogs();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [logType, filter, levelFilter]);

  const fetchAuditLogs = async () => {
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
        setAuditLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: '200',
        ...(levelFilter && { level: levelFilter }),
      });

      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/logs/system?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSystemLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching system logs:', error);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-500/10';
      case 'warn': return 'text-yellow-400 bg-yellow-500/10';
      case 'info': return 'text-blue-400 bg-blue-500/10';
      case 'debug': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Logs</h2>
        
        <div className="flex items-center gap-4">
          {/* Log Type Selector */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setLogType('audit')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                logType === 'audit' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              Audit Logs
            </button>
            <button
              onClick={() => setLogType('system')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                logType === 'system' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Server className="w-4 h-4" />
              System Logs
            </button>
          </div>

          {/* Filters */}
          {logType === 'audit' ? (
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
          ) : (
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            >
              <option value="">All Levels</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          {logType === 'audit' ? (
            auditLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No audit logs found</p>
                <p className="text-sm mt-1">Logs will appear here as actions are performed</p>
              </div>
            ) : (
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
                  {auditLogs.map((log) => (
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
            )
          ) : (
            systemLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No system logs found</p>
                <p className="text-sm mt-1">System logs will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {systemLogs.map((log, index) => (
                  <div key={index} className="p-4 hover:bg-gray-700/50 font-mono text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-gray-500 whitespace-nowrap">{log.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="flex-1 text-gray-300">{log.message}</span>
                    </div>
                    {log.meta && Object.keys(log.meta).length > 0 && (
                      <div className="mt-2 ml-32 text-xs text-gray-500">
                        {JSON.stringify(log.meta, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
