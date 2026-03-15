'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import AddExpenseSheet from '@/components/expenses/AddExpenseSheet'

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 transition-colors"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </motion.button>

      <AddExpenseSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
