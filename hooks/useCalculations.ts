'use client'

import { useMemo } from 'react'
import { calculateBudgetMetrics } from '@/lib/calculations'
import type { Budget, Expense, SplitShare, BudgetMetrics } from '@/lib/types'

interface UseCalculationsInput {
  budget: Budget | null
  personalExpenses: Expense[] // non-split expenses by user
  userSplitShares: SplitShare[] // split shares where user_id = me
  paidSplitShares: SplitShare[] // shares on expenses I paid (others' portions)
  yesterdayPersonal: Expense[]
  yesterdaySplitShares: SplitShare[]
}

export function useCalculations(input: UseCalculationsInput): BudgetMetrics {
  return useMemo(() => {
    return calculateBudgetMetrics({
      ...input,
      today: new Date(),
    })
  }, [input.budget, input.personalExpenses, input.userSplitShares, input.paidSplitShares])
}
