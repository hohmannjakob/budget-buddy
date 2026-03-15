'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn, formatCurrency, getValueColor } from '@/lib/utils'
import { METRIC_LABELS, METRIC_DESCRIPTIONS } from '@/lib/constants'
import type { MetricKey } from '@/lib/types'

interface MetricCardProps {
  metricKey: MetricKey
  value: number
  index?: number
}

export default function MetricCard({ metricKey, value, index = 0 }: MetricCardProps) {
  const isNegative = value < 0
  const isDebt = metricKey === 'you_owe'

  // Color logic
  let valueClass = 'text-neutral-900 dark:text-neutral-50'
  if (metricKey === 'you_owe' && value > 0) valueClass = 'text-amber-500'
  else if (metricKey === 'owed_to_you' && value > 0) valueClass = 'text-emerald-500'
  else if (metricKey === 'net_balance') valueClass = value >= 0 ? 'text-emerald-500' : 'text-red-500'
  else if (metricKey === 'budget_left' || metricKey === 'real_available') {
    valueClass = value > 0 ? 'text-neutral-900 dark:text-neutral-50' : 'text-red-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 shadow-sm"
    >
      <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">
        {METRIC_LABELS[metricKey]}
      </p>
      <p className={cn('text-2xl font-bold tabular-nums', valueClass)}>
        {formatCurrency(Math.abs(value))}
        {isNegative && <span className="text-base font-normal ml-1">(over)</span>}
      </p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
        {METRIC_DESCRIPTIONS[metricKey]}
      </p>
    </motion.div>
  )
}
