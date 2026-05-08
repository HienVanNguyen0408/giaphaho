'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TabId = 'search' | 'tree' | 'news';

const TABS: { id: TabId; label: string }[] = [
  { id: 'search', label: 'Tìm Thành Viên' },
  { id: 'tree', label: 'Khám Phá Gia Phả' },
  { id: 'news', label: 'Tin Tức & Sự Kiện' },
];

export default function HeroSearchWidget() {
  const [activeTab, setActiveTab] = useState<TabId>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [generation, setGeneration] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (generation) params.set('generation', generation);
    router.push(`/tim-kiem${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{
        boxShadow: '0 12px 48px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.06)',
      }}
    >
      {/* Tab bar */}
      <div className="flex" role="tablist" aria-label="Chức năng tìm kiếm">
        {TABS.map(({ id, label }, i) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className="flex-1 px-2 py-3.5 text-xs sm:text-sm font-semibold transition-all duration-150 border-b-[3px]"
            style={
              activeTab === id
                ? {
                    background: 'var(--t-surface, #fff)',
                    color: 'var(--t-nav-bg)',
                    borderBottomColor: 'var(--t-nav-bg)',
                    borderRight: i < TABS.length - 1 ? '1px solid color-mix(in oklch, var(--t-border) 40%, transparent)' : 'none',
                  }
                : {
                    background: 'color-mix(in oklch, var(--t-surface-2, #f5ede0) 50%, var(--t-surface, #fff))',
                    color: 'var(--t-text-3)',
                    borderBottomColor: 'var(--t-border)',
                    borderRight: i < TABS.length - 1 ? '1px solid color-mix(in oklch, var(--t-border) 40%, transparent)' : 'none',
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        {activeTab === 'search' && (
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label
                htmlFor="hero-search-name"
                className="block text-[10px] uppercase tracking-widest font-semibold mb-1.5"
                style={{ color: 'var(--t-text-3)' }}
              >
                Họ và tên
              </label>
              <input
                id="hero-search-name"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên thành viên cần tìm..."
                className="w-full border rounded-lg px-4 py-2.5 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 transition-all"
                style={{
                  color: 'var(--t-text)',
                  background: 'var(--t-surface)',
                  borderColor: 'var(--t-border)',
                  '--tw-ring-color': 'color-mix(in oklch, var(--t-accent) 30%, transparent)',
                } as React.CSSProperties}
              />
            </div>
            <div className="sm:w-44">
              <label
                htmlFor="hero-search-gen"
                className="block text-[10px] uppercase tracking-widest font-semibold mb-1.5"
                style={{ color: 'var(--t-text-3)' }}
              >
                Đời / Thế hệ
              </label>
              <select
                id="hero-search-gen"
                value={generation}
                onChange={(e) => setGeneration(e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  color: 'var(--t-text)',
                  background: 'var(--t-surface)',
                  borderColor: 'var(--t-border)',
                }}
              >
                <option value="">Tất cả các đời</option>
                {Array.from({ length: 20 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    Đời thứ {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:self-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  background: 'var(--t-nav-bg)',
                  color: 'var(--t-nav-text)',
                  boxShadow: '0 4px 14px -4px color-mix(in oklch, var(--t-nav-bg) 60%, transparent)',
                }}
              >
                Tìm Kiếm
              </button>
            </div>
          </form>
        )}

        {activeTab === 'tree' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--t-text)' }}>
                Khám phá cây gia phả với hàng nghìn thành viên qua 30+ thế hệ
              </p>
              <p className="text-xs" style={{ color: 'var(--t-text-3)' }}>
                Xem sơ đồ quan hệ dòng tộc · Tìm nguồn gốc tổ tiên
              </p>
            </div>
            <Link
              href="/gia-pha"
              className="shrink-0 px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5"
              style={{
                background: 'var(--t-nav-bg)',
                color: 'var(--t-nav-text)',
                boxShadow: '0 4px 14px -4px color-mix(in oklch, var(--t-nav-bg) 60%, transparent)',
              }}
            >
              Xem Gia Phả
            </Link>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-1">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--t-text)' }}>
                Cập nhật tin tức, sự kiện và hoạt động mới nhất của dòng họ
              </p>
              <p className="text-xs" style={{ color: 'var(--t-text-3)' }}>
                Thông báo hội họp · Lễ giỗ · Các hoạt động cộng đồng
              </p>
            </div>
            <Link
              href="/tin-tuc"
              className="shrink-0 px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5"
              style={{
                background: 'var(--t-nav-bg)',
                color: 'var(--t-nav-text)',
                boxShadow: '0 4px 14px -4px color-mix(in oklch, var(--t-nav-bg) 60%, transparent)',
              }}
            >
              Xem Tin Tức
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
