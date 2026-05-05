'use client';

import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '@/lib/api';
import type { Notification } from '@/types';

const typeBadgeClass: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  success: 'bg-green-100 text-green-700',
};

export default function NotificationAdminPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications()
      .then((res) => setNotifications(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    setMarkingId(id);
    try {
      await markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Thông báo</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          {unreadCount > 0 ? (
            <span>
              <span className="font-semibold text-red-600">{unreadCount}</span> thông báo chưa đọc
            </span>
          ) : (
            'Không có thông báo chưa đọc'
          )}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="h-4 flex-1 bg-stone-100 rounded" />
                <div className="h-4 w-20 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-5 py-12 text-center text-stone-400 text-sm">
            Không có thông báo nào
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  !n.isRead ? 'bg-stone-50' : ''
                }`}
              >
                {/* Unread dot */}
                <div className="mt-1.5 flex-shrink-0">
                  {!n.isRead ? (
                    <span className="w-2 h-2 rounded-full bg-red-500 block" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-stone-200 block" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? 'font-medium text-stone-900' : 'text-stone-600'}`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        typeBadgeClass[n.type] ?? 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {n.type}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                {/* Mark read */}
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    disabled={markingId === n.id}
                    className="flex-shrink-0 text-xs font-medium text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {markingId === n.id ? '...' : 'Đánh dấu đã đọc'}
                  </button>
                )}
                {n.isRead && (
                  <span className="flex-shrink-0 text-xs text-stone-300 px-3 py-1.5">
                    Đã đọc
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
