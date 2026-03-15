// ============================================================
// BudgetBuddy — TypeScript Types
// ============================================================

export type Profile = {
  id: string
  name: string
  avatar_url: string | null
  onboarding_done: boolean
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  user_id: string | null
  name: string
  icon: string
  color: string
  monthly_budget: number | null
  sort_order: number
  created_at: string
}

export type Budget = {
  id: string
  user_id: string
  month: string // YYYY-MM-01
  total_amount: number
  created_at: string
  updated_at: string
}

export type Group = {
  id: string
  name: string
  description: string | null
  created_by: string
  avatar_url: string | null
  created_at: string
  // joined
  members?: GroupMember[]
}

export type GroupMember = {
  id: string
  group_id: string
  user_id: string
  joined_at: string
  // joined
  profile?: Profile
}

export type Expense = {
  id: string
  user_id: string
  title: string
  amount: number
  category_id: string | null
  date: string // YYYY-MM-DD
  is_split: boolean
  group_id: string | null
  paid_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  category?: Category
  split_expense?: SplitExpense
  payer?: Profile
}

export type SplitExpense = {
  id: string
  expense_id: string
  split_method: 'equal' | 'percentage' | 'custom' | 'selected'
  created_at: string
  // joined
  shares?: SplitShare[]
}

export type SplitShare = {
  id: string
  split_expense_id: string
  user_id: string
  amount: number
  is_settled: boolean
  settled_at: string | null
  created_at: string
  // joined
  profile?: Profile
}

export type Settlement = {
  id: string
  from_user_id: string
  to_user_id: string
  amount: number
  group_id: string | null
  note: string | null
  created_at: string
  // joined
  from_profile?: Profile
  to_profile?: Profile
}

export type RecurringExpense = {
  id: string
  user_id: string
  title: string
  amount: number
  category_id: string | null
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  is_active: boolean
  created_at: string
  // joined
  category?: Category
}

export type MetricKey =
  | 'budget_left'
  | 'daily_avg_left'
  | 'spent_yesterday'
  | 'you_owe'
  | 'owed_to_you'
  | 'net_balance'
  | 'real_available'
  | 'spent_this_month'

export type UserMetricPrefs = {
  id: string
  user_id: string
  metric_1: MetricKey
  metric_2: MetricKey
  created_at: string
  updated_at: string
}

export type BudgetMetrics = {
  budget_left: number
  daily_avg_left: number
  spent_yesterday: number
  you_owe: number
  owed_to_you: number
  net_balance: number
  real_available: number
  spent_this_month: number
  total_budget: number
  remaining_days: number
}

export type CategorySpending = {
  category: Category
  spent: number
  budget: number | null
  percentage: number
}

// Form types
export type AddPersonalExpenseInput = {
  title: string
  amount: number
  category_id: string
  date: string
  notes?: string
}

export type AddSplitExpenseInput = {
  title: string
  amount: number
  category_id: string
  date: string
  group_id: string
  split_method: 'equal' | 'percentage' | 'custom' | 'selected'
  notes?: string
  shares?: { user_id: string; amount: number }[]
}

export type OnboardingData = {
  monthly_budget: number
  fixed_costs: { title: string; amount: number; category_id: string }[]
  category_budgets: { category_id: string; monthly_budget: number }[]
  savings_goal: number
  group_name?: string
  group_invite_emails?: string[]
}
