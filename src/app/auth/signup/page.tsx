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

export default function SignupPage() {
  const [fields, setFields] = useState({
    fullName: '',
    companyName: '',
    websiteUrl: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await getSupabase().auth.signUp({
      email: fields.email,
      password: fields.password,
      options: {
        data: {
          full_name: fields.fullName,
          company_name: fields.companyName,
          website_url: fields.websiteUrl,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-tenkai-border rounded-2xl p-8 shadow-sm text-center">
          <span className="text-torii font-serif text-3xl">天界</span>
          <h2 className="font-serif text-xl text-charcoal mt-6 mb-3">Check your email</h2>
          <p className="text-sm text-warm-gray leading-relaxed">
            We sent a confirmation link to <span className="text-charcoal font-medium">{fields.email}</span>.
            Click it to activate your account.
          </p>
          <Link href="/auth/login" className="inline-block mt-6 text-sm text-torii hover:text-torii-dark font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white border border-tenkai-border rounded-2xl p-8 shadow-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-torii font-serif text-3xl">天界</span>
          <p className="text-warm-gray text-sm mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal mb-1.5 block">Full Name</label>
            <Input
              type="text"
              placeholder="Jane Smith"
              value={fields.fullName}
              onChange={set('fullName')}
              required
              className="border-tenkai-border"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-charcoal mb-1.5 block">Company Name</label>
            <Input
              type="text"
              placeholder="Acme Co."
              value={fields.companyName}
              onChange={set('companyName')}
              required
              className="border-tenkai-border"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-charcoal mb-1.5 block">Website URL</label>
            <Input
              type="url"
              placeholder="https://yoursite.com"
              value={fields.websiteUrl}
              onChange={set('websiteUrl')}
              className="border-tenkai-border"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-charcoal mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={fields.email}
              onChange={set('email')}
              required
              className="border-tenkai-border"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-charcoal mb-1.5 block">Password</label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              value={fields.password}
              onChange={set('password')}
              required
              minLength={8}
              className="border-tenkai-border"
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
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-warm-gray mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-torii hover:text-torii-dark font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
