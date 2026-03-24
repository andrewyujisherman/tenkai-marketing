'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, FileText, BarChart3 } from 'lucide-react'
import { AgentCard } from '@/components/ui/agent-card'
import { ActionItemCard } from '@/components/ui/action-item-card'
import { MetricCard } from '@/components/ui/metric-card'
import { OutputViewer } from '@/components/ui/output-viewer'
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

// ─── Main Component ───────────────────────────────────────

interface DashboardClientProps {
  data: DashboardData
}

export default function DashboardClient({ data }: DashboardClientProps) {
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
  const [metrics] = useState<DashboardMetric[]>(initialMetrics)
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

  // Action handlers
  const handleApproval = useCallback(async (id: string, action: 'approve' | 'edit' | 'deny', feedback?: string) => {
    const item = actionItems.find(i => i.id === id)
    const contentId = item?.content_id
    if (!contentId) return

    setResolvedItems(prev => new Set(prev).add(id))

    try {
      let endpoint = `/api/content/${contentId}/approve`
      let body: string | undefined

      if (action === 'edit') {
        endpoint = `/api/content/${contentId}/feedback`
        body = JSON.stringify({ feedback: feedback ?? '' })
      } else if (action === 'deny') {
        endpoint = `/api/content/${contentId}/reject`
        body = JSON.stringify({ reason: feedback ?? '' })
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body,
      })

      if (res.ok) {
        // Remove from action items after animation
        setTimeout(() => {
          setActionItems(prev => prev.filter(i => i.id !== id))
          setActionItemCount(prev => Math.max(0, prev - 1))
        }, 700)
      } else {
        setResolvedItems(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    } catch {
      setResolvedItems(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [actionItems])

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
      {!briefingDismissed && briefing.summary && briefing.activity_count > 0 && (
        <div className="bg-gradient-to-br from-torii-subtle to-ivory border border-torii-subtle border-l-4 border-l-torii rounded-tenkai p-4 pr-10 relative animate-fade-in">
          <button
            onClick={handleDismissBriefing}
            className="absolute top-3 right-3 p-1 rounded-tenkai-sm hover:bg-charcoal/5 transition-colors duration-fast"
            aria-label="Dismiss briefing"
          >
            <X className="size-4 text-warm-gray" />
          </button>
          <h4 className="font-serif text-[13px] text-torii-dark font-medium mb-1">
            Since you were last here
          </h4>
          <p className="text-[13px] text-charcoal leading-relaxed">
            {briefing.summary}
          </p>
        </div>
      )}

      {/* ── 2-Column Layout ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* ── LEFT: Activity Feed ────────────────────────── */}
        <div className="space-y-5">
          {/* Agent Status Row */}
          <div className="bg-ivory rounded-tenkai border border-tenkai-border shadow-tenkai-sm p-5">
            <h3 className="font-serif text-[15px] text-charcoal font-medium mb-4">Your Team</h3>
            <div className="flex flex-wrap gap-4">
              {agents.map(agent => (
                <div key={agent.id} className="group relative">
                  <AgentCard
                    name={agent.name}
                    kanji={agent.kanji}
                    role={agent.role}
                    customName={agent.custom_name ?? undefined}
                    status={agent.status}
                    showStatus={true}
                    size="avatar-only"
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-charcoal text-white text-xs rounded-tenkai-sm opacity-0 group-hover:opacity-100 transition-opacity duration-fast pointer-events-none whitespace-nowrap z-10">
                    <p className="font-medium">{agent.custom_name || agent.name}</p>
                    <p className="text-white/70">{agent.role}</p>
                    {agent.current_task && (
                      <p className="text-torii-light mt-0.5">{agent.current_task}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Progress Card — only if agent is working */}
          {hasWorkingAgents && (
            <div className="space-y-2">
              {agents.filter(a => a.status === 'working').map(agent => (
                <div
                  key={`progress-${agent.id}`}
                  className="bg-ivory rounded-tenkai border border-tenkai-border shadow-tenkai-sm p-4 animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-torii-subtle flex items-center justify-center border-2 border-torii/20">
                        <span className="text-base font-serif text-torii">{agent.kanji}</span>
                      </div>
                      <svg className="absolute inset-0 w-10 h-10 animate-progress-spin" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18" fill="none" stroke="#C1554D" strokeWidth="2" strokeDasharray="30 84" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal">{agent.name}</p>
                      <p className="text-xs text-warm-gray">{agent.current_task}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-tenkai-border-light rounded-full overflow-hidden">
                    <div className="h-full bg-torii rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Tasks Feed */}
          <div className="bg-ivory rounded-tenkai border border-tenkai-border shadow-tenkai-sm">
            <div className="p-5 border-b border-tenkai-border-light flex justify-between items-center">
              <h3 className="font-serif text-[15px] text-charcoal font-medium">Team Activity</h3>
              <span className="text-xs text-warm-gray">Live</span>
            </div>
            {completedTasks.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex justify-center gap-2 mb-3">
                  {agents.slice(0, 3).map(a => (
                    <div key={a.id} className="w-8 h-8 rounded-full bg-torii-subtle flex items-center justify-center animate-pulse">
                      <span className="text-xs font-serif text-torii">{a.kanji}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-charcoal/70">
                  Your team is getting started! Check back soon to see their progress.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-tenkai-border-light max-h-[500px] overflow-y-auto">
                {completedTasks.map((task, i) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 text-left transition-colors duration-fast',
                      'hover:bg-cream cursor-pointer',
                      i === 0 && 'animate-slide-in-task'
                    )}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="size-4 text-success" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-charcoal truncate">{task.title}</p>
                      <p className="text-xs text-warm-gray mt-0.5">
                        {task.agent_name} · {formatRelativeTime(task.completed_at)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">{contentTypeIcon(task.content_type)}</div>
                  </button>
                ))}
              </div>
            )}
            {completedTasks.length >= 10 && (
              <div className="p-3 border-t border-tenkai-border-light text-center">
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
            <div className="bg-ivory rounded-tenkai border border-tenkai-border shadow-tenkai-sm">
              {/* Header with count badge */}
              <div className="p-5 border-b border-tenkai-border-light flex items-center justify-between">
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
                <div className="p-8 text-center">
                  <CheckCircle className="size-8 text-success/40 mx-auto mb-2" />
                  <p className="text-sm text-charcoal/60">
                    You&#39;re all caught up! No items need your attention.
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                  {actionItems
                    .filter(i => !resolvedItems.has(i.id))
                    .map(item => (
                      <ActionItemCard
                        key={item.id}
                        item={{
                          id: item.id,
                          title: item.title,
                          type: item.type === 'content_approval' ? 'approval'
                            : item.type === 'agent_question' ? 'question'
                            : 'setup',
                          agentName: item.agent_name,
                          agentKanji: item.agent_kanji,
                          timestamp: formatRelativeTime(item.created_at),
                          preview: item.preview,
                        }}
                        onApproval={(id, action, feedback) => handleApproval(id, action, feedback)}
                        onAnswer={handleAnswer}
                        onSkip={handleSkip}
                      />
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Metrics Summary ────────────────────────────── */}
      <div>
        <h3 className="font-serif text-[15px] text-charcoal font-medium mb-3">Performance Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(metric => (
            <MetricCard
              key={metric.name}
              name={metric.name}
              value={metric.value}
              trend={metric.trend === 'flat' ? 'neutral' : metric.trend}
              changePct={metric.change_pct || undefined}
              period={metric.period}
              linkTo={metric.link_to}
            />
          ))}
        </div>
      </div>

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
