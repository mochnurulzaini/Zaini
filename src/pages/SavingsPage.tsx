import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, Edit2, PlusCircle } from 'lucide-react'
import { useSavingsStore } from '@/stores/savingsStore'
import { useUIStore } from '@/stores/uiStore'
import { PageHeader } from '@/components/PageHeader'
import { Amount } from '@/components/Amount'
import { EmptyState } from '@/components/EmptyState'
import { formatRupiahInput, parseRupiahInput, CATEGORY_COLORS, CATEGORY_ICONS } from '@/utils/helpers'
import { format, parseISO, differenceInDays } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/utils/cn'
import type { SavingsGoal } from '@/types'

interface SavingsModalProps {
  open: boolean
  onClose: () => void
  editGoal?: SavingsGoal | null
}

function SavingsModal({ open, onClose, editGoal }: SavingsModalProps) {
  const { addGoal, updateGoal } = useSavingsStore()
  const { addToast } = useUIStore()

  const [name, setName] = useState(editGoal?.name ?? '')
  const [target, setTarget] = useState(editGoal ? new Intl.NumberFormat('id-ID').format(editGoal.targetAmount) : '')
  const [current, setCurrent] = useState(editGoal ? new Intl.NumberFormat('id-ID').format(editGoal.currentAmount) : '')
  const [deadline, setDeadline] = useState(editGoal?.deadline?.split('T')[0] ?? '')
  const [icon, setIcon] = useState(editGoal?.icon ?? '🎯')
  const [color, setColor] = useState(editGoal?.color ?? CATEGORY_COLORS[0] ?? '#10b981')
  const [description, setDescription] = useState(editGoal?.description ?? '')

  const handleSubmit = () => {
    const t = parseRupiahInput(target)
    const c = parseRupiahInput(current)
    if (!name.trim() || t === 0) return
    const data = {
      name: name.trim(), targetAmount: t, currentAmount: Math.min(c, t),
      deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 365 * 86400000).toISOString(),
      icon, color, description: description.trim()
    }
    if (editGoal) {
      updateGoal(editGoal.id, data)
      addToast('success', 'Target diperbarui')
    } else {
      addGoal(data)
      addToast('success', 'Target tabungan dibuat')
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 flex items-end md:items-center justify-center"
          onClick={onClose}>
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="w-full max-w-md glass-card rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[90dvh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 md:hidden"><div className="w-12 h-1 rounded-full bg-border" /></div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="font-display font-bold text-lg">{editGoal ? 'Edit Target' : 'Target Baru'}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto no-scrollbar">
              {/* Preview */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border-2"
                  style={{ background: color + '20', borderColor: color + '60' }}>{icon}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Nama Target</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Beli Laptop, Liburan..."
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Target (Rp)</label>
                  <input type="text" inputMode="numeric" value={target} onChange={e => setTarget(formatRupiahInput(e.target.value))}
                    placeholder="0" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Sudah Ada (Rp)</label>
                  <input type="text" inputMode="numeric" value={current} onChange={e => setCurrent(formatRupiahInput(e.target.value))}
                    placeholder="0" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Deadline</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Ikon</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {CATEGORY_ICONS.slice(0, 16).map(i => (
                    <button key={i} onClick={() => setIcon(i)}
                      className={cn('w-9 h-9 rounded-xl text-base flex items-center justify-center border transition-all',
                        icon === i ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border bg-card/50')}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Warna</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)}
                      className={cn('w-7 h-7 rounded-xl transition-all border-2', color === c ? 'border-white scale-110' : 'border-transparent')}
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Deskripsi (opsional)</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Catatan tambahan..."
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button onClick={handleSubmit} disabled={!name.trim() || !target}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                {editGoal ? 'Simpan' : 'Buat Target'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function AddFundsModal({ goal, open, onClose }: { goal: SavingsGoal; open: boolean; onClose: () => void }) {
  const { addToGoal } = useSavingsStore()
  const { addToast } = useUIStore()
  const [amount, setAmount] = useState('')

  const handleAdd = () => {
    const val = parseRupiahInput(amount)
    if (val === 0) return
    addToGoal(goal.id, val)
    addToast('success', 'Dana ditambahkan', `+Rp ${new Intl.NumberFormat('id-ID').format(val)}`)
    setAmount('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm glass-card rounded-3xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base">Tambah Dana — {goal.name}</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">Rp</span>
              <input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(formatRupiahInput(e.target.value))}
                placeholder="0" autoFocus
                className="w-full bg-input border border-border rounded-xl pl-12 pr-4 py-3 text-xl font-bold font-display focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button onClick={handleAdd} disabled={!amount}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors">
              Tambahkan Dana
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function GoalCard({ goal, index, onEdit, onDelete }: { goal: SavingsGoal; index: number; onEdit: (g: SavingsGoal) => void; onDelete: (id: string) => void }) {
  const [addFundsOpen, setAddFundsOpen] = useState(false)
  const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  const remaining = goal.targetAmount - goal.currentAmount
  const daysLeft = differenceInDays(parseISO(goal.deadline), new Date())
  const isComplete = pct >= 100

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
        className="glass-card p-5 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl border-2"
              style={{ background: goal.color + '20', borderColor: goal.color + '60' }}>{goal.icon}</div>
            <div>
              <p className="font-semibold text-sm">{goal.name}</p>
              <p className="text-xs text-muted-foreground">
                {isComplete ? '🎉 Tercapai!' : daysLeft > 0 ? `${daysLeft} hari lagi` : 'Sudah lewat deadline'}
              </p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setAddFundsOpen(true)}
              className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PlusCircle className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onEdit(goal)} className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground">
              <Edit2 className="w-3 h-3" />
            </button>
            <button onClick={() => onDelete(goal.id)} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground">Terkumpul</p>
              <Amount amount={goal.currentAmount} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Target</p>
              <Amount amount={goal.targetAmount} size="md" />
            </div>
          </div>

          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: index * 0.07 }}
              className="h-full rounded-full"
              style={{ background: isComplete ? '#10b981' : goal.color }}
            />
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{pct.toFixed(1)}%</span>
            {!isComplete && <span className="text-muted-foreground">Kurang <span className="text-foreground font-medium">Rp {new Intl.NumberFormat('id-ID').format(remaining)}</span></span>}
          </div>
        </div>

        {!isComplete && (
          <button onClick={() => setAddFundsOpen(true)}
            className="w-full mt-4 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2">
            <PlusCircle className="w-4 h-4" /> Tambah Dana
          </button>
        )}
      </motion.div>
      <AddFundsModal goal={goal} open={addFundsOpen} onClose={() => setAddFundsOpen(false)} />
    </>
  )
}

export function SavingsPage() {
  const { goals, deleteGoal } = useSavingsStore()
  const { addToast } = useUIStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null)

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0)
  const completed = goals.filter(g => g.currentAmount >= g.targetAmount).length

  const handleDelete = (id: string) => {
    deleteGoal(id)
    addToast('success', 'Target dihapus')
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Target Tabungan"
        subtitle={`${goals.length} target aktif`}
        action={
          <button onClick={() => { setEditGoal(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        }
      />

      <div className="px-4 md:px-6 space-y-4 pb-8">
        {goals.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-3">
            {[
              { label: 'Target', value: totalTarget },
              { label: 'Terkumpul', value: totalSaved },
              { label: 'Selesai', value: completed, isCount: true },
            ].map(({ label, value, isCount }) => (
              <div key={label} className="glass-card p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                {isCount
                  ? <p className="font-display font-bold text-xl text-emerald-400">{value}</p>
                  : <Amount amount={value} size="sm" compact />
                }
              </div>
            ))}
          </motion.div>
        )}

        {goals.length === 0 ? (
          <EmptyState
            icon="🐖"
            title="Belum ada target tabungan"
            description="Tetapkan tujuan finansialmu dan pantau progresnya setiap hari"
            action={
              <button onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                <Plus className="w-4 h-4" /> Buat Target
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {goals.map((goal, i) => (
              <GoalCard key={goal.id} goal={goal} index={i}
                onEdit={g => { setEditGoal(g); setModalOpen(true) }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <SavingsModal open={modalOpen} onClose={() => { setModalOpen(false); setEditGoal(null) }} editGoal={editGoal} />
    </div>
  )
}
