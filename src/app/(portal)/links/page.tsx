import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import LinksClient, { LinksEmptyState } from './LinksClient'

export interface LinkDeliverable {
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

export default async function LinksPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

  let clientId: string | null = null

  if (demo) {
    clientId = DEMO_CLIENT_ID
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <LinksEmptyState />

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

    if (!clientId) return <LinksEmptyState />
  }

  const db = demo ? supabaseAdmin : supabase

  const [
    { data: profileData },
    { data: outreachData },
    { data: directoryData },
  ] = await Promise.all([
    db
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, content, score, status, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['link_report'])
      .order('created_at', { ascending: false })
      .limit(20),
    db
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, content, score, status, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['outreach_templates', 'guest_post_draft', 'article'])
      .order('created_at', { ascending: false })
      .limit(20),
    db
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, content, score, status, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['directory_profiles'])
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const mapDeliverable = (d: Record<string, unknown>): LinkDeliverable => ({
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

  const profileDeliverables = (profileData ?? []).map(mapDeliverable)
  const outreachDeliverables = (outreachData ?? []).map(mapDeliverable)
  const directoryDeliverables = (directoryData ?? []).map(mapDeliverable)

  if (
    profileDeliverables.length === 0 &&
    outreachDeliverables.length === 0 &&
    directoryDeliverables.length === 0
  ) {
    return <LinksEmptyState />
  }

  return (
    <LinksClient
      profileDeliverables={profileDeliverables}
      outreachDeliverables={outreachDeliverables}
      directoryDeliverables={directoryDeliverables}
    />
  )
}
