import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import ReportsClient, { type ReportData } from './ReportsClient'

export default async function ReportsPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

  let clientId: string | null = null

  if (demo) {
    clientId = DEMO_CLIENT_ID
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <ReportsClient reports={[]} />

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
        .eq('email', user.email ?? '')
        .maybeSingle()
        .then((r) => r.data?.id)) ?? null

    if (!clientId) return <ReportsClient reports={[]} />
  }

  const db = demo ? supabaseAdmin : supabase

  const { data: rows } = await db
    .from('reports')
    .select('id, type, period_start, period_end, metrics, insights, agent_commentary, created_at')
    .eq('client_id', clientId)
    .order('period_end', { ascending: false })

  const reports: ReportData[] = (rows ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    period_start: r.period_start,
    period_end: r.period_end,
    metrics: r.metrics ?? {},
    insights: Array.isArray(r.insights) ? r.insights : [],
    agent_commentary: r.agent_commentary ?? { recommendations: [] },
  }))

  return <ReportsClient reports={reports} />
}
