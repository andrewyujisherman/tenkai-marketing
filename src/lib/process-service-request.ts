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
import type { AgentId } from '@/lib/agents/index'

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
    const isUrlBased = request.target_url && URL_BASED_REQUESTS.has(request.request_type)

    if (isUrlBased) {
      const [scraped, enriched] = await Promise.all([
        scrapeUrl(request.target_url!),
        fetchAllSiteData(request.target_url!, {
          gscSiteUrl: request.parameters?.gsc_site_url as string | undefined,
          ga4PropertyId: request.parameters?.ga4_property_id as string | undefined,
          clientId: request.client_id,
        }).catch(() => null),
      ])
      scrapedSite = scraped
      siteData = enriched
    }

    const taskMessage = buildTaskMessage(
      request.request_type,
      request.target_url,
      request.parameters ?? {},
      scrapedSite,
      siteData
    )

    // Call Gemini API
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
