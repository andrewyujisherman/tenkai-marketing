/**
 * Tier-based request gating.
 * Controls which request types each subscription tier can access.
 */

const STARTER_TYPES = new Set([
  'site_audit',
  'technical_audit',
  'on_page_audit',
  'keyword_research',
  'local_seo_audit',
  'meta_optimization',
])

const GROWTH_TYPES = new Set([
  ...STARTER_TYPES,
  'content_brief',
  'content_article',
  'content_rewrite',
  'content_calendar',
  'competitor_analysis',
  'link_analysis',
  'analytics_audit',
  'gbp_optimization',
  'schema_generation',
])

const PRO_TYPES = new Set([
  ...GROWTH_TYPES,
  'monthly_report',
  'content_decay_audit',
  'topic_cluster_map',
  'geo_audit',
  'entity_optimization',
  'redirect_map',
  'robots_sitemap',
  'outreach_emails',
  'guest_post_draft',
  'directory_submissions',
  'review_responses',
  'review_campaign',
])

const TIER_MAP: Record<string, Set<string>> = {
  starter: STARTER_TYPES,
  growth: GROWTH_TYPES,
  pro: PRO_TYPES,
}

export function tierAllowsRequestType(tier: string | null | undefined, requestType: string): boolean {
  // Admin/demo bypass
  if (tier === 'admin' || tier === 'demo') return true
  const allowed = TIER_MAP[tier ?? 'starter'] ?? STARTER_TYPES
  return allowed.has(requestType)
}

export function getRequiredTierForRequest(requestType: string): string {
  if (STARTER_TYPES.has(requestType)) return 'starter'
  if (GROWTH_TYPES.has(requestType)) return 'growth'
  return 'pro'
}
