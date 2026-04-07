// ============================================================
// Queue Processor — processes one chained/queued service request per call
// Designed for Vercel Cron (every 5 min) or manual trigger
// ============================================================

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { processServiceRequest } from '@/lib/process-service-request'
import { getAgentForRequest } from '@/lib/agents'
import { tierAllowsRequestType } from '@/lib/tier-gates'

export const maxDuration = 300 // 5 min for Vercel Pro; falls back to 60s on Hobby

export async function GET(request: Request) {
  // Verify cron secret (Vercel sets Authorization: Bearer <CRON_SECRET>)
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return processNext()
}

export async function POST(request: Request) {
  // Allow manual trigger with optional specific request_id
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let requestId: string | undefined
  try {
    const body = await request.json()
    requestId = body.request_id
  } catch {
    // no body — process oldest queued
  }

  return processNext(requestId)
}

async function processNext(requestId?: string) {
  // Find the target queued request
  let query = supabaseAdmin
    .from('service_requests')
    .select('id, client_id, request_type, target_url, parameters, assigned_agent, triggered_by')
    .eq('status', 'queued')

  if (requestId) {
    query = query.eq('id', requestId)
  } else {
    query = query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
  }

  const { data: rows, error: fetchError } = await query

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!rows || rows.length === 0) {
    return NextResponse.json({ processed: false, reason: 'no_queued_requests' })
  }

  const queued = rows[0]

  // Fetch client tier for auto-chaining
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('tier')
    .eq('id', queued.client_id)
    .single()

  // Defense-in-depth: reject requests the client's tier doesn't allow
  if (!tierAllowsRequestType(client?.tier ?? null, queued.request_type)) {
    await supabaseAdmin
      .from('service_requests')
      .update({ status: 'failed', error_message: `Tier "${client?.tier ?? 'starter'}" does not allow ${queued.request_type}` })
      .eq('id', queued.id)
    return NextResponse.json({
      processed: false,
      reason: 'tier_blocked',
      request_type: queued.request_type,
      tier: client?.tier ?? 'starter',
    })
  }

  const agentId = queued.assigned_agent ?? getAgentForRequest(queued.request_type)

  try {
    await processServiceRequest({
      id: queued.id,
      client_id: queued.client_id,
      request_type: queued.request_type,
      target_url: queued.target_url,
      parameters: (queued.parameters ?? {}) as Record<string, unknown>,
      assigned_agent: agentId,
      client_tier: client?.tier ?? null,
    })

    return NextResponse.json({
      processed: true,
      request_id: queued.id,
      request_type: queued.request_type,
      triggered_by: queued.triggered_by ?? null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ processed: false, request_id: queued.id, error: msg }, { status: 500 })
  }
}
