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
    handles: ['site_audit', 'keyword_research'],
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
    handles: ['site_audit'],
  },
  takeshi: {
    name: 'Takeshi',
    kanji: '\u6B66',
    role: 'Link Builder',
    handles: ['link_analysis'],
  },
  aiko: {
    name: 'Aiko',
    kanji: '\u611B\u5B50',
    role: 'Social Media',
    handles: ['social_strategy'],
  },
} as const

export type AgentId = keyof typeof TENKAI_AGENTS

export const REQUEST_TYPES = [
  'site_audit',
  'content_brief',
  'keyword_research',
  'technical_audit',
  'link_analysis',
  'social_strategy',
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
    content_brief: 'content_draft',
    keyword_research: 'keyword_list',
    technical_audit: 'technical_report',
    link_analysis: 'link_report',
    social_strategy: 'social_plan',
  }
  return map[requestType] ?? 'audit_report'
}
