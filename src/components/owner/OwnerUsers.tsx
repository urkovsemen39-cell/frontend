'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';
import { Search, Lock, Unlock, Shield, Mail } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  email_verified: boolean;
  account_locked: boolean;
  created_at: string;
}

export default function OwnerUsers({ sessionId }: { sessionId: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
      });

      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/users?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLockUser = async (userId: number, locked: boolean) => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/users/${userId}/lock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
          body: JSON.stringify({
            locked,
            reason: locked ? 'Locked by owner' : null,
          }),
        }
      );

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error locking user:', error);
    }
  };

  const handleChangeRole = async (userId: number, role: string) => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/users/${userId}/role`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Owner-Session': sessionId,
          },
          body: JSON.stringify({ role }),
        }
      );

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-400">Total: {total} users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{user.name || 'No name'}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {user.email_verified ? (
                      <span className="text-xs text-green-400">✓ Verified</span>
                    ) : (
                      <span className="text-xs text-yellow-400">⚠ Unverified</span>
                    )}
                    {user.account_locked && (
                      <span className="text-xs text-red-400">🔒 Locked</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleLockUser(user.id, !user.account_locked)}
                    className={`p-2 rounded-lg transition-colors ${
                      user.account_locked
                        ? 'hover:bg-green-500/20 text-green-400'
                        : 'hover:bg-red-500/20 text-red-400'
                    }`}
                    title={user.account_locked ? 'Unlock' : 'Lock'}
                  >
                    {user.account_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={users.length < 20}
          className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
