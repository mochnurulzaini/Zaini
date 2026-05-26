import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Transaction, Category, CategoryStat } from '@/types'

// ============================================================
// CURRENCY FORMATTING
// ============================================================

export function formatRupiah(amount: number, compact = false): string {
  if (compact && Math.abs(amount) >= 1_000_000) {
    const val = amount / 1_000_000
    return `Rp ${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}jt`
  }
  if (compact && Math.abs(amount) >= 1_000) {
    const val = amount / 1_000
    return `Rp ${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}rb`
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function parseRupiahInput(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '')
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? 0 : num
}

export function formatRupiahInput(value: string): string {
  const num = parseRupiahInput(value)
  if (num === 0) return ''
  return new Intl.NumberFormat('id-ID').format(num)
}

// ============================================================
// DATE FORMATTING
// ============================================================

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Hari ini'
    if (isYesterday(date)) return 'Kemarin'
    return format(date, 'dd MMM yyyy', { locale: id })
  } catch {
    return dateStr
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM', { locale: id })
  } catch {
    return dateStr
  }
}

export function formatDateFull(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEEE, dd MMMM yyyy', { locale: id })
  } catch {
    return dateStr
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: id })
  } catch {
    return dateStr
  }
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getMonthName(month: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[month - 1] ?? ''
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

// ============================================================
// TRANSACTION CALCULATIONS
// ============================================================

export function calcTotalIncome(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
}

export function calcTotalExpense(transactions: Transaction[]): number {
  return transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
}

export function calcBalance(transactions: Transaction[]): number {
  return calcTotalIncome(transactions) - calcTotalExpense(transactions)
}

export function filterByMonth(transactions: Transaction[], month: number, year: number): Transaction[] {
  return transactions.filter(t => {
    try {
      const d = parseISO(t.date)
      return d.getMonth() + 1 === month && d.getFullYear() === year
    } catch { return false }
  })
}

export function filterByYear(transactions: Transaction[], year: number): Transaction[] {
  return transactions.filter(t => {
    try {
      return parseISO(t.date).getFullYear() === year
    } catch { return false }
  })
}

export function getCategoryStats(transactions: Transaction[], categories: Category[]): CategoryStat[] {
  const expenses = transactions.filter(t => t.type === 'expense')
  const total = expenses.reduce((s, t) => s + t.amount, 0)

  const byCategory = expenses.reduce<Record<string, number>>((acc, t) => {
    acc[t.categoryId] = (acc[t.categoryId] ?? 0) + t.amount
    return acc
  }, {})

  return Object.entries(byCategory)
    .map(([categoryId, amount]) => {
      const cat = categories.find(c => c.id === categoryId)
      return {
        categoryId,
        categoryName: cat?.name ?? 'Lainnya',
        categoryColor: cat?.color ?? '#6b7280',
        categoryIcon: cat?.icon ?? '💰',
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        count: expenses.filter(t => t.categoryId === categoryId).length,
      }
    })
    .sort((a, b) => b.amount - a.amount)
}

export function getMonthlyChartData(transactions: Transaction[], year: number) {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthTx = filterByMonth(transactions, month, year)
    return {
      name: getMonthName(month).slice(0, 3),
      income: calcTotalIncome(monthTx),
      expense: calcTotalExpense(monthTx),
    }
  })
}

export function getWeeklyChartData(transactions: Transaction[]) {
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const now = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0] ?? ''
    const dayTx = transactions.filter(t => t.date === dateStr)
    return {
      name: days[d.getDay()] ?? '',
      income: calcTotalIncome(dayTx),
      expense: calcTotalExpense(dayTx),
    }
  })
}

// ============================================================
// ID GENERATION
// ============================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ============================================================
// PIN SECURITY
// ============================================================

export async function hashPin(pin: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(pin + 'moneyflow_salt_2024')
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    // fallback simple hash
    let hash = 0
    for (let i = 0; i < pin.length; i++) {
      hash = ((hash << 5) - hash) + (pin.charCodeAt(i) ?? 0)
      hash |= 0
    }
    return hash.toString()
  }
}

// ============================================================
// GREETINGS
// ============================================================

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Selamat Pagi'
  if (hour >= 12 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

export const FINANCIAL_QUOTES = [
  'Keuangan sehat dimulai dari kebiasaan mencatat setiap hari.',
  'Hemat bukan berarti pelit, tapi bijak mengelola.',
  'Investasikan pada diri sendiri terlebih dahulu.',
  'Setiap rupiah yang disimpan adalah langkah menuju kebebasan finansial.',
  'Anggaran adalah peta perjalanan menuju tujuan keuanganmu.',
  'Catat pengeluaran kecil, karena mereka yang menggerogoti impian besar.',
  'Tabungan hari ini adalah ketenangan hari esok.',
  'Mengelola uang dengan baik adalah bentuk menghormati diri sendiri.',
] as const

export function getDailyQuote(): string {
  const day = new Date().getDay()
  return FINANCIAL_QUOTES[day % FINANCIAL_QUOTES.length] ?? FINANCIAL_QUOTES[0]
}

// ============================================================
// COLOR UTILITIES
// ============================================================

export const CATEGORY_COLORS = [
  '#10b981', '#06b6d4', '#8b5cf6', '#f59e0b',
  '#ef4444', '#ec4899', '#84cc16', '#f97316',
  '#6366f1', '#14b8a6', '#a855f7', '#eab308',
] as const

export const CATEGORY_ICONS = [
  '🍽️', '🚗', '🏠', '💊', '🛍️', '🎮', '📚', '✈️',
  '💪', '🎵', '☕', '🐾', '💻', '🎬', '🌱', '💰',
  '🏦', '🎁', '📱', '⚡', '🚌', '👔', '🏥', '🌊',
] as const

export type CategoryColor = (typeof CATEGORY_COLORS)[number]
export type CategoryIcon = (typeof CATEGORY_ICONS)[number]
