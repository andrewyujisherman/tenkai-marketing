import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

const TIER_MAP: Record<string, { display: string; price: number }> = {
  visibility: { display: 'Visibility', price: 0 },
  growth: { display: 'Growth', price: 0 },
  done_for_you: { display: 'Done-For-You', price: 0 },
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

    if (!clientId) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('tier, stripe_customer_id')
      .eq('id', clientId)
      .single()

    const tier = client?.tier ?? 'growth'
    const tierInfo = TIER_MAP[tier] ?? TIER_MAP.growth

    // Calculate next billing date (roughly 30 days from now for demo)
    const nextBilling = new Date()
    nextBilling.setDate(nextBilling.getDate() + 30)

    return NextResponse.json({
      tier,
      tier_display: tierInfo.display,
      price: tierInfo.price,
      next_billing: nextBilling.toISOString(),
      payment_last4: demo ? null : null,
      is_highest_tier: tier === 'done_for_you',
    })
  } catch (err: unknown) {
    console.error('[billing/status] error:', err)
    return NextResponse.json({ error: 'Failed to load billing status' }, { status: 500 })
  }
}
