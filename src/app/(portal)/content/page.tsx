import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import ContentClient from './ContentClient'
import type { TopicCardProps } from '@/components/portal/TopicCard'
import type { DraftCardProps } from '@/components/portal/DraftCard'

type TopicItem = Omit<TopicCardProps, 'onApprove' | 'onEdit' | 'onDeny'> & { id: string }
type DraftItem = Omit<DraftCardProps, 'onApprove' | 'onRequestEdit' | 'onDeny'> & { id: string }
type PublishedItem = { id: string; title: string; date: string; seoScore: number | null; status: string; published_url: string | null }

export interface ContentDeliverable {
  id: string
  agent_name: string | null
  deliverable_type: string | null
  title: string | null
  summary: string | null
  score: number | null
  status: string | null
  created_at: string
  content?: Record<string, unknown> | string | null
}

export interface PlanningDeliverable {
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

export interface HealthDeliverable {
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

async function getClientId(userId: string, email: string): Promise<string | null> {
  const { data: byId } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('auth_user_id', userId)
    .single()
  if (byId) return byId.id

  const { data: byEmail } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()
  return byEmail?.id ?? null
}

export default async function ContentPage() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()
  const { data: { user } } = await supabase.auth.getUser()

  let clientId: string | null = null

  if (demo) {
    clientId = DEMO_CLIENT_ID
  } else {
    if (!user) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-warm-gray">Please sign in to view your content.</p>
        </div>
      )
    }
    clientId = await getClientId(user.id, user.email ?? '')
    if (!clientId) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-warm-gray">No client account found. Please contact support.</p>
        </div>
      )
    }
  }

  const [topicsRes, draftsRes, publishedRes, contentDeliverablesRes, planningRes, healthRes] = await Promise.all([
    supabaseAdmin
      .from('content_posts')
      .select('id, title, keywords, created_at')
      .eq('client_id', clientId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('content_posts')
      .select('id, title, agent_author, content, seo_score, ai_detection_score, created_at')
      .eq('client_id', clientId)
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('content_posts')
      .select('id, title, status, seo_score, published_url, created_at')
      .eq('client_id', clientId)
      .in('status', ['approved', 'published'])
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['content_draft', 'keyword_list'])
      .order('created_at', { ascending: false })
      .limit(20),
    supabaseAdmin
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, content, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['content_plan', 'cluster_map'])
      .order('created_at', { ascending: false })
      .limit(20),
    supabaseAdmin
      .from('deliverables')
      .select('id, agent_name, deliverable_type, title, summary, score, status, content, created_at')
      .eq('client_id', clientId)
      .in('deliverable_type', ['decay_report'])
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const topics: TopicItem[] = (topicsRes.data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    keywords: (p.keywords as string[]) ?? [],
    difficulty: 'Medium' as const,
    volume: '',
    status: 'pending' as const,
  }))

  const drafts: DraftItem[] = (draftsRes.data ?? []).map((p) => {
    const wordCount = p.content ? (p.content as string).split(/\s+/).filter(Boolean).length : 0
    return {
      id: p.id,
      title: p.title,
      author: (p.agent_author as string) ?? 'Sakura',
      wordCount,
      readingTime: Math.ceil(wordCount / 225) || 1,
      seoScore: (p.seo_score as number) ?? 0,
      aiScore: (p.ai_detection_score as number) ?? 0,
      eeatStatus: 'needs-input' as const,
      excerpt: p.content ? (p.content as string).slice(0, 250) : '',
      fullContent: (p.content as string) ?? '',
      checklist: [],
    }
  })

  const published: PublishedItem[] = (publishedRes.data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    date: new Date(p.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    seoScore: p.seo_score as number | null,
    status: p.status as string,
    published_url: p.published_url as string | null,
  }))

  const contentDeliverables: ContentDeliverable[] = (contentDeliverablesRes.data ?? []).map((d) => ({
    id: d.id,
    agent_name: d.agent_name ?? null,
    deliverable_type: d.deliverable_type ?? null,
    title: d.title ?? null,
    summary: d.summary ?? null,
    score: d.score ?? null,
    status: d.status ?? null,
    created_at: d.created_at,
  }))

  const planningDeliverables: PlanningDeliverable[] = (planningRes.data ?? []).map((d) => ({
    id: d.id,
    agent_name: d.agent_name ?? null,
    deliverable_type: d.deliverable_type ?? null,
    title: d.title ?? null,
    summary: d.summary ?? null,
    score: d.score ?? null,
    status: d.status ?? null,
    content: (d.content as Record<string, unknown> | string) ?? null,
    created_at: d.created_at,
  }))

  const healthDeliverables: HealthDeliverable[] = (healthRes.data ?? []).map((d) => ({
    id: d.id,
    agent_name: d.agent_name ?? null,
    deliverable_type: d.deliverable_type ?? null,
    title: d.title ?? null,
    summary: d.summary ?? null,
    score: d.score ?? null,
    status: d.status ?? null,
    content: (d.content as Record<string, unknown> | string) ?? null,
    created_at: d.created_at,
  }))

  return (
    <ContentClient
      initialTopics={topics}
      initialDrafts={drafts}
      publishedPosts={published}
      contentDeliverables={contentDeliverables}
      planningDeliverables={planningDeliverables}
      healthDeliverables={healthDeliverables}
    />
  )
}
