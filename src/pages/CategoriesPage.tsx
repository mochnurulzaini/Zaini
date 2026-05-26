import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { useCategoryStore } from '@/stores/categoryStore'
import { useUIStore } from '@/stores/uiStore'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/utils/helpers'
import type { Category, CategoryFormData, TransactionType } from '@/types'
import { cn } from '@/utils/cn'

function CategoryModal({
  open, onClose, editCategory
}: { open: boolean; onClose: () => void; editCategory?: Category | null }) {
  const { addCategory, updateCategory } = useCategoryStore()
  const { addToast } = useUIStore()

  const [name, setName] = useState(editCategory?.name ?? '')
  const [icon, setIcon] = useState(editCategory?.icon ?? '💰')
  const [color, setColor] = useState(editCategory?.color ?? CATEGORY_COLORS[0] ?? '#10b981')
  const [type, setType] = useState<TransactionType | 'both'>(editCategory?.type ?? 'expense')

  const handleSubmit = () => {
    if (!name.trim()) return
    if (editCategory) {
      updateCategory(editCategory.id, { name: name.trim(), icon, color, type })
      addToast('success', 'Kategori diperbarui')
    } else {
      addCategory({ name: name.trim(), icon, color, type })
      addToast('success', 'Kategori ditambahkan')
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
              <h2 className="font-display font-bold text-lg">{editCategory ? 'Edit Kategori' : 'Kategori Baru'}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Preview */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl border-2" style={{ background: color + '20', borderColor: color + '60' }}>
                  {icon}
                </div>
              </div>
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Nama Kategori</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Makanan, Transport..."
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {/* Type */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Tipe</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['expense', 'income', 'both'] as const).map(t => (
                    <button key={t} onClick={() => setType(t)}
                      className={cn('py-2 rounded-xl text-xs font-semibold border transition-all',
                        type === t ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-border text-muted-foreground'
                      )}>
                      {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Keduanya'}
                    </button>
                  ))}
                </div>
              </div>
              {/* Icons */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Ikon</label>
                <div className="grid grid-cols-8 gap-2">
                  {CATEGORY_ICONS.map(i => (
                    <button key={i} onClick={() => setIcon(i)}
                      className={cn('w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all',
                        icon === i ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-border bg-card/50'
                      )}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              {/* Colors */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Warna</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map(c => (
                    <button key={c} onClick={() => setColor(c)}
                      className={cn('w-8 h-8 rounded-xl transition-all border-2', color === c ? 'border-white scale-110' : 'border-transparent')}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
              <button onClick={handleSubmit} disabled={!name.trim()}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                {editCategory ? 'Simpan' : 'Tambah Kategori'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CategoriesPage() {
  const { categories, deleteCategory } = useCategoryStore()
  const { addToast } = useUIStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'both'>('expense')

  const filtered = categories.filter(c => c.type === activeTab || c.type === 'both')

  const handleDelete = (cat: Category) => {
    if (cat.isDefault) { addToast('warning', 'Tidak bisa dihapus', 'Kategori default tidak bisa dihapus'); return }
    deleteCategory(cat.id)
    addToast('success', 'Kategori dihapus')
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Kategori"
        subtitle={`${categories.length} kategori`}
        action={
          <button onClick={() => { setEditCat(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        }
      />

      <div className="px-4 md:px-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-muted rounded-2xl">
          {([['expense', 'Pengeluaran'], ['income', 'Pemasukan']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={cn('flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                activeTab === t ? 'bg-card border border-border text-foreground shadow-sm' : 'text-muted-foreground'
              )}>
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="🏷️" title="Belum ada kategori" description="Tambah kategori untuk mengorganisir transaksi kamu" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((cat, i) => (
              <motion.div key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-4 group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                    style={{ background: cat.color + '20', border: `1px solid ${cat.color}40` }}>
                    {cat.icon}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditCat(cat); setModalOpen(true) }}
                      className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {!cat.isDefault && (
                      <button onClick={() => handleDelete(cat)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="font-semibold text-sm text-foreground truncate">{cat.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cat.type === 'both' ? 'Semua tipe' : cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  {cat.isDefault && ' · Default'}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <CategoryModal open={modalOpen} onClose={() => { setModalOpen(false); setEditCat(null) }} editCategory={editCat} />
    </div>
  )
}
