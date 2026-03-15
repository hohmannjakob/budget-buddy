'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { Expense, Category } from '@/lib/types'

interface Props {
  expenses: Expense[]
  categories: Category[]
}

export default function CategoryBreakdown({ expenses, categories }: Props) {
  const spendingMap = new Map<string, number>()
  for (const expense of expenses) {
    if (expense.category_id) {
      const prev = spendingMap.get(expense.category_id) ?? 0
      spendingMap.set(expense.category_id, prev + expense.amount)
    }
  }

  const data = categories
    .filter((c) => spendingMap.has(c.id))
    .map((c) => ({
      name: c.name,
      value: spendingMap.get(c.id) ?? 0,
      color: c.color,
    }))
    .sort((a, b) => b.value - a.value)

  if (!data.length) {
    return (
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4">
        <p className="text-sm text-neutral-400 text-center py-8">No spending data yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4">
      <h3 className="text-sm font-semibold mb-4">By category</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value)), '']}
            contentStyle={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2 mt-2">
        {data.slice(0, 5).map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium tabular-nums">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
