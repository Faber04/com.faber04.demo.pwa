import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallContextValue {
  deferredPrompt: BeforeInstallPromptEvent | null
  isInstalled: boolean
  installApp: () => Promise<void>
}

const InstallContext = createContext<InstallContextValue>({
  deferredPrompt: null,
  isInstalled: false,
  installApp: async () => {},
})

export function InstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function installApp() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setDeferredPrompt(null)
  }

  return (
    <InstallContext.Provider value={{ deferredPrompt, isInstalled, installApp }}>
      {children}
    </InstallContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useInstall = () => useContext(InstallContext)
