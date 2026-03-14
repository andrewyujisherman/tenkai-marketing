'use client'

import { useState, useCallback, useEffect } from 'react'
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
import { SERVICE_CATEGORIES, QUICK_ACTIONS, ALL_SERVICES, getServiceInputs } from '@/lib/service-categories'
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
  const [resolvedApprovals, setResolvedApprovals] = useState<Set<string>>(new Set())
  const [resolvedPosts, setResolvedPosts] = useState<Set<string>>(new Set())
  const [feedbackTarget, setFeedbackTarget] = useState<{ id: string; title: string } | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [denyTarget, setDenyTarget] = useState<{ id: string; title: string; type: 'post' | 'approval' } | null>(null)
  const [denyReason, setDenyReason] = useState('')
  const [denyLoading, setDenyLoading] = useState(false)

  // Service request dialog — tracks all field values dynamically
  const [serviceDialog, setServiceDialog] = useState<{ key: string; label: string } | null>(null)
  const [serviceFields, setServiceFields] = useState<Record<string, string>>({})
  const [serviceLoading, setServiceLoading] = useState(false)
  const [serviceSuccess, setServiceSuccess] = useState<string | null>(null)

  // Deliverable detail dialog
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null)
  const [reportExpanded, setReportExpanded] = useState(false)

  const [deliverables, setDeliverables] = useState<Deliverable[]>(recentDeliverables)

  const displayName = client?.company_name || userName || null

  const threshold = getDateThreshold(dateFilter)
  const filteredPosts = activityPosts.filter(
    (p) => new Date(p.created_at) >= threshold && !resolvedPosts.has(p.id)
  )

  const handleApprovePost = useCallback(async (postId: string) => {
    setResolvedPosts((prev) => new Set(prev).add(postId))
    try {
      const res = await fetch(`/api/content/${postId}/approve`, { method: 'POST' })
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

  const handleRejectPost = useCallback(async (postId: string, title?: string) => {
    setDenyTarget({ id: postId, title: title ?? 'Untitled', type: 'post' })
  }, [])

  const handleDenySubmit = useCallback(async () => {
    if (!denyTarget || !denyReason.trim()) return
    setDenyLoading(true)
    const { id, type } = denyTarget
    const resolve = type === 'post' ? setResolvedPosts : setResolvedApprovals
    resolve((prev) => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/content/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: denyReason.trim() }),
      })
      if (!res.ok) {
        resolve((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    } catch {
      resolve((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } finally {
      setDenyLoading(false)
      setDenyReason('')
      setDenyTarget(null)
    }
  }, [denyTarget, denyReason])

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
    setDenyTarget({ id: postId, title: approval.title ?? 'Untitled', type: 'approval' })
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
      // silent fail
    }
  }, [])

  const handleServiceRequest = useCallback(async () => {
    if (!serviceDialog) return
    const config = getServiceInputs(serviceDialog.key)
    const missingRequired = config.fields.some((f) => f.required && !serviceFields[f.key]?.trim())
    if (missingRequired) return
    setServiceLoading(true)
    try {
      const extra: Record<string, string> = {}
      for (const [k, v] of Object.entries(serviceFields)) {
        if (k !== 'target_url') extra[k] = v.trim()
      }
      const res = await fetch('/api/services/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: serviceDialog.key,
          target_url: serviceFields.target_url?.trim() ?? '',
          ...extra,
        }),
      })
      if (res.ok) {
        setServiceSuccess(`${serviceDialog.label} request submitted successfully!`)
        setServiceDialog(null)
        setServiceFields({ target_url: client?.website_url ?? '' })
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
  }, [serviceDialog, serviceFields, client?.website_url, refreshDeliverables])

  useEffect(() => {
    if (serviceSuccess) {
      const delay = serviceSuccess.startsWith('Error') ? 10000 : 5000
      const timer = setTimeout(() => setServiceSuccess(null), delay)
      return () => clearTimeout(timer)
    }
  }, [serviceSuccess])

  const visibleApprovals = pendingApprovals.filter((a) => !resolvedApprovals.has(a.id))

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

  const isNewCustomer = stats.totalContent === 0 && stats.publishedContent === 0 && stats.auditScore === null && activityPosts.length === 0 && deliverables.length === 0

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome banner for new customers */}
      {isNewCustomer && (
        <section className="bg-gradient-to-r from-torii/5 to-torii/10 rounded-tenkai border border-torii/20 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-torii/10 flex items-center justify-center shrink-0">
              <Zap className="size-6 text-torii" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-xl text-charcoal">
                Welcome{displayName ? `, ${displayName}` : ''}! Your Tenkai team is getting started.
              </h2>
              <p className="text-warm-gray text-sm leading-relaxed">
                Your AI SEO agents are analyzing your site and building your strategy. You&apos;ll see your first audit results and content recommendations here within 24-48 hours. In the meantime, make sure your <a href="/integrations" className="text-torii hover:text-torii-dark underline underline-offset-2">business profile is complete</a> so your team has everything they need.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Quick Stats */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Activity Feed */}
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
                    onDeny={needsApproval ? () => handleRejectPost(post.id, post.title ?? undefined) : undefined}
                    onEdit={needsApproval ? () => setFeedbackTarget({ id: post.id, title: post.title ?? 'Untitled' }) : undefined}
                  />
                )
              })
            )}
          </div>
        </section>

        {/* Pending Approvals */}
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
                      Give Feedback
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
                    setServiceFields({ target_url: client?.website_url ?? '' })
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
                        setServiceFields({ target_url: client?.website_url ?? '' })
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
                        onClick={() => { setSelectedDeliverable(d); setReportExpanded(false) }}
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

      {/* Deny dialog — requires a reason */}
      <Dialog open={denyTarget !== null} onOpenChange={(o) => { if (!o) { setDenyTarget(null); setDenyReason('') } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-charcoal">
              Deny: {denyTarget?.title}
            </DialogTitle>
            <DialogDescription>
              Let the team know why this doesn&apos;t meet your standards so they can improve.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            placeholder="What needs to change? Be specific so the team can get it right..."
            rows={4}
            className="w-full px-4 py-3 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
            autoFocus
          />
          <DialogFooter showCloseButton>
            <Button
              onClick={handleDenySubmit}
              disabled={denyLoading || !denyReason.trim()}
              className="bg-torii text-white hover:bg-torii-dark rounded-tenkai"
            >
              {denyLoading ? 'Denying…' : 'Deny with Reason'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service request dialog — context-aware fields per service type */}
      <Dialog open={serviceDialog !== null} onOpenChange={(o) => { if (!o) { setServiceDialog(null); setServiceLoading(false) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-charcoal">
              {serviceDialog?.label}
            </DialogTitle>
            {serviceDialog && (
              <DialogDescription>
                {getServiceInputs(serviceDialog.key).description}
              </DialogDescription>
            )}
          </DialogHeader>
          {serviceDialog && (() => {
            const config = getServiceInputs(serviceDialog.key)
            const isSubmitDisabled = serviceLoading || config.fields.some((f) => f.required && !serviceFields[f.key]?.trim())
            return (
              <>
                <div className="space-y-4">
                  {config.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-sm font-medium text-charcoal">
                        {field.label}
                        {!field.required && <span className="text-warm-gray font-normal ml-1">(optional)</span>}
                      </label>
                      {field.type === 'url' ? (
                        <Input
                          value={serviceFields[field.key] ?? ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setServiceFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                          className="border-tenkai-border rounded-tenkai"
                        />
                      ) : (
                        <textarea
                          value={serviceFields[field.key] ?? ''}
                          onChange={(e) =>
                            setServiceFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full px-4 py-3 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <DialogFooter showCloseButton>
                  <Button
                    onClick={handleServiceRequest}
                    disabled={isSubmitDisabled}
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
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Deliverable detail dialog — summary + expandable full report */}
      <Dialog open={selectedDeliverable !== null} onOpenChange={(o) => { if (!o) { setSelectedDeliverable(null); setReportExpanded(false) } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-charcoal">
              {selectedDeliverable?.title ?? 'Deliverable Details'}
            </DialogTitle>
          </DialogHeader>
          {selectedDeliverable && (() => {
            const d = selectedDeliverable
            const rawContent = d.content
            const content: Record<string, unknown> | null = rawContent == null
              ? null
              : typeof rawContent === 'object'
                ? rawContent as Record<string, unknown>
                : (() => { try { return JSON.parse(rawContent as string) } catch { return null } })()

            const recommendations = Array.isArray(content?.recommendations) ? content!.recommendations as string[] : null
            const keywords = Array.isArray(content?.keywords) ? content!.keywords as Array<Record<string, unknown>> : null
            const issues = Array.isArray(content?.issues) ? content!.issues as Array<Record<string, unknown>> : null
            const contentScore = content?.score != null ? Number(content.score) : null
            const otherKeys = content
              ? Object.keys(content).filter((k) => !['recommendations', 'keywords', 'issues', 'score'].includes(k))
              : []

            return (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-warm-gray text-xs">Agent</span>
                    <p className="font-medium text-charcoal">{d.agent_name ?? '—'}</p>
                  </div>
                  <div>
                    <span className="text-warm-gray text-xs">Type</span>
                    <p className="font-medium text-charcoal">{(d.deliverable_type ?? 'other').replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <span className="text-warm-gray text-xs">Score</span>
                    <p className="font-medium text-charcoal">{d.score != null ? `${d.score}/100` : '—'}</p>
                  </div>
                  <div>
                    <span className="text-warm-gray text-xs">Status</span>
                    <p className="font-medium text-charcoal flex items-center gap-1.5">
                      {deliverableStatusIcon(d.status)}
                      {deliverableStatusLabel(d.status)}
                    </p>
                  </div>
                </div>

                {d.summary && (
                  <div>
                    <span className="text-warm-gray text-xs">Summary</span>
                    <p className="text-charcoal leading-relaxed mt-1">{d.summary}</p>
                  </div>
                )}

                {content && (
                  <div className="border border-tenkai-border rounded-tenkai overflow-hidden">
                    <button
                      onClick={() => setReportExpanded((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-parchment/50 hover:bg-parchment/80 transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-charcoal">Full Report</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Build readable text from structured content
                            const lines: string[] = [`${d.title ?? 'Report'}\n${'='.repeat(40)}\n`]
                            if (d.summary) lines.push(`Summary: ${d.summary}\n`)
                            const flatten = (obj: Record<string, unknown>, prefix = ''): void => {
                              for (const [k, v] of Object.entries(obj)) {
                                const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                                if (Array.isArray(v)) {
                                  lines.push(`\n${prefix}${label}:`)
                                  v.forEach((item, i) => {
                                    if (typeof item === 'object' && item) lines.push(`  ${i + 1}. ${JSON.stringify(item)}`)
                                    else lines.push(`  • ${item}`)
                                  })
                                } else if (typeof v === 'object' && v) {
                                  lines.push(`\n${prefix}${label}:`)
                                  flatten(v as Record<string, unknown>, prefix + '  ')
                                } else {
                                  lines.push(`${prefix}${label}: ${v}`)
                                }
                              }
                            }
                            flatten(content as Record<string, unknown>)
                            const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `${d.title ?? 'report'}.txt`
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                          className="text-xs text-torii hover:text-torii-dark transition-colors px-2 py-1 rounded-tenkai border border-torii/20 hover:border-torii/40"
                        >
                          Download Report
                        </button>
                        <ChevronDown className={`size-4 text-warm-gray transition-transform ${reportExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {reportExpanded && (
                      <div className="p-4 space-y-4">
                        {contentScore != null && (
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${
                              contentScore >= 80 ? 'bg-[#4A7C59]/10 text-[#4A7C59]' : contentScore >= 50 ? 'bg-[#C49A3C]/10 text-[#C49A3C]' : 'bg-torii/10 text-torii'
                            }`}>
                              {contentScore}
                            </div>
                            <span className="text-xs text-warm-gray">Overall Score</span>
                          </div>
                        )}

                        {recommendations && recommendations.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-charcoal mb-2">Recommendations</p>
                            <ul className="space-y-1.5">
                              {recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-warm-gray leading-relaxed">
                                  <span className="text-torii mt-0.5 shrink-0">&#8226;</span>
                                  {String(rec)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {keywords && keywords.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-charcoal mb-2">Keywords</p>
                            <div className="rounded-tenkai border border-tenkai-border overflow-hidden">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-tenkai-border bg-parchment/50">
                                    <th className="text-left py-2 px-3 font-medium text-warm-gray">Keyword</th>
                                    <th className="text-right py-2 px-3 font-medium text-warm-gray">Volume</th>
                                    <th className="text-right py-2 px-3 font-medium text-warm-gray hidden sm:table-cell">Difficulty</th>
                                    <th className="text-left py-2 px-3 font-medium text-warm-gray hidden md:table-cell">Intent</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {keywords.map((kw, i) => (
                                    <tr key={i} className="border-b border-tenkai-border-light last:border-none">
                                      <td className="py-2 px-3 font-medium text-charcoal">{String(kw.keyword ?? kw.term ?? '—')}</td>
                                      <td className="py-2 px-3 text-right text-charcoal tabular-nums">{Number(kw.volume ?? kw.search_volume ?? 0).toLocaleString()}</td>
                                      <td className="py-2 px-3 text-right hidden sm:table-cell">
                                        <span className={`rounded-full px-1.5 py-0.5 font-medium ${
                                          Number(kw.difficulty ?? 0) <= 30 ? 'bg-[#4A7C59]/10 text-[#4A7C59]' : Number(kw.difficulty ?? 0) <= 60 ? 'bg-[#C49A3C]/10 text-[#C49A3C]' : 'bg-torii/10 text-torii'
                                        }`}>{String(kw.difficulty ?? kw.kd ?? '—')}</span>
                                      </td>
                                      <td className="py-2 px-3 text-warm-gray hidden md:table-cell capitalize">{String(kw.intent ?? '—')}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {issues && issues.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-charcoal mb-2">Issues</p>
                            <div className="space-y-2">
                              {issues.map((issue, i) => {
                                const severity = String(issue.severity ?? issue.priority ?? 'medium').toLowerCase()
                                const severityClass = severity === 'high' || severity === 'critical'
                                  ? 'bg-torii/10 text-torii'
                                  : severity === 'medium' || severity === 'warning'
                                    ? 'bg-[#C49A3C]/10 text-[#C49A3C]'
                                    : 'bg-[#4A7C59]/10 text-[#4A7C59]'
                                return (
                                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-tenkai bg-parchment/30 border border-tenkai-border-light">
                                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase shrink-0 ${severityClass}`}>
                                      {severity}
                                    </span>
                                    <p className="text-sm text-charcoal leading-relaxed">{String(issue.description ?? issue.message ?? issue.title ?? JSON.stringify(issue))}</p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {otherKeys.map((key) => {
                          const val = content![key]
                          if (val == null) return null
                          const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                          if (Array.isArray(val)) {
                            return (
                              <div key={key}>
                                <p className="text-xs font-medium text-charcoal mb-1.5">{label}</p>
                                <ul className="space-y-1">
                                  {(val as unknown[]).map((item, i) => (
                                    <li key={i} className="text-sm text-warm-gray leading-relaxed">
                                      &#8226; {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )
                          }
                          if (typeof val === 'object') {
                            return (
                              <div key={key}>
                                <p className="text-xs font-medium text-charcoal mb-1.5">{label}</p>
                                <pre className="text-xs text-warm-gray bg-parchment/50 rounded-tenkai p-3 overflow-x-auto">{JSON.stringify(val, null, 2)}</pre>
                              </div>
                            )
                          }
                          return (
                            <div key={key}>
                              <p className="text-xs font-medium text-charcoal mb-1">{label}</p>
                              <p className="text-sm text-warm-gray leading-relaxed">{String(val)}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })()}
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
              ? 'bg-red-50 border-red-200 text-red-700'
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
