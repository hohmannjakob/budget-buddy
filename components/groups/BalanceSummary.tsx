'use client'

import { formatCurrency, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Balance {
  userId: string
  name: string
  netAmount: number // positive = owed to you, negative = you owe
}

interface Props {
  balances: Balance[]
  currentUserId: string
}

export default function BalanceSummary({ balances, currentUserId }: Props) {
  const userBalance = balances.find((b) => b.userId === currentUserId)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
        Balances
      </h3>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        {balances.map((balance) => (
          <div
            key={balance.userId}
            className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 dark:border-neutral-800/50 last:border-0"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs bg-neutral-100 dark:bg-neutral-800">
                {getInitials(balance.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="text-sm font-medium">
                {balance.userId === currentUserId ? 'You' : balance.name}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {balance.netAmount > 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : balance.netAmount < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-400" />
              ) : null}
              <span className={`text-sm font-semibold ${
                balance.netAmount > 0
                  ? 'text-emerald-500'
                  : balance.netAmount < 0
                  ? 'text-red-400'
                  : 'text-neutral-400'
              }`}>
                {balance.netAmount === 0 ? 'Settled' : formatCurrency(Math.abs(balance.netAmount))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
