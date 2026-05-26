import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Plus, X, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useUIStore } from '@/stores/uiStore'
import { TransactionModal } from '@/features/transactions/TransactionModal'
import { TransactionItem } from '@/components/TransactionItem'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { Amount } from '@/components/Amount'
import { calcTotalIncome, calcTotalExpense, formatDate } from '@/utils/helpers'
import { cn } from '@/utils/cn'
import type { Transaction, TransactionType } from '@/types'

export function TransactionsPage() {
  const [searchParams] = useSearchParams()
  const { transactions, filter, setFilter, resetFilter, getFilteredTransactions, deleteTransaction } = useTransactionStore()
  const { categories } = useCategoryStore()
  const { addToast } = useUIStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const defaultType = searchParams.get('type') as TransactionType | null
  const openModal = searchParams.get('modal') === 'true'

  useEffect(() => {
    if (defaultType) { setModalOpen(true) }
    if (openModal) { setModalOpen(true) }
  }, [defaultType, openModal])

  const filtered = useMemo(() => getFilteredTransactions(), [transactions, filter])
  const totalIncome = useMemo(() => calcTotalIncome(filtered), [filtered])
  const totalExpense = useMemo(() => calcTotalExpense(filtered), [filtered])

  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    filtered.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = []
      groups[tx.date]!.push(tx)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteTransaction(id)
      addToast('success', 'Transaksi dihapus')
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx)
    setModalOpen(true)
  }

  const hasActiveFilter = filter.type !== 'all' || filter.categoryId || filter.dateFrom || filter.dateTo

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Transaksi"
        subtitle={`${filtered.length} transaksi`}
        action={
          <button
            onClick={() => { setEditTx(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah
          </button>
        }
      />

      <div className="px-4 md:px-6 space-y-4">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Pemasukan</p>
            <Amount amount={totalIncome} type="income" size="md" />
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Pengeluaran</p>
            <Amount amount={totalExpense} type="expense" size="md" />
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              value={filter.search}
              onChange={e => setFilter({ search: e.target.value })}
              placeholder="Cari transaksi..."
              className="w-full bg-input border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={cn(
              'px-3 rounded-xl border transition-colors flex items-center gap-2 text-sm',
              showFilters || hasActiveFilter
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-input border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilter && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card p-4 space-y-4">
                {/* Type Filter */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">TIPE</p>
                  <div className="flex gap-2">
                    {(['all', 'income', 'expense'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setFilter({ type: t })}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                          filter.type === t
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {t === 'income' && <TrendingUp className="w-3 h-3" />}
                        {t === 'expense' && <TrendingDown className="w-3 h-3" />}
                        {t === 'all' ? 'Semua' : t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">KATEGORI</p>
                  <select
                    value={filter.categoryId}
                    onChange={e => setFilter({ categoryId: e.target.value })}
                    className="w-full bg-input border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">DARI TANGGAL</p>
                    <input
                      type="date"
                      value={filter.dateFrom}
                      onChange={e => setFilter({ dateFrom: e.target.value })}
                      className="w-full bg-input border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">SAMPAI TANGGAL</p>
                    <input
                      type="date"
                      value={filter.dateTo}
                      onChange={e => setFilter({ dateTo: e.target.value })}
                      className="w-full bg-input border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    <select
                      value={`${filter.sortBy}-${filter.sortOrder}`}
                      onChange={e => {
                        const [sortBy, sortOrder] = e.target.value.split('-') as ['date' | 'amount' | 'description', 'asc' | 'desc']
                        setFilter({ sortBy, sortOrder })
                      }}
                      className="bg-input border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="date-desc">Tanggal Terbaru</option>
                      <option value="date-asc">Tanggal Terlama</option>
                      <option value="amount-desc">Jumlah Terbesar</option>
                      <option value="amount-asc">Jumlah Terkecil</option>
                    </select>
                  </div>
                  {hasActiveFilter && (
                    <button
                      onClick={resetFilter}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-3 h-3" /> Reset Filter
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction List */}
        {groupedByDate.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={filter.search || hasActiveFilter ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
            description={filter.search || hasActiveFilter ? "Coba ubah filter pencarian kamu" : "Mulai catat transaksi keuangan kamu"}
            action={
              !filter.search && !hasActiveFilter ? (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" /> Tambah Transaksi
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-4 pb-8">
            {groupedByDate.map(([date, txs]) => (
              <div key={date}>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {formatDate(date)}
                  </span>
                  <div className="flex gap-3">
                    <Amount amount={calcTotalIncome(txs)} type="income" size="sm" compact />
                    <Amount amount={calcTotalExpense(txs)} type="expense" size="sm" compact />
                  </div>
                </div>
                <div className="glass-card divide-y divide-border/50">
                  {txs.map((tx, i) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      delay={i * 0.02}
                      showDate={false}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTx(null) }}
        defaultType={defaultType ?? 'expense'}
        editTransaction={editTx}
      />
    </div>
  )
}
