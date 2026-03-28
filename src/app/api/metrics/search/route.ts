import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

function generateDemoSearchData(range: string) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365
  const labels: string[] = []
  const clicks: number[] = []
  const impressions: number[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    labels.push(d.toISOString().slice(0, 10))
    const imp = Math.floor(400 + Math.random() * 200 + i * 1.5)
    impressions.push(imp)
    clicks.push(Math.floor(imp * (0.03 + Math.random() * 0.02)))
  }

  return {
    connected: true,
    summary: [
      { name: 'Total Clicks', value: '1,247', trend: 'up', change_pct: '+18.4%', period: 'vs last month', tooltip: 'How many people clicked on your site from Google search results' },
      { name: 'Impressions', value: '34,892', trend: 'up', change_pct: '+22.1%', period: 'vs last month', tooltip: 'How many times your site appeared in Google search results' },
      { name: 'Avg CTR', value: '3.6%', trend: 'up', change_pct: '+0.4%', period: 'vs last month', tooltip: 'What percentage of people who saw your site in search actually clicked — higher is better' },
      { name: 'Avg Position', value: '14.2', trend: 'up', change_pct: '-2.3', period: 'vs last month', tooltip: 'Where your site appears in search results on average — lower numbers mean higher ranking' },
    ],
    chart: { labels, clicks, impressions },
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') ?? '30d'
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

    if (!clientId) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const { data: integration } = await supabaseAdmin
      .from('client_integrations')
      .select('status')
      .eq('client_id', clientId)
      .eq('integration_type', 'google_search_console')
      .single()

    if (!integration || integration.status !== 'active') {
      if (demo) return NextResponse.json(generateDemoSearchData(range))
      return NextResponse.json({ connected: false, integration: 'gsc' })
    }

    // Fetch real GSC data using stored OAuth tokens
    const { fetchGSCData } = await import('@/lib/integrations/google-search-console')

    // Get site URL from integration metadata or client record
    const { data: integFull } = await supabaseAdmin
      .from('client_integrations')
      .select('metadata')
      .eq('client_id', clientId)
      .eq('integration_type', 'google_search_console')
      .single()

    const meta = (integFull?.metadata ?? {}) as Record<string, string>
    let siteUrl: string | undefined = meta.site_url ?? meta.property_url ?? undefined

    // Auto-discover GSC site if metadata is empty
    if (!siteUrl) {
      try {
        const { getValidAccessToken } = await import('@/lib/integrations/client-store')
        const token = await getValidAccessToken(clientId, 'google_search_console')
        if (token) {
          const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (sitesRes.ok) {
            const sitesData = await sitesRes.json()
            const sites = (sitesData.siteEntry ?? []) as Array<{ siteUrl: string; permissionLevel: string }>
            if (sites.length > 0) {
              // Prefer site matching client's website_url
              const { data: clientRec } = await supabaseAdmin.from('clients').select('website_url').eq('id', clientId).single()
              const clientDomain = (clientRec?.website_url as string ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase()
              const matched = clientDomain
                ? sites.find((s) => s.siteUrl.toLowerCase().includes(clientDomain))
                  ?? sites.find((s) => s.siteUrl.includes(`sc-domain:${clientDomain}`))
                : null
              siteUrl = (matched ?? sites[0]).siteUrl
              await supabaseAdmin
                .from('client_integrations')
                .update({ metadata: { ...meta, site_url: siteUrl, sites: sites.map((s) => s.siteUrl) }, updated_at: new Date().toISOString() })
                .eq('client_id', clientId)
                .eq('integration_type', 'google_search_console')
            }
          }
        }
      } catch (e) {
        console.error('[metrics/search] GSC auto-discovery failed:', e)
      }
    }

    if (!siteUrl) {
      return NextResponse.json({ connected: true, summary: [], chart: { labels: [], clicks: [], impressions: [] }, error: 'No site found. Please reconnect Google Search Console.' })
    }

    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365
    const gscData = await fetchGSCData(siteUrl, { days, clientId })

    if (!gscData || gscData.error) {
      console.error('[metrics/search] GSC fetch error:', gscData?.error)
      if (demo) return NextResponse.json(generateDemoSearchData(range))
      return NextResponse.json({ connected: true, summary: [], chart: { labels: [], clicks: [], impressions: [] }, top_queries: [], error: 'Unable to fetch search data. Your team will retry automatically.' })
    }

    // Build chart data from top queries (aggregated by day not available from GSC API directly)
    return NextResponse.json({
      connected: true,
      summary: [
        { name: 'Total Clicks', value: gscData.totalClicks.toLocaleString(), trend: 'up', change_pct: 'N/A', period: `last ${days} days`, tooltip: 'How many people clicked on your site from Google search results' },
        { name: 'Impressions', value: gscData.totalImpressions.toLocaleString(), trend: 'up', change_pct: 'N/A', period: `last ${days} days`, tooltip: 'How many times your site appeared in Google search results' },
        { name: 'Avg CTR', value: `${gscData.averageCTR}%`, trend: 'neutral', change_pct: 'N/A', period: `last ${days} days`, tooltip: 'What percentage of people who saw your site in search actually clicked — higher is better' },
        { name: 'Avg Position', value: gscData.averagePosition.toString(), trend: 'neutral', change_pct: 'N/A', period: `last ${days} days`, tooltip: 'Where your site appears in search results on average — lower numbers mean higher ranking' },
      ],
      topQueries: gscData.topQueries,
      topPages: gscData.topPages,
      strikingDistance: gscData.strikingDistance,
      chart: { labels: [], clicks: [], impressions: [] },
    })
  } catch (err: unknown) {
    console.error('[metrics/search] error:', err)
    return NextResponse.json({ error: 'Failed to load search data' }, { status: 500 })
  }
}
