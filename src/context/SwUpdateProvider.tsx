import { createContext, useContext, ReactNode } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

interface SwUpdateContextValue {
  needRefresh: boolean
  offlineReady: boolean
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  dismissUpdate: () => void
  dismissOfflineReady: () => void
}

const SwUpdateContext = createContext<SwUpdateContextValue>({
  needRefresh: false,
  offlineReady: false,
  updateServiceWorker: async () => {},
  dismissUpdate: () => {},
  dismissOfflineReady: () => {},
})

export function SwUpdateProvider({ children }: { children: ReactNode }) {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()

  return (
    <SwUpdateContext.Provider value={{
      needRefresh,
      offlineReady,
      updateServiceWorker,
      dismissUpdate: () => setNeedRefresh(false),
      dismissOfflineReady: () => setOfflineReady(false),
    }}>
      {children}
    </SwUpdateContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSwUpdate = () => useContext(SwUpdateContext)
