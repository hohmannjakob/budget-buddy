'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function settleShare(shareId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('split_shares')
    .update({ is_settled: true, settled_at: new Date().toISOString() })
    .eq('id', shareId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/home')
  revalidatePath('/groups')
  return { success: true }
}

export async function recordSettlement(params: {
  toUserId: string
  amount: number
  groupId?: string
  note?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('settlements').insert({
    from_user_id: user.id,
    to_user_id: params.toUserId,
    amount: params.amount,
    group_id: params.groupId ?? null,
    note: params.note ?? null,
  })

  if (error) return { error: error.message }

  revalidatePath('/home')
  revalidatePath('/groups')
  return { success: true }
}

export async function getUserDebts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { youOwe: [], owedToYou: [] }

  // Shares you owe (others paid, you haven't settled)
  const { data: youOweShares } = await supabase
    .from('split_shares')
    .select(`
      *,
      split_expense:split_expenses(
        *,
        expense:expenses(*, category:categories(*), payer:profiles!paid_by(*))
      )
    `)
    .eq('user_id', user.id)
    .eq('is_settled', false)
    .neq('split_expense.expense.paid_by', user.id)

  // Shares others owe you (you paid, others haven't settled)
  const { data: owedToYouShares } = await supabase
    .from('split_shares')
    .select(`
      *,
      profile:profiles(*),
      split_expense:split_expenses(
        *,
        expense:expenses(*)
      )
    `)
    .eq('is_settled', false)
    .neq('user_id', user.id)
    .eq('split_expense.expense.paid_by', user.id)

  return {
    youOwe: youOweShares ?? [],
    owedToYou: owedToYouShares ?? [],
  }
}
