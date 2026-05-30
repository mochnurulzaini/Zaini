import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ArrowLeftRight, Tag, Target, PiggyBank,
  BarChart3, Settings, Plus, X, TrendingUp, TrendingDown, Menu
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useUIStore } from '@/stores/uiStore'

interface NavItem {
  path: string
  icon: React.ElementType
  label: string
  mobileHide?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Beranda' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transaksi' },
  { path: '/categories', icon: Tag, label: 'Kategori', mobileHide: true },
  { path: '/budgets', icon: Target, label: 'Anggaran' },
  { path: '/savings', icon: PiggyBank, label: 'Tabungan', mobileHide: true },
  { path: '/statistics', icon: BarChart3, label: 'Statistik' },
  { path: '/settings', icon: Settings, label: 'Pengaturan', mobileHide: true },
]

const MOBILE_NAV: NavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Beranda' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transaksi' },
  { path: '/budgets', icon: Target, label: 'Anggaran' },
  { path: '/statistics', icon: BarChart3, label: 'Statistik' },
  { path: '/settings', icon: Settings, label: 'Lainnya' },
]

interface FABMenuProps {
  onClose: () => void
}

function FABMenu({ onClose }: FABMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute bottom-28 right-4 flex flex-col gap-3 items-end"
        onClick={e => e.stopPropagation()}
      >
        <NavLink
          to="/transactions?type=income"
          onClick={onClose}
          className="flex items-center gap-3 glass-card px-4 py-3 hover:border-emerald-500/40 transition-all"
        >
          <span className="text-sm font-semibold text-emerald-400">Tambah Pemasukan</span>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
        </NavLink>
        <NavLink
          to="/transactions?type=expense"
          onClick={onClose}
          className="flex items-center gap-3 glass-card px-4 py-3 hover:border-red-500/40 transition-all"
        >
          <span className="text-sm font-semibold text-red-400">Tambah Pengeluaran</span>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
        </NavLink>
      </motion.div>
    </motion.div>
  )
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const [fabOpen, setFabOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-full min-h-dvh bg-background">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden md:flex flex-col border-r border-border bg-card/50 backdrop-blur-md transition-all duration-300 shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}>
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-border',
          sidebarCollapsed && 'justify-center'
        )}>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <span className="text-base">💰</span>
          </div>
          {!sidebarCollapsed && (
            <span className="font-display font-bold text-lg gradient-text">MoneyFlow</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className={cn(
              'ml-auto text-muted-foreground hover:text-foreground transition-colors',
              sidebarCollapsed && 'ml-0'
            )}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/')
            return (
              <NavLink
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
                  active
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  sidebarCollapsed && 'justify-center'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="glass-card p-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Offline • Data aman</span>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0 no-scrollbar">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-md border-t border-border safe-bottom fixed-safe-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {MOBILE_NAV.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path
            return (
              <NavLink
                key={path}
                to={path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-[52px]',
                  active ? 'text-emerald-400' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'p-1.5 rounded-xl transition-all',
                  active && 'bg-emerald-500/10'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* FAB */}
      <AnimatePresence>{fabOpen && <FABMenu onClose={() => setFabOpen(false)} />}</AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setFabOpen(o => !o)}
        className={cn(
          'md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-2xl shadow-glow z-50 flex items-center justify-center transition-all duration-200 fixed-safe-right',
          fabOpen
            ? 'bg-card border border-border text-foreground'
            : 'bg-emerald-500 text-white'
        )}
        style={{ boxShadow: fabOpen ? undefined : '0 0 20px rgba(16,185,129,0.4)', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 3rem)' }}
      >
        <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="w-6 h-6" />
        </motion.div>
      </motion.button>

      {/* Desktop FAB */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="hidden md:block fixed bottom-8 right-8 z-30"
      >
        <NavLink
          to="/transactions?modal=true"
          className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-glow font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Transaksi Baru
        </NavLink>
      </motion.div>
      {/* Theme toggle moved to Settings page */}
    </div>
  )
}
