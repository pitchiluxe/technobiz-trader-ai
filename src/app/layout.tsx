import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'TechnoBiz Trader AI — Institutional Trading Platform',
  description: 'AI-powered professional trading workstation with multi-chart layouts, live market data, and institutional-grade analysis.',
  keywords: ['trading', 'AI', 'charts', 'crypto', 'stocks', 'forex', 'analysis'],
  authors: [{ name: 'TechnoBiz' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F1117',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} overflow-hidden h-screen w-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
