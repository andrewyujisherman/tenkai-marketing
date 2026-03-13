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
import { buildDeliverableTitle, extractScore, generateSummary } from '../lib/deliverables'
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

  const title = buildDeliverableTitle(request.request_type, request.parameters, request.target_url)

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
