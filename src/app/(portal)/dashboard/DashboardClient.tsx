'use client'

import { useState, useCallback } from 'react'
import { agents } from '@/lib/design-system'
import { StatCard } from '@/components/portal/StatCard'
import { ActivityItem } from '@/components/portal/ActivityItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  FileText,
  Target,
  TrendingUp,
  Zap,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { SERVICE_CATEGORIES, QUICK_ACTIONS, ALL_SERVICES } from '@/lib/service-categories'
import type { ActivityPost, PendingApproval, DashboardStats, Deliverable } from './page'

const agentMap = Object.fromEntries(agents.map((a) => [a.name, a]))

// Fallback agent for unknown agent_name values
const defaultAgent = { name: 'Tenkai', role: 'AI Agent', icon: '🤖' }

type DateFilter = 'today' | 'week' | 'month'

interface ClientRecord {
  id: string
  company_name?: string | null
  website_url?: string | null
}

interface DashboardClientProps {
  client: ClientRecord | null
  userName: string | null
  pendingApprovals: PendingApproval[]
  activityPosts: ActivityPost[]
  stats: DashboardStats
  recentDeliverables: Deliverable[]
}


function deliverableStatusIcon(status: string | null) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="size-4 text-[#4A7C59]" />
    case 'pending':
    case 'in_progress':
      return <Clock className="size-4 text-[#C49A3C]" />
    case 'failed':
      return <AlertCircle className="size-4 text-torii" />
    default:
      return <Clock className="size-4 text-warm-gray" />
  }
}

function deliverableStatusLabel(status: string | null) {
  switch (status) {
    case 'completed': return 'Completed'
    case 'pending': return 'Pending'
    case 'in_progress': return 'In Progress'
    case 'failed': return 'Failed'
    default: return status ?? 'Unknown'
  }
}

function getDateThreshold(filter: DateFilter): Date {
  const now = new Date()
  if (filter === 'today') {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    return d
  }
  if (filter === 'week') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return d
  }
  // month
  const d = new Date(now)
  d.setDate(d.getDate() - 30)
  return d
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays}d ago`
}

function getActivityAction(post: ActivityPost): string {
  const type = post.content_type ?? 'content'
  const title = post.title ?? 'Untitled'
  if (post.status === 'draft' || post.status === 'pending_review') {
    return `Drafted "${title}" — ready for your review`
  }
  if (post.status === 'published') {
    return `Published "${title}"`
  }
  if (post.status === 'approved') {
    return `"${title}" was approved and queued for publishing`
  }
  if (post.status === 'rejected') {
    return `"${title}" was sent back for revisions`
  }
  return `Created ${type}: "${title}"`
}

export default function DashboardClient({
  client,
  userName,
  pendingApprovals,
  activityPosts,
  stats,
  recentDeliverables,
}: DashboardClientProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  // Track which approvals have been acted on (optimistic UI)
  const [resolvedApprovals, setResolvedApprovals] = useState<Set<string>>(new Set())
  // Track which activity posts have been acted on (optimistic UI)
  const [resolvedPosts, setResolvedPosts] = useState<Set<string>>(new Set())
  // Feedback dialog state
  const [feedbackTarget, setFeedbackTarget] = useState<{ id: string; title: string } | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  // Service request dialog state
  const [serviceDialog, setServiceDialog] = useState<{ key: string; label: string } | null>(null)
  const [serviceUrl, setServiceUrl] = useState(client?.website_url ?? '')
  const [serviceLoading, setServiceLoading] = useState(false)
  const [serviceSuccess, setServiceSuccess] = useState<string | null>(null)

  // Deliverable detail dialog
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null)

  // Deliverables list (supports refresh after new request)
  const [deliverables, setDeliverables] = useState<Deliverable[]>(recentDeliverables)

  const displayName = client?.company_name || userName || null

  // Filter activity posts by date
  const threshold = getDateThreshold(dateFilter)
  const filteredPosts = activityPosts.filter(
    (p) => new Date(p.created_at) >= threshold && !resolvedPosts.has(p.id)
  )

  const handleApprovePost = useCallback(async (postId: string) => {
    // Optimistic update
    setResolvedPosts((prev) => new Set(prev).add(postId))
    try {
      const res = await fetch(`/api/content/${postId}/approve`, { method: 'POST' })
      if (!res.ok) {
        // Rollback
        setResolvedPosts((prev) => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })
      }
    } catch {
      setResolvedPosts((prev) => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }, [])

  const handleRejectPost = useCallback(async (postId: string) => {
    setResolvedPosts((prev) => new Set(prev).add(postId))
    try {
      const res = await fetch(`/api/content/${postId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '' }),
      })
      if (!res.ok) {
        setResolvedPosts((prev) => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })
      }
    } catch {
      setResolvedPosts((prev) => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }
  }, [])

  const handleApproveApproval = useCallback(async (approval: PendingApproval) => {
    const postId = approval.content_post_id
    if (!postId) return
    setResolvedApprovals((prev) => new Set(prev).add(approval.id))
    try {
      const res = await fetch(`/api/content/${postId}/approve`, { method: 'POST' })
      if (!res.ok) {
        setResolvedApprovals((prev) => {
          const next = new Set(prev)
          next.delete(approval.id)
          return next
        })
      }
    } catch {
      setResolvedApprovals((prev) => {
        const next = new Set(prev)
        next.delete(approval.id)
        return next
      })
    }
  }, [])

  const handleRejectApproval = useCallback(async (approval: PendingApproval) => {
    const postId = approval.content_post_id
    if (!postId) return
    setResolvedApprovals((prev) => new Set(prev).add(approval.id))
    try {
      const res = await fetch(`/api/content/${postId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '' }),
      })
      if (!res.ok) {
        setResolvedApprovals((prev) => {
          const next = new Set(prev)
          next.delete(approval.id)
          return next
        })
      }
    } catch {
      setResolvedApprovals((prev) => {
        const next = new Set(prev)
        next.delete(approval.id)
        return next
      })
    }
  }, [])

  const handleFeedbackSubmit = useCallback(async () => {
    if (!feedbackTarget || !feedbackText.trim()) return
    setFeedbackLoading(true)
    try {
      await fetch(`/api/content/${feedbackTarget.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackText.trim() }),
      })
    } finally {
      setFeedbackLoading(false)
      setFeedbackText('')
      setFeedbackTarget(null)
    }
  }, [feedbackTarget, feedbackText])

  const refreshDeliverables = useCallback(async () => {
    try {
      const res = await fetch('/api/services/deliverables?limit=10')
      if (res.ok) {
        const data = await res.json()
        setDeliverables(data.deliverables ?? [])
      }
    } catch {
      // silent fail — deliverables will refresh on next page load
    }
  }, [])

  const handleServiceRequest = useCallback(async () => {
    if (!serviceDialog || !serviceUrl.trim()) return
    setServiceLoading(true)
    try {
      const res = await fetch('/api/services/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: serviceDialog.key,
          target_url: serviceUrl.trim(),
        }),
      })
      if (res.ok) {
        setServiceSuccess(`${serviceDialog.label} request submitted successfully!`)
        setServiceDialog(null)
        setServiceUrl(client?.website_url ?? '')
        // Auto-refresh deliverables after a short delay
        setTimeout(() => refreshDeliverables(), 2000)
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setServiceSuccess(`Error: ${err.error ?? 'Request failed'}`)
      }
    } catch {
      setServiceSuccess('Error: Network request failed')
    } finally {
      setServiceLoading(false)
    }
  }, [serviceDialog, serviceUrl, client?.website_url, refreshDeliverables])

  const visibleApprovals = pendingApprovals.filter((a) => !resolvedApprovals.has(a.id))

  // Build stats cards from real data
  const statsCards = [
    {
      label: 'Total Content',
      value: String(stats.totalContent),
      trend: 'up' as const,
      trendValue: `${stats.publishedContent} published`,
      icon: <FileText className="size-4" />,
    },
    {
      label: 'Pending Approvals',
      value: String(stats.pendingApprovals),
      trend: stats.pendingApprovals > 0 ? ('down' as const) : ('up' as const),
      trendValue: stats.pendingApprovals > 0 ? 'needs review' : 'all clear',
      icon: <Target className="size-4" />,
    },
    {
      label: 'SEO Audit Score',
      value: stats.auditScore != null ? `${stats.auditScore}/100` : '—',
      trend: 'up' as const,
      trendValue: stats.auditScore != null ? 'latest score' : 'no audit yet',
      icon: <Search className="size-4" />,
    },
    {
      label: 'Published Content',
      value: String(stats.publishedContent),
      trend: 'up' as const,
      trendValue: 'live pages',
      icon: <TrendingUp className="size-4" />,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Quick Stats */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Activity Feed — 2/3 width */}
        <section className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg text-charcoal">
                {displayName
                  ? `What your Tenkai team did ${dateFilter === 'today' ? 'today' : dateFilter === 'week' ? 'this week' : 'this month'} for ${displayName}`
                  : `What your Tenkai team did ${dateFilter === 'today' ? 'today' : dateFilter === 'week' ? 'this week' : 'this month'}`}
              </h2>
              <p className="text-warm-gray text-sm mt-0.5">
                Real-time updates from your AI SEO team
              </p>
            </div>
            <div className="flex items-center bg-cream rounded-tenkai border border-tenkai-border p-0.5">
              {(['today', 'week', 'month'] as DateFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-3 py-1.5 rounded-[0.5rem] text-xs font-medium transition-colors capitalize ${
                    dateFilter === filter
                      ? 'bg-white text-charcoal shadow-sm'
                      : 'text-warm-gray hover:text-charcoal'
                  }`}
                >
                  {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'Today'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredPosts.length === 0 ? (
              <div className="bg-cream rounded-tenkai border border-tenkai-border p-8 text-center">
                <p className="text-warm-gray text-sm">No activity for this time period yet.</p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const agentName = post.agent_name ?? ''
                const agent = agentMap[agentName] ?? { ...defaultAgent, name: agentName || 'Agent' }
                const needsApproval = post.needs_approval
                return (
                  <ActivityItem
                    key={post.id}
                    agentName={agent.name}
                    agentIcon={agent.icon}
                    agentRole={agent.role}
                    action={getActivityAction(post)}
                    timestamp={formatTimestamp(post.created_at)}
                    needsAction={needsApproval}
                    actionType={needsApproval ? 'approve' : undefined}
                    onApprove={needsApproval ? () => handleApprovePost(post.id) : undefined}
                    onDeny={needsApproval ? () => handleRejectPost(post.id) : undefined}
                    onEdit={needsApproval ? () => setFeedbackTarget({ id: post.id, title: post.title ?? 'Untitled' }) : undefined}
                  />
                )
              })
            )}
          </div>
        </section>

        {/* Pending Approvals — 1/3 width */}
        <section className="space-y-4">
          <div>
            <h2 className="font-serif text-lg text-charcoal">Pending Approvals</h2>
            <p className="text-warm-gray text-sm mt-0.5">Items waiting for your review</p>
          </div>

          <div className="space-y-4">
            {visibleApprovals.length === 0 ? (
              <div className="bg-white rounded-tenkai border border-tenkai-border p-6 text-center">
                <p className="text-warm-gray text-sm">Nothing pending — you&apos;re all caught up.</p>
              </div>
            ) : (
              visibleApprovals.map((approval) => (
                <div key={approval.id} className="bg-white rounded-tenkai border border-tenkai-border p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">✍️</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-charcoal leading-snug">
                        {approval.title || 'Untitled'}
                      </h3>
                      <p className="text-warm-gray text-xs mt-1">
                        {approval.type || 'Content'} &middot; by {approval.agent_name || 'Agent'}
                      </p>
                      {approval.description && (
                        <p className="text-charcoal/70 text-xs mt-2 leading-relaxed">
                          {approval.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleApproveApproval(approval)}
                      disabled={!approval.content_post_id}
                      className="bg-torii text-white hover:bg-torii-dark flex-1 text-xs h-8 rounded-tenkai"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="text-charcoal border-tenkai-border flex-1 text-xs h-8 rounded-tenkai hover:bg-parchment"
                      onClick={() => setFeedbackTarget({
                        id: approval.content_post_id ?? approval.id,
                        title: approval.title ?? 'Untitled',
                      })}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleRejectApproval(approval)}
                      disabled={!approval.content_post_id}
                      variant="outline"
                      className="text-warm-gray border-tenkai-border text-xs h-8 px-3 rounded-tenkai hover:bg-parchment"
                    >
                      Deny
                    </Button>
                  </div>
                </div>
              ))
            )}

            {/* Summary note */}
            <div className="bg-parchment/50 rounded-tenkai px-4 py-3 text-center">
              <p className="text-warm-gray text-xs">
                <span className="font-semibold text-torii">
                  {visibleApprovals.length} item{visibleApprovals.length !== 1 ? 's' : ''}
                </span>{' '}
                waiting for your review
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ─── Request a Service ────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-torii" />
            <h2 className="font-serif text-lg text-charcoal">Request a Service</h2>
          </div>
          <p className="text-warm-gray text-sm mt-0.5">
            Kick off a new task for your Tenkai team
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg text-charcoal">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((key) => {
              const svc = ALL_SERVICES.find((s) => s.key === key)!
              return (
                <button
                  key={key}
                  onClick={() => {
                    setServiceDialog({ key, label: svc.label })
                    setServiceUrl(client?.website_url ?? '')
                  }}
                  className="flex flex-col items-start gap-2 p-4 rounded-tenkai border border-tenkai-border hover:border-torii/30 hover:bg-parchment/50 transition-colors text-left"
                >
                  <span className="text-2xl">{svc.icon}</span>
                  <span className="text-sm font-medium text-charcoal">{svc.label}</span>
                  <span className="text-xs text-warm-gray">{svc.description}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* All Services — collapsible categories */}
        <div className="space-y-3 mt-8">
          <h3 className="font-serif text-lg text-charcoal">All Services</h3>
          {SERVICE_CATEGORIES.map((cat) => {
            const CatIcon = cat.icon
            return (
              <details key={cat.label} className="group border border-tenkai-border rounded-tenkai overflow-hidden">
                <summary className="flex items-center gap-2.5 cursor-pointer px-4 py-3 bg-parchment/30 hover:bg-parchment/60 transition-colors">
                  <CatIcon className={`size-4 ${cat.color}`} />
                  <span className="text-sm font-medium text-charcoal">{cat.label}</span>
                  <span className="text-xs text-warm-gray">({cat.services.length})</span>
                  <ChevronDown className="size-4 ml-auto text-warm-gray transition-transform group-open:rotate-180" />
                </summary>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3">
                  {cat.services.map((svc) => (
                    <button
                      key={svc.key}
                      onClick={() => {
                        setServiceDialog({ key: svc.key, label: svc.label })
                        setServiceUrl(client?.website_url ?? '')
                      }}
                      className="flex items-start gap-2 p-3 rounded-tenkai border border-tenkai-border-light hover:border-torii/20 hover:bg-parchment/30 transition-colors text-left"
                    >
                      <span className="text-lg flex-shrink-0">{svc.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-charcoal truncate">{svc.label}</div>
                        <div className="text-[10px] text-warm-gray line-clamp-2">{svc.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </details>
            )
          })}
        </div>
      </section>

      {/* ─── Recent Deliverables ──────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-charcoal">Recent Deliverables</h2>
            <p className="text-warm-gray text-sm mt-0.5">
              Latest results from your Tenkai team
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDeliverables}
            className="text-xs border-tenkai-border text-warm-gray hover:text-charcoal rounded-tenkai"
          >
            Refresh
          </Button>
        </div>

        {deliverables.length === 0 ? (
          <div className="bg-cream rounded-tenkai border border-tenkai-border p-8 text-center">
            <p className="text-warm-gray text-sm">No deliverables yet. Request a service above to get started.</p>
          </div>
        ) : (
          <div className="rounded-tenkai border border-tenkai-border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tenkai-border bg-parchment/50">
                  <th className="text-left py-3 px-4 font-medium text-warm-gray">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-warm-gray hidden sm:table-cell">Agent</th>
                  <th className="text-left py-3 px-4 font-medium text-warm-gray hidden md:table-cell">Type</th>
                  <th className="text-right py-3 px-4 font-medium text-warm-gray">Score</th>
                  <th className="text-right py-3 px-4 font-medium text-warm-gray">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-warm-gray"></th>
                </tr>
              </thead>
              <tbody>
                {deliverables.map((d) => (
                  <tr key={d.id} className="border-b border-tenkai-border-light last:border-none hover:bg-parchment/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-charcoal">
                      {d.title ?? 'Untitled'}
                    </td>
                    <td className="py-3 px-4 text-warm-gray hidden sm:table-cell">
                      {d.agent_name ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-warm-gray hidden md:table-cell">
                      <span className="inline-flex rounded-full bg-parchment px-2 py-0.5 text-[10px] font-medium text-charcoal">
                        {(d.deliverable_type ?? 'other').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {d.score != null ? (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          d.score >= 80
                            ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                            : d.score >= 50
                              ? 'bg-[#C49A3C]/10 text-[#C49A3C]'
                              : 'bg-torii/10 text-torii'
                        }`}>
                          {d.score}/100
                        </span>
                      ) : (
                        <span className="text-muted-gray text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5">
                        {deliverableStatusIcon(d.status)}
                        <span className="text-xs text-warm-gray">{deliverableStatusLabel(d.status)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedDeliverable(d)}
                        className="inline-flex items-center gap-1 text-xs text-torii hover:text-torii-dark transition-colors"
                      >
                        <Eye className="size-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Feedback dialog */}
      <Dialog open={feedbackTarget !== null} onOpenChange={(o) => { if (!o) { setFeedbackTarget(null); setFeedbackText('') } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-charcoal">
              Request Changes: {feedbackTarget?.title}
            </DialogTitle>
          </DialogHeader>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Describe what you'd like changed..."
            rows={4}
            className="w-full px-4 py-3 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
            autoFocus
          />
          <DialogFooter showCloseButton>
            <Button
              onClick={handleFeedbackSubmit}
              disabled={feedbackLoading || !feedbackText.trim()}
              className="bg-torii text-white hover:bg-torii-dark rounded-tenkai"
            >
              {feedbackLoading ? 'Sending…' : 'Send Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service request dialog */}
      <Dialog open={serviceDialog !== null} onOpenChange={(o) => { if (!o) { setServiceDialog(null); setServiceLoading(false) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-charcoal">
              {serviceDialog?.label}
            </DialogTitle>
            <DialogDescription>
              Enter the target URL for this service request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm font-medium text-charcoal">Target URL</label>
            <Input
              value={serviceUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceUrl(e.target.value)}
              placeholder="https://example.com"
              className="border-tenkai-border rounded-tenkai"
            />
          </div>
          <DialogFooter showCloseButton>
            <Button
              onClick={handleServiceRequest}
              disabled={serviceLoading || !serviceUrl.trim()}
              className="bg-torii text-white hover:bg-torii-dark rounded-tenkai"
            >
              {serviceLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1.5" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deliverable detail dialog */}
      <Dialog open={selectedDeliverable !== null} onOpenChange={(o) => { if (!o) setSelectedDeliverable(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-charcoal">
              {selectedDeliverable?.title ?? 'Deliverable Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedDeliverable && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-warm-gray text-xs">Agent</span>
                  <p className="font-medium text-charcoal">{selectedDeliverable.agent_name ?? '—'}</p>
                </div>
                <div>
                  <span className="text-warm-gray text-xs">Type</span>
                  <p className="font-medium text-charcoal">{(selectedDeliverable.deliverable_type ?? 'other').replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <span className="text-warm-gray text-xs">Score</span>
                  <p className="font-medium text-charcoal">{selectedDeliverable.score != null ? `${selectedDeliverable.score}/100` : '—'}</p>
                </div>
                <div>
                  <span className="text-warm-gray text-xs">Status</span>
                  <p className="font-medium text-charcoal flex items-center gap-1.5">
                    {deliverableStatusIcon(selectedDeliverable.status)}
                    {deliverableStatusLabel(selectedDeliverable.status)}
                  </p>
                </div>
              </div>
              {selectedDeliverable.summary && (
                <div>
                  <span className="text-warm-gray text-xs">Summary</span>
                  <p className="text-charcoal leading-relaxed mt-1">{selectedDeliverable.summary}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter showCloseButton>
            <span />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success/error notification */}
      {serviceSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <div className={`rounded-tenkai border px-4 py-3 shadow-lg text-sm font-medium flex items-center gap-2 ${
            serviceSuccess.startsWith('Error')
              ? 'bg-torii/10 border-torii/30 text-torii'
              : 'bg-[#4A7C59]/10 border-[#4A7C59]/30 text-[#4A7C59]'
          }`}>
            {serviceSuccess.startsWith('Error') ? (
              <AlertCircle className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {serviceSuccess}
            <button
              onClick={() => setServiceSuccess(null)}
              className="ml-2 text-current opacity-60 hover:opacity-100"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
