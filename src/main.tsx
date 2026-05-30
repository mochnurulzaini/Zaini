import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/globals.css'
// Register PWA service worker (vite-plugin-pwa)
import { registerSW } from 'virtual:pwa-register'

const rootElement = document.getElementById('root')

if (!rootElement) {
  console.error('[MoneyFlow] Root element #root not found!')
} else {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
    // register service worker for PWA (autoUpdate handled by plugin)
    try {
      const updateSW = registerSW({
        onRegistered(r: any) { console.log('[PWA] SW registered:', r) },
        onRegisterError(err: any) { console.error('[PWA] SW registration failed', err) }
      })
    } catch (e) { /* ignore in dev */ }
}
