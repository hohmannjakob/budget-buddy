'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { upsertBudget } from '@/actions/budget'
import { formatCurrency } from '@/lib/utils'
import type { Budget } from '@/lib/types'

interface Props {
  budget: Budget | null
}

export default function BudgetSetup({ budget }: Props) {
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(String(budget?.total_amount ?? ''))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await upsertBudget(parseFloat(amount) || 0)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Monthly Budget</h3>
        <button
          onClick={() => setEditing(!editing)}
          className="text-sm text-indigo-500 font-medium"
        >
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">€</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7 dark:bg-neutral-800 dark:border-neutral-700"
              autoFocus
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-full bg-indigo-500 hover:bg-indigo-600"
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      ) : (
        <p className="text-3xl font-bold tabular-nums">
          {budget ? formatCurrency(budget.total_amount) : '—'}
        </p>
      )}
    </div>
  )
}
