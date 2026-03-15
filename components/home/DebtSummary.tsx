'use client'

import { formatCurrency } from '@/lib/utils'
import { settleShare } from '@/actions/settlements'
import { useState } from 'react'
import { Check } from 'lucide-react'
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
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8b949e' }}>
        Balances
      </h2>

      {youOwe.length > 0 && (
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.06)' }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(240,246,252,0.06)' }}>
            <span className="text-sm font-semibold" style={{ color: '#f59e0b' }}>You owe</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: '#f59e0b' }}>{formatCurrency(totalOwe)}</span>
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
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.06)' }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(240,246,252,0.06)' }}>
            <span className="text-sm font-semibold" style={{ color: '#10b981' }}>Owed to you</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: '#10b981' }}>{formatCurrency(totalOwed)}</span>
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
    <div
      className="flex items-center gap-3 px-5 py-3.5"
      style={{ borderBottom: '1px solid rgba(240,246,252,0.04)' }}
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback
          className="text-xs font-bold"
          style={{ background: '#21262d', color: '#8b949e' }}
        >
          {getInitials(personName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
          {direction === 'owe' ? `To ${personName}` : `From ${personName}`}
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
          {formatCurrency(amount)}
        </span>
        <button
          onClick={onSettle}
          disabled={isSettling}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-40"
          style={{ background: '#21262d' }}
        >
          <Check className="h-3.5 w-3.5" style={{ color: '#10b981' }} />
        </button>
      </div>
    </div>
  )
}
