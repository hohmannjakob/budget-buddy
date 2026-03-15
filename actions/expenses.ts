'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AddPersonalExpenseInput, AddSplitExpenseInput } from '@/lib/types'

export async function addPersonalExpense(input: AddPersonalExpenseInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('expenses').insert({
    user_id: user.id,
    title: input.title,
    amount: input.amount,
    category_id: input.category_id || null,
    date: input.date,
    is_split: false,
    notes: input.notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/home')
  revalidatePath('/expenses')
  return { success: true }
}

export async function addSplitExpense(input: AddSplitExpenseInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Insert expense
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      title: input.title,
      amount: input.amount,
      category_id: input.category_id || null,
      date: input.date,
      is_split: true,
      group_id: input.group_id,
      paid_by: user.id,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (expenseError) return { error: expenseError.message }

  // Insert split_expense record
  const { data: splitExpense, error: splitError } = await supabase
    .from('split_expenses')
    .insert({
      expense_id: expense.id,
      split_method: input.split_method,
    })
    .select()
    .single()

  if (splitError) return { error: splitError.message }

  // Insert shares
  if (input.shares && input.shares.length > 0) {
    const { error: sharesError } = await supabase.from('split_shares').insert(
      input.shares.map((s) => ({
        split_expense_id: splitExpense.id,
        user_id: s.user_id,
        amount: s.amount,
        is_settled: s.user_id === user.id, // payer's own share is auto-settled
      }))
    )
    if (sharesError) return { error: sharesError.message }
  }

  revalidatePath('/home')
  revalidatePath('/expenses')
  revalidatePath('/groups')
  return { success: true }
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/home')
  revalidatePath('/expenses')
  return { success: true }
}

export async function getMonthExpenses(month: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const startDate = month
  const endDate = new Date(
    parseInt(month.slice(0, 4)),
    parseInt(month.slice(5, 7)),
    0
  )
    .toISOString()
    .slice(0, 10)

  const { data } = await supabase
    .from('expenses')
    .select(`
      *,
      category:categories(*),
      split_expense:split_expenses(
        *,
        shares:split_shares(*)
      )
    `)
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  return data ?? []
}
