import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAgentForRequest } from '@/lib/agents'
import { tierAllowsRequestType } from '@/lib/tier-gates'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const onboarding_data = body.onboarding_data ?? body.answers

  // Try auth_user_id first, fall back to email
  let client = null
  const { data: byId } = await supabaseAdmin
    .from('clients')
    .select('id, status, website_url, tier')
    .eq('auth_user_id', user.id)
    .single()

  if (byId) {
    client = byId
  } else {
    const { data: byEmail } = await supabaseAdmin
      .from('clients')
      .select('id, status, website_url, tier')
      .eq('email', (user.email ?? '').toLowerCase())
      .single()
    client = byEmail
  }

  if (!client) {
    // Safety net: self-signup may have missed callback — create row on the fly
    const name = user.user_metadata?.full_name ?? ''
    const company_name = user.user_metadata?.company_name ?? ''
    const { data: newClient, error: insertError } = await supabaseAdmin
      .from('clients')
      .insert({
        email: (user.email ?? '').toLowerCase(),
        auth_user_id: user.id,
        name,
        company_name,
        status: 'onboarding',
      })
      .select('id, status, website_url, tier')
      .single()

    if (insertError || !newClient) {
      return NextResponse.json({ error: 'Client not found and could not be created' }, { status: 404 })
    }
    client = newClient
  }

  // Sync website_url from onboarding answers to the client record
  const websiteUrlFromOnboarding =
    (onboarding_data?.business?.url as string | undefined) ?? null
  const resolvedWebsiteUrl = websiteUrlFromOnboarding
    ? (websiteUrlFromOnboarding.startsWith('http')
      ? websiteUrlFromOnboarding
      : `https://${websiteUrlFromOnboarding}`)
    : null

  const { error: updateError } = await supabaseAdmin
    .from('clients')
    .update({
      onboarding_data,
      onboarding_draft: null,
      status: 'active',
      ...(resolvedWebsiteUrl && !client.website_url ? { website_url: resolvedWebsiteUrl } : {}),
    })
    .eq('id', client.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Seed business_profile from onboarding data
  // Fields live at top level of onboarding_data, NOT inside .business
  const bizData = onboarding_data?.business ?? {}
  const rawServices = onboarding_data?.services ?? onboarding_data?.products ?? ''
  const parsedServices = rawServices
    ? (Array.isArray(rawServices) ? rawServices : String(rawServices).split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean))
    : []
  // Build focus_areas from topService if provided
  const topService = onboarding_data?.topService ?? ''
  const focusAreas = topService
    ? [{ area: topService, why: 'Most-requested service (from onboarding)', services: '' }]
    : []

  await supabaseAdmin
    .from('business_profile')
    .upsert({
      client_id: client.id,
      business_name: bizData.name ?? bizData.business_name ?? '',
      website_url: bizData.url ?? bizData.website_url ?? '',
      category: onboarding_data?.industry ?? onboarding_data?.businessType ?? '',
      service_area: onboarding_data?.serviceArea ?? onboarding_data?.location ?? '',
      services: parsedServices,
      focus_areas: focusAreas,
      customer_pain_points: onboarding_data?.customerLanguage ?? '',
    }, { onConflict: 'client_id' })

  // Seed client_seo_context with onboarding business info so first agent requests have context
  // Keys match what the frontend now sends directly (businessDescription, idealCustomer, services, serviceArea)
  const businessDesc = onboarding_data?.businessDescription ?? ''
  const businessType = onboarding_data?.industry ?? ''
  const serviceArea = onboarding_data?.serviceArea ?? onboarding_data?.location ?? ''
  const services = onboarding_data?.services ?? onboarding_data?.products ?? ''
  const targetGeo = onboarding_data?.targetGeography ?? ''
  const idealCustomer = onboarding_data?.idealCustomer ?? ''
  if (businessDesc || businessType || serviceArea || services) {
    supabaseAdmin
      .from('client_seo_context')
      .upsert({
        client_id: client.id,
        business_context: {
          description: businessDesc,
          industry: businessType,
          geography: targetGeo,
          service_area: serviceArea,
          services,
          ideal_customer: idealCustomer,
          top_service: onboarding_data?.topService ?? '',
          customer_language: onboarding_data?.customerLanguage ?? '',
          differentiator: onboarding_data?.differentiator ?? '',
          goals: Array.isArray(onboarding_data?.businessGoals) ? onboarding_data.businessGoals.join(', ') : '',
        },
      }, { onConflict: 'client_id' })
      .then(({ error }) => {
        if (error) console.error('[onboarding] Failed to seed client_seo_context:', error.message)
      })
  }

  // Auto-trigger: site_audit + keyword_research + competitor_analysis
  // content_calendar fires automatically via CHAIN_MAP when keyword_research completes
  // These run in parallel so the client sees immediate progress from their AI team.
  const websiteUrl =
    (onboarding_data?.business?.url as string | undefined) ??
    client.website_url

  if (websiteUrl) {
    const clientTier = client.tier ?? 'starter'
    const strategyChain = [
      { type: 'site_audit', priority: 9 },
      { type: 'keyword_research', priority: 8 },
      { type: 'competitor_analysis', priority: 7 },
    ].filter(s => tierAllowsRequestType(clientTier, s.type))

    const sharedParams = {
      source: 'onboarding',
      industry: onboarding_data?.industry ?? null,
      businessDescription: onboarding_data?.businessDescription ?? null,
      idealCustomer: onboarding_data?.idealCustomer ?? null,
      services: onboarding_data?.services ?? onboarding_data?.products ?? null,
      serviceArea: onboarding_data?.serviceArea ?? onboarding_data?.location ?? null,
      topService: onboarding_data?.topService ?? null,
      customerLanguage: onboarding_data?.customerLanguage ?? null,
      differentiator: onboarding_data?.differentiator ?? null,
      competitors: onboarding_data?.competitors ?? null,
      businessGoals: onboarding_data?.businessGoals ?? null,
      targetGeography: onboarding_data?.targetGeography ?? null,
    }

    const inserts = strategyChain.map(({ type, priority }) => ({
      client_id: client.id,
      request_type: type,
      target_url: websiteUrl,
      parameters: sharedParams,
      assigned_agent: getAgentForRequest(type),
      priority,
      triggered_by: null, // onboarding root — no parent trigger
    }))

    supabaseAdmin
      .from('service_requests')
      .insert(inserts)
      .then(({ error }) => {
        if (error) {
          console.error('[onboarding] Failed to create strategy chain:', error.message)
        }
      })
  }

  return NextResponse.json({ success: true })
}
