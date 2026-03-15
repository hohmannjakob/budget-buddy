'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import type { Group } from '@/lib/types'

interface Props {
  group: Group
}

export default function GroupCard({ group }: Props) {
  const memberCount = group.members?.length ?? 0

  return (
    <Link href={`/groups/${group.id}`}>
      <div
        className="flex items-center gap-4 px-5 py-4 rounded-3xl transition-all active:scale-[0.98]"
        style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.06)' }}
      >
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(99,102,241,0.15)' }}
        >
          <Users className="h-5 w-5" style={{ color: '#818cf8' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold truncate" style={{ color: 'var(--foreground)' }}>{group.name}</p>
          <p className="text-sm mt-0.5" style={{ color: '#8b949e' }}>
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Member avatars */}
        <div className="flex -space-x-2 shrink-0">
          {group.members?.slice(0, 3).map((member) => (
            <Avatar key={member.id} className="h-7 w-7" style={{ border: '2px solid #0d1117' }}>
              <AvatarFallback
                className="text-[10px] font-bold"
                style={{ background: '#21262d', color: '#8b949e' }}
              >
                {getInitials(member.profile?.name ?? '?')}
              </AvatarFallback>
            </Avatar>
          ))}
          {memberCount > 3 && (
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center"
              style={{ border: '2px solid #0d1117', background: '#21262d' }}
            >
              <span className="text-[10px] font-bold" style={{ color: '#8b949e' }}>+{memberCount - 3}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
