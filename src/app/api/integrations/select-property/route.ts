import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, site_url, property_id } = body as {
      type?: string
      site_url?: string
      property_id?: string
    }

    if (!type) return NextResponse.json({ error: 'Missing type' }, { status: 400 })

    const demo = await isDemoMode()
    let clientId: string | undefined

    if (demo) {
      clientId = DEMO_CLIENT_ID
    } else {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    }

    if (!clientId) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Fetch current metadata
    const { data: integration } = await supabaseAdmin
      .from('client_integrations')
      .select('metadata')
      .eq('client_id', clientId)
      .eq('integration_type', type)
      .single()

    if (!integration) return NextResponse.json({ error: 'Integration not found' }, { status: 404 })

    const meta = (integration.metadata ?? {}) as Record<string, unknown>

    if (type === 'google_search_console' && site_url) {
      const sites = (meta.sites ?? []) as string[]
      if (!sites.includes(site_url)) {
        return NextResponse.json({ error: 'Invalid site_url' }, { status: 400 })
      }
      meta.site_url = site_url
    } else if (type === 'google_analytics' && property_id) {
      const properties = (meta.properties ?? []) as Array<{ property: string; name: string }>
      const match = properties.find((p) => p.property.replace('properties/', '') === property_id)
      if (!match) {
        return NextResponse.json({ error: 'Invalid property_id' }, { status: 400 })
      }
      meta.property_id = property_id
      meta.property_name = match.name
    } else {
      return NextResponse.json({ error: 'Missing site_url or property_id' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('client_integrations')
      .update({ metadata: meta })
      .eq('client_id', clientId)
      .eq('integration_type', type)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[integrations/select-property] error:', err)
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
  }
}
