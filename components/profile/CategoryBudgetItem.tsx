'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Check, Pencil } from 'lucide-react'
import { upsertCategoryBudget } from '@/actions/budget'
import { formatCurrency } from '@/lib/utils'
import type { Category } from '@/lib/types'

function getCategoryEmoji(icon?: string): string {
  const map: Record<string, string> = {
    utensils: '🍽️', car: '🚗', home: '🏠', tv: '📺',
    'shopping-bag': '🛍️', heart: '❤️', book: '📚',
    'piggy-bank': '🐷', 'more-horizontal': '⚙️', circle: '⚪',
  }
  return icon ? (map[icon] ?? '💳') : '💳'
}

interface Props {
  category: Category
}

export default function CategoryBudgetItem({ category }: Props) {
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(String(category.monthly_budget ?? ''))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await upsertCategoryBudget(category.id, parseFloat(amount) || null)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800/50 last:border-0">
      <div
        className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: category.color + '20' }}
      >
        <span style={{ color: category.color }}>{getCategoryEmoji(category.icon)}</span>
      </div>

      <span className="flex-1 text-sm font-medium">{category.name}</span>

      {editing ? (
        <div className="flex items-center gap-2">
          <div className="relative w-28">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">€</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-6 h-8 text-sm dark:bg-neutral-800 dark:border-neutral-700"
              autoFocus
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-500 text-white"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">
            {category.monthly_budget ? formatCurrency(category.monthly_budget) : 'No limit'}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Pencil className="h-3.5 w-3.5 text-neutral-400" />
          </button>
        </div>
      )}
    </div>
  )
}
