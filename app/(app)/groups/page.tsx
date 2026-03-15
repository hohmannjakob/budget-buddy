'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import GroupCard from '@/components/groups/GroupCard'
import { useGroups } from '@/hooks/useGroups'
import { createGroup } from '@/actions/groups'

export default function GroupsPage() {
  const { groups, loading } = useGroups()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)
    await createGroup(name.trim())
    setCreating(false)
    setShowCreate(false)
    setName('')
    window.location.reload()
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Groups</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            style={{ background: '#6366f1', color: '#fff' }}
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>
      </div>

      <div className="px-5 pb-36">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" style={{ background: '#21262d' }} />)}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>No groups yet</p>
            <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Create a group to split expenses</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.08)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--foreground)' }}>Create group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label style={{ color: '#8b949e' }}>Group name</Label>
              <Input
                placeholder="Flatmates, Trip to Berlin…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ background: '#21262d', border: '1px solid rgba(240,246,252,0.08)', color: 'var(--foreground)' }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="w-full rounded-full"
              style={{ background: '#6366f1', color: '#fff' }}
            >
              {creating ? 'Creating…' : 'Create group'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
