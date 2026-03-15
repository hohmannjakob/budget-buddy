'use client'

import { useEffect, useState } from 'react'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import BudgetSetup from '@/components/profile/BudgetSetup'
import CategoryBudgetItem from '@/components/profile/CategoryBudgetItem'
import { useProfile } from '@/hooks/useProfile'
import { useBudget } from '@/hooks/useBudget'
import { logout } from '@/actions/auth'
import { getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

export default function ProfilePage() {
  const { profile, loading: profileLoading } = useProfile()
  const { budget } = useBudget()
  const [categories, setCategories] = useState<Category[]>([])
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)

    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order')
      setCategories(data ?? [])
    })
  }, [])

  function toggleDarkMode(checked: boolean) {
    setDarkMode(checked)
    if (checked) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (profileLoading) {
    return (
      <div className="p-4 pt-12 space-y-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--background)' }}>
      <div className="shrink-0 px-5 pt-14 pb-5" style={{ borderBottom: '1px solid rgba(240,246,252,0.06)' }}>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Profile</h1>
      </div>

      <div
        className="flex-1 overflow-y-auto scroll-area px-5 space-y-4"
        style={{ paddingTop: 16, paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}
      >
        {/* User info */}
        <div
          className="rounded-3xl p-4 flex items-center gap-3"
          style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.08)' }}
        >
          <Avatar className="h-14 w-14">
            <AvatarFallback
              className="text-lg font-bold"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
            >
              {getInitials(profile?.name ?? 'U')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>{profile?.name ?? 'User'}</p>
            <p className="text-sm" style={{ color: '#8b949e' }}>BudgetBuddy member</p>
          </div>
        </div>

        {/* Monthly budget */}
        <BudgetSetup budget={budget} />

        {/* Category budgets */}
        {categories.length > 0 && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.08)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(240,246,252,0.06)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Category Limits</h3>
            </div>
            {categories.map((cat) => (
              <CategoryBudgetItem key={cat.id} category={cat} />
            ))}
          </div>
        )}

        {/* Settings */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.08)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(240,246,252,0.06)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>Settings</h3>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" style={{ color: '#8b949e' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Dark mode</span>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 rounded-3xl py-4 font-medium transition-colors"
          style={{
            background: 'rgba(248,81,73,0.1)',
            border: '1px solid rgba(248,81,73,0.2)',
            color: '#f85149',
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
