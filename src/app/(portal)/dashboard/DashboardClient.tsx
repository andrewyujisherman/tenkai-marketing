'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { X, CheckCircle, FileText, BarChart3, Shield, TrendingUp, FileBarChart, Link2, Loader2, Sparkles } from 'lucide-react'
import { OutputViewer } from '@/components/ui/output-viewer'
import { ProgressTracker } from '@/components/portal/ProgressTracker'
import type {
  DashboardData,
  AgentStatus,
  CompletedTask,
  ActionItem,
  DashboardMetric,
} from './page'

// ─── Helpers ──────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

const AVATAR_COLORS = ['avatar-red', 'avatar-blue', 'avatar-green', 'avatar-purple', 'avatar-teal'] as const

function getAvatarColor(name: string, index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

function contentTypeIcon(type: string) {
  switch (type) {
    case 'article':
    case 'content_draft':
      return <FileText className="size-4 text-torii" />
    case 'audit_report':
    case 'technical_report':
      return <BarChart3 className="size-4 text-torii" />
    default:
      return <FileText className="size-4 text-warm-gray" />
  }
}

// ─── Types for output viewer ──────────────────────────────

type OutputContentType = 'heading' | 'paragraph' | 'list' | 'table' | 'keyword_link' | 'metric' | 'section_break'

interface ViewerData {
  id: string
  title: string
  content: Array<{
    type: OutputContentType
    level?: number
    text?: string
    items?: string[]
    headers?: string[]
    rows?: string[][]
    keyword?: string
    href?: string
    label?: string
    value?: string
  }> | string
  deliverable_type?: string
  agent_name?: string
  agent_kanji?: string
}

// ─── Plain-English Helpers ────────────────────────────────

function healthScoreExplanation(value: string | number): string {
  const str = String(value)
  const num = parseInt(str)
  if (isNaN(num)) return 'Connect your site to get a health score.'
  if (num >= 80) return 'Your website is in great shape — keep it up!'
  if (num >= 60) return 'Your site is healthy but has room for improvement.'
  if (num >= 40) return 'Several issues are holding your site back from ranking higher.'
  return 'Your site needs attention — fixing these issues will help you get found online.'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function metricExplanation(name: string, value: string | number, changePct: string): string {
  const v = typeof value === 'number' ? value : parseInt(String(value))
  switch (name) {
    case 'Website Visits':
      if (String(value) === '--') return 'Connect Google Analytics to see how many people visit your site.'
      return `${v.toLocaleString()} people visited your website recently.`
    case 'Keywords in Top 10':
      if (String(value) === '--') return 'Connect Search Console to track which searches find your business.'
      return v === 1
        ? '1 search term is showing your business on page 1 of Google.'
        : `${v} search terms are showing your business on page 1 of Google.`
    case 'Health Score':
      return healthScoreExplanation(value)
    case 'Content Published':
      if (v === 0) return 'Your team is working on your first content pieces.'
      return `${v} article${v !== 1 ? 's' : ''} published — each one helps you rank for more searches.`
    default:
      return ''
  }
}

function businessLanguageLabel(item: ActionItem): string {
  const agent = item.agent_name || 'Your team'
  if (item.type === 'content_approval') {
    if (item.title.toLowerCase().includes('blog') || item.title.toLowerCase().includes('article')) {
      return `${agent} wrote a blog post — review and approve it`
    }
    if (item.title.toLowerCase().includes('audit') || item.title.toLowerCase().includes('report')) {
      return `${agent} finished analyzing your website — see the results`
    }
    return `${agent} has something ready for you to review`
  }
  if (item.type === 'agent_question') {
    return `${agent} has a question about your business`
  }
  if (item.type === 'setup_task') {
    return 'Connect a tool to give your team more data'
  }
  if (item.type === 'strategy_review') {
    return 'Your keyword strategy is ready — review and choose the right keywords for your business'
  }
  if (item.type === 'report_review') {
    return `${agent} finished your monthly report — see how your SEO is progressing`
  }
  if (item.type === 'profile_review') {
    return 'We analyzed your business — does this look right?'
  }
  return item.title
}

// ─── Strategy Steps for Welcome State ─────────────────────

const STRATEGY_STEPS = [
  { label: 'Analyzing your website', agent: 'Haruki', estimate: '~2 hours' },
  { label: 'Researching your best keywords', agent: 'Haruki', estimate: '~3 hours' },
  { label: 'Planning your content calendar', agent: 'Ryo', estimate: '~4 hours' },
  { label: 'Studying your competitors', agent: 'Haruki', estimate: '~2 hours' },
]

// ─── Main Component ───────────────────────────────────────

interface DashboardClientProps {
  data: DashboardData
}

export default function DashboardClient({ data }: DashboardClientProps) {
  const router = useRouter()
  const {
    briefing: initialBriefing,
    agents: initialAgents,
    completedTasks: initialTasks,
    actionItems: initialActionItems,
    actionItemCount: initialCount,
    metrics: initialMetrics,
  } = data

  // State
  const [briefingDismissed, setBriefingDismissed] = useState(false)
  const [agents, setAgents] = useState<AgentStatus[]>(initialAgents)
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>(initialTasks)
  const [actionItems, setActionItems] = useState<ActionItem[]>(initialActionItems)
  const [actionItemCount, setActionItemCount] = useState(initialCount)
  const [metrics, setMetrics] = useState<DashboardMetric[]>(initialMetrics)
  const [briefing] = useState(initialBriefing)
  const [viewerData, setViewerData] = useState<ViewerData | null>(null)
  const [resolvedItems, setResolvedItems] = useState<Set<string>>(new Set())
  const prevCountRef = useRef(initialCount)
  const [countPulsing, setCountPulsing] = useState(false)

  // Pulse badge when count changes
  useEffect(() => {
    if (actionItemCount !== prevCountRef.current) {
      setCountPulsing(true)
      prevCountRef.current = actionItemCount
      const t = setTimeout(() => setCountPulsing(false), 300)
      return () => clearTimeout(t)
    }
  }, [actionItemCount])

  // Fetch metrics on mount (GA4/GSC are slow — fetched client-side to avoid blocking SSR)
  useEffect(() => {
    fetch('/api/dashboard/metrics')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.metrics?.length) setMetrics(data.metrics) })
      .catch(() => {})
  }, [])

  // Polling: refresh activity + action items every 30s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [activityRes, itemsRes] = await Promise.all([
          fetch('/api/dashboard/activity'),
          fetch('/api/dashboard/action-items'),
        ])
        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setAgents(activityData.agents ?? [])
          setCompletedTasks(activityData.completed_tasks ?? [])
        }
        if (itemsRes.ok) {
          const itemsData = await itemsRes.json()
          setActionItems(itemsData.items ?? [])
          setActionItemCount(itemsData.count ?? 0)
        }
      } catch {
        // Silent fail on polling
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAnswer = useCallback(async (id: string, _answer: string) => {
    setResolvedItems(prev => new Set(prev).add(id))
    setTimeout(() => {
      setActionItems(prev => prev.filter(i => i.id !== id))
      setActionItemCount(prev => Math.max(0, prev - 1))
    }, 700)
  }, [])

  const handleSkip = useCallback(async (id: string) => {
    setResolvedItems(prev => new Set(prev).add(id))
    setTimeout(() => {
      setActionItems(prev => prev.filter(i => i.id !== id))
      setActionItemCount(prev => Math.max(0, prev - 1))
    }, 700)
  }, [])

  const handleTaskClick = useCallback(async (task: CompletedTask) => {
    // Fetch deliverable content for the output viewer
    try {
      const res = await fetch(`/api/services/deliverables?id=${task.deliverable_id}`)
      if (res.ok) {
        const result = await res.json()
        const deliverable = result.deliverables?.[0] ?? result
        setViewerData({
          id: task.id,
          title: task.title,
          content: deliverable.content ?? task.title,
          deliverable_type: task.content_type,
          agent_name: task.agent_name,
        })
      } else {
        // Fallback — show title only
        setViewerData({
          id: task.id,
          title: task.title,
          content: `Completed by ${task.agent_name}`,
          deliverable_type: task.content_type,
          agent_name: task.agent_name,
        })
      }
    } catch {
      setViewerData({
        id: task.id,
        title: task.title,
        content: `Completed by ${task.agent_name}`,
        deliverable_type: task.content_type,
        agent_name: task.agent_name,
      })
    }
  }, [])

  const handleDismissBriefing = useCallback(() => {
    setBriefingDismissed(true)
    // Update last_seen via POST (fire and forget)
    fetch('/api/dashboard/briefing', { method: 'POST' }).catch(() => {})
  }, [])

  const hasWorkingAgents = agents.some(a => a.status === 'working')
  const activeCount = actionItems.filter(i => !resolvedItems.has(i.id)).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Briefing Banner ────────────────────────────── */}
      {!briefingDismissed && (data.progressNarrative || briefing.summary) && (
        <div className="briefing-banner relative animate-fade-in pr-10">
          <button
            onClick={handleDismissBriefing}
            className="absolute top-3 right-3 p-1 rounded-tenkai-sm hover:bg-charcoal/5 transition-colors duration-fast"
            aria-label="Dismiss briefing"
          >
            <X className="size-4 text-warm-gray" />
          </button>
          {data.progressNarrative ? (
            <>
              <h4 className="font-serif text-[13px] text-torii-dark font-medium mb-1">
                Your progress
              </h4>
              <p className="text-[13px] text-charcoal leading-relaxed">
                {data.progressNarrative}
              </p>
            </>
          ) : (
            <>
              <h4 className="font-serif text-[13px] text-torii-dark font-medium mb-1">
                Since you were last here
              </h4>
              <p className="text-[13px] text-charcoal leading-relaxed">
                {briefing.summary}
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Welcome State (new user, strategy building) ── */}
      {data.isNewUser && (
        <div className="portal-card animate-fade-in" style={{ background: 'linear-gradient(135deg, var(--parchment) 0%, #fff 100%)' }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-torii/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="size-5 text-torii" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg text-charcoal mb-1">Your AI team is building your strategy...</h3>
              <p className="text-sm text-warm-gray mb-4">
                This usually takes a few hours. We&apos;ll notify you when your first results are ready.
              </p>
              <div className="space-y-2.5">
                {STRATEGY_STEPS.map((step, i) => {
                  const isActive = i < data.processingCount
                  return (
                    <div key={step.label} className="flex items-center gap-3">
                      {isActive ? (
                        <Loader2 className="size-4 text-torii animate-spin flex-shrink-0" />
                      ) : (
                        <div className="size-4 rounded-full border border-tenkai-border flex-shrink-0" />
                      )}
                      <span className={cn('text-sm', isActive ? 'text-charcoal font-medium' : 'text-warm-gray')}>
                        {step.label}
                      </span>
                      <span className="text-xs text-warm-gray/70">{step.agent} · {step.estimate}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2-Column Layout ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* ── LEFT: Team Activity (single unified card) ─── */}
        <div>
          <div className="portal-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-[15px] text-charcoal font-medium">Team Activity</h3>
              <span className="text-[12px] text-warm-gray">Live</span>
            </div>

            {/* Agent status bar — always visible, first thing */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 py-2.5 mb-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
              {agents.map((agent) => (
                <span key={agent.id} className="text-[12px] text-warm-gray group relative cursor-default">
                  <span
                    className={cn('inline-block w-2 h-2 rounded-full mr-1')}
                    style={{
                      verticalAlign: 'middle',
                      background: agent.status === 'working' ? '#F57F17' : 'var(--success)',
                    }}
                  />
                  {agent.custom_name || agent.name}
                  {/* Tooltip */}
                  <span className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-charcoal text-white text-xs rounded-tenkai-sm opacity-0 group-hover:opacity-100 transition-opacity duration-fast pointer-events-none whitespace-nowrap z-10">
                    <span className="block font-medium">{agent.custom_name || agent.name}</span>
                    <span className="block text-white/70">{agent.role}</span>
                    {agent.status === 'working' && agent.current_task && (
                      <span className="block text-white/60 mt-1">{agent.current_task}</span>
                    )}
                  </span>
                </span>
              ))}
            </div>

            {/* Active task — only if agent is working */}
            {hasWorkingAgents && agents.filter(a => a.status === 'working').map((agent, idx) => (
              <div key={`progress-${agent.id}`} className="activity-item" style={{ background: 'var(--parchment)', margin: '0 -8px', padding: '12px 8px', borderRadius: 'var(--radius)', cursor: 'default' }}>
                <div className={cn('agent-avatar flex-shrink-0', getAvatarColor(agent.name, idx))}>
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div className="activity-content min-w-0 flex-1">
                  <div>
                    <span className="agent-name">{agent.custom_name || agent.name}</span>{' '}
                    <span className="agent-role">{agent.role}</span>
                  </div>
                  <div className="task-desc mt-0.5">
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#F57F17', marginRight: 4 }} />
                    {agent.current_task}
                  </div>
                  <div className="progress-bar-wrap mt-2">
                    <div className="progress-bar-fill animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            ))}

            {/* Recent Completed */}
            <div className="text-[12px] uppercase tracking-wide text-warm-gray font-semibold my-3">Recent Completed</div>
            {completedTasks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-charcoal/70">
                  Your team is getting started! Check back soon to see their progress.
                </p>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto -mx-5">
                {completedTasks.map((task, i) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={cn('activity-item w-full text-left', i === 0 && 'animate-slide-in-task')}
                  >
                    <div className={cn('agent-avatar flex-shrink-0', getAvatarColor(task.agent_name, i))}>
                      {task.agent_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="activity-content min-w-0 flex-1">
                      <div>
                        <span className="agent-name">{task.agent_name}</span>
                        {task.agent_role && <> <span className="agent-role">{task.agent_role}</span></>}
                      </div>
                      <div className="task-desc truncate">{task.title}</div>
                      <div className="task-time">{formatRelativeTime(task.completed_at)}</div>
                    </div>
                    <div className="flex-shrink-0 ml-2">{contentTypeIcon(task.content_type)}</div>
                  </button>
                ))}
              </div>
            )}
            {completedTasks.length >= 10 && (
              <div className="pt-3 border-t border-tenkai-border-light text-center mt-2">
                <a href="/content" className="text-sm text-torii hover:text-torii-dark font-medium underline underline-offset-2 transition-colors duration-fast">
                  View all history
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Action Items (STICKY) ────────────── */}
        <div className="order-first lg:order-last">
          <div className="lg:sticky lg:top-6">
            <div className="portal-card">
              {/* Header with count badge */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-[15px] text-charcoal font-medium">Action Items</h3>
                {activeCount > 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-torii text-white text-xs font-semibold',
                      countPulsing && 'animate-pulse-badge'
                    )}
                  >
                    {activeCount}
                  </span>
                )}
              </div>

              {/* Action item cards */}
              {activeCount === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle className="size-8 text-success/40 mx-auto mb-2" />
                  <p className="text-sm text-charcoal/60">
                    You&#39;re all caught up! No items need your attention.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {actionItems
                    .filter(i => !resolvedItems.has(i.id))
                    .map(item => (
                      <div key={item.id} className="action-item">
                        <div className={cn(
                          'action-type',
                          item.type === 'content_approval' || item.type === 'strategy_review' || item.type === 'profile_review' ? 'approval' : item.type === 'agent_question' ? 'question' : item.type === 'report_review' ? 'approval' : 'setup'
                        )}>
                          {item.type === 'content_approval' ? 'Approval Needed' : item.type === 'agent_question' ? 'Agent Question' : item.type === 'strategy_review' ? 'Strategy Review' : item.type === 'report_review' ? 'Report Ready' : item.type === 'profile_review' ? 'Profile Check' : 'Setup Task'}
                        </div>
                        <div className="action-desc">{businessLanguageLabel(item)}</div>
                        {item.preview && (
                          <p className="text-[11px] text-warm-gray mt-1 line-clamp-2">{item.preview}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {item.type === 'content_approval' && (
                            <button
                              onClick={() => router.push(item.content_id ? `/content?id=${item.content_id}` : '/content')}
                              className="btn btn-primary btn-sm"
                            >
                              Review Content
                            </button>
                          )}
                          {item.type === 'agent_question' && (
                            <div className="flex gap-2 w-full">
                              <input
                                type="text"
                                placeholder="Type your answer..."
                                className="flex-1 text-sm border rounded px-2 py-1"
                                id={`answer-${item.id}`}
                              />
                              <button
                                onClick={() => {
                                  const input = document.getElementById(`answer-${item.id}`) as HTMLInputElement
                                  if (input?.value.trim()) {
                                    handleAnswer(item.id, input.value.trim())
                                  }
                                }}
                                className="btn btn-secondary btn-sm"
                              >
                                Send
                              </button>
                            </div>
                          )}
                          {item.type === 'setup_task' && (
                            <>
                              <button
                                onClick={() => router.push('/settings?tab=integrations')}
                                className="btn btn-secondary btn-sm"
                              >
                                Connect
                              </button>
                              <button
                                onClick={() => handleSkip(item.id)}
                                className="text-xs text-gray-400 ml-2"
                              >
                                Skip
                              </button>
                            </>
                          )}
                          {item.type === 'report_review' && (
                            <button
                              onClick={() => router.push('/reports')}
                              className="btn btn-primary btn-sm"
                            >
                              View Report
                            </button>
                          )}
                          {item.type === 'strategy_review' && (
                            <button
                              onClick={() => router.push('/strategy')}
                              className="btn btn-primary btn-sm"
                            >
                              Review Strategy
                            </button>
                          )}
                          {item.type === 'profile_review' && (
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  await fetch(`/api/approvals/${item.id}/resolve`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'approved' }),
                                  })
                                  setResolvedItems(prev => new Set([...prev, item.id]))
                                }}
                                className="btn btn-primary btn-sm"
                              >
                                Yes, looks right
                              </button>
                              <button
                                onClick={() => router.push('/business')}
                                className="btn btn-secondary btn-sm"
                              >
                                Let me fix it
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ──────────────────────────────── */}
      <div>
        <h3 className="font-serif text-[15px] text-charcoal font-medium mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <a href="/health" className="portal-card hover-lift flex items-start gap-3 no-underline group cursor-pointer" style={{ marginBottom: 0 }}>
            <div className="w-9 h-9 rounded-tenkai bg-torii-subtle flex items-center justify-center flex-shrink-0">
              <Shield className="size-4 text-torii" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-charcoal group-hover:text-torii transition-colors duration-fast">Run SEO Audit</p>
              <p className="text-[12px] text-warm-gray mt-0.5">Check your site health score</p>
            </div>
          </a>
          <a href="/content" className="portal-card hover-lift flex items-start gap-3 no-underline group cursor-pointer" style={{ marginBottom: 0 }}>
            <div className="w-9 h-9 rounded-tenkai bg-torii-subtle flex items-center justify-center flex-shrink-0">
              <FileText className="size-4 text-torii" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-charcoal group-hover:text-torii transition-colors duration-fast">Create Content Brief</p>
              <p className="text-[12px] text-warm-gray mt-0.5">Generate SEO-optimized content</p>
            </div>
          </a>
          <a href="/rankings" className="portal-card hover-lift flex items-start gap-3 no-underline group cursor-pointer" style={{ marginBottom: 0 }}>
            <div className="w-9 h-9 rounded-tenkai bg-torii-subtle flex items-center justify-center flex-shrink-0">
              <TrendingUp className="size-4 text-torii" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-charcoal group-hover:text-torii transition-colors duration-fast">View Rankings</p>
              <p className="text-[12px] text-warm-gray mt-0.5">Track keyword positions</p>
            </div>
          </a>
          <a href="/reports" className="portal-card hover-lift flex items-start gap-3 no-underline group cursor-pointer" style={{ marginBottom: 0 }}>
            <div className="w-9 h-9 rounded-tenkai bg-torii-subtle flex items-center justify-center flex-shrink-0">
              <FileBarChart className="size-4 text-torii" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-charcoal group-hover:text-torii transition-colors duration-fast">View Reports</p>
              <p className="text-[12px] text-warm-gray mt-0.5">See your SEO performance insights</p>
            </div>
          </a>
          <a href="/settings?tab=integrations" className="portal-card hover-lift flex items-start gap-3 no-underline group cursor-pointer" style={{ marginBottom: 0 }}>
            <div className="w-9 h-9 rounded-tenkai bg-torii-subtle flex items-center justify-center flex-shrink-0">
              <Link2 className="size-4 text-torii" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-charcoal group-hover:text-torii transition-colors duration-fast">Manage Integrations</p>
              <p className="text-[12px] text-warm-gray mt-0.5">Connect Google Search Console</p>
            </div>
          </a>
        </div>
      </div>

      {/* ── Metrics Summary ────────────────────────────── */}
      <div>
        <h3 className="font-serif text-[15px] text-charcoal font-medium mb-3">Performance Overview</h3>
        <div className="metrics-row">
          {metrics.map(metric => (
            <div key={metric.name} className="portal-card text-center">
              <div className="font-serif text-[24px] text-charcoal leading-none">{metric.value}</div>
              <div className="text-[12px] text-warm-gray mt-1">{metric.name}</div>
              {metric.change_pct !== undefined && metric.change_pct !== '' && (
                <div className={cn(
                  'text-[11px] mt-1 font-medium',
                  metric.trend === 'up' ? 'text-success' : metric.trend === 'down' ? 'text-torii' : 'text-warm-gray'
                )}>
                  {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}{Math.abs(Number(metric.change_pct))}%
                </div>
              )}
              <p className="text-[11px] text-warm-gray/80 mt-1.5 leading-snug">
                {metricExplanation(metric.name, metric.value, metric.change_pct)}
              </p>
              {metric.link_to && (
                <a href={metric.link_to} className="text-[11px] text-torii hover:text-torii-dark underline underline-offset-1 mt-1 block transition-colors duration-fast">
                  View details
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Progress Over Time ────────────────────────── */}
      <ProgressTracker
        initial={data.progress.initial}
        current={data.progress.current}
        clientStartDate={data.clientStartDate}
      />

      {/* ── 90-Day Roadmap ──────────────────────────────── */}
      {!data.isNewUser && (
        <div className="portal-card animate-fade-in">
          <h3 className="font-serif text-[15px] text-charcoal font-medium mb-1">Your 90-Day SEO Roadmap</h3>
          <p className="text-[12px] text-warm-gray mb-4">
            What your AI team is focused on — and what it means for your business.
          </p>
          <div className="relative">
            {[
              {
                phase: 'Month 1 — Foundation',
                status: data.firstAuditDate ? 'complete' as const : 'active' as const,
                items: [
                  'Full website audit & fix critical issues',
                  'Research best keywords for your business',
                  'Analyze what competitors are doing',
                ],
                outcome: 'Your site is healthy and we know exactly where to focus.',
              },
              {
                phase: 'Month 2 — Growth',
                status: (data.firstAuditDate && (data.progress.current?.contentPublished ?? 0) > 0 ? 'active' : 'upcoming') as 'complete' | 'active' | 'upcoming',
                items: [
                  'Publish optimized content targeting your best keywords',
                  'Build your content calendar',
                  'Improve pages that are close to ranking',
                ],
                outcome: 'You start showing up in more searches, bringing in new visitors.',
              },
              {
                phase: 'Month 3 — Momentum',
                status: 'upcoming' as const,
                items: [
                  'Track and improve keyword rankings',
                  'Expand content to cover more topics',
                  'Monthly performance report with clear next steps',
                ],
                outcome: 'Consistent growth in traffic and leads from search.',
              },
            ].map((phase, i) => (
              <div key={phase.phase} className="flex gap-4 mb-5 last:mb-0">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={cn(
                    'w-3 h-3 rounded-full border-2 mt-0.5',
                    phase.status === 'complete' ? 'bg-success border-success' :
                    phase.status === 'active' ? 'bg-torii border-torii' :
                    'bg-transparent border-tenkai-border'
                  )} />
                  {i < 2 && <div className="w-px flex-1 mt-1" style={{ background: 'var(--border-light)' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-[13px] font-semibold',
                      phase.status === 'active' ? 'text-torii' : phase.status === 'complete' ? 'text-charcoal' : 'text-warm-gray'
                    )}>{phase.phase}</span>
                    {phase.status === 'complete' && <CheckCircle className="size-3.5 text-success" />}
                    {phase.status === 'active' && <span className="text-[10px] bg-torii/10 text-torii px-1.5 py-0.5 rounded-full font-medium">Current</span>}
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {phase.items.map(item => (
                      <li key={item} className="text-[12px] text-charcoal/80 flex items-start gap-1.5">
                        <span className="text-warm-gray mt-0.5">&#8226;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-torii/80 mt-1.5 italic">{phase.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Output Viewer Modal ────────────────────────── */}
      {viewerData && (
        <OutputViewer
          data={viewerData}
          variant="modal"
          open={true}
          onClose={() => setViewerData(null)}
        />
      )}
    </div>
  )
}
