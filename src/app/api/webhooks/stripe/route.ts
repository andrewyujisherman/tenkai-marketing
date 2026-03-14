import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getSupabase()

  const tierByPrice: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER ?? '']: 'starter',
    [process.env.STRIPE_PRICE_GROWTH ?? '']: 'growth',
    [process.env.STRIPE_PRICE_PRO ?? '']: 'pro',
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0]?.price.id
      const tier = tierByPrice[priceId] ?? 'starter'

      const clientId = session.metadata?.client_id
      const updateData = { stripe_customer_id: customerId, tier, status: 'active' }

      if (clientId) {
        // Preferred: match by client_id UUID (reliable)
        await supabase.from('clients').update(updateData).eq('id', clientId)
      } else if (session.customer_email) {
        // Fallback: match by email (less reliable — can be null or wrong case)
        await supabase.from('clients').update(updateData).eq('email', session.customer_email.toLowerCase())
      } else {
        console.error('[Stripe webhook] checkout.session.completed: no client_id or email to match')
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const priceId = sub.items.data[0]?.price.id
      const tier = tierByPrice[priceId] ?? 'starter'
      const status = sub.status === 'active' ? 'active' : sub.status

      await supabase
        .from('clients')
        .update({ tier, status })
        .eq('stripe_customer_id', sub.customer)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await supabase
        .from('clients')
        .update({ status: 'canceled' })
        .eq('stripe_customer_id', sub.customer)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      console.log(`[Stripe webhook] invoice.payment_failed for customer ${customerId}`)

      await supabase
        .from('clients')
        .update({ status: 'past_due' })
        .eq('stripe_customer_id', customerId)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      console.log(`[Stripe webhook] invoice.payment_succeeded for customer ${customerId}`)

      // Only restore to active if currently past_due — don't overwrite other statuses
      await supabase
        .from('clients')
        .update({ status: 'active' })
        .eq('stripe_customer_id', customerId)
        .eq('status', 'past_due')
      break
    }
  }

  return NextResponse.json({ received: true })
}
