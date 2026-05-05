'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/api';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import type { DashboardStats } from '@/types';

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | undefined;
  icon: string;
  color: string;
}) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-stone-200 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold text-stone-900">
        {value === undefined ? (
          <div className="h-8 w-16 bg-stone-100 animate-pulse rounded-lg" />
        ) : (
          value.toLocaleString()
        )}
      </div>
      <p className="text-xs text-stone-500 mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu'));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Tổng quan</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Chào mừng trở lại, <span className="font-medium">{user?.username}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Thành viên"
          value={stats?.totalMembers}
          icon="👨‍👩‍👧‍👦"
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="Tin tức"
          value={stats?.totalNews}
          icon="📰"
          color="bg-green-100 text-green-700"
        />
        <StatCard
          label="Video"
          value={stats?.totalVideos}
          icon="▶️"
          color="bg-purple-100 text-purple-700"
        />
        <StatCard
          label="Thông báo chưa đọc"
          value={stats?.unreadNotifications}
          icon="🔔"
          color="bg-amber-100 text-amber-700"
        />
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-800">Hoạt động gần đây</h2>
        </div>
        {!stats ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-4 w-24 bg-stone-100 rounded" />
                <div className="h-4 w-32 bg-stone-100 rounded" />
                <div className="h-4 w-20 bg-stone-100 rounded" />
                <div className="h-4 flex-1 bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : stats.recentLogs.length === 0 ? (
          <div className="px-5 py-10 text-center text-stone-400 text-sm">
            Chưa có hoạt động nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Hành động
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Đối tượng
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {stats.recentLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3 text-stone-700 font-medium">
                      {log.user?.username ?? log.userId}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-xs font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-500">{log.target}</td>
                    <td className="px-5 py-3 text-stone-400 text-xs">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
