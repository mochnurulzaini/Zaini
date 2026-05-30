import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sun, Moon, Lock, Unlock, Download, Upload, Trash2, X,
  ChevronRight, Shield, Database, Palette, Info, Eye, EyeOff
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { useSavingsStore } from '@/stores/savingsStore'
import { exportAllData, importAllData, clearStorage, getStorageInfo } from '@/utils/storage'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/utils/cn'

function SettingRow({ icon, label, description, action, danger }: {
  icon: React.ReactNode; label: string; description?: string; action: React.ReactNode; danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-4 px-5">
      <div className="flex items-center gap-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', danger ? 'bg-red-500/10' : 'bg-accent')}>
          <span className={danger ? 'text-red-400' : 'text-muted-foreground'}>{icon}</span>
        </div>
        <div>
          <p className={cn('text-sm font-medium', danger && 'text-red-400')}>{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div>{action}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-5">{title}</p>
      <div className="glass-card divide-y divide-border/50">{children}</div>
    </div>
  )
}

function PinSetupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { enablePin, addToast } = useUIStore()
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')

  const reset = () => { setStep('enter'); setPin(''); setPinConfirm(''); setError('') }
  const handleClose = () => { reset(); onClose() }

  const handleNext = () => {
    if (pin.length < 4) { setError('PIN minimal 4 digit'); return }
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (pin !== pinConfirm) { setError('PIN tidak cocok'); setPinConfirm(''); return }
    await enablePin(pin)
    addToast('success', 'PIN berhasil diaktifkan')
    handleClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          onClick={handleClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm glass-card rounded-3xl p-6 space-y-5"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base">{step === 'enter' ? 'Buat PIN Baru' : 'Konfirmasi PIN'}</h3>
              <button onClick={handleClose} className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
            </div>
            <p className="text-sm text-muted-foreground">
              {step === 'enter' ? 'Masukkan PIN yang akan digunakan untuk mengunci aplikasi' : 'Masukkan PIN sekali lagi untuk konfirmasi'}
            </p>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'} inputMode="numeric" maxLength={8}
                value={step === 'enter' ? pin : pinConfirm}
                onChange={e => {
                  const v = e.target.value.replace(/\D/g, '')
                  if (step === 'enter') setPin(v); else setPinConfirm(v)
                  setError('')
                }}
                autoFocus
                placeholder="Masukkan PIN..."
                className="w-full bg-input border border-border rounded-xl px-4 py-3 pr-12 text-xl font-display font-bold tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={() => setShowPin(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-xs -mt-2">{error}</p>}
            <button
              onClick={step === 'enter' ? handleNext : handleConfirm}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors">
              {step === 'enter' ? 'Lanjut' : 'Aktifkan PIN'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ConfirmDialog({ open, title, description, onConfirm, onClose, danger }: {
  open: boolean; title: string; description: string; onConfirm: () => void; onClose: () => void; danger?: boolean
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm glass-card rounded-3xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-border text-foreground font-semibold text-sm hover:bg-accent transition-colors">Batal</button>
              <button onClick={() => { onConfirm(); onClose() }}
                className={cn('flex-1 py-3 rounded-2xl font-semibold text-sm text-white transition-colors', danger ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600')}>
                Lanjutkan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SettingsPage() {
  const { settings, toggleTheme, disablePin, addToast } = useUIStore()
  const { loadTransactions } = useTransactionStore()
  const { loadCategories } = useCategoryStore()
  const { loadBudgets } = useBudgetStore()
  const { loadGoals } = useSavingsStore()

  const [pinModalOpen, setPinModalOpen] = useState(false)
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const storageInfo = getStorageInfo()
  const storageKB = (storageInfo.used / 1024).toFixed(1)

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moneyflow-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('success', 'Data berhasil diekspor')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const ok = importAllData(text)
      if (ok) {
        loadTransactions(); loadCategories(); loadBudgets(); loadGoals()
        addToast('success', 'Data berhasil diimpor', 'Semua data telah dipulihkan')
      } else {
        addToast('error', 'Gagal mengimpor data', 'File tidak valid atau rusak')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleReset = () => {
    clearStorage()
    loadTransactions(); loadCategories(); loadBudgets(); loadGoals()
    addToast('success', 'Data direset', 'Semua data telah dihapus')
  }

  const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={cn('w-11 h-6 rounded-full transition-all duration-200 relative', checked ? 'bg-emerald-500' : 'bg-muted')}>
      <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200', checked ? 'left-5' : 'left-0.5')} />
    </button>
  )

  return (
    <div className="min-h-screen">
      <PageHeader title="Pengaturan" subtitle="Kelola preferensi aplikasi" />

      <div className="px-4 md:px-6 space-y-5 pb-8">
        {/* Appearance */}
        <Section title="Tampilan">
          <div className="py-4 px-5">
            <p className="text-sm font-medium mb-3">Mode Tampilan</p>
            <div className="flex gap-2">
              <button
                onClick={() => { if (settings.theme !== 'light') toggleTheme() }}
                className={cn(
                  'flex-1 py-3 rounded-xl font-medium text-sm transition-all',
                  settings.theme === 'light'
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                    : 'bg-accent border border-border text-muted-foreground hover:text-foreground'
                )}
              >
                <Sun className="w-4 h-4 inline mr-2" />
                Terang
              </button>
              <button
                onClick={() => { if (settings.theme !== 'dark') toggleTheme() }}
                className={cn(
                  'flex-1 py-3 rounded-xl font-medium text-sm transition-all',
                  settings.theme === 'dark'
                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                    : 'bg-accent border border-border text-muted-foreground hover:text-foreground'
                )}
              >
                <Moon className="w-4 h-4 inline mr-2" />
                Gelap
              </button>
            </div>
          </div>
        </Section>

        {/* Security */}
        <Section title="Keamanan">
          <SettingRow
            icon={settings.pinEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            label="PIN Lock"
            description={settings.pinEnabled ? 'Aplikasi terkunci dengan PIN' : 'PIN tidak aktif'}
            action={
              settings.pinEnabled ? (
                <button onClick={disablePin}
                  className="text-xs text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                  Nonaktifkan
                </button>
              ) : (
                <button onClick={() => setPinModalOpen(true)}
                  className="text-xs text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors">
                  Aktifkan
                </button>
              )
            }
          />
        </Section>

        {/* Data Management */}
        <Section title="Manajemen Data">
          <SettingRow
            icon={<Database className="w-4 h-4" />}
            label="Penyimpanan"
            description={`${storageKB} KB digunakan`}
            action={<span className="text-xs text-muted-foreground">LocalStorage</span>}
          />
          <SettingRow
            icon={<Download className="w-4 h-4" />}
            label="Ekspor Data"
            description="Unduh backup ke file JSON"
            action={
              <button onClick={handleExport}
                className="text-xs text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors">
                Ekspor
              </button>
            }
          />
          <SettingRow
            icon={<Upload className="w-4 h-4" />}
            label="Impor Data"
            description="Pulihkan dari file backup"
            action={
              <>
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
                <button onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors">
                  Impor
                </button>
              </>
            }
          />
          <SettingRow
            icon={<Trash2 className="w-4 h-4" />}
            label="Reset Semua Data"
            description="Hapus seluruh data aplikasi"
            danger
            action={
              <button onClick={() => setResetConfirmOpen(true)}
                className="text-xs text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                Reset
              </button>
            }
          />
        </Section>

        {/* About */}
        <Section title="Tentang">
          <SettingRow
            icon={<Info className="w-4 h-4" />}
            label="MoneyFlow"
            description="v1.0.0 • Aplikasi keuangan pribadi"
            action={<span className="text-xs text-muted-foreground">2024</span>}
          />
          <SettingRow
            icon={<Shield className="w-4 h-4" />}
            label="Privasi"
            description="Data tersimpan lokal, tidak dikirim ke server"
            action={<span className="w-2 h-2 rounded-full bg-emerald-500 block" />}
          />
        </Section>

        {/* Offline indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <p className="text-sm font-medium">Full Offline</p>
            <p className="text-xs text-muted-foreground">Semua data tersimpan di perangkat kamu</p>
          </div>
        </motion.div>
      </div>

      <PinSetupModal open={pinModalOpen} onClose={() => setPinModalOpen(false)} />
      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset Semua Data?"
        description="Tindakan ini akan menghapus seluruh transaksi, kategori, anggaran, dan target tabungan. Tindakan ini tidak bisa dibatalkan."
        onConfirm={handleReset}
        onClose={() => setResetConfirmOpen(false)}
        danger
      />
    </div>
  )
}
