'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMonth, getYesterday } from '@/lib/utils'
import type { Expense, SplitShare } from '@/lib/types'

export function useExpenses(month?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const targetMonth = month ?? getCurrentMonth()
    const startDate = targetMonth
    const year = parseInt(targetMonth.slice(0, 4))
    const mon = parseInt(targetMonth.slice(5, 7))
    const endDate = new Date(year, mon, 0).toISOString().slice(0, 10)

    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

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

      setExpenses(data ?? [])
      setLoading(false)
    }

    load()
  }, [month])

  return { expenses, loading }
}

export function useYesterdayExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [userShares, setUserShares] = useState<SplitShare[]>([])

  useEffect(() => {
    const yesterday = getYesterday()
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: personalExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', yesterday)
        .eq('is_split', false)

      const { data: shares } = await supabase
        .from('split_shares')
        .select(`
          *,
          split_expense:split_expenses(
            *,
            expense:expenses(*)
          )
        `)
        .eq('user_id', user.id)
        .eq('split_expense.expense.date', yesterday)

      setExpenses(personalExpenses ?? [])
      setUserShares(shares ?? [])
    }

    load()
  }, [])

  return { expenses, userShares }
}
