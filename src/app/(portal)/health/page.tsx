import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import { type IssueCardProps } from '@/components/portal/IssueCard'
import HealthClient, { HealthEmptyState } from './HealthClient'

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

export interface HealthDeliverable {
  id: string
  agent_name: string | null
  deliverable_type: string | null
  title: string | null
  summary: string | null
  content: string | null
  score: number | null
  status: string | null
  created_at: string
}

export default async function HealthPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

  let clientId: string | null = null

  if (demo) {
    clientId = DEMO_CLIENT_ID
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <HealthEmptyState />

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

    if (!clientId) return <HealthEmptyState />
  }

  const db = demo ? supabaseAdmin : supabase

  const [
    { data: audit },
    { data: technicalData },
    { data: onPageData },
    { data: auditDeliverable },
  ] = await Promise.all([
    db
      .from('audits')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, content, summary, score, status, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['technical_report', 'schema_code', 'redirect_config', 'robots_config', 'audit_report'])
      .order('created_at', { ascending: false })
      .limit(20),
    db
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, content, summary, score, status, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['on_page_report', 'meta_report'])
      .order('created_at', { ascending: false })
      .limit(20),
    // Fallback: get audit data from deliverables if audits table is empty
    db
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, content, summary, score, status, created_at')
      .eq('client_id', clientId)
      .eq('deliverable_type', 'audit_report')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const mapDeliverable = (d: Record<string, unknown>): HealthDeliverable => ({
    id: d.id as string,
    agent_name: (d.agent_name as string) ?? null,
    deliverable_type: (d.deliverable_type as string) ?? null,
    title: (d.title as string) ?? null,
    summary: (d.summary as string) ?? null,
    content: (d.content as string) ?? null,
    score: (d.score as number) ?? null,
    status: (d.status as string) ?? null,
    created_at: d.created_at as string,
  })

  const technicalDeliverables: HealthDeliverable[] = (technicalData ?? []).map(mapDeliverable)
  const onPageDeliverables: HealthDeliverable[] = (onPageData ?? []).map(mapDeliverable)

  // Parse audit_report deliverable content as fallback for audit data
  const auditContent = auditDeliverable?.content as Record<string, unknown> | null
  const categories = auditContent?.categories as Record<string, { score?: number; issues?: DbIssue[] }> | undefined

  const hasAuditSource = !!audit || !!auditDeliverable

  if (!hasAuditSource && technicalDeliverables.length === 0 && onPageDeliverables.length === 0) {
    return <HealthEmptyState />
  }

  // Overview data — prefer audits table, fall back to audit_report deliverable
  let overallScore: number
  let categoryScores: { label: string; score: number }[]
  let allIssues: DbIssue[]
  let recommendations: DbRecommendation[]

  if (audit) {
    overallScore = audit.overall_score ?? 0
    categoryScores = [
      { label: 'Technical', score: audit.technical_score ?? 0 },
      { label: 'Content', score: audit.content_score ?? 0 },
      { label: 'Authority', score: audit.authority_score ?? 0 },
    ]
    allIssues = Array.isArray(audit.issues) ? audit.issues : []
    recommendations = Array.isArray(audit.recommendations) ? audit.recommendations : []
  } else if (categories) {
    // Extract from audit_report deliverable content
    const techScore = categories.technical?.score ?? 0
    const contentScore = categories.content?.score ?? 0
    const authorityScore = categories.authority?.score ?? 0
    const uxScore = categories.user_experience?.score ?? 0
    overallScore = auditDeliverable?.score ?? Math.round((techScore + contentScore + authorityScore + uxScore) / 4)
    categoryScores = [
      { label: 'Technical', score: techScore },
      { label: 'Content', score: contentScore },
      { label: 'Authority', score: authorityScore },
    ]
    // Collect issues from all categories
    allIssues = Object.values(categories).flatMap((cat) =>
      Array.isArray(cat.issues) ? cat.issues : []
    )
    // Extract recommendations from issues
    recommendations = allIssues
      .filter((i) => i.severity === 'critical' || i.severity === 'warning')
      .map((i) => ({
        priority: i.severity === 'critical' ? 'high' : 'medium',
        title: i.title,
        description: (i as DbIssue & { recommendation?: string }).recommendation ?? i.description,
        agent: i.agent ?? 'Kenji',
      }))
  } else {
    overallScore = 0
    categoryScores = []
    allIssues = []
    recommendations = []
  }

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

  return (
    <HealthClient
      overallScore={overallScore}
      categoryScores={categoryScores}
      criticalIssues={criticalIssues}
      warningIssues={warningIssues}
      passedIssues={passedIssues}
      recommendations={recommendations}
      technicalDeliverables={technicalDeliverables}
      onPageDeliverables={onPageDeliverables}
      hasAudit={hasAuditSource}
    />
  )
}
