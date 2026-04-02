import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import { TENKAI_AGENTS, type AgentId } from '@/lib/agents'

function cleanTitle(title: string, contentType?: string, agentName?: string): string {
  const prefixMap: Record<string, string> = {
    'Outreach Emails:': 'Completed outreach email campaign',
    'Review Responses:': 'Reviewed and responded to business reviews',
    'Schema Markup:': 'Updated schema markup for SEO',
  }

  for (const [prefix, replacement] of Object.entries(prefixMap)) {
    if (title.startsWith(prefix)) return replacement
  }

  // Strip URLs
  const stripped = title.replace(/https?:\/\/[^\s]+/g, '').trim()
  if (stripped.length >= 10) return stripped

  // Fallback: generate from content type / agent name
  const ct = (contentType ?? '').toLowerCase()
  const ag = (agentName ?? '').toLowerCase()
  if (ct.includes('outreach') || ag.includes('outreach')) return 'Completed outreach campaign'
  if (ct.includes('blog') || ct.includes('article')) return 'Published blog post'
  if (ct.includes('schema')) return 'Updated schema markup for SEO'
  if (ct.includes('review')) return 'Reviewed and responded to business reviews'
  if (ct.includes('audit')) return 'Completed SEO audit report'
  if (ct.includes('report')) return 'Generated SEO performance report'
  return stripped.length > 0 ? stripped : 'Completed SEO task'
}

export async function GET() {
  try {
    const demo = await isDemoMode()
    const supabase = await createServerClient()
    let clientId: string | null = null

    if (demo) {
      clientId = DEMO_CLIENT_ID
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      if (!client) {
        const { data: byEmail } = await supabaseAdmin
          .from('clients')
          .select('id')
          .eq('email', (user.email ?? '').toLowerCase())
          .single()
        clientId = byEmail?.id ?? null
      } else {
        clientId = client.id
      }
    }

    if (!clientId) {
      return NextResponse.json({ agents: [], completed_tasks: [] })
    }

    const db = demo ? supabaseAdmin : supabase

    // Get in-progress service requests and recent deliverables
    const [
      { data: activeRequests },
      { data: completedTasks },
    ] = await Promise.all([
      db.from('service_requests')
        .select('id, request_type, status, created_at')
        .eq('client_id', clientId)
        .in('status', ['processing', 'queued'])
        .order('created_at', { ascending: false })
        .limit(9),
      db.from('deliverables')
        .select('id, title, agent_name, deliverable_type, created_at, request_id')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // Fetch triggered_by chain info for completed tasks
    const requestIds = (completedTasks ?? []).map((d) => d.request_id).filter(Boolean) as string[]
    const triggeredByMap = new Map<string, { triggered_by: string | null; request_type: string }>()
    const parentTypeMap = new Map<string, string>()

    if (requestIds.length > 0) {
      const { data: reqData } = await supabaseAdmin
        .from('service_requests')
        .select('id, triggered_by, request_type')
        .in('id', requestIds)

      if (reqData) {
        for (const r of reqData) {
          triggeredByMap.set(r.id, { triggered_by: r.triggered_by ?? null, request_type: r.request_type })
        }
        const parentIds = reqData.map((r) => r.triggered_by).filter(Boolean) as string[]
        if (parentIds.length > 0) {
          const { data: parents } = await supabaseAdmin
            .from('service_requests')
            .select('id, request_type')
            .in('id', parentIds)
          if (parents) {
            for (const p of parents) parentTypeMap.set(p.id, p.request_type)
          }
        }
      }
    }

    // Build agent statuses from the TENKAI_AGENTS registry
    const workingAgentNames = new Set(
      (activeRequests ?? []).map(r => {
        for (const [, agent] of Object.entries(TENKAI_AGENTS)) {
          if ((agent.handles as readonly string[]).includes(r.request_type)) {
            return agent.name
          }
        }
        return null
      }).filter(Boolean)
    )

    const agents = Object.entries(TENKAI_AGENTS).map(([id, agent]) => {
      const activeReq = (activeRequests ?? []).find(r =>
        (agent.handles as readonly string[]).includes(r.request_type)
      )
      return {
        id: id as AgentId,
        name: agent.name,
        custom_name: null,
        kanji: agent.kanji,
        role: agent.role,
        status: workingAgentNames.has(agent.name) ? 'working' as const : 'idle' as const,
        current_task: activeReq
          ? `Working on ${activeReq.request_type.replace(/_/g, ' ')}`
          : null,
      }
    })

    const completed = (completedTasks ?? []).map(d => {
      const agentEntry = Object.values(TENKAI_AGENTS).find(
        ag => ag.name.toLowerCase() === (d.agent_name ?? '').toLowerCase()
      )
      const reqInfo = d.request_id ? triggeredByMap.get(d.request_id) : null
      const parentType = reqInfo?.triggered_by ? parentTypeMap.get(reqInfo.triggered_by) : null
      return {
        id: d.id,
        title: cleanTitle(d.title ?? '', d.deliverable_type ?? '', d.agent_name ?? ''),
        agent_name: agentEntry?.name ?? d.agent_name ?? 'Tenkai Team',
        agent_role: agentEntry?.role ?? '',
        content_type: d.deliverable_type ?? 'report',
        completed_at: d.created_at,
        deliverable_id: d.id,
        triggered_by_type: parentType
          ? parentType.replace(/_/g, ' ')
          : null,
      }
    })

    return NextResponse.json({ agents, completed_tasks: completed })
  } catch {
    return NextResponse.json({ agents: [], completed_tasks: [] })
  }
}
