'use client'

import { formatCurrency } from '@/lib/utils'
import type { Expense, Category } from '@/lib/types'

const EMOJI_MAP: Record<string, string> = {
  utensils: '🍽️', car: '🚗', home: '🏠', tv: '📺',
  'shopping-bag': '🛍️', heart: '❤️', book: '📚',
  'piggy-bank': '🐷', 'more-horizontal': '⚙️', circle: '⚪',
}

interface Props {
  expenses: Expense[]
  categories: Category[]
}

export default function CategorySummary({ expenses, categories }: Props) {
  const spendingMap = new Map<string, number>()
  for (const expense of expenses) {
    if (expense.category_id) {
      spendingMap.set(expense.category_id, (spendingMap.get(expense.category_id) ?? 0) + expense.amount)
    }
  }

  const data = categories
    .filter((c) => spendingMap.has(c.id))
    .map((c) => ({ category: c, spent: spendingMap.get(c.id) ?? 0 }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5)

  if (!data.length) return null

  const maxSpent = data[0].spent

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b949e' }}>
        This month
      </h2>

      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.06)' }}
      >
        {data.map((item, i) => {
          const budget = item.category.monthly_budget
          const barPct = (item.spent / maxSpent) * 100
          const budgetPct = budget ? Math.min((item.spent / budget) * 100, 100) : null

          return (
            <div
              key={item.category.id}
              className="flex items-center gap-4 px-5 py-4"
              style={i < data.length - 1 ? { borderBottom: '1px solid rgba(240,246,252,0.04)' } : undefined}
            >
              {/* Circular icon */}
              <div
                className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-lg"
                style={{ background: (item.category.color ?? '#6366f1') + '22' }}
              >
                {EMOJI_MAP[item.category.icon ?? ''] ?? '💳'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                    {item.category.name}
                  </p>
                  <p className="text-sm font-bold tabular-nums shrink-0 ml-3" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(item.spent)}
                  </p>
                </div>

                {/* Relative bar */}
                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(240,246,252,0.07)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${barPct}%`,
                      background: budgetPct !== null && budgetPct > 90
                        ? '#f85149'
                        : (item.category.color ?? '#6366f1'),
                      opacity: 0.75,
                    }}
                  />
                </div>

                {budget && (
                  <p className="text-[10px] mt-1" style={{ color: '#8b949e' }}>
                    {formatCurrency(Math.max(budget - item.spent, 0))} left of {formatCurrency(budget)}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
