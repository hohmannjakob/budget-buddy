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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Groups</h1>
          <Button
            onClick={() => setShowCreate(true)}
            size="sm"
            className="rounded-full bg-indigo-500 hover:bg-indigo-600 gap-1"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      <div className="px-4 py-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium">No groups yet</p>
            <p className="text-sm text-neutral-400 mt-1">Create a group to split expenses</p>
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
        <DialogContent className="dark:bg-neutral-900 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle>Create group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Group name</Label>
              <Input
                placeholder="Flatmates, Trip to Berlin…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="dark:bg-neutral-800 dark:border-neutral-700"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={creating || !name.trim()}
              className="w-full rounded-full bg-indigo-500 hover:bg-indigo-600"
            >
              {creating ? 'Creating…' : 'Create group'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
