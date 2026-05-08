import { cacheLife } from 'next/cache';
import { getFooter } from '@/lib/api';
import Link from 'next/link';
import type { FooterConfig } from '@/types';

async function getFooterData(): Promise<{ footer: FooterConfig | null; year: number }> {
  'use cache';
  cacheLife('hours');
  const year = new Date().getFullYear();
  try {
    const res = await getFooter();
    return { footer: res.data, year };
  } catch {
    return { footer: null, year };
  }
}

export default async function Footer() {
  const { footer, year } = await getFooterData();

  return (
    <footer
      className="mt-auto"
      style={{ background: 'var(--t-footer-bg)', borderTop: '2px solid var(--t-footer-accent)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--t-footer-accent)' }}
              >
                <span
                  className="font-bold text-base leading-none select-none"
                  style={{ color: 'var(--t-nav-active-text)', fontFamily: 'var(--t-display-font)' }}
                >
                  鳳
                </span>
              </div>
              <span
                className="font-semibold text-lg"
                style={{ color: 'var(--t-footer-accent)', fontFamily: 'var(--t-display-font)' }}
              >
                Họ Phùng Bát Tràng
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--t-footer-text)' }}>
              {footer?.description ?? 'Nơi lưu giữ và phát huy truyền thống tốt đẹp của dòng họ Phùng Bát Tràng qua bao thế hệ.'}
            </p>
          </div>

          {/* Nav */}
          <div>
            <h3
              className="text-xs uppercase tracking-widest mb-4 font-semibold"
              style={{ color: 'var(--t-footer-accent)' }}
            >
              Điều hướng
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Trang chủ' },
                { href: '/gia-pha', label: 'Gia phả' },
                { href: '/tin-tuc', label: 'Tin tức' },
                { href: '/video', label: 'Video' },
                { href: '/tim-kiem', label: 'Tìm kiếm' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="footer-link text-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-xs uppercase tracking-widest mb-4 font-semibold"
              style={{ color: 'var(--t-footer-accent)' }}
            >
              Liên hệ
            </h3>
            {footer?.contact ? (
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--t-footer-text)' }}>
                {footer.contact}
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: 'color-mix(in oklch, var(--t-footer-text) 60%, transparent)' }}>
                Chưa có thông tin liên hệ.
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{
            borderTop: '1px solid var(--t-border)',
            color: 'color-mix(in oklch, var(--t-footer-text) 70%, transparent)',
          }}
        >
          <p>{footer?.copyright ?? `© ${year} Họ Phùng Bát Tràng. Mọi quyền được bảo lưu.`}</p>
          <p>Gia phả dòng tộc — Bát Tràng, Hà Nội</p>
        </div>
      </div>
    </footer>
  );
}
