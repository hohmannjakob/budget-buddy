'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import BalanceSummary from '@/components/groups/BalanceSummary'
import ExpenseList from '@/components/expenses/ExpenseList'
import { createClient } from '@/lib/supabase/client'
import type { Group, Expense } from '@/lib/types'

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setCurrentUserId(user.id)

      const [{ data: grp }, { data: exps }] = await Promise.all([
        supabase
          .from('groups')
          .select('*, members:group_members(*, profile:profiles(*))')
          .eq('id', id)
          .single(),
        supabase
          .from('expenses')
          .select('*, category:categories(*), split_expense:split_expenses(*, shares:split_shares(*))')
          .eq('group_id', id)
          .order('date', { ascending: false }),
      ])

      setGroup(grp)
      setExpenses(exps ?? [])
      setLoading(false)
    }

    load()
  }, [id])

  // Calculate balances
  const balances = group?.members?.map((member) => {
    // Amount paid by this member for group expenses
    const paid = expenses
      .filter((e) => e.paid_by === member.user_id)
      .reduce((s, e) => s + e.amount, 0)

    // Amount owed by this member
    const owed = expenses
      .flatMap((e) => e.split_expense?.shares ?? [])
      .filter((s) => s.user_id === member.user_id && !s.is_settled)
      .reduce((s, share) => s + share.amount, 0)

    return {
      userId: member.user_id,
      name: member.profile?.name ?? 'Unknown',
      netAmount: paid - owed,
    }
  }) ?? []

  if (loading) {
    return (
      <div className="p-4 space-y-4 pt-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-neutral-400">Group not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-4 pt-12 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-neutral-400 mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Groups
        </button>
        <h1 className="text-xl font-bold">{group.name}</h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          {group.members?.length} members
        </p>
      </div>

      <div className="px-4 py-5 space-y-6">
        <BalanceSummary balances={balances} currentUserId={currentUserId} />

        <div>
          <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
            Expenses
          </h3>
          <ExpenseList expenses={expenses} />
        </div>
      </div>
    </div>
  )
}
