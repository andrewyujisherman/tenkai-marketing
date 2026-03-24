import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const { data: post, error } = await supabaseAdmin
    .from('content_posts')
    .select('id, title, content, status, agent_author, content_type, seo_score, ai_detection_score, keywords, client_feedback, created_at, updated_at')
    .eq('id', id)
    .eq('client_id', clientId)
    .single()

  if (error || !post) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: post.id,
    title: post.title,
    content: post.content,
    status: post.status === 'pending_approval' ? 'pending_review' : post.status,
    agent_author: post.agent_author ?? 'Sakura',
    content_type: post.content_type ?? 'blog_post',
    seo_score: post.seo_score ?? null,
    ai_detection_score: post.ai_detection_score ?? null,
    keywords: post.keywords ?? [],
    client_feedback: post.client_feedback ?? null,
    created_at: post.created_at,
    updated_at: post.updated_at,
  })
}
