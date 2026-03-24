import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import ContentClient from './ContentClient'

async function getClientId(userId: string, email: string): Promise<string | null> {
  const { data: byId } = await supabaseAdmin
    .from('clients')
    .select('id, tier')
    .eq('auth_user_id', userId)
    .single()
  if (byId) return byId.id

  const { data: byEmail } = await supabaseAdmin
    .from('clients')
    .select('id, tier')
    .eq('email', email.toLowerCase())
    .single()
  return byEmail?.id ?? null
}

async function getClientTier(clientId: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from('clients')
    .select('tier')
    .eq('id', clientId)
    .single()
  return data?.tier ?? 'starter'
}

export interface ContentPost {
  id: string
  title: string
  status: string
  agent_author: string
  content_type: string
  created_at: string
  excerpt: string
  seo_score: number | null
  keywords: string[]
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

  const tier = await getClientTier(clientId)

  // Fetch all content posts for the library grid
  const { data: rows } = await supabaseAdmin
    .from('content_posts')
    .select('id, title, status, agent_author, content_type, created_at, content, seo_score, keywords')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(50)

  const posts: ContentPost[] = (rows ?? []).map((p) => ({
    id: p.id,
    title: p.title ?? 'Untitled',
    status: p.status === 'pending_approval' ? 'pending_review' : (p.status ?? 'draft'),
    agent_author: (p.agent_author as string) ?? 'Sakura',
    content_type: (p.content_type as string) ?? 'blog_post',
    created_at: p.created_at,
    excerpt: p.content ? String(p.content).slice(0, 200) : '',
    seo_score: p.seo_score as number | null,
    keywords: (p.keywords as string[]) ?? [],
  }))

  // Get monthly content generation count for quota display
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: monthlyCount } = await supabaseAdmin
    .from('content_posts')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .gte('created_at', monthStart)

  return (
    <ContentClient
      initialPosts={posts}
      tier={tier}
      monthlyContentCount={monthlyCount ?? 0}
    />
  )
}
