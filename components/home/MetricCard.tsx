'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'
import { METRIC_LABELS, METRIC_DESCRIPTIONS } from '@/lib/constants'
import type { MetricKey } from '@/lib/types'

interface MetricCardProps {
  metricKey: MetricKey
  value: number
  index?: number
}

function getAccentColor(metricKey: MetricKey, value: number): string {
  if (metricKey === 'you_owe' && value > 0) return '#f59e0b'
  if (metricKey === 'owed_to_you' && value > 0) return '#10b981'
  if (metricKey === 'net_balance') return value >= 0 ? '#10b981' : '#f85149'
  if (metricKey === 'budget_left' || metricKey === 'real_available') {
    return value > 0 ? '#6366f1' : '#f85149'
  }
  return '#6366f1'
}

export default function MetricCard({ metricKey, value, index = 0 }: MetricCardProps) {
  const isNegative = value < 0
  const accent = getAccentColor(metricKey, value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-3xl p-4 flex flex-col justify-between"
      style={{
        background: '#161b22',
        border: '1px solid rgba(240,246,252,0.08)',
        minHeight: 104,
      }}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#8b949e' }}>
          {METRIC_LABELS[metricKey]}
        </p>
        <p className="text-2xl font-black tabular-nums leading-none" style={{ color: 'var(--foreground)' }}>
          {isNegative && <span className="text-base mr-0.5">-</span>}
          {formatCurrency(Math.abs(value))}
        </p>
        <p className="text-[10px] mt-1.5" style={{ color: '#8b949e' }}>
          {METRIC_DESCRIPTIONS[metricKey]}
        </p>
      </div>

      {/* Accent bar at bottom */}
      <div className="mt-3 h-0.5 rounded-full" style={{ background: accent, opacity: 0.6 }} />
    </motion.div>
  )
}
