// ============================================================
// CORE TYPES
// ============================================================

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  categoryId: string
  description: string
  date: string // ISO date string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TransactionType | 'both'
  isDefault: boolean
  createdAt: string
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  period: 'monthly' | 'weekly'
  month: number // 1-12
  year: number
  createdAt: string
  updatedAt: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string // ISO date string
  icon: string
  color: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system'
  currency: string
  language: string
  pinEnabled: boolean
  pinHash: string
  autoLock: boolean
  autoLockMinutes: number
  biometricEnabled: boolean
  firstRun: boolean
  onboardingComplete: boolean
  notificationsEnabled: boolean
}

// ============================================================
// STORAGE TYPES
// ============================================================

export interface StorageData {
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  savings: SavingsGoal[]
  settings: AppSettings
}

// ============================================================
// UI TYPES
// ============================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

export interface StatCard {
  label: string
  value: number
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
}

export interface ChartData {
  name: string
  income: number
  expense: number
}

export interface CategoryStat {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  amount: number
  percentage: number
  count: number
}

// ============================================================
// FORM TYPES
// ============================================================

export interface TransactionFormData {
  type: TransactionType
  amount: string
  categoryId: string
  description: string
  date: string
  notes: string
}

export interface CategoryFormData {
  name: string
  icon: string
  color: string
  type: TransactionType | 'both'
}

export interface BudgetFormData {
  categoryId: string
  amount: string
  period: 'monthly' | 'weekly'
  month: number
  year: number
}

export interface SavingsFormData {
  name: string
  targetAmount: string
  currentAmount: string
  deadline: string
  icon: string
  color: string
  description: string
}

// ============================================================
// FILTER TYPES
// ============================================================

export interface TransactionFilter {
  search: string
  type: TransactionType | 'all'
  categoryId: string
  dateFrom: string
  dateTo: string
  sortBy: 'date' | 'amount' | 'description'
  sortOrder: 'asc' | 'desc'
}

export type StatPeriod = 'weekly' | 'monthly' | 'yearly'
