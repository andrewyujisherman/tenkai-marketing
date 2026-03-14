import { google } from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { upsertClientIntegration } from '@/lib/integrations/client-store'

export interface GA4Data {
  sessions: number
  users: number
  newUsers: number
  engagementRate: number
  avgSessionDuration: number
  bounceRate: number
  conversions: number
  topChannels: Array<{ channel: string; sessions: number; users: number }>
  topPages: Array<{ page: string; sessions: number; engagementRate: number; avgDuration: number }>
  organicTraffic: { sessions: number; percentOfTotal: number }
  error?: string
}

async function buildAuth(clientId?: string) {
  // --- DB-based path ---
  if (clientId) {
    const { data, error } = await supabaseAdmin
      .from('client_integrations')
      .select('credentials, status')
      .eq('client_id', clientId)
      .eq('integration_type', 'google_analytics')
      .single()

    if (!error && data && data.status === 'active') {
      const creds = data.credentials as {
        access_token?: string
        refresh_token?: string
        expiry_date?: number
        client_id?: string
        client_secret?: string
      }

      const oauthClientId = creds.client_id ?? process.env.GOOGLE_CLIENT_ID
      const oauthClientSecret = creds.client_secret ?? process.env.GOOGLE_CLIENT_SECRET

      if (oauthClientId && oauthClientSecret && creds.refresh_token) {
        const oauth2Client = new google.auth.OAuth2(oauthClientId, oauthClientSecret)
        oauth2Client.setCredentials({
          access_token: creds.access_token,
          refresh_token: creds.refresh_token,
          expiry_date: creds.expiry_date,
        })

        if (!creds.expiry_date || Date.now() > creds.expiry_date - 60_000) {
          try {
            const { credentials } = await oauth2Client.refreshAccessToken()
            oauth2Client.setCredentials(credentials)
            await upsertClientIntegration(clientId, 'google_analytics', {
              ...creds,
              ...credentials,
            })
          } catch {
            return null
          }
        }

        return oauth2Client
      }
    }
  }

  // --- File-based fallback ---
  const tokenPath = process.env.GA4_TOKEN_PATH ?? path.join(process.cwd(), '.credentials', 'ga4-token.json')

  if (!fs.existsSync(tokenPath)) return null

  let tokenData: {
    client_id?: string
    client_secret?: string
    refresh_token?: string
    access_token?: string
    expiry_date?: number
  }
  try {
    tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'))
  } catch {
    return null
  }

  const fileClientId = tokenData.client_id ?? process.env.GOOGLE_CLIENT_ID
  const fileClientSecret = tokenData.client_secret ?? process.env.GOOGLE_CLIENT_SECRET

  if (!fileClientId || !fileClientSecret || !tokenData.refresh_token) return null

  const oauth2Client = new google.auth.OAuth2(fileClientId, fileClientSecret)
  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expiry_date: tokenData.expiry_date,
  })

  if (!tokenData.expiry_date || Date.now() > tokenData.expiry_date - 60_000) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken()
      oauth2Client.setCredentials(credentials)
      const updated = { ...tokenData, ...credentials }
      fs.writeFileSync(tokenPath, JSON.stringify(updated, null, 2))
    } catch {
      return null
    }
  }

  return oauth2Client
}

function metricValue(row: { metricValues?: Array<{ value?: string | null }> }, index: number): number {
  return parseFloat(row.metricValues?.[index]?.value ?? '0') || 0
}

function dimensionValue(row: { dimensionValues?: Array<{ value?: string | null }> }, index: number): string {
  return row.dimensionValues?.[index]?.value ?? ''
}

export async function fetchGA4Data(propertyId: string, options: { days?: number; clientId?: string } = {}): Promise<GA4Data | null> {
  const auth = await buildAuth(options.clientId)
  if (!auth) return null

  const days = options.days ?? 28
  const dateRange = { startDate: `${days}daysAgo`, endDate: 'today' }

  try {
    const analytics = google.analyticsdata({ version: 'v1beta', auth })

    const [overviewRes, channelsRes, pagesRes] = await Promise.all([
      analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [dateRange],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'newUsers' },
            { name: 'engagementRate' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
            { name: 'conversions' },
          ],
        },
      }),
      analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [dateRange],
          dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
          metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: '10',
        },
      }),
      analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [dateRange],
          dimensions: [{ name: 'pagePath' }],
          metrics: [
            { name: 'sessions' },
            { name: 'engagementRate' },
            { name: 'averageSessionDuration' },
          ],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: '20',
        },
      }),
    ])

    const overviewRow = overviewRes.data.rows?.[0]
    const sessions = overviewRow ? metricValue(overviewRow, 0) : 0
    const users = overviewRow ? metricValue(overviewRow, 1) : 0
    const newUsers = overviewRow ? metricValue(overviewRow, 2) : 0
    const engagementRate = overviewRow ? Math.round(metricValue(overviewRow, 3) * 10000) / 100 : 0
    const avgSessionDuration = overviewRow ? Math.round(metricValue(overviewRow, 4)) : 0
    const bounceRate = overviewRow ? Math.round(metricValue(overviewRow, 5) * 10000) / 100 : 0
    const conversions = overviewRow ? metricValue(overviewRow, 6) : 0

    const topChannels = (channelsRes.data.rows ?? []).map((row) => ({
      channel: dimensionValue(row, 0),
      sessions: metricValue(row, 0),
      users: metricValue(row, 1),
    }))

    const topPages = (pagesRes.data.rows ?? []).map((row) => ({
      page: dimensionValue(row, 0),
      sessions: metricValue(row, 0),
      engagementRate: Math.round(metricValue(row, 1) * 10000) / 100,
      avgDuration: Math.round(metricValue(row, 2)),
    }))

    const organicRow = topChannels.find((c) =>
      c.channel.toLowerCase().includes('organic') && c.channel.toLowerCase().includes('search')
    )
    const organicSessions = organicRow?.sessions ?? 0
    const organicPercent = sessions > 0 ? Math.round((organicSessions / sessions) * 10000) / 100 : 0

    return {
      sessions,
      users,
      newUsers,
      engagementRate,
      avgSessionDuration,
      bounceRate,
      conversions,
      topChannels,
      topPages,
      organicTraffic: { sessions: organicSessions, percentOfTotal: organicPercent },
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { sessions: 0, users: 0, newUsers: 0, engagementRate: 0, avgSessionDuration: 0, bounceRate: 0, conversions: 0, topChannels: [], topPages: [], organicTraffic: { sessions: 0, percentOfTotal: 0 }, error: msg }
  }
}
