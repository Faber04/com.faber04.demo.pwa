import { useState, useEffect } from 'react'
import CodeBlock from '../components/CodeBlock'

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

interface ClickEvent {
  tag: string
  timestamp: number
}

export default function Notifications() {
  const [permission, setPermission] = useState<PermissionState>('default')
  const [enabled, setEnabled] = useState(false)
  const [lastClick, setLastClick] = useState<ClickEvent | null>(null)

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported')
      return
    }
    const p = Notification.permission as PermissionState
    setPermission(p)
    if (p === 'granted') setEnabled(true)
  }, [])

  // Listen for notification clicks from the service worker
  useEffect(() => {
    const channel = new BroadcastChannel('pwa-notifications')
    channel.onmessage = (e) => {
      if (e.data?.type === 'NOTIFICATION_CLICK') {
        setLastClick({ tag: e.data.tag, timestamp: e.data.timestamp })
      }
    }
    return () => channel.close()
  }, [])

  useEffect(() => {
    if (!lastClick) return
    const timer = setTimeout(() => setLastClick(null), 5000)
    return () => clearTimeout(timer)
  }, [lastClick])

  async function handleToggle() {

    if (!enabled) {
      if (permission !== 'granted') {
        const result = await Notification.requestPermission()
        setPermission(result as PermissionState)
        if (result !== 'granted') return
      }
      setEnabled(true)
    } else {
      setEnabled(false)
    }
  }

  async function sendNotification() {
    if (!enabled || permission !== 'granted') return

    const payload = {
      body: 'This is a push notification from your PWA!',
      icon: '/demo/pwa/pwa-192x192.png',
      badge: '/demo/pwa/pwa-192x192.png',
      tag: 'pwa-demo-notification',
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const sw = await navigator.serviceWorker.ready
      sw.showNotification('PWA Demo', payload)
    } else {
      const n = new Notification('PWA Demo', payload)
      n.onclick = () => {
        setLastClick({ tag: payload.tag, timestamp: Date.now() })
        window.focus()
      }
    }
  }

  const isBlocked = permission === 'denied' || permission === 'unsupported'

  return (
    <section className="page">
      <h1>Notifications</h1>
      <p>Test push notifications from this PWA.</p>

      <div className="toggle-row">
        <span className="toggle-label">
          {isBlocked
            ? permission === 'denied' ? 'Blocked by browser' : 'Not supported'
            : enabled ? 'Notifications enabled' : 'Notifications disabled'}
        </span>
        <button
          role="switch"
          aria-checked={enabled}
          className={`toggle-switch${enabled ? ' on' : ''}${isBlocked ? ' blocked' : ''}`}
          onClick={handleToggle}
          disabled={isBlocked}
          aria-label="Toggle notifications"
        >
          <span className="toggle-thumb" />
        </button>
      </div>

      {permission === 'denied' && (
        <p className="hint">Enable notifications in your browser settings to use this feature.</p>
      )}

      <button
        className="btn-primary"
        onClick={sendNotification}
        disabled={!enabled || permission !== 'granted'}
      >
        🔔 Send notification
      </button>

      {lastClick && (
        <div className="notification-feedback">
          <strong>Notification tapped!</strong>
          <span>Tag: {lastClick.tag}</span>
          <span>{new Date(lastClick.timestamp).toLocaleTimeString()}</span>
        </div>
      )}

      <CodeBlock language="ts" code={`
// 1. Request permission
const permission = await Notification.requestPermission()
// → 'granted' | 'denied' | 'default'

// 2. Show via Service Worker (production)
const sw = await navigator.serviceWorker.ready
sw.showNotification('Title', { body: 'Message', icon: '/icon.png' })

// 3. Intercept click in sw.ts
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  // Notify the page via BroadcastChannel
  new BroadcastChannel('pwa-notifications').postMessage({
    type: 'NOTIFICATION_CLICK',
    tag: event.notification.tag,
  })
})
      `} />
    </section>
  )
}

