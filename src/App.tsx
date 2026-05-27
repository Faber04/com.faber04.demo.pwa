import { HashRouter, Routes, Route } from 'react-router-dom'
import { InstallProvider } from './context/InstallProvider'
import { SwUpdateProvider } from './context/SwUpdateProvider'
import Layout from './components/Layout'
import Home from './pages/Home'
import Notifications from './pages/Notifications'
import Install from './pages/Install'
import NetworkStatus from './pages/NetworkStatus'
import OfflineSupport from './pages/OfflineSupport'
import SwUpdate from './pages/SwUpdate'

export default function App() {
  return (
    <SwUpdateProvider>
      <InstallProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="install" element={<Install />} />
              <Route path="network" element={<NetworkStatus />} />
              <Route path="offline" element={<OfflineSupport />} />
              <Route path="sw-update" element={<SwUpdate />} />
            </Route>
          </Routes>
        </HashRouter>
      </InstallProvider>
    </SwUpdateProvider>
  )
}
