import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { onboarding_data } = await request.json()

  // Try auth_user_id first, fall back to email
  let client = null
  const { data: byId } = await supabaseAdmin
    .from('clients')
    .select('id, status')
    .eq('auth_user_id', user.id)
    .single()

  if (byId) {
    client = byId
  } else {
    const { data: byEmail } = await supabaseAdmin
      .from('clients')
      .select('id, status')
      .eq('email', (user.email ?? '').toLowerCase())
      .single()
    client = byEmail
  }

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const { error: updateError } = await supabaseAdmin
    .from('clients')
    .update({ onboarding_data, status: 'active' })
    .eq('id', client.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
