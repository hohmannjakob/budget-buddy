'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import SpendingChart from '@/components/insights/SpendingChart'
import CategoryBreakdown from '@/components/insights/CategoryBreakdown'
import BudgetVsActual from '@/components/insights/BudgetVsActual'
import { useExpenses } from '@/hooks/useExpenses'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { Category } from '@/lib/types'

function getMonthStr(offset: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default function InsightsPage() {
  const [monthOffset, setMonthOffset] = useState(0)
  const monthStr = getMonthStr(monthOffset)
  const { expenses, loading } = useExpenses(monthStr)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('sort_order')
      setCategories(data ?? [])
    })
  }, [])

  const monthLabel = format(new Date(monthStr + 'T00:00:00'), 'MMMM yyyy')
  const total = expenses.filter((e) => !e.is_split).reduce((s, e) => s + e.amount, 0)

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="px-5 pt-14 pb-5">
        <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: 'var(--foreground)' }}>Insights</h1>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="h-9 w-9 flex items-center justify-center rounded-full"
            style={{ background: '#21262d' }}
          >
            <ChevronLeft className="h-4 w-4" style={{ color: '#f0f6fc' }} />
          </button>
          <div className="text-center">
            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{monthLabel}</p>
            <p className="text-sm" style={{ color: '#8b949e' }}>{loading ? '…' : formatCurrency(total)} spent</p>
          </div>
          <button
            onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))}
            disabled={monthOffset === 0}
            className="h-9 w-9 flex items-center justify-center rounded-full disabled:opacity-30"
            style={{ background: '#21262d' }}
          >
            <ChevronRight className="h-4 w-4" style={{ color: '#f0f6fc' }} />
          </button>
        </div>
      </div>

      <div className="px-5 pb-36 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-52 rounded-3xl" style={{ background: '#21262d' }} />
            <Skeleton className="h-64 rounded-3xl" style={{ background: '#21262d' }} />
            <Skeleton className="h-52 rounded-3xl" style={{ background: '#21262d' }} />
          </>
        ) : (
          <>
            <SpendingChart expenses={expenses} month={monthStr} />
            <CategoryBreakdown expenses={expenses} categories={categories} />
            <BudgetVsActual expenses={expenses} categories={categories} />
          </>
        )}
      </div>
    </div>
  )
}
