import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import { getClientContext, saveClientContext } from '@/lib/client-context-store'
import type { ClientContextForm } from '@/lib/client-context'

async function findClientForUser(userId: string, email: string) {
  // Try auth_user_id first (after migration)
  const { data: byId } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('auth_user_id', userId)
    .single()

  if (byId) return byId

  // Fallback to email (before migration)
  const { data: byEmail } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  return byEmail
}

export async function GET() {
  const demo = await isDemoMode()

  if (demo) {
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', DEMO_CLIENT_ID)
      .single()
    const { form: context } = await getClientContext(DEMO_CLIENT_ID)
    return NextResponse.json({ client, context, email: client?.email ?? 'sarah@premierplumbing.com' })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = await findClientForUser(user.id, user.email ?? '')

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const { form: context } = await getClientContext(client.id)

  return NextResponse.json({ client, context, email: user.email })
}

export async function PATCH(request: Request) {
  const demo = await isDemoMode()
  const body = await request.json()

  if (demo) {
    // Demo mode: accept the save silently
    return NextResponse.json({ success: true })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = await findClientForUser(user.id, user.email ?? '')
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const form = body as ClientContextForm
  await saveClientContext(client.id, form, client.onboarding_data)

  return NextResponse.json({ success: true })
}
