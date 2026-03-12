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
//   Research tasks  (keyword_research, link_analysis):           gemini-2.5-flash
//   Customer-facing (site_audit, analytics_audit, content_brief, technical_audit): gemini-2.5-pro
//
// The worker uses the Supabase service_role key to bypass RLS.
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import { getAgentForRequest, getDeliverableType, TENKAI_AGENTS } from '../lib/agents/index'
import { AGENT_PROMPTS, buildTaskMessage } from '../lib/agents/prompts'
import type { AgentId } from '../lib/agents/index'

// --------------- Config ---------------

const POLL_INTERVAL = parseInt(process.env.QUEUE_POLL_INTERVAL_MS ?? '10000', 10)
const LOG_LEVEL = (process.env.QUEUE_WORKER_LOG_LEVEL ?? 'info') as 'debug' | 'info' | 'warn' | 'error'
const REQUEST_TIMEOUT_MS = 120_000 // 2 min timeout for AI calls

// Model routing
const RESEARCH_TASKS = new Set(['keyword_research', 'link_analysis'])
const MODEL_RESEARCH = 'gemini-2.5-flash'
const MODEL_CUSTOMER_FACING = 'gemini-2.5-pro'

function getModelForRequestType(requestType: string): string {
  return RESEARCH_TASKS.has(requestType) ? MODEL_RESEARCH : MODEL_CUSTOMER_FACING
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

  const taskMessage = buildTaskMessage(
    request.request_type,
    request.target_url,
    request.parameters
  )

  // Call Gemini API with timeout
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let responseText: string
  try {
    const geminiModel = genAI.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
    })

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
  const titleMap: Record<string, string> = {
    site_audit: `SEO Site Audit: ${request.target_url ?? 'Website'}`,
    analytics_audit: `Analytics Audit: ${request.target_url ?? 'Website'}`,
    content_brief: `Content Brief: ${(request.parameters as Record<string, string>).keyword ?? request.target_url ?? 'Topic'}`,
    keyword_research: `Keyword Research: ${request.target_url ?? 'Website'}`,
    technical_audit: `Technical SEO Audit: ${request.target_url ?? 'Website'}`,
    link_analysis: `Link Profile Analysis: ${request.target_url ?? 'Website'}`,
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
        const opportunities = content.keyword_performance as Record<string, unknown> | undefined
        const parts = [`Analytics score: ${score ?? 'N/A'}/100.`]
        const opps = opportunities?.keyword_opportunities as unknown[] | undefined
        if (opps?.length) parts.push(`${opps.length} keyword opportunities identified.`)
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
  log('info', `Model routing: research=${MODEL_RESEARCH}, customer-facing=${MODEL_CUSTOMER_FACING}`)

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
