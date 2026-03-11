'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Tier = 'starter' | 'growth' | 'pro'

type PendingInvite = {
  id: string
  full_name?: string | null
  email?: string | null
  company_name?: string | null
  tier?: string | null
  created_at?: string | null
}

export default function AdminInvitesPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [tier, setTier] = useState<Tier>('starter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [invitesLoading, setInvitesLoading] = useState(true)

  async function fetchInvites() {
    setInvitesLoading(true)
    try {
      const res = await fetch('/api/admin/invite')
      if (res.ok) {
        const data = await res.json()
        setInvites(data.invites ?? [])
      }
    } finally {
      setInvitesLoading(false)
    }
  }

  useEffect(() => {
    fetchInvites()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, tier }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
      } else {
        setSuccess(true)
        setName('')
        setEmail('')
        setCompany('')
        setTier('starter')
        fetchInvites()
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-charcoal">Invites</h1>
        <p className="text-warm-gray text-sm mt-1">Send a client invite via email</p>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-tenkai border border-tenkai-border p-6">
        <h2 className="font-serif text-base text-charcoal mb-4">Send New Invite</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm text-charcoal">Client Name</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="rounded-tenkai border-tenkai-border"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm text-charcoal">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                required
                className="rounded-tenkai border-tenkai-border"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="company" className="text-sm text-charcoal">Company Name</label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                required
                className="rounded-tenkai border-tenkai-border"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tier" className="text-sm text-charcoal">Tier</label>
              <select
                id="tier"
                value={tier}
                onChange={(e) => setTier(e.target.value as Tier)}
                className="w-full h-10 px-3 rounded-tenkai border border-tenkai-border bg-white text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-torii/30"
              >
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-sm text-torii bg-torii-subtle/30 rounded-tenkai px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-700 bg-green-50 rounded-tenkai px-3 py-2">
              Invite sent successfully!
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="bg-torii text-white hover:bg-torii-dark rounded-tenkai"
          >
            {loading ? 'Sending...' : 'Send Invite'}
          </Button>
        </form>
      </div>

      {/* Pending invites list */}
      <div className="bg-white rounded-tenkai border border-tenkai-border p-6">
        <h2 className="font-serif text-base text-charcoal mb-4">Pending Invites</h2>
        {invitesLoading ? (
          <p className="text-warm-gray text-sm">Loading...</p>
        ) : invites.length === 0 ? (
          <p className="text-warm-gray text-sm">No pending invites.</p>
        ) : (
          <ul className="space-y-3">
            {invites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between gap-4 py-2 border-b border-tenkai-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-charcoal">{invite.full_name || invite.email}</p>
                  <p className="text-xs text-warm-gray">
                    {invite.company_name} &middot; {invite.tier} &middot; {invite.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs bg-torii-subtle text-torii px-2 py-0.5 rounded-full">invited</span>
                  {invite.created_at && (
                    <span className="text-xs text-warm-gray">{new Date(invite.created_at).toLocaleDateString()}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
