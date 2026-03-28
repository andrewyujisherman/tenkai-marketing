import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('onboarding_draft')
    .eq('auth_user_id', user.id)
    .single()

  if (!client) {
    // Try email fallback
    const { data: byEmail } = await supabaseAdmin
      .from('clients')
      .select('onboarding_draft')
      .eq('email', (user.email ?? '').toLowerCase())
      .single()

    return NextResponse.json({ draft: byEmail?.onboarding_draft ?? null })
  }

  return NextResponse.json({ draft: client.onboarding_draft ?? null })
}

export async function PUT(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const draft = body.draft

  // Try auth_user_id first
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  const clientId = client?.id
  if (!clientId) {
    const { data: byEmail } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', (user.email ?? '').toLowerCase())
      .single()

    if (!byEmail) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    await supabaseAdmin
      .from('clients')
      .update({ onboarding_draft: draft })
      .eq('id', byEmail.id)

    return NextResponse.json({ ok: true })
  }

  await supabaseAdmin
    .from('clients')
    .update({ onboarding_draft: draft })
    .eq('id', clientId)

  return NextResponse.json({ ok: true })
}
