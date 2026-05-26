import { create } from 'zustand'
import type { SavingsGoal } from '@/types'
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/utils/storage'
import { generateId } from '@/utils/helpers'

interface SavingsStore {
  goals: SavingsGoal[]
  isLoaded: boolean
  loadGoals: () => void
  addGoal: (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => SavingsGoal
  updateGoal: (id: string, data: Partial<Omit<SavingsGoal, 'id' | 'createdAt'>>) => void
  addToGoal: (id: string, amount: number) => void
  deleteGoal: (id: string) => void
}

function persist(goals: SavingsGoal[]): void {
  saveToStorage(STORAGE_KEYS.SAVINGS, goals)
}

export const useSavingsStore = create<SavingsStore>((set, get) => ({
  goals: [],
  isLoaded: false,

  loadGoals: () => {
    const goals = loadFromStorage<SavingsGoal[]>(STORAGE_KEYS.SAVINGS, [])
    set({ goals, isLoaded: true })
  },

  addGoal: (data) => {
    const now = new Date().toISOString()
    const goal: SavingsGoal = { ...data, id: generateId(), createdAt: now, updatedAt: now }
    const goals = [...get().goals, goal]
    persist(goals)
    set({ goals })
    return goal
  },

  updateGoal: (id, data) => {
    const goals = get().goals.map(g =>
      g.id === id ? { ...g, ...data, updatedAt: new Date().toISOString() } : g
    )
    persist(goals)
    set({ goals })
  },

  addToGoal: (id, amount) => {
    const goals = get().goals.map(g =>
      g.id === id
        ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount), updatedAt: new Date().toISOString() }
        : g
    )
    persist(goals)
    set({ goals })
  },

  deleteGoal: (id) => {
    const goals = get().goals.filter(g => g.id !== id)
    persist(goals)
    set({ goals })
  },
}))

if (typeof window !== 'undefined') {
  useSavingsStore.getState().loadGoals()
}
