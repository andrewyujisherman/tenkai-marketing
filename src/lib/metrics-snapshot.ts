// ============================================================
// Monthly metrics snapshot capture — writes to client_metrics_history
// ============================================================

import { supabaseAdmin } from '@/lib/supabase-admin'
import { fetchGA4Data } from '@/lib/integrations/google-analytics'
import { fetchGSCData } from '@/lib/integrations/google-search-console'

export interface MetricsSnapshot {
  organic_traffic: number | null
  keyword_count_page1: number | null
  keyword_count_top10: number | null
  health_score: number | null
  backlink_count: number | null
  content_pieces_published: number
  domain_authority_estimate: number | null
}

export interface HistoryRow {
  id: string
  client_id: string
  snapshot_date: string
  metrics: MetricsSnapshot
  created_at: string
}

export async function captureMonthlySnapshot(clientId: string): Promise<void> {
  const snapshotDate = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  // Fetch integration metadata
  const [{ data: ga4Integ }, { data: gscInteg }] = await Promise.all([
    supabaseAdmin
      .from('client_integrations')
      .select('metadata, status')
      .eq('client_id', clientId)
      .eq('integration_type', 'google_analytics')
      .maybeSingle(),
    supabaseAdmin
      .from('client_integrations')
      .select('metadata, status')
      .eq('client_id', clientId)
      .eq('integration_type', 'google_search_console')
      .maybeSingle(),
  ])

  const ga4PropertyId = ga4Integ?.status === 'active'
    ? (ga4Integ.metadata as Record<string, unknown> | null)?.property_id as string | undefined
    : undefined
  const gscSiteUrl = gscInteg?.status === 'active'
    ? (gscInteg.metadata as Record<string, unknown> | null)?.site_url as string | undefined
    : undefined

  // Fetch live data + DB data in parallel
  const [ga4Data, gscData, auditRow, publishedCount] = await Promise.all([
    ga4PropertyId
      ? fetchGA4Data(ga4PropertyId, { clientId }).catch(() => null)
      : Promise.resolve(null),
    gscSiteUrl
      ? fetchGSCData(gscSiteUrl, { clientId }).catch(() => null)
      : Promise.resolve(null),
    supabaseAdmin
      .from('audits')
      .select('overall_score')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from('content_posts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'published'),
  ])

  // Extract health score — try audits table first, fallback to deliverables
  let healthScore: number | null = auditRow.data?.overall_score ?? null
  if (healthScore === null) {
    const { data: del } = await supabaseAdmin
      .from('deliverables')
      .select('score')
      .eq('client_id', clientId)
      .eq('deliverable_type', 'audit_report')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    healthScore = del?.score ?? null
  }

  const organicTraffic = ga4Data && !ga4Data.error && ga4Data.sessions > 0
    ? ga4Data.sessions as number
    : null

  const topQueries = gscData && !gscData.error && Array.isArray(gscData.topQueries)
    ? (gscData.topQueries as Array<{ position: number }>)
    : []
  const kwPage1 = topQueries.length > 0 ? topQueries.filter(q => q.position <= 10).length : null
  const kwTop10 = kwPage1 // alias — same metric, kept separate in schema for future granularity

  const metrics: MetricsSnapshot = {
    organic_traffic: organicTraffic,
    keyword_count_page1: kwPage1,
    keyword_count_top10: kwTop10,
    health_score: healthScore,
    backlink_count: null, // populated when link analysis deliverable is available
    content_pieces_published: publishedCount.count ?? 0,
    domain_authority_estimate: null,
  }

  // Upsert — one snapshot per client per day (unique constraint on client_id + snapshot_date)
  await supabaseAdmin
    .from('client_metrics_history')
    .upsert(
      { client_id: clientId, snapshot_date: snapshotDate, metrics },
      { onConflict: 'client_id,snapshot_date' }
    )
}

export async function getClientHistory(clientId: string, limit = 13): Promise<HistoryRow[]> {
  const { data } = await supabaseAdmin
    .from('client_metrics_history')
    .select('id, client_id, snapshot_date, metrics, created_at')
    .eq('client_id', clientId)
    .order('snapshot_date', { ascending: false })
    .limit(limit)

  return (data ?? []) as HistoryRow[]
}
