'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Delete, CalendarDays, StickyNote, Users } from 'lucide-react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addPersonalExpense, addSplitExpense } from '@/actions/expenses'
import { calculateEqualSplit } from '@/lib/calculations'
import { getToday } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Category, Group } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
}

const CATEGORY_EMOJIS: Record<string, string> = {
  utensils: '🍽️', car: '🚗', home: '🏠', tv: '📺',
  'shopping-bag': '🛍️', heart: '❤️', book: '📚',
  'piggy-bank': '🐷', 'more-horizontal': '⚙️', circle: '💳',
}

function getCategoryEmoji(icon?: string): string {
  return icon ? (CATEGORY_EMOJIS[icon] ?? '💳') : '💳'
}

// ─── Numpad ──────────────────────────────────────────────────────────────────
function Numpad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  function press(key: string) {
    if (key === '⌫') {
      onChange(value.slice(0, -1))
      return
    }
    if (key === '.') {
      if (value.includes('.')) return
      onChange(value === '' ? '0.' : value + '.')
      return
    }
    // Limit to 2 decimal places
    const dotIdx = value.indexOf('.')
    if (dotIdx !== -1 && value.length - dotIdx > 2) return
    // Prevent leading zeros unless followed by decimal
    if (value === '0' && key !== '.') {
      onChange(key)
      return
    }
    onChange(value + key)
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫']

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onPointerDown={(e) => { e.preventDefault(); press(key) }}
          className="relative flex h-14 items-center justify-center rounded-2xl text-xl font-semibold transition-all active:scale-95 select-none"
          style={{
            background: key === '⌫' ? 'rgba(248,81,73,0.12)' : '#21262d',
            color: key === '⌫' ? '#f85149' : 'var(--foreground)',
          }}
        >
          {key === '⌫' ? <Delete className="h-5 w-5" /> : key}
        </button>
      ))}
    </div>
  )
}

// ─── Category picker step ─────────────────────────────────────────────────────
function CategoryPicker({
  categories,
  onSelect,
  onClose,
}: {
  categories: Category[]
  onSelect: (cat: Category) => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h2 className="text-2xl font-extrabold" style={{ color: 'var(--foreground)' }}>
          Choose category
        </h2>
        <button
          onClick={onClose}
          className="h-10 w-10 flex items-center justify-center rounded-full"
          style={{ background: '#21262d' }}
        >
          <X className="h-5 w-5" style={{ color: '#8b949e' }} />
        </button>
      </div>

      {/* Category grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat)}
              className="flex flex-col items-center gap-2.5 p-4 rounded-3xl transition-all active:scale-95"
              style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.06)' }}
            >
              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: (cat.color ?? '#6366f1') + '22' }}
              >
                {getCategoryEmoji(cat.icon)}
              </div>
              <span className="text-xs font-semibold text-center leading-tight" style={{ color: 'var(--foreground)' }}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Amount entry step ────────────────────────────────────────────────────────
function AmountEntry({
  selectedCategory,
  onBack,
  onSave,
  isSaving,
  groups,
}: {
  selectedCategory: Category
  onBack: () => void
  onSave: (data: {
    amount: number
    title: string
    date: string
    isSplit: boolean
    groupId: string
  }) => Promise<void>
  isSaving: boolean
  groups: Group[]
}) {
  const [amountStr, setAmountStr] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(getToday())
  const [isSplit, setIsSplit] = useState(false)
  const [groupId, setGroupId] = useState('')

  const displayAmount = amountStr === '' ? '0' : amountStr
  const [intPart, decPart] = (displayAmount.includes('.')
    ? displayAmount
    : displayAmount + '.'
  ).split('.')

  const canSave = parseFloat(amountStr) > 0 && title.trim().length > 0 && (!isSplit || groupId)

  async function handleSave() {
    if (!canSave || isSaving) return
    await onSave({
      amount: parseFloat(amountStr),
      title: title.trim(),
      date,
      isSplit,
      groupId,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <button
          onClick={onBack}
          className="h-11 w-11 flex items-center justify-center rounded-full"
          style={{ background: '#21262d' }}
        >
          <X className="h-5 w-5" style={{ color: '#8b949e' }} />
        </button>

        <button
          onClick={handleSave}
          disabled={!canSave || isSaving}
          className="h-11 w-11 flex items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-40"
          style={{ background: canSave ? '#6366f1' : '#21262d' }}
        >
          <Check className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Amount display */}
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Category bubble */}
        <div
          className="h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl cursor-pointer active:scale-95 transition-all"
          style={{ background: (selectedCategory.color ?? '#6366f1') + '25' }}
          onClick={onBack}
        >
          {getCategoryEmoji(selectedCategory.icon)}
        </div>

        {/* Big number */}
        <div className="flex-1 flex items-baseline gap-1">
          <span
            className="text-5xl font-black tabular-nums leading-none"
            style={{ color: amountStr ? 'var(--foreground)' : '#8b949e' }}
          >
            {intPart}
          </span>
          <span className="text-2xl font-bold tabular-nums" style={{ color: '#8b949e' }}>
            .{decPart ?? '00'}
          </span>
        </div>

        {/* Currency badge */}
        <div
          className="shrink-0 px-3 py-1.5 rounded-xl font-bold text-sm"
          style={{ background: '#6366f1', color: '#fff' }}
        >
          EUR
        </div>
      </div>

      {/* Fields */}
      <div className="px-5 pb-2 space-y-1">
        {/* Title / Notes */}
        <div
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
          style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.06)' }}
        >
          <StickyNote className="h-4.5 w-4.5 shrink-0" style={{ color: '#6366f1' }} />
          <input
            type="text"
            placeholder="What for? (e.g. Coffee)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:font-normal"
            style={{ color: 'var(--foreground)' }}
          />
        </div>

        {/* Date */}
        <div
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl"
          style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.06)' }}
        >
          <CalendarDays className="h-4.5 w-4.5 shrink-0" style={{ color: '#6366f1' }} />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-medium"
            style={{ color: 'var(--foreground)' }}
          />
        </div>

        {/* Split toggle */}
        <button
          type="button"
          onClick={() => setIsSplit((v) => !v)}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors"
          style={{
            background: isSplit ? 'rgba(99,102,241,0.12)' : '#161b22',
            border: `1px solid ${isSplit ? '#6366f1' : 'rgba(240,246,252,0.06)'}`,
          }}
        >
          <Users className="h-4.5 w-4.5 shrink-0" style={{ color: isSplit ? '#818cf8' : '#6366f1' }} />
          <span className="text-sm font-medium" style={{ color: isSplit ? '#818cf8' : 'var(--foreground)' }}>
            Split with group
          </span>
          {isSplit && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#6366f1', color: '#fff' }}>
              on
            </span>
          )}
        </button>

        {/* Group picker (shown when split is on) */}
        <AnimatePresence>
          {isSplit && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Select onValueChange={(v) => setGroupId(v as string)} value={groupId}>
                <SelectTrigger
                  className="rounded-2xl px-4 h-12 text-sm font-medium"
                  style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.06)', color: 'var(--foreground)' }}
                >
                  <SelectValue placeholder="Choose group…" />
                </SelectTrigger>
                <SelectContent style={{ background: '#1c2128', border: '1px solid rgba(240,246,252,0.08)' }}>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id} style={{ color: 'var(--foreground)' }}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Numpad */}
      <div className="mt-auto">
        <Numpad value={amountStr} onChange={setAmountStr} />
      </div>
    </div>
  )
}

// ─── Main sheet ───────────────────────────────────────────────────────────────
export default function AddExpenseSheet({ open, onClose }: Props) {
  const [step, setStep] = useState<'category' | 'amount'>('category')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [{ data: cats }, { data: memberRows }] = await Promise.all([
        supabase.from('categories').select('*').or(`user_id.eq.${user.id},user_id.is.null`).order('sort_order'),
        supabase.from('group_members').select('group_id').eq('user_id', user.id),
      ])
      setCategories(cats ?? [])
      if (memberRows?.length) {
        const groupIds = memberRows.map((m) => m.group_id)
        const { data: grps } = await supabase
          .from('groups')
          .select('*, members:group_members(*, profile:profiles(*))')
          .in('id', groupIds)
        setGroups(grps ?? [])
      }
    })
  }, [])

  function handleClose() {
    setStep('category')
    setSelectedCategory(null)
    onClose()
  }

  function handleCategorySelect(cat: Category) {
    setSelectedCategory(cat)
    setStep('amount')
  }

  async function handleSave({
    amount,
    title,
    date,
    isSplit,
    groupId,
  }: {
    amount: number
    title: string
    date: string
    isSplit: boolean
    groupId: string
  }) {
    if (!selectedCategory) return
    setIsSaving(true)
    try {
      if (isSplit && groupId) {
        const group = groups.find((g) => g.id === groupId)
        const memberCount = group?.members?.length ?? 2
        const perPerson = calculateEqualSplit(amount, memberCount)
        const shares = (group?.members ?? []).map((m: { user_id: string }) => ({
          user_id: m.user_id,
          amount: perPerson,
        }))
        await addSplitExpense({
          title,
          amount,
          category_id: selectedCategory.id,
          date,
          group_id: groupId,
          split_method: 'equal',
          shares,
        })
      } else {
        await addPersonalExpense({
          title,
          amount,
          category_id: selectedCategory.id,
          date,
        })
      }
      handleClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent
        side="bottom"
        className="p-0 overflow-hidden"
        style={{
          background: '#0d1117',
          border: '1px solid rgba(240,246,252,0.08)',
          borderBottom: 'none',
          borderRadius: '28px 28px 0 0',
          height: step === 'category' ? '85vh' : '95vh',
        }}
      >
        <AnimatePresence mode="wait">
          {step === 'category' ? (
            <motion.div
              key="category"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              <CategoryPicker
                categories={categories}
                onSelect={handleCategorySelect}
                onClose={handleClose}
              />
            </motion.div>
          ) : (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {selectedCategory && (
                <AmountEntry
                  selectedCategory={selectedCategory}
                  onBack={() => setStep('category')}
                  onSave={handleSave}
                  isSaving={isSaving}
                  groups={groups}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}
