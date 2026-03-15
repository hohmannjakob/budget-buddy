# Budget Buddy

A production-ready student budgeting PWA.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL, no Prisma) |
| Auth | Supabase Auth (email/password) |
| Charts | Recharts |
| Forms | react-hook-form + zod |
| Animations | Framer Motion |
| Dates | date-fns |
| Icons | Lucide React |

## Folder Structure

```
app/
  (auth)/login/       → Login page
  (auth)/signup/      → Signup page
  (onboarding)/       → 5-step onboarding wizard
  (app)/              → Protected app shell (BottomNav + FAB)
    home/             → Dashboard with metric cards + debts
    expenses/         → Expense list with month nav
    groups/           → Group list + [id] detail
    insights/         → Charts (spending, category, budget vs actual)
    profile/          → Budget setup + settings

components/
  layout/             → BottomNav, FloatingActionButton
  home/               → MetricCard, MetricCardCustomizer, DebtSummary, CategorySummary
  expenses/           → ExpenseList, ExpenseItem, AddExpenseSheet, PersonalExpenseForm, SplitExpenseForm
  groups/             → GroupCard, BalanceSummary
  insights/           → SpendingChart, CategoryBreakdown, BudgetVsActual
  profile/            → BudgetSetup, CategoryBudgetItem
  ui/                 → shadcn primitives

actions/              → Server actions (auth, expenses, groups, budget, settlements)
hooks/                → Client-side data hooks (useExpenses, useBudget, useProfile, useGroups, useCalculations)
lib/
  supabase/           → client.ts (browser) + server.ts (cookie-based)
  types.ts            → All TypeScript types
  constants.ts        → Metric labels, category defaults
  calculations.ts     → Pure budget math functions
  utils.ts            → Formatting, date helpers
supabase/
  schema.sql          → Full DB schema (13 tables, RLS policies)
  seed.sql            → Demo data
middleware.ts         → Auth guard (redirects to /login if not authenticated)
```

## Setup

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in Supabase credentials:

```bash
cp .env.local.example .env.local
```

Get values from: Supabase Dashboard → Project Settings → API

### 2. Database

In Supabase SQL editor, run `supabase/schema.sql` in full.
Optionally run `supabase/seed.sql` for demo data (update user UUIDs first).

### 3. Dev Server

```bash
npm run dev
```

App at http://localhost:3000 → redirects to /login.

### 4. Build check

```bash
npm run build
```

## Design System

- **Accent**: Indigo-500 (`#6366f1`) — buttons, active states, primary actions
- **Background**: neutral-50 / dark: neutral-950
- **Cards**: white / dark: neutral-900, rounded-2xl, 1px border
- **Spacing rhythm**: 4, 8, 16, 24px
- **Typography**: Inter — large bold numbers, small muted labels

## Key Calculations (`lib/calculations.ts`)

```
budget_left      = total_budget - personal_expenses - user's split shares
daily_avg_left   = budget_left / remaining_days_in_month
spent_yesterday  = personal + split shares for yesterday
you_owe          = unsettled split shares where others paid
owed_to_you      = unsettled split shares where I paid (others owe me)
real_available   = budget_left - you_owe
```

**Critical rule**: owed_to_you does NOT increase budget until settled.

## Project-Specific Conventions

- Always use `createClient()` from `lib/supabase/client.ts` in Client Components
- Always use `createClient()` from `lib/supabase/server.ts` in Server Components / Actions
- Server actions in `actions/` — use `revalidatePath()` after mutations
- All DB queries use RLS — never use service role key client-side
- Expense amounts stored as `numeric(10,2)` — always parse as floats
- Months stored as `YYYY-MM-01` date strings (first day of month)
- Dates stored as `YYYY-MM-DD`

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Connect repo in Vercel
3. Set environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
4. Deploy
