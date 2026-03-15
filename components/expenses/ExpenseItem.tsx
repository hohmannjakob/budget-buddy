'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Expense } from '@/lib/types'

function getCategoryEmoji(icon?: string): string {
  const map: Record<string, string> = {
    utensils: '🍽️', car: '🚗', home: '🏠', tv: '📺',
    'shopping-bag': '🛍️', heart: '❤️', book: '📚',
    'piggy-bank': '🐷', 'more-horizontal': '⚙️', circle: '⚪',
  }
  return icon ? (map[icon] ?? '💳') : '💳'
}

interface Props {
  expense: Expense
  userShare?: number // for split expenses, user's share
  index?: number
}

export default function ExpenseItem({ expense, userShare, index = 0 }: Props) {
  const displayAmount = expense.is_split && userShare !== undefined
    ? userShare
    : expense.amount

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div
        className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-lg"
        style={{
          backgroundColor: (expense.category?.color ?? '#6366f1') + '15',
        }}
      >
        {getCategoryEmoji(expense.category?.icon)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{expense.title}</p>
          {expense.is_split && (
            <Users className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-neutral-400">{expense.category?.name ?? 'Uncategorized'}</p>
          <span className="text-neutral-200 dark:text-neutral-700">·</span>
          <p className="text-xs text-neutral-400">{formatDate(expense.date)}</p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums">
          -{formatCurrency(displayAmount)}
        </p>
        {expense.is_split && userShare !== undefined && (
          <p className="text-xs text-neutral-400">
            of {formatCurrency(expense.amount)}
          </p>
        )}
      </div>
    </motion.div>
  )
}
