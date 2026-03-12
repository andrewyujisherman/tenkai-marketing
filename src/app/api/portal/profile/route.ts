import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = await findClientForUser(user.id, user.email ?? '')

  return NextResponse.json({ client, email: user.email })
}

export async function PATCH(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const allowed = ['name', 'company_name', 'website_url']
  const safeUpdates: Record<string, string> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) safeUpdates[key] = body[key]
  }

  const client = await findClientForUser(user.id, user.email ?? '')
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('clients')
    .update(safeUpdates)
    .eq('id', client.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
