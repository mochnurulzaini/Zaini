import type { Category, AppSettings } from '@/types'
import { generateId } from '@/utils/helpers'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: generateId(), name: 'Makanan & Minuman', icon: '🍽️', color: '#f97316', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Transportasi', icon: '🚗', color: '#06b6d4', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Belanja', icon: '🛍️', color: '#ec4899', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Kesehatan', icon: '💊', color: '#ef4444', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Hiburan', icon: '🎮', color: '#8b5cf6', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Pendidikan', icon: '📚', color: '#14b8a6', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Tagihan', icon: '⚡', color: '#eab308', type: 'expense', isDefault: true, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Gaji', icon: '💰', color: '#10b981', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Freelance', icon: '💻', color: '#6366f1', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Investasi', icon: '📈', color: '#10b981', type: 'income', isDefault: true, createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Lainnya', icon: '🌀', color: '#6b7280', type: 'both', isDefault: true, createdAt: new Date().toISOString() },
]

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  currency: 'IDR',
  language: 'id',
  pinEnabled: false,
  pinHash: '',
  autoLock: false,
  autoLockMinutes: 5,
  biometricEnabled: false,
  firstRun: true,
  onboardingComplete: false,
  notificationsEnabled: false,
}
