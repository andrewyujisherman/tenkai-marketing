import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@/lib/supabase'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

async function findClientForUser(userId: string, email: string) {
  const { data: byId } = await supabaseAdmin
    .from('clients')
    .select('id, notification_preferences')
    .eq('auth_user_id', userId)
    .single()

  if (byId) return byId

  const { data: byEmail } = await supabaseAdmin
    .from('clients')
    .select('id, notification_preferences')
    .eq('email', email.toLowerCase())
    .single()

  return byEmail
}

const DEFAULTS = {
  content_ready: true,
  weekly_report: true,
  strategy_updates: true,
  billing_alerts: true,
  audit_findings: false,
}

export async function GET() {
  const demo = await isDemoMode()

  if (demo) {
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('notification_preferences')
      .eq('id', DEMO_CLIENT_ID)
      .single()
    return NextResponse.json({
      preferences: { ...DEFAULTS, ...(client?.notification_preferences ?? {}) },
    })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await findClientForUser(user.id, user.email ?? '')
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  return NextResponse.json({
    preferences: { ...DEFAULTS, ...(client.notification_preferences ?? {}) },
  })
}

export async function PATCH(request: Request) {
  const demo = await isDemoMode()
  const body = await request.json()

  if (demo) {
    return NextResponse.json({ success: true })
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowed = ['content_ready', 'weekly_report', 'strategy_updates', 'billing_alerts', 'audit_findings']
  const safePrefs: Record<string, boolean> = {}
  for (const key of allowed) {
    if (body.preferences?.[key] !== undefined) safePrefs[key] = Boolean(body.preferences[key])
  }

  const client = await findClientForUser(user.id, user.email ?? '')
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('clients')
    .update({ notification_preferences: safePrefs })
    .eq('id', client.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
