'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAnalyticsSummary } from '@/lib/api';
import AdminPageHeader, { AdminMetaChip } from '@/components/admin/ui/AdminPageHeader';
import type { AnalyticsSummary } from '@/types';

function formatNumber(value: number | undefined): string {
  return value === undefined ? '-' : value.toLocaleString('vi-VN');
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    page_view: 'Xem trang',
    video_view: 'Xem video',
  };
  return labels[type] ?? type;
}

function formatTarget(type: string | null): string {
  const labels: Record<string, string> = {
    news: 'Tin tức',
    news_list: 'Danh sách tin',
    video: 'Video',
    family_tree: 'Gia phả',
    member: 'Thành viên',
    search: 'Tìm kiếm',
    page: 'Trang',
  };
  return type ? labels[type] ?? type : 'Trang';
}

function StatCard({ label, value, hint }: { label: string; value: number | undefined; hint: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">{label}</p>
      <div className="mt-3 text-3xl font-bold text-stone-950">{formatNumber(value)}</div>
      <p className="mt-2 text-xs leading-5 text-stone-500">{hint}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsSummary(7)
      .then((res) => setSummary(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu truy cập'))
      .finally(() => setLoading(false));
  }, []);

  const maxDaily = useMemo(
    () => Math.max(1, ...(summary?.dailyViews.map((item) => item.views) ?? [1])),
    [summary],
  );

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="Giám sát truy cập"
        eyebrow="Website client"
        description="Theo dõi lượt truy cập, nội dung được quan tâm và các hành vi xem tin tức, video trên website."
        meta={<AdminMetaChip label="Khoảng thời gian" value="7 ngày gần nhất" tone="blue" />}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Tổng lượt xem" value={summary?.totalViews} hint="Toàn bộ lượt xem trang đã ghi nhận." />
        <StatCard label="Hôm nay" value={summary?.todayViews} hint="Lượt xem phát sinh trong ngày hiện tại." />
        <StatCard label="Người quan tâm" value={summary?.uniqueVisitors} hint="Số visitor riêng trong 7 ngày." />
        <StatCard label="Xem tin tức" value={summary?.newsViews} hint="Lượt xem các trang tin và bài viết." />
        <StatCard label="Xem video" value={summary?.videoViews} hint="Lượt xem trang video và video nhúng." />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900">Lưu lượng 7 ngày</h2>
            {loading && <span className="text-xs text-stone-400">Đang tải...</span>}
          </div>
          <div className="flex h-64 items-end gap-3">
            {(summary?.dailyViews ?? Array.from({ length: 7 }, (_, i) => ({ date: `--${i}`, views: 0 }))).map((item) => {
              const height = Math.max(8, Math.round((item.views / maxDaily) * 100));
              return (
                <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-48 w-full items-end rounded-xl bg-stone-50 px-2">
                    <div
                      className="w-full rounded-t-lg bg-red-700 transition-all"
                      style={{ height: `${height}%` }}
                      title={`${item.views} lượt xem`}
                    />
                  </div>
                  <span className="text-[11px] text-stone-500">
                    {new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-stone-900">Trang được xem nhiều</h2>
          <div className="space-y-3">
            {(summary?.topPages ?? []).length === 0 && (
              <p className="py-10 text-center text-sm text-stone-400">Chưa có dữ liệu truy cập.</p>
            )}
            {summary?.topPages.map((page, index) => (
              <div key={page.path} className="flex items-center gap-3 rounded-xl border border-stone-100 p-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-xs font-semibold text-stone-600">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-800">{page.path}</p>
                  <p className="text-xs text-stone-400">{page.views.toLocaleString('vi-VN')} lượt xem</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-5 py-4">
          <h2 className="text-base font-semibold text-stone-900">Truy cập gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-[0.08em] text-stone-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Hành vi</th>
                <th className="px-5 py-3 font-semibold">Nội dung</th>
                <th className="px-5 py-3 font-semibold">Đường dẫn</th>
                <th className="px-5 py-3 font-semibold">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(summary?.recentEvents ?? []).map((event) => (
                <tr key={event.id}>
                  <td className="px-5 py-3 text-stone-700">{formatEventType(event.eventType)}</td>
                  <td className="px-5 py-3 text-stone-500">{formatTarget(event.targetType)}</td>
                  <td className="max-w-[340px] truncate px-5 py-3 text-stone-500">{event.path}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-stone-400">
                    {new Date(event.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
              {!loading && (summary?.recentEvents ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-stone-400">
                    Chưa có lượt truy cập nào được ghi nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
