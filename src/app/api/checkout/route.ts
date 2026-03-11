import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const tierPriceEnvMap: Record<string, string> = {
  starter: 'STRIPE_PRICE_STARTER',
  growth: 'STRIPE_PRICE_GROWTH',
  pro: 'STRIPE_PRICE_PRO',
}

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })

  const { priceId, tier } = await request.json()

  const resolvedPriceId =
    priceId ?? process.env[tierPriceEnvMap[tier?.toLowerCase() ?? '']]

  if (!resolvedPriceId) {
    return NextResponse.json({ error: 'Invalid tier or price ID' }, { status: 400 })
  }

  const origin =
    request.headers.get('origin') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: resolvedPriceId, quantity: 1 }],
    success_url: `${origin}/dashboard?welcome=true`,
    cancel_url: `${origin}/?canceled=true`,
  })

  return NextResponse.json({ url: session.url })
}
