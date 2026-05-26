import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, Plus, Bell, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useUIStore } from '@/stores/uiStore'
import { TransactionModal } from '@/features/transactions/TransactionModal'
import { TransactionItem } from '@/components/TransactionItem'
import { Amount } from '@/components/Amount'
import { EmptyState } from '@/components/EmptyState'
import {
  calcBalance, calcTotalIncome, calcTotalExpense,
  filterByMonth, getMonthlyChartData, getGreeting, getDailyQuote,
  getCurrentMonth, getCurrentYear, getCategoryStats, formatRupiah
} from '@/utils/helpers'

export function DashboardPage() {
  const { transactions } = useTransactionStore()
  const { categories } = useCategoryStore()
  const { settings } = useUIStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense')

  const currentMonth = getCurrentMonth()
  const currentYear = getCurrentYear()

  const monthlyTx = useMemo(() => filterByMonth(transactions, currentMonth, currentYear), [transactions, currentMonth, currentYear])
  const totalIncome = useMemo(() => calcTotalIncome(monthlyTx), [monthlyTx])
  const totalExpense = useMemo(() => calcTotalExpense(monthlyTx), [monthlyTx])
  const balance = useMemo(() => calcBalance(transactions), [transactions])

  const chartData = useMemo(() => getMonthlyChartData(transactions, currentYear), [transactions, currentYear])
  const catStats = useMemo(() => getCategoryStats(monthlyTx, categories).slice(0, 4), [monthlyTx, categories])
  const recentTx = useMemo(() => transactions.slice(0, 5), [transactions])

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-muted-foreground text-sm">{getGreeting()} 👋</p>
          <h1 className="font-display font-bold text-2xl mt-0.5">Dashboard</h1>
        </div>
        <button className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
        </button>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative rounded-3xl overflow-hidden p-6"
        style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 40%, #10b981 100%)' }}
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)'
        }} />
        <div className="relative">
          <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">Total Saldo</p>
          <Amount amount={balance} size="xl" className="text-white" animate />
          <p className="text-emerald-200/70 text-xs mt-1">{getDailyQuote()}</p>

          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-emerald-400/20">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                </div>
                <span className="text-emerald-300 text-xs">Pemasukan</span>
              </div>
              <Amount amount={totalIncome} size="md" className="text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-lg bg-red-400/20 flex items-center justify-center">
                  <TrendingDown className="w-3 h-3 text-red-300" />
                </div>
                <span className="text-red-300 text-xs">Pengeluaran</span>
              </div>
              <Amount amount={totalExpense} size="md" className="text-white font-bold" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <button
          onClick={() => { setModalType('income'); setModalOpen(true) }}
          className="glass-card p-4 flex items-center gap-3 hover:border-emerald-500/30 transition-all active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Tambah</p>
            <p className="text-sm font-semibold text-foreground">Pemasukan</p>
          </div>
        </button>
        <button
          onClick={() => { setModalType('expense'); setModalOpen(true) }}
          className="glass-card p-4 flex items-center gap-3 hover:border-red-500/30 transition-all active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Tambah</p>
            <p className="text-sm font-semibold text-foreground">Pengeluaran</p>
          </div>
        </button>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-base">Arus Keuangan {currentYear}</h2>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Masuk</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Keluar</span>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgb(107 114 128)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: 'hsl(160 25% 8%)', border: '1px solid hsl(160 20% 16%)',
                  borderRadius: '12px', fontSize: '12px', color: '#f0fdf4'
                }}
                formatter={(val: number) => formatRupiah(val, true)}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Categories */}
      {catStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base">Kategori Terbesar</h2>
            <Link to="/statistics" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Lihat semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {catStats.map(cat => (
              <div key={cat.categoryId} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                  style={{ background: cat.categoryColor + '20', border: `1px solid ${cat.categoryColor}40` }}
                >
                  {cat.categoryIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{cat.categoryName}</span>
                    <Amount amount={cat.amount} type="expense" size="sm" />
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, background: cat.categoryColor }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-semibold text-base">Transaksi Terbaru</h2>
          <Link to="/transactions" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            Semua <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {recentTx.length === 0 ? (
          <EmptyState
            icon="💳"
            title="Belum ada transaksi"
            description="Mulai catat pemasukan dan pengeluaran kamu"
            action={
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah Pertama
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-border/50">
            {recentTx.map((tx, i) => (
              <TransactionItem key={tx.id} transaction={tx} delay={i * 0.03} />
            ))}
          </div>
        )}
      </motion.div>

      <div className="h-6" />

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={modalType}
      />
    </div>
  )
}
