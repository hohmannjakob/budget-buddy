'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { Expense, Category } from '@/lib/types'

interface Props {
  expenses: Expense[]
  categories: Category[]
}

export default function BudgetVsActual({ expenses, categories }: Props) {
  const spendingMap = new Map<string, number>()
  for (const expense of expenses) {
    if (expense.category_id) {
      const prev = spendingMap.get(expense.category_id) ?? 0
      spendingMap.set(expense.category_id, prev + expense.amount)
    }
  }

  const data = categories
    .filter((c) => c.monthly_budget && c.monthly_budget > 0)
    .map((c) => ({
      name: c.name.split(' ')[0], // shorten
      budget: c.monthly_budget!,
      actual: spendingMap.get(c.id) ?? 0,
      over: (spendingMap.get(c.id) ?? 0) > c.monthly_budget!,
      color: c.color,
    }))

  if (!data.length) {
    return (
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4">
        <p className="text-sm text-neutral-400 text-center py-8">
          Set category budgets in Profile to see this chart
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4">
      <h3 className="text-sm font-semibold mb-1">Budget vs. Actual</h3>
      <p className="text-xs text-neutral-400 mb-4">Gray = budget, colored = actual</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              String(name) === 'budget' ? 'Budget' : 'Actual',
            ]}
            contentStyle={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              fontSize: 12,
            }}
          />
          <Bar dataKey="budget" fill="#e5e7eb" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="actual" radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.over ? '#ef4444' : entry.color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
