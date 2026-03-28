import { google } from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'
import { supabaseAdmin } from '@/lib/supabase-admin'

export interface GSCData {
  topQueries: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number }>
  topPages: Array<{ page: string; clicks: number; impressions: number; ctr: number; position: number }>
  strikingDistance: Array<{ query: string; impressions: number; position: number }>
  totalClicks: number
  totalImpressions: number
  averageCTR: number
  averagePosition: number
  error?: string
}

function getDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

async function buildAuth(clientId?: string) {
  // --- DB-based path ---
  if (clientId) {
    const { data, error } = await supabaseAdmin
      .from('client_integrations')
      .select('credentials, status')
      .eq('client_id', clientId)
      .eq('integration_type', 'google_search_console')
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
            await supabaseAdmin
              .from('client_integrations')
              .update({ credentials: { ...creds, ...credentials }, updated_at: new Date().toISOString() })
              .eq('client_id', clientId)
              .eq('integration_type', 'google_search_console')
          } catch {
            return null
          }
        }

        return oauth2Client
      }
    }
  }

  // --- File-based fallback ---
  const tokenPath = process.env.GSC_TOKEN_PATH ?? path.join(process.cwd(), '.credentials', 'gsc-token.json')

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

export async function fetchGSCData(siteUrl: string, options: { days?: number; clientId?: string } = {}): Promise<GSCData | null> {
  const auth = await buildAuth(options.clientId)
  if (!auth) return null

  const days = options.days ?? 28
  const { startDate, endDate } = getDateRange(days)

  try {
    const sc = google.searchconsole({ version: 'v1', auth })

    const [queriesRes, pagesRes] = await Promise.all([
      sc.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 50,
          startRow: 0,
        },
      }),
      sc.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['page'],
          rowLimit: 50,
          startRow: 0,
        },
      }),
    ])

    const queryRows = queriesRes.data.rows ?? []
    const pageRows = pagesRes.data.rows ?? []

    const topQueries = queryRows.map((r) => ({
      query: r.keys?.[0] ?? '',
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: Math.round((r.ctr ?? 0) * 10000) / 100,
      position: Math.round((r.position ?? 0) * 10) / 10,
    }))

    const topPages = pageRows.map((r) => ({
      page: r.keys?.[0] ?? '',
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: Math.round((r.ctr ?? 0) * 10000) / 100,
      position: Math.round((r.position ?? 0) * 10) / 10,
    }))

    const strikingDistance = topQueries.filter(
      (q) => q.position >= 5 && q.position <= 15 && q.impressions >= 50
    ).map((q) => ({ query: q.query, impressions: q.impressions, position: q.position }))

    const totalClicks = topQueries.reduce((s, q) => s + q.clicks, 0)
    const totalImpressions = topQueries.reduce((s, q) => s + q.impressions, 0)
    const averageCTR = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0
    const avgPos = topQueries.length > 0
      ? Math.round((topQueries.reduce((s, q) => s + q.position, 0) / topQueries.length) * 10) / 10
      : 0

    return { topQueries, topPages, strikingDistance, totalClicks, totalImpressions, averageCTR, averagePosition: avgPos }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { topQueries: [], topPages: [], strikingDistance: [], totalClicks: 0, totalImpressions: 0, averageCTR: 0, averagePosition: 0, error: msg }
  }
}
