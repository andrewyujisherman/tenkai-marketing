import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode } from '@/lib/demo'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const demo = await isDemoMode()
  let userEmail = 'demo@tenkai.com'

  let clientId: string | null = null

  if (!demo) {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    userEmail = user.email ?? 'client'

    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()
    clientId = client?.id ?? null
    if (!clientId && user.email) {
      const { data: byEmail } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', user.email.toLowerCase())
        .single()
      clientId = byEmail?.id ?? null
    }
  }

  // Verify ownership
  const { data: contentPost } = await supabaseAdmin
    .from('content_posts')
    .select('client_id')
    .eq('id', id)
    .single()

  if (!contentPost || (clientId !== null && contentPost.client_id !== clientId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('content_posts')
    .update({ status: 'approved' })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const { data: post } = await supabaseAdmin
    .from('content_posts')
    .select('client_id, title')
    .eq('id', id)
    .single()

  if (post) {
    await supabaseAdmin.from('approvals').insert({
      client_id: post.client_id,
      content_post_id: id,
      type: 'content',
      status: 'approved',
      title: post.title,
      agent_name: userEmail,
      resolved_at: new Date().toISOString(),
    })
  }

  return NextResponse.json({ success: true })
}
