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
      <div className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
          <Users className="h-5 w-5 text-indigo-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{group.name}</p>
          <p className="text-sm text-neutral-400 mt-0.5">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
        </div>

        {/* Member avatars */}
        <div className="flex -space-x-2 shrink-0">
          {group.members?.slice(0, 3).map((member) => (
            <Avatar key={member.id} className="h-7 w-7 border-2 border-white dark:border-neutral-900">
              <AvatarFallback className="text-[10px] bg-neutral-200 dark:bg-neutral-700">
                {getInitials(member.profile?.name ?? '?')}
              </AvatarFallback>
            </Avatar>
          ))}
          {memberCount > 3 && (
            <div className="h-7 w-7 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <span className="text-[10px] font-medium text-neutral-500">+{memberCount - 3}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
