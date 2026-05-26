import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}
    >
      <div className="text-5xl mb-4 animate-pulse-slow">{icon}</div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
      {description && <p className="text-muted-foreground text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
