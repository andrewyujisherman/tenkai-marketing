import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode } from '@/lib/demo'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const demo = await isDemoMode()

  let clientId: string | null = null

  if (!demo) {
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

  const body = await req.json().catch(() => ({}))
  const feedback: string = body.feedback ?? ''

  if (!feedback) {
    return NextResponse.json({ error: 'feedback is required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('content_posts')
    .update({ client_feedback: feedback })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
