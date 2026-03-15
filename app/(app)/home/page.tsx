'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Settings2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import MetricCard from '@/components/home/MetricCard'
import MetricCardCustomizer from '@/components/home/MetricCardCustomizer'
import DebtSummary from '@/components/home/DebtSummary'
import CategorySummary from '@/components/home/CategorySummary'
import { useProfile, useMetricPrefs } from '@/hooks/useProfile'
import { useBudget } from '@/hooks/useBudget'
import { useExpenses } from '@/hooks/useExpenses'
import { useGroupDebts } from '@/hooks/useGroups'
import { calculateBudgetMetrics } from '@/lib/calculations'
import { formatCurrency, getCurrentMonth, getYesterday } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { MetricKey, SplitShare, Category } from '@/lib/types'

export default function HomePage() {
  const { profile, loading: profileLoading } = useProfile()
  const { prefs, updatePrefs } = useMetricPrefs()
  const { budget } = useBudget()
  const { expenses, loading: expLoading } = useExpenses()
  const { youOwe, owedToYou } = useGroupDebts()

  const [userSplitShares, setUserSplitShares] = useState<SplitShare[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const metric1: MetricKey = prefs?.metric_1 ?? 'budget_left'
  const metric2: MetricKey = prefs?.metric_2 ?? 'daily_avg_left'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return

      const { data: shares } = await supabase
        .from('split_shares')
        .select('*')
        .eq('user_id', user.id)

      setUserSplitShares(shares ?? [])

      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('sort_order')

      setCategories(cats ?? [])
    })
  }, [])

  const personalExpenses = expenses.filter((e) => !e.is_split)
  const yesterday = getYesterday()
  const yesterdayPersonal = personalExpenses.filter((e) => e.date === yesterday)

  const metrics = calculateBudgetMetrics({
    budget,
    personalExpenses,
    userSplitShares,
    paidSplitShares: owedToYou as SplitShare[],
    yesterdayPersonal,
    yesterdaySplitShares: [],
    today: new Date(),
  })

  const loading = profileLoading || expLoading

  const firstName = profile?.name?.split(' ')[0] ?? ''
  const monthLabel = format(new Date(), 'MMMM')
  const yearLabel = format(new Date(), 'yyyy')

  // Budget utilization for the progress bar
  const utilization = metrics.total_budget > 0
    ? Math.min((metrics.total_budget - metrics.budget_left) / metrics.total_budget, 1)
    : 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-medium" style={{ color: '#8b949e' }}>
            {firstName ? `Hi ${firstName} 👋` : 'Overview'}
          </p>
          <MetricCardCustomizer
            metric1={metric1}
            metric2={metric2}
            onChange={(m1, m2) => updatePrefs(m1, m2)}
          >
            <button
              className="h-8 w-8 flex items-center justify-center rounded-full transition-colors"
              style={{ background: '#21262d' }}
            >
              <Settings2 className="h-4 w-4" style={{ color: '#8b949e' }} />
            </button>
          </MetricCardCustomizer>
        </div>

        {/* Large month title */}
        <h1 className="text-5xl font-black tracking-tight leading-none" style={{ color: 'var(--foreground)' }}>
          {monthLabel}
        </h1>
        <p className="text-lg font-medium mt-0.5" style={{ color: '#8b949e' }}>{yearLabel}</p>

        {/* Budget hero */}
        <div className="mt-6">
          {loading ? (
            <Skeleton className="h-24 rounded-3xl" />
          ) : (
            <div
              className="rounded-3xl p-5"
              style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.08)' }}
            >
              <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#8b949e' }}>
                Budget remaining
              </p>
              <p className="text-4xl font-black tabular-nums" style={{ color: metrics.budget_left >= 0 ? 'var(--foreground)' : '#f85149' }}>
                {formatCurrency(Math.abs(metrics.budget_left))}
                {metrics.budget_left < 0 && (
                  <span className="text-xl font-medium ml-2" style={{ color: '#f85149' }}>over</span>
                )}
              </p>
              <div className="mt-3 flex items-center gap-3">
                {/* Progress bar */}
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(240,246,252,0.08)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${utilization * 100}%`,
                      background: utilization > 0.85 ? '#f85149' : utilization > 0.65 ? '#f59e0b' : '#6366f1',
                    }}
                  />
                </div>
                <p className="text-xs shrink-0" style={{ color: '#8b949e' }}>
                  {metrics.remaining_days}d left
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-36 space-y-6">
        {/* Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <MetricCard metricKey={metric1} value={metrics[metric1]} index={0} />
            <MetricCard metricKey={metric2} value={metrics[metric2]} index={1} />
          </div>
        )}

        {/* Debt Summary */}
        <DebtSummary youOwe={youOwe as any} owedToYou={owedToYou as any} />

        {/* Category Breakdown */}
        {!loading && (
          <CategorySummary expenses={expenses} categories={categories} />
        )}
      </div>
    </div>
  )
}
