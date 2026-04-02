import { supabaseAdmin } from '@/lib/supabase-admin'

export type KeywordVolumeResult = {
  keyword: string
  avg_monthly_searches: number | null
  competition: string | null
  low_bid: number | null  // cents
  high_bid: number | null // cents
  cpc: number | null      // dollars
}

const CACHE_TTL_DAYS = 7

function hasDataForSEO(): boolean {
  return !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD)
}

/**
 * Fetch real keyword search volume data via DataForSEO Google Ads API.
 * Results are cached in keyword_volume_cache (7-day TTL).
 * Costs ~$0.05 per batch of up to 700 keywords.
 */
export async function fetchKeywordVolumes(keywords: string[]): Promise<KeywordVolumeResult[]> {
  if (keywords.length === 0) return []
  if (!hasDataForSEO()) return keywords.map(k => ({ keyword: k, avg_monthly_searches: null, competition: null, low_bid: null, high_bid: null, cpc: null }))

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
      cpc: row.high_bid_cents != null ? row.high_bid_cents / 100 : null,
    })
  }

  const misses = unique.filter(k => !hit.has(k))

  if (misses.length > 0) {
    // DataForSEO allows up to 700 keywords per request
    for (let i = 0; i < misses.length; i += 700) {
      const chunk = misses.slice(i, i + 700)
      try {
        const auth = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64')
        const res = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
          method: 'POST',
          headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
          body: JSON.stringify([{ keywords: chunk, location_code: 2840, language_code: 'en' }]),
        })
        const data = await res.json()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = (data?.tasks?.[0]?.result ?? []) as Array<any>
        const rows = results.map((r) => ({
          keyword: String(r.keyword ?? '').toLowerCase().trim(),
          volume: r.search_volume ?? null,
          competition: r.competition != null ? String(r.competition).toUpperCase() : null,
          low_bid_cents: r.low_top_of_page_bid != null ? Math.round(r.low_top_of_page_bid * 100) : null,
          high_bid_cents: r.high_top_of_page_bid != null ? Math.round(r.high_top_of_page_bid * 100) : null,
          fetched_at: new Date().toISOString(),
        })).filter((r) => r.keyword)

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
            cpc: row.high_bid_cents != null ? row.high_bid_cents / 100 : null,
          })
        }
      } catch (err) {
        console.warn('[keyword-volume] DataForSEO request failed:', err)
      }
    }
  }

  return unique.map(k => hit.get(k) ?? {
    keyword: k,
    avg_monthly_searches: null,
    competition: null,
    low_bid: null,
    high_bid: null,
    cpc: null,
  })
}
