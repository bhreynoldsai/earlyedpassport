import type { Metadata, Viewport } from 'next'
import { copy } from '@/lib/copy'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: `${copy.product.name} — ${copy.product.tagline}`,
    template: `%s — ${copy.product.name}`,
  },
  description:
    'Weekly lesson plans with your learning areas already tagged, and a child passport that follows a child from room to room. Built for Georgia child care centers.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Never lock zoom. Directors read this at 200% and so do teachers over 40.
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-bg text-text antialiased">{children}</body>
    </html>
  )
}
