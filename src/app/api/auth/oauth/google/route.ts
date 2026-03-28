import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

const SCOPE_MAP: Record<string, string> = {
  google_search_console: 'https://www.googleapis.com/auth/webmasters.readonly',
  google_analytics: 'https://www.googleapis.com/auth/analytics.readonly',
  google_business_profile: 'https://www.googleapis.com/auth/business.manage',
}

export async function GET(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user) {
    // Check if demo mode — OAuth requires real auth, redirect to login
    const isDemo = req.cookies.get('demo_mode')?.value === 'true'
    if (isDemo) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', `/onboarding`)
      loginUrl.searchParams.set('reason', 'oauth_requires_login')
      return NextResponse.redirect(loginUrl)
    }
    console.error('[OAuth] getUser failed:', userError?.message ?? 'no session')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find client_id
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  let clientId = client?.id
  if (!clientId) {
    const { data: byEmail } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', (user.email ?? '').toLowerCase())
      .single()
    clientId = byEmail?.id
  }

  if (!clientId) {
    // Auto-create client row for authenticated users who don't have one yet
    // (e.g., user signed in directly instead of via email confirmation link)
    const name = user.user_metadata?.full_name ?? ''
    const company_name = user.user_metadata?.company_name ?? ''
    const website_url = user.user_metadata?.website_url ?? null

    const insertData: Record<string, string | null> = {
      email: (user.email ?? '').toLowerCase(),
      auth_user_id: user.id,
      name,
      company_name,
      status: 'onboarding',
    }
    if (website_url) insertData.website_url = website_url

    const { data: newClient, error: insertError } = await supabaseAdmin
      .from('clients')
      .insert(insertData)
      .select('id')
      .single()

    if (insertError || !newClient) {
      console.error('[OAuth] Failed to create client:', insertError?.message)
      return NextResponse.json({ error: 'Could not create client record' }, { status: 500 })
    }
    clientId = newClient.id
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? ''
  const returnTo = searchParams.get('return_to') ?? ''

  const scope = SCOPE_MAP[type]
  if (!scope) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${Object.keys(SCOPE_MAP).join(', ')}` },
      { status: 400 }
    )
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback`
  const statePayload: Record<string, string> = { client_id: clientId, type }
  if (returnTo) statePayload.return_to = returnTo
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64')

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_WEB_CLIENT_ID ?? '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
}
