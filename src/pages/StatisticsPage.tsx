import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { PageHeader } from '@/components/PageHeader'
import { Amount } from '@/components/Amount'
import {
  filterByMonth, filterByYear, getMonthlyChartData, getWeeklyChartData,
  getCategoryStats, calcTotalIncome, calcTotalExpense, calcBalance,
  getCurrentMonth, getCurrentYear, getMonthName, formatRupiah
} from '@/utils/helpers'
import { cn } from '@/utils/cn'
import type { StatPeriod } from '@/types'

const CUSTOM_TOOLTIP_STYLE = {
  background: 'hsl(160 25% 8%)',
  border: '1px solid hsl(160 20% 16%)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#f0fdf4'
}

export function StatisticsPage() {
  const { transactions } = useTransactionStore()
  const { categories } = useCategoryStore()
  const [period, setPeriod] = useState<StatPeriod>('monthly')
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())

  const currentYear = getCurrentYear()
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i)

  const filteredTx = useMemo(() => {
    if (period === 'weekly') return transactions
    if (period === 'monthly') return filterByMonth(transactions, selectedMonth, selectedYear)
    return filterByYear(transactions, selectedYear)
  }, [transactions, period, selectedMonth, selectedYear])

  const chartData = useMemo(() => {
    if (period === 'weekly') return getWeeklyChartData(transactions)
    if (period === 'yearly') return getMonthlyChartData(transactions, selectedYear)
    // monthly — show daily
    const days: { name: string; income: number; expense: number }[] = []
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayTx = transactions.filter(t => t.date === dateStr)
      days.push({ name: String(d), income: calcTotalIncome(dayTx), expense: calcTotalExpense(dayTx) })
    }
    return days
  }, [transactions, period, selectedMonth, selectedYear])

  const catStats = useMemo(() => getCategoryStats(filteredTx, categories), [filteredTx, categories])
  const totalIncome = calcTotalIncome(filteredTx)
  const totalExpense = calcTotalExpense(filteredTx)
  const balance = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  const pieData = catStats.slice(0, 6).map(s => ({
    name: s.categoryName, value: s.amount, color: s.categoryColor, icon: s.categoryIcon
  }))

  return (
    <div className="min-h-screen">
      <PageHeader title="Statistik" subtitle="Analisis keuangan kamu" />

      <div className="px-4 md:px-6 space-y-5 pb-8">
        {/* Period Tabs */}
        <div className="flex gap-2 p-1 bg-muted rounded-2xl">
          {(['weekly', 'monthly', 'yearly'] as StatPeriod[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                period === p ? 'bg-card border border-border text-foreground shadow-sm' : 'text-muted-foreground'
              )}>
              {p === 'weekly' ? 'Mingguan' : p === 'monthly' ? 'Bulanan' : 'Tahunan'}
            </button>
          ))}
        </div>

        {/* Period Selectors */}
        <div className="flex gap-2">
          {period !== 'weekly' && (
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
              className="bg-input border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring flex-1">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {period === 'monthly' && (
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}
              className="bg-input border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring flex-1">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
              ))}
            </select>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Pemasukan', amount: totalIncome, type: 'income' as const },
            { label: 'Pengeluaran', amount: totalExpense, type: 'expense' as const },
          ].map(({ label, amount, type }) => (
            <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
              <Amount amount={amount} type={type} size="md" animate />
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Selisih</p>
            <Amount amount={Math.abs(balance)} type={balance >= 0 ? 'income' : 'expense'} size="md" animate />
            <p className="text-xs text-muted-foreground mt-0.5">{balance >= 0 ? 'Surplus' : 'Defisit'}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground mb-1.5">Rasio Hemat</p>
            <p className={cn('font-bold font-display text-lg', savingsRate >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {savingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">dari pemasukan</p>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-base mb-4">
            {period === 'weekly' ? 'Pengeluaran Minggu Ini' : period === 'monthly' ? `Harian — ${getMonthName(selectedMonth)} ${selectedYear}` : `Bulanan — ${selectedYear}`}
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v: number) => formatRupiah(v, true)} labelStyle={{ color: '#9ca3af' }} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-2 justify-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500 inline-block" /> Pemasukan</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-red-500 inline-block" /> Pengeluaran</span>
          </div>
        </motion.div>

        {/* Pie Chart — Category Breakdown */}
        {catStats.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
            <h3 className="font-display font-semibold text-base mb-4">Pengeluaran per Kategori</h3>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="h-44 w-full md:w-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} formatter={(v: number) => formatRupiah(v, true)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-2.5">
                {catStats.slice(0, 6).map(stat => (
                  <div key={stat.categoryId} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ background: stat.categoryColor + '20' }}>{stat.categoryIcon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-medium truncate">{stat.categoryName}</span>
                        <span className="text-xs text-muted-foreground ml-2 shrink-0">{stat.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${stat.percentage}%`, background: stat.categoryColor }} />
                      </div>
                    </div>
                    <Amount amount={stat.amount} size="sm" compact className="shrink-0 text-xs" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Transaction count stat */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="font-display font-semibold text-base mb-4">Ringkasan Transaksi</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: filteredTx.length, suffix: 'transaksi' },
              { label: 'Pemasukan', value: filteredTx.filter(t => t.type === 'income').length, suffix: 'transaksi' },
              { label: 'Pengeluaran', value: filteredTx.filter(t => t.type === 'expense').length, suffix: 'transaksi' },
            ].map(({ label, value, suffix }) => (
              <div key={label} className="text-center">
                <p className="font-display font-bold text-2xl text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
