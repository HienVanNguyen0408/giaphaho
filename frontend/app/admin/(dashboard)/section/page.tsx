'use client';

import { useEffect, useState, FormEvent } from 'react';
import { getSections, createSection, toggleSection, deleteSection } from '@/lib/api';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Section } from '@/types';

export default function SectionAdminPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchSections = () => {
    setLoading(true);
    getSections(true)
      .then((res) => setSections(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await createSection({ name: newName.trim() });
      setNewName('');
      fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm section thất bại');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (section: Section) => {
    setTogglingId(section.id);
    try {
      await toggleSection(section.id);
      fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSection(deleteTarget.id);
      setDeleteTarget(null);
      fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Mục trang chủ</h1>
        <p className="text-stone-500 text-sm mt-0.5">Quản lý các mục hiển thị trên trang chủ</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Add form */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-stone-800 mb-3">Thêm mục mới</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tên mục (VD: Gia phả, Tin tức...)"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-stone-800 hover:bg-stone-900 rounded-xl transition-colors disabled:opacity-60"
          >
            {adding ? '...' : 'Thêm'}
          </button>
        </form>
      </div>

      {/* Section list */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-40 bg-stone-100 rounded" />
                <div className="h-8 w-24 bg-stone-100 rounded-lg" />
              </div>
            ))}
          </div>
        ) : sections.length === 0 ? (
          <div className="px-5 py-10 text-center text-stone-400 text-sm">Chưa có mục nào</div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {sections.map((section) => (
              <li
                key={section.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-400 font-mono w-5 text-center">
                    {section.order}
                  </span>
                  <span className="font-medium text-stone-800 text-sm">{section.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggle(section)}
                    disabled={togglingId === section.id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                      section.isActive ? 'bg-green-500' : 'bg-stone-300'
                    }`}
                    role="switch"
                    aria-checked={section.isActive}
                    aria-label={section.isActive ? 'Đang hiện' : 'Đang ẩn'}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        section.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs ${section.isActive ? 'text-green-600' : 'text-stone-400'}`}>
                    {section.isActive ? 'Hiện' : 'Ẩn'}
                  </span>
                  <button
                    onClick={() => setDeleteTarget(section)}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa mục"
        message={`Bạn có chắc muốn xóa mục "${deleteTarget?.name}"?`}
        confirmText={deleting ? 'Đang xóa...' : 'Xóa'}
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
