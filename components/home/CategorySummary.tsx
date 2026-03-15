'use client'

import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import type { Expense, Category } from '@/lib/types'

interface CategoryData {
  category: Category
  spent: number
}

interface Props {
  expenses: Expense[]
  categories: Category[]
}

export default function CategorySummary({ expenses, categories }: Props) {
  // Aggregate spending by category
  const spendingMap = new Map<string, number>()
  for (const expense of expenses) {
    if (expense.category_id) {
      const prev = spendingMap.get(expense.category_id) ?? 0
      spendingMap.set(expense.category_id, prev + expense.amount)
    }
  }

  const categoryData: CategoryData[] = categories
    .filter((c) => spendingMap.has(c.id))
    .map((c) => ({ category: c, spent: spendingMap.get(c.id) ?? 0 }))
    .sort((a, b) => b.spent - a.spent)

  if (!categoryData.length) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
        This month
      </h2>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        {categoryData.slice(0, 5).map((item, i) => {
          const budget = item.category.monthly_budget
          const pct = budget ? Math.min((item.spent / budget) * 100, 100) : null

          return (
            <div
              key={item.category.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800/50 last:border-0"
            >
              <div
                className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-base"
                style={{ backgroundColor: item.category.color + '20' }}
              >
                <span style={{ color: item.category.color }}>
                  {getCategoryEmoji(item.category.icon)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate">{item.category.name}</p>
                  <p className="text-sm font-semibold shrink-0 ml-2">{formatCurrency(item.spent)}</p>
                </div>
                {pct !== null && (
                  <div className="flex items-center gap-2">
                    <Progress
                      value={pct}
                      className="h-1.5 flex-1"
                    />
                    <span className="text-xs text-neutral-400 shrink-0">
                      {formatCurrency(budget! - item.spent)} left
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getCategoryEmoji(icon: string): string {
  const map: Record<string, string> = {
    utensils: '🍽️',
    car: '🚗',
    home: '🏠',
    tv: '📺',
    'shopping-bag': '🛍️',
    heart: '❤️',
    book: '📚',
    'piggy-bank': '🐷',
    'more-horizontal': '⚙️',
    circle: '⚪',
  }
  return map[icon] ?? '💳'
}
