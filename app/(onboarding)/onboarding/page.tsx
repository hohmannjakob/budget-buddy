'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { completeOnboarding } from '@/actions/budget'
import { DEFAULT_CATEGORIES } from '@/lib/constants'

const TOTAL_STEPS = 5

type Step = {
  title: string
  description: string
}

const STEPS: Step[] = [
  { title: 'Monthly Budget', description: 'How much can you spend this month?' },
  { title: 'Fixed Costs', description: 'Add recurring expenses (rent, subscriptions)' },
  { title: 'Category Budgets', description: 'Set limits for each spending category' },
  { title: 'Savings Goal', description: 'How much do you want to save?' },
  { title: 'You\'re all set!', description: 'Review your setup and get started' },
]

type FixedCost = { title: string; amount: string }
type CategoryBudget = { name: string; amount: string }

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [direction, setDirection] = useState(1)

  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([
    { title: 'Rent', amount: '' },
    { title: '', amount: '' },
  ])
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>(
    DEFAULT_CATEGORIES.slice(0, 5).map((c) => ({ name: c.name, amount: '' }))
  )
  const [savingsGoal, setSavingsGoal] = useState('')

  function goNext() {
    setDirection(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleFinish() {
    setIsSubmitting(true)
    try {
      await completeOnboarding({
        monthly_budget: parseFloat(monthlyBudget) || 0,
        category_budgets: categoryBudgets
          .filter((c) => c.amount)
          .map((c) => ({ category_id: '', monthly_budget: parseFloat(c.amount) || 0 })),
      })
      router.push('/home')
    } catch {
      setIsSubmitting(false)
    }
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500">Step {step + 1} of {TOTAL_STEPS}</span>
            {step > 0 && (
              <button onClick={goBack} className="text-sm text-indigo-500 flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            )}
          </div>
          <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="h-1.5" />
        </div>

        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <h1 className="text-2xl font-bold">{STEPS[step].title}</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">{STEPS[step].description}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-4">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* Step 0: Monthly Budget */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Monthly budget (€)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-lg font-medium">€</span>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="1200"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      className="pl-8 text-lg h-12 dark:bg-neutral-900 dark:border-neutral-700"
                    />
                  </div>
                  <p className="text-xs text-neutral-400">Include all income: student loans, jobs, parental support</p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[600, 900, 1200, 1500, 2000, 2500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setMonthlyBudget(String(amount))}
                      className={`rounded-xl border py-3 text-sm font-medium transition-colors ${
                        monthlyBudget === String(amount)
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      €{amount}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Fixed Costs */}
            {step === 1 && (
              <div className="space-y-3">
                {fixedCosts.map((cost, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={i === 0 ? 'Rent' : 'Expense name'}
                      value={cost.title}
                      onChange={(e) => {
                        const updated = [...fixedCosts]
                        updated[i] = { ...updated[i], title: e.target.value }
                        setFixedCosts(updated)
                      }}
                      className="flex-1 dark:bg-neutral-900 dark:border-neutral-700"
                    />
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">€</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={cost.amount}
                        onChange={(e) => {
                          const updated = [...fixedCosts]
                          updated[i] = { ...updated[i], amount: e.target.value }
                          setFixedCosts(updated)
                        }}
                        className="pl-7 dark:bg-neutral-900 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setFixedCosts([...fixedCosts, { title: '', amount: '' }])}
                  className="w-full rounded-xl dark:border-neutral-700"
                >
                  + Add another
                </Button>
                <p className="text-xs text-neutral-400">These help you see your real discretionary spending</p>
              </div>
            )}

            {/* Step 2: Category Budgets */}
            {step === 2 && (
              <div className="space-y-3">
                {categoryBudgets.map((cat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="flex-1 text-sm font-medium">{cat.name}</span>
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">€</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={cat.amount}
                        onChange={(e) => {
                          const updated = [...categoryBudgets]
                          updated[i] = { ...updated[i], amount: e.target.value }
                          setCategoryBudgets(updated)
                        }}
                        className="pl-7 h-9 text-sm dark:bg-neutral-900 dark:border-neutral-700"
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-neutral-400 pt-1">Leave blank to skip a category</p>
              </div>
            )}

            {/* Step 3: Savings Goal */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="savings">Savings goal this month (€)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-lg font-medium">€</span>
                    <Input
                      id="savings"
                      type="number"
                      placeholder="200"
                      value={savingsGoal}
                      onChange={(e) => setSavingsGoal(e.target.value)}
                      className="pl-8 text-lg h-12 dark:bg-neutral-900 dark:border-neutral-700"
                    />
                  </div>
                  <p className="text-xs text-neutral-400">Optional — helps you stay on track</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[50, 100, 150, 200, 300, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSavingsGoal(String(amount))}
                      className={`rounded-xl border py-3 text-sm font-medium transition-colors ${
                        savingsGoal === String(amount)
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      €{amount}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Summary */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
                  <SummaryRow label="Monthly budget" value={`€${monthlyBudget || '0'}`} />
                  <SummaryRow
                    label="Fixed costs"
                    value={`€${fixedCosts.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0).toFixed(0)}`}
                  />
                  <SummaryRow
                    label="Savings goal"
                    value={`€${savingsGoal || '0'}`}
                  />
                  <SummaryRow
                    label="Discretionary"
                    value={`€${Math.max(0, (parseFloat(monthlyBudget) || 0) - fixedCosts.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0) - (parseFloat(savingsGoal) || 0)).toFixed(0)}`}
                    highlight
                  />
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    You can change all of this later in Profile settings
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer button */}
      <div className="px-6 pb-10 pt-4">
        <Button
          onClick={step === TOTAL_STEPS - 1 ? handleFinish : goNext}
          disabled={isSubmitting || (step === 0 && !monthlyBudget)}
          className="w-full h-12 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
        >
          {step === TOTAL_STEPS - 1 ? (
            isSubmitting ? 'Setting up…' : 'Start BudgetBuddy'
          ) : (
            <span className="flex items-center gap-2">
              Continue <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>

        {step < TOTAL_STEPS - 1 && step > 0 && (
          <button
            onClick={goNext}
            className="mt-3 w-full text-center text-sm text-neutral-400 hover:text-neutral-600"
          >
            Skip this step
          </button>
        )}
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${highlight ? 'font-semibold' : 'text-neutral-500 dark:text-neutral-400'}`}>
        {label}
      </span>
      <span className={`font-semibold ${highlight ? 'text-indigo-500 text-lg' : ''}`}>{value}</span>
    </div>
  )
}
