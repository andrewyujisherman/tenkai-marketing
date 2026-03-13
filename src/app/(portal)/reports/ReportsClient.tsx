'use client'

import { useState } from 'react'
import { Download, ArrowUpRight, BarChart3, Search, Users, TrendingUp, Sparkles, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MetricCard } from '@/components/portal/MetricCard'
import { InsightCard } from '@/components/portal/InsightCard'
import { SimpleChart, StackedBarChart } from '@/components/portal/SimpleChart'

const keywordLegend = [
  { name: '#1–3', color: 'bg-torii' },
  { name: '#4–10', color: 'bg-torii-light' },
  { name: '#11–20', color: 'bg-[#D4A574]' },
  { name: '#21–50', color: 'bg-muted-gray' },
  { name: '#51–100', color: 'bg-parchment' },
]

interface TrafficPoint {
  label: string
  value: number
}

interface KeywordSegment {
  value: number
  color: string
  name: string
}

interface KeywordBar {
  label: string
  segments: KeywordSegment[]
}

interface ContentRow {
  title: string
  views: number
  avgTime: string
  bounceRate: string
}

interface ReportMetrics {
  organic_traffic?: number
  keyword_rankings?: number
  content_published?: number
  domain_authority?: number
  traffic_data?: TrafficPoint[]
  keyword_distribution?: KeywordBar[]
  content_performance?: ContentRow[]
}

export interface ReportData {
  id: string
  type: string
  period_start: string
  period_end: string
  metrics: ReportMetrics
  insights: string[]
  agent_commentary: { recommendations: string[] }
}

export interface ReportDeliverable {
  id: string
  agent_name: string | null
  deliverable_type: string | null
  title: string | null
  summary: string | null
  score: number | null
  status: string | null
  content: Record<string, unknown> | string | null
  created_at: string
}

interface ReportsClientProps {
  reports: ReportData[]
  keywordDeliverables?: ReportDeliverable[]
  competitorDeliverables?: ReportDeliverable[]
  analyticsDeliverables?: ReportDeliverable[]
  aiDeliverables?: ReportDeliverable[]
}

/* ─── Helper: safely parse content JSON ─────────────────── */
function parseReportContent(content: Record<string, unknown> | string | null | undefined): Record<string, unknown> | null {
  if (!content) return null
  if (typeof content === 'object') return content as Record<string, unknown>
  try { return JSON.parse(content) } catch { return null }
}

/* ─── Score badge helper ────────────────────────────────── */
function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null
  const cls = score >= 80 ? 'bg-[#4A7C59]/10 text-[#4A7C59]' : score >= 50 ? 'bg-[#C49A3C]/10 text-[#C49A3C]' : 'bg-torii/10 text-torii'
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{score}/100</span>
}

function ReportView({ report }: { report: ReportData }) {
  const m = report.metrics ?? {}
  const insights = Array.isArray(report.insights) ? report.insights : []
  const recommendations = report.agent_commentary?.recommendations ?? []
  const trafficData: TrafficPoint[] = Array.isArray(m.traffic_data) ? m.traffic_data : []
  const keywordDistribution: KeywordBar[] = Array.isArray(m.keyword_distribution)
    ? m.keyword_distribution
    : []
  const contentPerformance: ContentRow[] = Array.isArray(m.content_performance)
    ? m.content_performance
    : []

  return (
    <div className="space-y-8 mt-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Organic Traffic"
          value={(m.organic_traffic ?? 0).toLocaleString()}
          change="up"
          changePercent="+15%"
          period="vs prior period"
          detail="Visits from search engines"
        />
        <MetricCard
          title="Keyword Rankings"
          value={String(m.keyword_rankings ?? 0)}
          change="up"
          changePercent="12 improved"
          period="3 declined"
          detail="Tracked keywords"
        />
        <MetricCard
          title="Content Published"
          value={String(m.content_published ?? 0)}
          change="neutral"
          changePercent="avg 1,200 words"
          period="This period"
          detail="Blog posts published"
        />
        <MetricCard
          title="Domain Authority"
          value={String(m.domain_authority ?? 0)}
          change="up"
          changePercent="+2"
          period="vs last month"
        />
      </div>

      {/* "So What" Insights */}
      {(insights.length > 0 || recommendations.length > 0) && (
        <InsightCard
          agentName="Aiko"
          agentIcon="🌸"
          title="Here's what matters this month"
          insights={insights}
          recommendations={recommendations}
        />
      )}

      {/* Charts */}
      {(trafficData.length > 0 || keywordDistribution.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trafficData.length > 0 && (
            <div className="bg-white rounded-tenkai border border-tenkai-border p-5">
              <SimpleChart data={trafficData} title="Traffic Over Time" color="bg-torii" />
            </div>
          )}
          {keywordDistribution.length > 0 && (
            <div className="bg-white rounded-tenkai border border-tenkai-border p-5">
              <StackedBarChart
                data={keywordDistribution}
                title="Keyword Distribution"
                legend={keywordLegend}
              />
            </div>
          )}
        </div>
      )}

      {/* Content Performance Table */}
      {contentPerformance.length > 0 && (
        <div className="bg-white rounded-tenkai border border-tenkai-border overflow-hidden">
          <div className="px-5 py-4 border-b border-tenkai-border">
            <h3 className="font-serif text-lg text-charcoal">Content Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-tenkai-border bg-cream/50">
                  <th className="text-left px-5 py-3 font-medium text-warm-gray">Post</th>
                  <th className="text-right px-5 py-3 font-medium text-warm-gray">Views</th>
                  <th className="text-right px-5 py-3 font-medium text-warm-gray hidden sm:table-cell">
                    Avg. Time
                  </th>
                  <th className="text-right px-5 py-3 font-medium text-warm-gray hidden sm:table-cell">
                    Bounce Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {contentPerformance.map((post, i) => (
                  <tr
                    key={i}
                    className="border-b border-tenkai-border/50 last:border-0 hover:bg-parchment/30 transition-colors"
                  >
                    <td className="px-5 py-3 text-charcoal font-medium max-w-xs truncate">
                      {post.title}
                    </td>
                    <td className="px-5 py-3 text-right text-charcoal tabular-nums">
                      {typeof post.views === 'number' ? post.views.toLocaleString() : post.views}
                    </td>
                    <td className="px-5 py-3 text-right text-warm-gray tabular-nums hidden sm:table-cell">
                      {post.avgTime}
                    </td>
                    <td className="px-5 py-3 text-right text-warm-gray tabular-nums hidden sm:table-cell">
                      {post.bounceRate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tier Upgrade Banner */}
      <div className="bg-parchment/50 rounded-tenkai border border-tenkai-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-charcoal">Upgrade to Pro for deeper insights</p>
          <p className="text-xs text-warm-gray mt-1">
            Weekly reports, revenue attribution, and exportable data
          </p>
        </div>
        <a href="/settings?tab=billing">
          <Button className="bg-torii text-white hover:bg-torii-dark rounded-tenkai text-sm gap-1.5 flex-shrink-0">
            Upgrade to Pro
            <ArrowUpRight className="size-3.5" />
          </Button>
        </a>
      </div>
    </div>
  )
}

function exportReportCSV(report: ReportData) {
  const rows: string[][] = []
  const m = report.metrics ?? {}

  rows.push(['Tenkai Marketing — Performance Report'])
  rows.push([`Period: ${report.period_start} to ${report.period_end}`])
  rows.push([])
  rows.push(['Key Metrics'])
  rows.push(['Organic Traffic', String(m.organic_traffic ?? 0)])
  rows.push(['Keyword Rankings', String(m.keyword_rankings ?? 0)])
  rows.push(['Content Published', String(m.content_published ?? 0)])
  rows.push(['Domain Authority', String(m.domain_authority ?? 0)])

  const contentPerformance = Array.isArray(m.content_performance) ? m.content_performance : []
  if (contentPerformance.length > 0) {
    rows.push([])
    rows.push(['Content Performance'])
    rows.push(['Post', 'Views', 'Avg Time', 'Bounce Rate'])
    contentPerformance.forEach((row) => {
      rows.push([row.title, String(row.views), row.avgTime, row.bounceRate])
    })
  }

  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tenkai-report-${report.period_start}-${report.period_end}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/* ─── Keywords Tab ──────────────────────────────────────── */
function KeywordsTab({ deliverables }: { deliverables: ReportDeliverable[] }) {
  const [sortKey, setSortKey] = useState<'volume' | 'difficulty' | 'keyword'>('volume')
  const [sortAsc, setSortAsc] = useState(false)

  if (deliverables.length === 0) {
    return (
      <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
        <Search className="size-8 text-muted-gray mx-auto mb-3" />
        <p className="font-serif text-base font-medium text-charcoal mb-1">No keyword research yet</p>
        <p className="text-sm text-warm-gray max-w-sm mx-auto">
          Request Keyword Opportunities from your Dashboard.
        </p>
      </div>
    )
  }

  // Extract keyword rows from all deliverables
  const allKeywords: Array<{ keyword: string; volume: number; difficulty: number; intent: string; cluster: string }> = []
  deliverables.forEach((d) => {
    const parsed = parseReportContent(d.content)
    if (parsed && Array.isArray(parsed.keywords)) {
      (parsed.keywords as Array<Record<string, unknown>>).forEach((kw) => {
        allKeywords.push({
          keyword: String(kw.keyword ?? kw.term ?? ''),
          volume: Number(kw.volume ?? kw.search_volume ?? 0),
          difficulty: Number(kw.difficulty ?? kw.kd ?? 0),
          intent: String(kw.intent ?? kw.search_intent ?? '—'),
          cluster: String(kw.cluster ?? kw.topic_cluster ?? '—'),
        })
      })
    }
  })

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  const sorted = [...allKeywords].sort((a, b) => {
    const mul = sortAsc ? 1 : -1
    if (sortKey === 'keyword') return mul * a.keyword.localeCompare(b.keyword)
    return mul * ((a[sortKey] ?? 0) - (b[sortKey] ?? 0))
  })

  const isQuickWin = (kw: typeof allKeywords[0]) => kw.difficulty <= 30 && kw.volume >= 100

  if (sorted.length === 0) {
    // Fallback: show deliverable cards
    return (
      <div className="space-y-3">
        {deliverables.map((d) => (
          <div key={d.id} className="bg-white rounded-tenkai border border-tenkai-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <Search className="size-4 text-torii" />
              <span className="font-medium text-charcoal">{d.title ?? 'Keyword Research'}</span>
              <ScoreBadge score={d.score} />
            </div>
            {d.summary && <p className="text-sm text-warm-gray leading-relaxed">{d.summary}</p>}
            <span className="text-xs text-muted-gray mt-2 block">
              {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-tenkai border border-tenkai-border bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-tenkai-border bg-parchment/50">
            <th className="text-left py-3 px-4 font-medium text-warm-gray cursor-pointer select-none" onClick={() => toggleSort('keyword')}>
              <span className="inline-flex items-center gap-1">Keyword <ArrowUpDown className="size-3" /></span>
            </th>
            <th className="text-right py-3 px-4 font-medium text-warm-gray cursor-pointer select-none" onClick={() => toggleSort('volume')}>
              <span className="inline-flex items-center gap-1 justify-end">Volume <ArrowUpDown className="size-3" /></span>
            </th>
            <th className="text-right py-3 px-4 font-medium text-warm-gray cursor-pointer select-none hidden sm:table-cell" onClick={() => toggleSort('difficulty')}>
              <span className="inline-flex items-center gap-1 justify-end">Difficulty <ArrowUpDown className="size-3" /></span>
            </th>
            <th className="text-left py-3 px-4 font-medium text-warm-gray hidden md:table-cell">Intent</th>
            <th className="text-left py-3 px-4 font-medium text-warm-gray hidden lg:table-cell">Cluster</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((kw, i) => (
            <tr key={i} className={`border-b border-tenkai-border-light last:border-none hover:bg-parchment/30 transition-colors ${isQuickWin(kw) ? 'bg-[#4A7C59]/5' : ''}`}>
              <td className="py-3 px-4 font-medium text-charcoal">
                {kw.keyword}
                {isQuickWin(kw) && <span className="ml-2 rounded-full bg-[#4A7C59]/10 text-[#4A7C59] px-1.5 py-0.5 text-[10px] font-semibold">Quick Win</span>}
              </td>
              <td className="py-3 px-4 text-right text-charcoal tabular-nums">{kw.volume.toLocaleString()}</td>
              <td className="py-3 px-4 text-right hidden sm:table-cell">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  kw.difficulty <= 30 ? 'bg-[#4A7C59]/10 text-[#4A7C59]' : kw.difficulty <= 60 ? 'bg-[#C49A3C]/10 text-[#C49A3C]' : 'bg-torii/10 text-torii'
                }`}>{kw.difficulty}</span>
              </td>
              <td className="py-3 px-4 text-warm-gray hidden md:table-cell capitalize">{kw.intent}</td>
              <td className="py-3 px-4 text-warm-gray hidden lg:table-cell">{kw.cluster}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Competitors Tab ───────────────────────────────────── */
function CompetitorsTab({ deliverables }: { deliverables: ReportDeliverable[] }) {
  if (deliverables.length === 0) {
    return (
      <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
        <Users className="size-8 text-muted-gray mx-auto mb-3" />
        <p className="font-serif text-base font-medium text-charcoal mb-1">No competitor analysis yet</p>
        <p className="text-sm text-warm-gray max-w-sm mx-auto">
          Request Competitor Insights from your Dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {deliverables.map((d) => {
        const parsed = parseReportContent(d.content)
        const competitor = parsed?.competitor_name as string ?? parsed?.domain as string ?? d.title ?? 'Competitor'
        const domain = parsed?.domain as string ?? ''
        const findings = Array.isArray(parsed?.key_findings) ? parsed.key_findings as string[] : []
        const gaps = Array.isArray(parsed?.content_gaps) ? parsed.content_gaps as string[] : []
        const strengths = Array.isArray(parsed?.strengths) ? parsed.strengths as string[] : []
        const weaknesses = Array.isArray(parsed?.weaknesses) ? parsed.weaknesses as string[] : []

        return (
          <div key={d.id} className="bg-white rounded-tenkai border border-tenkai-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="size-4 text-torii shrink-0" />
              <h3 className="font-serif text-base font-medium text-charcoal">{competitor}</h3>
              <ScoreBadge score={d.score} />
            </div>
            {domain && <p className="text-xs text-muted-gray mb-3">{domain}</p>}
            {d.summary && <p className="text-sm text-warm-gray leading-relaxed mb-3">{d.summary}</p>}

            {findings.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-charcoal mb-1">Key Findings</p>
                <ul className="space-y-1">
                  {findings.map((f, i) => <li key={i} className="text-sm text-warm-gray leading-relaxed">&#8226; {String(f)}</li>)}
                </ul>
              </div>
            )}
            {gaps.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-charcoal mb-1">Content Gaps</p>
                <div className="flex flex-wrap gap-1.5">
                  {gaps.map((g, i) => <span key={i} className="rounded-full bg-torii/10 text-torii px-2 py-0.5 text-xs">{String(g)}</span>)}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {strengths.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-[#4A7C59] mb-1">Strengths</p>
                  <ul className="space-y-0.5">
                    {strengths.map((s, i) => <li key={i} className="text-xs text-warm-gray">{String(s)}</li>)}
                  </ul>
                </div>
              )}
              {weaknesses.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-torii mb-1">Weaknesses</p>
                  <ul className="space-y-0.5">
                    {weaknesses.map((w, i) => <li key={i} className="text-xs text-warm-gray">{String(w)}</li>)}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-tenkai-border-light">
              {d.agent_name && <span className="text-xs text-muted-gray">By {d.agent_name}</span>}
              <span className="text-xs text-muted-gray">
                {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Analytics Tab ─────────────────────────────────────── */
function AnalyticsTab({ deliverables }: { deliverables: ReportDeliverable[] }) {
  if (deliverables.length === 0) {
    return (
      <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
        <TrendingUp className="size-8 text-muted-gray mx-auto mb-3" />
        <p className="font-serif text-base font-medium text-charcoal mb-1">No analytics review yet</p>
        <p className="text-sm text-warm-gray max-w-sm mx-auto">
          Request an Analytics Review from your Dashboard.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {deliverables.map((d) => {
        const parsed = parseReportContent(d.content)
        const sessions = parsed?.sessions as number ?? parsed?.total_sessions as number ?? null
        const bounceRate = parsed?.bounce_rate as string ?? parsed?.bounceRate as string ?? null
        const ctr = parsed?.ctr as string ?? parsed?.click_through_rate as string ?? null
        const topPages = Array.isArray(parsed?.top_pages) ? parsed.top_pages as Array<Record<string, unknown>> : []
        const insights = Array.isArray(parsed?.insights) ? parsed.insights as string[] : []

        return (
          <div key={d.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-medium text-charcoal">{d.title ?? 'Analytics Report'}</h3>
              <ScoreBadge score={d.score} />
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sessions != null && (
                <div className="bg-white rounded-tenkai border border-tenkai-border p-4">
                  <p className="text-xs text-warm-gray mb-1">Sessions</p>
                  <p className="text-lg font-semibold text-charcoal tabular-nums">{typeof sessions === 'number' ? sessions.toLocaleString() : sessions}</p>
                </div>
              )}
              {bounceRate && (
                <div className="bg-white rounded-tenkai border border-tenkai-border p-4">
                  <p className="text-xs text-warm-gray mb-1">Bounce Rate</p>
                  <p className="text-lg font-semibold text-charcoal tabular-nums">{bounceRate}</p>
                </div>
              )}
              {ctr && (
                <div className="bg-white rounded-tenkai border border-tenkai-border p-4">
                  <p className="text-xs text-warm-gray mb-1">CTR</p>
                  <p className="text-lg font-semibold text-charcoal tabular-nums">{ctr}</p>
                </div>
              )}
              {topPages.length > 0 && (
                <div className="bg-white rounded-tenkai border border-tenkai-border p-4">
                  <p className="text-xs text-warm-gray mb-1">Top Pages</p>
                  <p className="text-lg font-semibold text-charcoal tabular-nums">{topPages.length}</p>
                </div>
              )}
            </div>

            {/* Top pages table */}
            {topPages.length > 0 && (
              <div className="rounded-tenkai border border-tenkai-border bg-white overflow-hidden">
                <div className="px-5 py-3 border-b border-tenkai-border bg-parchment/50">
                  <h4 className="text-sm font-medium text-warm-gray">Top Pages</h4>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {topPages.slice(0, 10).map((page, i) => (
                      <tr key={i} className="border-b border-tenkai-border-light last:border-none hover:bg-parchment/30 transition-colors">
                        <td className="py-2.5 px-5 font-medium text-charcoal max-w-xs truncate">
                          {String(page.url ?? page.page ?? page.title ?? `Page ${i + 1}`)}
                        </td>
                        <td className="py-2.5 px-5 text-right text-warm-gray tabular-nums">
                          {page.views ? Number(page.views).toLocaleString() : '—'} views
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Insights */}
            {(insights.length > 0 || d.summary) && (
              <div className="bg-white rounded-tenkai border border-tenkai-border p-6">
                <h4 className="font-serif text-sm font-medium text-charcoal mb-2">Insights</h4>
                {d.summary && <p className="text-sm text-warm-gray leading-relaxed mb-2">{d.summary}</p>}
                {insights.length > 0 && (
                  <ul className="space-y-1">
                    {insights.map((ins, i) => <li key={i} className="text-sm text-warm-gray leading-relaxed">&#8226; {String(ins)}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── AI Visibility Tab ─────────────────────────────────── */
function AIVisibilityTab({ deliverables }: { deliverables: ReportDeliverable[] }) {
  if (deliverables.length === 0) {
    return (
      <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
        <Sparkles className="size-8 text-muted-gray mx-auto mb-3" />
        <p className="font-serif text-base font-medium text-charcoal mb-1">No AI visibility analysis yet</p>
        <p className="text-sm text-warm-gray max-w-sm mx-auto">
          Request an AI Search Visibility check from your Dashboard.
        </p>
      </div>
    )
  }

  const geoReports = deliverables.filter((d) => d.deliverable_type === 'geo_report')
  const entityReports = deliverables.filter((d) => d.deliverable_type === 'entity_report')

  return (
    <div className="space-y-6">
      {/* Geographic Targeting */}
      {geoReports.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-base font-medium text-charcoal">Geographic Targeting</h3>
          {geoReports.map((d) => {
            const parsed = parseReportContent(d.content)
            const hreflangStatus = parsed?.hreflang_status as string ?? parsed?.hreflang as string ?? null
            const regions = Array.isArray(parsed?.regions) ? parsed.regions as Array<Record<string, unknown>> : []
            const recommendations = Array.isArray(parsed?.recommendations) ? parsed.recommendations as string[] : []

            return (
              <div key={d.id} className="bg-white rounded-tenkai border border-tenkai-border p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium text-charcoal">{d.title ?? 'Geographic Report'}</span>
                  <ScoreBadge score={d.score} />
                </div>
                {d.summary && <p className="text-sm text-warm-gray leading-relaxed mb-3">{d.summary}</p>}
                {hreflangStatus && (
                  <div className="mb-3">
                    <span className="text-xs font-medium text-charcoal">Hreflang Status: </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      hreflangStatus.toLowerCase().includes('valid') || hreflangStatus.toLowerCase().includes('pass')
                        ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                        : 'bg-[#C49A3C]/10 text-[#C49A3C]'
                    }`}>{hreflangStatus}</span>
                  </div>
                )}
                {regions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {regions.map((r, i) => (
                      <span key={i} className="rounded-full bg-parchment px-2.5 py-1 text-xs text-charcoal">
                        {String(r.name ?? r.region ?? r.country ?? `Region ${i + 1}`)}
                      </span>
                    ))}
                  </div>
                )}
                {recommendations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-charcoal mb-1">Recommendations</p>
                    <ul className="space-y-1">
                      {recommendations.map((rec, i) => <li key={i} className="text-sm text-warm-gray leading-relaxed">&#8226; {String(rec)}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Entity Optimization */}
      {entityReports.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-serif text-base font-medium text-charcoal">Entity &amp; Knowledge Graph</h3>
          {entityReports.map((d) => {
            const parsed = parseReportContent(d.content)
            const kgStatus = parsed?.knowledge_graph_status as string ?? parsed?.kg_status as string ?? null
            const entities = Array.isArray(parsed?.entities) ? parsed.entities as Array<Record<string, unknown>> : []
            const recommendations = Array.isArray(parsed?.recommendations) ? parsed.recommendations as string[] : []

            return (
              <div key={d.id} className="bg-white rounded-tenkai border border-tenkai-border p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="size-4 text-torii" />
                  <span className="font-medium text-charcoal">{d.title ?? 'Entity Report'}</span>
                  <ScoreBadge score={d.score} />
                </div>
                {d.summary && <p className="text-sm text-warm-gray leading-relaxed mb-3">{d.summary}</p>}
                {kgStatus && (
                  <div className="mb-3">
                    <span className="text-xs font-medium text-charcoal">Knowledge Graph: </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      kgStatus.toLowerCase().includes('active') || kgStatus.toLowerCase().includes('present')
                        ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                        : 'bg-[#C49A3C]/10 text-[#C49A3C]'
                    }`}>{kgStatus}</span>
                  </div>
                )}
                {entities.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-charcoal mb-1">Entities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {entities.map((e, i) => (
                        <span key={i} className="rounded-full bg-parchment px-2.5 py-1 text-xs text-charcoal">
                          {String(e.name ?? e.entity ?? `Entity ${i + 1}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {recommendations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-charcoal mb-1">Recommendations</p>
                    <ul className="space-y-1">
                      {recommendations.map((rec, i) => <li key={i} className="text-sm text-warm-gray leading-relaxed">&#8226; {String(rec)}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Fallback for unstructured deliverables */}
      {geoReports.length === 0 && entityReports.length === 0 && deliverables.map((d) => (
        <div key={d.id} className="bg-white rounded-tenkai border border-tenkai-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-torii" />
            <span className="font-medium text-charcoal">{d.title ?? 'AI Visibility Report'}</span>
            <ScoreBadge score={d.score} />
          </div>
          {d.summary && <p className="text-sm text-warm-gray leading-relaxed">{d.summary}</p>}
          <span className="text-xs text-muted-gray mt-2 block">
            {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Performance Tab (original reports view) ───────────── */
function PerformanceTab({ reports }: { reports: ReportData[] }) {
  const [period, setPeriod] = useState('30d')

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
        <BarChart3 className="size-12 text-muted-gray" />
        <div>
          <p className="font-medium text-charcoal">No reports yet</p>
          <p className="text-sm text-warm-gray mt-1 max-w-sm">
            Your first performance report will be generated after your content goes live.
          </p>
        </div>
      </div>
    )
  }

  const filteredReports = reports.filter((r) => {
    if (period === '30d') return r.type === 'monthly'
    if (period === '3m') return r.type === 'quarterly'
    return true
  })
  const activeReport = filteredReports[0] ?? reports[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="30d" onValueChange={(val) => setPeriod(val as string)}>
          <TabsList className="bg-parchment/60 border border-tenkai-border rounded-tenkai">
            <TabsTrigger value="30d" className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray">
              Last 30 Days
            </TabsTrigger>
            <TabsTrigger value="3m" className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray">
              Last 3 Months
            </TabsTrigger>
            <TabsTrigger value="6m" className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray">
              Last 6 Months
            </TabsTrigger>
          </TabsList>

          <TabsContent value="30d">
            {activeReport ? <ReportView report={activeReport} /> : <p className="text-sm text-warm-gray mt-6">No monthly report available.</p>}
          </TabsContent>
          <TabsContent value="3m">
            {activeReport ? <ReportView report={activeReport} /> : <p className="text-sm text-warm-gray mt-6">No quarterly report available.</p>}
          </TabsContent>
          <TabsContent value="6m">
            {activeReport ? <ReportView report={activeReport} /> : <p className="text-sm text-warm-gray mt-6">No reports available for this period.</p>}
          </TabsContent>
        </Tabs>
      </div>
      {activeReport && (
        <Button
          variant="outline"
          className="border-tenkai-border text-charcoal hover:bg-parchment rounded-tenkai gap-2"
          onClick={() => exportReportCSV(activeReport)}
        >
          <Download className="size-4" />
          Export Report
        </Button>
      )}
    </div>
  )
}

export default function ReportsClient({ reports, keywordDeliverables = [], competitorDeliverables = [], analyticsDeliverables = [], aiDeliverables = [] }: ReportsClientProps) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Reports &amp; Insights</h1>
        <p className="text-sm text-warm-gray mt-1">
          Track your SEO progress, keyword opportunities, competitor landscape, and AI visibility
        </p>
      </div>

      {/* Top-level tab bar */}
      <Tabs defaultValue="performance">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="performance" className="gap-1.5">
            <BarChart3 className="size-3.5" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="keywords" className="gap-1.5">
            <Search className="size-3.5" />
            Keywords
            {keywordDeliverables.length > 0 && (
              <span className="ml-1 rounded-full bg-[#5B7B9A]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B7B9A]">
                {keywordDeliverables.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="competitors" className="gap-1.5">
            <Users className="size-3.5" />
            Competitors
            {competitorDeliverables.length > 0 && (
              <span className="ml-1 rounded-full bg-[#5B7B9A]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B7B9A]">
                {competitorDeliverables.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <TrendingUp className="size-3.5" />
            Analytics
            {analyticsDeliverables.length > 0 && (
              <span className="ml-1 rounded-full bg-[#5B7B9A]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B7B9A]">
                {analyticsDeliverables.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="ai-visibility" className="gap-1.5">
            <Sparkles className="size-3.5" />
            AI Visibility
            {aiDeliverables.length > 0 && (
              <span className="ml-1 rounded-full bg-[#5B7B9A]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#5B7B9A]">
                {aiDeliverables.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceTab reports={reports} />
        </TabsContent>

        <TabsContent value="keywords">
          <KeywordsTab deliverables={keywordDeliverables} />
        </TabsContent>

        <TabsContent value="competitors">
          <CompetitorsTab deliverables={competitorDeliverables} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab deliverables={analyticsDeliverables} />
        </TabsContent>

        <TabsContent value="ai-visibility">
          <AIVisibilityTab deliverables={aiDeliverables} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
