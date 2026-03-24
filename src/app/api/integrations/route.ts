import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

const INTEGRATION_DEFS = [
  { type: 'google_search_console', name: 'Google Search Console', oauth_type: 'google_search_console' },
  { type: 'google_analytics', name: 'Google Analytics', oauth_type: 'google_analytics' },
  { type: 'google_business_profile', name: 'Google Business Profile', oauth_type: 'google_business_profile' },
]

const DEMO_INTEGRATIONS = [
  { type: 'google_search_console', name: 'Google Search Console', status: 'connected', connected_at: '2026-03-01T10:00:00Z' },
  { type: 'google_analytics', name: 'Google Analytics', status: 'connected', connected_at: '2026-03-01T10:05:00Z' },
  { type: 'google_business_profile', name: 'Google Business Profile', status: 'connected', connected_at: '2026-03-01T10:10:00Z' },
]

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

    // Load integration statuses
    const { data: integrations } = await supabaseAdmin
      .from('client_integrations')
      .select('type, status, connected_at')
      .eq('client_id', clientId)

    const statusMap: Record<string, { status: string; connected_at: string | null }> = {}
    if (integrations) {
      for (const i of integrations) {
        statusMap[i.type] = { status: i.status, connected_at: i.connected_at }
      }
    }

    const result = INTEGRATION_DEFS.map((def) => ({
      type: def.type,
      name: def.name,
      oauth_type: def.oauth_type,
      status: statusMap[def.type]?.status ?? 'not_connected',
      connected_at: statusMap[def.type]?.connected_at ?? null,
    }))

    // If demo and no real data, use demo integrations
    if (demo && !integrations?.length) {
      return NextResponse.json({ integrations: DEMO_INTEGRATIONS, tier })
    }

    return NextResponse.json({ integrations: result, tier })
  } catch (err: unknown) {
    console.error('[integrations] error:', err)
    return NextResponse.json({ error: 'Failed to load integrations' }, { status: 500 })
  }
}
