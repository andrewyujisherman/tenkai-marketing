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
  businessContext: { industry?: string; target_audience?: string; geography?: string; goals?: string }
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

    if (ctx.business_context?.industry) {
      parts.push(`Industry: ${ctx.business_context.industry}`)
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
    const isUrlBased = request.target_url && URL_BASED_REQUESTS.has(request.request_type)

    // Request types that get a full site crawl
    const CRAWL_REQUESTS = new Set(['site_audit', 'technical_audit', 'link_analysis'])

    // Keyword-based requests that benefit from real SERP data
    const KEYWORD_ENRICHED_REQUESTS = new Set([
      'keyword_research', 'content_brief', 'content_article', 'content_calendar',
      'topic_cluster_map', 'content_rewrite', 'content_decay_audit',
    ])

    // Request types that benefit from NAP directory consistency data
    const NAP_CHECK_REQUESTS = new Set(['local_seo_audit'])

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
        keywordSerpData = await fetchKeywordSerpData(
          [...new Set(seedKeywords)].slice(0, 5),
          { gl: params.country_code ?? params.gl }
        ).catch(() => null)
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

    // Fetch accumulated client SEO context
    const clientContext = await fetchClientSeoContext(request.client_id)

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

    // Parse JSON from response
    let parsedContent: Record<string, unknown>
    try {
      let jsonStr = responseText.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
      }
      parsedContent = JSON.parse(jsonStr)
    } catch {
      parsedContent = { raw_response: responseText }
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
        const chainedRows = chainable.map((svcType) => ({
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
            else console.log(`[process] Auto-chained ${chainable.join(', ')} from ${request.request_type}`)
          })
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
