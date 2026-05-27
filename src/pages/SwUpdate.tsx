import { useSwUpdate } from '../context/SwUpdateProvider'
import CodeBlock from '../components/CodeBlock'

export default function SwUpdate() {
  const { needRefresh, offlineReady, updateServiceWorker, dismissUpdate, dismissOfflineReady } = useSwUpdate()

  return (
    <section className="page">
      <h1>SW Update</h1>
      <p>
        The service worker is registered with <code>registerType: 'prompt'</code>. When a new
        version is deployed, the browser detects a waiting SW — this page lets you
        review and apply the update manually instead of auto-reloading.
      </p>

      <div className="sw-states">
        <div className={`sw-state-card ${offlineReady ? 'active' : ''}`}>
          <span className="sw-state-icon">📦</span>
          <div>
            <strong>Offline ready</strong>
            <p>The app has been precached and will work without a network connection.</p>
          </div>
          <span className={`sw-pill ${offlineReady ? 'yes' : 'no'}`}>
            {offlineReady ? 'Ready' : 'Not yet'}
          </span>
        </div>

        <div className={`sw-state-card ${needRefresh ? 'active' : ''}`}>
          <span className="sw-state-icon">🔄</span>
          <div>
            <strong>Update available</strong>
            <p>A new service worker is waiting. Click "Update now" to reload with the latest version.</p>
          </div>
          <span className={`sw-pill ${needRefresh ? 'yes' : 'no'}`}>
            {needRefresh ? 'Pending' : 'Up to date'}
          </span>
        </div>
      </div>

      {offlineReady && (
        <div className="sw-banner ready">
          <span>✅ App is ready to work offline.</span>
          <button className="sw-banner-dismiss" onClick={dismissOfflineReady}>✕</button>
        </div>
      )}

      {needRefresh && (
        <div className="sw-banner update">
          <span>🔄 A new version is available.</span>
          <div className="sw-banner-actions">
            <button className="btn-primary" onClick={() => updateServiceWorker(true)}>
              Update now
            </button>
            <button className="sw-banner-dismiss" onClick={dismissUpdate}>✕</button>
          </div>
        </div>
      )}

      {!needRefresh && !offlineReady && (
        <p className="hint">
          No updates detected. Deploy a new build to see the update prompt appear here.
          The SW is active only in <code>npm run preview</code> or production.
        </p>
      )}

      <CodeBlock language="ts" code={`
// vite.config.ts — use 'prompt' to control when updates apply
VitePWA({ registerType: 'prompt' })

// React component — useRegisterSW from vite-plugin-pwa
import { useRegisterSW } from 'virtual:pwa-register/react'

const {
  needRefresh:  [needRefresh],
  offlineReady: [offlineReady],
  updateServiceWorker,
} = useRegisterSW()

// When needRefresh is true, a new SW is waiting.
// Call updateServiceWorker(true) to activate it and reload.
if (needRefresh) {
  updateServiceWorker(true)
}
      `} />
    </section>
  )
}
