import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAgentForRequest } from '@/lib/agents'

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
    .select('id, status, website_url')
    .eq('auth_user_id', user.id)
    .single()

  if (byId) {
    client = byId
  } else {
    const { data: byEmail } = await supabaseAdmin
      .from('clients')
      .select('id, status, website_url')
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
      .select('id, status, website_url')
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
      status: 'active',
      ...(resolvedWebsiteUrl && !client.website_url ? { website_url: resolvedWebsiteUrl } : {}),
    })
    .eq('id', client.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Auto-create a site_audit service request so the client gets an
  // immediate deliverable. Use the URL from onboarding answers or the
  // client's stored website_url.
  const websiteUrl =
    (onboarding_data?.business?.url as string | undefined) ??
    client.website_url

  if (websiteUrl) {
    const agentId = getAgentForRequest('site_audit')
    await supabaseAdmin
      .from('service_requests')
      .insert({
        client_id: client.id,
        request_type: 'site_audit',
        target_url: websiteUrl,
        parameters: {
          source: 'onboarding',
          industry: onboarding_data?.industry ?? null,
          competitors: onboarding_data?.competitors ?? null,
        },
        assigned_agent: agentId,
        priority: 8, // High priority — first impression matters
      })
      // Fire and forget — don't block onboarding on queue insert
      .then(({ error }) => {
        if (error) {
          console.error('[onboarding] Failed to create initial site_audit request:', error.message)
        }
      })
  }

  return NextResponse.json({ success: true })
}
