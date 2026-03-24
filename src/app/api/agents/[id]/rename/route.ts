import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode } from '@/lib/demo'
import { TENKAI_AGENTS, type AgentId } from '@/lib/agents'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const demo = await isDemoMode()
    const body = await req.json()
    const newName = (body.name ?? '').trim()

    // Validate agent ID
    if (!Object.keys(TENKAI_AGENTS).includes(agentId)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 })
    }

    // Validate name
    if (!newName || newName.length < 1 || newName.length > 20) {
      return NextResponse.json({ error: 'Name must be 1-20 characters' }, { status: 400 })
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(newName)) {
      return NextResponse.json({ error: 'Name can only contain letters, numbers, and spaces' }, { status: 400 })
    }

    if (demo) return NextResponse.json({ success: true, name: newName })

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let clientId: string | undefined
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    clientId = client?.id
    if (!clientId) {
      const { data: byEmail } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', (user.email ?? '').toLowerCase())
        .single()
      clientId = byEmail?.id
    }

    if (!clientId) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Check if the new name is the same as the original — if so, remove the custom name
    const originalName = TENKAI_AGENTS[agentId as AgentId].name
    if (newName === originalName) {
      await supabaseAdmin
        .from('client_agents')
        .delete()
        .eq('client_id', clientId)
        .eq('agent_id', agentId)
    } else {
      await supabaseAdmin
        .from('client_agents')
        .upsert(
          { client_id: clientId, agent_id: agentId, custom_name: newName },
          { onConflict: 'client_id,agent_id' }
        )
    }

    return NextResponse.json({ success: true, name: newName })
  } catch (err: unknown) {
    console.error('[agents/rename] error:', err)
    return NextResponse.json({ error: 'Failed to rename agent' }, { status: 500 })
  }
}
