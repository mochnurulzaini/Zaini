import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  children: React.ReactNode
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const touchStartY = useRef(0)
  const mainRef = useRef<HTMLDivElement>(null)

  const REFRESH_THRESHOLD = 80

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (scrollY <= 0) {
        touchStartY.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing) return

      const currentY = e.touches[0].clientY
      const distance = currentY - touchStartY.current

      if (scrollY <= 0 && distance > 0) {
        e.preventDefault()
        setPullDistance(Math.min(distance, 150))
      }
    }

    const handleTouchEnd = () => {
      if (pullDistance >= REFRESH_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true)
        setPullDistance(REFRESH_THRESHOLD)
        
        // Simulate refresh (in real app, would call API or reload)
        setTimeout(() => {
          // Reload the page
          window.location.reload()
          setIsRefreshing(false)
          setPullDistance(0)
        }, 1500)
      } else {
        // Animate back to 0
        setPullDistance(0)
      }
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    document.addEventListener('touchstart', handleTouchStart, false)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, false)
    window.addEventListener('scroll', handleScroll)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrollY, pullDistance, isRefreshing])

  const refreshProgress = Math.min((pullDistance / REFRESH_THRESHOLD) * 100, 100)

  return (
    <>
      <AnimatePresence>
        {pullDistance > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            style={{ height: pullDistance }}
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : refreshProgress * 3.6 }}
              transition={{ duration: isRefreshing ? 1 : 0 }}
            >
              <RefreshCw
                className={`w-6 h-6 ${
                  refreshProgress >= 100 ? 'text-emerald-400' : 'text-muted-foreground'
                }`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={mainRef} className="relative">
        {children}
      </div>
    </>
  )
}
