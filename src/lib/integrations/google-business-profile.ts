import { supabaseAdmin } from '@/lib/supabase-admin'
import { getValidAccessToken } from '@/lib/integrations/client-store'

export interface GBPData {
  profileViews: number
  searchAppearances: number
  mapViews: number
  websiteClicks: number
  callClicks: number
  directionRequests: number
  period: { start: string; end: string }
  error?: string
}

async function getLocationId(clientId: string, accessToken: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('client_integrations')
    .select('metadata')
    .eq('client_id', clientId)
    .eq('integration_type', 'google_business_profile')
    .single()

  const meta = (data?.metadata ?? {}) as Record<string, unknown>
  if (meta.location_id) return meta.location_id as string

  try {
    const acctRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!acctRes.ok) return null
    const acctData = await acctRes.json()
    const accounts = (acctData.accounts ?? []) as Array<{ name: string; accountName: string }>
    if (accounts.length === 0) return null

    const accountName = accounts[0].name
    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!locRes.ok) return null
    const locData = await locRes.json()
    const locations = (locData.locations ?? []) as Array<{ name: string; title: string }>
    if (locations.length === 0) return null

    const locationId = locations[0].name.replace('locations/', '')

    await supabaseAdmin
      .from('client_integrations')
      .update({
        metadata: {
          ...meta,
          location_id: locationId,
          location_name: locations[0].title,
          account_id: accountName.replace('accounts/', ''),
          accounts: accounts.map((a) => ({ name: a.name, displayName: a.accountName })),
          locations: locations.map((l) => ({ name: l.name, title: l.title })),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('client_id', clientId)
      .eq('integration_type', 'google_business_profile')

    return locationId
  } catch {
    return null
  }
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function emptyGBP(start: Date, end: Date, error?: string): GBPData {
  return {
    profileViews: 0,
    searchAppearances: 0,
    mapViews: 0,
    websiteClicks: 0,
    callClicks: 0,
    directionRequests: 0,
    period: { start: formatDate(start), end: formatDate(end) },
    error,
  }
}

export async function fetchGBPData(
  clientId: string,
  options: { days?: number } = {}
): Promise<GBPData | null> {
  const accessToken = await getValidAccessToken(clientId, 'google_business_profile')
  if (!accessToken) return null

  const days = options.days ?? 28
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const locationId = await getLocationId(clientId, accessToken)
  if (!locationId) {
    return emptyGBP(startDate, endDate, 'No GBP location found. Please reconnect your Google Business Profile.')
  }

  const params = new URLSearchParams()
  const metrics = [
    'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
    'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
    'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
    'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
    'CALL_CLICKS',
    'WEBSITE_CLICKS',
    'BUSINESS_DIRECTION_REQUESTS',
  ]
  metrics.forEach((m) => params.append('dailyMetrics', m))
  params.set('daily_range.start_date.year', String(startDate.getFullYear()))
  params.set('daily_range.start_date.month', String(startDate.getMonth() + 1))
  params.set('daily_range.start_date.day', String(startDate.getDate()))
  params.set('daily_range.end_date.year', String(endDate.getFullYear()))
  params.set('daily_range.end_date.month', String(endDate.getMonth() + 1))
  params.set('daily_range.end_date.day', String(endDate.getDate()))

  try {
    const res = await fetch(
      `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:fetchMultiDailyMetricsTimeSeries?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error('[gbp] Performance API error:', res.status, errText)
      return emptyGBP(startDate, endDate, `GBP API error: ${res.status}`)
    }

    const resData = await res.json()
    const series = (resData.multiDailyMetricTimeSeries ?? []) as Array<{
      dailyMetric: string
      timeSeries?: { datedValues?: Array<{ value?: string }> }
    }>

    const sums: Record<string, number> = {}
    for (const entry of series) {
      const values = entry.timeSeries?.datedValues ?? []
      sums[entry.dailyMetric] = values.reduce(
        (acc, v) => acc + (parseInt(v.value ?? '0', 10) || 0),
        0
      )
    }

    const desktopMaps = sums['BUSINESS_IMPRESSIONS_DESKTOP_MAPS'] ?? 0
    const mobileMaps = sums['BUSINESS_IMPRESSIONS_MOBILE_MAPS'] ?? 0
    const desktopSearch = sums['BUSINESS_IMPRESSIONS_DESKTOP_SEARCH'] ?? 0
    const mobileSearch = sums['BUSINESS_IMPRESSIONS_MOBILE_SEARCH'] ?? 0

    return {
      profileViews: desktopSearch + mobileSearch + desktopMaps + mobileMaps,
      searchAppearances: desktopSearch + mobileSearch,
      mapViews: desktopMaps + mobileMaps,
      websiteClicks: sums['WEBSITE_CLICKS'] ?? 0,
      callClicks: sums['CALL_CLICKS'] ?? 0,
      directionRequests: sums['BUSINESS_DIRECTION_REQUESTS'] ?? 0,
      period: { start: formatDate(startDate), end: formatDate(endDate) },
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return emptyGBP(startDate, endDate, msg)
  }
}
