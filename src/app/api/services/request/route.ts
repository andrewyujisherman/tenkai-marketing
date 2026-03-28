import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAgentForRequest, REQUEST_TYPES } from '@/lib/agents'
import { processServiceRequest } from '@/lib/process-service-request'
import { tierAllowsRequestType, getRequiredTierForRequest } from '@/lib/tier-gates'

const VALID_REQUEST_TYPES = new Set(REQUEST_TYPES)

export const maxDuration = 120 // Allow up to 120s for Gemini processing on Vercel

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
    .select('id, website_url, tier')
    .eq('auth_user_id', user.id)
    .single()

  if (!client) {
    // Fallback to email match
    const { data: clientByEmail } = await supabaseAdmin
      .from('clients')
      .select('id, website_url, tier')
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
  client: { id: string; website_url: string | null; tier: string | null },
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

  // Tier gating
  if (!tierAllowsRequestType(client.tier, request_type)) {
    const required = getRequiredTierForRequest(request_type)
    return NextResponse.json(
      { error: `Your ${client.tier ?? 'starter'} plan does not include ${request_type}. Upgrade to ${required} or higher.` },
      { status: 403 }
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

  // Process the request inline (no queue worker needed)
  // Fire-and-forget: start processing but return immediately so the UI
  // can show "processing" status and poll for completion.
  const processPromise = processServiceRequest({
    id: serviceRequest.id,
    client_id: client.id,
    request_type,
    target_url: url,
    parameters: parameters ?? {},
    assigned_agent: agentId,
  }).catch((err) => {
    console.error(`[services/request] Background processing failed for ${serviceRequest.id}:`, err)
  })

  // Await with a 90s timeout so Vercel doesn't hang indefinitely.
  const timeoutMs = 90_000
  const abortController = new AbortController()
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs)

  try {
    await Promise.race([
      processPromise,
      new Promise<never>((_, reject) =>
        abortController.signal.addEventListener('abort', () =>
          reject(new Error('processing_timeout'))
        )
      ),
    ])
  } catch (err) {
    if (err instanceof Error && err.message === 'processing_timeout') {
      console.warn(`[services/request] Processing timed out for ${serviceRequest.id}`)
      await supabaseAdmin
        .from('service_requests')
        .update({ status: 'timeout' })
        .eq('id', serviceRequest.id)
    }
  } finally {
    clearTimeout(timeoutId)
  }

  // Re-fetch the updated status
  const { data: updated } = await supabaseAdmin
    .from('service_requests')
    .select('id, status, assigned_agent, created_at, completed_at')
    .eq('id', serviceRequest.id)
    .single()

  return NextResponse.json({ request: updated ?? serviceRequest }, { status: 201 })
}
