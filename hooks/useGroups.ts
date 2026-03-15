'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Group, SplitShare } from '@/lib/types'

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id)

      if (!memberRows?.length) { setLoading(false); return }

      const groupIds = memberRows.map((m) => m.group_id)

      const { data } = await supabase
        .from('groups')
        .select(`
          *,
          members:group_members(
            *,
            profile:profiles(*)
          )
        `)
        .in('id', groupIds)
        .order('created_at', { ascending: false })

      setGroups(data ?? [])
      setLoading(false)
    }

    load()
  }, [])

  return { groups, loading }
}

export function useGroupDebts() {
  const [youOwe, setYouOwe] = useState<SplitShare[]>([])
  const [owedToYou, setOwedToYou] = useState<SplitShare[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Shares I owe (I'm the user_id but didn't pay)
      const { data: oweShares } = await supabase
        .from('split_shares')
        .select(`
          *,
          split_expense:split_expenses(
            expense_id,
            expense:expenses(title, amount, paid_by, payer:profiles!paid_by(id, name, avatar_url))
          )
        `)
        .eq('user_id', user.id)
        .eq('is_settled', false)

      // Shares others owe me (I paid, others haven't settled)
      const { data: owedShares } = await supabase
        .from('split_shares')
        .select(`
          *,
          profile:profiles(id, name, avatar_url),
          split_expense:split_expenses(
            expense_id,
            expense:expenses(title, amount, paid_by)
          )
        `)
        .eq('is_settled', false)
        .neq('user_id', user.id)

      // Filter owedShares to only expenses where I paid
      const filteredOwed = (owedShares ?? []).filter(
        (s: any) => s.split_expense?.expense?.paid_by === user.id
      )

      setYouOwe(oweShares ?? [])
      setOwedToYou(filteredOwed)
      setLoading(false)
    }

    load()
  }, [])

  return { youOwe, owedToYou, loading }
}
