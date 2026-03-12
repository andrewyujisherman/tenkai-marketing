'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RefreshCw, Send, X } from 'lucide-react'

type Tier = 'starter' | 'growth' | 'pro'

type PendingInvite = {
  id: string
  name?: string | null
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
  const [resending, setResending] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

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

  async function handleResend(invite: PendingInvite) {
    setResending(invite.id)
    setActionMsg(null)
    const res = await fetch(`/api/admin/invite/${invite.id}`, { method: 'POST' })
    if (res.ok) {
      setActionMsg(`Invite resent to ${invite.email}`)
    } else {
      const data = await res.json()
      setActionMsg(`Error: ${data.error}`)
    }
    setResending(null)
  }

  async function handleCancel(invite: PendingInvite) {
    if (!confirm(`Cancel invite for ${invite.email}?`)) return
    setCancelling(invite.id)
    setActionMsg(null)
    const res = await fetch(`/api/admin/invite/${invite.id}`, { method: 'DELETE' })
    if (res.ok) {
      setActionMsg(`Invite cancelled for ${invite.email}`)
      fetchInvites()
    } else {
      const data = await res.json()
      setActionMsg(`Error: ${data.error}`)
    }
    setCancelling(null)
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-base text-charcoal">Pending Invites</h2>
          <button onClick={fetchInvites} className="text-warm-gray hover:text-charcoal transition-colors">
            <RefreshCw className="size-4" />
          </button>
        </div>

        {actionMsg && (
          <p className="text-sm text-charcoal bg-parchment rounded-tenkai px-3 py-2 mb-4">{actionMsg}</p>
        )}

        {invitesLoading ? (
          <p className="text-warm-gray text-sm">Loading...</p>
        ) : invites.length === 0 ? (
          <p className="text-warm-gray text-sm">No pending invites.</p>
        ) : (
          <ul className="space-y-3">
            {invites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between gap-4 py-2 border-b border-tenkai-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-charcoal">{invite.name || invite.email}</p>
                  <p className="text-xs text-warm-gray">
                    {invite.company_name} &middot; {invite.tier} &middot; {invite.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs bg-torii-subtle text-torii px-2 py-0.5 rounded-full">invited</span>
                  {invite.created_at && (
                    <span className="text-xs text-warm-gray">{new Date(invite.created_at).toLocaleDateString()}</span>
                  )}
                  <button
                    onClick={() => handleResend(invite)}
                    disabled={resending === invite.id}
                    title="Resend invite"
                    className="text-warm-gray hover:text-torii transition-colors disabled:opacity-40 p-1"
                  >
                    <Send className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleCancel(invite)}
                    disabled={cancelling === invite.id}
                    title="Cancel invite"
                    className="text-warm-gray hover:text-torii transition-colors disabled:opacity-40 p-1"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
