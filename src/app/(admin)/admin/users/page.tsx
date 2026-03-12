'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, RefreshCw, Shield, Trash2 } from 'lucide-react'

type AdminUser = {
  id: string
  email: string
  created_at: string | null
  last_sign_in_at: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [email, setEmail] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users ?? [])
    setCurrentUserId(data.currentUserId ?? null)
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)

    const res = await fetch('/api/admin/create-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to create admin')
      setCreating(false)
      return
    }

    setSuccess(`Admin created: ${email}`)
    setEmail('')
    setCreating(false)
    setShowForm(false)
    fetchUsers()
  }

  async function handleRemove(userId: string, userEmail: string) {
    if (!confirm(`Remove admin access for ${userEmail}?`)) return
    setRemoving(userId)
    setError('')

    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to remove admin')
    } else {
      setSuccess(`Removed admin: ${userEmail}`)
      fetchUsers()
    }
    setRemoving(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">Admin Users</h1>
          <p className="text-warm-gray text-sm mt-1">{users.length} admin{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers} className="border-tenkai-border rounded-tenkai gap-1.5">
            <RefreshCw className="size-4" />
          </Button>
          <Button
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
            className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-1.5"
          >
            <UserPlus className="size-4" />
            Add Admin
          </Button>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-tenkai px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-tenkai px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-tenkai border border-tenkai-border p-6 space-y-4">
          <h3 className="font-medium text-charcoal">Create Admin User</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="max-w-sm">
              <label className="text-sm font-medium text-charcoal mb-1 block">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tenkai.io"
                required
                className="border-tenkai-border rounded-tenkai"
              />
              <p className="text-xs text-warm-gray mt-1.5">Admin will use the master password to sign in.</p>
            </div>
            <Button type="submit" disabled={creating} className="bg-torii text-white hover:bg-torii-dark rounded-tenkai">
              {creating ? 'Creating…' : 'Create Admin'}
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-tenkai border border-tenkai-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-tenkai-border bg-ivory/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide hidden sm:table-cell">Created</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide hidden md:table-cell">Last Sign In</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Role</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tenkai-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-warm-gray text-sm">Loading…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-warm-gray text-sm">No admin users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-parchment/30 transition-colors">
                  <td className="px-4 py-3 text-charcoal font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-warm-gray text-xs hidden sm:table-cell">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-warm-gray text-xs hidden md:table-cell">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 bg-torii-subtle text-torii text-xs px-2 py-0.5 rounded-full font-medium">
                      <Shield className="size-3" />
                      Admin
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => handleRemove(u.id, u.email)}
                        disabled={removing === u.id}
                        title="Remove admin"
                        className="text-warm-gray hover:text-torii transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
