'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Expense } from '@/lib/types'

function getCategoryEmoji(icon?: string): string {
  const map: Record<string, string> = {
    utensils: '🍽️', car: '🚗', home: '🏠', tv: '📺',
    'shopping-bag': '🛍️', heart: '❤️', book: '📚',
    'piggy-bank': '🐷', 'more-horizontal': '⚙️', circle: '⚪',
  }
  return icon ? (map[icon] ?? '💳') : '💳'
}

function SplitAmount({ amount }: { amount: number }) {
  const [intPart, decPart] = amount.toFixed(2).split('.')
  return (
    <span className="tabular-nums font-bold" style={{ color: 'var(--foreground)' }}>
      <span className="text-base">€{intPart}</span>
      <span className="text-xs" style={{ color: '#8b949e' }}>.{decPart}</span>
    </span>
  )
}

interface Props {
  expense: Expense
  userShare?: number
  index?: number
}

export default function ExpenseItem({ expense, userShare, index = 0 }: Props) {
  const displayAmount = expense.is_split && userShare !== undefined
    ? userShare
    : expense.amount

  const categoryColor = expense.category?.color ?? '#6366f1'

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 px-4 py-3"
    >
      {/* Circular icon with solid color background */}
      <div
        className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-base"
        style={{ background: categoryColor + '22' }}
      >
        <span>{getCategoryEmoji(expense.category?.icon)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
            {expense.title}
          </p>
          {expense.is_split && (
            <Users className="h-3 w-3 shrink-0" style={{ color: '#6366f1' }} />
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
          {expense.category?.name ?? 'Uncategorized'}
          {' · '}
          {formatDate(expense.date)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="leading-none">
          <span className="text-xs mr-0.5" style={{ color: '#8b949e' }}>-</span>
          <SplitAmount amount={displayAmount} />
        </p>
        {expense.is_split && userShare !== undefined && (
          <p className="text-[10px] mt-0.5" style={{ color: '#8b949e' }}>
            of €{expense.amount.toFixed(2)}
          </p>
        )}
      </div>
    </motion.div>
  )
}
