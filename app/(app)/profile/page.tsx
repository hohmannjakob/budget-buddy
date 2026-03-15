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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold">Profile</h1>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* User info */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
              {getInitials(profile?.name ?? 'U')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg">{profile?.name ?? 'User'}</p>
            <p className="text-sm text-neutral-400">BudgetBuddy member</p>
          </div>
        </div>

        {/* Monthly budget */}
        <BudgetSetup budget={budget} />

        {/* Category budgets */}
        {categories.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-semibold">Category Limits</h3>
            </div>
            {categories.map((cat) => (
              <CategoryBudgetItem key={cat.id} category={cat} />
            ))}
          </div>
        )}

        {/* Settings */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="font-semibold">Settings</h3>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="h-4 w-4 text-neutral-400" /> : <Sun className="h-4 w-4 text-neutral-400" />}
              <span className="text-sm font-medium">Dark mode</span>
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
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-neutral-900 py-4 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
