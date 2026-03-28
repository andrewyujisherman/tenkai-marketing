import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

const tierPriceEnvMap: Record<string, string> = {
  starter: 'STRIPE_PRICE_STARTER',
  growth: 'STRIPE_PRICE_GROWTH',
  pro: 'STRIPE_PRICE_PRO',
}

export async function POST(request: NextRequest) {
  // Authenticate
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const { priceId, tier, clientId } = await request.json()

    const resolvedPriceId =
      priceId ?? process.env[tierPriceEnvMap[tier?.toLowerCase() ?? '']]

    if (!resolvedPriceId) {
      return NextResponse.json({ error: 'Invalid tier or price ID' }, { status: 400 })
    }

    const origin =
      request.headers.get('origin') ??
      process.env.NEXT_PUBLIC_APP_URL ??
      'https://tenkai-marketing.vercel.app'

    // Look up existing client for customer dedup
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id, stripe_customer_id')
      .eq('auth_user_id', user.id)
      .single()

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_collection: 'if_required',
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      success_url: `${origin}/dashboard?welcome=true`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: { client_id: client?.id ?? clientId },
    }

    // Reuse existing Stripe customer if available
    if (client?.stripe_customer_id) {
      sessionParams.customer = client.stripe_customer_id
    } else {
      sessionParams.customer_email = user.email!
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Checkout error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
