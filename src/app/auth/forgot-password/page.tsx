'use client'

import { useState } from 'react'
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const { error: resetError } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/callback?type=recovery`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-tenkai-border rounded-2xl p-8 shadow-sm text-center">
          <span className="text-torii font-serif text-3xl">天界</span>
          <h2 className="font-serif text-xl text-charcoal mt-4">Check your email</h2>
          <p className="text-warm-gray text-sm mt-2 leading-relaxed">
            We sent a password reset link to <strong className="text-charcoal">{email}</strong>.
            Click the link in the email to set a new password.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="mt-6 border-tenkai-border rounded-xl">
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-tenkai-border rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <span className="text-torii font-serif text-3xl">天界</span>
          <h2 className="font-serif text-xl text-charcoal mt-4">Reset your password</h2>
          <p className="text-warm-gray text-sm mt-2">
            Enter your email and we&apos;ll send you a reset link
          </p>
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-torii hover:bg-torii-dark text-white rounded-xl font-medium text-sm"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="text-center text-sm text-warm-gray mt-6">
          <Link href="/auth/login" className="text-torii hover:text-torii-dark font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
