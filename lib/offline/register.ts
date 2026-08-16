'use client'

/**
 * Wiring the queue to the browser. Ticket T-0.8.
 *
 * Registers the service worker and decides when to try draining the queue:
 * when the network comes back, when the tab becomes visible again, and on a
 * backoff timer while anything is still waiting.
 *
 * The visibility trigger matters more than it looks. A teacher records an
 * observation in a dead spot, pockets the phone, and walks to the office. The
 * `online` event may never fire — the radio never dropped, the router did — but
 * the tab does become visible again when she pulls it out.
 */

import { OfflineQueue } from './queue'
import { createIndexedDbStore, MemoryStore, type OfflineStore } from './store'
import type { QueueSnapshot, Transport } from './types'

let queue: OfflineQueue | null = null
let retryTimer: ReturnType<typeof setTimeout> | null = null

export async function initOffline(
  transport: Transport,
  onChange?: (snapshot: QueueSnapshot) => void
): Promise<OfflineQueue> {
  if (queue) return queue

  let store: OfflineStore
  try {
    store = await createIndexedDbStore()
  } catch {
    // Private browsing, a locked-down device, an old Android. The app must keep
    // working; it just cannot survive a reload. Better than refusing to load.
    store = new MemoryStore()
  }

  queue = new OfflineQueue({
    store,
    transport,
    ...(onChange ? { onChange } : {}),
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => void scheduleFlush(0))
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void scheduleFlush(0)
    })
    void scheduleFlush(0)
  }

  await registerServiceWorker()
  return queue
}

/** Drain now, then set the next attempt from the queue's own backoff. */
async function scheduleFlush(delayMs: number): Promise<void> {
  if (!queue) return
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
  }

  if (delayMs > 0) {
    retryTimer = setTimeout(() => void scheduleFlush(0), delayMs)
    return
  }

  await queue.flush()
  const next = await queue.nextRetryDelay()
  if (next !== null) {
    retryTimer = setTimeout(() => void scheduleFlush(0), next)
  }
}

async function registerServiceWorker(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
  if (process.env.NODE_ENV !== 'production') return

  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data === 'flush') void scheduleFlush(0)
    })
  } catch {
    // No service worker means no offline shell, but the write queue still
    // works — IndexedDB is independent of it. Degrade, do not fail.
  }
}

export function getQueue(): OfflineQueue | null {
  return queue
}

/** Test seam: forget the singleton so a fresh one can be built. */
export function resetOfflineForTests(): void {
  if (retryTimer) clearTimeout(retryTimer)
  retryTimer = null
  queue = null
}
