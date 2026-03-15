'use client'

import { format, parseISO } from 'date-fns'
import ExpenseItem from './ExpenseItem'
import { Skeleton } from '@/components/ui/skeleton'
import type { Expense } from '@/lib/types'

interface Props {
  expenses: Expense[]
  loading?: boolean
}

export default function ExpenseList({ expenses, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!expenses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <p className="text-4xl mb-3">🧾</p>
        <p className="font-medium">No expenses yet</p>
        <p className="text-sm text-neutral-400 mt-1">Tap + to add your first expense</p>
      </div>
    )
  }

  // Group by date
  const grouped = new Map<string, Expense[]>()
  for (const expense of expenses) {
    const key = expense.date
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(expense)
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([date, dayExpenses]) => (
        <div key={date}>
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
              {formatGroupDate(date)}
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 mx-4 overflow-hidden">
            {dayExpenses.map((expense, i) => (
              <div key={expense.id} className={i < dayExpenses.length - 1 ? 'border-b border-neutral-50 dark:border-neutral-800' : ''}>
                <ExpenseItem expense={expense} index={i} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatGroupDate(dateStr: string): string {
  const d = parseISO(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return format(d, 'EEEE, MMM d')
}
