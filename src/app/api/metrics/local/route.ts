import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

function generateDemoLocalData() {
  return {
    connected: true,
    summary: [
      { name: 'Profile Views', value: '1,834', trend: 'up', change_pct: '+9.2%', period: 'vs last month', tooltip: 'How many people viewed your Google Business Profile' },
      { name: 'Search Appearances', value: '4,521', trend: 'up', change_pct: '+15.7%', period: 'vs last month', tooltip: 'How many times your business appeared in Google Maps or local search' },
      { name: 'Direction Requests', value: '234', trend: 'up', change_pct: '+11.3%', period: 'vs last month', tooltip: 'How many people asked for directions to your business' },
      { name: 'Phone Calls', value: '89', trend: 'up', change_pct: '+6.8%', period: 'vs last month', tooltip: 'How many people called you directly from your Google listing' },
      { name: 'Reviews', value: '4.7 (127)', trend: 'up', change_pct: '+3 new', period: 'this month', tooltip: 'Your average rating and total review count on Google' },
    ],
  }
}

export async function GET() {
  try {
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
      .eq('type', 'google_business_profile')
      .single()

    if (!integration || integration.status !== 'connected') {
      if (demo) return NextResponse.json(generateDemoLocalData())
      return NextResponse.json({ connected: false, integration: 'gbp' })
    }

    return NextResponse.json(generateDemoLocalData())
  } catch (err: unknown) {
    console.error('[metrics/local] error:', err)
    return NextResponse.json({ error: 'Failed to load local data' }, { status: 500 })
  }
}
