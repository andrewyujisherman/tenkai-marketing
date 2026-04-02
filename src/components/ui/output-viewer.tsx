'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { X, Maximize2, Download, FileDown, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

const MARKDOWN_PATTERN = /^#{1,3}\s|^\*\s|^\d+\.\s|\*\*[^*]+\*\*|`[^`]+`/m

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface OutputContent {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'keyword_link' | 'metric' | 'section_break'
  level?: number
  text?: string
  items?: string[]
  headers?: string[]
  rows?: string[][]
  keyword?: string
  href?: string
  label?: string
  value?: string
}

interface OutputData {
  id: string
  title: string
  content: OutputContent[] | string | Record<string, unknown>
  deliverable_type?: string
  agent_name?: string
  agent_kanji?: string
  status?: string
}

type OutputVariant = 'modal' | 'full-page'

interface OutputViewerProps {
  data: OutputData
  variant?: OutputVariant
  open?: boolean
  onClose?: () => void
  className?: string
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function formatKey(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function KeywordLink({ keyword }: { keyword: string }) {
  return (
    <Link
      href={`/rankings?keyword=${encodeURIComponent(keyword)}`}
      className="text-torii hover:text-torii-dark font-medium underline underline-offset-2 transition-colors"
    >
      {keyword}
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════════
   REPORT-STYLE RENDERERS (matches mockup report-content)
   ═══════════════════════════════════════════════════════════════ */

function ReportHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8 pb-6 border-b border-tenkai-border">
      <p className="text-torii text-xs font-semibold tracking-[2px] uppercase mb-2">Tenkai SEO</p>
      <h2 className="font-serif text-xl text-charcoal font-semibold">{title}</h2>
      {subtitle && <p className="text-warm-gray text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

function ReportSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="font-serif text-base text-charcoal font-semibold mb-3">{heading}</h3>
      {children}
    </div>
  )
}

function ReportParagraph({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-[1.8] text-[#444] mb-3">{children}</p>
}

function renderAuditReport(data: Record<string, unknown>, title: string): React.ReactNode {
  const categories = data.categories as Record<string, { score: number; issues?: Array<{ title: string; severity: string; description: string; recommendation?: string }> }> | undefined
  if (!categories) return renderGenericAsReport(data, title)

  const agentOverallScore = typeof data.overall_score === 'number' ? data.overall_score : null
  const calculatedScore = Object.values(categories).reduce((sum, c) => sum + (c.score ?? 0), 0) / Object.keys(categories).length
  const overallScore = agentOverallScore ?? Math.round(calculatedScore)

  const executiveSummary = typeof data.executive_summary === 'string' ? data.executive_summary : null
  const quickWins = Array.isArray(data.quick_wins) ? (data.quick_wins as string[]) : null
  const topRecommendations = Array.isArray(data.top_recommendations)
    ? (data.top_recommendations as Array<{ title: string; priority?: string; description: string; estimated_impact?: string }>)
    : null
  const competitiveLandscape = typeof data.competitive_landscape === 'string' ? data.competitive_landscape : null
  const internalLinks = (data.internal_link_architecture ?? null) as {
    pages_crawled?: number; orphan_pages?: string[]; max_link_depth?: number;
    anchor_text_health?: string; anchor_text_alert?: string; top_recommendations?: unknown
  } | null

  const scoreColor = overallScore >= 70 ? 'text-green-600' : overallScore >= 40 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="report-content max-w-[800px] mx-auto">
      <ReportHeader title={title} />

      {/* Overall Score */}
      <div className="text-center mb-6">
        <span className={cn('font-serif text-5xl font-bold', scoreColor)}>{overallScore}</span>
        <span className="text-warm-gray text-lg">/100</span>
      </div>

      {/* Executive Summary */}
      <ReportSection heading="Executive Summary">
        <ReportParagraph>
          {executiveSummary ?? (
            <>Your site scored an average of <strong>{Math.round(calculatedScore)}/100</strong> across{' '}
            {Object.keys(categories).length} categories. Below is a breakdown of each area with specific issues
            identified and their severity.</>
          )}
        </ReportParagraph>
      </ReportSection>

      {/* Quick Wins */}
      {quickWins && quickWins.length > 0 && (
        <ReportSection heading="Quick Wins">
          <div className="bg-cream/40 rounded-tenkai border border-tenkai-border p-4">
            <ol className="space-y-2">
              {quickWins.map((win, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#444] leading-relaxed">
                  <input type="checkbox" className="mt-1 flex-shrink-0 accent-torii" readOnly />
                  <span><strong className="text-charcoal">{i + 1}.</strong> {win}</span>
                </li>
              ))}
            </ol>
          </div>
        </ReportSection>
      )}

      {/* Categories + Issues */}
      {Object.entries(categories).map(([catKey, cat]) => (
        <ReportSection key={catKey} heading={`${formatKey(catKey)} — ${cat.score}/100`}>
          {cat.issues && cat.issues.length > 0 ? (
            <div className="space-y-3">
              {cat.issues.map((issue, i) => (
                <div key={i} className="pl-4 border-l-2 border-tenkai-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase',
                      issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {issue.severity}
                    </span>
                    <span className="text-sm font-medium text-charcoal">{issue.title}</span>
                  </div>
                  <p className="text-sm text-[#444] leading-relaxed">{issue.description}</p>
                  {issue.recommendation && (
                    <p className="text-sm text-torii mt-1 italic">{issue.recommendation}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <ReportParagraph>No issues found in this category.</ReportParagraph>
          )}
        </ReportSection>
      ))}

      {/* Top Recommendations */}
      {topRecommendations && topRecommendations.length > 0 && (
        <ReportSection heading="Top Recommendations">
          <div className="space-y-3">
            {topRecommendations.map((rec, i) => {
              const prio = (rec.priority ?? 'medium').toLowerCase()
              const prioClass = prio === 'high' ? 'bg-red-100 text-red-700' : prio === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
              return (
                <div key={i} className="bg-cream/40 rounded-tenkai border border-tenkai-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase', prioClass)}>{prio}</span>
                    <span className="text-sm font-semibold text-charcoal">{rec.title}</span>
                  </div>
                  <p className="text-sm text-[#444] leading-relaxed">{rec.description}</p>
                  {rec.estimated_impact && (
                    <p className="text-xs text-warm-gray mt-2">Estimated impact: <strong className="text-charcoal">{rec.estimated_impact}</strong></p>
                  )}
                </div>
              )
            })}
          </div>
        </ReportSection>
      )}

      {/* Competitive Landscape */}
      {competitiveLandscape && (
        <ReportSection heading="Competitive Landscape">
          <ReportParagraph>{competitiveLandscape}</ReportParagraph>
        </ReportSection>
      )}

      {/* Internal Link Architecture */}
      {internalLinks && typeof internalLinks === 'object' && (
        <ReportSection heading="Internal Link Architecture">
          <div className="bg-cream/40 rounded-tenkai border border-tenkai-border p-4 space-y-2">
            {internalLinks.pages_crawled != null && (
              <div className="flex justify-between text-sm">
                <span className="text-warm-gray">Pages Crawled</span>
                <span className="text-charcoal font-medium">{internalLinks.pages_crawled}</span>
              </div>
            )}
            {internalLinks.orphan_pages && (
              <div className="flex justify-between text-sm">
                <span className="text-warm-gray">Orphan Pages</span>
                <span className="text-charcoal font-medium">{internalLinks.orphan_pages.length}</span>
              </div>
            )}
            {internalLinks.max_link_depth != null && (
              <div className="flex justify-between text-sm">
                <span className="text-warm-gray">Max Link Depth</span>
                <span className="text-charcoal font-medium">{internalLinks.max_link_depth}</span>
              </div>
            )}
            {internalLinks.anchor_text_health && (
              <div className="flex justify-between text-sm">
                <span className="text-warm-gray">Anchor Text Health</span>
                <span className="text-charcoal font-medium">{internalLinks.anchor_text_health}</span>
              </div>
            )}
            {internalLinks.anchor_text_alert && (
              <p className="text-xs text-amber-600 mt-1">{internalLinks.anchor_text_alert}</p>
            )}
            {internalLinks.top_recommendations != null && (
              <div className="mt-2 pt-2 border-t border-tenkai-border">
                {renderValueAsText(internalLinks.top_recommendations)}
              </div>
            )}
          </div>
        </ReportSection>
      )}
    </div>
  )
}

function renderKeywordList(data: Record<string, unknown>, title: string): React.ReactNode {
  const executiveSummary = typeof data.executive_summary === 'string' ? data.executive_summary : null
  const keywordClusters = Array.isArray(data.keyword_clusters)
    ? (data.keyword_clusters as Array<{
        cluster_name?: string; primary_keyword?: string; supporting_keywords?: string[];
        content_types?: unknown; search_intent?: string; execution_priority?: number
      }>)
    : null
  const quickWins = Array.isArray(data.quick_wins)
    ? (data.quick_wins as Array<{ keyword: string; volume?: unknown; difficulty_score?: unknown; why_now?: string; content_type?: string }>)
    : null
  const contentGaps = Array.isArray(data.content_gaps)
    ? (data.content_gaps as Array<{ topic?: string; keywords?: string[]; opportunity?: string; competitor_coverage?: string; estimated_difficulty?: string }>)
    : null
  const localKeywords = Array.isArray(data.local_keywords)
    ? (data.local_keywords as Array<{ keyword: string; local_modifier?: string; opportunity_score?: unknown }>)
    : null
  const aiSearchKeywords = Array.isArray(data.ai_search_keywords)
    ? (data.ai_search_keywords as Array<Record<string, unknown>>)
    : null

  // Backward compat: collect flat keyword arrays for non-cluster data
  const flatGroups = new Map<string, Array<{ keyword: string; volume: string; why_now?: string }>>()
  for (const [groupKey, groupVal] of Object.entries(data)) {
    if (['executive_summary', 'keyword_clusters', 'quick_wins', 'content_gaps', 'local_keywords', 'ai_search_keywords'].includes(groupKey)) continue
    if (groupKey === 'long_tail' || groupKey === 'branded') {
      // These are flat keyword arrays — render as tables
    } else {
      continue
    }
    if (Array.isArray(groupVal)) {
      const items: Array<{ keyword: string; volume: string; why_now?: string }> = []
      groupVal.forEach((item) => {
        if (item && typeof item === 'object' && ('keyword' in item || 'term' in item)) {
          const r = item as Record<string, unknown>
          items.push({
            keyword: String(r.keyword ?? r.term ?? ''),
            volume: String(r.volume ?? r.search_volume ?? '—'),
            why_now: r.why_now as string | undefined,
          })
        }
      })
      if (items.length > 0) flatGroups.set(groupKey, items)
    }
  }

  // Also pick up any other arrays of keyword objects not already handled
  for (const [groupKey, groupVal] of Object.entries(data)) {
    if (['executive_summary', 'keyword_clusters', 'quick_wins', 'content_gaps', 'local_keywords', 'ai_search_keywords', 'long_tail', 'branded'].includes(groupKey)) continue
    if (Array.isArray(groupVal) && groupVal.length > 0 && typeof groupVal[0] === 'object' && groupVal[0] !== null && ('keyword' in groupVal[0] || 'term' in groupVal[0])) {
      const items: Array<{ keyword: string; volume: string; why_now?: string }> = []
      groupVal.forEach((item) => {
        const r = item as Record<string, unknown>
        items.push({
          keyword: String(r.keyword ?? r.term ?? ''),
          volume: String(r.volume ?? r.search_volume ?? '—'),
          why_now: r.why_now as string | undefined,
        })
      })
      if (items.length > 0) flatGroups.set(groupKey, items)
    }
  }

  const hasContent = keywordClusters || quickWins || contentGaps || localKeywords || aiSearchKeywords || flatGroups.size > 0
  if (!hasContent) return renderGenericAsReport(data, title)

  return (
    <div className="report-content max-w-[800px] mx-auto">
      <ReportHeader title={title} />

      {/* Executive Summary */}
      {executiveSummary && (
        <ReportSection heading="Executive Summary">
          <ReportParagraph>{executiveSummary}</ReportParagraph>
        </ReportSection>
      )}

      {/* Keyword Clusters */}
      {keywordClusters && keywordClusters.length > 0 && (
        <ReportSection heading="Keyword Clusters">
          <div className="space-y-4">
            {keywordClusters.map((cluster, i) => (
              <div key={i} className="bg-cream/40 rounded-tenkai border border-tenkai-border p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="font-serif text-sm font-semibold text-charcoal">{cluster.cluster_name ?? `Cluster ${i + 1}`}</h4>
                  {cluster.search_intent && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">{cluster.search_intent}</span>
                  )}
                  {cluster.execution_priority != null && (
                    <span className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase',
                      cluster.execution_priority === 1 ? 'bg-red-100 text-red-700' : cluster.execution_priority === 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      Priority {cluster.execution_priority}
                    </span>
                  )}
                </div>
                {cluster.primary_keyword && (
                  <p className="text-sm mb-2">
                    <span className="text-warm-gray">Primary: </span>
                    <KeywordLink keyword={cluster.primary_keyword} />
                  </p>
                )}
                {cluster.supporting_keywords && cluster.supporting_keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {cluster.supporting_keywords.map((kw, j) => (
                      <span key={j} className="text-xs bg-ivory border border-tenkai-border rounded-tenkai px-2 py-0.5 text-charcoal/70">{kw}</span>
                    ))}
                  </div>
                )}
                {cluster.content_types != null && (
                  <p className="text-xs text-warm-gray">Content types: {typeof cluster.content_types === 'string' ? cluster.content_types : Array.isArray(cluster.content_types) ? (cluster.content_types as string[]).join(', ') : String(cluster.content_types)}</p>
                )}
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Quick Wins */}
      {quickWins && quickWins.length > 0 && (
        <ReportSection heading="Quick Wins">
          <div className="overflow-x-auto rounded-tenkai border border-tenkai-border mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream">
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Keyword</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Volume</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Difficulty</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Content Type</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Why Now</th>
                </tr>
              </thead>
              <tbody>
                {quickWins.map((kw, i) => (
                  <tr key={i} className="border-b border-tenkai-border last:border-0 hover:bg-cream/40 transition-colors">
                    <td className="px-4 py-2.5"><KeywordLink keyword={kw.keyword} /></td>
                    <td className="px-4 py-2.5 text-charcoal/70">{String(kw.volume ?? '—')}</td>
                    <td className="px-4 py-2.5 text-charcoal/70">{String(kw.difficulty_score ?? '—')}</td>
                    <td className="px-4 py-2.5 text-charcoal/70">{kw.content_type ?? '—'}</td>
                    <td className="px-4 py-2.5 text-[#444] leading-relaxed">{kw.why_now ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      )}

      {/* Content Gaps */}
      {contentGaps && contentGaps.length > 0 && (
        <ReportSection heading="Content Gaps">
          <div className="space-y-3">
            {contentGaps.map((gap, i) => (
              <div key={i} className="pl-4 border-l-2 border-tenkai-border">
                <p className="text-sm font-medium text-charcoal mb-1">{gap.topic ?? `Gap ${i + 1}`}</p>
                {gap.keywords && gap.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {gap.keywords.map((kw, j) => (
                      <span key={j} className="text-xs bg-cream border border-tenkai-border rounded-tenkai px-2 py-0.5 text-charcoal/70">{kw}</span>
                    ))}
                  </div>
                )}
                {gap.opportunity && <p className="text-xs text-[#444]"><span className="text-warm-gray">Opportunity:</span> {gap.opportunity}</p>}
                {gap.competitor_coverage && <p className="text-xs text-[#444]"><span className="text-warm-gray">Competitor coverage:</span> {gap.competitor_coverage}</p>}
                {gap.estimated_difficulty && <p className="text-xs text-[#444]"><span className="text-warm-gray">Difficulty:</span> {gap.estimated_difficulty}</p>}
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Local Keywords */}
      {localKeywords && localKeywords.length > 0 && (
        <ReportSection heading="Local Keywords">
          <div className="overflow-x-auto rounded-tenkai border border-tenkai-border mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream">
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Keyword</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Local Modifier</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Opportunity Score</th>
                </tr>
              </thead>
              <tbody>
                {localKeywords.map((kw, i) => (
                  <tr key={i} className="border-b border-tenkai-border last:border-0 hover:bg-cream/40 transition-colors">
                    <td className="px-4 py-2.5"><KeywordLink keyword={kw.keyword} /></td>
                    <td className="px-4 py-2.5 text-charcoal/70">{kw.local_modifier ?? '—'}</td>
                    <td className="px-4 py-2.5 text-charcoal/70">{String(kw.opportunity_score ?? '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      )}

      {/* AI Search Keywords */}
      {aiSearchKeywords && aiSearchKeywords.length > 0 && (
        <ReportSection heading="AI Search Keywords">
          <div className="overflow-x-auto rounded-tenkai border border-tenkai-border mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream">
                  {Object.keys(aiSearchKeywords[0]).map((key) => (
                    <th key={key} className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">{formatKey(key)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aiSearchKeywords.map((kw, i) => (
                  <tr key={i} className="border-b border-tenkai-border last:border-0 hover:bg-cream/40 transition-colors">
                    {Object.entries(kw).map(([key, val]) => (
                      <td key={key} className="px-4 py-2.5 text-charcoal/70">
                        {key === 'keyword' ? <KeywordLink keyword={String(val)} /> : String(val ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      )}

      {/* Backward-compat flat keyword groups (long_tail, branded, etc.) */}
      {Array.from(flatGroups.entries()).map(([cat, keywords]) => (
        <ReportSection key={cat} heading={formatKey(cat)}>
          <div className="overflow-x-auto rounded-tenkai border border-tenkai-border mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream">
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Keyword</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Volume</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Why This Matters</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw, i) => (
                  <tr key={i} className="border-b border-tenkai-border last:border-0 hover:bg-cream/40 transition-colors">
                    <td className="px-4 py-2.5"><KeywordLink keyword={kw.keyword} /></td>
                    <td className="px-4 py-2.5 text-charcoal/70">{kw.volume}</td>
                    <td className="px-4 py-2.5 text-[#444] leading-relaxed">{kw.why_now ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      ))}
    </div>
  )
}

function renderContentDraftOrArticle(data: Record<string, unknown>, title: string): React.ReactNode {
  const meta = (data.meta ?? data.brief ?? {}) as Record<string, unknown>
  // Article content may be nested under data.article (production structure)
  const articleObj = (typeof data.article === 'object' && data.article !== null && !Array.isArray(data.article))
    ? (data.article as Record<string, unknown>) : null
  const body = data.body ?? data.content ?? data.sections ?? articleObj?.sections ?? null
  const metaTitle = meta.meta_title ?? meta.title ?? title
  const targetKw = meta.target_keyword ?? meta.keyword ?? null
  // Introduction + conclusion from nested article
  const introduction = typeof (articleObj?.introduction ?? data.introduction) === 'string' ? String(articleObj?.introduction ?? data.introduction) : null
  const conclusion = typeof (articleObj?.conclusion ?? data.conclusion) === 'string' ? String(articleObj?.conclusion ?? data.conclusion) : null
  // FAQ: check data.faq, data.article.faq_section, data.article.faq
  const rawFaq = data.faq ?? articleObj?.faq_section ?? articleObj?.faq ?? null
  const faq = Array.isArray(rawFaq) ? (rawFaq as Array<{ question: string; answer: string }>) : null
  // Internal link suggestions: check multiple key patterns
  const rawLinks = data.internal_link_suggestions ?? data.internal_linking_suggestions ?? articleObj?.internal_linking_suggestions ?? articleObj?.internal_link_suggestions ?? null
  const internalLinkSuggestions = Array.isArray(rawLinks)
    ? (rawLinks as Array<{ anchor_text: string; target_url: string; context?: string }>)
    : null
  // SEO checklist from nested article
  const seoChecklist = Array.isArray(articleObj?.seo_checklist) ? (articleObj.seo_checklist as string[]) : null

  return (
    <div className="report-content max-w-[800px] mx-auto">
      <ReportHeader title={String(metaTitle)} subtitle={targetKw ? `Target keyword: ${targetKw}` : undefined} />

      {/* Brief metadata as clean labeled fields */}
      {Object.keys(meta).length > 0 && (
        <ReportSection heading="Content Brief">
          <div className="bg-cream/40 rounded-tenkai border border-tenkai-border p-4 mb-4">
            {Object.entries(meta).map(([k, v]) => (
              <div key={k} className="flex gap-3 py-1.5 border-b border-tenkai-border/50 last:border-0">
                <span className="text-xs font-medium text-warm-gray uppercase tracking-wide w-32 flex-shrink-0 pt-0.5">{formatKey(k)}</span>
                <span className="text-sm text-charcoal/80">{typeof v === 'object' ? (Array.isArray(v) ? (v as string[]).join(', ') : JSON.stringify(v)) : String(v ?? '—')}</span>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Article body */}
      {body != null && (
        <div>
          {typeof body === 'string' ? (
            MARKDOWN_PATTERN.test(body) ? (
              <div className="prose prose-sm max-w-none text-[#444] [&>h1]:font-serif [&>h2]:font-serif [&>h3]:font-serif [&>h1]:text-charcoal [&>h2]:text-charcoal [&>h3]:text-charcoal [&>p]:leading-[1.8] [&>p]:mb-3">
                <ReactMarkdown>{body}</ReactMarkdown>
              </div>
            ) : (
              body.split('\n\n').map((p, i) => <ReportParagraph key={i}>{p}</ReportParagraph>)
            )
          ) : Array.isArray(body) ? (
            body.map((section, i) => {
              if (typeof section === 'string') return <ReportParagraph key={i}>{section}</ReportParagraph>
              const s = section as Record<string, unknown>
              const heading = s.heading ?? s.title ?? s.section_title
              const bodyContent = s.content ?? s.body ?? s.text
              return (
                <ReportSection key={i} heading={heading ? String(heading) : `Section ${i + 1}`}>
                  {typeof bodyContent === 'string' ? (
                    MARKDOWN_PATTERN.test(bodyContent) ? (
                      <div className="prose prose-sm max-w-none text-[#444] [&>p]:leading-[1.8] [&>p]:mb-3">
                        <ReactMarkdown>{bodyContent}</ReactMarkdown>
                      </div>
                    ) : (
                      bodyContent.split('\n\n').map((p, j) => <ReportParagraph key={j}>{p}</ReportParagraph>)
                    )
                  ) : bodyContent != null ? (
                    <ReportParagraph>{String(bodyContent)}</ReportParagraph>
                  ) : null}
                </ReportSection>
              )
            })
          ) : (
            <div className="space-y-2">
              {Object.entries(body as Record<string, unknown>).map(([k, v]) => (
                <ReportSection key={k} heading={formatKey(k)}>
                  <ReportParagraph>{typeof v === 'string' ? v : JSON.stringify(v)}</ReportParagraph>
                </ReportSection>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Introduction (from nested article) */}
      {introduction && !body && (
        <ReportSection heading="Introduction">
          <ReportParagraph>{introduction}</ReportParagraph>
        </ReportSection>
      )}

      {/* Conclusion */}
      {conclusion && (
        <ReportSection heading="Conclusion">
          <ReportParagraph>{conclusion}</ReportParagraph>
        </ReportSection>
      )}

      {/* SEO Checklist */}
      {seoChecklist && seoChecklist.length > 0 && (
        <ReportSection heading="SEO Checklist">
          <ul className="space-y-1.5">
            {seoChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#444]">
                <span className="text-torii mt-0.5">☐</span>
                <span>{String(item)}</span>
              </li>
            ))}
          </ul>
        </ReportSection>
      )}

      {/* FAQ */}
      {faq && faq.length > 0 && (
        <ReportSection heading="Frequently Asked Questions">
          <div className="space-y-2">
            {faq.map((item, i) => (
              <details key={i} className="group rounded-tenkai border border-tenkai-border overflow-hidden">
                <summary className="cursor-pointer px-4 py-3 bg-cream/40 text-sm font-medium text-charcoal hover:bg-cream transition-colors select-none">
                  {item.question}
                </summary>
                <div className="px-4 py-3 text-sm text-[#444] leading-relaxed border-t border-tenkai-border">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Internal Link Suggestions */}
      {internalLinkSuggestions && internalLinkSuggestions.length > 0 && (
        <ReportSection heading="Internal Link Suggestions">
          <div className="overflow-x-auto rounded-tenkai border border-tenkai-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream">
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Anchor Text</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Target URL</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Context</th>
                </tr>
              </thead>
              <tbody>
                {internalLinkSuggestions.map((link, i) => (
                  <tr key={i} className="border-b border-tenkai-border last:border-0 hover:bg-cream/40 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-charcoal">{link.anchor_text}</td>
                    <td className="px-4 py-2.5 text-torii break-all">{link.target_url}</td>
                    <td className="px-4 py-2.5 text-[#444] leading-relaxed">{link.context ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      )}
    </div>
  )
}

function looksLikeCode(val: string): boolean {
  return /[{<]/.test(val) && (/^\s*\{/.test(val.trim()) || /server\s*\{/.test(val) || /RewriteRule/.test(val) || /"@context"/.test(val) || /<[a-zA-Z]/.test(val))
}

function isUniformArray(val: unknown): val is Array<Record<string, unknown>> {
  if (!Array.isArray(val) || val.length < 3) return false
  if (!val.every((v) => v && typeof v === 'object' && !Array.isArray(v))) return false
  const keys0 = Object.keys(val[0] as Record<string, unknown>).sort().join(',')
  return val.slice(1).every((v) => Object.keys(v as Record<string, unknown>).sort().join(',') === keys0)
}

function renderUniformTable(items: Array<Record<string, unknown>>): React.ReactNode {
  const headers = Object.keys(items[0])
  return (
    <div className="overflow-x-auto rounded-tenkai border border-tenkai-border mb-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-cream">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">{formatKey(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={i} className="border-b border-tenkai-border last:border-0 hover:bg-cream/40 transition-colors">
              {headers.map((h) => (
                <td key={h} className="px-4 py-2.5 text-[#444]">
                  {typeof row[h] === 'object' ? JSON.stringify(row[h]) : String(row[h] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="text-xs px-2 py-1 rounded bg-warm-gray/20 text-cream hover:bg-warm-gray/40 transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function renderCodeBlock(code: string): React.ReactNode {
  return (
    <div className="relative rounded-tenkai overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-2 bg-charcoal border-b border-warm-gray/20">
        <span className="text-xs text-warm-gray">Code</span>
        <CopyButton text={code} />
      </div>
      <pre className="bg-charcoal text-green-300 text-sm p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
        {code}
      </pre>
    </div>
  )
}

function renderPriorityCards(items: Array<Record<string, unknown>>): React.ReactNode {
  return (
    <div className="space-y-3">
      {items.map((rec, i) => {
        const prio = String(rec.priority ?? rec.level ?? 'medium').toLowerCase()
        const prioClass = prio === 'high' || prio === 'critical' ? 'bg-red-100 text-red-700' : prio === 'low' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
        const recTitle = String(rec.title ?? rec.name ?? rec.action ?? `Item ${i + 1}`)
        const desc = String(rec.description ?? rec.detail ?? rec.rationale ?? '')
        const impact = rec.estimated_impact ?? rec.impact ?? null
        return (
          <div key={i} className="bg-cream/40 rounded-tenkai border border-tenkai-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase', prioClass)}>{prio}</span>
              <span className="text-sm font-semibold text-charcoal">{recTitle}</span>
            </div>
            {desc && <p className="text-sm text-[#444] leading-relaxed">{desc}</p>}
            {impact && <p className="text-xs text-warm-gray mt-2">Estimated impact: <strong className="text-charcoal">{String(impact)}</strong></p>}
          </div>
        )
      })}
    </div>
  )
}

function renderGenericAsReport(data: Record<string, unknown>, title: string): React.ReactNode {
  // Extract well-known fields first
  const executiveSummary = typeof data.executive_summary === 'string' ? data.executive_summary : null
  const overallScore = typeof data.overall_score === 'number' ? data.overall_score : typeof data.score === 'number' ? data.score : null
  const quickWins = Array.isArray(data.quick_wins) ? (data.quick_wins as unknown[]) : null

  // Find recommendation-like keys
  const recKeys = Object.keys(data).filter((k) => /recommendations|priority_actions/i.test(k))
  const recData: Record<string, Array<Record<string, unknown>>> = {}
  recKeys.forEach((k) => {
    const val = data[k]
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
      recData[k] = val as Array<Record<string, unknown>>
    }
  })

  // Remaining keys
  const handledKeys = new Set(['executive_summary', 'overall_score', 'score', 'quick_wins', ...recKeys])
  const remaining = Object.entries(data).filter(([k]) => !handledKeys.has(k))

  const scoreColor = overallScore != null ? (overallScore >= 70 ? 'text-green-600' : overallScore >= 40 ? 'text-amber-500' : 'text-red-500') : ''

  return (
    <div className="report-content max-w-[800px] mx-auto">
      <ReportHeader title={title} />

      {/* Overall Score */}
      {overallScore != null && (
        <div className="text-center mb-6">
          <span className={cn('font-serif text-5xl font-bold', scoreColor)}>{overallScore}</span>
          <span className="text-warm-gray text-lg">/100</span>
        </div>
      )}

      {/* Executive Summary */}
      {executiveSummary && (
        <div className="bg-cream/60 border-l-4 border-torii p-4 mb-6 rounded-r-tenkai">
          <p className="text-sm leading-[1.8] text-[#444]">{executiveSummary}</p>
        </div>
      )}

      {/* Quick Wins */}
      {quickWins && quickWins.length > 0 && (
        <ReportSection heading="Quick Wins">
          <div className="bg-cream/40 rounded-tenkai border border-tenkai-border p-4">
            <ol className="space-y-2">
              {quickWins.map((win, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#444] leading-relaxed">
                  <input type="checkbox" className="mt-1 flex-shrink-0 accent-torii" readOnly />
                  <span><strong className="text-charcoal">{i + 1}.</strong> {String(win)}</span>
                </li>
              ))}
            </ol>
          </div>
        </ReportSection>
      )}

      {/* Recommendation-like sections */}
      {Object.entries(recData).map(([key, items]) => (
        <ReportSection key={key} heading={formatKey(key)}>
          {renderPriorityCards(items)}
        </ReportSection>
      ))}

      {/* Remaining fields with smart rendering */}
      {remaining.map(([key, val]) => (
        <ReportSection key={key} heading={formatKey(key)}>
          {typeof val === 'string' && looksLikeCode(val) ? (
            renderCodeBlock(val)
          ) : isUniformArray(val) ? (
            renderUniformTable(val)
          ) : (
            renderValueAsText(val)
          )}
        </ReportSection>
      ))}
    </div>
  )
}

function renderCodeOutput(data: Record<string, unknown>, title: string): React.ReactNode {
  const executiveSummary = typeof data.executive_summary === 'string' ? data.executive_summary : null
  const schemaType = typeof data.schema_type === 'string' ? data.schema_type : typeof data.description === 'string' ? data.description : null
  const implementationInstructions = typeof data.implementation_instructions === 'string' ? data.implementation_instructions : null
  const validationNotes = typeof data.validation_notes === 'string' ? data.validation_notes : null

  // Find the code field — could be "code", "schema_code", "config", or any string that looks like code
  let codeContent: string | null = null
  for (const key of ['code', 'schema_code', 'config', 'output', 'robots_txt', 'htaccess']) {
    if (typeof data[key] === 'string') { codeContent = data[key] as string; break }
  }
  if (!codeContent) {
    // Scan for any string value that looks like code
    for (const val of Object.values(data)) {
      if (typeof val === 'string' && looksLikeCode(val)) { codeContent = val; break }
    }
  }

  // Remaining fields not already handled
  const handledKeys = new Set(['executive_summary', 'schema_type', 'description', 'implementation_instructions', 'validation_notes', 'code', 'schema_code', 'config', 'output', 'robots_txt', 'htaccess'])
  const remaining = Object.entries(data).filter(([k, v]) => !handledKeys.has(k) && !(typeof v === 'string' && v === codeContent))

  return (
    <div className="report-content max-w-[800px] mx-auto">
      <ReportHeader title={title} subtitle={schemaType ?? undefined} />

      {executiveSummary && (
        <div className="bg-cream/60 border-l-4 border-torii p-4 mb-6 rounded-r-tenkai">
          <p className="text-sm leading-[1.8] text-[#444]">{executiveSummary}</p>
        </div>
      )}

      {codeContent && (
        <ReportSection heading="Code">
          {renderCodeBlock(codeContent)}
        </ReportSection>
      )}

      {implementationInstructions && (
        <ReportSection heading="Implementation Instructions">
          <ReportParagraph>{implementationInstructions}</ReportParagraph>
        </ReportSection>
      )}

      {validationNotes && (
        <ReportSection heading="Validation Notes">
          <ReportParagraph>{validationNotes}</ReportParagraph>
        </ReportSection>
      )}

      {remaining.map(([key, val]) => (
        <ReportSection key={key} heading={formatKey(key)}>
          {typeof val === 'string' && looksLikeCode(val) ? renderCodeBlock(val) : renderValueAsText(val)}
        </ReportSection>
      ))}
    </div>
  )
}

function renderCompetitiveReport(data: Record<string, unknown>, title: string): React.ReactNode {
  const executiveSummary = typeof data.executive_summary === 'string' ? data.executive_summary : null
  const competitors = Array.isArray(data.competitors)
    ? (data.competitors as Array<{ domain?: string; estimated_traffic?: unknown; strengths?: string[]; weaknesses?: string[]; top_keywords?: string[] }>)
    : null
  const marketPosition = typeof data.market_position === 'string' ? data.market_position : null
  const strategicRecommendations = Array.isArray(data.strategic_recommendations)
    ? (data.strategic_recommendations as Array<Record<string, unknown>>)
    : null

  // Analysis sections (can be string or object)
  const analysisKeys = ['content_gap_analysis', 'keyword_gap_analysis', 'backlink_comparison', 'serp_feature_analysis']
  const analyses = analysisKeys
    .filter((k) => data[k] != null)
    .map((k) => ({ key: k, value: data[k] }))

  const handledKeys = new Set(['executive_summary', 'competitors', 'market_position', 'strategic_recommendations', ...analysisKeys])
  const remaining = Object.entries(data).filter(([k]) => !handledKeys.has(k))

  return (
    <div className="report-content max-w-[800px] mx-auto">
      <ReportHeader title={title} />

      {executiveSummary && (
        <div className="bg-cream/60 border-l-4 border-torii p-4 mb-6 rounded-r-tenkai">
          <p className="text-sm leading-[1.8] text-[#444]">{executiveSummary}</p>
        </div>
      )}

      {/* Competitors Table */}
      {competitors && competitors.length > 0 && (
        <ReportSection heading="Competitor Overview">
          <div className="overflow-x-auto rounded-tenkai border border-tenkai-border mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream">
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Domain</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Est. Traffic</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Key Strengths</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Key Weaknesses</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, i) => (
                  <tr key={i} className="border-b border-tenkai-border last:border-0">
                    <td className="px-4 py-2.5 font-medium text-charcoal align-top">{comp.domain ?? '—'}</td>
                    <td className="px-4 py-2.5 text-charcoal/70 align-top">{String(comp.estimated_traffic ?? '—')}</td>
                    <td className="px-4 py-2.5 text-[#444] align-top">
                      {comp.strengths?.slice(0, 3).join(', ') ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-[#444] align-top">
                      {comp.weaknesses?.slice(0, 3).join(', ') ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expandable detail per competitor */}
          {competitors.map((comp, i) => (
            comp.top_keywords && comp.top_keywords.length > 0 ? (
              <details key={i} className="mb-2 rounded-tenkai border border-tenkai-border overflow-hidden">
                <summary className="cursor-pointer px-4 py-2 bg-cream/40 text-sm font-medium text-charcoal hover:bg-cream transition-colors select-none">
                  {comp.domain ?? `Competitor ${i + 1}`} — Top Keywords
                </summary>
                <div className="px-4 py-3 flex flex-wrap gap-1.5">
                  {comp.top_keywords.map((kw, j) => (
                    <span key={j} className="text-xs bg-ivory border border-tenkai-border rounded-tenkai px-2 py-0.5 text-charcoal/70">{kw}</span>
                  ))}
                </div>
              </details>
            ) : null
          ))}
        </ReportSection>
      )}

      {/* Market Position */}
      {marketPosition && (
        <ReportSection heading="Market Position">
          <ReportParagraph>{marketPosition}</ReportParagraph>
        </ReportSection>
      )}

      {/* Analysis Sections */}
      {analyses.map(({ key, value }) => (
        <ReportSection key={key} heading={formatKey(key)}>
          {typeof value === 'string' ? (
            <ReportParagraph>{value}</ReportParagraph>
          ) : (
            renderValueAsText(value)
          )}
        </ReportSection>
      ))}

      {/* Strategic Recommendations */}
      {strategicRecommendations && strategicRecommendations.length > 0 && (
        <ReportSection heading="Strategic Recommendations">
          {renderPriorityCards(strategicRecommendations)}
        </ReportSection>
      )}

      {/* Remaining */}
      {remaining.map(([key, val]) => (
        <ReportSection key={key} heading={formatKey(key)}>
          {renderValueAsText(val)}
        </ReportSection>
      ))}
    </div>
  )
}

function renderValueAsText(value: unknown, depth = 0): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-warm-gray italic">—</span>
  if (typeof value === 'boolean') return <ReportParagraph>{value ? 'Yes' : 'No'}</ReportParagraph>
  if (typeof value === 'number') return <ReportParagraph><strong>{value}</strong></ReportParagraph>
  if (typeof value === 'string') return <ReportParagraph>{value}</ReportParagraph>

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-warm-gray italic text-sm">None</span>
    if (value.every((v) => typeof v !== 'object' || v === null)) {
      return (
        <ul className="list-disc list-inside space-y-1 mb-3">
          {value.map((item, i) => (
            <li key={i} className="text-sm text-[#444] leading-relaxed">{String(item)}</li>
          ))}
        </ul>
      )
    }
    return (
      <div className="space-y-3">
        {value.map((item, i) => (
          <div key={i} className="pl-4 border-l-2 border-tenkai-border">
            {typeof item === 'object' && item !== null
              ? Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                  <div key={k} className="mb-1">
                    <span className="text-xs font-medium text-warm-gray uppercase">{formatKey(k)}: </span>
                    <span className="text-sm text-[#444]">{typeof v === 'string' || typeof v === 'number' ? String(v) : JSON.stringify(v)}</span>
                  </div>
                ))
              : <span className="text-sm text-[#444]">{String(item)}</span>
            }
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === 'object') {
    return (
      <div className={cn('space-y-2', depth > 0 && 'ml-4')}>
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <span className="text-xs font-medium text-warm-gray uppercase tracking-wide">{formatKey(k)}</span>
            <div className="mt-0.5">{renderValueAsText(v, depth + 1)}</div>
          </div>
        ))}
      </div>
    )
  }

  return <ReportParagraph>{String(value)}</ReportParagraph>
}

/* ═══════════════════════════════════════════════════════════════
   MAIN RENDERER
   ═══════════════════════════════════════════════════════════════ */

function renderJsonContent(data: Record<string, unknown>, title: string, deliverableType?: string): React.ReactNode {
  const type = (deliverableType ?? '').toLowerCase()

  // Type-based routing
  if (type.includes('audit')) return renderAuditReport(data, title)
  if (type.includes('keyword')) return renderKeywordList(data, title)
  if (type.includes('article') || type.includes('content_draft') || type.includes('content_brief')) return renderContentDraftOrArticle(data, title)
  if (type.includes('schema') || type.includes('redirect') || type.includes('robots')) return renderCodeOutput(data, title)
  if (type.includes('competitive') || type.includes('competitor')) return renderCompetitiveReport(data, title)

  // Heuristic detection by data shape
  if ('categories' in data && typeof data.categories === 'object') return renderAuditReport(data, title)
  if ('keyword_clusters' in data || 'quick_wins' in data || 'long_tail' in data || 'branded' in data) return renderKeywordList(data, title)
  if ('brief' in data || 'meta' in data) return renderContentDraftOrArticle(data, title)
  if ('code' in data || 'schema_type' in data) return renderCodeOutput(data, title)
  if ('competitors' in data) return renderCompetitiveReport(data, title)

  // Smart generic handles everything else
  return renderGenericAsReport(data, title)
}

function renderContent(content: OutputContent[] | string | Record<string, unknown>, title: string, deliverableType?: string): React.ReactNode {
  if (content !== null && typeof content === 'object' && !Array.isArray(content)) {
    return renderJsonContent(content as Record<string, unknown>, title, deliverableType)
  }

  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && typeof parsed[0] === 'object' && 'type' in parsed[0]) {
          return renderContentArray(parsed as OutputContent[])
        }
        return renderJsonContent({ items: parsed }, title, deliverableType)
      }
      if (typeof parsed === 'object' && parsed !== null) {
        return renderJsonContent(parsed as Record<string, unknown>, title, deliverableType)
      }
    } catch {
      // Markdown or plain text
      if (MARKDOWN_PATTERN.test(content)) {
        return (
          <div className="report-content max-w-[800px] mx-auto">
            <ReportHeader title={title} />
            <div className="prose prose-sm max-w-none text-[#444] [&>h1]:font-serif [&>h2]:font-serif [&>h3]:font-serif [&>h1]:text-charcoal [&>h2]:text-charcoal [&>h3]:text-charcoal [&>p]:leading-[1.8] [&>p]:mb-3">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )
      }
      return (
        <div className="report-content max-w-[800px] mx-auto">
          <ReportHeader title={title} />
          {content.split('\n\n').map((block, i) => (
            <ReportParagraph key={i}>{block}</ReportParagraph>
          ))}
        </div>
      )
    }
    return <ReportParagraph>{content}</ReportParagraph>
  }

  if (Array.isArray(content)) return renderContentArray(content as OutputContent[])

  return null
}

function renderContentArray(blocks: OutputContent[]): React.ReactNode {
  return blocks.map((block, i) => {
    switch (block.type) {
      case 'heading': {
        const Tag = block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'h4'
        const sizes = { 1: 'text-xl', 2: 'text-lg', 3: 'text-base' }
        return (
          <Tag key={i} className={cn('font-serif text-charcoal font-semibold mt-6 mb-2', sizes[block.level as 1 | 2 | 3] || 'text-base')}>
            {block.text}
          </Tag>
        )
      }
      case 'paragraph':
        return <ReportParagraph key={i}>{block.text}</ReportParagraph>
      case 'list':
        return (
          <ul key={i} className="list-disc list-inside mb-3 space-y-1">
            {block.items?.map((item, j) => (
              <li key={j} className="text-sm text-[#444] leading-relaxed">{item}</li>
            ))}
          </ul>
        )
      case 'table':
        return (
          <div key={i} className="overflow-x-auto mb-4 rounded-tenkai border border-tenkai-border">
            <table className="w-full text-sm">
              {block.headers && (
                <thead>
                  <tr className="bg-cream">
                    {block.headers.map((h, j) => (
                      <th key={j} className="px-3 py-2 text-left font-medium text-charcoal border-b border-tenkai-border">{h}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {block.rows?.map((row, j) => (
                  <tr key={j} className="border-b border-tenkai-border last:border-0">
                    {row.map((cell, k) => (
                      <td key={k} className="px-3 py-2 text-[#444]">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'keyword_link':
        return <KeywordLink key={i} keyword={block.keyword ?? ''} />
      case 'metric':
        return (
          <div key={i} className="inline-flex flex-col bg-cream rounded-tenkai p-3 mb-2 mr-2">
            <span className="text-xs text-warm-gray uppercase tracking-wider">{block.label}</span>
            <span className="font-serif text-lg text-charcoal font-semibold">{block.value}</span>
          </div>
        )
      case 'section_break':
        return <hr key={i} className="border-tenkai-border my-6" />
      default:
        return null
    }
  })
}

/* ═══════════════════════════════════════════════════════════════
   DOWNLOAD HELPERS
   ═══════════════════════════════════════════════════════════════ */

function generatePlainText(data: OutputData): string {
  const lines: string[] = [data.title, '='.repeat(data.title.length), '']

  function flatten(val: unknown, indent = 0): string {
    const pad = '  '.repeat(indent)
    if (val === null || val === undefined) return `${pad}—`
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return `${pad}${val}`
    if (Array.isArray(val)) return val.map((v) => flatten(v, indent)).join('\n')
    if (typeof val === 'object') {
      return Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => `${pad}${formatKey(k)}:\n${flatten(v, indent + 1)}`)
        .join('\n')
    }
    return `${pad}${String(val)}`
  }

  const content = data.content
  if (typeof content === 'string') {
    lines.push(content)
  } else if (Array.isArray(content)) {
    content.forEach((block) => {
      const b = block as OutputContent
      if (b.type === 'heading') lines.push(`\n## ${b.text}`)
      else if (b.type === 'paragraph') lines.push(b.text ?? '')
      else if (b.type === 'list') b.items?.forEach((item) => lines.push(`• ${item}`))
    })
  } else if (content && typeof content === 'object') {
    lines.push(flatten(content))
  }

  return lines.join('\n')
}

function hasCodeContent(data: OutputData): boolean {
  const type = (data.deliverable_type ?? '').toLowerCase()
  return type.includes('article') || type.includes('content_draft') || type.includes('schema')
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function OutputViewer({ data, variant = 'modal', open, onClose, className }: OutputViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  if (variant === 'modal' && !open) return null

  async function handleDownloadPdf() {
    if (!data.id || pdfLoading) return
    setPdfLoading(true)
    try {
      const res = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliverableId: data.id }),
      })
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.title.replace(/\s+/g, '-').toLowerCase()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF download error:', err)
    } finally {
      setPdfLoading(false)
    }
  }

  function handleDownload() {
    const text = generatePlainText(data)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.title.replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadCode() {
    const content = data.content
    let htmlBody = ''
    if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
      const c = content as Record<string, unknown>
      const body = c.body ?? c.content ?? c.sections
      if (typeof body === 'string') htmlBody = body
      else if (Array.isArray(body)) {
        htmlBody = body.map((s) => {
          if (typeof s === 'string') return `<p>${s}</p>`
          const sec = s as Record<string, unknown>
          const h = sec.heading ?? sec.title ?? ''
          const b = sec.content ?? sec.body ?? sec.text ?? ''
          return `${h ? `<h2>${h}</h2>` : ''}${b ? `<p>${b}</p>` : ''}`
        }).join('\n')
      }
    } else if (typeof content === 'string') {
      htmlBody = content
    }
    if (!htmlBody) return

    const meta = typeof content === 'object' && content !== null && !Array.isArray(content)
      ? ((content as Record<string, unknown>).meta as Record<string, unknown>) ?? {}
      : {}
    const metaTitle = meta.meta_title ?? data.title
    const metaDesc = meta.meta_description ?? ''

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metaTitle}</title>
  ${metaDesc ? `<meta name="description" content="${metaDesc}">` : ''}
</head>
<body>
  <article>
    <h1>${metaTitle}</h1>
    ${htmlBody}
  </article>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.title.replace(/\s+/g, '-').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const showCodeDownload = hasCodeContent(data)

  const viewerContent = (
    <div className={cn(
      variant === 'modal'
        ? 'bg-ivory rounded-tenkai-lg shadow-tenkai-lg overflow-hidden flex flex-col'
        : 'bg-ivory rounded-tenkai border border-tenkai-border overflow-hidden',
      variant === 'modal' && (isFullscreen ? 'w-full h-full' : 'w-[80%] max-w-4xl max-h-[90vh]'),
      className
    )}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-tenkai-border bg-cream/50">
        <div className="flex items-center gap-3 min-w-0">
          {data.agent_kanji && (
            <div className="w-8 h-8 rounded-full bg-torii-subtle flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-serif text-torii">{data.agent_kanji}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-charcoal truncate">{data.title}</p>
            {data.agent_name && (
              <p className="text-xs text-warm-gray">
                Prepared by {data.agent_name}
                {data.deliverable_type && ` · ${data.deliverable_type.replace(/_/g, ' ')}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {variant === 'modal' && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-tenkai hover:bg-parchment transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="size-4 text-warm-gray" />
            </button>
          )}
          {data.id && (
            <button
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="p-2 rounded-tenkai hover:bg-parchment transition-colors disabled:opacity-50"
              title="Download PDF report"
            >
              <FileText className={cn('size-4 text-warm-gray', pdfLoading && 'animate-pulse')} />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-2 rounded-tenkai hover:bg-parchment transition-colors"
            title="Download as text"
          >
            <Download className="size-4 text-warm-gray" />
          </button>
          {showCodeDownload && (
            <button
              onClick={handleDownloadCode}
              className="p-2 rounded-tenkai hover:bg-parchment transition-colors"
              title="Download HTML for website"
            >
              <FileDown className="size-4 text-warm-gray" />
            </button>
          )}
          {variant === 'modal' && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-tenkai hover:bg-parchment transition-colors"
            >
              <X className="size-4 text-warm-gray" />
            </button>
          )}
        </div>
      </div>

      {/* Report body */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {renderContent(data.content, data.title, data.deliverable_type)}
      </div>
    </div>
  )

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
          {viewerContent}
        </div>
      </div>
    )
  }

  return viewerContent
}
