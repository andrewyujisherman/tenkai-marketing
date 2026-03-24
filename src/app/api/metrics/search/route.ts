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
      .eq('type', 'google_search_console')
      .single()

    if (!integration || integration.status !== 'connected') {
      if (demo) return NextResponse.json(generateDemoSearchData(range))
      return NextResponse.json({ connected: false, integration: 'gsc' })
    }

    return NextResponse.json(generateDemoSearchData(range))
  } catch (err: unknown) {
    console.error('[metrics/search] error:', err)
    return NextResponse.json({ error: 'Failed to load search data' }, { status: 500 })
  }
}
