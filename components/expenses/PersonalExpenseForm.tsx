'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { addPersonalExpense } from '@/actions/expenses'
import { getToday } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.string().min(1).refine((v) => parseFloat(v) > 0, 'Amount must be positive'),
  category_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSuccess: () => void
}

export default function PersonalExpenseForm({ onSuccess }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: getToday() },
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('sort_order')
      setCategories(data ?? [])
    })
  }, [])

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    const result = await addPersonalExpense({
      title: data.title,
      amount: parseFloat(data.amount),
      category_id: data.category_id ?? '',
      date: data.date,
      notes: data.notes,
    })
    setIsSubmitting(false)
    if (!result?.error) onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount — prominent */}
      <div className="space-y-1.5">
        <Label>Amount</Label>
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
          placeholder="Coffee, groceries, rent…"
          {...register('title')}
          className="dark:bg-neutral-800 dark:border-neutral-700"
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* Category + Date row */}
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
          <Input
            type="date"
            {...register('date')}
            className="dark:bg-neutral-800 dark:border-neutral-700"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Textarea
          placeholder="Any notes…"
          {...register('notes')}
          className="resize-none dark:bg-neutral-800 dark:border-neutral-700"
          rows={2}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-full bg-indigo-500 hover:bg-indigo-600"
      >
        {isSubmitting ? 'Adding…' : 'Add Expense'}
      </Button>
    </form>
  )
}
