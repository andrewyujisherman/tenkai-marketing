import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

export async function GET(request: Request) {
  const demo = await isDemoMode()
  let clientId: string | null = null

  if (demo) {
    clientId = DEMO_CLIENT_ID
  } else {
    const supabase = await createServerClient()
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
      const { data: clientByEmail } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', (user.email ?? '').toLowerCase())
        .single()
      if (!clientByEmail) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }
      clientId = clientByEmail.id
    } else {
      clientId = client.id
    }
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limitParam = searchParams.get('limit')
  const offsetParam = searchParams.get('offset')

  const limit = Math.min(Math.max(parseInt(limitParam ?? '12', 10) || 12, 1), 50)
  const offset = Math.max(parseInt(offsetParam ?? '0', 10) || 0, 0)

  let query = supabaseAdmin
    .from('content_posts')
    .select('id, title, status, agent_author, content_type, created_at, content, seo_score, keywords', { count: 'exact' })
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    // Map frontend status names to DB values
    const statusMap: Record<string, string[]> = {
      pending_review: ['pending_approval'],
      approved: ['approved'],
      published: ['published'],
      rejected: ['rejected'],
      draft: ['draft'],
    }
    const dbStatuses = statusMap[status] ?? [status]
    query = query.in('status', dbStatuses)
  }

  const { data: rows, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const posts = (rows ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status === 'pending_approval' ? 'pending_review' : p.status,
    agent_author: p.agent_author ?? 'Sakura',
    content_type: p.content_type ?? 'blog_post',
    created_at: p.created_at,
    excerpt: p.content ? String(p.content).slice(0, 200) : '',
    seo_score: p.seo_score ?? null,
    keywords: p.keywords ?? [],
  }))

  return NextResponse.json({ posts, total: count ?? 0, limit, offset })
}
