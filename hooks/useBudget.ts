'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentMonth } from '@/lib/utils'
import type { Budget } from '@/lib/types'

export function useBudget(month?: string) {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const targetMonth = month ?? getCurrentMonth()
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', targetMonth)
        .single()

      setBudget(data)
      setLoading(false)
    }

    load()
  }, [month])

  return { budget, loading }
}
