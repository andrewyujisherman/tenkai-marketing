import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

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
    return NextResponse.json({ client, email: client?.email ?? 'sarah@premierplumbing.com' })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = await findClientForUser(user.id, user.email ?? '')

  return NextResponse.json({ client, email: user.email })
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

  const allowed = ['name', 'company_name', 'website_url']
  const safeUpdates: Record<string, string> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) safeUpdates[key] = body[key]
  }

  const client = await findClientForUser(user.id, user.email ?? '')
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  // Handle industry separately — stored in onboarding_data JSON
  if (body.industry !== undefined) {
    const existingData = client.onboarding_data ?? {}
    safeUpdates.onboarding_data = { ...existingData, industry: body.industry }
  }

  const { error } = await supabaseAdmin
    .from('clients')
    .update(safeUpdates)
    .eq('id', client.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
