'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PersonalExpenseForm from './PersonalExpenseForm'
import SplitExpenseForm from './SplitExpenseForm'

interface Props {
  open: boolean
  onClose: () => void
}

export default function AddExpenseSheet({ open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl h-[90vh] overflow-y-auto dark:bg-neutral-900 dark:border-neutral-800"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-lg">Add Expense</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="personal">
          <TabsList className="w-full mb-4 dark:bg-neutral-800">
            <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
            <TabsTrigger value="split" className="flex-1">Split</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalExpenseForm onSuccess={onClose} />
          </TabsContent>

          <TabsContent value="split">
            <SplitExpenseForm onSuccess={onClose} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
