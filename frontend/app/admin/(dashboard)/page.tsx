'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/api';
import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
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
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Tổng quan"
        eyebrow="Bảng điều khiển"
        description={
          <>
            Chào mừng trở lại, <span className="font-medium text-stone-700">{user?.username}</span>
          </>
        }
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

    </div>
  );
}
