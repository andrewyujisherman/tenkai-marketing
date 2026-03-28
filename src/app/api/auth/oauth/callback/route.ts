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
  let returnTo: string = '/integrations'
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf-8'))
    clientId = decoded.client_id
    type = decoded.type
    if (decoded.return_to) returnTo = decoded.return_to
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
      return NextResponse.redirect(`${appUrl}${returnTo}?error=oauth_failed`)
    }

    const tokens = await tokenRes.json()
    const { access_token, refresh_token, expires_in, token_type } = tokens

    // Discover properties/sites for this integration using the fresh access token
    const metadata: Record<string, unknown> = {}

    try {
      if (type === 'google_search_console') {
        // Fetch list of verified sites from Search Console
        const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        if (sitesRes.ok) {
          const sitesData = await sitesRes.json()
          const sites = (sitesData.siteEntry ?? []) as Array<{ siteUrl: string; permissionLevel: string }>
          metadata.sites = sites.map((s) => s.siteUrl)
          // Auto-select the first verified site
          if (sites.length > 0) metadata.site_url = sites[0].siteUrl
        }
      } else if (type === 'google_analytics') {
        // Fetch GA4 account summaries to find properties
        const acctRes = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        if (acctRes.ok) {
          const acctData = await acctRes.json()
          const summaries = (acctData.accountSummaries ?? []) as Array<{
            displayName: string
            propertySummaries?: Array<{ property: string; displayName: string }>
          }>
          const properties = summaries.flatMap((a) =>
            (a.propertySummaries ?? []).map((p) => ({
              property: p.property, // e.g. "properties/123456789"
              name: p.displayName,
              account: a.displayName,
            }))
          )
          metadata.properties = properties
          // Auto-select the first property
          if (properties.length > 0) {
            const propId = properties[0].property.replace('properties/', '')
            metadata.property_id = propId
            metadata.property_name = properties[0].name
          }
        }
      } else if (type === 'google_business_profile') {
        // Fetch GBP accounts
        const gbpRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: { Authorization: `Bearer ${access_token}` },
        })
        if (gbpRes.ok) {
          const gbpData = await gbpRes.json()
          const accounts = (gbpData.accounts ?? []) as Array<{ name: string; accountName: string }>
          metadata.accounts = accounts.map((a) => ({
            name: a.name,
            displayName: a.accountName,
          }))

          // Fetch locations for the first account
          if (accounts.length > 0) {
            const locRes = await fetch(
              `https://mybusinessbusinessinformation.googleapis.com/v1/${accounts[0].name}/locations?readMask=name,title`,
              { headers: { Authorization: `Bearer ${access_token}` } }
            )
            if (locRes.ok) {
              const locData = await locRes.json()
              const locations = (locData.locations ?? []) as Array<{ name: string; title: string }>
              metadata.locations = locations.map((l) => ({ name: l.name, title: l.title }))
              if (locations.length > 0) {
                metadata.location_id = locations[0].name.replace('locations/', '')
                metadata.location_name = locations[0].title
                metadata.account_id = accounts[0].name.replace('accounts/', '')
              }
            }
          }
        }
      }
    } catch (discoveryErr) {
      // Non-fatal: tokens are still saved, just without metadata
      console.error('[oauth/callback] property discovery error:', discoveryErr)
    }

    const clientIdEnv = process.env.GOOGLE_OAUTH_WEB_CLIENT_ID ?? ''
    const clientSecretEnv = process.env.GOOGLE_OAUTH_WEB_CLIENT_SECRET ?? ''

    await upsertClientIntegration(
      clientId,
      type,
      {
        access_token,
        refresh_token: refresh_token ?? null,
        expiry_date: expires_in ? Date.now() + expires_in * 1000 : null,
        token_type: token_type ?? 'Bearer',
        client_id: clientIdEnv,
        client_secret: clientSecretEnv,
      },
      metadata
    )

    // If multiple properties/sites discovered, redirect to settings with selector open
    const sites = (metadata.sites ?? []) as unknown[]
    const properties = (metadata.properties ?? []) as unknown[]
    const hasMultiple = sites.length > 1 || properties.length > 1
    const redirectUrl = hasMultiple
      ? `${appUrl}/settings?tab=integrations&select=${type}&connected=${type}&returnTo=${encodeURIComponent(returnTo)}`
      : `${appUrl}${returnTo}?connected=${type}`
    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error('[oauth/callback] error:', err)
    return NextResponse.redirect(`${appUrl}${returnTo}?error=oauth_failed`)
  }
}
