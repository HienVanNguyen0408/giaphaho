'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { normalizeImageUrl } from '@/lib/imageUrl';

interface ImageUrlInputProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  placeholder?: string;
  /** Show a preview banner above the input (default: true) */
  showPreview?: boolean;
  /** Extra class for the wrapper */
  className?: string;
}

type Status = 'idle' | 'loading' | 'valid' | 'error';

export default function ImageUrlInput({
  value,
  onChange,
  label,
  placeholder = 'Dán link ảnh (Google Images, Google Drive, Imgur, .jpg/.png...)',
  showPreview = true,
  className = '',
}: ImageUrlInputProps) {
  const [inputText, setInputText] = useState(value ?? '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(value);
  const [status, setStatus] = useState<Status>(value ? 'valid' : 'idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Sync when external value is reset to null
  useEffect(() => {
    if (!value) {
      setInputText('');
      setPreviewUrl(null);
      setStatus('idle');
    }
  }, [value]);

  const tryLoad = useCallback(
    (rawUrl: string) => {
      const url = rawUrl.trim();
      if (!url) {
        setPreviewUrl(null);
        setStatus('idle');
        onChange(null);
        return;
      }
      const normalized = normalizeImageUrl(url);
      setPreviewUrl(normalized);
      setStatus('loading');

      // Cancel previous attempt
      if (imgRef.current) {
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
        imgRef.current.src = '';
      }
      const img = new window.Image();
      imgRef.current = img;
      img.onload = () => {
        setStatus('valid');
        onChange(normalized);
      };
      img.onerror = () => {
        setStatus('error');
        setPreviewUrl(null);
        onChange(null);
      };
      img.src = normalized;
    },
    [onChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    setStatus('idle');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => tryLoad(val), 700);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Slight delay so input value is updated before we read it
    setTimeout(() => tryLoad(pasted), 0);
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInputText('');
    setPreviewUrl(null);
    setStatus('idle');
    onChange(null);
  };

  const borderColor =
    status === 'valid'
      ? 'var(--t-success)'
      : status === 'error'
        ? 'var(--t-error)'
        : 'var(--t-border)';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--t-text-2)' }}>
          {label}
        </label>
      )}

      {/* Preview */}
      {showPreview && previewUrl && (
        <div
          className="mb-3 relative w-full h-40 rounded-xl overflow-hidden border"
          style={{ borderColor: 'var(--t-border)', background: 'var(--t-surface-2)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className="w-full h-full object-cover" />
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
              <span className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          {status === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: 'rgba(0,0,0,0.45)' }}>
              <svg className="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-xs text-white/70">Không tải được ảnh</span>
            </div>
          )}
        </div>
      )}

      {/* Input row */}
      <div className="relative">
        <input
          type="text"
          value={inputText}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors"
          style={{
            borderColor,
            background: 'var(--t-surface)',
            color: 'var(--t-text)',
            paddingRight: inputText ? '4rem' : '2.5rem',
          }}
        />

        {/* Status icon + clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {status === 'loading' && (
            <span
              className="w-4 h-4 border-2 rounded-full animate-spin flex-shrink-0"
              style={{ borderColor: 'var(--t-border)', borderTopColor: 'var(--t-text-2)' }}
            />
          )}
          {status === 'valid' && (
            <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--t-success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === 'error' && (
            <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--t-error)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {inputText && (
            <button
              type="button"
              onClick={handleClear}
              className="w-5 h-5 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              style={{ background: 'var(--t-surface-2)', color: 'var(--t-text-3)' }}
              title="Xóa"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status hint */}
      {status === 'error' && (
        <p className="text-xs mt-1.5" style={{ color: 'var(--t-error)' }}>
          Không tải được ảnh. Kiểm tra lại link hoặc quyền truy cập công khai.
        </p>
      )}
      {status === 'idle' && !inputText && (
        <p className="text-[11px] mt-1.5" style={{ color: 'var(--t-text-3)' }}>
          Hỗ trợ: Google Images, Google Drive (chia sẻ công khai), Imgur, link ảnh trực tiếp
        </p>
      )}
    </div>
  );
}
