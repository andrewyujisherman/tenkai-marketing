'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBrowserClient } from '@supabase/ssr'

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error: updateError } = await getSupabase().auth.updateUser({
      password,
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-tenkai-border rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <span className="text-torii font-serif text-3xl">天界</span>
          <h2 className="font-serif text-xl text-charcoal mt-4">Set your password</h2>
          <p className="text-warm-gray text-sm mt-2">Choose a password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal mb-1.5 block">Password</label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="border-tenkai-border focus:border-torii focus:ring-torii/20"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-charcoal mb-1.5 block">Confirm Password</label>
            <Input
              type="password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
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
            {loading ? 'Setting password…' : 'Set Password & Continue'}
          </Button>
        </form>
      </div>
    </div>
  )
}
