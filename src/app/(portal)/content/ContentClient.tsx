'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { TopicCard, type TopicCardProps } from '@/components/portal/TopicCard'
import { DraftCard, type DraftCardProps } from '@/components/portal/DraftCard'
import { CheckCircle2, FileText, Globe, Lightbulb, Clock, CalendarDays, HeartPulse, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import type { ContentDeliverable, PlanningDeliverable, HealthDeliverable } from './page'

interface FeedbackDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (feedback: string) => Promise<void>
  title: string
}

function FeedbackDialog({ open, onClose, onSubmit, title }: FeedbackDialogProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    await onSubmit(text.trim())
    setLoading(false)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setText('')
      onClose()
    }, 1200)
  }

  const handleClose = () => {
    setText('')
    setSuccess(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-charcoal">{title}</DialogTitle>
        </DialogHeader>
        {success ? (
          <div className="flex items-center gap-2 py-6 justify-center text-[#4A7C59]">
            <CheckCircle2 className="size-5" />
            <span className="text-sm font-medium">Feedback sent</span>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe what you'd like changed..."
              rows={4}
              className="w-full px-4 py-3 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
              autoFocus
            />
            <DialogFooter showCloseButton>
              <Button
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
                className="bg-torii text-white hover:bg-torii-dark rounded-tenkai"
              >
                {loading ? 'Sending…' : 'Send Feedback'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

type TopicItem = Omit<TopicCardProps, 'onApprove' | 'onEdit' | 'onDeny'> & { id: string }
type DraftItem = Omit<DraftCardProps, 'onApprove' | 'onRequestEdit' | 'onDeny'> & { id: string }
type PublishedItem = { id: string; title: string; date: string; seoScore: number | null; status: string; published_url: string | null }

interface ContentClientProps {
  initialTopics: TopicItem[]
  initialDrafts: DraftItem[]
  publishedPosts: PublishedItem[]
  contentDeliverables: ContentDeliverable[]
  planningDeliverables: PlanningDeliverable[]
  healthDeliverables: HealthDeliverable[]
}

/* ─── Helper: safely parse content JSON ─────────────────── */
function parseContent(content: Record<string, unknown> | string | null | undefined): Record<string, unknown> | null {
  if (!content) return null
  if (typeof content === 'object') return content as Record<string, unknown>
  try { return JSON.parse(content) } catch { return null }
}

/* ─── Severity color helper ─────────────────────────────── */
function severityColor(change: number): string {
  if (change >= 0) return 'text-[#4A7C59] bg-[#4A7C59]/10'
  if (change > -30) return 'text-[#C49A3C] bg-[#C49A3C]/10'
  return 'text-torii bg-torii/10'
}

function severityLabel(change: number): string {
  if (change >= 0) return 'Healthy'
  if (change > -30) return 'Declining'
  return 'Critical'
}

/* ─── Content Health Tab Component ──────────────────────── */
function ContentHealthTab({ healthDeliverables }: { healthDeliverables: HealthDeliverable[] }) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (healthDeliverables.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-lg font-medium text-charcoal">Content Health</h2>
          <p className="text-sm text-warm-gray mt-0.5">
            Monitor content freshness, traffic decay, and optimization opportunities
          </p>
        </div>
        <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
          <HeartPulse className="size-8 text-muted-gray mx-auto mb-3" />
          <p className="font-serif text-base font-medium text-charcoal mb-1">No content health checks yet</p>
          <p className="text-sm text-warm-gray max-w-sm mx-auto">
            Request a Content Freshness audit from your Dashboard.
          </p>
        </div>
      </div>
    )
  }

  // Try to extract structured decay data from all reports
  const decayRows: Array<{
    id: string
    url: string
    traffic: number
    change: number
    severity: string
    action: string
    recommendation: string
    reportTitle: string
  }> = []

  healthDeliverables.forEach((d) => {
    const parsed = parseContent(d.content)
    if (parsed && Array.isArray(parsed.pages)) {
      (parsed.pages as Array<Record<string, unknown>>).forEach((page, i) => {
        decayRows.push({
          id: `${d.id}-${i}`,
          url: String(page.url ?? page.page ?? '—'),
          traffic: Number(page.traffic ?? page.sessions ?? 0),
          change: Number(page.change ?? page.change_percent ?? 0),
          severity: String(page.severity ?? ''),
          action: String(page.action ?? page.recommendation ?? '—'),
          recommendation: String(page.details ?? page.full_recommendation ?? page.action ?? ''),
          reportTitle: d.title ?? 'Decay Report',
        })
      })
    }
  })

  // If we have structured data, render as table
  if (decayRows.length > 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-lg font-medium text-charcoal">Content Health</h2>
          <p className="text-sm text-warm-gray mt-0.5">
            Pages with declining traffic or freshness issues
          </p>
        </div>
        <div className="rounded-tenkai border border-tenkai-border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tenkai-border bg-parchment/50">
                <th className="text-left py-3 px-4 font-medium text-warm-gray w-8" />
                <th className="text-left py-3 px-4 font-medium text-warm-gray">Page URL</th>
                <th className="text-right py-3 px-4 font-medium text-warm-gray hidden sm:table-cell">Traffic</th>
                <th className="text-right py-3 px-4 font-medium text-warm-gray">Change (%)</th>
                <th className="text-right py-3 px-4 font-medium text-warm-gray hidden md:table-cell">Severity</th>
                <th className="text-left py-3 px-4 font-medium text-warm-gray hidden lg:table-cell">Action</th>
              </tr>
            </thead>
            <tbody>
              {decayRows.map((row) => {
                const isExpanded = expandedRows.has(row.id)
                return (
                  <>
                    <tr key={row.id} className="border-b border-tenkai-border-light group">
                      <td className="py-3 px-4">
                        {row.recommendation && row.recommendation !== row.action ? (
                          <button onClick={() => toggleRow(row.id)} className="text-warm-gray hover:text-charcoal transition-colors">
                            {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                          </button>
                        ) : (
                          <span className="size-4 block" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-charcoal max-w-xs truncate">{row.url}</td>
                      <td className="py-3 px-4 text-right text-charcoal tabular-nums hidden sm:table-cell">
                        {row.traffic.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${severityColor(row.change)}`}>
                          {row.change >= 0 ? '+' : ''}{row.change}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right hidden md:table-cell">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${severityColor(row.change)}`}>
                          {row.severity || severityLabel(row.change)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-warm-gray hidden lg:table-cell max-w-xs truncate">{row.action}</td>
                    </tr>
                    {isExpanded && row.recommendation && row.recommendation !== row.action && (
                      <tr key={`${row.id}-expanded`} className="border-b border-tenkai-border-light">
                        <td colSpan={6} className="px-4 pb-4 pt-0">
                          <div className="bg-parchment/50 rounded-tenkai p-4">
                            <p className="text-sm text-charcoal font-medium mb-1">Full Recommendation</p>
                            <p className="text-sm text-warm-gray leading-relaxed">{row.recommendation}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Fallback: card display for non-structured data
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-lg font-medium text-charcoal">Content Health</h2>
        <p className="text-sm text-warm-gray mt-0.5">
          Content decay reports and freshness analysis
        </p>
      </div>
      <div className="space-y-3">
        {healthDeliverables.map((d) => (
          <div key={d.id} className="bg-white rounded-tenkai border border-tenkai-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="size-4 text-torii" />
              <span className="font-medium text-charcoal">{d.title ?? 'Decay Report'}</span>
              {d.score != null && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  d.score >= 80 ? 'bg-[#4A7C59]/10 text-[#4A7C59]' : d.score >= 50 ? 'bg-[#C49A3C]/10 text-[#C49A3C]' : 'bg-torii/10 text-torii'
                }`}>
                  Score: {d.score}/100
                </span>
              )}
            </div>
            {d.summary && <p className="text-sm text-warm-gray leading-relaxed">{d.summary}</p>}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-tenkai-border-light">
              {d.agent_name && <span className="text-xs text-muted-gray">By {d.agent_name}</span>}
              <span className="text-xs text-muted-gray">
                {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ContentClient({ initialTopics, initialDrafts, publishedPosts, contentDeliverables, planningDeliverables, healthDeliverables }: ContentClientProps) {
  const [topics, setTopics] = useState(initialTopics)
  const [drafts, setDrafts] = useState(initialDrafts)
  const [topicFeedbackId, setTopicFeedbackId] = useState<string | null>(null)
  const [draftFeedbackId, setDraftFeedbackId] = useState<string | null>(null)
  const [errorToast, setErrorToast] = useState<string | null>(null)

  useEffect(() => {
    if (errorToast) {
      const t = setTimeout(() => setErrorToast(null), 5000)
      return () => clearTimeout(t)
    }
  }, [errorToast])

  const handleTopicApprove = async (id: string) => {
    const prev = topics.find((t) => t.id === id)
    setTopics((ts) => ts.map((t) => t.id === id ? { ...t, status: 'approved' as const } : t))
    try {
      const res = await fetch(`/api/content/${id}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error()
    } catch {
      setTopics((ts) => ts.map((t) => t.id === id ? { ...t, status: prev?.status ?? 'pending' } : t))
      setErrorToast('Failed to approve topic. Please try again.')
    }
  }

  const handleTopicDeny = async (id: string) => {
    const prev = topics.find((t) => t.id === id)
    setTopics((ts) => ts.map((t) => t.id === id ? { ...t, status: 'denied' as const } : t))
    try {
      const res = await fetch(`/api/content/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Denied by client' }) })
      if (!res.ok) throw new Error()
    } catch {
      setTopics((ts) => ts.map((t) => t.id === id ? { ...t, status: prev?.status ?? 'pending' } : t))
      setErrorToast('Failed to deny topic. Please try again.')
    }
  }

  const handleApproveAll = async () => {
    const pendingTopics = topics.filter((t) => t.status === 'pending')
    const pendingIds = pendingTopics.map((t) => t.id)
    setTopics((ts) => ts.map((t) => t.status === 'pending' ? { ...t, status: 'approved' as const } : t))
    const results = await Promise.allSettled(pendingIds.map((id) => fetch(`/api/content/${id}/approve`, { method: 'POST' }).then((r) => { if (!r.ok) throw new Error(id); return id })))
    const failedIds = new Set(results.filter((r): r is PromiseRejectedResult => r.status === 'rejected').map((r) => String(r.reason?.message ?? '')))
    if (failedIds.size > 0) {
      setTopics((ts) => ts.map((t) => failedIds.has(t.id) ? { ...t, status: 'pending' as const } : t))
      setErrorToast(`${failedIds.size} topic(s) failed to approve. Please try again.`)
    }
  }

  const handleDraftApprove = async (id: string) => {
    const draft = drafts.find((d) => d.id === id)
    setDrafts((ds) => ds.filter((d) => d.id !== id))
    try {
      const res = await fetch(`/api/content/${id}/approve`, { method: 'POST' })
      if (!res.ok) throw new Error()
    } catch {
      if (draft) setDrafts((ds) => [draft, ...ds])
      setErrorToast('Failed to approve draft. Please try again.')
    }
  }

  const handleDraftDeny = async (id: string) => {
    const draft = drafts.find((d) => d.id === id)
    setDrafts((ds) => ds.filter((d) => d.id !== id))
    try {
      const res = await fetch(`/api/content/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Denied by client' }) })
      if (!res.ok) throw new Error()
    } catch {
      if (draft) setDrafts((ds) => [draft, ...ds])
      setErrorToast('Failed to deny draft. Please try again.')
    }
  }

  const handleTopicFeedback = async (id: string, feedback: string) => {
    await fetch(`/api/content/${id}/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback }) })
  }

  const handleDraftFeedback = async (id: string, feedback: string) => {
    await fetch(`/api/content/${id}/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback }) })
  }

  const pendingCount = topics.filter((t) => t.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Content Approval</h1>
        <p className="text-sm text-warm-gray mt-1">
          Review and approve content before it goes live
        </p>
      </div>

      <Tabs defaultValue="topics">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="topics" className="gap-1.5">
            <FileText className="size-3.5" />
            Topics
            {pendingCount > 0 && (
              <span className="ml-1 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-1.5">
            <CheckCircle2 className="size-3.5" />
            Drafts
            {drafts.length > 0 && (
              <span className="ml-1 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
                {drafts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-1.5">
            <Globe className="size-3.5" />
            Published
          </TabsTrigger>
          <TabsTrigger value="briefs" className="gap-1.5">
            <Lightbulb className="size-3.5" />
            Briefs &amp; Research
            {contentDeliverables.length > 0 && (
              <span className="ml-1 rounded-full bg-[#5B7B9A]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B7B9A]">
                {contentDeliverables.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="planning" className="gap-1.5">
            <CalendarDays className="size-3.5" />
            Planning
            {planningDeliverables.length > 0 && (
              <span className="ml-1 rounded-full bg-[#5B7B9A]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B7B9A]">
                {planningDeliverables.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5">
            <HeartPulse className="size-3.5" />
            Content Health
            {healthDeliverables.length > 0 && (
              <span className="ml-1 rounded-full bg-[#5B7B9A]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B7B9A]">
                {healthDeliverables.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Topics Tab ─────────────────────────────────────── */}
        <TabsContent value="topics">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-lg font-medium text-charcoal">
                  Blog Topics for Review
                </h2>
                <p className="text-sm text-warm-gray mt-0.5">
                  Haruki generated these based on your keywords, competitor gaps, and trending questions
                </p>
              </div>
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  className="bg-torii hover:bg-torii-dark text-white shrink-0"
                  onClick={handleApproveAll}
                >
                  Approve All ({pendingCount})
                </Button>
              )}
            </div>

            {topics.length === 0 ? (
              <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
                <FileText className="size-8 text-muted-gray mx-auto mb-3" />
                <p className="font-serif text-base font-medium text-charcoal mb-1">No topics yet</p>
                <p className="text-sm text-warm-gray max-w-sm mx-auto">
                  Your Tenkai team will start creating content after onboarding is complete.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    title={topic.title}
                    keywords={topic.keywords}
                    difficulty={topic.difficulty}
                    volume={topic.volume}
                    status={topic.status}
                    onApprove={() => handleTopicApprove(topic.id)}
                    onDeny={() => handleTopicDeny(topic.id)}
                    onEdit={() => setTopicFeedbackId(topic.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Drafts Tab ─────────────────────────────────────── */}
        <TabsContent value="drafts">
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-charcoal">
                Drafts Ready for Approval
              </h2>
              <p className="text-sm text-warm-gray mt-0.5">
                These posts have passed internal review and are ready for your final sign-off
              </p>
            </div>

            {drafts.length === 0 ? (
              <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
                <CheckCircle2 className="size-8 text-muted-gray mx-auto mb-3" />
                <p className="font-serif text-base font-medium text-charcoal mb-1">No drafts pending</p>
                <p className="text-sm text-warm-gray max-w-sm mx-auto">
                  Your Tenkai team will submit drafts for your review once topics are approved.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {drafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    title={draft.title}
                    author={draft.author}
                    wordCount={draft.wordCount}
                    readingTime={draft.readingTime}
                    seoScore={draft.seoScore}
                    aiScore={draft.aiScore}
                    eeatStatus={draft.eeatStatus}
                    excerpt={draft.excerpt}
                    fullContent={draft.fullContent}
                    checklist={draft.checklist}
                    onApprove={() => handleDraftApprove(draft.id)}
                    onRequestEdit={() => setDraftFeedbackId(draft.id)}
                    onDeny={() => handleDraftDeny(draft.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Published Tab ──────────────────────────────────── */}
        <TabsContent value="published">
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-charcoal">
                Published Content
              </h2>
              <p className="text-sm text-warm-gray mt-0.5">
                All published posts and their performance
              </p>
            </div>

            {publishedPosts.length === 0 ? (
              <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
                <Globe className="size-8 text-muted-gray mx-auto mb-3" />
                <p className="font-serif text-base font-medium text-charcoal mb-1">No published content yet</p>
                <p className="text-sm text-warm-gray max-w-sm mx-auto">
                  Your Tenkai team will start creating content after onboarding is complete.
                </p>
              </div>
            ) : (
              <>
              <div className="rounded-tenkai border border-[#C49A3C]/20 bg-[#C49A3C]/5 px-4 py-3 mb-4 flex items-start gap-2">
                <span className="text-sm">📊</span>
                <p className="text-xs text-[#C49A3C]">
                  Traffic and ranking data will appear here once your Google Search Console is connected.{' '}
                  <a href="/integrations" className="underline hover:text-[#C49A3C]/80">Set up integrations →</a>
                </p>
              </div>
              <div className="rounded-tenkai border border-tenkai-border bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-tenkai-border bg-parchment/50">
                      <th className="text-left py-3 px-4 font-medium text-warm-gray">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-gray">Published</th>
                      <th className="text-right py-3 px-4 font-medium text-warm-gray">SEO Score</th>
                      <th className="text-right py-3 px-4 font-medium text-warm-gray">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publishedPosts.map((post) => (
                      <tr key={post.id} className="border-b border-tenkai-border-light last:border-none hover:bg-parchment/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-charcoal">
                          {post.published_url ? (
                            <a href={post.published_url} target="_blank" rel="noopener noreferrer" className="hover:text-torii transition-colors">
                              {post.title}
                            </a>
                          ) : post.title}
                        </td>
                        <td className="py-3 px-4 text-warm-gray">{post.date}</td>
                        <td className="py-3 px-4 text-right">
                          {post.seoScore != null ? (
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              post.seoScore >= 90
                                ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                                : post.seoScore >= 70
                                  ? 'bg-[#C49A3C]/10 text-[#C49A3C]'
                                  : 'bg-torii/10 text-torii'
                            }`}>
                              {post.seoScore}/100
                            </span>
                          ) : (
                            <span className="text-muted-gray text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#4A7C59]/10 px-2 py-0.5 text-xs font-medium text-[#4A7C59]">
                            <span className="size-1.5 rounded-full bg-[#4A7C59]" />
                            {post.status === 'published' ? 'Live' : 'Approved'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        </TabsContent>
        {/* ─── Briefs & Research Tab ───────────────────────────── */}
        <TabsContent value="briefs">
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-charcoal">
                Briefs &amp; Research
              </h2>
              <p className="text-sm text-warm-gray mt-0.5">
                Content briefs, keyword research, and other deliverables from your Tenkai team
              </p>
            </div>

            {contentDeliverables.length === 0 ? (
              <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
                <Lightbulb className="size-8 text-muted-gray mx-auto mb-3" />
                <p className="font-serif text-base font-medium text-charcoal mb-1">No briefs or research yet</p>
                <p className="text-sm text-warm-gray max-w-sm mx-auto">
                  Request a content brief or keyword research from the dashboard to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {contentDeliverables.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-start gap-4 rounded-tenkai border border-tenkai-border bg-white p-4"
                  >
                    <div className="flex items-center justify-center size-8 rounded-full bg-parchment shrink-0">
                      {d.status === 'completed' ? (
                        <CheckCircle2 className="size-4 text-[#4A7C59]" />
                      ) : (
                        <Clock className="size-4 text-[#C49A3C]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-charcoal">{d.title ?? 'Untitled'}</span>
                        <span className="rounded-full bg-parchment px-2 py-0.5 text-[10px] font-medium text-charcoal">
                          {(d.deliverable_type ?? 'other').replace(/_/g, ' ')}
                        </span>
                        {d.score != null && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            d.score >= 80
                              ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                              : d.score >= 50
                                ? 'bg-[#C49A3C]/10 text-[#C49A3C]'
                                : 'bg-torii/10 text-torii'
                          }`}>
                            Score: {d.score}/100
                          </span>
                        )}
                      </div>
                      {d.summary && (
                        <p className="text-sm text-warm-gray leading-relaxed">{d.summary}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {d.agent_name && (
                          <span className="text-xs text-muted-gray">By {d.agent_name}</span>
                        )}
                        <span className="text-xs text-muted-gray">
                          {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Planning Tab ──────────────────────────────────────── */}
        <TabsContent value="planning">
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-lg font-medium text-charcoal">Content Planning</h2>
              <p className="text-sm text-warm-gray mt-0.5">
                Content calendars, topic strategies, and cluster maps from your Tenkai team
              </p>
            </div>

            {planningDeliverables.length === 0 ? (
              <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
                <CalendarDays className="size-8 text-muted-gray mx-auto mb-3" />
                <p className="font-serif text-base font-medium text-charcoal mb-1">No content plans yet</p>
                <p className="text-sm text-warm-gray max-w-sm mx-auto">
                  Request a Content Calendar or Topic Strategy Map from your Dashboard.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Content Plans — timeline/list view */}
                {(() => {
                  const plans = planningDeliverables.filter((d) => d.deliverable_type === 'content_plan')
                  if (plans.length === 0) return null
                  return (
                    <div className="space-y-3">
                      <h3 className="font-serif text-base font-medium text-charcoal">Content Calendar</h3>
                      <div className="rounded-tenkai border border-tenkai-border bg-white overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-tenkai-border bg-parchment/50">
                              <th className="text-left py-3 px-4 font-medium text-warm-gray">Date</th>
                              <th className="text-left py-3 px-4 font-medium text-warm-gray">Title</th>
                              <th className="text-left py-3 px-4 font-medium text-warm-gray hidden sm:table-cell">Target Keyword</th>
                              <th className="text-right py-3 px-4 font-medium text-warm-gray">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {plans.map((plan) => {
                              const parsed = parseContent(plan.content)
                              const keyword = parsed?.target_keyword as string ?? parsed?.keyword as string ?? '—'
                              return (
                                <tr key={plan.id} className="border-b border-tenkai-border-light last:border-none hover:bg-parchment/30 transition-colors">
                                  <td className="py-3 px-4 text-warm-gray whitespace-nowrap">
                                    {new Date(plan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </td>
                                  <td className="py-3 px-4 font-medium text-charcoal">{plan.title ?? 'Untitled'}</td>
                                  <td className="py-3 px-4 text-warm-gray hidden sm:table-cell">{keyword}</td>
                                  <td className="py-3 px-4 text-right">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                      plan.status === 'completed'
                                        ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                                        : plan.status === 'in_progress'
                                          ? 'bg-[#C49A3C]/10 text-[#C49A3C]'
                                          : 'bg-parchment text-charcoal'
                                    }`}>
                                      {(plan.status ?? 'pending').replace(/_/g, ' ')}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })()}

                {/* Cluster Maps — card grid */}
                {(() => {
                  const clusters = planningDeliverables.filter((d) => d.deliverable_type === 'cluster_map')
                  if (clusters.length === 0) return null
                  return (
                    <div className="space-y-3">
                      <h3 className="font-serif text-base font-medium text-charcoal">Topic Clusters</h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {clusters.map((cluster) => {
                          const parsed = parseContent(cluster.content)
                          const pillar = parsed?.pillar_topic as string ?? parsed?.pillar as string ?? cluster.title ?? 'Untitled'
                          const supporting = Array.isArray(parsed?.supporting_topics) ? parsed.supporting_topics as string[] : []
                          return (
                            <div key={cluster.id} className="bg-white rounded-tenkai border border-tenkai-border p-6">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="size-2 rounded-full bg-torii shrink-0" />
                                <h4 className="font-serif text-base font-medium text-charcoal">{pillar}</h4>
                              </div>
                              {cluster.summary && (
                                <p className="text-sm text-warm-gray mb-3">{cluster.summary}</p>
                              )}
                              {supporting.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {supporting.map((topic, i) => (
                                    <span key={i} className="rounded-full bg-parchment px-2.5 py-1 text-xs text-charcoal">
                                      {String(topic)}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-tenkai-border-light">
                                {cluster.score != null && (
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    cluster.score >= 80 ? 'bg-[#4A7C59]/10 text-[#4A7C59]' : cluster.score >= 50 ? 'bg-[#C49A3C]/10 text-[#C49A3C]' : 'bg-torii/10 text-torii'
                                  }`}>
                                    Score: {cluster.score}/100
                                  </span>
                                )}
                                <span className="text-xs text-muted-gray">
                                  {new Date(cluster.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Content Health Tab ────────────────────────────────── */}
        <TabsContent value="health">
          <ContentHealthTab healthDeliverables={healthDeliverables} />
        </TabsContent>
      </Tabs>

      {/* Topic feedback dialog */}
      <FeedbackDialog
        open={topicFeedbackId !== null}
        onClose={() => setTopicFeedbackId(null)}
        onSubmit={(feedback) => handleTopicFeedback(topicFeedbackId!, feedback)}
        title="Request Changes to Topic"
      />

      {/* Draft feedback dialog */}
      <FeedbackDialog
        open={draftFeedbackId !== null}
        onClose={() => setDraftFeedbackId(null)}
        onSubmit={(feedback) => handleDraftFeedback(draftFeedbackId!, feedback)}
        title="Request Edit on Draft"
      />

      {/* Error toast */}
      {errorToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <div className="rounded-tenkai border px-4 py-3 shadow-lg text-sm font-medium flex items-center gap-2 bg-red-50 border-red-200 text-red-700">
            <AlertCircle className="size-4" />
            {errorToast}
            <button onClick={() => setErrorToast(null)} className="ml-2 text-current opacity-60 hover:opacity-100">&times;</button>
          </div>
        </div>
      )}
    </div>
  )
}
