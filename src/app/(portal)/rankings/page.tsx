import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import RankingsClient, { RankingsEmptyState } from './RankingsClient'

interface KeywordRecord {
  keyword?: string
  position?: number
  change?: number
  trend?: number[]
  page_url?: string
  recommendation?: string
}

export default async function RankingsPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

  let clientId: string | null = null
  let clientTier = 'starter'

  if (demo) {
    clientId = DEMO_CLIENT_ID
    clientTier = 'pro'
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <RankingsEmptyState />

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
    if (!clientId) return <RankingsEmptyState />
  }

  const db = demo ? supabaseAdmin : supabase

  // Fetch keyword data and strategy deliverable in parallel
  const [
    { data: keywordDeliverables },
    { data: strategyDeliverable },
  ] = await Promise.all([
    db
      .from('deliverables')
      .select('content, score, created_at')
      .eq('client_id', clientId)
      .eq('deliverable_type', 'keyword_list')
      .order('created_at', { ascending: false })
      .limit(5),
    db
      .from('deliverables')
      .select('id, title, content, summary, agent_name, status, created_at')
      .eq('client_id', clientId)
      .eq('deliverable_type', 'keyword_list')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Parse keywords from latest deliverable
  let keywords: KeywordRecord[] = []

  if (keywordDeliverables && keywordDeliverables.length > 0) {
    const latest = keywordDeliverables[0]
    try {
      const content = typeof latest.content === 'string'
        ? JSON.parse(latest.content)
        : latest.content

      if (content?.keywords && Array.isArray(content.keywords)) {
        keywords = content.keywords
      } else if (Array.isArray(content)) {
        keywords = content
      }
    } catch {
      // not parseable
    }
  }

  const hasData = keywords.length > 0

  // Compute overview
  const positions = keywords
    .map((k) => k.position)
    .filter((p): p is number => typeof p === 'number' && p > 0)

  const avgPosition = positions.length > 0
    ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10
    : 0

  const improving = keywords.filter((k) => typeof k.change === 'number' && k.change > 0).length
  const declining = keywords.filter((k) => typeof k.change === 'number' && k.change < 0).length

  const period = keywordDeliverables?.[0]?.created_at
    ? `Updated ${new Date(keywordDeliverables[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : 'No data yet'

  const overview = {
    avg_position: avgPosition,
    total_keywords: keywords.length,
    improving,
    declining,
    period,
  }

  const formattedKeywords = keywords.map((k) => ({
    keyword: k.keyword ?? 'Unknown',
    position: k.position ?? 0,
    change: k.change ?? 0,
    trend: Array.isArray(k.trend) ? k.trend : [],
    page_url: k.page_url ?? '',
    recommendation: k.recommendation ?? '',
  }))

  const strategy = strategyDeliverable
    ? {
        id: strategyDeliverable.id as string,
        title: (strategyDeliverable.title as string) ?? null,
        content: (strategyDeliverable.content as string) ?? null,
        summary: (strategyDeliverable.summary as string) ?? null,
        agent_name: (strategyDeliverable.agent_name as string) ?? null,
        status: (strategyDeliverable.status as string) ?? null,
        created_at: strategyDeliverable.created_at as string,
      }
    : null

  return (
    <RankingsClient
      overview={overview}
      keywords={formattedKeywords}
      totalKeywords={keywords.length}
      strategy={strategy}
      clientTier={clientTier}
      hasData={hasData}
    />
  )
}
