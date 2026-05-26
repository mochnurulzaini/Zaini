// ============================================================
// LOCAL STORAGE UTILITIES - TYPE-SAFE & CRASH-PROOF
// ============================================================

export const STORAGE_KEYS = {
  TRANSACTIONS: 'moneyflow_transactions',
  CATEGORIES: 'moneyflow_categories',
  BUDGETS: 'moneyflow_budgets',
  SAVINGS: 'moneyflow_savings',
  SETTINGS: 'moneyflow_settings',
} as const

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

/**
 * Safe JSON parse with fallback
 */
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (value === null || value === undefined || value === '') return fallback
  try {
    const parsed = JSON.parse(value) as T
    return parsed
  } catch {
    console.warn('[MoneyFlow] Failed to parse storage value, using fallback')
    return fallback
  }
}

/**
 * Save typed data to LocalStorage
 */
export function saveToStorage<T>(key: StorageKey, data: T): boolean {
  try {
    const serialized = JSON.stringify(data)
    localStorage.setItem(key, serialized)
    return true
  } catch (error) {
    console.error('[MoneyFlow] Failed to save to storage:', key, error)
    return false
  }
}

/**
 * Load typed data from LocalStorage with fallback
 */
export function loadFromStorage<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return safeJsonParse<T>(raw, fallback)
  } catch (error) {
    console.error('[MoneyFlow] Failed to load from storage:', key, error)
    return fallback
  }
}

/**
 * Remove a key from LocalStorage
 */
export function removeFromStorage(key: StorageKey): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('[MoneyFlow] Failed to remove from storage:', key, error)
    return false
  }
}

/**
 * Clear ALL MoneyFlow data from LocalStorage
 */
export function clearStorage(): boolean {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('[MoneyFlow] Failed to clear storage:', error)
    return false
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__moneyflow_test__'
    localStorage.setItem(test, '1')
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Export all data as JSON string
 */
export function exportAllData(): string {
  try {
    const data: Record<string, unknown> = {}
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const raw = localStorage.getItem(key)
      if (raw) data[name] = safeJsonParse(raw, null)
    })
    return JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), data }, null, 2)
  } catch (error) {
    console.error('[MoneyFlow] Failed to export data:', error)
    return '{}'
  }
}

/**
 * Import data from JSON string
 */
export function importAllData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString) as {
      version: string
      data: Record<string, unknown>
    }
    if (!parsed.data) throw new Error('Invalid backup format')

    const keyMap: Record<string, StorageKey> = {
      TRANSACTIONS: STORAGE_KEYS.TRANSACTIONS,
      CATEGORIES: STORAGE_KEYS.CATEGORIES,
      BUDGETS: STORAGE_KEYS.BUDGETS,
      SAVINGS: STORAGE_KEYS.SAVINGS,
      SETTINGS: STORAGE_KEYS.SETTINGS,
    }

    Object.entries(parsed.data).forEach(([name, value]) => {
      const key = keyMap[name]
      if (key && value !== null) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    })
    return true
  } catch (error) {
    console.error('[MoneyFlow] Failed to import data:', error)
    return false
  }
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: number; available: boolean } {
  try {
    let totalSize = 0
    Object.values(STORAGE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key)
      if (item) totalSize += item.length * 2 // UTF-16
    })
    return { used: totalSize, available: true }
  } catch {
    return { used: 0, available: false }
  }
}
