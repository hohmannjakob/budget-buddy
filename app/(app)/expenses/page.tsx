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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold mb-4">Expenses</h1>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-center">
            <p className="font-semibold">{monthLabel}</p>
            <p className="text-sm text-neutral-400">
              {loading ? '…' : formatCurrency(total)} total
            </p>
          </div>

          <button
            onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))}
            disabled={monthOffset === 0}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="py-4">
        <ExpenseList expenses={expenses} loading={loading} />
      </div>
    </div>
  )
}
