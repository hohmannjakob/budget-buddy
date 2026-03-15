'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { format, parseISO, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import type { Expense } from '@/lib/types'

interface Props {
  expenses: Expense[]
  month: string // YYYY-MM-01
}

export default function SpendingChart({ expenses, month }: Props) {
  const monthStart = parseISO(month)
  const monthEnd = endOfMonth(monthStart)
  const today = new Date()
  const end = today < monthEnd ? today : monthEnd

  const days = eachDayOfInterval({ start: monthStart, end })

  // Cumulative spending per day
  let cumulative = 0
  const data = days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const dayTotal = expenses
      .filter((e) => e.date === dayStr && !e.is_split)
      .reduce((s, e) => s + e.amount, 0)
    cumulative += dayTotal
    return {
      date: format(day, 'MMM d'),
      total: parseFloat(cumulative.toFixed(2)),
    }
  })

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4">
      <h3 className="text-sm font-semibold mb-4">Cumulative spending</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-100 dark:stroke-neutral-800" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `€${v}`}
          />
          <Tooltip
            formatter={(value) => [`€${Number(value).toFixed(2)}`, 'Spent']}
            contentStyle={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
