// ============================================================
// Service Chain — Cross-service data flow and auto-chaining
// Closes Gap #4: services operating in isolation
// ============================================================

import { supabaseAdmin } from '@/lib/supabase-admin'

// ─── Chain Map ────────────────────────────────────────────────

/**
 * Maps a completed service type to the services it can auto-trigger.
 * Order matters: first item gets highest priority.
 */
export const CHAIN_MAP: Record<string, string[]> = {
  keyword_research: ['content_calendar', 'content_brief'],
  site_audit: ['redirect_map', 'schema_generation', 'meta_optimization'],
  link_analysis: ['outreach_emails'],
  competitor_analysis: ['content_brief', 'keyword_research'],
  content_decay_audit: ['content_rewrite'],
  local_seo_audit: ['gbp_optimization'],
  content_article: ['outreach_emails'],
  technical_audit: ['meta_optimization', 'schema_generation'],
}

// ─── Helpers ──────────────────────────────────────────────────

function toArr(val: unknown): unknown[] {
  return Array.isArray(val) ? val : []
}

function toStr(val: unknown, fallback = ''): string {
  return val != null ? String(val) : fallback
}

// ─── Public API ───────────────────────────────────────────────

/** Returns the services that should be queued after a service completes. */
export function getNextServices(completedType: string): string[] {
  return CHAIN_MAP[completedType] ?? []
}

/**
 * Returns true if a client tier is eligible for auto-chaining.
 * Only growth/pro/admin/demo clients get auto-chaining.
 */
export function shouldAutoChain(clientTier: string | null, serviceType: string): boolean {
  const chainableTiers = new Set(['growth', 'pro', 'admin', 'demo'])
  return (
    clientTier != null &&
    chainableTiers.has(clientTier) &&
    getNextServices(serviceType).length > 0
  )
}

/**
 * Extracts the relevant findings from a completed deliverable to seed the next service.
 * These become the `parameters` on the chained service_request.
 */
export function extractChainData(
  serviceType: string,
  content: Record<string, unknown>,
  targetUrl: string | null
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    chain_source: serviceType,
    target_url: targetUrl,
  }

  switch (serviceType) {
    case 'keyword_research': {
      const kw = toArr(content.primary_keywords ?? content.keywords ?? content.top_keywords ?? content.seed_keywords)
      const richKw = kw.slice(0, 10).map((k) => {
        if (typeof k === 'string') return { keyword: k }
        const obj = k as Record<string, unknown>
        return {
          keyword: toStr(obj.keyword ?? obj.term ?? k),
          search_volume: obj.search_volume ?? obj.volume ?? null,
          difficulty: obj.difficulty ?? obj.difficulty_score ?? null,
          intent: obj.intent ?? null,
          content_format: obj.content_format ?? null,
        }
      }).filter(k => k.keyword)
      return {
        ...base,
        seed_keywords: richKw.map(k => k.keyword).join(', '),
        from_keyword_research: richKw,
        content_gaps: toArr(content.content_gaps).slice(0, 10),
        long_tail_opportunities: toArr(content.long_tail_opportunities).slice(0, 10),
      }
    }

    case 'site_audit': {
      const issues = toArr(content.issues ?? content.critical_issues ?? content.findings)
      const score = content.score ?? content.overall_score ?? content.health_score
      const brokenUrls = toArr(content.broken_urls ?? content.broken_links ?? content.redirects_needed)
      return {
        ...base,
        site_health_score: score,
        from_site_audit: issues.slice(0, 10),
        broken_urls: brokenUrls.slice(0, 20),
      }
    }

    case 'link_analysis': {
      const count = content.backlinks ?? content.total_backlinks ?? content.backlink_count
      const gaps = toArr(content.anchor_gaps ?? content.link_opportunities ?? content.opportunities)
      const competitors = toArr(content.competitor_links ?? content.competitors)
      return {
        ...base,
        backlink_count: count,
        link_opportunities: gaps.slice(0, 10),
        competitor_links: competitors.slice(0, 5),
      }
    }

    case 'competitor_analysis': {
      const comps = toArr(content.competitors ?? content.competitor_domains)
      const kwGaps = toArr(content.keyword_gaps ?? content.missing_keywords ?? content.opportunities)
      const contentGaps = toArr(content.content_gaps ?? content.topics)
      return {
        ...base,
        competitor_domains: comps.slice(0, 5).map((c) =>
          typeof c === 'string' ? c : toStr((c as Record<string, unknown>)?.domain ?? (c as Record<string, unknown>)?.url ?? c)
        ),
        keyword_gaps: kwGaps.slice(0, 15),
        from_competitor_analysis: contentGaps.slice(0, 10),
      }
    }

    case 'content_decay_audit': {
      const pages = toArr(content.decaying_pages ?? content.priority_pages ?? content.pages)
      const topPage = pages[0]
      const topUrl =
        topPage == null
          ? targetUrl
          : typeof topPage === 'string'
          ? topPage
          : toStr((topPage as Record<string, unknown>)?.url ?? (topPage as Record<string, unknown>)?.path ?? targetUrl)
      return {
        ...base,
        target_url: topUrl ?? targetUrl,
        decaying_pages: pages.slice(0, 5),
        from_decay_audit: true,
      }
    }

    case 'local_seo_audit': {
      const localIssues = toArr(content.local_issues ?? content.issues ?? content.findings)
      const gbpGaps = toArr(content.gbp_gaps ?? content.gbp_issues ?? content.missing_gbp_fields)
      return {
        ...base,
        local_issues: localIssues.slice(0, 10),
        gbp_gaps: gbpGaps.slice(0, 10),
      }
    }

    default:
      return base
  }
}

// ─── Client SEO Context Write-Back ────────────────────────────

/**
 * After a service completes, extract key findings and persist them to
 * client_seo_context so future services for this client get richer context.
 * Fire-and-forget safe — logs errors, never throws.
 */
export async function writeBackClientContext(
  clientId: string,
  serviceType: string,
  content: Record<string, unknown>
): Promise<void> {
  try {
    const update: Record<string, unknown> = { client_id: clientId }

    if (serviceType === 'keyword_research') {
      const raw = toArr(content.keywords ?? content.top_keywords ?? content.seed_keywords)
      const topKeywords = raw.slice(0, 20).map((k) => {
        if (typeof k === 'string') return { keyword: k }
        const obj = k as Record<string, unknown>
        return {
          keyword: toStr(obj.keyword ?? obj.term ?? obj.phrase, ''),
          position: obj.position != null ? toStr(obj.position) : undefined,
          trend: obj.trend != null ? toStr(obj.trend) : undefined,
        }
      }).filter((k) => k.keyword)
      if (topKeywords.length > 0) update.top_keywords = topKeywords
    }

    if (['site_audit', 'technical_audit', 'on_page_audit', 'local_seo_audit'].includes(serviceType)) {
      const raw = toArr(
        content.issues ?? content.findings ?? content.critical_issues ??
        content.recommendations ?? content.audit_findings
      )
      const auditFindings = raw.slice(0, 20).map((f) => {
        if (typeof f === 'string') return { finding: f, severity: 'medium' }
        const obj = f as Record<string, unknown>
        return {
          finding: toStr(obj.finding ?? obj.issue ?? obj.description ?? obj.title, ''),
          severity: toStr(obj.severity ?? obj.priority, 'medium').toLowerCase(),
        }
      }).filter((f) => f.finding)
      if (auditFindings.length > 0) update.audit_findings = auditFindings

      const score = content.score ?? content.overall_score ?? content.health_score
      if (typeof score === 'number') update.last_audit_score = score

      const cwv = content.cwv ?? content.core_web_vitals ?? content.cwv_status
      if (cwv && typeof cwv === 'object') {
        const c = cwv as Record<string, unknown>
        update.cwv_status = {
          overall: c.overall ?? c.status,
          lcp: c.lcp,
          inp: c.inp ?? c.fid,
          cls: c.cls,
        }
      }
    }

    if (serviceType === 'competitor_analysis') {
      const raw = toArr(content.competitors ?? content.competitor_domains)
      const competitors = raw.slice(0, 10).map((c) => {
        if (typeof c === 'string') return { domain: c }
        const obj = c as Record<string, unknown>
        return { domain: toStr(obj.domain ?? obj.url ?? obj.website, '') }
      }).filter((c) => c.domain)
      if (competitors.length > 0) update.competitors = competitors
    }

    if (serviceType === 'content_calendar') {
      const raw = toArr(content.topics ?? content.calendar ?? content.content_plan ?? content.items)
      const contentGaps = raw.slice(0, 20).map((t) => {
        if (typeof t === 'string') return { topic: t, priority: 'medium' }
        const obj = t as Record<string, unknown>
        return {
          topic: toStr(obj.topic ?? obj.title ?? obj.keyword, ''),
          priority: toStr(obj.priority ?? obj.importance, 'medium').toLowerCase(),
        }
      }).filter((t) => t.topic)
      if (contentGaps.length > 0) update.content_gaps = contentGaps
    }

    // Nothing to update for this service type
    if (Object.keys(update).length <= 1) return

    await supabaseAdmin
      .from('client_seo_context')
      .upsert(update, { onConflict: 'client_id' })
  } catch (err) {
    console.warn(`[service-chain] writeBackClientContext failed for ${clientId}:`, err)
  }
}
