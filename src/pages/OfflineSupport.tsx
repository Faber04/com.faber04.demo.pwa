import { useState } from 'react'
import CodeBlock from '../components/CodeBlock'

interface CacheEntry {
  url: string
  size?: number
}

export default function OfflineSupport() {
  const [entries, setEntries] = useState<CacheEntry[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function inspectCache() {
    setLoading(true)
    try {
      const names = await caches.keys()
      const all: CacheEntry[] = []
      for (const name of names) {
        const cache = await caches.open(name)
        const keys = await cache.keys()
        for (const req of keys) {
          all.push({ url: new URL(req.url).pathname })
        }
      }
      setEntries(all)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="page">
      <h1>Offline Support</h1>
      <p>
        This app uses a <strong>Workbox service worker</strong> with a precaching strategy
        to serve all static assets from cache — HTML, JS, CSS, fonts and icons.
        When a navigation request fails (no network), the SW intercepts it via
        <code> setCatchHandler</code> and serves the <code>offline.html</code> fallback.
      </p>

      <div className="feature-list">
        <div className="feature-item">
          <span className="feature-icon">📦</span>
          <div>
            <strong>Precaching</strong>
            <p>All build assets are precached on SW install via <code>workbox-precaching</code>. Subsequent loads are instant — no network needed.</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">✈️</span>
          <div>
            <strong>Offline fallback</strong>
            <p>If a page navigation fails and the app is offline, the SW returns the cached <code>/demo/pwa/offline.html</code> instead of a browser error.</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🧹</span>
          <div>
            <strong>Cache cleanup</strong>
            <p>Outdated precache entries are automatically removed on SW activation via <code>cleanupOutdatedCaches()</code>.</p>
          </div>
        </div>
      </div>

      <div className="cache-inspector">
        <h2>Cache inspector</h2>
        <button className="btn-secondary" onClick={inspectCache} disabled={loading}>
          {loading ? 'Loading…' : '🔍 Inspect cached files'}
        </button>
        {entries !== null && (
          entries.length === 0 ? (
            <p className="hint">Cache is empty (run <code>npm run preview</code> to activate the SW).</p>
          ) : (
            <ul className="cache-list">
              {entries.map((e, i) => (
                <li key={i} className="cache-item">
                  <span className="cache-ext">{e.url.split('.').pop()?.toUpperCase() ?? '—'}</span>
                  <code>{e.url}</code>
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      <CodeBlock language="ts" code={`
// sw.ts — precache all build assets (injected by vite-plugin-pwa)
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { setCatchHandler } from 'workbox-routing'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Serve offline.html when a navigation request fails
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    return caches.match('/offline.html')
  }
  return Response.error()
})
      `} />
    </section>
  )
}
