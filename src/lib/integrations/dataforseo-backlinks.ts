// ============================================================
// DataForSEO Backlinks API Integration
// Docs: https://docs.dataforseo.com/v3/backlinks/overview/
// Auth: Basic Auth (login:password base64-encoded)
// ============================================================

import { supabaseAdmin } from '@/lib/supabase-admin'

const BASE_URL = 'https://api.dataforseo.com/v3'
const CACHE_TTL_DAYS = 7

// --------------- Types ---------------

export type BacklinkSummary = {
  domain: string
  domain_rank: number | null   // DataForSEO rank (0–1000)
  backlinks_total: number
  referring_domains: number
  referring_domains_nofollow: number
  broken_backlinks: number
}

export type Backlink = {
  source_url: string
  source_domain: string
  anchor: string
  dofollow: boolean
  domain_rank: number | null
  first_seen: string | null
  last_seen: string | null
}

export type ReferringDomain = {
  domain: string
  backlinks: number
  domain_rank: number | null
}

export type CompetitorDomain = {
  domain: string
  domain_rank: number | null
  common_referring_domains: number
}

// --------------- Auth ---------------

function isConfigured(): boolean {
  return !!(process.env.DATAFORSEO_LOGIN && process.env.DATAFORSEO_PASSWORD)
}

function authHeader(): string {
  const creds = `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`
  return 'Basic ' + Buffer.from(creds).toString('base64')
}

async function post<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader(),
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      console.error(`[DataForSEO] HTTP ${res.status} on ${path}: ${text.slice(0, 200)}`)
      return null
    }
    const data = await res.json()
    const task = data?.tasks?.[0]
    if (!task || task.status_code !== 20000) {
      console.error(`[DataForSEO] Task failed on ${path}: status=${task?.status_code}, message=${task?.status_message}`)
      return null
    }
    return task.result?.[0] ?? null
  } catch (err) {
    console.error(`[DataForSEO] Exception on ${path}:`, err instanceof Error ? err.message : err)
    return null
  }
}

// --------------- Cache helpers ---------------

function cacheKey(type: string, domain: string): string {
  return `${type}:${domain.toLowerCase()}`
}

async function getCache<T>(type: string, domain: string): Promise<T | null> {
  const cutoff = new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabaseAdmin
    .from('backlink_cache')
    .select('payload')
    .eq('cache_key', cacheKey(type, domain))
    .gte('fetched_at', cutoff)
    .single()
  return data?.payload ?? null
}

async function setCache(type: string, domain: string, payload: unknown): Promise<void> {
  await supabaseAdmin
    .from('backlink_cache')
    .upsert(
      { cache_key: cacheKey(type, domain), payload, fetched_at: new Date().toISOString() },
      { onConflict: 'cache_key' }
    )
}

// --------------- Public API ---------------

export async function fetchBacklinkSummary(domain: string): Promise<BacklinkSummary | null> {
  if (!isConfigured()) return null

  const cached = await getCache<BacklinkSummary>('summary', domain)
  if (cached) return cached

  const result = await post<{
    rank: number
    backlinks: number
    referring_domains: number
    referring_domains_nofollow: number
    broken_backlinks: number
  }>('/backlinks/summary/live', [{ target: domain }])

  if (!result) return null

  const summary: BacklinkSummary = {
    domain,
    domain_rank: result.rank ?? null,
    backlinks_total: result.backlinks ?? 0,
    referring_domains: result.referring_domains ?? 0,
    referring_domains_nofollow: result.referring_domains_nofollow ?? 0,
    broken_backlinks: result.broken_backlinks ?? 0,
  }

  await setCache('summary', domain, summary)
  return summary
}

export async function fetchBacklinks(domain: string, limit = 50): Promise<Backlink[]> {
  if (!isConfigured()) return []

  const cached = await getCache<Backlink[]>('backlinks', domain)
  if (cached) return cached

  const result = await post<{ items: Array<{
    url_from: string
    domain_from: string
    anchor: string
    dofollow: boolean
    domain_from_rank: number
    first_seen: string
    last_seen: string
  }> }>('/backlinks/backlinks/live', [{
    target: domain,
    limit: Math.min(limit, 50),  // budget cap: max 50
    backlinks_status_type: 'live',
    mode: 'as_is',
    order_by: ['domain_from_rank,desc'],
  }])

  const items = result?.items ?? []
  const backlinks: Backlink[] = items.map(item => ({
    source_url: item.url_from ?? '',
    source_domain: item.domain_from ?? '',
    anchor: item.anchor ?? '',
    dofollow: item.dofollow ?? false,
    domain_rank: item.domain_from_rank ?? null,
    first_seen: item.first_seen ?? null,
    last_seen: item.last_seen ?? null,
  }))

  if (backlinks.length > 0) await setCache('backlinks', domain, backlinks)
  return backlinks
}

export async function fetchReferringDomains(domain: string, limit = 20): Promise<ReferringDomain[]> {
  if (!isConfigured()) return []

  const cached = await getCache<ReferringDomain[]>('referring_domains', domain)
  if (cached) return cached

  const result = await post<{ items: Array<{
    domain: string
    rank: number
    backlinks: number
  }> }>('/backlinks/referring_domains/live', [{
    target: domain,
    limit: Math.min(limit, 20),  // budget cap: max 20
    order_by: ['rank,desc'],
  }])

  const items = result?.items ?? []
  const domains: ReferringDomain[] = items.map(item => ({
    domain: item.domain ?? '',
    backlinks: item.backlinks ?? 0,
    domain_rank: item.rank ?? null,
  }))

  if (domains.length > 0) await setCache('referring_domains', domain, domains)
  return domains
}

export async function fetchBacklinkCompetitors(domain: string, limit = 5): Promise<CompetitorDomain[]> {
  if (!isConfigured()) return []

  const cached = await getCache<CompetitorDomain[]>('competitors', domain)
  if (cached) return cached

  const result = await post<{ items: Array<{
    target: string
    rank: number
    intersections: number
  }> }>('/backlinks/competitors/live', [{
    target: domain,
    limit: Math.min(limit, 5),  // budget cap: max 5
    exclude_large_domains: true,
    order_by: ['intersections,desc'],
  }])

  const items = result?.items ?? []
  const competitors: CompetitorDomain[] = items.map(item => ({
    domain: item.target ?? '',
    domain_rank: item.rank ?? null,
    common_referring_domains: item.intersections ?? 0,
  }))

  if (competitors.length > 0) await setCache('competitors', domain, competitors)
  return competitors
}
