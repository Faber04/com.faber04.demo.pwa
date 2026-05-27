import { useState, useEffect } from 'react'
import { useInstall } from '../context/InstallProvider'
import CodeBlock from '../components/CodeBlock'

type Platform = 'ios' | 'macos-safari' | 'chrome' | 'other'

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
  if (isIOS) return 'ios'
  const isMacSafari = /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua)
  if (isMacSafari) return 'macos-safari'
  if (/Chrome/.test(ua) && !/Edg/.test(ua)) return 'chrome'
  return 'other'
}

export default function Install() {
  const { deferredPrompt, isInstalled, installApp } = useInstall()
  const [platform] = useState<Platform>(detectPlatform)
  const [ready, setReady] = useState(false)

  // Short delay so context has time to settle before we decide what to show
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  if (isInstalled) {
    return (
      <section className="page">
        <h1>Install</h1>
        <div className="install-badge installed">
          <span className="install-badge-icon">✅</span>
          <div>
            <strong>App already installed</strong>
            <p>You are running this PWA as a standalone app.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>Install</h1>
      <p>Add this app to your device for a native-like experience — no App Store needed.</p>

      {/* Chrome / Edge / Android – native prompt available */}
      {deferredPrompt && (
        <div className="install-card">
          <p className="install-card-desc">Your browser supports direct installation.</p>
          <button className="btn-primary" onClick={installApp}>
            ⬇︎ Install app
          </button>
        </div>
      )}

      {/* iOS Safari */}
      {!deferredPrompt && ready && platform === 'ios' && (
        <div className="install-card">
          <p className="install-card-desc">Follow these steps in <strong>Safari</strong>:</p>
          <ol className="install-steps">
            <li><span className="step-icon">⬆︎</span>Tap the <strong>Share</strong> button in the Safari toolbar</li>
            <li><span className="step-icon">＋</span>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li><span className="step-icon">✓</span>Tap <strong>"Add"</strong> to confirm</li>
          </ol>
          <p className="install-note">⚠️ Only works in Safari — not in Chrome or other iOS browsers.</p>
        </div>
      )}

      {/* macOS Safari */}
      {!deferredPrompt && ready && platform === 'macos-safari' && (
        <div className="install-card">
          <p className="install-card-desc">Follow these steps in <strong>Safari</strong>:</p>
          <ol className="install-steps">
            <li><span className="step-icon">⬆︎</span>Click <strong>File</strong> in the menu bar</li>
            <li><span className="step-icon">＋</span>Select <strong>"Add to Dock"</strong></li>
            <li><span className="step-icon">✓</span>Click <strong>"Add"</strong> to confirm</li>
          </ol>
        </div>
      )}

      {/* Generic fallback */}
      {!deferredPrompt && ready && platform === 'other' && (
        <div className="install-card">
          <p className="install-card-desc">
            Open this app in <strong>Chrome</strong> on desktop or Android and look for
            the install icon <strong>⊕</strong> in the address bar.
          </p>
        </div>
      )}

      {!ready && <p className="install-note">Checking install availability…</p>}

      <CodeBlock language="ts" code={`
// Capture the event ASAP (fires once at page load)
let deferredPrompt: BeforeInstallPromptEvent | null = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()          // suppress the mini-infobar
  deferredPrompt = e          // save for later
})

// Trigger the native install dialog on user gesture
async function install() {
  if (!deferredPrompt) return
  await deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  // outcome → 'accepted' | 'dismissed'
  deferredPrompt = null
}

// Detect standalone mode (already installed)
const isInstalled =
  window.matchMedia('(display-mode: standalone)').matches ||
  navigator.standalone === true  // iOS Safari
      `} />
    </section>
  )
}

