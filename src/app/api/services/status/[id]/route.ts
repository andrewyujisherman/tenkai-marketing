import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { TENKAI_AGENTS } from '@/lib/agents'
import type { AgentId } from '@/lib/agents'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Authenticate
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
  }

  // Fetch the service request
  const { data: serviceRequest, error } = await supabaseAdmin
    .from('service_requests')
    .select('id, client_id, request_type, target_url, status, assigned_agent, priority, attempts, max_attempts, error_message, created_at, started_at, completed_at')
    .eq('id', id)
    .single()

  if (error || !serviceRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  // Verify the user owns this request (or is admin)
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  const isAdmin = user.app_metadata?.role === 'admin'
  if (!isAdmin && (!client || client.id !== serviceRequest.client_id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Enrich with agent info
  const agentId = serviceRequest.assigned_agent as AgentId | null
  const agent = agentId ? TENKAI_AGENTS[agentId] : null

  return NextResponse.json({
    request: {
      ...serviceRequest,
      agent: agent ? { name: agent.name, kanji: agent.kanji, role: agent.role } : null,
    },
  })
}
