'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { addSplitExpense } from '@/actions/expenses'
import { getToday, getInitials, formatCurrency } from '@/lib/utils'
import { calculateEqualSplit } from '@/lib/calculations'
import { createClient } from '@/lib/supabase/client'
import type { Category, Group, GroupMember } from '@/lib/types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.string().refine((v) => parseFloat(v) > 0, 'Amount must be positive'),
  category_id: z.string().optional(),
  date: z.string().min(1),
  group_id: z.string().min(1, 'Select a group'),
  split_method: z.enum(['equal', 'percentage', 'custom', 'selected']),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSuccess: () => void
}

export default function SplitExpenseForm({ onSuccess }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: getToday(), split_method: 'equal' },
  })

  const amount = parseFloat(watch('amount') || '0')
  const groupId = watch('group_id')
  const splitMethod = watch('split_method')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setCurrentUserId(user.id)

      const [{ data: cats }, { data: memberRows }] = await Promise.all([
        supabase.from('categories').select('*').or(`user_id.eq.${user.id},user_id.is.null`).order('sort_order'),
        supabase.from('group_members').select('group_id').eq('user_id', user.id),
      ])

      setCategories(cats ?? [])

      if (memberRows?.length) {
        const groupIds = memberRows.map((m) => m.group_id)
        const { data: grps } = await supabase
          .from('groups')
          .select('*, members:group_members(*, profile:profiles(*))')
          .in('id', groupIds)
        setGroups(grps ?? [])
      }
    })
  }, [])

  useEffect(() => {
    const group = groups.find((g) => g.id === groupId) ?? null
    setSelectedGroup(group)
  }, [groupId, groups])

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    const total = parseFloat(data.amount)
    const members = selectedGroup?.members ?? []

    let shares: { user_id: string; amount: number }[] = []
    if (data.split_method === 'equal' && members.length > 0) {
      const perPerson = calculateEqualSplit(total, members.length)
      shares = members.map((m) => ({ user_id: m.user_id, amount: perPerson }))
    }

    const result = await addSplitExpense({
      title: data.title,
      amount: total,
      category_id: data.category_id ?? '',
      date: data.date,
      group_id: data.group_id,
      split_method: data.split_method,
      notes: data.notes,
      shares,
    })

    setIsSubmitting(false)
    if (!result?.error) onSuccess()
  }

  const memberCount = selectedGroup?.members?.length ?? 0
  const perPerson = memberCount > 0 ? calculateEqualSplit(amount, memberCount) : 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount */}
      <div className="space-y-1.5">
        <Label>Total amount</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-neutral-300">€</span>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount')}
            className="pl-10 text-2xl font-bold h-14 dark:bg-neutral-800 dark:border-neutral-700"
            inputMode="decimal"
          />
        </div>
        {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label>What for?</Label>
        <Input
          placeholder="Dinner, groceries, Airbnb…"
          {...register('title')}
          className="dark:bg-neutral-800 dark:border-neutral-700"
        />
      </div>

      {/* Group */}
      <div className="space-y-1.5">
        <Label>Group</Label>
        <Select onValueChange={(v) => setValue('group_id', v as string)}>
          <SelectTrigger className="dark:bg-neutral-800 dark:border-neutral-700">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.group_id && <p className="text-xs text-red-500">{errors.group_id.message}</p>}
      </div>

      {/* Split method */}
      <div className="space-y-1.5">
        <Label>Split method</Label>
        <div className="flex gap-2">
          {(['equal', 'custom'] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setValue('split_method', method)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                splitMethod === method
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                  : 'border-neutral-200 dark:border-neutral-700'
              }`}
            >
              {method === 'equal' ? 'Split equally' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Members preview */}
      {selectedGroup && splitMethod === 'equal' && amount > 0 && (
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-3">
          <p className="text-xs text-neutral-500 mb-2">Each person pays {formatCurrency(perPerson)}</p>
          <div className="flex flex-wrap gap-2">
            {selectedGroup.members?.map((m) => (
              <div key={m.id} className="flex items-center gap-1.5">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-600 dark:bg-indigo-900">
                    {getInitials(m.profile?.name ?? '?')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{m.profile?.name?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date + Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select onValueChange={(v) => setValue('category_id', v as string)}>
            <SelectTrigger className="dark:bg-neutral-800 dark:border-neutral-700">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" {...register('date')} className="dark:bg-neutral-800 dark:border-neutral-700" />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-full bg-indigo-500 hover:bg-indigo-600"
      >
        {isSubmitting ? 'Adding…' : 'Add Split Expense'}
      </Button>
    </form>
  )
}
