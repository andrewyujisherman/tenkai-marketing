import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type')
    if (!type) return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 })

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

    const { data: integration } = await supabaseAdmin
      .from('client_integrations')
      .select('metadata')
      .eq('client_id', clientId)
      .eq('integration_type', type)
      .single()

    if (!integration) return NextResponse.json({ options: [], selected: null })

    const meta = (integration.metadata ?? {}) as Record<string, unknown>

    if (type === 'google_search_console') {
      const sites = (meta.sites ?? []) as string[]
      return NextResponse.json({
        options: sites.map((s) => ({ value: s, label: s })),
        selected: (meta.site_url as string) ?? null,
      })
    }

    if (type === 'google_analytics') {
      const properties = (meta.properties ?? []) as Array<{ property: string; name: string; account: string }>
      return NextResponse.json({
        options: properties.map((p) => ({
          value: p.property.replace('properties/', ''),
          label: `${p.name} (${p.account})`,
        })),
        selected: (meta.property_id as string) ?? null,
      })
    }

    return NextResponse.json({ options: [], selected: null })
  } catch (err) {
    console.error('[integrations/properties] error:', err)
    return NextResponse.json({ error: 'Failed to load properties' }, { status: 500 })
  }
}
