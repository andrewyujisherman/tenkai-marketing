// ============================================================
// Inline Service Request Processor
// Extracted from queue-worker.ts so requests can be processed
// directly in API routes (serverless-compatible).
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAgentForRequest, getDeliverableType, TENKAI_AGENTS } from '@/lib/agents/index'
import { AGENT_PROMPTS, buildTaskMessage } from '@/lib/agents/prompts'
import { buildDeliverableTitle, extractScore, generateSummary } from '@/lib/deliverables'
import { fetchAllSiteData } from '@/lib/integrations'
import { fetchKeywordSerpData } from '@/lib/integrations/serper'
import { crawlSite } from '@/lib/integrations/crawler'
import { checkNAPConsistency } from '@/lib/integrations/directory-checker'
import type { NAPConsistencyReport } from '@/lib/integrations/directory-checker'
import type { CrawlResult } from '@/lib/integrations/crawler'
import type { KeywordSerpEnrichment } from '@/lib/integrations'
import type { AgentId } from '@/lib/agents/index'
import { writeBackClientContext, getNextServices, extractChainData, shouldAutoChain } from '@/lib/service-chain'
import { tierAllowsRequestType } from '@/lib/tier-gates'
import { getReferenceContext } from '@/lib/seo-reference'
import { fetchGBPData } from '@/lib/integrations/google-business-profile'
import type { GBPData } from '@/lib/integrations/google-business-profile'
import { fetchKeywordVolumes } from '@/lib/integrations/google-ads-keywords'
import type { KeywordVolumeResult } from '@/lib/integrations/google-ads-keywords'
import {
  fetchBacklinkSummary,
  fetchBacklinks,
  fetchReferringDomains,
  fetchBacklinkCompetitors,
} from '@/lib/integrations/dataforseo-backlinks'
import type { BacklinkSummary, Backlink, ReferringDomain, CompetitorDomain } from '@/lib/integrations/dataforseo-backlinks'

// --------------- Deliverable Sanitization ---------------

/**
 * Strip bracket placeholders like [city name, e.g., New York] and literal "null" strings
 * from agent output before saving to DB. Prevents customers seeing template artifacts.
 */
function sanitizeDeliverable(content: Record<string, unknown>): Record<string, unknown> {
  function sanitize(val: unknown): unknown {
    if (typeof val === 'string') {
      let s = val
      // Strip bracket placeholders: [city], [state], [EDITOR_NAME], [BLOG_NAME], etc.
      // Catches: [city name, e.g., New York], [EDITOR_NAME], [Client's primary service city], [specific takeaway]
      s = s.replace(/\[(?:city|state|location|region|client|your|company|business|client's)[^\]]*\]/gi, '')
      // Catch ALL_CAPS template vars: [EDITOR_NAME], [BLOG_NAME], [RECENT_ARTICLE_TITLE]
      s = s.replace(/\[[A-Z][A-Z_]{2,}\]/g, '')
      // Catch [specific ...] and [insert ...] patterns
      s = s.replace(/\[(?:specific|insert|add|include|relevant)[^\]]*\]/gi, '')
      // Replace literal "null" string values
      if (/^null$/i.test(s.trim())) return ''
      // Clean up double spaces from removals
      s = s.replace(/\s{2,}/g, ' ').trim()
      return s
    }
    if (Array.isArray(val)) return val.map(sanitize)
    if (val && typeof val === 'object') {
      const result: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        result[k] = sanitize(v)
      }
      return result
    }
    return val
  }
  return sanitize(content) as Record<string, unknown>
}

/**
 * Normalize volume strings to consistent X/mo format.
 * Real data: "1,500/mo" (unchanged). Estimated ranges: "1,200-1,800/mo (estimated)" → "~1,500/mo (est.)"
 */
function normalizeVolumes(content: Record<string, unknown>): Record<string, unknown> {
  function normalizeVol(val: string): string {
    // Already clean format without estimate marker: "1,500/mo" — keep as-is
    if (/^\d[\d,]*\/mo$/.test(val)) return val
    // Range: "1,200-1,800/mo (estimated)" or "1,200 - 1,800/month"
    const rangeMatch = val.match(/^~?(\d[\d,]*)\s*[-–]\s*(\d[\d,]*)\s*(?:\/mo(?:nth)?)?/i)
    if (rangeMatch) {
      const low = parseInt(rangeMatch[1].replace(/,/g, ''))
      const high = parseInt(rangeMatch[2].replace(/,/g, ''))
      const avg = Math.round((low + high) / 2)
      return `~${avg.toLocaleString()}/mo (est.)`
    }
    // "2,900/month (estimated)" or "2,900/mo (est)"
    const estMatch = val.match(/^~?(\d[\d,]*)\s*\/mo(?:nth)?\s*\(est(?:imated?)?\)/i)
    if (estMatch) return `~${estMatch[1]}/mo (est.)`
    // "Estimated: 10,000-50,000/month"
    const prefixMatch = val.match(/estimated:\s*(\d[\d,]*)\s*[-–]\s*(\d[\d,]*)/i)
    if (prefixMatch) {
      const low = parseInt(prefixMatch[1].replace(/,/g, ''))
      const high = parseInt(prefixMatch[2].replace(/,/g, ''))
      const avg = Math.round((low + high) / 2)
      return `~${avg.toLocaleString()}/mo (est.)`
    }
    // "Estimated: 10,000/month"
    const prefixSingle = val.match(/estimated:\s*(\d[\d,]*)(?:\s*\/mo(?:nth)?)?/i)
    if (prefixSingle) return `~${prefixSingle[1]}/mo (est.)`
    return val
  }

  function walk(val: unknown): unknown {
    if (typeof val === 'string') return val
    if (Array.isArray(val)) return val.map(walk)
    if (val && typeof val === 'object') {
      const result: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        if (typeof v === 'string' && (k === 'volume' || k === 'search_volume' || k === 'avg_monthly_searches' || k === 'monthly_searches')) {
          result[k] = normalizeVol(v)
        } else {
          result[k] = walk(v)
        }
      }
      return result
    }
    return val
  }
  return walk(content) as Record<string, unknown>
}

// --------------- Site Scraping ---------------

const URL_BASED_REQUESTS = new Set([
  'site_audit', 'technical_audit', 'analytics_audit', 'link_analysis',
  'on_page_audit', 'meta_optimization', 'local_seo_audit', 'gbp_optimization',
  'geo_audit', 'entity_optimization', 'competitor_analysis',
  'monthly_report', 'content_decay_audit',
  'schema_generation', 'redirect_map', 'robots_sitemap',
  'outreach_emails', 'guest_post_draft', 'directory_submissions',
  'review_responses', 'review_campaign',
])

interface ScrapedSite {
  title: string
  metaDescription: string
  headings: string[]
  bodyText: string
  links: { internal: number; external: number }
  error?: string
}

async function scrapeUrl(url: string): Promise<ScrapedSite> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TenkaiSEO/1.0 (SEO Audit Bot)',
        'Accept': 'text/html',
      },
    })
    clearTimeout(timeout)

    if (!response.ok) {
      return { title: '', metaDescription: '', headings: [], bodyText: '', links: { internal: 0, external: 0 }, error: `HTTP ${response.status}` }
    }

    const html = await response.text()

    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is)
    const title = titleMatch ? titleMatch[1].trim() : ''

    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/is)
      ?? html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/is)
    const metaDescription = metaMatch ? metaMatch[1].trim() : ''

    const headingRegex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gis
    const headings: string[] = []
    let hMatch
    while ((hMatch = headingRegex.exec(html)) !== null && headings.length < 20) {
      headings.push(hMatch[1].replace(/<[^>]+>/g, '').trim())
    }

    let bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (bodyText.length > 2000) bodyText = bodyText.slice(0, 2000) + '...'

    const allLinks = html.match(/<a[^>]*href=["']([^"']*)["']/gi) ?? []
    const parsedUrl = new URL(url)
    let internal = 0, external = 0
    for (const link of allLinks) {
      const hrefMatch = link.match(/href=["']([^"']*)["']/i)
      if (hrefMatch) {
        const href = hrefMatch[1]
        if (href.startsWith('/') || href.includes(parsedUrl.hostname)) internal++
        else if (href.startsWith('http')) external++
      }
    }

    return { title, metaDescription, headings, bodyText, links: { internal, external } }
  } catch (err) {
    return {
      title: '', metaDescription: '', headings: [], bodyText: '',
      links: { internal: 0, external: 0 },
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

// --------------- Client SEO Context ---------------

interface ClientSeoContext {
  topKeywords: Array<{ keyword: string; position?: string; trend?: string }>
  auditFindings: Array<{ finding: string; severity: string }>
  contentGaps: Array<{ topic: string; priority: string }>
  competitors: Array<{ domain: string }>
  businessContext: { industry?: string; target_audience?: string; geography?: string; goals?: string; description?: string; services?: string; service_area?: string; ideal_customer?: string; last_audit_summary?: string }
  cwvStatus: { overall?: string; lcp?: string; inp?: string; cls?: string }
  lastAuditScore: number | null
}

/**
 * Fetch accumulated SEO context for a client (~500 tokens max).
 * Returns null if no context exists yet (first-time client).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchClientSeoContext(clientId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('client_seo_context')
      .select('*')
      .eq('client_id', clientId)
      .single()

    if (error || !data) return null

    const ctx = data as {
      top_keywords: ClientSeoContext['topKeywords']
      audit_findings: ClientSeoContext['auditFindings']
      content_gaps: ClientSeoContext['contentGaps']
      competitors: ClientSeoContext['competitors']
      business_context: ClientSeoContext['businessContext']
      cwv_status: ClientSeoContext['cwvStatus']
      last_audit_score: number | null
    }

    const parts: string[] = []
    parts.push('--- CLIENT SEO CONTEXT (accumulated from prior analyses) ---')

    if (ctx.business_context?.description) {
      parts.push(`Business Description: ${ctx.business_context.description}`)
    }
    if (ctx.business_context?.industry) {
      parts.push(`Industry: ${ctx.business_context.industry}`)
    }
    if (ctx.business_context?.services) {
      parts.push(`Services: ${ctx.business_context.services}`)
    }
    if (ctx.business_context?.service_area) {
      parts.push(`Service Area: ${ctx.business_context.service_area}`)
    }
    if (ctx.business_context?.ideal_customer) {
      parts.push(`Ideal Customer: ${ctx.business_context.ideal_customer}`)
    }
    if (ctx.business_context?.target_audience) {
      parts.push(`Target Audience: ${ctx.business_context.target_audience}`)
    }
    if (ctx.business_context?.geography) {
      parts.push(`Geography: ${ctx.business_context.geography}`)
    }
    if (ctx.business_context?.goals) {
      parts.push(`Goals: ${ctx.business_context.goals}`)
    }
    if (ctx.business_context?.last_audit_summary) {
      parts.push(`Business Summary (from audit): ${ctx.business_context.last_audit_summary}`)
    }
    if (ctx.last_audit_score != null) {
      parts.push(`Last Audit Score: ${ctx.last_audit_score}/100`)
    }
    if (ctx.cwv_status?.overall) {
      parts.push(`CWV Status: ${ctx.cwv_status.overall}`)
    }

    const topKw = Array.isArray(ctx.top_keywords) ? ctx.top_keywords.slice(0, 5) : []
    if (topKw.length > 0) {
      parts.push('Top Keywords: ' + topKw.map((k) => `"${k.keyword}"${k.position ? ` (#${k.position})` : ''}`).join(', '))
    }

    const findings = Array.isArray(ctx.audit_findings) ? ctx.audit_findings.filter((f) => f.severity === 'critical' || f.severity === 'high').slice(0, 3) : []
    if (findings.length > 0) {
      parts.push('Key Issues: ' + findings.map((f) => f.finding).join('; '))
    }

    const gaps = Array.isArray(ctx.content_gaps) ? ctx.content_gaps.slice(0, 3) : []
    if (gaps.length > 0) {
      parts.push('Content Gaps: ' + gaps.map((g) => g.topic).join(', '))
    }

    const comps = Array.isArray(ctx.competitors) ? ctx.competitors.slice(0, 3) : []
    if (comps.length > 0) {
      parts.push('Competitors: ' + comps.map((c) => c.domain).join(', '))
    }

    parts.push('--- END CLIENT CONTEXT ---')

    // Only return if we have meaningful context beyond the wrapper
    if (parts.length <= 2) return null
    return parts.join('\n')
  } catch {
    return null
  }
}

// --------------- Model Routing ---------------

const MODEL_MAP: Record<string, string> = {
  keyword_research: 'gemini-2.5-flash',
  link_analysis: 'gemini-2.5-flash',
  topic_cluster_map: 'gemini-2.5-flash',
  meta_optimization: 'gemini-2.5-flash',
  content_decay_audit: 'gemini-2.5-flash',
  entity_optimization: 'gemini-2.5-flash',
  site_audit: 'gemini-2.5-pro',
  technical_audit: 'gemini-2.5-pro',
  analytics_audit: 'gemini-2.5-pro',
  content_brief: 'gemini-2.5-pro',
  on_page_audit: 'gemini-2.5-pro',
  content_calendar: 'gemini-2.5-pro',
  local_seo_audit: 'gemini-2.5-pro',
  gbp_optimization: 'gemini-2.5-pro',
  geo_audit: 'gemini-2.5-pro',
  competitor_analysis: 'gemini-2.5-pro',
  monthly_report: 'gemini-2.5-pro',
  content_article: 'gemini-2.5-pro',
  outreach_emails: 'gemini-2.5-pro',
  guest_post_draft: 'gemini-2.5-pro',
  content_rewrite: 'gemini-2.5-flash',
  schema_generation: 'gemini-2.5-flash',
  redirect_map: 'gemini-2.5-flash',
  robots_sitemap: 'gemini-2.5-flash',
  directory_submissions: 'gemini-2.5-flash',
  review_responses: 'gemini-2.5-flash',
  review_campaign: 'gemini-2.5-flash',
}

// --------------- Core Processing ---------------

interface ProcessableRequest {
  id: string
  client_id: string
  request_type: string
  target_url: string | null
  parameters: Record<string, unknown>
  assigned_agent: string | null
  client_tier?: string | null
}

/**
 * Process a service request by calling Gemini, creating a deliverable,
 * and updating the request status. Works in both serverless (API route)
 * and standalone (queue worker) contexts.
 */
export async function processServiceRequest(request: ProcessableRequest): Promise<void> {
  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey)
  const agentId = (request.assigned_agent ?? getAgentForRequest(request.request_type)) as AgentId
  const agent = TENKAI_AGENTS[agentId]
  const systemPrompt = AGENT_PROMPTS[agentId]

  if (!systemPrompt) {
    throw new Error(`No prompt defined for agent: ${agentId}`)
  }

  const model = MODEL_MAP[request.request_type] ?? 'gemini-2.5-pro'

  // Mark as processing
  await supabaseAdmin
    .from('service_requests')
    .update({
      status: 'processing',
      assigned_agent: agentId,
      started_at: new Date().toISOString(),
    })
    .eq('id', request.id)

  try {
    // Fetch site data if URL-based
    let scrapedSite: ScrapedSite | null = null
    let siteData: Awaited<ReturnType<typeof fetchAllSiteData>> | null = null
    let keywordSerpData: KeywordSerpEnrichment[] | null = null
    let crawlData: CrawlResult | null = null
    let napReport: NAPConsistencyReport | null = null
    let keywordVolumeData: KeywordVolumeResult[] | null = null
    let backlinkSummary: BacklinkSummary | null = null
    let backlinkList: Backlink[] | null = null
    let referringDomains: ReferringDomain[] | null = null
    let backlinkCompetitors: CompetitorDomain[] | null = null
    const isUrlBased = request.target_url && URL_BASED_REQUESTS.has(request.request_type)

    // Request types that get a full site crawl
    const CRAWL_REQUESTS = new Set(['site_audit', 'technical_audit', 'link_analysis', 'on_page_audit', 'redirect_map', 'schema_generation'])

    // Keyword-based requests that benefit from real SERP data
    const KEYWORD_ENRICHED_REQUESTS = new Set([
      'keyword_research', 'content_brief', 'content_article', 'content_calendar',
      'topic_cluster_map', 'content_rewrite', 'content_decay_audit',
      'competitor_analysis', 'geo_audit',
    ])

    // Request types that benefit from NAP directory consistency data
    const NAP_CHECK_REQUESTS = new Set(['local_seo_audit', 'directory_submissions'])

    // Request types that benefit from GBP performance data
    const GBP_REQUESTS = new Set(['local_seo_audit', 'gbp_optimization', 'review_responses', 'review_campaign'])

    // Always scrape the site if we have a URL — agents need to know the actual business.
    // This prevents hallucinated business models (e.g. "metal detectors" for a PCB company).
    if (request.target_url && !isUrlBased) {
      scrapedSite = await scrapeUrl(request.target_url).catch(() => null) as ScrapedSite | null
    }

    if (isUrlBased) {
      const shouldCrawl = CRAWL_REQUESTS.has(request.request_type)
      const [scraped, enriched, crawled] = await Promise.all([
        scrapeUrl(request.target_url!),
        fetchAllSiteData(request.target_url!, {
          gscSiteUrl: request.parameters?.gsc_site_url as string | undefined,
          ga4PropertyId: request.parameters?.ga4_property_id as string | undefined,
          clientId: request.client_id,
        }).catch(() => null),
        shouldCrawl ? crawlSite(request.target_url!).catch(() => null) : Promise.resolve(null),
      ])
      scrapedSite = scraped
      siteData = enriched
      crawlData = crawled
    }

    // Fetch real SERP data for keyword-based requests
    if (KEYWORD_ENRICHED_REQUESTS.has(request.request_type)) {
      const params = request.parameters as Record<string, string>
      const seedKeywords: string[] = []

      // Extract keywords from various parameter formats
      if (params.target_keyword) seedKeywords.push(params.target_keyword)
      if (params.seed_keywords) {
        const parsed = typeof params.seed_keywords === 'string'
          ? params.seed_keywords.split(',').map((k: string) => k.trim())
          : Array.isArray(params.seed_keywords) ? params.seed_keywords as string[] : []
        seedKeywords.push(...parsed)
      }
      if (params.topic) seedKeywords.push(params.topic)
      if (params.niche) seedKeywords.push(params.niche)

      if (seedKeywords.length > 0) {
        const uniqueKeywords = [...new Set(seedKeywords)]
        const [serp, vol] = await Promise.all([
          fetchKeywordSerpData(
            uniqueKeywords.slice(0, 5),
            { gl: params.country_code ?? params.gl }
          ).catch(() => null),
          fetchKeywordVolumes(uniqueKeywords.slice(0, 2000)).catch(() => null),
        ])
        keywordSerpData = serp
        if (vol && vol.length > 0) keywordVolumeData = vol
      }
    }

    // Fetch backlink data for relevant request types
    const BACKLINK_SUMMARY_REQUESTS = new Set(['link_analysis', 'competitor_analysis', 'outreach_emails', 'site_audit'])
    const BACKLINK_FULL_REQUESTS = new Set(['link_analysis'])

    if (isUrlBased && BACKLINK_SUMMARY_REQUESTS.has(request.request_type)) {
      const domain = new URL(request.target_url!).hostname.replace(/^www\./, '')

      if (request.request_type === 'link_analysis') {
        // Full backlink analysis
        const [summary, links, refDomains, competitors] = await Promise.all([
          fetchBacklinkSummary(domain).catch(() => null),
          BACKLINK_FULL_REQUESTS.has(request.request_type) ? fetchBacklinks(domain, 20).catch(() => []) : Promise.resolve([]),
          fetchReferringDomains(domain, 10).catch(() => []),
          fetchBacklinkCompetitors(domain, 5).catch(() => []),
        ])
        backlinkSummary = summary
        backlinkList = links.length > 0 ? links : null
        referringDomains = refDomains.length > 0 ? refDomains : null
        backlinkCompetitors = competitors.length > 0 ? competitors : null
      } else if (request.request_type === 'competitor_analysis') {
        // Summary for target + any competitor domains in parameters
        backlinkSummary = await fetchBacklinkSummary(domain).catch(() => null)
        const params = request.parameters as Record<string, string>
        const competitorDomains: string[] = []
        if (params.competitors) {
          competitorDomains.push(...params.competitors.split(',').map((d: string) => d.trim()).filter(Boolean).slice(0, 5))
        }
        if (competitorDomains.length > 0) {
          const summaries = await Promise.all(
            competitorDomains.map(d => fetchBacklinkSummary(d).catch(() => null))
          )
          const valid = summaries.filter(Boolean) as BacklinkSummary[]
          if (valid.length > 0) {
            backlinkCompetitors = valid.map(s => ({
              domain: s.domain,
              domain_rank: s.domain_rank,
              common_referring_domains: s.referring_domains,
            }))
          }
        }
      } else {
        // Simple summary for outreach_emails and site_audit
        backlinkSummary = await fetchBacklinkSummary(domain).catch(() => null)
      }
    }

    // Fetch NAP directory consistency data for local SEO requests
    if (NAP_CHECK_REQUESTS.has(request.request_type)) {
      const params = request.parameters as Record<string, string>
      const bizName = params.business_name
      const bizAddress = params.address
      const bizPhone = params.phone
      const bizCity = params.city
      const bizState = params.state
      if (bizName && bizCity && bizState) {
        napReport = await checkNAPConsistency(
          bizName,
          bizAddress ?? '',
          bizPhone ?? '',
          bizCity,
          bizState
        ).catch(() => null)
      }
    }

    // Fetch GBP performance data for local SEO requests
    let gbpData: GBPData | null = null
    if (GBP_REQUESTS.has(request.request_type)) {
      gbpData = await fetchGBPData(request.client_id).catch(() => null)
    }

    // Fetch accumulated client SEO context
    const clientContext = await fetchClientSeoContext(request.client_id)

    // Backfill service area from client_seo_context into request parameters for chained requests
    // This ensures the SERVICE AREA block in buildTaskMessage fires even when the original
    // onboarding parameters weren't passed through the chain
    const params = request.parameters as Record<string, unknown>
    if (!params.serviceArea && !params.service_area && clientContext) {
      const areaMatch = clientContext.match(/Service Area:\s*(.+)/i)
      const geoMatch = clientContext.match(/Geography:\s*(.+)/i)
      if (areaMatch) params.serviceArea = areaMatch[1].trim()
      if (geoMatch && !params.targetGeography) params.targetGeography = geoMatch[1].trim()
    }

    let taskMessage = buildTaskMessage(
      request.request_type,
      request.target_url,
      request.parameters ?? {},
      scrapedSite,
      siteData,
      keywordSerpData,
      crawlData
    )

    // Append NAP consistency data to task message
    if (napReport) {
      const napLines: string[] = [
        '\n--- NAP DIRECTORY CONSISTENCY CHECK (real data from top directories) ---',
        `Business: ${napReport.businessName}`,
        `Source of Truth: ${napReport.sourceOfTruth.name} | ${napReport.sourceOfTruth.address} | ${napReport.sourceOfTruth.phone}`,
        `Consistency Score: ${napReport.consistencyScore}/100`,
        '',
      ]
      for (const dir of napReport.directories) {
        if (dir.found) {
          const flags = [
            dir.nameMatch === true ? 'Name OK' : dir.nameMatch === false ? 'NAME MISMATCH' : '',
            dir.addressMatch === true ? 'Address OK' : dir.addressMatch === false ? 'ADDRESS MISMATCH' : '',
            dir.phoneMatch === true ? 'Phone OK' : dir.phoneMatch === false ? 'PHONE MISMATCH' : '',
          ].filter(Boolean).join(', ')
          napLines.push(`  ${dir.directory}: FOUND — ${flags}${dir.url ? ` — ${dir.url}` : ''}`)
        } else {
          napLines.push(`  ${dir.directory}: NOT FOUND`)
        }
      }
      if (napReport.issues.length > 0) {
        napLines.push('')
        napLines.push('Issues:')
        for (const issue of napReport.issues) {
          napLines.push(`  - ${issue}`)
        }
      }
      napLines.push('--- END NAP CHECK ---')
      taskMessage += '\n' + napLines.join('\n')
    }

    // Append GBP performance data to task message
    if (gbpData) {
      const gbpLines: string[] = [
        '\n--- GOOGLE BUSINESS PROFILE PERFORMANCE DATA (real data) ---',
        `Period: ${gbpData.period.start} to ${gbpData.period.end}`,
        `Profile Views: ${gbpData.profileViews} | Search Appearances: ${gbpData.searchAppearances} | Map Views: ${gbpData.mapViews}`,
        `Call Clicks: ${gbpData.callClicks}`,
        `Direction Requests: ${gbpData.directionRequests}`,
        `Website Clicks: ${gbpData.websiteClicks}`,
      ]
      if (gbpData.error) gbpLines.push(`Note: ${gbpData.error}`)
      gbpLines.push('--- END GBP DATA ---')
      taskMessage += '\n' + gbpLines.join('\n')
    }

    // Append keyword search volume data to task message
    if (keywordVolumeData && keywordVolumeData.length > 0) {
      const volLines: string[] = [
        '\n--- KEYWORD SEARCH VOLUME DATA (Google Ads API — real data) ---',
        'keyword | avg_monthly_searches | competition | low_bid_cents | high_bid_cents',
      ]
      for (const kv of keywordVolumeData) {
        volLines.push(
          `${kv.keyword} | ${kv.avg_monthly_searches ?? 'n/a'} | ${kv.competition ?? 'n/a'} | ${kv.low_bid ?? 'n/a'} | ${kv.high_bid ?? 'n/a'}`
        )
      }
      volLines.push('--- END VOLUME DATA ---')
      taskMessage += '\n' + volLines.join('\n')
    }

    // Append backlink data to task message
    if (backlinkSummary) {
      const blLines: string[] = [
        '\n--- BACKLINK PROFILE (DataForSEO — real data) ---',
        `Domain: ${backlinkSummary.domain}`,
        `Domain Rank: ${backlinkSummary.domain_rank ?? 'n/a'} (0–1000 scale)`,
        `Total Backlinks: ${backlinkSummary.backlinks_total.toLocaleString()}`,
        `Referring Domains: ${backlinkSummary.referring_domains.toLocaleString()}`,
        `Referring Domains (Nofollow): ${backlinkSummary.referring_domains_nofollow.toLocaleString()}`,
        `Broken Backlinks: ${backlinkSummary.broken_backlinks.toLocaleString()}`,
      ]
      if (backlinkList && backlinkList.length > 0) {
        blLines.push('', 'Top Backlinks (by source domain rank):')
        blLines.push('source_domain | anchor | dofollow | domain_rank | first_seen')
        for (const bl of backlinkList.slice(0, 20)) {
          blLines.push(`${bl.source_domain} | "${bl.anchor}" | ${bl.dofollow ? 'dofollow' : 'nofollow'} | ${bl.domain_rank ?? 'n/a'} | ${bl.first_seen ?? 'n/a'}`)
        }
      }
      if (referringDomains && referringDomains.length > 0) {
        blLines.push('', 'Top Referring Domains:')
        blLines.push('domain | backlinks_to_target | domain_rank')
        for (const rd of referringDomains.slice(0, 10)) {
          blLines.push(`${rd.domain} | ${rd.backlinks} | ${rd.domain_rank ?? 'n/a'}`)
        }
      }
      if (backlinkCompetitors && backlinkCompetitors.length > 0) {
        blLines.push('', 'Backlink Competitors (domains sharing backlink profile):')
        blLines.push('domain | domain_rank | shared_referring_domains')
        for (const comp of backlinkCompetitors.slice(0, 5)) {
          blLines.push(`${comp.domain} | ${comp.domain_rank ?? 'n/a'} | ${comp.common_referring_domains}`)
        }
      }
      blLines.push('--- END BACKLINK DATA ---')
      taskMessage += '\n' + blLines.join('\n')
    }

    // Gate: reject requests with zero business context — prevents hallucinated business models
    const hasScrapedData = scrapedSite && !scrapedSite.error && scrapedSite.bodyText.length > 50
    const hasClientContext = !!clientContext
    const hasBusinessParams = !!(request.parameters as Record<string, unknown>)?.businessDescription || !!(request.parameters as Record<string, unknown>)?.industry
    if (!hasScrapedData && !hasClientContext && !hasBusinessParams) {
      throw new Error(`Cannot process ${request.request_type}: no business context available (no scrapeable site, no client SEO context, no onboarding data). Client needs to complete onboarding or provide a valid website URL.`)
    }

    // Load professional reference material for this request type
    const referenceContext = getReferenceContext(request.request_type)
    const referenceBlock = referenceContext
      ? `\n\n--- PROFESSIONAL REFERENCE ---\n${referenceContext}\n--- END REFERENCE ---\n\n`
      : ''

    // Call Gemini API — prepend client context + reference to system prompt
    const fullSystemPrompt = clientContext
      ? `${clientContext}${referenceBlock}${systemPrompt}`
      : referenceBlock ? `${referenceBlock}${systemPrompt}` : systemPrompt

    const modelConfig: Record<string, unknown> = {
      model,
      systemInstruction: fullSystemPrompt,
    }
    if (isUrlBased) {
      modelConfig.tools = [{ googleSearch: {} }]
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geminiModel = genAI.getGenerativeModel(modelConfig as any)

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: taskMessage }] }],
    })

    const responseText = result.response.text()
    if (!responseText) {
      throw new Error('No text content in Gemini response')
    }

    // Parse JSON from response — retry once if parsing fails
    let parsedContent: Record<string, unknown>
    try {
      let jsonStr = responseText.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
      }
      parsedContent = JSON.parse(jsonStr)
    } catch {
      console.warn(`[process] JSON parse failed for ${request.request_type}, retrying Gemini call...`)
      try {
        const retryResult = await geminiModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: taskMessage + '\n\nCRITICAL: Your previous response was not valid JSON. Return ONLY a valid JSON object. No markdown backticks, no explanatory text before or after. Just the raw JSON object.' }] }],
        })
        const retryText = retryResult.response.text()
        if (!retryText) throw new Error('Empty retry response')
        let retryJson = retryText.trim()
        if (retryJson.startsWith('```')) {
          retryJson = retryJson.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
        }
        parsedContent = JSON.parse(retryJson)
        console.log(`[process] Retry succeeded for ${request.request_type}`)
      } catch {
        throw new Error(`Gemini returned invalid JSON on both attempts for ${request.request_type}. Response starts with: ${responseText.slice(0, 200)}`)
      }
    }

    // Post-process: enrich keyword research with real DataForSEO volume data
    if (request.request_type === 'keyword_research' && typeof parsedContent === 'object') {
      try {
        console.log('[process] Starting keyword volume enrichment...')
        // Collect all keywords from the agent output
        const allKeywords: string[] = []
        const extract = (arr: unknown[]) => {
          for (const item of arr) {
            if (typeof item === 'string') allKeywords.push(item)
            else if (item && typeof item === 'object') {
              const o = item as Record<string, unknown>
              if (typeof o.keyword === 'string') allKeywords.push(o.keyword)
              if (typeof o.term === 'string') allKeywords.push(o.term)
              if (typeof o.primary_keyword === 'string') allKeywords.push(o.primary_keyword)
            }
          }
        }
        for (const val of Object.values(parsedContent)) {
          if (Array.isArray(val)) extract(val)
        }
        const unique = [...new Set(allKeywords.filter(Boolean).map(k => k.toLowerCase()))]
        if (unique.length > 0) {
          console.log(`[process] Fetching volumes for ${unique.length} keywords: ${unique.slice(0, 5).join(', ')}...`)
          const volumes = await fetchKeywordVolumes(unique).catch((err) => { console.error('[process] fetchKeywordVolumes FAILED:', err); return [] })
          if (volumes.length > 0) {
            const volMap = new Map(volumes.filter(v => v.avg_monthly_searches != null).map(v => [v.keyword.toLowerCase(), v]))
            // Replace estimated volumes in all arrays containing keyword objects
            const enrich = (arr: unknown[]) => {
              for (const item of arr) {
                if (item && typeof item === 'object') {
                  const o = item as Record<string, unknown>
                  const kw = String(o.keyword ?? o.term ?? o.primary_keyword ?? '').toLowerCase()
                  const real = volMap.get(kw)
                  if (real && real.avg_monthly_searches != null) {
                    o.volume = `${real.avg_monthly_searches.toLocaleString()}/mo`
                    if (real.competition) o.competition = real.competition
                    if (real.cpc != null) o.cpc = `$${real.cpc.toFixed(2)}`
                  }
                }
              }
            }
            for (const val of Object.values(parsedContent)) {
              if (Array.isArray(val)) enrich(val)
            }
          }
        }
      } catch (err) {
        console.warn('[process] keyword volume enrichment failed:', err)
      }
    }

    // Post-process: sanitize placeholders and normalize volumes before saving
    parsedContent = sanitizeDeliverable(parsedContent)
    parsedContent = normalizeVolumes(parsedContent)

    // Gate: reject deliverables with empty primary content (e.g. review_responses with 0 responses)
    const contentArrays = Object.values(parsedContent).filter(v => Array.isArray(v))
    const contentStrings = Object.values(parsedContent).filter(v => typeof v === 'string' && v.length > 100)
    if (contentArrays.length > 0 && contentArrays.every(a => (a as unknown[]).length === 0) && contentStrings.length === 0) {
      throw new Error(`Agent returned empty deliverable for ${request.request_type}: all content arrays are empty. This suggests the agent had insufficient data to produce output.`)
    }

    const title = buildDeliverableTitle(request.request_type, request.parameters, request.target_url)
    const summary = generateSummary(request.request_type, parsedContent)
    const score = extractScore(request.request_type, parsedContent)
    const deliverableType = getDeliverableType(request.request_type)

    // Create deliverable
    const { error: deliverableError } = await supabaseAdmin
      .from('deliverables')
      .insert({
        request_id: request.id,
        client_id: request.client_id,
        agent_name: agentId,
        deliverable_type: deliverableType,
        title,
        content: parsedContent,
        summary,
        score,
        status: 'draft',
      })

    if (deliverableError) {
      throw new Error(`Failed to create deliverable: ${deliverableError.message}`)
    }

    // Content promotion bridge for articles
    if (deliverableType === 'article') {
      const articleText = parsedContent.article ?? parsedContent.content ?? parsedContent.body ?? parsedContent.raw_response ?? ''
      const keywords = Array.isArray(parsedContent.keywords)
        ? parsedContent.keywords as string[]
        : Array.isArray(parsedContent.target_keywords)
          ? parsedContent.target_keywords as string[]
          : []

      await supabaseAdmin
        .from('content_posts')
        .insert({
          client_id: request.client_id,
          title,
          content: typeof articleText === 'string' ? articleText : JSON.stringify(articleText),
          status: 'pending_approval',
          topic: (request.parameters?.topic as string) ?? (parsedContent.topic as string) ?? null,
          keywords: keywords.length > 0 ? keywords : null,
          agent_author: agent.name,
          seo_score: score,
        })
        .then(({ error }) => {
          if (error) console.warn(`[process] Content post promotion failed: ${error.message}`)
        })
    }

    // Write back key findings to client_seo_context (fire-and-forget)
    writeBackClientContext(request.client_id, request.request_type, parsedContent)
      .catch((err) => console.warn(`[process] writeBackClientContext failed:`, err))

    // Auto-chain: queue next services if client tier allows
    if (shouldAutoChain(request.client_tier ?? null, request.request_type)) {
      const chainable = getNextServices(request.request_type)
        .filter((svcType) => tierAllowsRequestType(request.client_tier, svcType))
      if (chainable.length > 0) {
        const chainData = extractChainData(request.request_type, parsedContent, request.target_url)
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const eligibleTypes: string[] = []
        for (const svcType of chainable) {
          const { count } = await supabaseAdmin
            .from('service_requests')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', request.client_id)
            .eq('request_type', svcType)
            .gte('created_at', cutoff)
          if ((count ?? 0) > 0) {
            console.log(`[process] Auto-chain skipped ${svcType} — already ran in last 24h`)
            continue
          }
          eligibleTypes.push(svcType)
        }
        if (eligibleTypes.length > 0) {
          const chainedRows = eligibleTypes.map((svcType) => ({
            client_id: request.client_id,
            request_type: svcType,
            target_url: (chainData.target_url as string | null) ?? request.target_url,
            parameters: chainData,
            status: 'queued',
            triggered_by: request.id,
            priority: 3,
          }))
          supabaseAdmin
            .from('service_requests')
            .insert(chainedRows)
            .then(({ error }) => {
              if (error) console.warn(`[process] Auto-chain insert failed: ${error.message}`)
              else console.log(`[process] Auto-chained ${eligibleTypes.join(', ')} from ${request.request_type}`)
            })
        }
      }
    }

    // Mark completed
    await supabaseAdmin
      .from('service_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', request.id)

  } catch (error) {
    // Mark failed
    const errorMessage = error instanceof Error ? error.message : String(error)
    await supabaseAdmin
      .from('service_requests')
      .update({
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', request.id)

    throw error
  }
}
