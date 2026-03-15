'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import ExpenseList from '@/components/expenses/ExpenseList'
import { useExpenses } from '@/hooks/useExpenses'
import { formatCurrency } from '@/lib/utils'

function getMonthStr(offset: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default function ExpensesPage() {
  const [monthOffset, setMonthOffset] = useState(0)
  const monthStr = getMonthStr(monthOffset)
  const { expenses, loading } = useExpenses(monthStr)

  const monthLabel = format(new Date(monthStr + 'T00:00:00'), 'MMMM yyyy')
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="shrink-0 px-5 pt-14 pb-5" style={{ borderBottom: '1px solid rgba(240,246,252,0.06)' }}>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>
          Expenses
        </h1>

        {/* Month navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="h-9 w-9 flex items-center justify-center rounded-full transition-colors"
            style={{ background: '#21262d' }}
          >
            <ChevronLeft className="h-4 w-4" style={{ color: '#f0f6fc' }} />
          </button>

          <div className="text-center">
            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{monthLabel}</p>
            <p className="text-sm" style={{ color: '#8b949e' }}>
              {loading ? '…' : formatCurrency(total)} total
            </p>
          </div>

          <button
            onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))}
            disabled={monthOffset === 0}
            className="h-9 w-9 flex items-center justify-center rounded-full transition-colors disabled:opacity-30"
            style={{ background: '#21262d' }}
          >
            <ChevronRight className="h-4 w-4" style={{ color: '#f0f6fc' }} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto scroll-area py-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}
      >
        <ExpenseList expenses={expenses} loading={loading} />
      </div>
    </div>
  )
}
