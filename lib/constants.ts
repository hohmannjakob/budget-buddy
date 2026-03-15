import type { MetricKey } from './types'

export const METRIC_LABELS: Record<MetricKey, string> = {
  budget_left: 'Budget Left',
  daily_avg_left: 'Daily Budget',
  spent_yesterday: 'Spent Yesterday',
  you_owe: 'You Owe',
  owed_to_you: 'Owed to You',
  net_balance: 'Net Balance',
  real_available: 'Real Available',
  spent_this_month: 'Spent This Month',
}

export const METRIC_DESCRIPTIONS: Record<MetricKey, string> = {
  budget_left: 'Remaining after all expenses',
  daily_avg_left: 'Per day for the rest of the month',
  spent_yesterday: 'Your share of yesterday\'s expenses',
  you_owe: 'Unsettled debts you owe others',
  owed_to_you: 'Unsettled amounts others owe you',
  net_balance: 'Owed to you minus what you owe',
  real_available: 'Budget left minus your debts',
  spent_this_month: 'Total spent so far this month',
}

export const ALL_METRIC_KEYS: MetricKey[] = [
  'budget_left',
  'daily_avg_left',
  'spent_yesterday',
  'you_owe',
  'owed_to_you',
  'net_balance',
  'real_available',
  'spent_this_month',
]

export const DEFAULT_CATEGORIES = [
  { name: 'Food & Drinks', icon: 'utensils', color: '#f59e0b' },
  { name: 'Transport', icon: 'car', color: '#3b82f6' },
  { name: 'Housing', icon: 'home', color: '#8b5cf6' },
  { name: 'Entertainment', icon: 'tv', color: '#ec4899' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#10b981' },
  { name: 'Health', icon: 'heart', color: '#ef4444' },
  { name: 'Education', icon: 'book', color: '#6366f1' },
  { name: 'Savings', icon: 'piggy-bank', color: '#14b8a6' },
  { name: 'Other', icon: 'more-horizontal', color: '#6b7280' },
]

export const SPLIT_METHODS = [
  { value: 'equal', label: 'Split Equally' },
  { value: 'percentage', label: 'By Percentage' },
  { value: 'custom', label: 'Custom Amounts' },
  { value: 'selected', label: 'Selected Members' },
] as const

export const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const

export const ACCENT_COLOR = '#6366f1' // Indigo-500
