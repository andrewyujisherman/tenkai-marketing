import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      agent_name: user.email ?? 'client',
      resolved_at: new Date().toISOString(),
    })
  }

  return NextResponse.json({ success: true })
}
