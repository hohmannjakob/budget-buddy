'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, Users, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/expenses', label: 'Expenses', icon: List },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center pointer-events-none"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      <nav
        className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-[28px] shadow-2xl"
        style={{
          background: '#1c2128',
          border: '1px solid rgba(240,246,252,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200',
                isActive ? 'text-white' : 'text-[#8b949e]'
              )}
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'rgba(240,246,252,0.1)' }}
                />
              )}
              <Icon className={cn('relative h-5 w-5', isActive ? 'stroke-[2.5]' : 'stroke-[1.5]')} />
              <span className="relative text-[9px] font-medium tracking-wide">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
