import { create } from 'zustand'
import type { Category } from '@/types'
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/utils/storage'
import { DEFAULT_CATEGORIES } from '@/utils/defaults'
import { generateId } from '@/utils/helpers'

interface CategoryStore {
  categories: Category[]
  isLoaded: boolean
  loadCategories: () => void
  addCategory: (data: Omit<Category, 'id' | 'isDefault' | 'createdAt'>) => Category
  updateCategory: (id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>) => void
  deleteCategory: (id: string) => void
  getCategoryById: (id: string) => Category | undefined
}

function persist(categories: Category[]): void {
  saveToStorage(STORAGE_KEYS.CATEGORIES, categories)
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  isLoaded: false,

  loadCategories: () => {
    const stored = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, [])
    const categories = stored.length > 0 ? stored : DEFAULT_CATEGORIES
    if (stored.length === 0) persist(categories)
    set({ categories, isLoaded: true })
  },

  addCategory: (data) => {
    const cat: Category = {
      ...data,
      id: generateId(),
      isDefault: false,
      createdAt: new Date().toISOString(),
    }
    const categories = [...get().categories, cat]
    persist(categories)
    set({ categories })
    return cat
  },

  updateCategory: (id, data) => {
    const categories = get().categories.map(c => c.id === id ? { ...c, ...data } : c)
    persist(categories)
    set({ categories })
  },

  deleteCategory: (id) => {
    const categories = get().categories.filter(c => c.id !== id)
    persist(categories)
    set({ categories })
  },

  getCategoryById: (id) => get().categories.find(c => c.id === id),
}))

if (typeof window !== 'undefined') {
  useCategoryStore.getState().loadCategories()
}
