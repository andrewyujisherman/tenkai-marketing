import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Look up the client's stripe_customer_id
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('stripe_customer_id')
      .eq('auth_user_id', user.id)
      .single()
      .then(async (res) => {
        if (res.data) return res
        // Fallback: look up by email
        return supabaseAdmin
          .from('clients')
          .select('stripe_customer_id')
          .eq('email', user.email!.toLowerCase())
          .single()
      })

    if (!client?.stripe_customer_id) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    })

    const origin =
      request.headers.get('origin') ??
      process.env.NEXT_PUBLIC_APP_URL ??
      'https://tenkai.marketing'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: client.stripe_customer_id,
      return_url: `${origin}/settings?tab=billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[billing/portal] error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
