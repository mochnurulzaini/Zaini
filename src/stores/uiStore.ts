import { create } from 'zustand'
import type { AppSettings, ToastMessage, ToastType } from '@/types'
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/utils/storage'
import { DEFAULT_SETTINGS } from '@/utils/defaults'
import { generateId, hashPin } from '@/utils/helpers'

interface UIStore {
  settings: AppSettings
  toasts: ToastMessage[]
  isLocked: boolean
  isLoaded: boolean
  activeNav: string

  // Settings
  loadSettings: () => void
  updateSettings: (data: Partial<AppSettings>) => void

  // Theme
  toggleTheme: () => void

  // PIN
  enablePin: (pin: string) => Promise<void>
  disablePin: () => void
  verifyPin: (pin: string) => Promise<boolean>
  lock: () => void
  unlock: () => void

  // Toast
  addToast: (type: ToastType, title: string, description?: string) => void
  removeToast: (id: string) => void

  // Navigation
  setActiveNav: (nav: string) => void
}

function applyTheme(theme: 'dark' | 'light' | 'system'): void {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('light')
    localStorage.setItem('theme', 'light')
  } else if (theme === 'dark') {
    root.classList.remove('light')
    localStorage.setItem('theme', 'dark')
  } else {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
    if (prefersLight) {
      root.classList.add('light')
      localStorage.removeItem('theme')
    } else {
      root.classList.remove('light')
      localStorage.removeItem('theme')
    }
  }
}

export const useUIStore = create<UIStore>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  toasts: [],
  isLocked: false,
  isLoaded: false,
  activeNav: '/dashboard',

  loadSettings: () => {
    const settings = loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS })
    applyTheme(settings.theme)
    set({ settings, isLoaded: true })
  },

  updateSettings: (data) => {
    const settings = { ...get().settings, ...data }
    saveToStorage(STORAGE_KEYS.SETTINGS, settings)
    if (data.theme) applyTheme(data.theme)
    set({ settings })
  },

  toggleTheme: () => {
    const current = get().settings.theme
    const next = current === 'dark' ? 'light' : 'dark'
    get().updateSettings({ theme: next })
  },

  enablePin: async (pin) => {
    const pinHash = await hashPin(pin)
    get().updateSettings({ pinEnabled: true, pinHash })
  },

  disablePin: () => {
    get().updateSettings({ pinEnabled: false, pinHash: '' })
    set({ isLocked: false })
  },

  verifyPin: async (pin) => {
    const pinHash = await hashPin(pin)
    return pinHash === get().settings.pinHash
  },

  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),

  addToast: (type, title, description) => {
    const id = generateId()
    const toast: ToastMessage = { id, type, title, description, duration: 3000 }
    set(state => ({ toasts: [...state.toasts, toast] }))
    setTimeout(() => get().removeToast(id), toast.duration ?? 3000)
  },

  removeToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
  },

  setActiveNav: (nav) => set({ activeNav: nav }),
}))

if (typeof window !== 'undefined') {
  useUIStore.getState().loadSettings()
}
