import { create } from 'zustand'
import type { Transaction, TransactionFilter } from '@/types'
import { STORAGE_KEYS, saveToStorage, loadFromStorage } from '@/utils/storage'
import { generateId, getTodayISO } from '@/utils/helpers'

interface TransactionStore {
  transactions: Transaction[]
  filter: TransactionFilter
  isLoaded: boolean

  // Actions
  loadTransactions: () => void
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void
  deleteTransaction: (id: string) => void
  setFilter: (filter: Partial<TransactionFilter>) => void
  resetFilter: () => void
  getFilteredTransactions: () => Transaction[]
}

const DEFAULT_FILTER: TransactionFilter = {
  search: '',
  type: 'all',
  categoryId: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc',
}

function persistTransactions(transactions: Transaction[]): void {
  saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions)
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  filter: { ...DEFAULT_FILTER },
  isLoaded: false,

  loadTransactions: () => {
    const transactions = loadFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, [])
    set({ transactions, isLoaded: true })
  },

  addTransaction: (data) => {
    const now = new Date().toISOString()
    const newTx: Transaction = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    const transactions = [newTx, ...get().transactions]
    persistTransactions(transactions)
    set({ transactions })
    return newTx
  },

  updateTransaction: (id, data) => {
    const transactions = get().transactions.map(t =>
      t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
    )
    persistTransactions(transactions)
    set({ transactions })
  },

  deleteTransaction: (id) => {
    const transactions = get().transactions.filter(t => t.id !== id)
    persistTransactions(transactions)
    set({ transactions })
  },

  setFilter: (filter) => {
    set(state => ({ filter: { ...state.filter, ...filter } }))
  },

  resetFilter: () => {
    set({ filter: { ...DEFAULT_FILTER, dateFrom: '', dateTo: '' } })
  },

  getFilteredTransactions: () => {
    const { transactions, filter } = get()
    let result = [...transactions]

    if (filter.search) {
      const q = filter.search.toLowerCase()
      result = result.filter(t =>
        t.description.toLowerCase().includes(q) ||
        (t.notes?.toLowerCase().includes(q) ?? false)
      )
    }
    if (filter.type !== 'all') {
      result = result.filter(t => t.type === filter.type)
    }
    if (filter.categoryId) {
      result = result.filter(t => t.categoryId === filter.categoryId)
    }
    if (filter.dateFrom) {
      result = result.filter(t => t.date >= filter.dateFrom)
    }
    if (filter.dateTo) {
      result = result.filter(t => t.date <= filter.dateTo)
    }

    result.sort((a, b) => {
      let cmp = 0
      if (filter.sortBy === 'date') cmp = a.date.localeCompare(b.date)
      else if (filter.sortBy === 'amount') cmp = a.amount - b.amount
      else if (filter.sortBy === 'description') cmp = a.description.localeCompare(b.description)
      return filter.sortOrder === 'desc' ? -cmp : cmp
    })

    return result
  },
}))

// Initialize on import
if (typeof window !== 'undefined') {
  useTransactionStore.getState().loadTransactions()
}
