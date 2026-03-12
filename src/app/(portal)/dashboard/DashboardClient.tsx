'use client'

import { useState, useCallback, useMemo } from 'react'
import { agents } from '@/lib/design-system'
import { StatCard } from '@/components/portal/StatCard'
import { ActivityItem } from '@/components/portal/ActivityItem'
import { Button } from '@/components/ui/button'
import {
  Search,
  FileText,
  Target,
  TrendingUp,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { ActivityPost, PendingApproval, DashboardStats } from './page'

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
    </div>
  )
}
