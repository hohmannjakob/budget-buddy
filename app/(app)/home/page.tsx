'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Bell } from 'lucide-react'
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
import type { MetricKey, Expense, SplitShare, Category } from '@/lib/types'

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

      // User's split shares this month
      const startDate = getCurrentMonth()
      const { data: shares } = await supabase
        .from('split_shares')
        .select('*')
        .eq('user_id', user.id)

      setUserSplitShares(shares ?? [])

      // Categories
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
  const yesterdaySplitShares = userSplitShares.filter(() => false) // simplified

  const metrics = calculateBudgetMetrics({
    budget,
    personalExpenses,
    userSplitShares,
    paidSplitShares: owedToYou as SplitShare[],
    yesterdayPersonal,
    yesterdaySplitShares,
    today: new Date(),
  })

  const loading = profileLoading || expLoading

  const greeting = getGreeting()
  const todayStr = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400">{todayStr}</p>
            <h1 className="text-xl font-bold mt-0.5">
              {greeting}, {profile?.name?.split(' ')[0] ?? ''}!
            </h1>
          </div>
          <button className="h-9 w-9 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Bell className="h-4.5 w-4.5 text-neutral-500" />
          </button>
        </div>

        {/* Budget overview bar */}
        <div className="mt-4">
          {loading ? (
            <Skeleton className="h-16 rounded-xl" />
          ) : (
            <div className="rounded-xl bg-indigo-500 p-4 text-white">
              <p className="text-xs opacity-75 mb-1">Budget left this month</p>
              <p className="text-3xl font-bold tabular-nums">
                {formatCurrency(metrics.budget_left)}
              </p>
              <p className="text-xs opacity-75 mt-1">
                of {formatCurrency(metrics.total_budget)} · {metrics.remaining_days} days left
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Metric Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              At a glance
            </h2>
            <MetricCardCustomizer
              metric1={metric1}
              metric2={metric2}
              onChange={(m1, m2) => updatePrefs(m1, m2)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <MetricCard metricKey={metric1} value={metrics[metric1]} index={0} />
              <MetricCard metricKey={metric2} value={metrics[metric2]} index={1} />
            </div>
          )}
        </div>

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

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
