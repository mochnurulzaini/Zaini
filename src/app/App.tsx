import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes/AppRoutes'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastContainer } from '@/components/Toast'
import { PinLockScreen } from '@/components/PinLock'
import { useUIStore } from '@/stores/uiStore'

function AppContent() {
  const { settings, isLocked } = useUIStore()

  if (settings.pinEnabled && isLocked) {
    return <PinLockScreen />
  }

  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
