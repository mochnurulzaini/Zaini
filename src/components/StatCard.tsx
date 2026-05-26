import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Amount } from './Amount'
import { cn } from '@/utils/cn'

interface StatCardProps {
  label: string
  amount: number
  type?: 'income' | 'expense' | 'balance'
  icon?: React.ReactNode
  trend?: number
  delay?: number
  className?: string
}

export function StatCard({ label, amount, type, icon, trend, delay = 0, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={cn('glass-card p-5', className)}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center',
            type === 'income' && 'bg-emerald-500/10 border border-emerald-500/20',
            type === 'expense' && 'bg-red-500/10 border border-red-500/20',
            type === 'balance' && 'bg-blue-500/10 border border-blue-500/20',
            !type && 'bg-accent'
          )}>
            {icon}
          </div>
        )}
      </div>

      <Amount amount={amount} type={type} size="lg" animate />

      {typeof trend === 'number' && (
        <div className={cn(
          'flex items-center gap-1 mt-2 text-xs',
          trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-muted-foreground'
        )}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          <span>{Math.abs(trend).toFixed(1)}% dari bulan lalu</span>
        </div>
      )}
    </motion.div>
  )
}
