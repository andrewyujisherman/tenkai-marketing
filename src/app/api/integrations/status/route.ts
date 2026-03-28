import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

export const dynamic = 'force-dynamic'

export async function GET() {
  const demo = await isDemoMode()
  let clientId: string | null = null

  if (demo) {
    clientId = DEMO_CLIENT_ID
  } else {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ connected: [] })

    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id')
      .or(`auth_user_id.eq.${user.id},email.eq.${(user.email ?? '').toLowerCase()}`)
      .single()

    clientId = client?.id ?? null
  }

  if (!clientId) return NextResponse.json({ connected: [] })

  const { data: integrations } = await supabaseAdmin
    .from('client_integrations')
    .select('integration_type, status, metadata')
    .eq('client_id', clientId)
    .eq('status', 'active')

  // Return both flat connected list (backward compat) and rich detail
  const connected = (integrations ?? []).map((i) => i.integration_type)
  const details: Record<string, { connected: true; hasData: boolean; detail: string }> = {}

  for (const i of integrations ?? []) {
    const meta = (i.metadata ?? {}) as Record<string, unknown>
    let hasData = false
    let detail = ''

    if (i.integration_type === 'google_search_console') {
      const sites = (meta.sites ?? []) as string[]
      hasData = sites.length > 0
      detail = hasData
        ? `Tracking ${meta.site_url ?? sites[0]}`
        : 'No verified sites found. Verify your website in Google Search Console.'
    } else if (i.integration_type === 'google_analytics') {
      const properties = (meta.properties ?? []) as Array<{ name?: string }>
      hasData = properties.length > 0
      detail = hasData
        ? `${meta.property_name ?? properties[0]?.name ?? 'GA4 property'}`
        : 'No GA4 properties found. Set up Google Analytics on your website first.'
    } else if (i.integration_type === 'google_business_profile') {
      const locations = (meta.locations ?? []) as Array<{ title?: string }>
      const accounts = (meta.accounts ?? []) as unknown[]
      hasData = locations.length > 0
      detail = hasData
        ? `${meta.location_name ?? locations[0]?.title ?? 'Business Profile'}`
        : accounts.length > 0
          ? 'Account found but no business locations. Add a location in Google Business Profile.'
          : 'No Business Profile found. Create one at business.google.com to manage your local presence.'
    }

    details[i.integration_type] = { connected: true, hasData, detail }
  }

  return NextResponse.json({ connected, details })
}
