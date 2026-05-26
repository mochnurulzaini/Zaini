import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, AlertTriangle, CheckCircle, Trash2, Edit2 } from 'lucide-react'
import { useBudgetStore } from '@/stores/budgetStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useUIStore } from '@/stores/uiStore'
import { PageHeader } from '@/components/PageHeader'
import { Amount } from '@/components/Amount'
import { EmptyState } from '@/components/EmptyState'
import {
  formatRupiahInput, parseRupiahInput, filterByMonth,
  getCurrentMonth, getCurrentYear, getMonthName, calcTotalExpense
} from '@/utils/helpers'
import { cn } from '@/utils/cn'
import type { Budget } from '@/types'

interface BudgetModalProps {
  open: boolean
  onClose: () => void
  editBudget?: Budget | null
}

function BudgetModal({ open, onClose, editBudget }: BudgetModalProps) {
  const { addBudget, updateBudget } = useBudgetStore()
  const { categories } = useCategoryStore()
  const { addToast } = useUIStore()

  const month = getCurrentMonth()
  const year = getCurrentYear()

  const [categoryId, setCategoryId] = useState(editBudget?.categoryId ?? categories.find(c => c.type === 'expense' || c.type === 'both')?.id ?? '')
  const [amount, setAmount] = useState(editBudget ? new Intl.NumberFormat('id-ID').format(editBudget.amount) : '')
  const [period, setPeriod] = useState<'monthly' | 'weekly'>(editBudget?.period ?? 'monthly')

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both')

  const handleSubmit = () => {
    const parsed = parseRupiahInput(amount)
    if (!categoryId || parsed === 0) return
    if (editBudget) {
      updateBudget(editBudget.id, { categoryId, amount: parsed, period })
      addToast('success', 'Anggaran diperbarui')
    } else {
      addBudget({ categoryId, amount: parsed, period, month, year })
      addToast('success', 'Anggaran ditambahkan')
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 flex items-end md:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="w-full max-w-md glass-card rounded-t-3xl md:rounded-3xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 md:hidden"><div className="w-12 h-1 rounded-full bg-border" /></div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display font-bold text-lg">{editBudget ? 'Edit Anggaran' : 'Anggaran Baru'}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Kategori</label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Batas Anggaran</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">Rp</span>
                  <input
                    type="text" inputMode="numeric"
                    value={amount}
                    onChange={e => setAmount(formatRupiahInput(e.target.value))}
                    placeholder="0"
                    className="w-full bg-input border border-border rounded-xl pl-12 pr-4 py-3 text-lg font-bold font-display focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Periode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['monthly', 'weekly'] as const).map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={cn('py-2.5 rounded-xl text-sm font-semibold border transition-all',
                        period === p ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-border text-muted-foreground'
                      )}>
                      {p === 'monthly' ? 'Bulanan' : 'Mingguan'}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSubmit} disabled={!categoryId || !amount}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                {editBudget ? 'Simpan Perubahan' : 'Buat Anggaran'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface BudgetCardProps {
  budget: Budget
  spent: number
  onEdit: (b: Budget) => void
  onDelete: (id: string) => void
  index: number
}

function BudgetCard({ budget, spent, onEdit, onDelete, index }: BudgetCardProps) {
  const { getCategoryById } = useCategoryStore()
  const category = getCategoryById(budget.categoryId)
  const percentage = Math.min((spent / budget.amount) * 100, 100)
  const remaining = budget.amount - spent
  const isOver = spent > budget.amount
  const isWarning = percentage >= 80 && !isOver

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card p-5 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
            style={{ background: (category?.color ?? '#6b7280') + '20', border: `1px solid ${category?.color ?? '#6b7280'}40` }}>
            {category?.icon ?? '💰'}
          </div>
          <div>
            <p className="font-semibold text-sm">{category?.name ?? 'Kategori'}</p>
            <p className="text-xs text-muted-foreground capitalize">{budget.period === 'monthly' ? 'Bulanan' : 'Mingguan'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isOver ? (
            <div className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
              <AlertTriangle className="w-3 h-3" /> Melebihi
            </div>
          ) : isWarning ? (
            <div className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-lg">
              <AlertTriangle className="w-3 h-3" /> Hampir
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
              <CheckCircle className="w-3 h-3" /> Aman
            </div>
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            <button onClick={() => onEdit(budget)} className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Edit2 className="w-3 h-3" />
            </button>
            <button onClick={() => onDelete(budget.id)} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Terpakai</p>
            <Amount amount={spent} type="expense" size="md" />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Batas</p>
            <Amount amount={budget.amount} size="md" />
          </div>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.06 }}
            className="h-full rounded-full transition-colors"
            style={{
              background: isOver ? '#ef4444' : isWarning ? '#eab308' : category?.color ?? '#10b981'
            }}
          />
        </div>

        <div className="flex justify-between text-xs">
          <span className={cn(isOver ? 'text-red-400' : 'text-muted-foreground')}>
            {percentage.toFixed(0)}% terpakai
          </span>
          <span className={cn(isOver ? 'text-red-400 font-semibold' : 'text-muted-foreground')}>
            {isOver ? `Lebih ${new Intl.NumberFormat('id-ID').format(Math.abs(remaining))}` : `Sisa Rp ${new Intl.NumberFormat('id-ID').format(remaining)}`}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function BudgetsPage() {
  const { budgets, deleteBudget } = useBudgetStore()
  const { transactions } = useTransactionStore()
  const { addToast } = useUIStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)

  const month = getCurrentMonth()
  const year = getCurrentYear()
  const monthlyTx = useMemo(() => filterByMonth(transactions, month, year), [transactions, month, year])
  const currentBudgets = budgets.filter(b => b.month === month && b.year === year)

  const totalBudget = currentBudgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = useMemo(() => calcTotalExpense(monthlyTx), [monthlyTx])
  const overallPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0

  const getSpentForBudget = (budget: Budget): number => {
    return monthlyTx.filter(t => t.type === 'expense' && t.categoryId === budget.categoryId)
      .reduce((s, t) => s + t.amount, 0)
  }

  const handleDelete = (id: string) => {
    deleteBudget(id)
    addToast('success', 'Anggaran dihapus')
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Anggaran"
        subtitle={`${getMonthName(month)} ${year}`}
        action={
          <button onClick={() => { setEditBudget(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        }
      />

      <div className="px-4 md:px-6 space-y-4 pb-8">
        {/* Overview */}
        {currentBudgets.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ringkasan Bulan Ini</p>
            <div className="flex justify-between items-end mb-2">
              <Amount amount={totalSpent} type="expense" size="lg" />
              <span className="text-sm text-muted-foreground">dari <Amount amount={totalBudget} size="sm" /></span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${overallPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: overallPct >= 100 ? '#ef4444' : overallPct >= 80 ? '#eab308' : '#10b981' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{overallPct.toFixed(0)}% dari total anggaran</p>
          </motion.div>
        )}

        {currentBudgets.length === 0 ? (
          <EmptyState
            icon="🎯"
            title="Belum ada anggaran"
            description="Buat batas pengeluaran per kategori untuk kontrol keuangan yang lebih baik"
            action={
              <button onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                <Plus className="w-4 h-4" /> Buat Anggaran
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {currentBudgets.map((budget, i) => (
              <BudgetCard
                key={budget.id} budget={budget}
                spent={getSpentForBudget(budget)}
                onEdit={b => { setEditBudget(b); setModalOpen(true) }}
                onDelete={handleDelete}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      <BudgetModal open={modalOpen} onClose={() => { setModalOpen(false); setEditBudget(null) }} editBudget={editBudget} />
    </div>
  )
}
