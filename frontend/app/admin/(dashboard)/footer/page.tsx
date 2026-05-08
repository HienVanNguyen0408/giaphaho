'use client';

import { useEffect, useState, FormEvent } from 'react';
import { getFooter, updateFooter } from '@/lib/api';
import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';

export default function FooterAdminPage() {
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [copyright, setCopyright] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    getFooter()
      .then((res) => {
        const d = res.data;
        setContact(d.contact);
        setDescription(d.description);
        setCopyright(d.copyright);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateFooter({ contact, description, copyright });
      setSuccess('Đã lưu cấu hình footer thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <AdminPageHeader
        title="Footer"
        eyebrow="Quản trị giao diện"
        description="Chỉnh sửa thông tin liên hệ, mô tả và bản quyền ở phần cuối website."
      />

      <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-5 lg:p-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-3 w-24 bg-stone-100 rounded mb-2" />
                <div className="h-20 bg-stone-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm lg:col-span-2">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm lg:col-span-2">
                {success}
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-2">
              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Thông tin liên hệ
                </label>
                <textarea
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  rows={6}
                  placeholder="Địa chỉ, số điện thoại, email..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors resize-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Mô tả ngắn về dòng họ..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Copyright */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Copyright
              </label>
              <input
                type="text"
                value={copyright}
                onChange={(e) => setCopyright(e.target.value)}
                placeholder="© 2024 Họ Phùng Bát Tràng. All rights reserved."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto sm:min-w-44 px-6 py-2.5 rounded-xl bg-red-800 text-white font-semibold text-sm hover:bg-red-900 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
