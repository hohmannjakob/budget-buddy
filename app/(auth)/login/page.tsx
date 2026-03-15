'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError(error.message)
      return
    }

    router.push('/home')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div
            className="inline-flex h-16 w-16 items-center justify-center rounded-3xl mb-5"
            style={{ background: '#6366f1' }}
          >
            <span className="text-3xl">💰</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>BudgetBuddy</h1>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Smart budgeting for students</p>
        </div>

        <div
          className="rounded-3xl p-6 space-y-5"
          style={{ background: '#161b22', border: '1px solid rgba(240,246,252,0.08)' }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Welcome back</h2>
            <p className="text-sm mt-0.5" style={{ color: '#8b949e' }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-2xl px-3 py-2 text-sm" style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149' }}>
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" style={{ color: '#8b949e' }}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
                style={{ background: '#21262d', border: '1px solid rgba(240,246,252,0.08)', color: 'var(--foreground)' }}
              />
              {errors.email && (
                <p className="text-xs" style={{ color: '#f85149' }}>{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" style={{ color: '#8b949e' }}>Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
                style={{ background: '#21262d', border: '1px solid rgba(240,246,252,0.08)', color: 'var(--foreground)' }}
              />
              {errors.password && (
                <p className="text-xs" style={{ color: '#f85149' }}>{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-full font-semibold"
              style={{ background: '#6366f1', color: '#fff' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-sm text-center" style={{ color: '#8b949e' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold" style={{ color: '#818cf8' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
