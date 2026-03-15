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
}

export default function MetricCardCustomizer({ metric1, metric2, onChange }: Props) {
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Customize
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl dark:bg-neutral-900 dark:border-neutral-800">
          <SheetHeader className="mb-4">
            <SheetTitle>Choose metric for card {selecting}</SheetTitle>
          </SheetHeader>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelecting(1)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selecting === 1
                  ? 'border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              Card 1: {METRIC_LABELS[metric1]}
            </button>
            <button
              onClick={() => setSelecting(2)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selecting === 2
                  ? 'border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              Card 2: {METRIC_LABELS[metric2]}
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pb-safe">
            {ALL_METRIC_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  (selecting === 1 ? metric1 : metric2) === key
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                }`}
              >
                <p className="text-sm font-medium">{METRIC_LABELS[key]}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{METRIC_DESCRIPTIONS[key]}</p>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
