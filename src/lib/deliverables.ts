type DeliverableContent = Record<string, unknown>
type DeliverableParams = Record<string, unknown>

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function asArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined
}

function getNestedValue(content: DeliverableContent, path: string): unknown {
  return path.split('.').reduce<unknown>((value, part) => {
    const record = asRecord(value)
    return record ? record[part] : undefined
  }, content)
}

function getFirstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) return trimmed
    }
  }

  return undefined
}

function getArrayCount(content: DeliverableContent, ...paths: string[]): number | undefined {
  for (const path of paths) {
    const value = getNestedValue(content, path)
    const array = asArray(value)
    if (array) return array.length
  }

  return undefined
}

export function buildDeliverableTitle(
  requestType: string,
  parameters: DeliverableParams = {},
  targetUrl: string | null
): string {
  const topic = getFirstString(parameters.topic, parameters.keyword, parameters.target_keyword)
  const url = getFirstString(targetUrl)

  const titleMap: Record<string, string> = {
    content_brief: `Content Brief: ${topic ?? url ?? 'Topic'}`,
    keyword_research: `Keyword Research: ${topic ?? url ?? 'Website'}`,
    site_audit: `SEO Site Audit: ${url ?? 'Website'}`,
    technical_audit: `Technical SEO Audit: ${url ?? 'Website'}`,
    analytics_audit: `Analytics Audit: ${url ?? 'Website'}`,
    link_analysis: `Link Analysis: ${url ?? 'Website'}`,
    on_page_audit: `On-Page SEO Audit: ${url ?? 'Page'}`,
    meta_optimization: `Meta Optimization: ${url ?? 'Website'}`,
    content_calendar: `Content Calendar: ${topic ?? url ?? 'Website'}`,
    topic_cluster_map: `Topic Cluster Map: ${topic ?? url ?? 'Website'}`,
    local_seo_audit: `Local SEO Audit: ${url ?? 'Business'}`,
    gbp_optimization: `GBP Optimization: ${url ?? 'Business'}`,
    geo_audit: `GEO / AI Search Audit: ${url ?? 'Website'}`,
    entity_optimization: `Entity Optimization: ${url ?? 'Brand'}`,
    competitor_analysis: `Competitor Analysis: ${topic ?? url ?? 'Market'}`,
    monthly_report: `Monthly SEO Report: ${url ?? 'Website'}`,
    content_decay_audit: `Content Decay Audit: ${url ?? 'Website'}`,
    content_article: `SEO Article: ${topic ?? 'Topic'}`,
    content_rewrite: `Content Rewrite: ${getFirstString(parameters.target_keyword, url) ?? 'Page'}`,
    schema_generation: `Schema Markup: ${url ?? 'Website'}`,
    redirect_map: `Redirect Map: ${url ?? 'Migration'}`,
    robots_sitemap: `Robots & Sitemap: ${url ?? 'Website'}`,
    outreach_emails: `Outreach Emails: ${url ?? 'Campaign'}`,
    guest_post_draft: `Guest Post: ${topic ?? url ?? 'Article'}`,
    directory_submissions: `Directory Submissions: ${url ?? 'Business'}`,
    review_responses: `Review Responses: ${url ?? 'Business'}`,
    review_campaign: `Review Campaign: ${url ?? 'Business'}`,
  }

  return titleMap[requestType] ?? 'Tenkai Report'
}

export function generateSummary(requestType: string, content: DeliverableContent): string {
  try {
    switch (requestType) {
      case 'site_audit': {
        const score = getNestedValue(content, 'overall_score')
        const recommendationCount = getArrayCount(content, 'top_recommendations')
        const quickWinCount = getArrayCount(content, 'quick_wins')
        const parts = [`Overall score: ${score ?? 'N/A'}/100.`]
        if (recommendationCount !== undefined) parts.push(`${recommendationCount} priority recommendations identified.`)
        if (quickWinCount !== undefined) parts.push(`${quickWinCount} quick wins available.`)
        return parts.join(' ')
      }
      case 'analytics_audit': {
        const score = getNestedValue(content, 'analytics_score')
        const organicTraffic = getNestedValue(content, 'traffic_analysis.estimated_monthly_organic')
          ?? getNestedValue(content, 'traffic_analysis.organic_sessions')
        const topPageCount = getArrayCount(content, 'content_performance.top_pages', 'content_performance.pages')
        const keywordOpportunityCount = getArrayCount(
          content,
          'keyword_performance.keyword_opportunities',
          'keyword_performance.top_opportunities',
          'keyword_performance.opportunities'
        )
        const actionPlanCount = getArrayCount(content, 'monthly_action_plan')
        const parts = [`Analytics score: ${score ?? 'N/A'}/100.`]
        if (organicTraffic !== undefined) parts.push(`Est. organic traffic: ${organicTraffic}.`)
        if (topPageCount !== undefined) parts.push(`${topPageCount} top pages analyzed.`)
        if (keywordOpportunityCount !== undefined) {
          parts.push(`${keywordOpportunityCount} keyword opportunities surfaced.`)
        }
        if (actionPlanCount !== undefined) parts.push(`${actionPlanCount} action items in the plan.`)
        return parts.join(' ')
      }
      case 'content_brief': {
        const brief = asRecord(getNestedValue(content, 'brief'))
        if (brief) {
          return `Content brief for "${brief.target_keyword ?? 'topic'}". Recommended ${brief.recommended_word_count ?? '?'} words targeting ${brief.search_intent ?? 'unknown'} intent.`
        }
        return 'Content brief generated.'
      }
      case 'keyword_research': {
        const primaryCount = getArrayCount(content, 'primary_keywords')
        const gapCount = getArrayCount(content, 'content_gaps')
        return `${primaryCount ?? 0} primary keywords identified. ${gapCount ?? 0} content gaps found.`
      }
      case 'technical_audit': {
        const score = getNestedValue(content, 'technical_score')
        const fixCount = getArrayCount(content, 'priority_fixes')
        return `Technical score: ${score ?? 'N/A'}/100. ${fixCount ?? 0} priority fixes identified.`
      }
      case 'link_analysis': {
        const score = getNestedValue(content, 'link_profile_score')
        const profile = asRecord(getNestedValue(content, 'current_profile'))
        return `Link profile score: ${score ?? 'N/A'}/100. Estimated ${profile?.estimated_referring_domains ?? '?'} referring domains.`
      }
      case 'on_page_audit': {
        const score = getNestedValue(content, 'on_page_score')
        const issueCount = getArrayCount(content, 'issues')
        return `On-page score: ${score ?? 'N/A'}/100. ${issueCount ?? 0} issues found.`
      }
      case 'meta_optimization': {
        const score = getNestedValue(content, 'optimization_score')
        const pageCount = getArrayCount(content, 'pages_analyzed')
        return `Optimization score: ${score ?? 'N/A'}/100. ${pageCount ?? 0} pages analyzed.`
      }
      case 'content_calendar': {
        const score = getNestedValue(content, 'calendar_score')
        const itemCount = getArrayCount(content, 'calendar_items')
        return `Calendar score: ${score ?? 'N/A'}/100. ${itemCount ?? 0} content pieces planned.`
      }
      case 'topic_cluster_map': {
        const score = getNestedValue(content, 'cluster_score')
        const clusterCount = getArrayCount(content, 'clusters')
        return `Cluster score: ${score ?? 'N/A'}/100. ${clusterCount ?? 0} topic clusters mapped.`
      }
      case 'local_seo_audit': {
        const score = getNestedValue(content, 'local_seo_score')
        const issueCount = getArrayCount(content, 'issues')
        return `Local SEO score: ${score ?? 'N/A'}/100. ${issueCount ?? 0} local issues identified.`
      }
      case 'gbp_optimization': {
        const score = getNestedValue(content, 'gbp_score')
        const recommendationCount = getArrayCount(content, 'recommendations')
        return `GBP score: ${score ?? 'N/A'}/100. ${recommendationCount ?? 0} optimization recommendations.`
      }
      case 'geo_audit': {
        const score = getNestedValue(content, 'geo_score')
        const platformCount = getNestedValue(content, 'ai_visibility.platforms_present')
        const parts = [`GEO score: ${score ?? 'N/A'}/100.`]
        if (platformCount !== undefined) parts.push(`Visible on ${platformCount} AI platforms.`)
        return parts.join(' ')
      }
      case 'entity_optimization': {
        const score = getNestedValue(content, 'entity_score')
        const entityCount = getArrayCount(content, 'entities')
        return `Entity score: ${score ?? 'N/A'}/100. ${entityCount ?? 0} entities analyzed.`
      }
      case 'competitor_analysis': {
        const score = getNestedValue(content, 'competitive_score')
        const competitorCount = getArrayCount(content, 'competitors')
        return `Competitive score: ${score ?? 'N/A'}/100. ${competitorCount ?? 0} competitors analyzed.`
      }
      case 'monthly_report': {
        const summary = getNestedValue(content, 'executive_summary')
        if (typeof summary === 'string' && summary.trim().length > 0) return summary.slice(0, 200)
        const organicTraffic = getNestedValue(content, 'kpi_dashboard.organic_traffic')
        if (organicTraffic !== undefined) return `Monthly report: ${organicTraffic} organic sessions.`
        return 'Monthly SEO report generated.'
      }
      case 'content_decay_audit': {
        const score = getNestedValue(content, 'decay_score')
        const decayingPageCount = getArrayCount(content, 'decaying_pages')
        return `Decay score: ${score ?? 'N/A'}/100. ${decayingPageCount ?? 0} pages showing content decay.`
      }
      case 'content_article': {
        const score = getNestedValue(content, 'article_score')
        const targetKeyword = getNestedValue(content, 'meta.target_keyword')
        const estimatedWordCount = getNestedValue(content, 'meta.estimated_word_count')
        const sectionCount = getArrayCount(content, 'article.sections')
        const parts = [`Article score: ${score ?? 'N/A'}/100.`]
        if (targetKeyword !== undefined) parts.push(`Target keyword: "${targetKeyword}".`)
        if (estimatedWordCount !== undefined) parts.push(`~${estimatedWordCount} words.`)
        if (sectionCount !== undefined) parts.push(`${sectionCount} sections.`)
        return parts.join(' ')
      }
      case 'content_rewrite': {
        const score = getNestedValue(content, 'rewrite_score')
        const targetKeyword = getNestedValue(content, 'meta.target_keyword')
        const issueCount = getArrayCount(content, 'diagnosis.identified_issues')
        const parts = [`Rewrite score: ${score ?? 'N/A'}/100.`]
        if (targetKeyword !== undefined) parts.push(`Refocused on "${targetKeyword}".`)
        if (issueCount !== undefined) parts.push(`${issueCount} decay issues addressed.`)
        return parts.join(' ')
      }
      case 'schema_generation': {
        const score = getNestedValue(content, 'schema_score')
        const schemaCount = getArrayCount(content, 'schemas')
        return `Schema score: ${score ?? 'N/A'}/100. ${schemaCount ?? 0} schema type(s) generated.`
      }
      case 'redirect_map': {
        const score = getNestedValue(content, 'redirect_score')
        const totalRedirects = getNestedValue(content, 'summary.total_redirects')
        return `Redirect map: ${totalRedirects ?? 0} redirect rules. Score: ${score ?? 'N/A'}/100. Available in .htaccess, nginx, Vercel, and Next.js formats.`
      }
      case 'robots_sitemap': {
        const score = getNestedValue(content, 'robots_sitemap_score')
        const structure = getNestedValue(content, 'sitemap_strategy.recommended_structure')
        const parts = [`Robots & sitemap score: ${score ?? 'N/A'}/100.`]
        if (structure !== undefined) parts.push(`Structure: ${structure}.`)
        return parts.join(' ')
      }
      case 'outreach_emails': {
        const score = getNestedValue(content, 'outreach_score')
        const templateCount = getArrayCount(content, 'email_templates')
        const strategyType = getNestedValue(content, 'outreach_strategy.type')
        const parts = [`Outreach score: ${score ?? 'N/A'}/100.`]
        if (templateCount !== undefined) parts.push(`${templateCount} email templates generated.`)
        if (strategyType !== undefined) parts.push(`Type: ${strategyType}.`)
        return parts.join(' ')
      }
      case 'guest_post_draft': {
        const score = getNestedValue(content, 'guest_post_score')
        const publicationStyle = getNestedValue(content, 'publication_fit_analysis.publication_style')
        const parts = [`Guest post score: ${score ?? 'N/A'}/100.`]
        if (typeof publicationStyle === 'string' && publicationStyle.trim().length > 0) {
          parts.push(`Matched to: ${publicationStyle.slice(0, 80)}.`)
        }
        return parts.join(' ')
      }
      case 'directory_submissions': {
        const score = getNestedValue(content, 'submission_score')
        const profileCount = getArrayCount(content, 'directory_profiles')
        return `Submission score: ${score ?? 'N/A'}/100. ${profileCount ?? 0} directory profile(s) generated.`
      }
      case 'review_responses': {
        const score = getNestedValue(content, 'response_score')
        const responseCount = getArrayCount(content, 'responses')
        const patternCount = getArrayCount(content, 'patterns_detected')
        const parts = [`Response score: ${score ?? 'N/A'}/100.`]
        if (responseCount !== undefined) parts.push(`${responseCount} review response(s) drafted.`)
        if (patternCount !== undefined) parts.push(`${patternCount} recurring pattern(s) detected.`)
        return parts.join(' ')
      }
      case 'review_campaign': {
        const score = getNestedValue(content, 'campaign_score')
        const emailCount = getArrayCount(content, 'email_templates')
        const smsCount = getArrayCount(content, 'sms_templates')
        const parts = [`Campaign score: ${score ?? 'N/A'}/100.`]
        if (emailCount !== undefined) parts.push(`${emailCount} email template(s).`)
        if (smsCount !== undefined) parts.push(`${smsCount} SMS template(s).`)
        return parts.join(' ')
      }
      default:
        return 'Report generated.'
    }
  } catch {
    return 'Report generated.'
  }
}

export function extractScore(requestType: string, content: DeliverableContent): number | null {
  try {
    const scoreKeys: Record<string, string[]> = {
      site_audit: ['overall_score'],
      analytics_audit: ['analytics_score', 'overall_score'],
      content_brief: ['seo_score', 'brief.seo_score', 'content_score'],
      keyword_research: ['keyword_quality_score', 'quality_score', 'overall_score'],
      technical_audit: ['technical_score'],
      link_analysis: ['link_profile_score'],
      on_page_audit: ['on_page_score'],
      meta_optimization: ['optimization_score'],
      content_calendar: ['calendar_score'],
      topic_cluster_map: ['cluster_score'],
      local_seo_audit: ['local_seo_score', 'local_score', 'overall_score'],
      gbp_optimization: ['gbp_score', 'local_seo_score', 'optimization_score'],
      geo_audit: ['geo_score'],
      entity_optimization: ['entity_score'],
      competitor_analysis: ['competitive_score'],
      monthly_report: ['overall_score', 'seo_health_score', 'performance_score'],
      content_decay_audit: ['decay_score'],
      content_article: ['article_score'],
      content_rewrite: ['rewrite_score'],
      schema_generation: ['schema_score'],
      redirect_map: ['redirect_score'],
      robots_sitemap: ['robots_sitemap_score'],
      outreach_emails: ['outreach_score'],
      guest_post_draft: ['guest_post_score'],
      directory_submissions: ['submission_score'],
      review_responses: ['response_score'],
      review_campaign: ['campaign_score'],
    }

    for (const key of scoreKeys[requestType] ?? []) {
      const value = getNestedValue(content, key)
      if (typeof value === 'number') return value
    }

    return null
  } catch {
    return null
  }
}
