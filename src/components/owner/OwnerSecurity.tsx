'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/config/api';
import { AlertTriangle, Shield, Ban } from 'lucide-react';

export default function OwnerSecurity({ sessionId }: { sessionId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const [ipBlocks, setIpBlocks] = useState<any[]>([]);

  useEffect(() => {
    fetchSecurityEvents();
    fetchIPBlocks();
  }, []);

  const fetchSecurityEvents = async () => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/security/events?limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching security events:', error);
    }
  };

  const fetchIPBlocks = async () => {
    try {
      const response = await fetch(
        `${getApiUrl()}/api/v1/owner/security/ip-blocks`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setIpBlocks(data.blocks);
      }
    } catch (error) {
      console.error('Error fetching IP blocks:', error);
    }
  };

  const handleResolveEvent = async (eventId: number) => {
    try {
      await fetch(
        `${getApiUrl()}/api/v1/owner/security/events/${eventId}/resolve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );
      fetchSecurityEvents();
    } catch (error) {
      console.error('Error resolving event:', error);
    }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      await fetch(
        `${getApiUrl()}/api/v1/owner/security/ip-blocks/${ip}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'X-Owner-Session': sessionId,
          },
        }
      );
      fetchIPBlocks();
    } catch (error) {
      console.error('Error unblocking IP:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-blue-400 bg-blue-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Security Center</h2>

      {/* Security Events */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Security Events
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                    {event.severity}
                  </span>
                  <span className="font-medium">{event.event_type}</span>
                </div>
                <div className="text-sm text-gray-400">
                  IP: {event.ip_address} • {new Date(event.created_at).toLocaleString()}
                </div>
              </div>
              {!event.resolved && (
                <button
                  onClick={() => handleResolveEvent(event.id)}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-sm"
                >
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* IP Blocks */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Ban className="w-5 h-5" />
          Blocked IPs
        </h3>
        <div className="space-y-2">
          {ipBlocks.map((block) => (
            <div
              key={block.id}
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg"
            >
              <div>
                <div className="font-mono">{block.ip_address}</div>
                <div className="text-sm text-gray-400">{block.reason}</div>
              </div>
              <button
                onClick={() => handleUnblockIP(block.ip_address)}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
