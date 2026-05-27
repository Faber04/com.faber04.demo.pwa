# Progressive Web Application

A **Progressive Web App demo** built with React 18 + TypeScript + Vite, showcasing core PWA capabilities in a clean, installable app shell.

🔗 **Live demo:** [www.faber04.com/demo/pwa](https://www.faber04.com/demo/pwa/)

## Features

### 🔔 Notifications

Demonstrates the [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) and its integration with a service worker.

**How it works:**

1. **Toggle switch** — calls `Notification.requestPermission()` on first enable. The browser-level permission state is reflected back into the UI (`granted` / `denied` / `unsupported`). Toggling off disables the feature locally (browser permission cannot be revoked programmatically).
2. **Send button** — in production, fires `ServiceWorkerRegistration.showNotification()` via the active SW, so the notification is OS-native and works even if the tab loses focus. In dev (no active SW), falls back to `new Notification()` directly.
3. **Click interception** — the custom service worker (`src/sw.ts`) listens for the `notificationclick` event, closes the notification, focuses the app window, and broadcasts a message to the page via `BroadcastChannel`. The page receives it and renders a feedback card.
4. **Auto-dismiss** — the feedback card disappears after 5 s using a `setTimeout` cleared on unmount, with a CSS `@keyframes` fade-out starting at 4.6 s.

---

### ⬇︎ Install

Demonstrates the PWA install flow across platforms, powered by the [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest) and the `beforeinstallprompt` event.

**How it works:**

1. **Event capture at app level** — `beforeinstallprompt` fires once at page load, before the user navigates to the Install page. An `InstallContext` (React context wrapping the entire app) captures and stores it immediately so it is available whenever the page renders.
2. **Chrome / Edge / Android** — when `deferredPrompt` is non-null, an install button calls `deferredPrompt.prompt()`. The browser shows its native install dialog. `deferredPrompt.userChoice` resolves with `accepted` or `dismissed`.
3. **iOS Safari** — `beforeinstallprompt` is not supported. The platform is detected via `navigator.userAgent` and the page shows manual steps: Share → Add to Home Screen → Add.
4. **macOS Safari** — same detection path; shows: File → Add to Dock → Add.
5. **Already installed** — on mount, `window.matchMedia('(display-mode: standalone)')` (all platforms) and `navigator.standalone` (iOS) are checked. If true, the page shows a confirmation badge instead of install instructions.

---

### 📶 Network Status

Demonstrates real-time connectivity detection using the browser's network events and the `NetworkInformation` API.

**How it works:**

1. **Live status** — `navigator.onLine` gives the initial state on mount. `window.addEventListener('online' | 'offline')` fires on every connectivity change and updates the UI badge immediately.
2. **Connection info** — `navigator.connection` (where supported, mainly Chrome/Android) exposes `effectiveType` (4g/3g/2g/slow-2g), `downlink` (Mb/s), `rtt` (ms) and `saveData` (data saver mode). These are displayed in an info grid.
3. **Event log** — every `online`/`offline` event is prepended to a local state array (capped at 10 entries) with its timestamp, giving a scrollable history of connection changes during the session.

---

### ✈️ Offline Support

Demonstrates the Workbox precaching strategy and the SW offline fallback mechanism.

**How it works:**

1. **Precaching** — on SW install, Workbox injects `self.__WB_MANIFEST` (the list of all build assets) into the cache via `precacheAndRoute()`. All HTML, JS, CSS, fonts and icons are available immediately from cache on subsequent loads — no network needed.
2. **Offline fallback** — `setCatchHandler()` from `workbox-routing` intercepts any navigation request that fails (i.e. the network is unreachable). If the request destination is `document`, the SW returns the precached `offline.html` instead of letting the browser show its default error page.
3. **Cache cleanup** — `cleanupOutdatedCaches()` runs on SW activation and removes stale precache entries from previous deployments, preventing the cache from growing indefinitely.
4. **Cache inspector** — the page reads all `CacheStorage` entries at runtime via `caches.keys()` and `cache.keys()`, listing every cached URL grouped by file extension.

---

### 🔄 SW Update

Demonstrates the service worker lifecycle and the update prompt pattern using `vite-plugin-pwa`'s `useRegisterSW` hook.

**How it works:**

1. **`registerType: 'prompt'`** — unlike `autoUpdate`, this mode does not silently skip the waiting SW. Instead, when a new SW finishes installing and enters the `waiting` state, `needRefresh` is set to `true` and the user is shown an explicit update prompt.
2. **`SwUpdateContext`** — a React context wraps the entire app and calls `useRegisterSW` (from `virtual:pwa-register/react`) on mount, ensuring the SW is registered regardless of which page the user lands on. All pages can read `needRefresh`, `offlineReady`, and `updateServiceWorker` from this context.
3. **Offline ready** — once the SW has precached all assets, `offlineReady` becomes `true`. A dismissible green banner confirms the app can now run without a network connection.
4. **Update now** — when `needRefresh` is `true`, a blue banner appears with an "Update now" button that calls `updateServiceWorker(true)`, which posts a `SKIP_WAITING` message to the waiting SW and reloads the page to activate the new version.

---

## Tech stack

| Tool | Version |
|---|---|
| React | 18 |
| TypeScript | 5 |
| Vite | 4 |
| vite-plugin-pwa | 0.14 |
| Workbox | via plugin |
| React Router | 7 |

## PWA setup

- **Manifest** — generated by `vite-plugin-pwa` with icons, theme colour, `start_url` and `scope` scoped to `/demo/pwa/`
- **Service worker** — custom `src/sw.ts` compiled via `injectManifest` strategy; handles precaching, offline fallback and `notificationclick` events
- **Icons** — 192×192, 512×512 (maskable), 180×180 Apple touch icon
- **Offline fallback** — `public/offline.html` precached and served by the SW on navigation failure

## Development

```bash
npm install
npm run dev       # local dev server (SW not active)
npm run build     # production build
npm run preview   # preview production build with active SW
```

## Deploy

```bash
npm run deploy    # build + publish via FTP
```

FTP credentials are stored in `INTERNAL/.ftp.env` (gitignored). See `ftp.env.example` for the required variables.

