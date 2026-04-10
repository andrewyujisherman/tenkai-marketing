import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import { TENKAI_AGENTS, type AgentId } from '@/lib/agents'
import DashboardClient from './DashboardClient'

// Types shared with DashboardClient
export interface AgentStatus {
  id: string
  name: string
  custom_name: string | null
  kanji: string
  role: string
  status: 'working' | 'idle'
  current_task: string | null
}

export interface CompletedTask {
  id: string
  title: string
  agent_name: string
  agent_role: string
  content_type: string
  completed_at: string
  deliverable_id: string
}

export interface ActionItem {
  id: string
  type: 'content_approval' | 'agent_question' | 'setup_task' | 'report_review' | 'strategy_review' | 'profile_review'
  title: string
  agent_name: string
  agent_kanji?: string
  preview: string
  created_at: string
  content_id?: string
  deliverable_id?: string
}

export interface DashboardMetric {
  name: string
  value: string | number
  trend: 'up' | 'down' | 'flat'
  change_pct: string
  period: string
  link_to: string
}

export interface ProgressSnapshot {
  keywordsInTop10: number | null
  healthScore: number | null
  contentPublished: number
  asOf: string
}

export interface DashboardData {
  userName: string | null
  companyName: string | null
  briefing: {
    summary: string
    activity_count: number
    since: string
  }
  agents: AgentStatus[]
  completedTasks: CompletedTask[]
  actionItems: ActionItem[]
  actionItemCount: number
  metrics: DashboardMetric[]
  isNewUser: boolean
  processingCount: number
  firstAuditDate: string | null
  progress: {
    initial: ProgressSnapshot | null
    current: ProgressSnapshot | null
  }
  clientStartDate: string | null
  progressNarrative: string | null
}

function cleanTitle(title: string, contentType?: string, agentName?: string): string {
  const prefixMap: Record<string, string> = {
    'Outreach Emails:': 'Completed outreach email campaign',
    'Review Responses:': 'Reviewed and responded to business reviews',
    'Schema Markup:': 'Updated schema markup for SEO',
  }

  for (const [prefix, replacement] of Object.entries(prefixMap)) {
    if (title.startsWith(prefix)) return replacement
  }

  // Strip URLs
  const stripped = title.replace(/https?:\/\/[^\s]+/g, '').trim()
  if (stripped.length >= 10) return stripped

  // Fallback: generate from content type / agent name
  const ct = (contentType ?? '').toLowerCase()
  const ag = (agentName ?? '').toLowerCase()
  if (ct.includes('outreach') || ag.includes('outreach')) return 'Completed outreach campaign'
  if (ct.includes('blog') || ct.includes('article')) return 'Published blog post'
  if (ct.includes('schema')) return 'Updated schema markup for SEO'
  if (ct.includes('review')) return 'Reviewed and responded to business reviews'
  if (ct.includes('audit')) return 'Completed SEO audit report'
  if (ct.includes('report')) return 'Generated SEO performance report'
  return stripped.length > 0 ? stripped : 'Completed SEO task'
}

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()
  const { data: { user } } = await supabase.auth.getUser()

  let clientId: string | null = null
  let userName: string | null = null
  let companyName: string | null = null
  let lastSeen: string = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  if (demo) {
    clientId = DEMO_CLIENT_ID
    userName = 'Demo User'
    const { data: demoClient } = await supabaseAdmin
      .from('clients')
      .select('company_name, last_seen')
      .eq('id', DEMO_CLIENT_ID)
      .single()
    companyName = demoClient?.company_name ?? null
    if (demoClient?.last_seen) lastSeen = demoClient.last_seen
  } else if (user) {
    userName = user.user_metadata?.full_name ?? user.email ?? null

    const { data: byId } = await supabaseAdmin
      .from('clients')
      .select('id, company_name, last_seen')
      .eq('auth_user_id', user.id)
      .single()

    if (byId) {
      clientId = byId.id
      companyName = byId.company_name ?? null
      if (byId.last_seen) lastSeen = byId.last_seen
    } else {
      const { data: byEmail } = await supabaseAdmin
        .from('clients')
        .select('id, company_name, last_seen')
        .eq('email', (user.email ?? '').toLowerCase())
        .single()
      if (byEmail) {
        clientId = byEmail.id
        companyName = byEmail.company_name ?? null
        if (byEmail.last_seen) lastSeen = byEmail.last_seen
      }
    }
  }

  // Default empty data
  const data: DashboardData = {
    userName,
    companyName,
    briefing: { summary: '', activity_count: 0, since: lastSeen },
    agents: [],
    completedTasks: [],
    actionItems: [],
    actionItemCount: 0,
    metrics: [],
    isNewUser: false,
    processingCount: 0,
    firstAuditDate: null,
    progress: { initial: null, current: null },
    clientStartDate: null,
    progressNarrative: null,
  }

  if (!clientId) {
    return <DashboardClient data={data} />
  }

  const db = demo ? supabaseAdmin : supabase

  // Fetch ALL independent dashboard data in a single parallel batch
  const [
    { count: completedSinceLast },
    { count: pendingApprovalCount },
    { count: newDeliverableCount },
    { data: activeRequests },
    { data: recentDeliverables },
    { data: pendingApprovals },
    { data: pendingContent },
    { data: auditData },
    { count: totalContent },
    { count: publishedContent },
    { data: firstAudit },
    { data: clientRow },
  ] = await Promise.all([
    db.from('content_posts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .gte('created_at', lastSeen),
    db.from('approvals')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'pending'),
    db.from('deliverables')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .gte('created_at', lastSeen),
    db.from('service_requests')
      .select('id, request_type, status, created_at')
      .eq('client_id', clientId)
      .eq('status', 'processing')
      .order('created_at', { ascending: false })
      .limit(9),
    db.from('deliverables')
      .select('id, title, agent_name, deliverable_type, created_at, request_id, content')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(10),
    db.from('approvals')
      .select('id, content_post_id, title, type, agent_name, description, created_at', { count: 'exact' })
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
    db.from('content_posts')
      .select('id, title, agent_author, content_type, created_at')
      .eq('client_id', clientId)
      .in('status', ['draft', 'pending_review', 'pending_approval'])
      .order('created_at', { ascending: false })
      .limit(10),
    db.from('audits')
      .select('overall_score')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db.from('content_posts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId),
    db.from('content_posts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'published'),
    db.from('deliverables')
      .select('created_at')
      .eq('client_id', clientId)
      .eq('deliverable_type', 'audit_report')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from('clients')
      .select('created_at')
      .eq('id', clientId)
      .single(),
  ])

  // Build briefing
  const activityTotal = (completedSinceLast ?? 0) + (newDeliverableCount ?? 0)
  const pendingTotal = pendingApprovalCount ?? 0
  const briefingParts: string[] = []
  if (activityTotal > 0) {
    briefingParts.push(`Your team completed ${activityTotal} task${activityTotal !== 1 ? 's' : ''}`)
  }
  if (pendingTotal > 0) {
    briefingParts.push(`${pendingTotal} item${pendingTotal !== 1 ? 's' : ''} need${pendingTotal === 1 ? 's' : ''} your attention`)
  }
  if (briefingParts.length === 0) {
    briefingParts.push('Your team is hard at work. Nothing needs your attention right now.')
  }
  data.briefing = {
    summary: briefingParts.join('. ') + '.',
    activity_count: activityTotal,
    since: lastSeen,
  }

  // Build agent statuses
  const workingAgentNames = new Set(
    (activeRequests ?? []).map(r => {
      for (const [, agent] of Object.entries(TENKAI_AGENTS)) {
        if ((agent.handles as readonly string[]).includes(r.request_type)) {
          return agent.name
        }
      }
      return null
    }).filter(Boolean)
  )

  data.agents = Object.entries(TENKAI_AGENTS).map(([id, agent]) => {
    const activeReq = (activeRequests ?? []).find(r =>
      (agent.handles as readonly string[]).includes(r.request_type)
    )
    return {
      id: id as AgentId,
      name: agent.name,
      custom_name: null,
      kanji: agent.kanji,
      role: agent.role,
      status: workingAgentNames.has(agent.name) ? 'working' as const : 'idle' as const,
      current_task: activeReq
        ? `Working on ${activeReq.request_type.replace(/_/g, ' ')}`
        : null,
    }
  })

  // Build completed tasks
  data.completedTasks = (recentDeliverables ?? []).map(d => {
    const agentEntry = Object.values(TENKAI_AGENTS).find(
      ag => ag.name.toLowerCase() === (d.agent_name ?? '').toLowerCase()
    )
    return {
      id: d.id,
      title: cleanTitle(d.title ?? '', d.deliverable_type ?? '', d.agent_name ?? ''),
      agent_name: agentEntry?.name ?? d.agent_name ?? 'Tenkai Team',
      agent_role: agentEntry?.role ?? '',
      content_type: d.deliverable_type ?? 'report',
      completed_at: d.created_at,
      deliverable_id: d.id,
    }
  })

  // Build action items
  const approvalItems: ActionItem[] = (pendingApprovals ?? []).map(a => {
    const agentEntry = Object.values(TENKAI_AGENTS).find(ag => ag.name === a.agent_name)
    return {
      id: `approval-${a.id}`,
      type: 'content_approval' as const,
      title: a.title ?? 'Content needs your approval',
      agent_name: a.agent_name ?? 'Tenkai Team',
      agent_kanji: agentEntry?.kanji,
      preview: a.description ?? 'Review and approve this content.',
      created_at: a.created_at,
      content_id: a.content_post_id ?? undefined,
    }
  })

  const approvedContentIds = new Set(approvalItems.map(a => a.content_id).filter(Boolean))
  const contentItems: ActionItem[] = (pendingContent ?? [])
    .filter(p => !approvedContentIds.has(p.id))
    .map(p => {
      const agentEntry = Object.values(TENKAI_AGENTS).find(ag => ag.name === p.agent_author)
      return {
        id: `content-${p.id}`,
        type: 'content_approval' as const,
        title: p.title ?? 'Content ready for review',
        agent_name: p.agent_author ?? 'Tenkai Team',
        agent_kanji: agentEntry?.kanji,
        preview: `New ${(p.content_type ?? 'content').replace(/_/g, ' ')} is ready for your review.`,
        created_at: p.created_at,
        content_id: p.id,
      }
    })

  data.actionItems = [...approvalItems, ...contentItems]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 15)
  data.actionItemCount = data.actionItems.length

  // Build fast metrics (no external API calls — GA4/GSC fetched client-side)
  let healthScore: number | null = auditData?.overall_score ?? null
  if (healthScore === null) {
    const { data: auditDeliverable } = await db
      .from('deliverables')
      .select('score')
      .eq('client_id', clientId)
      .eq('deliverable_type', 'audit_report')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    healthScore = auditDeliverable?.score ?? null
  }

  // Placeholder metrics — GA4/GSC filled in client-side via /api/dashboard/metrics
  data.metrics = [
    {
      name: 'Website Visits',
      value: '--',
      trend: 'flat',
      change_pct: '',
      period: 'Loading...',
      link_to: '/metrics?tab=traffic',
    },
    {
      name: 'Keywords in Top 10',
      value: '--',
      trend: 'flat',
      change_pct: '',
      period: 'Loading...',
      link_to: '/rankings',
    },
    {
      name: 'Health Score',
      value: healthScore !== null ? `${healthScore}/100` : '--',
      trend: healthScore !== null ? (healthScore >= 70 ? 'up' : 'down') : 'flat',
      change_pct: '',
      period: healthScore !== null ? 'Latest audit' : 'Run an audit to see score',
      link_to: '/health',
    },
    {
      name: 'Content Published',
      value: publishedContent ?? 0,
      trend: (publishedContent ?? 0) > 0 ? 'up' : 'flat',
      change_pct: totalContent ? `${publishedContent ?? 0} of ${totalContent} total` : '',
      period: 'All time',
      link_to: '/content',
    },
  ]

  // Determine new user state: no completed deliverables + has processing requests
  const processingCount = (activeRequests ?? []).length
  const isNewUser = (recentDeliverables ?? []).length === 0 && processingCount > 0

  data.isNewUser = isNewUser
  data.processingCount = processingCount
  data.firstAuditDate = firstAudit?.created_at ?? null
  data.progressNarrative = null
  data.clientStartDate = clientRow?.created_at ?? null

  // First audit score (initial snapshot) — single conditional query
  if (firstAudit) {
    const { data: firstAuditScore } = await db
      .from('deliverables')
      .select('score')
      .eq('client_id', clientId)
      .eq('deliverable_type', 'audit_report')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    data.progress.initial = {
      keywordsInTop10: null,
      healthScore: firstAuditScore?.score ?? null,
      contentPublished: 0,
      asOf: firstAudit.created_at,
    }
  }

  // Current snapshot (without GA4/GSC — those come client-side)
  if (healthScore !== null || (publishedContent ?? 0) > 0) {
    data.progress.current = {
      keywordsInTop10: null,
      healthScore,
      contentPublished: publishedContent ?? 0,
      asOf: new Date().toISOString(),
    }
  }

  // Progress narrative (partial — keywords added client-side when available)
  if (data.progress.initial && data.progress.current && data.clientStartDate) {
    const ini = data.progress.initial
    const cur = data.progress.current
    const startDate = new Date(data.clientStartDate)
    const now = new Date()
    const months = Math.max(1,
      (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth())
    )
    const monthLabel = `${months} month${months !== 1 ? 's' : ''}`
    const parts: string[] = []

    if (ini.healthScore !== null && cur.healthScore !== null && cur.healthScore !== ini.healthScore) {
      const delta = cur.healthScore - ini.healthScore
      parts.push(delta > 0
        ? `Your website health improved from ${ini.healthScore} to ${cur.healthScore}`
        : `Health score shifted from ${ini.healthScore} to ${cur.healthScore}`)
    }
    if (cur.contentPublished > 0) {
      parts.push(`Your team published ${cur.contentPublished} article${cur.contentPublished !== 1 ? 's' : ''}`)
    }
    if (parts.length >= 2) {
      data.progressNarrative = `Since you joined ${monthLabel} ago: ${parts.join('. ')}.`
    }
  }

  return <DashboardClient data={data} />
}
