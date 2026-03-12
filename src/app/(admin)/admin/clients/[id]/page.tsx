'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Ban } from 'lucide-react'
import Link from 'next/link'

type Client = {
  id: string
  name: string
  email: string
  company_name: string
  website_url: string | null
  tier: string
  status: string
  onboarding_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Editable fields
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [tier, setTier] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/clients')
      const data = await res.json()
      const found = data.clients?.find((c: Client) => c.id === id)
      if (found) {
        setClient(found)
        setName(found.name || '')
        setCompanyName(found.company_name || '')
        setWebsiteUrl(found.website_url || '')
        setTier(found.tier || 'starter')
        setStatus(found.status || 'invited')
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSave() {
    setError('')
    setSuccess('')
    setSaving(true)

    const res = await fetch('/api/admin/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, company_name: companyName, website_url: websiteUrl, tier, status }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setSuccess('Client updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    }
    setSaving(false)
  }

  async function handleDeactivate() {
    if (!confirm('Deactivate this client? They will lose access to the portal.')) return

    const res = await fetch('/api/admin/clients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (res.ok) {
      router.push('/admin/clients')
    }
  }

  if (loading) {
    return <div className="text-warm-gray text-sm p-8">Loading…</div>
  }

  if (!client) {
    return <div className="text-warm-gray text-sm p-8">Client not found.</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/clients" className="text-warm-gray hover:text-charcoal transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl text-charcoal">{client.name || 'Unnamed Client'}</h1>
          <p className="text-warm-gray text-sm">{client.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-tenkai border border-tenkai-border p-6 space-y-4">
        <h3 className="font-medium text-charcoal">Client Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-charcoal mb-1 block">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="border-tenkai-border rounded-tenkai" />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal mb-1 block">Company</label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="border-tenkai-border rounded-tenkai" />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal mb-1 block">Website</label>
            <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." className="border-tenkai-border rounded-tenkai" />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal mb-1 block">Tier</label>
            <select value={tier} onChange={(e) => setTier(e.target.value)} className="h-9 w-full px-3 rounded-tenkai border border-tenkai-border bg-transparent text-sm text-charcoal">
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal mb-1 block">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 w-full px-3 rounded-tenkai border border-tenkai-border bg-transparent text-sm text-charcoal">
              <option value="invited">Invited</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal mb-1 block">Email</label>
            <Input value={client.email} disabled className="border-tenkai-border rounded-tenkai bg-parchment/50 text-warm-gray" />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <div className="flex items-center justify-between pt-2">
          <Button onClick={handleSave} disabled={saving} className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-1.5">
            <Save className="size-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
          {status !== 'deactivated' && (
            <Button variant="outline" onClick={handleDeactivate} className="border-red-200 text-red-600 hover:bg-red-50 rounded-tenkai gap-1.5">
              <Ban className="size-4" />
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {/* Onboarding data */}
      {client.onboarding_data && (
        <div className="bg-white rounded-tenkai border border-tenkai-border p-6 space-y-3">
          <h3 className="font-medium text-charcoal">Onboarding Data</h3>
          <pre className="text-xs text-warm-gray bg-parchment/50 rounded-tenkai p-4 overflow-auto">
            {JSON.stringify(client.onboarding_data, null, 2)}
          </pre>
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-warm-gray space-y-1">
        <p>Created: {new Date(client.created_at).toLocaleString()}</p>
        <p>Updated: {new Date(client.updated_at).toLocaleString()}</p>
      </div>
    </div>
  )
}
