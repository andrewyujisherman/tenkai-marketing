import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

function generateDemoTrafficData(range: string) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365
  const labels: string[] = []
  const data: number[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    labels.push(d.toISOString().slice(0, 10))
    data.push(Math.floor(80 + Math.random() * 120 + i * 0.5))
  }

  return {
    connected: true,
    summary: [
      { name: 'Sessions', value: '2,847', trend: 'up', change_pct: '+12.3%', period: 'vs last month', tooltip: 'Total visits to your website' },
      { name: 'Users', value: '1,923', trend: 'up', change_pct: '+8.7%', period: 'vs last month', tooltip: 'Unique people who visited your site' },
      { name: 'Bounce Rate', value: '42.1%', trend: 'down', change_pct: '-3.2%', period: 'vs last month', tooltip: 'Percentage of visitors who left after viewing only one page — lower is better' },
      { name: 'Avg Duration', value: '2m 34s', trend: 'up', change_pct: '+15s', period: 'vs last month', tooltip: 'Average time visitors spend on your site' },
    ],
    chart: { labels, data },
    top_pages: [
      { url: '/', sessions: 892, users: 743, bounce_rate: '38.2%', avg_duration: '1m 45s' },
      { url: '/services', sessions: 456, users: 398, bounce_rate: '35.1%', avg_duration: '3m 12s' },
      { url: '/about', sessions: 312, users: 287, bounce_rate: '44.6%', avg_duration: '2m 08s' },
      { url: '/contact', sessions: 245, users: 221, bounce_rate: '28.9%', avg_duration: '1m 56s' },
      { url: '/blog/seo-tips', sessions: 198, users: 185, bounce_rate: '52.3%', avg_duration: '4m 22s' },
      { url: '/pricing', sessions: 167, users: 154, bounce_rate: '31.7%', avg_duration: '2m 41s' },
      { url: '/blog/local-marketing', sessions: 134, users: 122, bounce_rate: '48.1%', avg_duration: '3m 55s' },
      { url: '/testimonials', sessions: 112, users: 98, bounce_rate: '41.3%', avg_duration: '2m 15s' },
      { url: '/areas-served', sessions: 98, users: 91, bounce_rate: '39.8%', avg_duration: '1m 32s' },
      { url: '/blog/google-business', sessions: 87, users: 79, bounce_rate: '50.2%', avg_duration: '3m 48s' },
    ],
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

    // Check if GA4 integration is connected
    const { data: integration } = await supabaseAdmin
      .from('client_integrations')
      .select('status')
      .eq('client_id', clientId)
      .eq('integration_type', 'google_analytics')
      .single()

    if (!integration || integration.status !== 'active') {
      if (demo) return NextResponse.json(generateDemoTrafficData(range))
      return NextResponse.json({ connected: false, integration: 'ga4' })
    }

    // Fetch real GA4 data using stored OAuth tokens
    const { fetchGA4Data } = await import('@/lib/integrations/google-analytics')

    const { data: integFull } = await supabaseAdmin
      .from('client_integrations')
      .select('metadata')
      .eq('client_id', clientId)
      .eq('integration_type', 'google_analytics')
      .single()

    const meta = (integFull?.metadata ?? {}) as Record<string, string>
    let propertyId = meta.property_id ?? meta.ga4_property_id ?? undefined

    // Auto-discover GA4 property if metadata is empty
    if (!propertyId) {
      try {
        const { getValidAccessToken } = await import('@/lib/integrations/client-store')
        const token = await getValidAccessToken(clientId, 'google_analytics')
        if (token) {
          const acctRes = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (acctRes.ok) {
            const acctData = await acctRes.json()
            const summaries = (acctData.accountSummaries ?? []) as Array<{
              displayName: string
              propertySummaries?: Array<{ property: string; displayName: string }>
            }>
            const properties = summaries.flatMap((a) =>
              (a.propertySummaries ?? []).map((p) => ({
                property: p.property,
                name: p.displayName,
                account: a.displayName,
              }))
            )
            if (properties.length > 0) {
              // Prefer property matching client's website_url
              const { data: clientRec } = await supabaseAdmin.from('clients').select('website_url').eq('id', clientId).single()
              const clientUrl = (clientRec?.website_url as string ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase()
              const matched = clientUrl ? properties.find((p) => p.name.toLowerCase().includes(clientUrl.split('.')[0])) : null
              const best = matched ?? properties[0]
              const propId = best.property.replace('properties/', '')
              propertyId = propId
              await supabaseAdmin
                .from('client_integrations')
                .update({ metadata: { ...meta, property_id: propId, property_name: best.name, properties }, updated_at: new Date().toISOString() })
                .eq('client_id', clientId)
                .eq('integration_type', 'google_analytics')
            }
          }
        }
      } catch (e) {
        console.error('[metrics/traffic] GA4 auto-discovery failed:', e)
      }
    }

    if (!propertyId) {
      return NextResponse.json({ connected: true, summary: [], chart: { labels: [], sessions: [], users: [] }, error: 'No GA4 property found. Please reconnect Google Analytics.' })
    }

    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365
    const ga4Data = await fetchGA4Data(propertyId, { days, clientId })

    if (!ga4Data || ga4Data.error) {
      console.error('[metrics/traffic] GA4 fetch error:', ga4Data?.error)
      if (demo) return NextResponse.json(generateDemoTrafficData(range))
      return NextResponse.json({ connected: true, summary: [], chart: { labels: [], data: [] }, top_pages: [], error: 'Unable to fetch analytics data. Your team will retry automatically.' })
    }

    return NextResponse.json({
      connected: true,
      summary: [
        { name: 'Sessions', value: ga4Data.sessions.toLocaleString(), trend: 'up', change_pct: 'N/A', period: `last ${days} days`, tooltip: 'Total visits to your website' },
        { name: 'Users', value: ga4Data.users.toLocaleString(), trend: 'up', change_pct: 'N/A', period: `last ${days} days`, tooltip: 'Unique visitors to your site' },
        { name: 'Bounce Rate', value: `${ga4Data.bounceRate}%`, trend: 'neutral', change_pct: 'N/A', period: `last ${days} days`, tooltip: 'Percentage of visitors who left without interacting' },
        { name: 'Avg Duration', value: `${ga4Data.avgSessionDuration}s`, trend: 'neutral', change_pct: 'N/A', period: `last ${days} days`, tooltip: 'Average time visitors spend on your site' },
      ],
      topChannels: ga4Data.topChannels,
      topPages: ga4Data.topPages,
      organicTraffic: ga4Data.organicTraffic,
      chart: { labels: [], sessions: [], users: [] },
    })
  } catch (err: unknown) {
    console.error('[metrics/traffic] error:', err)
    return NextResponse.json({ error: 'Failed to load traffic data' }, { status: 500 })
  }
}
