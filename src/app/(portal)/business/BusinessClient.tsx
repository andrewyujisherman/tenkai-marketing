'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, RefreshCw, Plus, Trash2, Link2, Users } from 'lucide-react'
import { useToast } from '@/components/ui/toast-notification'

// ---------- Types ----------

interface BusinessOverview {
  name: string
  url: string
  category: string
  area: string
}

interface MoneyPage {
  url: string
  label: string
  cta: string
}

interface LocalConnection {
  name: string
  relationship: string
  status: string
}

interface BusinessProfile {
  overview: BusinessOverview
  services: string[]
  not_services: string[]
  products: string[]
  specialties: string[]
  top_revenue_services: string[]
  customer_pain_points: string
  customer_faqs: string
  money_pages: MoneyPage[]
  local_connections: LocalConnection[]
  primary_cta: string
}

interface QAItem {
  id: string
  agent_id: string
  agent_name: string
  agent_kanji?: string
  question: string
  answer: string
  answered_at: string
}

// ---------- Inline Editable Field ----------

function InlineField({
  label,
  value,
  fieldKey,
  onSave,
}: {
  label: string
  value: string
  fieldKey: string
  onSave: (key: string, val: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  function handleSave() {
    const trimmed = editVal.trim()
    if (fieldKey === 'name' && trimmed.length < 2) return
    onSave(fieldKey, trimmed)
    setEditing(false)
  }

  return (
    <div className="profile-field">
      <div className="profile-label">{label}</div>
      {editing ? (
        <input
          ref={inputRef}
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') { setEditVal(value); setEditing(false) }
          }}
          className="w-full text-sm text-charcoal bg-transparent border-b-2 border-torii outline-none pb-0.5 mt-1"
        />
      ) : (
        <div
          onClick={() => { setEditVal(value); setEditing(true) }}
        >
          {value ? (
            <span className="profile-value">{value}</span>
          ) : (
            <span className="profile-empty">{`Add ${label.toLowerCase()}...`}</span>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- Tag Cloud ----------

function TagCloud({
  title,
  subtitle,
  tags,
  category,
  variant = 'default',
  onAdd,
  onRemove,
}: {
  title: string
  subtitle?: string
  tags: string[]
  category: string
  variant?: 'default' | 'negative' | 'gold'
  onAdd: (category: string, value: string) => void
  onRemove: (category: string, value: string) => void
}) {
  const [inputVal, setInputVal] = useState('')
  const [showInput, setShowInput] = useState(false)

  function handleAdd() {
    const trimmed = inputVal.trim()
    if (trimmed.length >= 2) {
      onAdd(category, trimmed)
      setInputVal('')
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h4 className="section-label">{title}</h4>
        {subtitle && <p className="text-xs text-muted-gray mt-0.5">{subtitle}</p>}
      </div>
      <div className="tag-list">
        {tags.map((tag) => (
          <span
            key={tag}
            className={cn('tk-tag', variant === 'negative' ? 'tk-tag-red' : '')}
          >
            {tag}
            <button
              onClick={() => onRemove(category, tag)}
              className="tag-remove"
            >
              ×
            </button>
          </span>
        ))}
        {showInput ? (
          <input
            autoFocus
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') { setShowInput(false); setInputVal('') }
            }}
            onBlur={() => { if (!inputVal.trim()) setShowInput(false); else handleAdd() }}
            placeholder={`Add ${title.toLowerCase().replace(/s$/, '')}...`}
            className="text-sm border-b-2 border-torii bg-transparent outline-none px-1 py-1 w-40"
          />
        ) : (
          <button onClick={() => setShowInput(true)} className="tag-add">
            + Add
          </button>
        )}
      </div>
    </div>
  )
}

// ---------- QA History ----------

function QAHistory({ questions }: { questions: QAItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!questions.length) {
    return (
      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-8 text-center">
        <p className="text-warm-gray text-sm">
          Your team is getting to know your business. Answer their daily questions to build your profile.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-ivory rounded-tenkai border border-tenkai-border divide-y divide-tenkai-border/50">
      {questions.map((qa) => (
        <div key={qa.id} className="group">
          <button
            onClick={() => setExpanded(expanded === qa.id ? null : qa.id)}
            className="w-full px-5 py-4 flex items-start gap-3 text-left hover:bg-parchment/20 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-torii-subtle flex items-center justify-center flex-shrink-0 border border-torii/20">
              <span className="text-sm font-serif text-torii">{qa.agent_kanji ?? '?'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-charcoal">{qa.agent_name}</span>
                <span className="text-xs text-muted-gray">
                  {new Date(qa.answered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-warm-gray mt-0.5 truncate">{qa.question}</p>
            </div>
            {expanded === qa.id ? (
              <ChevronUp className="size-4 text-warm-gray flex-shrink-0 mt-1" />
            ) : (
              <ChevronDown className="size-4 text-warm-gray flex-shrink-0 mt-1" />
            )}
          </button>
          {expanded === qa.id && (
            <div className="px-5 pb-4 pl-[60px]">
              <div className="bg-parchment/30 rounded-tenkai p-4 space-y-2">
                <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Question</p>
                <p className="text-sm text-charcoal">{qa.question}</p>
                <p className="text-xs font-semibold text-warm-gray uppercase tracking-wider mt-3">Your Answer</p>
                <p className="text-sm text-charcoal">{qa.answer}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ---------- Text Area Field ----------

function TextAreaField({
  value,
  fieldKey,
  onSave,
  placeholder,
}: {
  value: string
  fieldKey: string
  onSave: (key: string, val: string) => void
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(value)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editing])

  function handleSave() {
    onSave(fieldKey, editVal.trim())
    setEditing(false)
  }

  if (!editing) {
    return (
      <div
        onClick={() => { setEditVal(value); setEditing(true) }}
        className="min-h-[60px] text-sm text-charcoal bg-parchment/20 rounded-md px-3 py-2 cursor-pointer hover:bg-parchment/40 transition-colors"
      >
        {value ? (
          <span className="whitespace-pre-wrap">{value}</span>
        ) : (
          <span className="text-muted-gray italic">{placeholder || 'Click to add...'}</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={editVal}
        onChange={(e) => setEditVal(e.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full text-sm border border-tenkai-border rounded-md px-3 py-2 bg-white focus:outline-none focus:border-torii resize-y"
      />
      <div className="flex gap-2">
        <button onClick={handleSave} className="text-xs px-3 py-1.5 rounded-md bg-torii text-white hover:bg-torii/90">Save</button>
        <button onClick={() => { setEditVal(value); setEditing(false) }} className="text-xs px-3 py-1.5 rounded-md text-warm-gray hover:bg-parchment/30">Cancel</button>
      </div>
    </div>
  )
}

// ---------- Money Page List ----------

function MoneyPageList({
  pages,
  onAdd,
  onRemove,
}: {
  pages: MoneyPage[]
  onAdd: (page: MoneyPage) => void
  onRemove: (page: MoneyPage) => void
}) {
  const [adding, setAdding] = useState(false)
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [cta, setCta] = useState('Call')

  function handleAdd() {
    const trimUrl = url.trim()
    if (trimUrl.length < 4) return
    onAdd({ url: trimUrl, label: label.trim() || trimUrl, cta })
    setUrl('')
    setLabel('')
    setCta('Call')
    setAdding(false)
  }

  return (
    <div className="space-y-2">
      {pages.map((page) => (
        <div key={page.url} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-tenkai-border bg-parchment/10">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-charcoal">{page.label || page.url}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-gray truncate">{page.url}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-torii-subtle text-torii">{page.cta}</span>
            </div>
          </div>
          <button onClick={() => onRemove(page)} className="p-1 text-warm-gray hover:text-red-500 transition-colors">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      {adding ? (
        <div className="border border-tenkai-border rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <input
              autoFocus
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://..."
              className="col-span-2 text-sm border border-tenkai-border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-torii"
            />
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Page name"
              className="text-sm border border-tenkai-border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-torii"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-warm-gray">CTA:</span>
            {['Call', 'Form', 'Schedule', 'Buy', 'Learn More'].map(c => (
              <button
                key={c}
                onClick={() => setCta(c)}
                className={cn(
                  'text-xs px-2 py-1 rounded-md border transition-colors',
                  cta === c ? 'bg-torii text-white border-torii' : 'border-tenkai-border text-warm-gray hover:border-torii'
                )}
              >
                {c}
              </button>
            ))}
            <div className="flex-1" />
            <button onClick={handleAdd} className="text-xs px-3 py-1.5 rounded-md bg-torii text-white hover:bg-torii/90">Add</button>
            <button onClick={() => setAdding(false)} className="text-xs px-3 py-1.5 text-warm-gray">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm text-torii hover:text-torii/80 transition-colors">
          <Plus className="size-3.5" /> Add a key page
        </button>
      )}
    </div>
  )
}

// ---------- Connection List ----------

function ConnectionList({
  connections,
  onAdd,
  onRemove,
}: {
  connections: LocalConnection[]
  onAdd: (conn: LocalConnection) => void
  onRemove: (conn: LocalConnection) => void
}) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [status, setStatus] = useState('Active Partner')

  function handleAdd() {
    if (name.trim().length < 2) return
    onAdd({ name: name.trim(), relationship: relationship.trim(), status })
    setName('')
    setRelationship('')
    setStatus('Active Partner')
    setAdding(false)
  }

  return (
    <div className="space-y-2">
      {connections.map((conn) => (
        <div key={conn.name} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-tenkai-border bg-parchment/10">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-charcoal">{conn.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              {conn.relationship && <span className="text-xs text-muted-gray">{conn.relationship}</span>}
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                conn.status === 'Active Partner' ? 'bg-emerald-50 text-emerald-700' :
                conn.status === 'Referral Partner' ? 'bg-blue-50 text-blue-700' :
                'bg-amber-50 text-amber-700'
              )}>{conn.status}</span>
            </div>
          </div>
          <button onClick={() => onRemove(conn)} className="p-1 text-warm-gray hover:text-red-500 transition-colors">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
      {adding ? (
        <div className="border border-tenkai-border rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Business name"
              className="text-sm border border-tenkai-border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-torii"
            />
            <input
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              placeholder="How you know them"
              className="text-sm border border-tenkai-border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-torii"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-warm-gray">Status:</span>
            {['Active Partner', 'Referral Partner', 'Vendor', 'Competitor'].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  'text-xs px-2 py-1 rounded-md border transition-colors',
                  status === s ? 'bg-torii text-white border-torii' : 'border-tenkai-border text-warm-gray hover:border-torii'
                )}
              >
                {s}
              </button>
            ))}
            <div className="flex-1" />
            <button onClick={handleAdd} className="text-xs px-3 py-1.5 rounded-md bg-torii text-white hover:bg-torii/90">Add</button>
            <button onClick={() => setAdding(false)} className="text-xs px-3 py-1.5 text-warm-gray">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm text-torii hover:text-torii/80 transition-colors">
          <Plus className="size-3.5" /> Add a connection
        </button>
      )}
    </div>
  )
}

// ---------- Skeleton ----------

function BusinessSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-6 space-y-4">
        <div className="h-6 bg-parchment rounded w-1/3" />
        <div className="h-4 bg-parchment rounded w-1/2" />
        <div className="h-4 bg-parchment rounded w-2/5" />
        <div className="h-4 bg-parchment rounded w-1/4" />
      </div>
      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-6 space-y-4">
        <div className="h-4 bg-parchment rounded w-1/4" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 bg-parchment rounded-tenkai w-24" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------- Main ----------

export default function BusinessClient() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [questions, setQuestions] = useState<QAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    Promise.all([
      fetch('/api/business/profile').then((r) => r.json()),
      fetch('/api/business/agent-questions').then((r) => r.json()),
    ])
      .then(([profileData, qaData]) => {
        setProfile(profileData)
        setQuestions(qaData.questions ?? [])
      })
      .catch(() => setError('Unable to load your business profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleFieldSave = useCallback(async (field: string, value: string) => {
    try {
      const res = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
      setProfile((prev) => prev ? {
        ...prev,
        overview: { ...prev.overview, [field]: value },
      } : prev)
      addToast('success', 'Saved')
    } catch (e: unknown) {
      addToast('error', e instanceof Error ? e.message : 'Failed to save')
    }
  }, [addToast])

  const handleTagAdd = useCallback(async (category: string, value: string) => {
    // Optimistic update
    setProfile((prev) => {
      if (!prev) return prev
      return { ...prev, [category]: [...(prev[category as keyof BusinessProfile] as string[]), value] }
    })

    try {
      const res = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', category, value }),
      })
      if (!res.ok) throw new Error('Save failed')
    } catch {
      // Revert
      setProfile((prev) => {
        if (!prev) return prev
        return { ...prev, [category]: (prev[category as keyof BusinessProfile] as string[]).filter((t) => t !== value) }
      })
      addToast('error', 'Failed to save changes.')
    }
  }, [addToast])

  const handleTagRemove = useCallback(async (category: string, value: string) => {
    // Optimistic update
    setProfile((prev) => {
      if (!prev) return prev
      return { ...prev, [category]: (prev[category as keyof BusinessProfile] as string[]).filter((t) => t !== value) }
    })

    try {
      const res = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', category, value }),
      })
      if (!res.ok) throw new Error('Save failed')
    } catch {
      // Revert
      setProfile((prev) => {
        if (!prev) return prev
        return { ...prev, [category]: [...(prev[category as keyof BusinessProfile] as string[]), value] }
      })
      addToast('error', 'Failed to save changes.')
    }
  }, [addToast])

  if (loading) return <BusinessSkeleton />
  if (error) {
    return (
      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-8 text-center space-y-3">
        <p className="text-warm-gray text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-1.5 text-sm text-torii hover:text-torii-dark">
          <RefreshCw className="size-3.5" /> Retry
        </button>
      </div>
    )
  }
  if (!profile) return null

  const isEmpty = !profile.overview.name && !profile.services.length && !profile.specialties.length

  if (isEmpty && !questions.length) {
    return (
      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-12 text-center space-y-4 max-w-xl mx-auto">
        <h3 className="font-serif text-lg text-charcoal">Your team is getting to know your business</h3>
        <p className="text-warm-gray text-sm">
          Answer their daily questions to build your profile — the more they know, the better their work.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-torii text-white text-sm font-medium rounded-tenkai hover:bg-torii-dark transition-colors"
        >
          Check Dashboard for Questions
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Overview */}
      <div className="portal-card">
        <div className="portal-card-header">
          <h3>Business Details</h3>
        </div>
        <InlineField label="Name" value={profile.overview.name} fieldKey="name" onSave={handleFieldSave} />
        <InlineField label="Website" value={profile.overview.url} fieldKey="url" onSave={handleFieldSave} />
        <InlineField label="Category" value={profile.overview.category} fieldKey="category" onSave={handleFieldSave} />
        <InlineField label="Area" value={profile.overview.area} fieldKey="area" onSave={handleFieldSave} />
      </div>

      {/* Tag clouds */}
      <div className="portal-card space-y-8">
        <TagCloud
          title="Services"
          tags={profile.services}
          category="services"
          onAdd={handleTagAdd}
          onRemove={handleTagRemove}
        />
        <div className="border-t border-tenkai-border" />
        <TagCloud
          title="Not Services"
          subtitle="Tell your team what you do NOT offer so they never make mistakes."
          tags={profile.not_services}
          category="not_services"
          variant="negative"
          onAdd={handleTagAdd}
          onRemove={handleTagRemove}
        />
        <div className="border-t border-tenkai-border" />
        <TagCloud
          title="Products"
          tags={profile.products}
          category="products"
          onAdd={handleTagAdd}
          onRemove={handleTagRemove}
        />
        <div className="border-t border-tenkai-border" />
        <TagCloud
          title="Specialties"
          tags={profile.specialties}
          category="specialties"
          variant="gold"
          onAdd={handleTagAdd}
          onRemove={handleTagRemove}
        />
      </div>

      {/* Revenue Priorities */}
      <div className="portal-card space-y-8">
        <TagCloud
          title="Top Revenue Services"
          subtitle="Which services make you the most money? Your team will prioritize these."
          tags={profile.top_revenue_services ?? []}
          category="top_revenue_services"
          variant="gold"
          onAdd={handleTagAdd}
          onRemove={handleTagRemove}
        />
      </div>

      {/* Customer Pain Points & FAQs */}
      <div className="portal-card space-y-6">
        <div>
          <h4 className="section-label">Customer Pain Points</h4>
          <p className="text-xs text-muted-gray mt-0.5 mb-2">What problems do your customers come to you with?</p>
          <TextAreaField
            value={profile.customer_pain_points ?? ''}
            fieldKey="customer_pain_points"
            onSave={handleFieldSave}
            placeholder="e.g. My phone screen is cracked and I need it fixed today. My gaming console overheats and shuts down."
          />
        </div>
        <div className="border-t border-tenkai-border" />
        <div>
          <h4 className="section-label">Common Customer Questions</h4>
          <p className="text-xs text-muted-gray mt-0.5 mb-2">What do customers ask before buying? Your team uses these for content.</p>
          <TextAreaField
            value={profile.customer_faqs ?? ''}
            fieldKey="customer_faqs"
            onSave={handleFieldSave}
            placeholder="e.g. How long does a screen replacement take? Do you offer warranties on repairs?"
          />
        </div>
      </div>

      {/* Money Pages */}
      <div className="portal-card space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Link2 className="size-4 text-torii" />
            <h4 className="section-label">Key Pages</h4>
          </div>
          <p className="text-xs text-muted-gray mt-0.5">Your most important pages — your team will link to these in content.</p>
        </div>
        <MoneyPageList
          pages={profile.money_pages ?? []}
          onAdd={async (page) => {
            setProfile(prev => prev ? { ...prev, money_pages: [...(prev.money_pages ?? []), page] } : prev)
            try {
              const res = await fetch('/api/business/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonb_field: 'money_pages', action: 'add', item: page }),
              })
              if (!res.ok) throw new Error()
              addToast('success', 'Page added')
            } catch {
              setProfile(prev => prev ? { ...prev, money_pages: (prev.money_pages ?? []).filter(p => p.url !== page.url) } : prev)
              addToast('error', 'Failed to save')
            }
          }}
          onRemove={async (page) => {
            setProfile(prev => prev ? { ...prev, money_pages: (prev.money_pages ?? []).filter(p => p.url !== page.url) } : prev)
            try {
              await fetch('/api/business/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonb_field: 'money_pages', action: 'remove', item: page }),
              })
            } catch {
              setProfile(prev => prev ? { ...prev, money_pages: [...(prev.money_pages ?? []), page] } : prev)
              addToast('error', 'Failed to remove')
            }
          }}
        />
      </div>

      {/* Local Connections */}
      <div className="portal-card space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-torii" />
            <h4 className="section-label">Local Connections</h4>
          </div>
          <p className="text-xs text-muted-gray mt-0.5">Businesses you already work with — your team won&apos;t cold-outreach these.</p>
        </div>
        <ConnectionList
          connections={profile.local_connections ?? []}
          onAdd={async (conn) => {
            setProfile(prev => prev ? { ...prev, local_connections: [...(prev.local_connections ?? []), conn] } : prev)
            try {
              const res = await fetch('/api/business/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonb_field: 'local_connections', action: 'add', item: conn }),
              })
              if (!res.ok) throw new Error()
              addToast('success', 'Connection added')
            } catch {
              setProfile(prev => prev ? { ...prev, local_connections: (prev.local_connections ?? []).filter(c => c.name !== conn.name) } : prev)
              addToast('error', 'Failed to save')
            }
          }}
          onRemove={async (conn) => {
            setProfile(prev => prev ? { ...prev, local_connections: (prev.local_connections ?? []).filter(c => c.name !== conn.name) } : prev)
            try {
              await fetch('/api/business/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonb_field: 'local_connections', action: 'remove', item: conn }),
              })
            } catch {
              setProfile(prev => prev ? { ...prev, local_connections: [...(prev.local_connections ?? []), conn] } : prev)
              addToast('error', 'Failed to remove')
            }
          }}
        />
      </div>

      {/* Q&A History */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg text-charcoal">Questions From Your Team</h3>
        <QAHistory questions={questions} />
      </div>
    </div>
  )
}
