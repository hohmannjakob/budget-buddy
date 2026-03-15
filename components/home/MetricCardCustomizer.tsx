'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { METRIC_LABELS, METRIC_DESCRIPTIONS, ALL_METRIC_KEYS } from '@/lib/constants'
import type { MetricKey } from '@/lib/types'

interface Props {
  metric1: MetricKey
  metric2: MetricKey
  metric3: MetricKey
  onChange: (m1: MetricKey, m2: MetricKey, m3: MetricKey) => void
  children: React.ReactNode
}

export default function MetricCardCustomizer({ metric1, metric2, metric3, onChange, children }: Props) {
  const [open, setOpen] = useState(false)
  const [selecting, setSelecting] = useState<1 | 2 | 3>(1)

  function handleSelect(key: MetricKey) {
    const m = [metric1, metric2, metric3] as [MetricKey, MetricKey, MetricKey]
    m[selecting - 1] = key
    onChange(m[0], m[1], m[2])
    setOpen(false)
  }

  const currentForSlot = selecting === 1 ? metric1 : selecting === 2 ? metric2 : metric3
  const slotLabels = ['Card 1', 'Card 2', 'Small card']

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </span>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl"
          style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.08)', borderBottom: 'none' }}
        >
          <SheetHeader className="mb-4">
            <SheetTitle style={{ color: 'var(--foreground)' }}>Customise metrics</SheetTitle>
          </SheetHeader>

          {/* Slot selector */}
          <div className="flex gap-2 mb-4">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                onClick={() => setSelecting(n)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                style={{
                  background: selecting === n ? '#6366f1' : '#21262d',
                  color: selecting === n ? '#fff' : '#8b949e',
                }}
              >
                {slotLabels[n - 1]}
              </button>
            ))}
          </div>

          {/* Metric list */}
          <div className="space-y-2 max-h-64 overflow-y-auto pb-safe scroll-area">
            {ALL_METRIC_KEYS.map((key) => {
              const isSelected = currentForSlot === key
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className="w-full text-left p-3 rounded-2xl transition-colors"
                  style={{
                    background: isSelected ? 'rgba(99,102,241,0.15)' : '#21262d',
                    border: `1px solid ${isSelected ? '#6366f1' : 'rgba(240,246,252,0.06)'}`,
                  }}
                >
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    {METRIC_LABELS[key]}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
                    {METRIC_DESCRIPTIONS[key]}
                  </p>
                </button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
