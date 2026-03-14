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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
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
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? ''

  const scope = SCOPE_MAP[type]
  if (!scope) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${Object.keys(SCOPE_MAP).join(', ')}` },
      { status: 400 }
    )
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/callback`
  const state = Buffer.from(JSON.stringify({ client_id: clientId, type })).toString('base64')

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
