import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import { type IssueCardProps } from '@/components/portal/IssueCard'
import AuditClient, { AuditEmptyState } from './AuditClient'

interface DbIssue {
  severity: 'critical' | 'warning' | 'passed'
  title: string
  description: string
  agent?: string
  affected_count?: number
}

interface DbRecommendation {
  priority: string
  title: string
  description: string
  agent?: string
}

export interface AuditDeliverable {
  id: string
  agent_name: string | null
  deliverable_type: string | null
  title: string | null
  summary: string | null
  score: number | null
  status: string | null
  created_at: string
}

export default async function AuditPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

  let clientId: string | null = null

  if (demo) {
    clientId = DEMO_CLIENT_ID
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <AuditEmptyState />

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    clientId =
      client?.id ??
      (await supabase
        .from('clients')
        .select('id')
        .eq('email', (await supabase.auth.getUser()).data.user?.email ?? '')
        .maybeSingle()
        .then((r) => r.data?.id)) ?? null

    if (!clientId) return <AuditEmptyState />
  }

  const db = demo ? supabaseAdmin : supabase

  const [{ data: audit }, { data: auditDeliverablesData }] = await Promise.all([
    db
      .from('audits')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['audit_report', 'technical_report'])
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const auditDeliverables: AuditDeliverable[] = (auditDeliverablesData ?? []).map((d) => ({
    id: d.id,
    agent_name: d.agent_name ?? null,
    deliverable_type: d.deliverable_type ?? null,
    title: d.title ?? null,
    summary: d.summary ?? null,
    score: d.score ?? null,
    status: d.status ?? null,
    created_at: d.created_at,
  }))

  if (!audit && auditDeliverables.length === 0) return <AuditEmptyState />

  const overallScore: number = audit?.overall_score ?? 0
  const categoryScores = audit ? [
    { label: 'Technical', score: audit.technical_score ?? 0 },
    { label: 'Content', score: audit.content_score ?? 0 },
    {
      label: 'On-Page',
      score: Math.round(((audit.technical_score ?? 0) + (audit.content_score ?? 0)) / 2),
    },
    { label: 'Off-Page', score: audit.authority_score ?? 0 },
  ] : []

  const allIssues: DbIssue[] = audit && Array.isArray(audit.issues) ? audit.issues : []

  const toIssueCard = (issue: DbIssue): IssueCardProps => ({
    severity: issue.severity,
    title: issue.title,
    description: issue.description,
    agent: issue.agent ?? 'Kenji',
    affectedCount: issue.affected_count,
    actionLabel:
      issue.severity === 'critical'
        ? 'Fix Now'
        : issue.severity === 'passed'
          ? 'View'
          : 'View Details',
  })

  const criticalIssues = allIssues.filter((i) => i.severity === 'critical').map(toIssueCard)
  const warningIssues = allIssues.filter((i) => i.severity === 'warning').map(toIssueCard)
  const passedIssues = allIssues.filter((i) => i.severity === 'passed').map(toIssueCard)

  const recommendations: DbRecommendation[] = audit && Array.isArray(audit.recommendations)
    ? audit.recommendations
    : []

  return (
    <AuditClient
      overallScore={overallScore}
      categoryScores={categoryScores}
      criticalIssues={criticalIssues}
      warningIssues={warningIssues}
      passedIssues={passedIssues}
      recommendations={recommendations}
      auditDeliverables={auditDeliverables}
    />
  )
}
