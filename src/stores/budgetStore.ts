import { create } from 'zustand'
import type { Budget } from '@/types'
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/utils/storage'
import { generateId, getCurrentMonth, getCurrentYear } from '@/utils/helpers'

interface BudgetStore {
  budgets: Budget[]
  isLoaded: boolean
  loadBudgets: () => void
  addBudget: (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Budget
  updateBudget: (id: string, data: Partial<Omit<Budget, 'id' | 'createdAt'>>) => void
  deleteBudget: (id: string) => void
  getBudgetForCategory: (categoryId: string, month?: number, year?: number) => Budget | undefined
}

function persist(budgets: Budget[]): void {
  saveToStorage(STORAGE_KEYS.BUDGETS, budgets)
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
  budgets: [],
  isLoaded: false,

  loadBudgets: () => {
    const budgets = loadFromStorage<Budget[]>(STORAGE_KEYS.BUDGETS, [])
    set({ budgets, isLoaded: true })
  },

  addBudget: (data) => {
    const now = new Date().toISOString()
    const budget: Budget = { ...data, id: generateId(), createdAt: now, updatedAt: now }
    const budgets = [...get().budgets, budget]
    persist(budgets)
    set({ budgets })
    return budget
  },

  updateBudget: (id, data) => {
    const budgets = get().budgets.map(b =>
      b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
    )
    persist(budgets)
    set({ budgets })
  },

  deleteBudget: (id) => {
    const budgets = get().budgets.filter(b => b.id !== id)
    persist(budgets)
    set({ budgets })
  },

  getBudgetForCategory: (categoryId, month = getCurrentMonth(), year = getCurrentYear()) => {
    return get().budgets.find(b => b.categoryId === categoryId && b.month === month && b.year === year)
  },
}))

if (typeof window !== 'undefined') {
  useBudgetStore.getState().loadBudgets()
}
