'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentMonth } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function upsertBudget(amount: number, month?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const targetMonth = month ?? getCurrentMonth()

  const { error } = await supabase
    .from('budgets')
    .upsert(
      { user_id: user.id, month: targetMonth, total_amount: amount },
      { onConflict: 'user_id,month' }
    )

  if (error) return { error: error.message }

  revalidatePath('/home')
  revalidatePath('/profile')
  return { success: true }
}

export async function getCurrentBudget() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', getCurrentMonth())
    .single()

  return data
}

export async function upsertCategoryBudget(categoryId: string, monthlyBudget: number | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('categories')
    .update({ monthly_budget: monthlyBudget })
    .eq('id', categoryId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}

export async function completeOnboarding(data: {
  monthly_budget: number
  category_budgets: { category_id: string; monthly_budget: number }[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Set monthly budget
  await supabase
    .from('budgets')
    .upsert(
      { user_id: user.id, month: getCurrentMonth(), total_amount: data.monthly_budget },
      { onConflict: 'user_id,month' }
    )

  // Update category budgets (user's own categories)
  for (const cb of data.category_budgets) {
    if (cb.monthly_budget > 0) {
      await supabase
        .from('categories')
        .update({ monthly_budget: cb.monthly_budget })
        .eq('id', cb.category_id)
        .eq('user_id', user.id)
    }
  }

  // Mark onboarding done
  await supabase
    .from('profiles')
    .update({ onboarding_done: true })
    .eq('id', user.id)

  revalidatePath('/')
  return { success: true }
}
