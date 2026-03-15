import { getDaysInMonth, getDayOfYear, startOfMonth } from 'date-fns'
import type { Budget, Expense, SplitShare, BudgetMetrics } from './types'

interface CalcInput {
  budget: Budget | null
  personalExpenses: Expense[] // non-split expenses by user
  userSplitShares: SplitShare[] // all split_shares where user_id = current user
  paidSplitShares: SplitShare[] // all split_shares on expenses paid by user (others' shares)
  yesterdayPersonal: Expense[]
  yesterdaySplitShares: SplitShare[] // user's shares for yesterday
  today: Date
}

/**
 * Core budget calculations.
 * All amounts in EUR (or user's currency).
 * Critical rule: amounts owed to you do NOT increase available budget until settled.
 */
export function calculateBudgetMetrics(input: CalcInput): BudgetMetrics {
  const {
    budget,
    personalExpenses,
    userSplitShares,
    paidSplitShares,
    yesterdayPersonal,
    yesterdaySplitShares,
    today,
  } = input

  const totalBudget = budget?.total_amount ?? 0

  // Total spent = personal expenses + user's share of split expenses
  const personalTotal = personalExpenses.reduce((sum, e) => sum + e.amount, 0)
  const splitTotal = userSplitShares.reduce((sum, s) => sum + s.amount, 0)
  const spentThisMonth = personalTotal + splitTotal

  // Budget left
  const budgetLeft = totalBudget - spentThisMonth

  // Remaining days (including today)
  const daysInMonth = getDaysInMonth(today)
  const dayOfMonth = today.getDate()
  const remainingDays = Math.max(1, daysInMonth - dayOfMonth + 1)

  // Daily average left
  const dailyAvgLeft = budgetLeft / remainingDays

  // Spent yesterday
  const yesterdayPersonalTotal = yesterdayPersonal.reduce((sum, e) => sum + e.amount, 0)
  const yesterdaySplitTotal = yesterdaySplitShares.reduce((sum, s) => sum + s.amount, 0)
  const spentYesterday = yesterdayPersonalTotal + yesterdaySplitTotal

  // Debts
  // you_owe = unsettled shares where user owes others (others paid, user didn't settle)
  const youOwe = userSplitShares
    .filter((s) => !s.is_settled)
    .reduce((sum, s) => sum + s.amount, 0)

  // owed_to_you = unsettled shares where user paid, others owe user
  const owedToYou = paidSplitShares
    .filter((s) => !s.is_settled)
    .reduce((sum, s) => sum + s.amount, 0)

  // net_balance = owed_to_you - you_owe
  const netBalance = owedToYou - youOwe

  // real_available = budget_left - you_owe (debts reduce actual available)
  const realAvailable = budgetLeft - youOwe

  return {
    budget_left: budgetLeft,
    daily_avg_left: dailyAvgLeft,
    spent_yesterday: spentYesterday,
    you_owe: youOwe,
    owed_to_you: owedToYou,
    net_balance: netBalance,
    real_available: realAvailable,
    spent_this_month: spentThisMonth,
    total_budget: totalBudget,
    remaining_days: remainingDays,
  }
}

/**
 * Calculate equal split amounts for N participants
 */
export function calculateEqualSplit(total: number, participantCount: number): number {
  return Math.round((total / participantCount) * 100) / 100
}

/**
 * Calculate percentage-based split
 */
export function calculatePercentageSplit(
  total: number,
  percentages: { user_id: string; percentage: number }[]
): { user_id: string; amount: number }[] {
  return percentages.map(({ user_id, percentage }) => ({
    user_id,
    amount: Math.round(total * (percentage / 100) * 100) / 100,
  }))
}

/**
 * Budget utilization percentage (0–100+)
 */
export function getBudgetUtilization(spent: number, budget: number): number {
  if (budget <= 0) return 0
  return Math.round((spent / budget) * 100)
}

/**
 * Category spending summary
 */
export function getCategorySpending(
  expenses: Expense[],
  splitShares: (SplitShare & { expense?: Expense })[]
) {
  const spending = new Map<string, number>()

  for (const expense of expenses) {
    if (!expense.is_split && expense.category_id) {
      const prev = spending.get(expense.category_id) ?? 0
      spending.set(expense.category_id, prev + expense.amount)
    }
  }

  for (const share of splitShares) {
    const categoryId = share.expense?.category_id
    if (categoryId) {
      const prev = spending.get(categoryId) ?? 0
      spending.set(categoryId, prev + share.amount)
    }
  }

  return spending
}
