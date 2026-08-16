/**
 * Service worker. Ticket T-0.8.
 *
 * Keeps the app usable in a classroom with no wifi. Two jobs:
 *
 *   1. Cache the app shell so the planner and roster still open.
 *   2. Cache the GELDS indicators, so the chooser works offline. Those are the
 *      one thing a teacher cannot improvise — she is not going to remember
 *      CD-MA1.4a, and a plan without codes is the problem we exist to solve.
 *
 * Deliberately hand-written rather than generated. It is small, it is the only
 * place cache policy lives, and a teacher losing work is not a bug we want
 * buried inside somebody's plugin.
 *
 * Writes are NOT handled here. They go through lib/offline/queue.ts, which owns
 * ordering, retry and conflicts. A service worker that also queued writes would
 * be a second source of truth.
 */

const VERSION = 'v1'
const SHELL_CACHE = `eep-shell-${VERSION}`
const DATA_CACHE = `eep-data-${VERSION}`

/** Enough to open the app cold with no network. */
const SHELL_ASSETS = ['/', '/offline']

/** Reference data: safe to serve stale, expensive to be without. */
const CACHEABLE_DATA = [/\/rest\/v1\/gelds_indicator/, /\/rest\/v1\/gelds_strand/]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      // A missing shell asset must not wedge the install — the app still works
      // online, and a half-cached shell beats no service worker at all.
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== DATA_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

function isCacheableData(url) {
  return CACHEABLE_DATA.some((pattern) => pattern.test(url))
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Never touch writes. The queue owns those, and a cached POST would be a
  // silent duplicate of a teacher's note.
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Reference data: cache first, refresh in the background. Standards change
  // once every few years, so serving a stale indicator is not a real risk and
  // being without one mid-plan is.
  if (isCacheableData(url.pathname)) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          .catch(() => cached)
        return cached ?? network
      })
    )
    return
  }

  // Navigation: try the network, fall back to whatever we last saw. A teacher
  // reloading the planner in a dead spot must still get her plan.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE)
          return (await cache.match(request)) ?? (await cache.match('/offline')) ?? Response.error()
        })
    )
    return
  }

  // Static assets: cache first. They are content-hashed by the build.
  if (url.origin === self.location.origin && /\/_next\/static\//.test(url.pathname)) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      })
    )
  }
})

/** The page tells us the network is back; we tell every tab to drain its queue. */
self.addEventListener('message', (event) => {
  if (event.data === 'flush') {
    self.clients.matchAll().then((clients) => {
      for (const client of clients) client.postMessage('flush')
    })
  }
})
