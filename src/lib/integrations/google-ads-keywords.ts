import { GoogleAdsApi } from 'google-ads-api'
import { supabaseAdmin } from '@/lib/supabase-admin'

export type KeywordVolumeResult = {
  keyword: string
  avg_monthly_searches: number | null
  competition: string | null
  low_bid: number | null  // cents
  high_bid: number | null // cents
}

const CACHE_TTL_DAYS = 7

function isConfigured(): boolean {
  return !!(
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
    process.env.GOOGLE_ADS_CLIENT_ID &&
    process.env.GOOGLE_ADS_CLIENT_SECRET &&
    process.env.GOOGLE_ADS_REFRESH_TOKEN &&
    process.env.GOOGLE_ADS_CUSTOMER_ID
  )
}

export async function fetchKeywordVolumes(keywords: string[]): Promise<KeywordVolumeResult[]> {
  if (!isConfigured() || keywords.length === 0) return []

  const unique = [...new Set(keywords.map(k => k.toLowerCase().trim()))].filter(Boolean)
  if (unique.length === 0) return []

  // Check cache (7-day TTL)
  const cutoff = new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { data: cached } = await supabaseAdmin
    .from('keyword_volume_cache')
    .select('keyword, volume, competition, low_bid_cents, high_bid_cents')
    .in('keyword', unique)
    .gte('fetched_at', cutoff)

  const hit = new Map<string, KeywordVolumeResult>()
  for (const row of (cached ?? [])) {
    hit.set(row.keyword, {
      keyword: row.keyword,
      avg_monthly_searches: row.volume,
      competition: row.competition,
      low_bid: row.low_bid_cents,
      high_bid: row.high_bid_cents,
    })
  }

  const misses = unique.filter(k => !hit.has(k))

  if (misses.length > 0) {
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    })
    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID!,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
      login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    })

    // Batch in chunks of 2000 (API limit)
    for (let i = 0; i < misses.length; i += 2000) {
      const chunk = misses.slice(i, i + 2000)
      // @ts-expect-error -- google-ads-api types require customer_id but SDK injects it automatically
      const response = await customer.keywordPlanIdeas.generateKeywordHistoricalMetrics({
        keywords: chunk,
        geo_target_constants: ['geoTargetConstants/2840'],
        language: 'languageConstants/1000',
        keyword_plan_network: 'GOOGLE_SEARCH',
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (response.results ?? []).map((result: any) => {
        const m = result.keyword_metrics
        return {
          keyword: String(result.text ?? '').toLowerCase().trim(),
          volume: m?.avg_monthly_searches ?? null,
          competition: (m?.competition as string) ?? null,
          low_bid_cents: m?.low_top_of_page_bid_micros != null
            ? Math.round(m.low_top_of_page_bid_micros / 10000)
            : null,
          high_bid_cents: m?.high_top_of_page_bid_micros != null
            ? Math.round(m.high_top_of_page_bid_micros / 10000)
            : null,
          fetched_at: new Date().toISOString(),
        }
      }).filter((r: { keyword: string }) => r.keyword)

      if (rows.length > 0) {
        await supabaseAdmin
          .from('keyword_volume_cache')
          .upsert(rows, { onConflict: 'keyword' })
      }

      for (const row of rows) {
        hit.set(row.keyword, {
          keyword: row.keyword,
          avg_monthly_searches: row.volume,
          competition: row.competition,
          low_bid: row.low_bid_cents,
          high_bid: row.high_bid_cents,
        })
      }
    }
  }

  return unique.map(k => hit.get(k) ?? {
    keyword: k,
    avg_monthly_searches: null,
    competition: null,
    low_bid: null,
    high_bid: null,
  })
}
