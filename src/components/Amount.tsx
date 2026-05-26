import { motion } from 'framer-motion'
import { formatRupiah } from '@/utils/helpers'
import { cn } from '@/utils/cn'

interface AmountProps {
  amount: number
  type?: 'income' | 'expense' | 'balance'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  compact?: boolean
  className?: string
  animate?: boolean
}

const SIZE_CLASSES = {
  sm: 'text-sm font-semibold',
  md: 'text-base font-semibold',
  lg: 'text-xl font-bold',
  xl: 'text-3xl font-bold font-display',
}

const TYPE_CLASSES = {
  income: 'text-emerald-400',
  expense: 'text-red-400',
  balance: '',
}

export function Amount({ amount, type, size = 'md', compact = false, className, animate = false }: AmountProps) {
  const formatted = formatRupiah(amount, compact)
  const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : ''

  const content = (
    <span className={cn(SIZE_CLASSES[size], type ? TYPE_CLASSES[type] : '', className)}>
      {prefix}{type === 'expense' ? formatRupiah(Math.abs(amount), compact) : formatted}
    </span>
  )

  if (animate) {
    return (
      <motion.span
        key={amount}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(SIZE_CLASSES[size], type ? TYPE_CLASSES[type] : '', className)}
      >
        {prefix}{type === 'expense' ? formatRupiah(Math.abs(amount), compact) : formatted}
      </motion.span>
    )
  }

  return content
}
