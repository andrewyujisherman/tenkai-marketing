import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import DashboardClient from './DashboardClient'

export interface ActivityPost {
  id: string
  title: string | null
  status: string | null
  agent_name: string | null
  content_type: string | null
  created_at: string
  needs_approval: boolean
}

export interface PendingApproval {
  id: string
  content_post_id: string | null
  title: string | null
  type: string | null
  agent_name: string | null
  description: string | null
}

export interface Deliverable {
  id: string
  request_id: string | null
  agent_name: string | null
  deliverable_type: string | null
  title: string | null
  summary: string | null
  score: number | null
  status: string | null
  created_at: string
  content: Record<string, unknown> | string | null
}

export interface DashboardStats {
  totalContent: number
  pendingApprovals: number
  auditScore: number | null
  publishedContent: number
}

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

  const { data: { user } } = await supabase.auth.getUser()

  let clientRecord: { id: string; company_name?: string | null; website_url?: string | null } | null = null
  let pendingApprovals: PendingApproval[] = []
  let activityPosts: ActivityPost[] = []
  let recentDeliverables: Deliverable[] = []
  let stats: DashboardStats = {
    totalContent: 0,
    pendingApprovals: 0,
    auditScore: null,
    publishedContent: 0,
  }
  let userName: string | null = null

  if (demo) {
    const { data: demoClient } = await supabaseAdmin
      .from('clients')
      .select('id, company_name, website_url')
      .eq('id', DEMO_CLIENT_ID)
      .single()
    clientRecord = demoClient ?? null
    userName = 'Demo User'
  } else if (user) {
    userName = user.user_metadata?.full_name ?? user.email ?? null

    const { data: clientData } = await supabase
      .from('clients')
      .select('id, company_name, website_url')
      .eq('email', user.email)
      .single()

    clientRecord = clientData ?? null
  }

  if (clientRecord) {
    const db = demo ? supabaseAdmin : supabase
    const clientId = demo ? DEMO_CLIENT_ID : clientRecord.id

    const [
      { count: totalCount },
      { count: publishedCount },
      { data: approvalsData, count: pendingCount },
      { data: postsData },
      { data: auditData },
      { data: deliverablesData },
    ] = await Promise.all([
      db
        .from('content_posts')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId),

      db
        .from('content_posts')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('status', 'published'),

      db
        .from('approvals')
        .select('id, content_post_id, title, type, agent_name, description', { count: 'exact' })
        .eq('client_id', clientId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5),

      db
        .from('content_posts')
        .select('id, title, status, agent_author, content_type, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10),

      db
        .from('audits')
        .select('overall_score')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),

      db
        .from('deliverables')
        .select('id, request_id, agent_name, deliverable_type, title, summary, score, status, content, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    stats = {
      totalContent: totalCount ?? 0,
      pendingApprovals: pendingCount ?? 0,
      auditScore: auditData?.overall_score ?? null,
      publishedContent: publishedCount ?? 0,
    }

    pendingApprovals = (approvalsData ?? []).map((a) => ({
      id: a.id,
      content_post_id: a.content_post_id ?? null,
      title: a.title ?? null,
      type: a.type ?? null,
      agent_name: a.agent_name ?? null,
      description: a.description ?? null,
    }))

    activityPosts = (postsData ?? []).map((p) => ({
      id: p.id,
      title: p.title ?? null,
      status: p.status ?? null,
      agent_name: p.agent_author ?? null,
      content_type: p.content_type ?? null,
      created_at: p.created_at,
      needs_approval: p.status === 'draft' || p.status === 'pending_review',
    }))

    recentDeliverables = (deliverablesData ?? []).map((d) => ({
      id: d.id,
      request_id: d.request_id ?? null,
      agent_name: d.agent_name ?? null,
      deliverable_type: d.deliverable_type ?? null,
      title: d.title ?? null,
      summary: d.summary ?? null,
      score: d.score ?? null,
      status: d.status ?? null,
      created_at: d.created_at,
      content: (d.content as Record<string, unknown> | string | null) ?? null,
    }))
  }

  return (
    <DashboardClient
      client={clientRecord}
      userName={userName}
      pendingApprovals={pendingApprovals}
      activityPosts={activityPosts}
      stats={stats}
      recentDeliverables={recentDeliverables}
    />
  )
}
