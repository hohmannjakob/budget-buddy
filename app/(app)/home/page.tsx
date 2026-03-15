'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Settings2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import MetricCard from '@/components/home/MetricCard'
import MetricCardCustomizer from '@/components/home/MetricCardCustomizer'
import { useMetricPrefs } from '@/hooks/useProfile'
import { useBudget } from '@/hooks/useBudget'
import { useExpenses } from '@/hooks/useExpenses'
import { useGroupDebts } from '@/hooks/useGroups'
import { calculateBudgetMetrics } from '@/lib/calculations'
import { getYesterday, formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { METRIC_LABELS } from '@/lib/constants'
import type { MetricKey, SplitShare } from '@/lib/types'
import ExpenseItem from '@/components/expenses/ExpenseItem'

// ── Small metric card (3rd slot) ─────────────────────────────────────────────
function SmallMetricCard({ metricKey, value }: { metricKey: MetricKey; value: number }) {
  const isNeg = value < 0
  let color = '#8b949e'
  if (metricKey === 'you_owe' && value > 0) color = '#f59e0b'
  else if (metricKey === 'owed_to_you' && value > 0) color = '#10b981'
  else if (metricKey === 'net_balance') color = value >= 0 ? '#10b981' : '#f85149'
  else if (['budget_left', 'real_available'].includes(metricKey)) color = value > 0 ? '#6366f1' : '#f85149'

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-2xl"
      style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.06)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#8b949e' }}>
        {METRIC_LABELS[metricKey]}
      </p>
      <p className="text-base font-black tabular-nums" style={{ color }}>
        {isNeg && <span className="text-sm font-normal mr-0.5">-</span>}
        {formatCurrency(Math.abs(value))}
      </p>
    </div>
  )
}

function formatDayLabel(dateStr: string): string {
  const d = parseISO(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return format(d, 'EEE, MMM d')
}

// ── Home page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { prefs, metric3, updatePrefs } = useMetricPrefs()
  const { budget } = useBudget()
  const { expenses, loading: expLoading } = useExpenses()
  const { owedToYou } = useGroupDebts()

  const [userSplitShares, setUserSplitShares] = useState<SplitShare[]>([])

  const metric1: MetricKey = (prefs?.metric_1 as MetricKey) ?? 'budget_left'
  const metric2: MetricKey = (prefs?.metric_2 as MetricKey) ?? 'daily_avg_left'
  const metric3Key: MetricKey = (metric3 as MetricKey) ?? 'you_owe'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: shares } = await supabase
        .from('split_shares')
        .select('*')
        .eq('user_id', user.id)
      setUserSplitShares(shares ?? [])
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

  const monthLabel = format(new Date(), 'MMMM yyyy')

  // Group expenses by date
  const grouped = new Map<string, typeof expenses>()
  for (const e of expenses) {
    if (!grouped.has(e.date)) grouped.set(e.date, [])
    grouped.get(e.date)!.push(e)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--background)' }}>

      {/* ── Fixed metrics header ──────────────────────────────── */}
      <div
        className="shrink-0 px-5 pt-14 pb-4 space-y-3"
        style={{ borderBottom: '1px solid rgba(240,246,252,0.06)' }}
      >
        {/* Month + customise */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            {monthLabel}
          </h1>
          <MetricCardCustomizer
            metric1={metric1}
            metric2={metric2}
            metric3={metric3Key}
            onChange={(m1, m2, m3) => updatePrefs(m1, m2, m3)}
          >
            <button
              className="h-8 w-8 flex items-center justify-center rounded-full transition-colors"
              style={{ background: '#21262d' }}
            >
              <Settings2 className="h-4 w-4" style={{ color: '#8b949e' }} />
            </button>
          </MetricCardCustomizer>
        </div>

        {/* 2 main metric cards */}
        {expLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-24 rounded-3xl" style={{ background: '#21262d' }} />
            <Skeleton className="h-24 rounded-3xl" style={{ background: '#21262d' }} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <MetricCard metricKey={metric1} value={metrics[metric1]} index={0} />
            <MetricCard metricKey={metric2} value={metrics[metric2]} index={1} />
          </div>
        )}

        {/* 3rd smaller metric card */}
        {expLoading ? (
          <Skeleton className="h-14 rounded-2xl" style={{ background: '#21262d' }} />
        ) : (
          <SmallMetricCard metricKey={metric3Key} value={metrics[metric3Key]} />
        )}
      </div>

      {/* ── Scrollable expense feed ───────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto scroll-area"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}
      >
        {expLoading ? (
          <div className="px-5 pt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" style={{ background: '#21262d' }} />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-5">
            <p className="text-4xl mb-3">🧾</p>
            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No expenses yet</p>
            <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Tap + to add your first expense</p>
          </div>
        ) : (
          <div className="pt-2">
            {Array.from(grouped.entries()).map(([date, dayExpenses]) => (
              <div key={date}>
                {/* Day separator */}
                <div
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderTop: '1px solid rgba(240,246,252,0.05)' }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b949e' }}>
                    {formatDayLabel(date)}
                  </p>
                  <div className="flex-1 h-px" style={{ background: 'rgba(240,246,252,0.05)' }} />
                  <p className="text-xs font-semibold tabular-nums" style={{ color: '#8b949e' }}>
                    −€{dayExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}
                  </p>
                </div>

                {dayExpenses.map((expense, i) => (
                  <ExpenseItem key={expense.id} expense={expense} index={i} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
