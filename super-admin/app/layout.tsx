import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
})

export const metadata: Metadata = {
  title: {
    default: 'Super Admin | Gia Phả Platform',
    template: '%s | Gia Phả Platform',
  },
  description: 'Bảng điều phối license, tenant và theme cho nền tảng gia phả đa họ.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={beVietnamPro.variable} suppressHydrationWarning>
      <body className={`${beVietnamPro.className} min-h-screen`}>{children}</body>
    </html>
  )
}
