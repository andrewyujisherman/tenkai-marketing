import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  // Authenticate
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find the client record
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!client) {
    // Fallback to email match
    const { data: clientByEmail } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', (user.email ?? '').toLowerCase())
      .single()

    if (!clientByEmail) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })
    }
    return fetchDeliverables(clientByEmail.id, request)
  }

  return fetchDeliverables(client.id, request)
}

async function fetchDeliverables(clientId: string, request: Request) {
  const { searchParams } = new URL(request.url)

  const requestId = searchParams.get('request_id')
  const limitParam = searchParams.get('limit')
  const offsetParam = searchParams.get('offset')

  const limit = Math.min(Math.max(parseInt(limitParam ?? '20', 10) || 20, 1), 100)
  const offset = Math.max(parseInt(offsetParam ?? '0', 10) || 0, 0)

  let query = supabaseAdmin
    .from('deliverables')
    .select('id, request_id, agent_name, deliverable_type, title, content, summary, score, status, client_feedback, created_at, updated_at', { count: 'exact' })
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (requestId) {
    query = query.eq('request_id', requestId)
  }

  const { data: deliverables, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    deliverables: deliverables ?? [],
    total: count ?? 0,
    limit,
    offset,
  })
}
