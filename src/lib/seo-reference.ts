// ============================================================
// SEO Reference Loader
// Maps service request types to professional reference files
// and injects them into agent prompts for higher-quality output.
// ============================================================

import fs from 'fs'
import path from 'path'

/** Maps each service request type to its reference file paths (relative to project root) */
const REFERENCE_MAP: Record<string, string[]> = {
  site_audit: [
    'seo-reference/agency-model.md',
    'seo-reference/technical-seo/site-audit.md',
    'seo-reference/cross-service/data-flow.md',
  ],
  technical_audit: [
    'seo-reference/agency-model.md',
    'seo-reference/technical-seo/technical-audit.md',
  ],
  on_page_audit: [
    'seo-reference/agency-model.md',
    'seo-reference/technical-seo/on-page-audit.md',
    'seo-reference/link-building/internal-linking.md',
  ],
  schema_generation: [
    'seo-reference/agency-model.md',
    'seo-reference/technical-seo/schema-markup.md',
  ],
  redirect_map: [
    'seo-reference/agency-model.md',
    'seo-reference/technical-seo/redirect-management.md',
  ],
  robots_sitemap: [
    'seo-reference/agency-model.md',
    'seo-reference/technical-seo/redirect-management.md',
  ],
  keyword_research: [
    'seo-reference/agency-model.md',
    'seo-reference/content/keyword-research.md',
    'seo-reference/cross-service/data-flow.md',
  ],
  content_brief: [
    'seo-reference/agency-model.md',
    'seo-reference/content/content-brief.md',
    'seo-reference/content/keyword-research.md',
  ],
  content_article: [
    'seo-reference/agency-model.md',
    'seo-reference/content/content-article.md',
  ],
  content_rewrite: [
    'seo-reference/agency-model.md',
    'seo-reference/content/content-article.md',
    'seo-reference/content/content-decay.md',
  ],
  content_calendar: [
    'seo-reference/agency-model.md',
    'seo-reference/content/content-calendar.md',
    'seo-reference/cross-service/data-flow.md',
  ],
  topic_cluster_map: [
    'seo-reference/agency-model.md',
    'seo-reference/content/topic-clusters.md',
  ],
  content_decay_audit: [
    'seo-reference/agency-model.md',
    'seo-reference/content/content-decay.md',
  ],
  link_analysis: [
    'seo-reference/agency-model.md',
    'seo-reference/link-building/link-analysis.md',
    'seo-reference/link-building/anchor-text.md',
  ],
  outreach_emails: [
    'seo-reference/agency-model.md',
    'seo-reference/link-building/outreach.md',
  ],
  guest_post_draft: [
    'seo-reference/agency-model.md',
    'seo-reference/link-building/outreach.md',
    'seo-reference/content/content-article.md',
  ],
  directory_submissions: [
    'seo-reference/agency-model.md',
    'seo-reference/local-seo/citations-nap.md',
  ],
  local_seo_audit: [
    'seo-reference/agency-model.md',
    'seo-reference/local-seo/local-audit.md',
  ],
  gbp_optimization: [
    'seo-reference/agency-model.md',
    'seo-reference/local-seo/gbp-optimization.md',
  ],
  review_responses: [
    'seo-reference/agency-model.md',
    'seo-reference/local-seo/review-management.md',
  ],
  review_campaign: [
    'seo-reference/agency-model.md',
    'seo-reference/local-seo/review-management.md',
  ],
  geo_audit: [
    'seo-reference/agency-model.md',
    'seo-reference/ai-search/geo-audit.md',
  ],
  entity_optimization: [
    'seo-reference/agency-model.md',
    'seo-reference/ai-search/entity-optimization.md',
  ],
  analytics_audit: [
    'seo-reference/agency-model.md',
    'seo-reference/analytics/analytics-audit.md',
  ],
  monthly_report: [
    'seo-reference/agency-model.md',
    'seo-reference/analytics/monthly-report.md',
    'seo-reference/cross-service/data-flow.md',
  ],
  meta_optimization: [
    'seo-reference/agency-model.md',
    'seo-reference/technical-seo/on-page-audit.md',
  ],
}

/**
 * Strip "Output Examples" sections from reference content.
 * Matches headings like "## Output Examples", "## Output Example",
 * "### Output Examples" etc. and removes everything until the next
 * heading of equal or higher level (or end of file).
 */
function stripOutputExamples(content: string): string {
  return content.replace(
    /^#{1,3}\s+Output\s+Example[s]?.*?(?=^#{1,3}\s+[^O]|^#{1,2}\s+|\Z)/gms,
    ''
  ).trim()
}

/**
 * Load and concatenate reference files for a given request type.
 * Returns empty string if no mapping exists or files are missing.
 */
export function getReferenceContext(requestType: string): string {
  const files = REFERENCE_MAP[requestType]
  if (!files || files.length === 0) return ''

  const sections: string[] = []

  for (const relPath of files) {
    try {
      const fullPath = path.join(process.cwd(), relPath)
      const raw = fs.readFileSync(fullPath, 'utf-8')
      const cleaned = stripOutputExamples(raw)
      if (cleaned) sections.push(cleaned)
    } catch {
      // File not found — skip gracefully
    }
  }

  return sections.join('\n\n---\n\n')
}
