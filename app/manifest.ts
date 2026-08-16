import type { MetadataRoute } from 'next'
import { copy } from '@/lib/copy'

/**
 * PWA manifest. Ticket T-0.8.
 *
 * Installable to a home screen without app-store friction — §1 of
 * PROJECT-INSTRUCTIONS rules out a native app for v1, and a teacher is not
 * going to hunt through a store to find her lesson planner.
 *
 * `portrait` because every screen in this product is designed one-handed at
 * 375px, and `standalone` so it opens without browser chrome eating the
 * vertical space the week grid needs.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: copy.product.name,
    short_name: 'Passport',
    description: copy.product.tagline,
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    // Matches --bg and --accent in app/globals.css. These two cannot be CSS
    // custom properties — the browser reads them before any stylesheet loads.
    background_color: '#FBF9F6',
    theme_color: '#1F6F6B',
    icons: [],
  }
}
