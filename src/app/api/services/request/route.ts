import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAgentForRequest, REQUEST_TYPES } from '@/lib/agents'

const VALID_REQUEST_TYPES = new Set(REQUEST_TYPES)

export async function POST(request: Request) {
  // Authenticate
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find the client record for this user
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id, website_url')
    .eq('auth_user_id', user.id)
    .single()

  if (!client) {
    // Fallback to email match
    const { data: clientByEmail } = await supabaseAdmin
      .from('clients')
      .select('id, website_url')
      .eq('email', (user.email ?? '').toLowerCase())
      .single()

    if (!clientByEmail) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })
    }
    return createRequest(clientByEmail, request)
  }

  return createRequest(client, request)
}

async function createRequest(
  client: { id: string; website_url: string | null },
  request: Request
) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { request_type, target_url, parameters, priority } = body as {
    request_type?: string
    target_url?: string
    parameters?: Record<string, unknown>
    priority?: number
  }

  // Validate request_type
  if (!request_type || !VALID_REQUEST_TYPES.has(request_type as typeof REQUEST_TYPES[number])) {
    return NextResponse.json(
      { error: `Invalid request_type. Must be one of: ${Array.from(VALID_REQUEST_TYPES).join(', ')}` },
      { status: 400 }
    )
  }

  // Use provided URL, fall back to client's website URL
  const url = target_url ?? client.website_url
  if (!url) {
    return NextResponse.json(
      { error: 'target_url is required (no default URL on file)' },
      { status: 400 }
    )
  }

  // Validate priority if provided
  const safePriority = priority != null ? Math.max(1, Math.min(10, Number(priority) || 5)) : 5

  const agentId = getAgentForRequest(request_type)

  const { data: serviceRequest, error } = await supabaseAdmin
    .from('service_requests')
    .insert({
      client_id: client.id,
      request_type,
      target_url: url,
      parameters: parameters ?? {},
      assigned_agent: agentId,
      priority: safePriority,
    })
    .select('id, status, assigned_agent, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ request: serviceRequest }, { status: 201 })
}
