'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Pencil, X, Plus, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/toast-notification'

// ---------- Types ----------

interface BusinessOverview {
  name: string
  url: string
  category: string
  area: string
}

interface BusinessProfile {
  overview: BusinessOverview
  services: string[]
  not_services: string[]
  products: string[]
  specialties: string[]
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
    <div className="group flex items-start gap-3 py-2">
      <span className="text-xs font-semibold text-warm-gray uppercase tracking-wider min-w-[80px] pt-1">{label}</span>
      {editing ? (
        <div className="flex-1">
          <input
            ref={inputRef}
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') { setEditVal(value); setEditing(false) }
            }}
            className="w-full text-sm text-charcoal bg-transparent border-b-2 border-torii outline-none pb-0.5"
          />
        </div>
      ) : (
        <div
          className="flex-1 flex items-center gap-2 cursor-pointer group/field"
          onClick={() => { setEditVal(value); setEditing(true) }}
        >
          <span className={cn('text-sm', value ? 'text-charcoal' : 'text-warm-gray italic')}>
            {value || `Add ${label.toLowerCase()}...`}
          </span>
          <Pencil className="size-3 text-warm-gray opacity-0 group-hover/field:opacity-100 transition-opacity" />
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

  const chipStyles = {
    default: 'bg-parchment/60 text-charcoal border-tenkai-border/50',
    negative: 'bg-red-50 text-red-700 border-red-200/50',
    gold: 'bg-amber-50 text-amber-800 border-amber-200/50',
  }

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
        <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">{title}</h4>
        {subtitle && <p className="text-xs text-muted-gray mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-tenkai text-sm border group/tag',
              chipStyles[variant]
            )}
          >
            {tag}
            <button
              onClick={() => onRemove(category, tag)}
              className="opacity-0 group-hover/tag:opacity-100 transition-opacity p-0.5 -mr-1 rounded-full hover:bg-charcoal/10"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        {showInput ? (
          <div className="inline-flex items-center">
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
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-tenkai text-sm text-warm-gray border border-dashed border-tenkai-border hover:border-torii hover:text-torii transition-colors"
          >
            <Plus className="size-3" /> Add
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
      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-6">
        <InlineField label="Name" value={profile.overview.name} fieldKey="name" onSave={handleFieldSave} />
        <InlineField label="Website" value={profile.overview.url} fieldKey="url" onSave={handleFieldSave} />
        <InlineField label="Category" value={profile.overview.category} fieldKey="category" onSave={handleFieldSave} />
        <InlineField label="Area" value={profile.overview.area} fieldKey="area" onSave={handleFieldSave} />
      </div>

      {/* Tag clouds */}
      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-6 space-y-8">
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

      {/* Q&A History */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg text-charcoal">What Your Team Has Learned</h3>
        <QAHistory questions={questions} />
      </div>
    </div>
  )
}
