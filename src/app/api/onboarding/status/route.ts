import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { createServerClient } from '@/lib/supabase'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'
import { buildClientContextForm } from '@/lib/client-context'

export interface Integration {
  type: string
  display_name: string
  description: string
  required: boolean
  status: 'not_connected' | 'pending' | 'active' | 'expired' | 'error'
  icon: string
}

const INTEGRATION_DEFINITIONS: Omit<Integration, 'status'>[] = [
  {
    type: 'google_search_console',
    display_name: 'Google Search Console',
    description: 'Real keyword rankings, clicks, impressions',
    required: true,
    icon: 'search',
  },
  {
    type: 'google_analytics',
    display_name: 'Google Analytics 4',
    description: 'Traffic, engagement, conversions data',
    required: true,
    icon: 'bar-chart',
  },
  {
    type: 'google_business_profile',
    display_name: 'Google Business Profile',
    description: 'Local SEO, reviews, GBP optimization',
    required: false,
    icon: 'map-pin',
  },
  {
    type: 'website_access',
    display_name: 'Website URL',
    description: 'Your website URL for auditing',
    required: true,
    icon: 'globe',
  },
  {
    type: 'cms_access',
    display_name: 'CMS Access',
    description: 'WordPress/Shopify for content publishing & technical fixes',
    required: false,
    icon: 'layout',
  },
  {
    type: 'competitors',
    display_name: 'Competitors',
    description: 'Key competitors for market and gap analysis',
    required: false,
    icon: 'users',
  },
  {
    type: 'brand_guidelines',
    display_name: 'Brand Voice & Guidelines',
    description: 'Tone, style, do/don\'t for content',
    required: false,
    icon: 'pen-tool',
  },
  {
    type: 'target_keywords',
    display_name: 'Target Keywords',
    description: 'Primary keywords you want to rank for',
    required: false,
    icon: 'tag',
  },
  {
    type: 'business_info',
    display_name: 'Business Information',
    description: 'Business basics, services, differentiators, goals, and notes',
    required: true,
    icon: 'building',
  },
]

export async function GET(req: NextRequest) {
  const demo = await isDemoMode()
  const { searchParams } = new URL(req.url)
  let clientId = searchParams.get('client_id')

  if (demo && !clientId) {
    clientId = DEMO_CLIENT_ID
  }

  if (!clientId) {
    // Try to resolve from session
    const supabase = await createServerClient()
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
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    clientId = client.id
  }

  // Fetch existing integrations
  const { data: existing } = await supabaseAdmin
    .from('client_integrations')
    .select('integration_type, status, metadata, credentials')
    .eq('client_id', clientId)

  // Also check client record for website_access and business_info
  const { data: clientRecord } = await supabaseAdmin
    .from('clients')
    .select('website_url, company_name, name, onboarding_data')
    .eq('id', clientId)
    .single()

  const existingMap = new Map(
    (existing ?? []).map((i) => [i.integration_type, i.status as Integration['status']])
  )

  // Infer website_access from client record
  if (clientRecord?.website_url && !existingMap.has('website_access')) {
    existingMap.set('website_access', 'active')
  }
  // Infer business_info from client record
  if ((clientRecord?.company_name || clientRecord?.name) && !existingMap.has('business_info')) {
    existingMap.set('business_info', 'active')
  }

  const integrations: Integration[] = INTEGRATION_DEFINITIONS.map((def) => ({
    ...def,
    status: existingMap.get(def.type) ?? 'not_connected',
  }))

  const connected = integrations.filter((i) => i.status === 'active').length
  const total = integrations.length
  const completion_percentage = Math.round((connected / total) * 100)

  const form = buildClientContextForm(
    clientRecord,
    (existing ?? []) as Array<{
      integration_type: string
      metadata?: Record<string, unknown> | null
      credentials?: Record<string, unknown> | null
    }>
  )

  return NextResponse.json({ integrations, completion_percentage, client_id: clientId, form })
}
