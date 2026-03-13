// ============================================================
// Tenkai Agent Registry
// Maps request types to AI agents and their metadata
// ============================================================

export interface AgentDefinition {
  name: string
  kanji: string
  role: string
  handles: readonly string[]
}

export const TENKAI_AGENTS = {
  haruki: {
    name: 'Haruki',
    kanji: '\u6625\u6A39',
    role: 'SEO Strategist',
    handles: ['site_audit', 'keyword_research', 'competitor_analysis'],
  },
  sakura: {
    name: 'Sakura',
    kanji: '\u685C',
    role: 'Content Specialist',
    handles: ['content_brief'],
  },
  kenji: {
    name: 'Kenji',
    kanji: '\u5065\u4E8C',
    role: 'Technical SEO',
    handles: ['technical_audit'],
  },
  yumi: {
    name: 'Yumi',
    kanji: '\u7531\u7F8E',
    role: 'Analytics',
    handles: ['analytics_audit', 'monthly_report', 'content_decay_audit'],
  },
  takeshi: {
    name: 'Takeshi',
    kanji: '\u6B66',
    role: 'Link Builder',
    handles: ['link_analysis'],
  },
  mika: {
    name: 'Mika',
    kanji: '\u7F8E\u82B1',
    role: 'On-Page Optimizer',
    handles: ['on_page_audit', 'meta_optimization'],
  },
  ryo: {
    name: 'Ryo',
    kanji: '\u6DBC',
    role: 'Content Planner',
    handles: ['content_calendar', 'topic_cluster_map'],
  },
  hana: {
    name: 'Hana',
    kanji: '\u82B1',
    role: 'Local SEO Specialist',
    handles: ['local_seo_audit', 'gbp_optimization'],
  },
  daichi: {
    name: 'Daichi',
    kanji: '\u5927\u5730',
    role: 'GEO / AI Search Specialist',
    handles: ['geo_audit', 'entity_optimization'],
  },
} as const

export type AgentId = keyof typeof TENKAI_AGENTS

export const REQUEST_TYPES = [
  'site_audit',
  'analytics_audit',
  'content_brief',
  'keyword_research',
  'technical_audit',
  'link_analysis',
  'competitor_analysis',
  'monthly_report',
  'content_decay_audit',
  'on_page_audit',
  'meta_optimization',
  'content_calendar',
  'topic_cluster_map',
  'local_seo_audit',
  'gbp_optimization',
  'geo_audit',
  'entity_optimization',
] as const

export type RequestType = (typeof REQUEST_TYPES)[number]

/**
 * Returns the primary agent ID for a given request type.
 * Falls back to 'haruki' for unknown types.
 */
export function getAgentForRequest(requestType: string): AgentId {
  for (const [id, agent] of Object.entries(TENKAI_AGENTS)) {
    if ((agent.handles as readonly string[]).includes(requestType)) {
      return id as AgentId
    }
  }
  return 'haruki'
}

/**
 * Maps request_type to the deliverable_type the agent produces.
 */
export function getDeliverableType(requestType: string): string {
  const map: Record<string, string> = {
    site_audit: 'audit_report',
    analytics_audit: 'audit_report',
    content_brief: 'content_draft',
    keyword_research: 'keyword_list',
    technical_audit: 'technical_report',
    link_analysis: 'link_report',
    competitor_analysis: 'competitive_report',
    monthly_report: 'performance_report',
    content_decay_audit: 'decay_report',
    on_page_audit: 'on_page_report',
    meta_optimization: 'meta_report',
    content_calendar: 'content_plan',
    topic_cluster_map: 'cluster_map',
    local_seo_audit: 'local_report',
    gbp_optimization: 'gbp_report',
    geo_audit: 'geo_report',
    entity_optimization: 'entity_report',
  }
  return map[requestType] ?? 'audit_report'
}
