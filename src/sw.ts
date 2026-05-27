/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { setCatchHandler } from 'workbox-routing'

declare let self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// Serve offline fallback for navigation requests when network fails
setCatchHandler(async ({ request }) => {
  if (request.destination === 'document') {
    const cached = await caches.match('/demo/pwa/offline.html')
    return cached ?? new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } })
  }
  return Response.error()
})

const channel = new BroadcastChannel('pwa-notifications')

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  channel.postMessage({
    type: 'NOTIFICATION_CLICK',
    tag: event.notification.tag,
    timestamp: Date.now(),
  })

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const visible = clients.find((c) => c.visibilityState === 'visible')
        if (visible) return visible.focus()
        if (clients[0]) return clients[0].focus()
        return self.clients.openWindow('/')
      })
  )
})
