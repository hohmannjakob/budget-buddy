'use client'

import { formatCurrency } from '@/lib/utils'
import { settleShare } from '@/actions/settlements'
import { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'

interface DebtShare {
  id: string
  amount: number
  split_expense?: {
    expense?: {
      title: string
      payer?: { name: string; avatar_url?: string }
      paid_by?: string
    }
  }
  profile?: { name: string; avatar_url?: string }
}

interface Props {
  youOwe: DebtShare[]
  owedToYou: DebtShare[]
}

export default function DebtSummary({ youOwe, owedToYou }: Props) {
  const [settling, setSettling] = useState<string | null>(null)

  const totalOwe = youOwe.reduce((s, d) => s + d.amount, 0)
  const totalOwed = owedToYou.reduce((s, d) => s + d.amount, 0)

  if (!youOwe.length && !owedToYou.length) return null

  async function handleSettle(shareId: string) {
    setSettling(shareId)
    await settleShare(shareId)
    setSettling(null)
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
        Debts
      </h2>

      {youOwe.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">You owe</span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalOwe)}</span>
          </div>
          {youOwe.map((debt) => (
            <DebtRow
              key={debt.id}
              title={debt.split_expense?.expense?.title ?? 'Expense'}
              personName={debt.split_expense?.expense?.payer?.name ?? 'Someone'}
              amount={debt.amount}
              isSettling={settling === debt.id}
              onSettle={() => handleSettle(debt.id)}
              direction="owe"
            />
          ))}
        </div>
      )}

      {owedToYou.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Owed to you</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalOwed)}</span>
          </div>
          {owedToYou.map((debt) => (
            <DebtRow
              key={debt.id}
              title={debt.split_expense?.expense?.title ?? 'Expense'}
              personName={debt.profile?.name ?? 'Someone'}
              amount={debt.amount}
              isSettling={settling === debt.id}
              onSettle={() => handleSettle(debt.id)}
              direction="owed"
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DebtRow({
  title,
  personName,
  amount,
  isSettling,
  onSettle,
  direction,
}: {
  title: string
  personName: string
  amount: number
  isSettling: boolean
  onSettle: () => void
  direction: 'owe' | 'owed'
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800/50 last:border-0">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs bg-neutral-100 dark:bg-neutral-800">
          {getInitials(personName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-neutral-400">
          {direction === 'owe' ? `To ${personName}` : `From ${personName}`}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold">{formatCurrency(amount)}</span>
        <button
          onClick={onSettle}
          disabled={isSettling}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
        >
          <Check className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
        </button>
      </div>
    </div>
  )
}
