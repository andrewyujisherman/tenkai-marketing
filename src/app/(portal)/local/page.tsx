import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import LocalClient, { LocalEmptyState } from './LocalClient'

export interface LocalDeliverable {
  id: string
  agent_name: string | null
  deliverable_type: string | null
  title: string | null
  summary: string | null
  score: number | null
  status: string | null
  content: string | null
  created_at: string
}

export default async function LocalPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

  let clientId: string | null = null

  if (demo) {
    clientId = DEMO_CLIENT_ID
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <LocalEmptyState />

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

    if (!clientId) return <LocalEmptyState />
  }

  const db = demo ? supabaseAdmin : supabase

  const [{ data: localData }, { data: gbpData }, { data: reviewData }] = await Promise.all([
    db
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, content, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['local_report'])
      .order('created_at', { ascending: false })
      .limit(20),
    db
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, content, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['gbp_report'])
      .order('created_at', { ascending: false })
      .limit(20),
    db
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, content, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['review_responses', 'campaign_templates'])
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const mapDeliverable = (d: Record<string, unknown>): LocalDeliverable => ({
    id: d.id as string,
    agent_name: (d.agent_name as string) ?? null,
    deliverable_type: (d.deliverable_type as string) ?? null,
    title: (d.title as string) ?? null,
    summary: (d.summary as string) ?? null,
    score: (d.score as number) ?? null,
    status: (d.status as string) ?? null,
    content: typeof d.content === 'string'
      ? d.content
      : d.content != null
        ? JSON.stringify(d.content)
        : null,
    created_at: d.created_at as string,
  })

  const localAudits: LocalDeliverable[] = (localData ?? []).map(mapDeliverable)
  const gbpReports: LocalDeliverable[] = (gbpData ?? []).map(mapDeliverable)
  const reviews: LocalDeliverable[] = (reviewData ?? []).map(mapDeliverable)

  if (localAudits.length === 0 && gbpReports.length === 0 && reviews.length === 0) {
    return <LocalEmptyState />
  }

  return (
    <LocalClient
      localAudits={localAudits}
      gbpReports={gbpReports}
      reviews={reviews}
    />
  )
}
