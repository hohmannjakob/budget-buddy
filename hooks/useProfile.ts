'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserMetricPrefs } from '@/lib/types'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    load()
  }, [])

  return { profile, loading }
}

const METRIC3_KEY = 'bb_metric_3'

export function useMetricPrefs() {
  const [prefs, setPrefs] = useState<UserMetricPrefs | null>(null)
  const [metric3, setMetric3] = useState<string>('you_owe')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load metric_3 from localStorage
    if (typeof window !== 'undefined') {
      setMetric3(localStorage.getItem(METRIC3_KEY) ?? 'you_owe')
    }

    const supabase = createClient()

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('user_metric_prefs')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setPrefs(data)
      setLoading(false)
    }

    load()
  }, [])

  async function updatePrefs(metric_1: string, metric_2: string, new_metric_3?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_metric_prefs')
      .upsert(
        { user_id: user.id, metric_1, metric_2 },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    setPrefs(data)

    if (new_metric_3 !== undefined) {
      setMetric3(new_metric_3)
      localStorage.setItem(METRIC3_KEY, new_metric_3)
    }
  }

  return { prefs, metric3, loading, updatePrefs }
}
