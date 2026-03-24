import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

export async function GET() {
  try {
    const demo = await isDemoMode()
    const supabase = await createServerClient()
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
        .select('id, last_seen')
        .eq('auth_user_id', user.id)
        .single()

      if (!client) {
        const { data: byEmail } = await supabaseAdmin
          .from('clients')
          .select('id, last_seen')
          .eq('email', (user.email ?? '').toLowerCase())
          .single()
        if (!byEmail) {
          return NextResponse.json({ summary: '', activity_count: 0, since: new Date().toISOString() })
        }
        clientId = byEmail.id
      } else {
        clientId = client.id
      }
    }

    const db = demo ? supabaseAdmin : supabase

    // Get last_seen timestamp
    const { data: clientData } = await supabaseAdmin
      .from('clients')
      .select('last_seen')
      .eq('id', clientId)
      .single()

    const lastSeen = clientData?.last_seen || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Count activity since last_seen
    const [
      { count: completedCount },
      { count: pendingCount },
      { count: newDeliverables },
    ] = await Promise.all([
      db.from('content_posts')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('created_at', lastSeen),
      db.from('approvals')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('status', 'pending'),
      db.from('deliverables')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('created_at', lastSeen),
    ])

    const total = (completedCount ?? 0) + (newDeliverables ?? 0)
    const pending = pendingCount ?? 0

    // Build summary
    const parts: string[] = []
    if (total > 0) {
      parts.push(`Your team completed ${total} task${total !== 1 ? 's' : ''}`)
    }
    if (pending > 0) {
      parts.push(`${pending} item${pending !== 1 ? 's' : ''} need${pending === 1 ? 's' : ''} your attention`)
    }
    if (parts.length === 0) {
      parts.push('Your team is hard at work. Nothing needs your attention right now.')
    }

    return NextResponse.json({
      summary: parts.join('. ') + '.',
      activity_count: total,
      since: lastSeen,
    })
  } catch {
    return NextResponse.json({ summary: '', activity_count: 0, since: new Date().toISOString() })
  }
}
