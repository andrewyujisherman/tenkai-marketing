// ============================================================
// Tenkai Queue Worker
// Polls service_requests for queued items and processes them
// via AI agents (Google Gemini API).
//
// Usage:
//   npx tsx src/workers/queue-worker.ts
//
// Environment:
//   GEMINI_API_KEY             — required
//   NEXT_PUBLIC_SUPABASE_URL   — required
//   SUPABASE_SERVICE_ROLE_KEY  — required
//   QUEUE_POLL_INTERVAL_MS     — optional, default 10000 (10s)
//   QUEUE_WORKER_LOG_LEVEL     — optional, 'debug' | 'info' | 'warn' | 'error'
//
// Model routing:
//   Flash (research/analysis): keyword_research, link_analysis, topic_cluster_map,
//     meta_optimization, content_decay_audit, entity_optimization
//   Pro (customer-facing): site_audit, technical_audit, analytics_audit, content_brief,
//     on_page_audit, content_calendar, local_seo_audit, gbp_optimization,
//     geo_audit, competitor_analysis, monthly_report
//
// The worker uses the Supabase service_role key to bypass RLS.
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { getAgentForRequest, getDeliverableType, TENKAI_AGENTS } from '../lib/agents/index'
import { AGENT_PROMPTS, buildTaskMessage } from '../lib/agents/prompts'
import { fetchAllSiteData, type SiteData } from '../lib/integrations'
import type { AgentId } from '../lib/agents/index'

// --------------- Site Scraping ---------------

const URL_BASED_REQUESTS = new Set([
  'site_audit', 'technical_audit', 'analytics_audit', 'link_analysis',
  'on_page_audit', 'meta_optimization', 'local_seo_audit', 'gbp_optimization',
  'geo_audit', 'entity_optimization', 'competitor_analysis',
  'monthly_report', 'content_decay_audit',
  // Execution types — url-based (content_article and content_rewrite are topic-based, NOT url-based)
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

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is)
    const title = titleMatch ? titleMatch[1].trim() : ''

    // Extract meta description
    const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/is)
      ?? html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/is)
    const metaDescription = metaMatch ? metaMatch[1].trim() : ''

    // Extract headings (H1-H3)
    const headingRegex = /<h[1-3][^>]*>(.*?)<\/h[1-3]>/gis
    const headings: string[] = []
    let hMatch
    while ((hMatch = headingRegex.exec(html)) !== null && headings.length < 20) {
      headings.push(hMatch[1].replace(/<[^>]+>/g, '').trim())
    }

    // Extract body text (strip tags, scripts, styles)
    let bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    // Limit to ~2000 chars to keep prompt reasonable
    if (bodyText.length > 2000) bodyText = bodyText.slice(0, 2000) + '...'

    // Count links
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

// --------------- Config ---------------

const POLL_INTERVAL = parseInt(process.env.QUEUE_POLL_INTERVAL_MS ?? '10000', 10)
const LOG_LEVEL = (process.env.QUEUE_WORKER_LOG_LEVEL ?? 'info') as 'debug' | 'info' | 'warn' | 'error'
const REQUEST_TIMEOUT_MS = 120_000 // 2 min timeout for AI calls

// Model routing — Flash for research/analysis, Pro for customer-facing deliverables
const MODEL_MAP: Record<string, string> = {
  // Flash (research/analysis tasks)
  keyword_research: 'gemini-2.5-flash',
  link_analysis: 'gemini-2.5-flash',
  topic_cluster_map: 'gemini-2.5-flash',
  meta_optimization: 'gemini-2.5-flash',
  content_decay_audit: 'gemini-2.5-flash',
  entity_optimization: 'gemini-2.5-flash',
  // Pro (customer-facing deliverables)
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
  // Execution types — Pro for writing quality, Flash for structured generation
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

function getModelForRequestType(requestType: string): string {
  return MODEL_MAP[requestType] ?? 'gemini-2.5-pro'
}

// --------------- Clients ---------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const geminiApiKey = process.env.GEMINI_API_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[FATAL] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!geminiApiKey) {
  console.error('[FATAL] Missing GEMINI_API_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const genAI = new GoogleGenerativeAI(geminiApiKey)

// --------------- Logging ---------------

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const
const currentLevel = LOG_LEVELS[LOG_LEVEL] ?? 1

function log(level: keyof typeof LOG_LEVELS, msg: string, data?: unknown) {
  if (LOG_LEVELS[level] < currentLevel) return
  const ts = new Date().toISOString()
  const prefix = `[${ts}] [${level.toUpperCase()}]`
  if (data !== undefined) {
    console.log(`${prefix} ${msg}`, typeof data === 'string' ? data : JSON.stringify(data))
  } else {
    console.log(`${prefix} ${msg}`)
  }
}

// --------------- Types ---------------

interface ServiceRequest {
  id: string
  client_id: string
  request_type: string
  target_url: string | null
  parameters: Record<string, unknown>
  status: string
  assigned_agent: string | null
  priority: number
  attempts: number
  max_attempts: number
}

// --------------- Core Logic ---------------

/**
 * Claim the next queued request using an atomic update.
 * Returns the request if one was claimed, null otherwise.
 */
async function claimNextRequest(): Promise<ServiceRequest | null> {
  // Fetch the oldest queued request (highest priority first, then FIFO)
  const { data: candidates, error: fetchError } = await supabase
    .from('service_requests')
    .select('*')
    .eq('status', 'queued')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)

  if (fetchError) {
    log('error', 'Failed to fetch queued requests', fetchError.message)
    return null
  }

  if (!candidates || candidates.length === 0) {
    log('debug', 'No queued requests found')
    return null
  }

  const request = candidates[0] as ServiceRequest
  const agentId = getAgentForRequest(request.request_type)

  // Atomically claim it by setting status to 'processing'
  const { data: claimed, error: claimError } = await supabase
    .from('service_requests')
    .update({
      status: 'processing',
      assigned_agent: agentId,
      started_at: new Date().toISOString(),
      attempts: request.attempts + 1,
    })
    .eq('id', request.id)
    .eq('status', 'queued') // Only if still queued (prevents double-claim)
    .select()

  if (claimError) {
    log('error', `Failed to claim request ${request.id}`, claimError.message)
    return null
  }

  if (!claimed || claimed.length === 0) {
    log('warn', `Request ${request.id} was claimed by another worker`)
    return null
  }

  return { ...request, assigned_agent: agentId, attempts: request.attempts + 1 }
}

/**
 * Process a single service request by calling the Gemini API.
 */
async function processRequest(request: ServiceRequest): Promise<void> {
  const agentId = request.assigned_agent as AgentId
  const agent = TENKAI_AGENTS[agentId]
  const systemPrompt = AGENT_PROMPTS[agentId]

  if (!systemPrompt) {
    throw new Error(`No prompt defined for agent: ${agentId}`)
  }

  const model = getModelForRequestType(request.request_type)
  log('info', `Processing request ${request.id} (${request.request_type}) with agent ${agent.name} (${agent.kanji}) using ${model}`)

  // Fetch site data if URL-based request (scrape + API integrations in parallel)
  let scrapedSite: ScrapedSite | null = null
  let siteData: SiteData | null = null
  const isUrlBased = request.target_url && URL_BASED_REQUESTS.has(request.request_type)

  if (isUrlBased) {
    log('info', `Fetching site data for ${request.target_url}...`)

    // Run scrape and API integrations in parallel for speed
    const [scraped, enriched] = await Promise.all([
      scrapeUrl(request.target_url!),
      fetchAllSiteData(request.target_url!, {
        gscSiteUrl: request.parameters?.gsc_site_url as string | undefined,
        ga4PropertyId: request.parameters?.ga4_property_id as string | undefined,
      }).catch((err) => {
        log('warn', `Integration data fetch failed: ${err instanceof Error ? err.message : String(err)}`)
        return null
      }),
    ])

    scrapedSite = scraped
    siteData = enriched

    if (scrapedSite.error) {
      log('warn', `Scrape failed for ${request.target_url}: ${scrapedSite.error}`)
    } else {
      log('info', `Scraped ${request.target_url}: title="${scrapedSite.title}", ${scrapedSite.headings.length} headings, ${scrapedSite.bodyText.length} chars body`)
    }
    if (siteData) {
      const sources = [
        siteData.pageSpeed && !siteData.pageSpeed.error ? 'PageSpeed' : null,
        siteData.serp && !siteData.serp.error ? 'SERP' : null,
        siteData.gsc && !siteData.gsc.error ? 'GSC' : null,
        siteData.ga4 && !siteData.ga4.error ? 'GA4' : null,
      ].filter(Boolean)
      log('info', `Enriched data available: ${sources.join(', ') || 'none'}`)
    }
  }

  const taskMessage = buildTaskMessage(
    request.request_type,
    request.target_url,
    request.parameters ?? {},
    scrapedSite,
    siteData
  )

  // Call Gemini API with timeout
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let responseText: string
  try {
    // Enable Google Search grounding for URL-based requests
    const modelConfig: Record<string, unknown> = {
      model,
      systemInstruction: systemPrompt,
    }
    if (isUrlBased) {
      modelConfig.tools = [{ googleSearch: {} }]
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geminiModel = genAI.getGenerativeModel(modelConfig as any)

    const result = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: taskMessage }] }],
    })

    responseText = result.response.text()
    if (!responseText) {
      throw new Error('No text content in Gemini response')
    }
  } finally {
    clearTimeout(timeout)
  }

  // Parse JSON from response (strip markdown code fences if present)
  let parsedContent: Record<string, unknown>
  try {
    let jsonStr = responseText.trim()
    // Remove markdown code fences if the model wraps its response
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
    }
    parsedContent = JSON.parse(jsonStr)
  } catch (parseError) {
    log('warn', `Failed to parse JSON from agent response for request ${request.id}, storing raw`)
    parsedContent = {
      raw_response: responseText,
      parse_error: String(parseError),
    }
  }

  // Generate a human-readable title for the deliverable
  const params = request.parameters as Record<string, string>
  const titleMap: Record<string, string> = {
    content_brief: `Content Brief: ${params.topic ?? params.keyword ?? request.target_url ?? 'Topic'}`,
    keyword_research: `Keyword Research: ${params.topic ?? request.target_url ?? 'Website'}`,
    site_audit: `SEO Site Audit: ${request.target_url ?? 'Website'}`,
    technical_audit: `Technical SEO Audit: ${request.target_url ?? 'Website'}`,
    analytics_audit: `Analytics Audit: ${request.target_url ?? 'Website'}`,
    link_analysis: `Link Analysis: ${request.target_url ?? 'Website'}`,
    on_page_audit: `On-Page SEO Audit: ${request.target_url ?? 'Page'}`,
    meta_optimization: `Meta Optimization: ${request.target_url ?? 'Website'}`,
    content_calendar: `Content Calendar: ${params.topic ?? request.target_url ?? 'Website'}`,
    topic_cluster_map: `Topic Cluster Map: ${params.topic ?? request.target_url ?? 'Website'}`,
    local_seo_audit: `Local SEO Audit: ${request.target_url ?? 'Business'}`,
    gbp_optimization: `GBP Optimization: ${request.target_url ?? 'Business'}`,
    geo_audit: `GEO / AI Search Audit: ${request.target_url ?? 'Website'}`,
    entity_optimization: `Entity Optimization: ${request.target_url ?? 'Brand'}`,
    competitor_analysis: `Competitor Analysis: ${params.topic ?? request.target_url ?? 'Market'}`,
    monthly_report: `Monthly SEO Report: ${request.target_url ?? 'Website'}`,
    content_decay_audit: `Content Decay Audit: ${request.target_url ?? 'Website'}`,
    // Execution types
    content_article: `SEO Article: ${params.topic ?? params.target_keyword ?? 'Topic'}`,
    content_rewrite: `Content Rewrite: ${params.target_keyword ?? request.target_url ?? 'Page'}`,
    schema_generation: `Schema Markup: ${request.target_url ?? 'Website'}`,
    redirect_map: `Redirect Map: ${request.target_url ?? 'Migration'}`,
    robots_sitemap: `Robots & Sitemap: ${request.target_url ?? 'Website'}`,
    outreach_emails: `Outreach Emails: ${request.target_url ?? 'Campaign'}`,
    guest_post_draft: `Guest Post: ${params.topic ?? request.target_url ?? 'Article'}`,
    directory_submissions: `Directory Submissions: ${request.target_url ?? 'Business'}`,
    review_responses: `Review Responses: ${request.target_url ?? 'Business'}`,
    review_campaign: `Review Campaign: ${request.target_url ?? 'Business'}`,
  }

  const title = titleMap[request.request_type] ?? `${agent.name} Report`

  // Generate summary from the parsed content
  const summary = generateSummary(request.request_type, parsedContent)

  // Extract score if available
  const score = extractScore(request.request_type, parsedContent)

  // Create the deliverable
  const { error: deliverableError } = await supabase
    .from('deliverables')
    .insert({
      request_id: request.id,
      client_id: request.client_id,
      agent_name: agentId,
      deliverable_type: getDeliverableType(request.request_type),
      title,
      content: parsedContent,
      summary,
      score,
      status: 'draft',
    })

  if (deliverableError) {
    throw new Error(`Failed to create deliverable: ${deliverableError.message}`)
  }

  // Mark request as completed
  const { error: completeError } = await supabase
    .from('service_requests')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', request.id)

  if (completeError) {
    log('error', `Request processed but failed to mark complete: ${request.id}`, completeError.message)
  }

  log('info', `Completed request ${request.id} — deliverable created`)
}

/**
 * Handle a failed request — retry or mark as failed.
 */
async function handleFailure(request: ServiceRequest, error: unknown): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error)
  log('error', `Request ${request.id} failed (attempt ${request.attempts}/${request.max_attempts})`, errorMessage)

  if (request.attempts < request.max_attempts) {
    // Re-queue for retry
    const { error: requeueError } = await supabase
      .from('service_requests')
      .update({
        status: 'queued',
        error_message: `Attempt ${request.attempts} failed: ${errorMessage}`,
      })
      .eq('id', request.id)

    if (requeueError) {
      log('error', `Failed to re-queue request ${request.id}`, requeueError.message)
    } else {
      log('info', `Re-queued request ${request.id} for retry`)
    }
  } else {
    // Max attempts reached — mark as failed
    const { error: failError } = await supabase
      .from('service_requests')
      .update({
        status: 'failed',
        error_message: `Failed after ${request.max_attempts} attempts. Last error: ${errorMessage}`,
        completed_at: new Date().toISOString(),
      })
      .eq('id', request.id)

    if (failError) {
      log('error', `Failed to mark request ${request.id} as failed`, failError.message)
    } else {
      log('warn', `Request ${request.id} permanently failed after ${request.max_attempts} attempts`)
    }
  }
}

// --------------- Helpers ---------------

function generateSummary(requestType: string, content: Record<string, unknown>): string {
  try {
    switch (requestType) {
      case 'site_audit': {
        const score = (content.overall_score as number) ?? (content.analytics_score as number)
        const recs = content.top_recommendations as Array<Record<string, string>> | undefined
        const quickWins = content.quick_wins as string[] | undefined
        const parts = [`Overall score: ${score ?? 'N/A'}/100.`]
        if (recs?.length) parts.push(`${recs.length} priority recommendations identified.`)
        if (quickWins?.length) parts.push(`${quickWins.length} quick wins available.`)
        return parts.join(' ')
      }
      case 'analytics_audit': {
        const score = content.analytics_score as number | undefined
        const traffic = content.traffic_analysis as Record<string, unknown> | undefined
        const contentPerf = content.content_performance as Record<string, unknown> | undefined
        const parts = [`Analytics score: ${score ?? 'N/A'}/100.`]
        if (traffic?.estimated_monthly_organic) parts.push(`Est. organic traffic: ${traffic.estimated_monthly_organic}.`)
        const topPages = contentPerf?.top_pages as unknown[] | undefined
        if (topPages?.length) parts.push(`${topPages.length} top pages analyzed.`)
        return parts.join(' ')
      }
      case 'content_brief': {
        const brief = content.brief as Record<string, unknown> | undefined
        if (brief) {
          return `Content brief for "${brief.target_keyword ?? 'topic'}". Recommended ${brief.recommended_word_count ?? '?'} words targeting ${brief.search_intent ?? 'unknown'} intent.`
        }
        return 'Content brief generated.'
      }
      case 'keyword_research': {
        const primary = content.primary_keywords as unknown[] | undefined
        const gaps = content.content_gaps as unknown[] | undefined
        return `${primary?.length ?? 0} primary keywords identified. ${gaps?.length ?? 0} content gaps found.`
      }
      case 'technical_audit': {
        const score = content.technical_score as number | undefined
        const fixes = content.priority_fixes as unknown[] | undefined
        return `Technical score: ${score ?? 'N/A'}/100. ${fixes?.length ?? 0} priority fixes identified.`
      }
      case 'link_analysis': {
        const score = content.link_profile_score as number | undefined
        const profile = content.current_profile as Record<string, unknown> | undefined
        return `Link profile score: ${score ?? 'N/A'}/100. Estimated ${profile?.estimated_referring_domains ?? '?'} referring domains.`
      }
      case 'on_page_audit': {
        const score = content.on_page_score as number | undefined
        const issues = content.issues as unknown[] | undefined
        return `On-page score: ${score ?? 'N/A'}/100. ${issues?.length ?? 0} issues found.`
      }
      case 'meta_optimization': {
        const score = content.optimization_score as number | undefined
        const pages = content.pages_analyzed as unknown[] | undefined
        return `Optimization score: ${score ?? 'N/A'}/100. ${pages?.length ?? 0} pages analyzed.`
      }
      case 'content_calendar': {
        const score = content.calendar_score as number | undefined
        const items = content.calendar_items as unknown[] | undefined
        return `Calendar score: ${score ?? 'N/A'}/100. ${items?.length ?? 0} content pieces planned.`
      }
      case 'topic_cluster_map': {
        const score = content.cluster_score as number | undefined
        const clusters = content.clusters as unknown[] | undefined
        return `Cluster score: ${score ?? 'N/A'}/100. ${clusters?.length ?? 0} topic clusters mapped.`
      }
      case 'local_seo_audit': {
        const score = content.local_seo_score as number | undefined
        const issues = content.issues as unknown[] | undefined
        return `Local SEO score: ${score ?? 'N/A'}/100. ${issues?.length ?? 0} local issues identified.`
      }
      case 'gbp_optimization': {
        const score = content.gbp_score as number | undefined
        const recs = content.recommendations as unknown[] | undefined
        return `GBP score: ${score ?? 'N/A'}/100. ${recs?.length ?? 0} optimization recommendations.`
      }
      case 'geo_audit': {
        const score = content.geo_score as number | undefined
        const visibility = content.ai_visibility as Record<string, unknown> | undefined
        const parts = [`GEO score: ${score ?? 'N/A'}/100.`]
        if (visibility?.platforms_present) parts.push(`Visible on ${visibility.platforms_present} AI platforms.`)
        return parts.join(' ')
      }
      case 'entity_optimization': {
        const score = content.entity_score as number | undefined
        const entities = content.entities as unknown[] | undefined
        return `Entity score: ${score ?? 'N/A'}/100. ${entities?.length ?? 0} entities analyzed.`
      }
      case 'competitor_analysis': {
        const score = content.competitive_score as number | undefined
        const competitors = content.competitors as unknown[] | undefined
        return `Competitive score: ${score ?? 'N/A'}/100. ${competitors?.length ?? 0} competitors analyzed.`
      }
      case 'monthly_report': {
        const summary = content.executive_summary as string | undefined
        if (summary) return summary.slice(0, 200)
        const kpi = content.kpi_dashboard as Record<string, unknown> | undefined
        if (kpi?.organic_traffic) return `Monthly report: ${kpi.organic_traffic} organic sessions.`
        return 'Monthly SEO report generated.'
      }
      case 'content_decay_audit': {
        const score = content.decay_score as number | undefined
        const decaying = content.decaying_pages as unknown[] | undefined
        return `Decay score: ${score ?? 'N/A'}/100. ${decaying?.length ?? 0} pages showing content decay.`
      }
      case 'content_article': {
        const score = content.article_score as number | undefined
        const meta = content.meta as Record<string, unknown> | undefined
        const article = content.article as Record<string, unknown> | undefined
        const sections = article?.sections as unknown[] | undefined
        const parts = [`Article score: ${score ?? 'N/A'}/100.`]
        if (meta?.target_keyword) parts.push(`Target keyword: "${meta.target_keyword}".`)
        if (meta?.estimated_word_count) parts.push(`~${meta.estimated_word_count} words.`)
        if (sections?.length) parts.push(`${sections.length} sections.`)
        return parts.join(' ')
      }
      case 'content_rewrite': {
        const score = content.rewrite_score as number | undefined
        const meta = content.meta as Record<string, unknown> | undefined
        const diag = content.diagnosis as Record<string, unknown> | undefined
        const issues = diag?.identified_issues as unknown[] | undefined
        const parts = [`Rewrite score: ${score ?? 'N/A'}/100.`]
        if (meta?.target_keyword) parts.push(`Refocused on "${meta.target_keyword}".`)
        if (issues?.length) parts.push(`${issues.length} decay issues addressed.`)
        return parts.join(' ')
      }
      case 'schema_generation': {
        const score = content.schema_score as number | undefined
        const schemas = content.schemas as unknown[] | undefined
        return `Schema score: ${score ?? 'N/A'}/100. ${schemas?.length ?? 0} schema type(s) generated.`
      }
      case 'redirect_map': {
        const score = content.redirect_score as number | undefined
        const summary = content.summary as Record<string, unknown> | undefined
        const total = summary?.total_redirects as number | undefined
        return `Redirect map: ${total ?? 0} redirect rules. Score: ${score ?? 'N/A'}/100. Available in .htaccess, nginx, Vercel, and Next.js formats.`
      }
      case 'robots_sitemap': {
        const score = content.robots_sitemap_score as number | undefined
        const sitemap = content.sitemap_strategy as Record<string, unknown> | undefined
        const parts = [`Robots & sitemap score: ${score ?? 'N/A'}/100.`]
        if (sitemap?.recommended_structure) parts.push(`Structure: ${sitemap.recommended_structure}.`)
        return parts.join(' ')
      }
      case 'outreach_emails': {
        const score = content.outreach_score as number | undefined
        const templates = content.email_templates as unknown[] | undefined
        const strategy = content.outreach_strategy as Record<string, unknown> | undefined
        const parts = [`Outreach score: ${score ?? 'N/A'}/100.`]
        if (templates?.length) parts.push(`${templates.length} email templates generated.`)
        if (strategy?.type) parts.push(`Type: ${strategy.type}.`)
        return parts.join(' ')
      }
      case 'guest_post_draft': {
        const score = content.guest_post_score as number | undefined
        const fit = content.publication_fit_analysis as Record<string, unknown> | undefined
        const parts = [`Guest post score: ${score ?? 'N/A'}/100.`]
        if (fit?.publication_style) parts.push(`Matched to: ${String(fit.publication_style).slice(0, 80)}.`)
        return parts.join(' ')
      }
      case 'directory_submissions': {
        const score = content.submission_score as number | undefined
        const profiles = content.directory_profiles as unknown[] | undefined
        return `Submission score: ${score ?? 'N/A'}/100. ${profiles?.length ?? 0} directory profile(s) generated.`
      }
      case 'review_responses': {
        const score = content.response_score as number | undefined
        const responses = content.responses as unknown[] | undefined
        const patterns = content.patterns_detected as unknown[] | undefined
        const parts = [`Response score: ${score ?? 'N/A'}/100.`]
        if (responses?.length) parts.push(`${responses.length} review response(s) drafted.`)
        if (patterns?.length) parts.push(`${patterns.length} recurring pattern(s) detected.`)
        return parts.join(' ')
      }
      case 'review_campaign': {
        const score = content.campaign_score as number | undefined
        const emails = content.email_templates as unknown[] | undefined
        const sms = content.sms_templates as unknown[] | undefined
        const parts = [`Campaign score: ${score ?? 'N/A'}/100.`]
        if (emails?.length) parts.push(`${emails.length} email template(s).`)
        if (sms?.length) parts.push(`${sms.length} SMS template(s).`)
        return parts.join(' ')
      }
      default:
        return 'Report generated.'
    }
  } catch {
    return 'Report generated.'
  }
}

function extractScore(requestType: string, content: Record<string, unknown>): number | null {
  try {
    // Primary keys per request type
    const scoreKeys: Record<string, string[]> = {
      site_audit: ['overall_score'],
      analytics_audit: ['analytics_score'],
      content_brief: ['seo_score', 'brief.seo_score', 'content_score'],
      keyword_research: ['keyword_quality_score', 'quality_score', 'overall_score'],
      technical_audit: ['technical_score'],
      link_analysis: ['link_profile_score'],
      on_page_audit: ['on_page_score'],
      meta_optimization: ['optimization_score'],
      content_calendar: ['calendar_score'],
      topic_cluster_map: ['cluster_score'],
      local_seo_audit: ['local_seo_score', 'local_score', 'overall_score'],
      gbp_optimization: ['gbp_score', 'local_seo_score', 'optimization_score'],
      geo_audit: ['geo_score'],
      entity_optimization: ['entity_score'],
      competitor_analysis: ['competitive_score'],
      monthly_report: ['overall_score', 'seo_health_score', 'performance_score'],
      content_decay_audit: ['decay_score'],
      // Execution types
      content_article: ['article_score'],
      content_rewrite: ['rewrite_score'],
      schema_generation: ['schema_score'],
      redirect_map: ['redirect_score'],
      robots_sitemap: ['robots_sitemap_score'],
      outreach_emails: ['outreach_score'],
      guest_post_draft: ['guest_post_score'],
      directory_submissions: ['submission_score'],
      review_responses: ['response_score'],
      review_campaign: ['campaign_score'],
    }
    const keys = scoreKeys[requestType] ?? []
    for (const key of keys) {
      // Support dot-notation traversal (e.g., 'brief.seo_score')
      const parts = key.split('.')
      let val: unknown = content
      for (const part of parts) {
        if (val && typeof val === 'object' && part in (val as Record<string, unknown>)) {
          val = (val as Record<string, unknown>)[part]
        } else {
          val = undefined
          break
        }
      }
      if (typeof val === 'number') return val
    }
    return null
  } catch {
    return null
  }
}

// --------------- Main Loop ---------------

let isShuttingDown = false

async function pollOnce(): Promise<void> {
  if (isShuttingDown) return

  try {
    const request = await claimNextRequest()
    if (!request) return

    try {
      await processRequest(request)
    } catch (error) {
      await handleFailure(request, error)
    }
  } catch (error) {
    log('error', 'Unexpected error in poll cycle', error instanceof Error ? error.message : String(error))
  }
}

async function startWorker(): Promise<void> {
  log('info', `Tenkai Queue Worker starting (poll interval: ${POLL_INTERVAL}ms)`)
  log('info', `Supabase URL: ${supabaseUrl}`)
  log('info', `Model routing: flash for research, pro for customer-facing (${Object.keys(MODEL_MAP).length} types configured)`)

  // Process any backlog immediately
  await pollOnce()

  // Set up polling interval
  const interval = setInterval(async () => {
    await pollOnce()
  }, POLL_INTERVAL)

  // Graceful shutdown
  const shutdown = () => {
    if (isShuttingDown) return
    isShuttingDown = true
    log('info', 'Shutting down gracefully...')
    clearInterval(interval)
    // Give in-flight requests a moment to complete
    setTimeout(() => {
      log('info', 'Worker stopped')
      process.exit(0)
    }, 5000)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

startWorker().catch((error) => {
  console.error('[FATAL] Worker failed to start:', error)
  process.exit(1)
})
