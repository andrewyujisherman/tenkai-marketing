import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import { TENKAI_AGENTS, type AgentId } from '@/lib/agents'

const TIER_AGENT_LIMITS: Record<string, number> = {
  visibility: 5,
  growth: 7,
  done_for_you: 9,
}

export async function GET() {
  try {
    const demo = await isDemoMode()

    let clientId: string | undefined
    let tier = 'growth'

    if (demo) {
      clientId = DEMO_CLIENT_ID
    } else {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id, tier')
        .eq('auth_user_id', user.id)
        .single()

      clientId = client?.id
      tier = client?.tier ?? 'growth'

      if (!clientId) {
        const { data: byEmail } = await supabaseAdmin
          .from('clients')
          .select('id, tier')
          .eq('email', (user.email ?? '').toLowerCase())
          .single()
        clientId = byEmail?.id
        tier = byEmail?.tier ?? 'growth'
      }
    }

    if (!clientId) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Load custom names from client_agents table
    const { data: customAgents } = await supabaseAdmin
      .from('client_agents')
      .select('agent_id, custom_name')
      .eq('client_id', clientId)

    const customNameMap: Record<string, string> = {}
    if (customAgents) {
      for (const ca of customAgents) {
        customNameMap[ca.agent_id] = ca.custom_name
      }
    }

    const agentLimit = TIER_AGENT_LIMITS[tier] ?? 7
    const allAgentIds = Object.keys(TENKAI_AGENTS) as AgentId[]
    const visibleAgents = allAgentIds.slice(0, agentLimit)

    const agents = visibleAgents.map((id) => {
      const agent = TENKAI_AGENTS[id]
      return {
        id,
        name: agent.name,
        custom_name: customNameMap[id] ?? null,
        kanji: agent.kanji,
        role: agent.role,
        handles: [...agent.handles],
      }
    })

    return NextResponse.json({ agents, tier })
  } catch (err: unknown) {
    console.error('[agents] error:', err)
    return NextResponse.json({ error: 'Failed to load agents' }, { status: 500 })
  }
}
