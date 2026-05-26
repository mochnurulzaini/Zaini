import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete, Fingerprint } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

export function PinLockScreen() {
  const { verifyPin, unlock, settings } = useUIStore()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)

  const handleDigit = async (digit: string) => {
    if (pin.length >= 6) return
    const newPin = pin + digit
    setPin(newPin)

    if (newPin.length === 6) {
      const ok = await verifyPin(newPin)
      if (ok) {
        unlock()
      } else {
        setShaking(true)
        setError(true)
        setTimeout(() => {
          setPin('')
          setError(false)
          setShaking(false)
        }, 600)
      }
    }
  }

  const handleDelete = () => {
    setPin(p => p.slice(0, -1))
    setError(false)
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-8 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔐</span>
        </div>
        <h1 className="font-display text-2xl font-bold">Masukkan PIN</h1>
        <p className="text-muted-foreground text-sm">MoneyFlow terkunci untuk keamanan kamu</p>
      </motion.div>

      <motion.div
        animate={shaking ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex gap-3"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < pin.length
                ? error
                  ? 'bg-red-500 border-red-500'
                  : 'bg-emerald-500 border-emerald-500'
                : 'bg-transparent border-border'
            }`}
          />
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-4 w-72">
        {['1','2','3','4','5','6','7','8','9'].map(digit => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="h-16 rounded-2xl bg-card border border-border hover:bg-accent hover:border-emerald-500/30 active:scale-95 transition-all font-display text-xl font-semibold"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={() => {/* biometric */}}
          className="h-16 rounded-2xl bg-card border border-border hover:bg-accent transition-all flex items-center justify-center text-muted-foreground"
        >
          <Fingerprint className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="h-16 rounded-2xl bg-card border border-border hover:bg-accent hover:border-emerald-500/30 active:scale-95 transition-all font-display text-xl font-semibold"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="h-16 rounded-2xl bg-card border border-border hover:bg-accent transition-all flex items-center justify-center text-muted-foreground"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
