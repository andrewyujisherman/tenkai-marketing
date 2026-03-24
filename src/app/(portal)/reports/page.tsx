import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import ReportsClient from './ReportsClient'

export interface ReportData {
  id: string
  type: string
  period_start: string
  period_end: string
  metrics: Record<string, unknown>
  insights: string[]
  agent_commentary: { recommendations: string[] }
}

export interface ReportDeliverable {
  id: string
  agent_name: string | null
  deliverable_type: string | null
  title: string | null
  summary: string | null
  score: number | null
  status: string | null
  content: Record<string, unknown> | string | null
  created_at: string
}

export default async function ReportsPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

  let clientId: string | null = null

  if (demo) {
    clientId = DEMO_CLIENT_ID
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <ReportsClient reports={[]} />

    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    clientId =
      client?.id ??
      (await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', (user.email ?? '').toLowerCase())
        .single()
        .then((r) => r.data?.id)) ?? null

    if (!clientId) return <ReportsClient reports={[]} />
  }

  const db = demo ? supabaseAdmin : supabase

  const [
    { data: rows },
    { data: keywordRows },
    { data: competitorRows },
    { data: analyticsRows },
    { data: aiRows },
  ] = await Promise.all([
    db.from('reports')
      .select('id, type, period_start, period_end, metrics, insights, agent_commentary, created_at')
      .eq('client_id', clientId)
      .order('period_end', { ascending: false }),
    db.from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, content, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['keyword_list'])
      .order('created_at', { ascending: false })
      .limit(20),
    db.from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, content, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['competitive_report'])
      .order('created_at', { ascending: false })
      .limit(20),
    db.from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, content, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['analytics_report', 'performance_report', 'audit_report'])
      .order('created_at', { ascending: false })
      .limit(20),
    db.from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, content, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['geo_report', 'entity_report'])
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const reports: ReportData[] = (rows ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    period_start: r.period_start,
    period_end: r.period_end,
    metrics: r.metrics ?? {},
    insights: Array.isArray(r.insights) ? r.insights : [],
    agent_commentary: r.agent_commentary ?? { recommendations: [] },
  }))

  const mapDeliverable = (d: Record<string, unknown>): ReportDeliverable => ({
    id: d.id as string,
    agent_name: (d.agent_name as string) ?? null,
    deliverable_type: (d.deliverable_type as string) ?? null,
    title: (d.title as string) ?? null,
    summary: (d.summary as string) ?? null,
    score: (d.score as number) ?? null,
    status: (d.status as string) ?? null,
    content: (d.content as Record<string, unknown> | string) ?? null,
    created_at: d.created_at as string,
  })

  return (
    <ReportsClient
      reports={reports}
      keywordDeliverables={(keywordRows ?? []).map(mapDeliverable)}
      competitorDeliverables={(competitorRows ?? []).map(mapDeliverable)}
      analyticsDeliverables={(analyticsRows ?? []).map(mapDeliverable)}
      aiDeliverables={(aiRows ?? []).map(mapDeliverable)}
    />
  )
}
