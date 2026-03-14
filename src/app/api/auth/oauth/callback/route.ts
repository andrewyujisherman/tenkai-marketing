import { NextRequest, NextResponse } from 'next/server'
import { upsertClientIntegration } from '@/lib/integrations/client-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const stateParam = searchParams.get('state')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  if (!code || !stateParam) {
    return NextResponse.redirect(`${appUrl}/integrations?error=oauth_failed`)
  }

  let clientId: string
  let type: string
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf-8'))
    clientId = decoded.client_id
    type = decoded.type
    if (!clientId || !type) throw new Error('missing fields')
  } catch {
    return NextResponse.redirect(`${appUrl}/integrations?error=oauth_failed`)
  }

  const redirectUri = `${appUrl}/api/auth/oauth/callback`

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.GOOGLE_OAUTH_WEB_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_OAUTH_WEB_CLIENT_SECRET ?? '',
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenRes.ok) {
      console.error('[oauth/callback] token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(`${appUrl}/integrations?error=oauth_failed`)
    }

    const tokens = await tokenRes.json()
    const { access_token, refresh_token, expires_in, token_type } = tokens

    await upsertClientIntegration(
      clientId,
      type,
      {
        access_token,
        refresh_token: refresh_token ?? null,
        expiry_date: expires_in ? Date.now() + expires_in * 1000 : null,
        token_type: token_type ?? 'Bearer',
      },
      {}
    )

    return NextResponse.redirect(`${appUrl}/integrations?connected=${type}`)
  } catch (err) {
    console.error('[oauth/callback] error:', err)
    return NextResponse.redirect(`${appUrl}/integrations?error=oauth_failed`)
  }
}
