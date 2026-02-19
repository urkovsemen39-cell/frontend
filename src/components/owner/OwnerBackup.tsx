'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';
import { Database, Download, Trash2, RefreshCw, HardDrive, Calendar, FileArchive } from 'lucide-react';

interface Backup {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  components: string[];
}

interface BackupStats {
  total_backups: number;
  total_size: number;
  last_backup: string;
  oldest_backup: string;
}

export default function OwnerBackup({ sessionId }: { sessionId: string }) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/backup/list`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!confirm('Create full system backup? This may take a few minutes.')) {
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/backup/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );

      if (response.ok) {
        alert('Backup started in background. Refresh in a few minutes to see the result.');
        // Обновление списка через 30 секунд
        setTimeout(fetchBackups, 30000);
      } else {
        alert('Failed to start backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to start backup');
    } finally {
      setCreating(false);
    }
  };

  const handleInstantBackup = async () => {
    setCreating(true);
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/backup/instant`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smartprice-backup-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to create instant backup');
      }
    } catch (error) {
      console.error('Error creating instant backup:', error);
      alert('Failed to create instant backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (backupId: string, filename: string) => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/backup/download/${backupId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download backup');
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert('Failed to download backup');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/backup/${backupId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );

      if (response.ok) {
        fetchBackups();
      } else {
        alert('Failed to delete backup');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('Failed to delete backup');
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Backup</h2>
          <p className="text-gray-400">Full system backup & restore</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchBackups}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleInstantBackup}
            disabled={creating}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {creating ? 'Creating...' : 'Instant Download'}
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            {creating ? 'Creating...' : 'Create Backup'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <FileArchive className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Total Backups</span>
            </div>
            <p className="text-2xl font-bold">{stats.total_backups}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <HardDrive className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Total Size</span>
            </div>
            <p className="text-2xl font-bold">{formatSize(stats.total_size || 0)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Last Backup</span>
            </div>
            <p className="text-sm font-medium">
              {stats.last_backup ? new Date(stats.last_backup).toLocaleDateString() : 'Never'}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-gray-400">Oldest Backup</span>
            </div>
            <p className="text-sm font-medium">
              {stats.oldest_backup ? new Date(stats.oldest_backup).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Backup Info */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-lg font-semibold mb-3">What's Included in Backup?</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: '🗄️', label: 'Database', desc: 'PostgreSQL dump' },
            { icon: '⚡', label: 'Redis', desc: 'Cache data' },
            { icon: '📁', label: 'Files', desc: 'Uploaded files' },
            { icon: '⚙️', label: 'Config', desc: 'Configuration' },
            { icon: '📝', label: 'Logs', desc: 'Recent logs' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Available Backups</h3>
        </div>
        
        {backups.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No backups yet</p>
            <p className="text-sm mt-2">Create your first backup to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="px-6 py-4 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileArchive className="w-5 h-5 text-purple-400" />
                      <span className="font-medium">{backup.filename}</span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                        {formatSize(backup.size)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(backup.created_at).toLocaleString()}
                      </span>
                      <span>
                        Components: {backup.components.join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadBackup(backup.id, backup.filename)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-400 mb-1">Important Notes</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Backups are stored on the server and count towards storage limits</li>
              <li>• Maximum 10 backups are kept automatically (oldest are deleted)</li>
              <li>• Download backups to local storage for long-term archival</li>
              <li>• Backup process may take 1-5 minutes depending on data size</li>
              <li>• Secrets (passwords, API keys) are NOT included for security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
