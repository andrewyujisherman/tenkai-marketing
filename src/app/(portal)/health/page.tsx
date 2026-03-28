import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import HealthClient, { HealthEmptyState } from './HealthClient'

interface DbIssue {
  severity: 'critical' | 'warning' | 'passed'
  title: string
  description: string
  agent?: string
  recommendation?: string
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Your site is in great shape'
  if (score >= 50) return 'A few things to improve'
  return 'Needs attention'
}

function scoreColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 80) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

export default async function HealthPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

  let clientId: string | null = null
  let clientTier = 'starter'

  if (demo) {
    clientId = DEMO_CLIENT_ID
    clientTier = 'pro'
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <HealthEmptyState />

    const { data: client } = await supabase
      .from('clients')
      .select('id, tier')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    clientId =
      client?.id ??
      (await supabase
        .from('clients')
        .select('id, tier')
        .eq('email', (await supabase.auth.getUser()).data.user?.email ?? '')
        .maybeSingle()
        .then((r) => {
          if (r.data?.tier) clientTier = r.data.tier
          return r.data?.id
        })) ?? null

    if (client?.tier) clientTier = client.tier
    if (!clientId) return <HealthEmptyState />
  }

  const db = demo ? supabaseAdmin : supabase

  // Fetch audit data, vitals source, and recommendations in parallel
  const [
    { data: audit },
    { data: auditDeliverable },
    { data: technicalDeliverable },
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
      .select('id, content, score, created_at')
      .eq('client_id', clientId)
      .eq('deliverable_type', 'audit_report')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    db
      .from('deliverables')
      .select('id, content, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['technical_report', 'audit_report'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Determine health score
  let overallScore = 0
  let lastAuditAt: string | null = null

  if (audit && audit.overall_score != null) {
    overallScore = audit.overall_score
    lastAuditAt = audit.created_at
  } else if (auditDeliverable) {
    overallScore = auditDeliverable.score ?? 0
    lastAuditAt = auditDeliverable.created_at

    if (!overallScore && auditDeliverable.content) {
      try {
        const content = typeof auditDeliverable.content === 'string'
          ? JSON.parse(auditDeliverable.content)
          : auditDeliverable.content

        if (content?.categories) {
          const cats = content.categories as Record<string, { score?: number }>
          const scores = Object.values(cats)
            .map((c) => c.score)
            .filter((s): s is number => typeof s === 'number')
          if (scores.length > 0) {
            overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          }
        }
      } catch {
        // not parseable
      }
    }
  }

  // Parse Core Web Vitals
  interface VitalData {
    name: string
    display_name: string
    value: string
    unit: string
    status: 'pass' | 'fail' | 'unknown'
    explanation: string
  }

  const VITALS_MAP: Record<string, { display_name: string; unit: string; threshold: number; explanation: string }> = {
    lcp: {
      display_name: 'Page Load Speed',
      unit: 's',
      threshold: 2.5,
      explanation: 'How fast your main content loads — customers leave if it takes too long.',
    },
    fid: {
      display_name: 'Response Time',
      unit: 'ms',
      threshold: 100,
      explanation: 'How quickly your site responds when someone clicks a button.',
    },
    cls: {
      display_name: 'Visual Stability',
      unit: '',
      threshold: 0.1,
      explanation: 'How much your page shifts around while loading — annoying for visitors.',
    },
  }

  let vitalsData: Record<string, number> | null = null

  // Try audit content
  if (audit?.content) {
    try {
      const content = typeof audit.content === 'string'
        ? JSON.parse(audit.content)
        : audit.content
      vitalsData = content?.core_web_vitals ?? content?.vitals ?? null
    } catch { /* not parseable */ }
  }

  // Fallback to technical deliverable
  if (!vitalsData && technicalDeliverable?.content) {
    try {
      const content = typeof technicalDeliverable.content === 'string'
        ? JSON.parse(technicalDeliverable.content)
        : technicalDeliverable.content
      vitalsData = content?.core_web_vitals ?? content?.vitals ?? content?.categories?.technical?.vitals ?? null
    } catch { /* not parseable */ }
  }

  const vitals: VitalData[] = Object.entries(VITALS_MAP).map(([key, config]) => {
    const rawValue = vitalsData?.[key]
    const numValue = typeof rawValue === 'number' ? rawValue : 0

    let displayValue: string
    if (key === 'cls') {
      displayValue = numValue > 0 ? numValue.toFixed(3) : '--'
    } else if (key === 'lcp') {
      displayValue = numValue > 0 ? numValue.toFixed(1) : '--'
    } else {
      displayValue = numValue > 0 ? Math.round(numValue).toString() : '--'
    }

    return {
      name: key.toUpperCase(),
      display_name: config.display_name,
      value: displayValue,
      unit: config.unit,
      status: numValue > 0 ? (numValue <= config.threshold ? 'pass' : 'fail') : 'unknown',
      explanation: config.explanation,
    }
  })

  // Parse recommendations from audit issues
  let recommendations: Array<{ priority: string; title: string; description: string; agent?: string }> = []

  if (audit) {
    const issues: DbIssue[] = Array.isArray(audit.issues) ? audit.issues : []
    const recs: DbIssue[] = Array.isArray(audit.recommendations) ? audit.recommendations : []

    recommendations = [
      ...recs.map((r) => ({
        priority: r.severity === 'critical' ? 'high' : 'medium',
        title: r.title,
        description: r.description,
        agent: r.agent ?? 'Kenji',
      })),
      ...issues
        .filter((i) => i.severity === 'critical' || i.severity === 'warning')
        .map((i) => ({
          priority: i.severity === 'critical' ? 'high' : 'medium',
          title: i.title,
          description: i.recommendation ?? i.description,
          agent: i.agent ?? 'Kenji',
        })),
    ]
  } else if (auditDeliverable?.content) {
    try {
      const content = typeof auditDeliverable.content === 'string'
        ? JSON.parse(auditDeliverable.content)
        : auditDeliverable.content

      if (content?.categories) {
        const cats = content.categories as Record<string, { issues?: DbIssue[] }>
        const allIssues = Object.values(cats).flatMap((cat) =>
          Array.isArray(cat.issues) ? cat.issues : []
        )
        recommendations = allIssues
          .filter((i) => i.severity === 'critical' || i.severity === 'warning')
          .map((i) => ({
            priority: i.severity === 'critical' ? 'high' : 'medium',
            title: i.title,
            description: i.recommendation ?? i.description,
            agent: i.agent ?? 'Kenji',
          }))
      }
    } catch { /* not parseable */ }
  }

  const hasData = overallScore > 0 || vitals.some((v) => v.value !== '--') || recommendations.length > 0

  const { data: gscIntegration } = await supabaseAdmin
    .from('client_integrations')
    .select('status')
    .eq('client_id', clientId)
    .eq('integration_type', 'google_search_console')
    .maybeSingle()
  const gscConnected = gscIntegration?.status === 'active'

  return (
    <HealthClient
      score={overallScore}
      scoreLabel={scoreLabel(overallScore)}
      scoreColor={scoreColor(overallScore)}
      lastAuditAt={lastAuditAt}
      vitals={vitals}
      recommendations={recommendations}
      hasData={hasData}
      clientTier={clientTier}
      gscConnected={gscConnected}
    />
  )
}
