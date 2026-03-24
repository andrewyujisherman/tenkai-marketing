import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

export async function GET() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

  let clientId: string | null = null

  if (demo) {
    clientId = DEMO_CLIENT_ID
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!client) {
      const { data: clientByEmail } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', (user.email ?? '').toLowerCase())
        .single()

      if (!clientByEmail) {
        return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })
      }
      clientId = clientByEmail.id
    } else {
      clientId = client.id
    }
  }

  const db = demo ? supabaseAdmin : supabase

  // Get latest keyword_list deliverable for keyword data
  const { data: keywordDeliverables } = await db
    .from('deliverables')
    .select('content, score, created_at')
    .eq('client_id', clientId)
    .eq('deliverable_type', 'keyword_list')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!keywordDeliverables || keywordDeliverables.length === 0) {
    return NextResponse.json({
      avg_position: 0,
      total_keywords: 0,
      improving: 0,
      declining: 0,
      period: 'No data yet',
    })
  }

  // Parse keyword data from the latest deliverable
  const latest = keywordDeliverables[0]
  let keywords: Array<{ position?: number; change?: number }> = []

  try {
    const content = typeof latest.content === 'string'
      ? JSON.parse(latest.content)
      : latest.content

    if (content?.keywords && Array.isArray(content.keywords)) {
      keywords = content.keywords
    } else if (Array.isArray(content)) {
      keywords = content
    }
  } catch {
    // Content not parseable — return zeros
  }

  const totalKeywords = keywords.length
  const positions = keywords
    .map((k) => k.position)
    .filter((p): p is number => typeof p === 'number' && p > 0)

  const avgPosition = positions.length > 0
    ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10
    : 0

  const improving = keywords.filter((k) => typeof k.change === 'number' && k.change > 0).length
  const declining = keywords.filter((k) => typeof k.change === 'number' && k.change < 0).length

  const createdAt = new Date(latest.created_at)
  const period = `Updated ${createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return NextResponse.json({
    avg_position: avgPosition,
    total_keywords: totalKeywords,
    improving,
    declining,
    period,
  })
}
