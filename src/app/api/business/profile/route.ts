import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

const DEMO_PROFILE = {
  overview: {
    name: 'Premier Plumbing Co.',
    url: 'https://premierplumbing.com',
    category: 'Home Services / Plumbing',
    area: 'Austin, TX Metro',
  },
  services: ['Emergency Plumbing', 'Drain Cleaning', 'Water Heater Installation', 'Pipe Repair', 'Sewer Line Replacement', 'Bathroom Remodeling'],
  not_services: ['HVAC', 'Electrical Work', 'Roofing'],
  products: ['Tankless Water Heaters', 'Water Filtration Systems', 'Smart Leak Detectors'],
  specialties: ['24/7 Emergency Service', 'Licensed Master Plumbers', 'Same-Day Appointments', 'Upfront Pricing Guarantee'],
  top_revenue_services: ['Emergency Plumbing', 'Water Heater Installation'],
  customer_pain_points: 'Burst pipes at 2am, slow drains that keep coming back, water heater died with no hot water',
  customer_faqs: 'How fast can you get here? Do you charge extra for weekends? What brands of water heaters do you install?',
  money_pages: [
    { url: 'https://premierplumbing.com/emergency', label: 'Emergency Service', cta: 'Call' },
    { url: 'https://premierplumbing.com/water-heaters', label: 'Water Heater Installation', cta: 'Schedule' },
  ],
  local_connections: [
    { name: 'Austin Chamber of Commerce', relationship: 'Member since 2019', status: 'Active Partner' },
    { name: 'Hill Country Home Inspectors', relationship: 'Mutual referrals', status: 'Referral Partner' },
  ],
  primary_cta: 'Call Now',
}

async function findClientId(demo: boolean, userId?: string, email?: string): Promise<string | undefined> {
  if (demo) return DEMO_CLIENT_ID

  if (!userId) return undefined

  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('auth_user_id', userId)
    .single()

  if (client?.id) return client.id

  if (email) {
    const { data: byEmail } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()
    return byEmail?.id
  }

  return undefined
}

export async function GET() {
  try {
    const demo = await isDemoMode()
    let userId: string | undefined
    let email: string | undefined

    if (!demo) {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      userId = user.id
      email = user.email ?? undefined
    }

    const clientId = await findClientId(demo, userId, email)
    if (!clientId) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Try to load from business_profile table
    const { data: profile } = await supabaseAdmin
      .from('business_profile')
      .select('*')
      .eq('client_id', clientId)
      .single()

    if (profile) {
      return NextResponse.json({
        overview: {
          name: profile.business_name ?? '',
          url: profile.website_url ?? '',
          category: profile.category ?? '',
          area: profile.service_area ?? '',
        },
        services: profile.services ?? [],
        not_services: profile.not_services ?? [],
        products: profile.products ?? [],
        specialties: profile.specialties ?? [],
        top_revenue_services: profile.top_revenue_services ?? [],
        customer_pain_points: profile.customer_pain_points ?? '',
        customer_faqs: profile.customer_faqs ?? '',
        money_pages: profile.money_pages ?? [],
        local_connections: profile.local_connections ?? [],
        primary_cta: profile.primary_cta ?? '',
      })
    }

    // Fallback: load from client onboarding_data
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('business_name, onboarding_data')
      .eq('id', clientId)
      .single()

    if (client) {
      const od = client.onboarding_data ?? {}
      return NextResponse.json({
        overview: {
          name: client.business_name ?? od.business_name ?? '',
          url: od.website_url ?? '',
          category: od.business_industry ?? '',
          area: od.business_location ?? '',
        },
        services: od.services ? od.services.split('\n').filter(Boolean) : [],
        not_services: [],
        products: [],
        specialties: od.differentiators ? od.differentiators.split('\n').filter(Boolean) : [],
      })
    }

    // Demo fallback
    if (demo) return NextResponse.json(DEMO_PROFILE)

    return NextResponse.json({
      overview: { name: '', url: '', category: '', area: '' },
      services: [],
      not_services: [],
      products: [],
      specialties: [],
    })
  } catch (err: unknown) {
    console.error('[business/profile GET] error:', err)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const demo = await isDemoMode()
    const body = await req.json()

    if (demo) return NextResponse.json({ success: true })

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const clientId = await findClientId(false, user.id, user.email ?? undefined)
    if (!clientId) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Handle field updates: { field: string, value: string }
    if (body.field) {
      const fieldMap: Record<string, string> = {
        name: 'business_name',
        url: 'website_url',
        category: 'category',
        area: 'service_area',
        customer_pain_points: 'customer_pain_points',
        customer_faqs: 'customer_faqs',
        primary_cta: 'primary_cta',
      }
      const dbField = fieldMap[body.field]
      if (!dbField) return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
      if (body.field === 'name' && (!body.value || body.value.trim().length < 2)) {
        return NextResponse.json({ error: 'Business name must be at least 2 characters' }, { status: 400 })
      }

      await supabaseAdmin
        .from('business_profile')
        .upsert({ client_id: clientId, [dbField]: body.value }, { onConflict: 'client_id' })

      return NextResponse.json({ success: true })
    }

    // Handle tag updates: { action: 'add'|'remove', category: string, value: string }
    if (body.action && body.category) {
      const validCategories = ['services', 'not_services', 'products', 'specialties', 'top_revenue_services']
      if (!validCategories.includes(body.category)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      }

      const { data: existing } = await supabaseAdmin
        .from('business_profile')
        .select(body.category)
        .eq('client_id', clientId)
        .single()

      const rawTags = existing?.[body.category]
      const currentTags: string[] = Array.isArray(rawTags) ? rawTags : []

      let updatedTags: string[]
      if (body.action === 'add') {
        if (body.value.trim().length < 2) {
          return NextResponse.json({ error: 'Tag must be at least 2 characters' }, { status: 400 })
        }
        updatedTags = [...currentTags, body.value.trim()]
      } else {
        updatedTags = currentTags.filter((t: string) => t !== body.value)
      }

      await supabaseAdmin
        .from('business_profile')
        .upsert({ client_id: clientId, [body.category]: updatedTags }, { onConflict: 'client_id' })

      return NextResponse.json({ success: true })
    }

    // Handle JSONB array updates for money_pages and local_connections
    // { jsonb_field: 'money_pages'|'local_connections', action: 'add'|'remove', item: {...} }
    if (body.jsonb_field && body.item !== undefined) {
      const validFields = ['money_pages', 'local_connections']
      if (!validFields.includes(body.jsonb_field)) {
        return NextResponse.json({ error: 'Invalid jsonb field' }, { status: 400 })
      }

      const { data: existing } = await supabaseAdmin
        .from('business_profile')
        .select(body.jsonb_field)
        .eq('client_id', clientId)
        .single()

      const raw = existing?.[body.jsonb_field]
      const current: unknown[] = Array.isArray(raw) ? raw as unknown[] : []

      let updated: unknown[]
      if (body.action === 'add') {
        updated = [...current, body.item]
      } else if (body.action === 'remove') {
        // Remove by matching url (money_pages) or name (local_connections)
        const matchKey = body.jsonb_field === 'money_pages' ? 'url' : 'name'
        updated = current.filter((item: unknown) => {
          const obj = item as Record<string, unknown>
          return obj[matchKey] !== (body.item as Record<string, unknown>)[matchKey]
        })
      } else {
        updated = current
      }

      await supabaseAdmin
        .from('business_profile')
        .upsert({ client_id: clientId, [body.jsonb_field]: updated }, { onConflict: 'client_id' })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  } catch (err: unknown) {
    console.error('[business/profile PUT] error:', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
