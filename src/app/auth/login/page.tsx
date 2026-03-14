'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBrowserClient } from '@supabase/ssr'

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function friendlyError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return 'Incorrect email or password. Please try again.'
    if (msg.includes('Email not confirmed')) return 'Please check your email and confirm your account first.'
    if (msg.includes('too many requests')) return 'Too many attempts. Please wait a moment and try again.'
    return msg
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await getSupabase().auth.signInWithPassword({ email, password })

    if (authError) {
      setError(friendlyError(authError.message))
      setLoading(false)
    } else {
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-tenkai-border rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <span className="text-torii font-serif text-3xl">天界</span>
          <p className="text-warm-gray text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-tenkai-border focus:border-torii focus:ring-torii/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-charcoal">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-torii hover:text-torii-dark">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-tenkai-border focus:border-torii focus:ring-torii/20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-torii hover:bg-torii-dark text-white rounded-xl font-medium text-sm"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-warm-gray mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-torii hover:text-torii-dark font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
