import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useUIStore } from '@/stores/uiStore'
import { formatRupiahInput, parseRupiahInput, getTodayISO, generateId } from '@/utils/helpers'
import type { Transaction, TransactionType } from '@/types'
import { cn } from '@/utils/cn'

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  defaultType?: TransactionType
  editTransaction?: Transaction | null
}

export function TransactionModal({ open, onClose, defaultType = 'expense', editTransaction }: TransactionModalProps) {
  const { addTransaction, updateTransaction } = useTransactionStore()
  const { categories } = useCategoryStore()
  const { addToast } = useUIStore()

  const [type, setType] = useState<TransactionType>(defaultType)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(getTodayISO())
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredCategories = categories.filter(c => c.type === type || c.type === 'both')

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type)
      setAmount(new Intl.NumberFormat('id-ID').format(editTransaction.amount))
      setCategoryId(editTransaction.categoryId)
      setDescription(editTransaction.description)
      setDate(editTransaction.date)
      setNotes(editTransaction.notes ?? '')
    } else {
      setType(defaultType)
      setAmount('')
      setCategoryId(filteredCategories[0]?.id ?? '')
      setDescription('')
      setDate(getTodayISO())
      setNotes('')
    }
    setErrors({})
  }, [open, editTransaction, defaultType])

  useEffect(() => {
    if (!editTransaction) {
      const cats = categories.filter(c => c.type === type || c.type === 'both')
      setCategoryId(cats[0]?.id ?? '')
    }
  }, [type])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!amount || parseRupiahInput(amount) === 0) errs.amount = 'Masukkan jumlah yang valid'
    if (!categoryId) errs.categoryId = 'Pilih kategori'
    if (!description.trim()) errs.description = 'Masukkan deskripsi'
    if (!date) errs.date = 'Pilih tanggal'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const data = {
      type,
      amount: parseRupiahInput(amount),
      categoryId,
      description: description.trim(),
      date,
      notes: notes.trim() || undefined,
    }

    if (editTransaction) {
      updateTransaction(editTransaction.id, data)
      addToast('success', 'Transaksi diperbarui')
    } else {
      addTransaction(data)
      addToast('success', 'Transaksi ditambahkan', `${formatRupiahInput(amount)} berhasil dicatat`)
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="w-full max-w-lg glass-card rounded-t-3xl md:rounded-3xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-12 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display font-bold text-lg">
                {editTransaction ? 'Edit Transaksi' : 'Transaksi Baru'}
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-accent hover:bg-accent/70 flex items-center justify-center text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[85dvh] md:max-h-[75vh] no-scrollbar">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-2xl">
                {(['expense', 'income'] as TransactionType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      'flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                      type === t
                        ? t === 'income'
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-red-500/10 border border-red-500/30 text-red-400'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Jumlah
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={e => setAmount(formatRupiahInput(e.target.value))}
                    placeholder="0"
                    className={cn(
                      'w-full bg-input border rounded-xl pl-12 pr-4 py-3 text-xl font-bold font-display focus:outline-none focus:ring-2 focus:ring-ring transition-all',
                      errors.amount ? 'border-red-500/50' : 'border-border'
                    )}
                  />
                </div>
                {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Deskripsi
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Contoh: Makan siang, Gaji bulan ini..."
                  className={cn(
                    'w-full bg-input border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all',
                    errors.description ? 'border-red-500/50' : 'border-border'
                  )}
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Kategori
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {filteredCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all',
                        categoryId === cat.id
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-foreground'
                          : 'border-border bg-card/50 text-muted-foreground hover:border-border/80 hover:text-foreground'
                      )}
                      style={categoryId === cat.id ? { borderColor: cat.color + '60', background: cat.color + '15' } : {}}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="truncate w-full text-center">{cat.name}</span>
                    </button>
                  ))}
                </div>
                {errors.categoryId && <p className="text-red-400 text-xs mt-1">{errors.categoryId}</p>}
              </div>

              {/* Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className={cn(
                      'w-full bg-input border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all',
                      errors.date ? 'border-red-500/50' : 'border-border'
                    )}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Catatan (opsional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Catatan tambahan..."
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className={cn(
                  'w-full py-4 rounded-2xl font-display font-bold text-base transition-all active:scale-98',
                  type === 'income'
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-glow'
                    : 'bg-red-500 text-white hover:bg-red-600'
                )}
              >
                {editTransaction ? 'Simpan Perubahan' : `Catat ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
