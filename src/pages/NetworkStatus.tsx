import { useState, useEffect } from 'react'
import CodeBlock from '../components/CodeBlock'

interface ConnectionEvent {
  status: 'online' | 'offline'
  timestamp: number
}

interface NetworkInfo {
  effectiveType?: string
  downlink?: number
  rtt?: number
  saveData?: boolean
}

function getNetworkInfo(): NetworkInfo {
  const conn = (navigator as Navigator & { connection?: NetworkInfo }).connection
  if (!conn) return {}
  return {
    effectiveType: conn.effectiveType,
    downlink: conn.downlink,
    rtt: conn.rtt,
    saveData: conn.saveData,
  }
}

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [events, setEvents] = useState<ConnectionEvent[]>([])
  const [netInfo, setNetInfo] = useState<NetworkInfo>(getNetworkInfo)

  useEffect(() => {
    const addEvent = (status: 'online' | 'offline') => {
      setIsOnline(status === 'online')
      setNetInfo(getNetworkInfo())
      setEvents(prev => [{ status, timestamp: Date.now() }, ...prev].slice(0, 10))
    }

    window.addEventListener('online', () => addEvent('online'))
    window.addEventListener('offline', () => addEvent('offline'))

    return () => {
      window.removeEventListener('online', () => addEvent('online'))
      window.removeEventListener('offline', () => addEvent('offline'))
    }
  }, [])

  return (
    <section className="page">
      <h1>Network Status</h1>
      <p>Live detection of network connectivity changes via the browser's <code>online</code> and <code>offline</code> events.</p>

      <div className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
        <span className="status-dot" />
        <strong>{isOnline ? 'Online' : 'Offline'}</strong>
        <span>{isOnline ? 'Connected to the internet' : 'No internet connection'}</span>
      </div>

      {Object.keys(netInfo).length > 0 && (
        <div className="info-grid">
          {netInfo.effectiveType && (
            <div className="info-cell">
              <span className="info-label">Connection type</span>
              <span className="info-value">{netInfo.effectiveType}</span>
            </div>
          )}
          {netInfo.downlink !== undefined && (
            <div className="info-cell">
              <span className="info-label">Downlink</span>
              <span className="info-value">{netInfo.downlink} Mb/s</span>
            </div>
          )}
          {netInfo.rtt !== undefined && (
            <div className="info-cell">
              <span className="info-label">RTT</span>
              <span className="info-value">{netInfo.rtt} ms</span>
            </div>
          )}
          {netInfo.saveData !== undefined && (
            <div className="info-cell">
              <span className="info-label">Data saver</span>
              <span className="info-value">{netInfo.saveData ? 'On' : 'Off'}</span>
            </div>
          )}
        </div>
      )}

      <div className="event-log">
        <h2>Event log</h2>
        {events.length === 0 ? (
          <p className="hint">No events yet. Try toggling your network connection.</p>
        ) : (
          <ul>
            {events.map((e, i) => (
              <li key={i} className={`event-item ${e.status}`}>
                <span className={`event-dot ${e.status}`} />
                <span className="event-status">{e.status === 'online' ? '↑ Online' : '↓ Offline'}</span>
                <span className="event-time">{new Date(e.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CodeBlock language="ts" code={`
// Initial state
const isOnline = navigator.onLine  // true | false

// Listen for changes
window.addEventListener('online',  () => console.log('Back online'))
window.addEventListener('offline', () => console.log('Gone offline'))

// Network information (Chrome / Android)
const conn = (navigator as any).connection
console.log(conn.effectiveType) // '4g' | '3g' | '2g' | 'slow-2g'
console.log(conn.downlink)      // Mb/s
console.log(conn.rtt)           // ms
console.log(conn.saveData)      // true if data saver is on
      `} />
    </section>
  )
}
