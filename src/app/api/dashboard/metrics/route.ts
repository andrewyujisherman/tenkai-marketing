import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import { fetchGA4Data } from '@/lib/integrations/google-analytics'
import { fetchGSCData } from '@/lib/integrations/google-search-console'

export interface DashboardMetric {
  name: string
  value: string | number
  trend: 'up' | 'down' | 'flat'
  change_pct: string
  period: string
  link_to: string
}

export async function GET() {
  try {
    const demo = await isDemoMode()
    const supabase = await createServerClient()
    let clientId: string | null = null

    if (demo) {
      clientId = DEMO_CLIENT_ID
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      if (!client) {
        const { data: byEmail } = await supabaseAdmin
          .from('clients')
          .select('id')
          .eq('email', (user.email ?? '').toLowerCase())
          .single()
        clientId = byEmail?.id ?? null
      } else {
        clientId = client.id
      }
    }

    if (!clientId) {
      return NextResponse.json({ metrics: [] })
    }

    const db = demo ? supabaseAdmin : supabase

    // Fetch ALL independent data in parallel: audit, content counts, GA4/GSC integrations
    const [
      { data: auditData },
      { count: totalContent },
      { count: publishedContent },
      { data: ga4Integ },
      { data: gscInteg },
    ] = await Promise.all([
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
      supabaseAdmin
        .from('client_integrations')
        .select('metadata, status')
        .eq('client_id', clientId)
        .eq('integration_type', 'google_analytics')
        .single(),
      supabaseAdmin
        .from('client_integrations')
        .select('metadata, status')
        .eq('client_id', clientId)
        .eq('integration_type', 'google_search_console')
        .single(),
    ])

    // Fallback health score from deliverables
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

    // Fetch GA4 + GSC external data in parallel (the slow calls — fine here since client-side)
    const ga4PropertyId = ga4Integ?.status === 'active'
      ? (ga4Integ.metadata as Record<string, unknown> | null)?.property_id as string | undefined
      : undefined
    const gscSiteUrl = gscInteg?.status === 'active'
      ? (gscInteg.metadata as Record<string, unknown> | null)?.site_url as string | undefined
      : undefined

    const [ga4Data, gscData] = await Promise.all([
      ga4PropertyId
        ? fetchGA4Data(ga4PropertyId, { clientId }).catch(() => null)
        : Promise.resolve(null),
      gscSiteUrl
        ? fetchGSCData(gscSiteUrl, { clientId }).catch(() => null)
        : Promise.resolve(null),
    ])

    // Build Website Visits metric
    const websiteVisitsMetric: DashboardMetric = ga4Data && !ga4Data.error && ga4Data.sessions > 0
      ? {
          name: 'Website Visits',
          value: ga4Data.sessions.toLocaleString('en-US'),
          trend: 'flat',
          change_pct: '',
          period: 'Last 28 days',
          link_to: '/metrics?tab=traffic',
        }
      : {
          name: 'Website Visits',
          value: '--',
          trend: 'flat',
          change_pct: '',
          period: 'Connect analytics to track',
          link_to: '/metrics?tab=traffic',
        }

    // Build Keywords metric
    const topKeywordsCount = gscData && !gscData.error && gscData.topQueries
      ? gscData.topQueries.filter((q: { position: number }) => q.position <= 10).length
      : null

    const keywordsMetric: DashboardMetric = topKeywordsCount !== null
      ? {
          name: 'Keywords in Top 10',
          value: topKeywordsCount,
          trend: topKeywordsCount > 0 ? 'up' : 'flat',
          change_pct: '',
          period: 'Last 28 days',
          link_to: '/rankings',
        }
      : {
          name: 'Keywords in Top 10',
          value: '--',
          trend: 'flat',
          change_pct: '',
          period: 'Connect Search Console',
          link_to: '/rankings',
        }

    const metrics: DashboardMetric[] = [
      websiteVisitsMetric,
      keywordsMetric,
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

    return NextResponse.json({ metrics })
  } catch {
    return NextResponse.json({ metrics: [] })
  }
}
