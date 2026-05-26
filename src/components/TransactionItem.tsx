import { motion } from 'framer-motion'
import { Trash2, Edit2 } from 'lucide-react'
import { formatDate } from '@/utils/helpers'
import { Amount } from './Amount'
import { useCategoryStore } from '@/stores/categoryStore'
import type { Transaction } from '@/types'
import { cn } from '@/utils/cn'

interface TransactionItemProps {
  transaction: Transaction
  onEdit?: (tx: Transaction) => void
  onDelete?: (id: string) => void
  delay?: number
  showDate?: boolean
}

export function TransactionItem({
  transaction, onEdit, onDelete, delay = 0, showDate = true
}: TransactionItemProps) {
  const { getCategoryById } = useCategoryStore()
  const category = getCategoryById(transaction.categoryId)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 group transition-colors"
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg"
        style={{ background: (category?.color ?? '#6b7280') + '20', border: `1px solid ${category?.color ?? '#6b7280'}40` }}
      >
        {category?.icon ?? '💰'}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{transaction.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{category?.name ?? 'Lainnya'}</span>
          {showDate && (
            <>
              <span className="text-muted-foreground/40 text-xs">•</span>
              <span className="text-xs text-muted-foreground">{formatDate(transaction.date)}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2">
        <Amount amount={transaction.amount} type={transaction.type} size="sm" />
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(transaction)}
              className="w-7 h-7 rounded-lg bg-accent hover:bg-accent/70 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(transaction.id)}
              className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
