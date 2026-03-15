'use client'

import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { METRIC_LABELS, METRIC_DESCRIPTIONS, ALL_METRIC_KEYS } from '@/lib/constants'
import type { MetricKey } from '@/lib/types'

interface Props {
  metric1: MetricKey
  metric2: MetricKey
  onChange: (m1: MetricKey, m2: MetricKey) => void
  children?: React.ReactNode
}

export default function MetricCardCustomizer({ metric1, metric2, onChange, children }: Props) {
  const [open, setOpen] = useState(false)
  const [selecting, setSelecting] = useState<1 | 2>(1)

  function handleSelect(key: MetricKey) {
    if (selecting === 1) {
      onChange(key, metric2)
    } else {
      onChange(metric1, key)
    }
    setOpen(false)
  }

  const trigger = children ?? (
    <button
      className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
      style={{ color: '#8b949e' }}
    >
      <Settings2 className="h-3.5 w-3.5" />
      Customize
    </button>
  )

  return (
    <>
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger}
      </span>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl"
          style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.08)', borderBottom: 'none' }}
        >
          <SheetHeader className="mb-4">
            <SheetTitle style={{ color: 'var(--foreground)' }}>Choose metric for card {selecting}</SheetTitle>
          </SheetHeader>

          <div className="flex gap-2 mb-4">
            {([1, 2] as const).map((n) => (
              <button
                key={n}
                onClick={() => setSelecting(n)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: selecting === n ? '#6366f1' : '#21262d',
                  color: selecting === n ? '#fff' : '#8b949e',
                }}
              >
                Card {n}: {METRIC_LABELS[n === 1 ? metric1 : metric2]}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pb-safe">
            {ALL_METRIC_KEYS.map((key) => {
              const isSelected = (selecting === 1 ? metric1 : metric2) === key
              return (
                <button
                  key={key}
                  onClick={() => handleSelect(key)}
                  className="w-full text-left p-3 rounded-xl transition-colors"
                  style={{
                    background: isSelected ? 'rgba(99,102,241,0.15)' : '#21262d',
                    border: `1px solid ${isSelected ? '#6366f1' : 'rgba(240,246,252,0.08)'}`,
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{METRIC_LABELS[key]}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>{METRIC_DESCRIPTIONS[key]}</p>
                </button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
