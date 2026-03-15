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
      <div className="space-y-3 px-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" style={{ background: '#21262d' }} />
        ))}
      </div>
    )
  }

  if (!expenses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <p className="text-4xl mb-3">🧾</p>
        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No expenses yet</p>
        <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Tap + to add your first expense</p>
      </div>
    )
  }

  // Group by date
  const grouped = new Map<string, Expense[]>()
  for (const expense of expenses) {
    if (!grouped.has(expense.date)) grouped.set(expense.date, [])
    grouped.get(expense.date)!.push(expense)
  }

  return (
    <div className="space-y-5">
      {Array.from(grouped.entries()).map(([date, dayExpenses]) => (
        <div key={date}>
          {/* Date header */}
          <p
            className="px-5 pb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#8b949e' }}
          >
            {formatGroupDate(date)}
          </p>

          {/* Flat list */}
          <div
            className="mx-5 rounded-2xl overflow-hidden"
            style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.06)' }}
          >
            {dayExpenses.map((expense, i) => (
              <div
                key={expense.id}
                style={
                  i < dayExpenses.length - 1
                    ? { borderBottom: '1px solid rgba(240,246,252,0.06)' }
                    : undefined
                }
              >
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
