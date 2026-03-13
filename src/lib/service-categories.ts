// ============================================================
// Service Categories — business-owner-friendly grouping of all 27 services
// ============================================================

import {
  FileText,
  ShieldCheck,
  Link2,
  MapPin,
  BarChart3,
  Search,
  type LucideIcon,
} from 'lucide-react'

export interface ServiceItem {
  key: string
  label: string
  icon: string
  description: string
}

export interface ServiceCategory {
  label: string
  icon: LucideIcon
  color: string
  services: ServiceItem[]
}

// ─── All 27 Services ──────────────────────────────────────────

export const ALL_SERVICES: ServiceItem[] = [
  // Content
  { key: 'content_brief', label: 'Content Brief', icon: '✍️', description: 'Generate an optimized content brief' },
  { key: 'content_article', label: 'Write Article', icon: '📝', description: 'Full SEO-optimized article from brief' },
  { key: 'content_rewrite', label: 'Content Rewrite', icon: '🔄', description: 'Refresh and optimize existing content' },
  { key: 'content_calendar', label: 'Content Calendar', icon: '📅', description: 'Monthly publishing plan with topics' },
  { key: 'topic_cluster_map', label: 'Topic Cluster Map', icon: '🗺️', description: 'Pillar + cluster content strategy' },
  { key: 'content_decay_audit', label: 'Content Decay Audit', icon: '📉', description: 'Find declining content to refresh' },

  // Website Health & Technical
  { key: 'site_audit', label: 'SEO Audit', icon: '🔍', description: 'Full technical SEO audit of your website' },
  { key: 'technical_audit', label: 'Technical Audit', icon: '🔧', description: 'Deep technical health check' },
  { key: 'on_page_audit', label: 'On-Page Audit', icon: '📋', description: 'Page-level optimization analysis' },
  { key: 'meta_optimization', label: 'Meta Optimization', icon: '🏷️', description: 'Title tags and meta descriptions' },
  { key: 'schema_generation', label: 'Schema Markup', icon: '🧩', description: 'Structured data / JSON-LD generation' },
  { key: 'redirect_map', label: 'Redirect Map', icon: '↪️', description: 'URL redirect planning and mapping' },
  { key: 'robots_sitemap', label: 'Robots & Sitemap', icon: '🤖', description: 'Robots.txt and sitemap optimization' },

  // Link Building
  { key: 'link_analysis', label: 'Link Analysis', icon: '🔗', description: 'Analyze your backlink profile' },
  { key: 'outreach_emails', label: 'Outreach Emails', icon: '📧', description: 'Link building email templates' },
  { key: 'guest_post_draft', label: 'Guest Post Draft', icon: '✉️', description: 'Draft articles for guest posting' },
  { key: 'directory_submissions', label: 'Directory Submissions', icon: '📒', description: 'Business directory profiles' },

  // Local & Reviews
  { key: 'local_seo_audit', label: 'Local SEO Audit', icon: '📍', description: 'Local search visibility analysis' },
  { key: 'gbp_optimization', label: 'Google Business Profile', icon: '🏢', description: 'Optimize your GBP listing' },
  { key: 'review_responses', label: 'Review Responses', icon: '💬', description: 'Professional review reply drafts' },
  { key: 'review_campaign', label: 'Review Campaign', icon: '⭐', description: 'Generate more customer reviews' },

  // Research & Strategy
  { key: 'keyword_research', label: 'Keyword Research', icon: '🎯', description: 'Discover high-value keyword opportunities' },
  { key: 'competitor_analysis', label: 'Competitor Analysis', icon: '🕵️', description: 'Deep dive into competitor strategies' },
  { key: 'geo_audit', label: 'GEO / AI Search Audit', icon: '🌐', description: 'Visibility in AI search engines' },
  { key: 'entity_optimization', label: 'Entity Optimization', icon: '🧠', description: 'Knowledge graph and entity signals' },

  // Analytics & Reports
  { key: 'analytics_audit', label: 'Analytics Audit', icon: '📊', description: 'Review your analytics setup' },
  { key: 'monthly_report', label: 'Monthly Report', icon: '📈', description: 'Performance summary and insights' },
] as const

// ─── Categories ───────────────────────────────────────────────

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    label: 'Content',
    icon: FileText,
    color: 'text-torii',
    services: ALL_SERVICES.filter((s) =>
      ['content_brief', 'content_article', 'content_rewrite', 'content_calendar', 'topic_cluster_map', 'content_decay_audit'].includes(s.key)
    ),
  },
  {
    label: 'Website Health',
    icon: ShieldCheck,
    color: 'text-[#4A7C59]',
    services: ALL_SERVICES.filter((s) =>
      ['site_audit', 'technical_audit', 'on_page_audit', 'meta_optimization', 'schema_generation', 'redirect_map', 'robots_sitemap'].includes(s.key)
    ),
  },
  {
    label: 'Link Building',
    icon: Link2,
    color: 'text-[#6366F1]',
    services: ALL_SERVICES.filter((s) =>
      ['link_analysis', 'outreach_emails', 'guest_post_draft', 'directory_submissions'].includes(s.key)
    ),
  },
  {
    label: 'Local & Reviews',
    icon: MapPin,
    color: 'text-[#C49A3C]',
    services: ALL_SERVICES.filter((s) =>
      ['local_seo_audit', 'gbp_optimization', 'review_responses', 'review_campaign'].includes(s.key)
    ),
  },
  {
    label: 'Research & Strategy',
    icon: Search,
    color: 'text-[#8B5CF6]',
    services: ALL_SERVICES.filter((s) =>
      ['keyword_research', 'competitor_analysis', 'geo_audit', 'entity_optimization'].includes(s.key)
    ),
  },
  {
    label: 'Analytics & Reports',
    icon: BarChart3,
    color: 'text-[#0891B2]',
    services: ALL_SERVICES.filter((s) =>
      ['analytics_audit', 'monthly_report'].includes(s.key)
    ),
  },
]

// ─── Quick Actions (top 6 most-used) ─────────────────────────

export const QUICK_ACTIONS: string[] = [
  'site_audit',
  'keyword_research',
  'content_brief',
  'technical_audit',
  'link_analysis',
  'analytics_audit',
]

// ─── Helpers ──────────────────────────────────────────────────

/** Find a service item by key across all categories */
export function getServiceByKey(key: string): ServiceItem | undefined {
  return ALL_SERVICES.find((s) => s.key === key)
}

/** Get the category a service belongs to */
export function getCategoryForService(key: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((cat) => cat.services.some((s) => s.key === key))
}
