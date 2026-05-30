import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState<boolean>(() => {
    try {
      const t = localStorage.getItem('theme')
      if (t) return t === 'light'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    } catch { return false }
  })

  useEffect(() => {
    try {
      if (isLight) {
        document.documentElement.classList.add('light')
        localStorage.setItem('theme', 'light')
      } else {
        document.documentElement.classList.remove('light')
        localStorage.setItem('theme', 'dark')
      }
    } catch (e) { /* ignore */ }
  }, [isLight])

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setIsLight(v => !v)}
      className="z-50 fixed top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-xl glass-card flex items-center justify-center"
      title={isLight ? 'Switch to dark' : 'Switch to light'}
    >
      {isLight ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
    </button>
  )
}
