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
        className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white transition-colors"
        style={{
          background: '#ef4444',
          boxShadow: '0 4px 24px rgba(239,68,68,0.45)',
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
        aria-label="Add expense"
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </motion.button>

      <AddExpenseSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
