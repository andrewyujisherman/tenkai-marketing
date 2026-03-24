'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, ArrowUpRight, BarChart3, Search, Users, TrendingUp, Sparkles, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MetricCard } from '@/components/portal/MetricCard'
import { SimpleChart, StackedBarChart } from '@/components/portal/SimpleChart'
import { OutputViewer } from '@/components/ui/output-viewer'
import { TENKAI_AGENTS } from '@/lib/agents/index'
import type { ReportData, ReportDeliverable } from './page'

const keywordLegend = [
  { name: '#1-3', color: 'bg-torii' },
  { name: '#4-10', color: 'bg-torii-light' },
  { name: '#11-20', color: 'bg-[#D4A574]' },
  { name: '#21-50', color: 'bg-muted-gray' },
  { name: '#51-100', color: 'bg-parchment' },
]

interface TrafficPoint { label: string; value: number }
interface KeywordSegment { value: number; color: string; name: string }
interface KeywordBar { label: string; segments: KeywordSegment[] }
interface ContentRow { title: string; views: number; avgTime: string; bounceRate: string }

interface ReportMetrics {
  organic_traffic?: number
  keyword_rankings?: number
  content_published?: number
  domain_authority?: number
  traffic_data?: TrafficPoint[]
  keyword_distribution?: KeywordBar[]
  content_performance?: ContentRow[]
}

/* ─── Helpers ──────────────────────────────────────────── */
function parseReportContent(content: Record<string, unknown> | string | null | undefined): Record<string, unknown> | null {
  if (!content) return null
  if (typeof content === 'object') return content as Record<string, unknown>
  try { return JSON.parse(content) } catch { return null }
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null
  const cls = score >= 80 ? 'bg-[#4A7C59]/10 text-[#4A7C59]' : score >= 50 ? 'bg-[#C49A3C]/10 text-[#C49A3C]' : 'bg-torii/10 text-torii'
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{score}/100</span>
}

/* ─── Keyword Link Text Detection ──────────────────────── */
/**
 * Detects keywords in text and renders them as torii-red clickable links
 * that navigate to /rankings?keyword=X
 */
function KeywordLinkedText({ text, keywords }: { text: string; keywords: string[] }) {
  const router = useRouter()
  if (!keywords.length || !text) return <>{text}</>

  // Build regex from keywords, longest first to avoid partial matches
  const sorted = [...keywords].sort((a, b) => b.length - a.length)
  const escaped = sorted.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')

  const parts: (string | { keyword: string; index: number })[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push({ keyword: match[0], index: match.index })
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return (
    <>
      {parts.map((part, i) => {
        if (typeof part === 'string') return <span key={i}>{part}</span>
        return (
          <a
            key={`kw-${i}`}
            href={`/rankings?keyword=${encodeURIComponent(part.keyword)}`}
            onClick={(e) => {
              e.preventDefault()
              router.push(`/rankings?keyword=${encodeURIComponent(part.keyword)}`)
            }}
            className="text-torii hover:text-torii-dark font-medium underline underline-offset-2 decoration-torii/40 hover:decoration-torii transition-colors duration-fast cursor-pointer"
          >
            {part.keyword}
          </a>
        )
      })}
    </>
  )
}

/* ─── Report Card (for report list) ────────────────────── */
function ReportCard({ report, onClick }: { report: ReportData; onClick: () => void }) {
  const m = report.metrics as ReportMetrics
  const insights = Array.isArray(report.insights) ? report.insights : []
  const summary = insights.slice(0, 2).join(' ')

  const periodLabel = (() => {
    try {
      const start = new Date(report.period_start)
      const end = new Date(report.period_end)
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } catch {
      return ''
    }
  })()

  const typeLabel = report.type === 'monthly' ? 'Monthly Performance Report' :
                    report.type === 'quarterly' ? 'Quarterly Performance Report' :
                    'Performance Report'

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-ivory rounded-tenkai border border-tenkai-border p-6 shadow-tenkai-sm hover:shadow-tenkai-md transition-all duration-normal cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-base font-semibold text-charcoal group-hover:text-torii transition-colors">
            {typeLabel} {periodLabel && `\u2014 ${periodLabel}`}
          </h3>
          {periodLabel && (
            <p className="text-xs text-muted-gray mt-0.5">{periodLabel}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-torii-subtle flex items-center justify-center">
            <span className="text-xs font-serif text-torii">{TENKAI_AGENTS.yumi.kanji}</span>
          </div>
        </div>
      </div>

      {/* Quick metrics */}
      <div className="flex gap-4 mb-3">
        {m.organic_traffic != null && (
          <div className="text-xs text-warm-gray">
            <span className="font-medium text-charcoal">{m.organic_traffic.toLocaleString()}</span> traffic
          </div>
        )}
        {m.keyword_rankings != null && (
          <div className="text-xs text-warm-gray">
            <span className="font-medium text-charcoal">{m.keyword_rankings}</span> keywords
          </div>
        )}
        {m.content_published != null && (
          <div className="text-xs text-warm-gray">
            <span className="font-medium text-charcoal">{m.content_published}</span> published
          </div>
        )}
      </div>

      {summary && (
        <p className="text-sm text-warm-gray line-clamp-2 leading-relaxed">
          {summary}
        </p>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-tenkai-border-light">
        <span className="text-xs text-muted-gray">By {TENKAI_AGENTS.yumi.name}, {TENKAI_AGENTS.yumi.role}</span>
      </div>
    </button>
  )
}

/* ─── Report Viewer Modal ──────────────────────────────── */
function ReportViewerModal({ report, onClose }: { report: ReportData; onClose: () => void }) {
  const m = report.metrics as ReportMetrics
  const insights = Array.isArray(report.insights) ? report.insights : []
  const recommendations = report.agent_commentary?.recommendations ?? []
  const trafficData: TrafficPoint[] = Array.isArray(m.traffic_data) ? m.traffic_data : []
  const keywordDistribution: KeywordBar[] = Array.isArray(m.keyword_distribution) ? m.keyword_distribution : []
  const contentPerformance: ContentRow[] = Array.isArray(m.content_performance) ? m.content_performance : []

  // Extract all keywords from content performance for keyword linking
  const allKeywords = [
    ...(contentPerformance.map((c) => c.title).filter(Boolean)),
  ]

  const periodLabel = (() => {
    try {
      const start = new Date(report.period_start)
      const end = new Date(report.period_end)
      return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    } catch {
      return ''
    }
  })()

  function exportCSV() {
    const rows: string[][] = []
    rows.push(['Tenkai Marketing Performance Report'])
    rows.push([`Period: ${report.period_start} to ${report.period_end}`])
    rows.push([])
    rows.push(['Key Metrics'])
    rows.push(['Organic Traffic', String(m.organic_traffic ?? 0)])
    rows.push(['Keyword Rankings', String(m.keyword_rankings ?? 0)])
    rows.push(['Content Published', String(m.content_published ?? 0)])
    rows.push(['Domain Authority', String(m.domain_authority ?? 0)])
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-[90%] max-w-4xl max-h-[90vh] bg-ivory rounded-tenkai-lg shadow-tenkai-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tenkai-border bg-cream/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-torii-subtle flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-serif text-torii">{TENKAI_AGENTS.yumi.kanji}</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-lg text-charcoal font-semibold">Performance Report</h2>
              <p className="text-xs text-warm-gray">
                Prepared by {TENKAI_AGENTS.yumi.name}, {TENKAI_AGENTS.yumi.role} &middot; {periodLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 rounded-tenkai">
              <Download className="size-3.5" />
              Export
            </Button>
            <button onClick={onClose} className="p-2 rounded-tenkai hover:bg-parchment transition-colors duration-fast text-warm-gray">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Executive Summary */}
          {insights.length > 0 && (
            <section>
              <h3 className="font-serif text-lg text-charcoal font-semibold mb-3">Executive Summary</h3>
              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <p key={i} className="text-sm text-charcoal/80 leading-relaxed">
                    <KeywordLinkedText text={String(insight)} keywords={allKeywords} />
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Key Metrics */}
          <section>
            <h3 className="font-serif text-lg text-charcoal font-semibold mb-3">Rankings Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard title="Organic Traffic" value={(m.organic_traffic ?? 0).toLocaleString()} change="neutral" changePercent="-" period="this period" detail="Visits from search engines" />
              <MetricCard title="Keyword Rankings" value={String(m.keyword_rankings ?? 0)} change="neutral" changePercent="-" period="this period" detail="Tracked keywords" />
              <MetricCard title="Content Published" value={String(m.content_published ?? 0)} change="neutral" changePercent="-" period="this period" detail="Blog posts published" />
              <MetricCard title="Domain Authority" value={String(m.domain_authority ?? 0)} change="neutral" changePercent="-" period="this period" />
            </div>
          </section>

          {/* Traffic Analysis */}
          {(trafficData.length > 0 || keywordDistribution.length > 0) && (
            <section>
              <h3 className="font-serif text-lg text-charcoal font-semibold mb-3">Traffic Analysis</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trafficData.length > 0 && (
                  <div className="bg-ivory rounded-tenkai border border-tenkai-border p-5">
                    <SimpleChart data={trafficData} title="Traffic Over Time" color="bg-torii" />
                  </div>
                )}
                {keywordDistribution.length > 0 && (
                  <div className="bg-ivory rounded-tenkai border border-tenkai-border p-5">
                    <StackedBarChart data={keywordDistribution} title="Keyword Distribution" legend={keywordLegend} />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Content Performance */}
          {contentPerformance.length > 0 && (
            <section>
              <h3 className="font-serif text-lg text-charcoal font-semibold mb-3">Content Performance</h3>
              <div className="rounded-tenkai border border-tenkai-border bg-ivory overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-tenkai-border bg-cream/50">
                        <th className="text-left px-5 py-3 font-medium text-warm-gray">Post</th>
                        <th className="text-right px-5 py-3 font-medium text-warm-gray">Views</th>
                        <th className="text-right px-5 py-3 font-medium text-warm-gray hidden sm:table-cell">Avg. Time</th>
                        <th className="text-right px-5 py-3 font-medium text-warm-gray hidden sm:table-cell">Bounce Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentPerformance.map((post, i) => (
                        <tr key={i} className="border-b border-tenkai-border/50 last:border-0 hover:bg-parchment/30 transition-colors">
                          <td className="px-5 py-3 text-charcoal font-medium max-w-xs">
                            <KeywordLinkedText text={post.title} keywords={allKeywords} />
                          </td>
                          <td className="px-5 py-3 text-right text-charcoal tabular-nums">{typeof post.views === 'number' ? post.views.toLocaleString() : post.views}</td>
                          <td className="px-5 py-3 text-right text-warm-gray tabular-nums hidden sm:table-cell">{post.avgTime}</td>
                          <td className="px-5 py-3 text-right text-warm-gray tabular-nums hidden sm:table-cell">{post.bounceRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <section>
              <h3 className="font-serif text-lg text-charcoal font-semibold mb-3">Recommendations</h3>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-tenkai bg-parchment/30">
                    <span className="text-torii font-semibold text-sm mt-0.5">{i + 1}.</span>
                    <p className="text-sm text-charcoal/80 leading-relaxed">
                      <KeywordLinkedText text={String(rec)} keywords={allKeywords} />
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tier upgrade banner */}
          <div className="bg-parchment/50 rounded-tenkai border border-tenkai-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-charcoal">Want deeper insights?</p>
              <p className="text-xs text-warm-gray mt-1">
                Pro plans include weekly reports, revenue attribution, and exportable data
              </p>
            </div>
            <a href="mailto:rookbot.mini@gmail.com?subject=Upgrade%20to%20Pro">
              <Button className="bg-torii text-white hover:bg-torii-dark rounded-tenkai text-sm gap-1.5 flex-shrink-0">
                Contact Us to Upgrade
                <ArrowUpRight className="size-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Deliverable Viewer Modal ─────────────────────────── */
function DeliverableViewerModal({ deliverable, onClose }: { deliverable: ReportDeliverable; onClose: () => void }) {
  const parsed = parseReportContent(deliverable.content)

  // Extract keywords from structured content
  const keywords: string[] = []
  if (parsed && Array.isArray(parsed.keywords)) {
    (parsed.keywords as Array<Record<string, unknown>>).forEach((kw) => {
      const term = String(kw.keyword ?? kw.term ?? '')
      if (term) keywords.push(term)
    })
  }

  // Build OutputViewer-compatible content
  const outputContent = deliverable.content
    ? (typeof deliverable.content === 'string' ? deliverable.content : JSON.stringify(deliverable.content, null, 2))
    : ''

  return (
    <OutputViewer
      data={{
        id: deliverable.id,
        title: deliverable.title ?? 'Report',
        content: outputContent,
        agent_name: deliverable.agent_name ?? undefined,
        agent_kanji: deliverable.agent_name
          ? (Object.values(TENKAI_AGENTS).find((a) => a.name.toLowerCase() === deliverable.agent_name?.toLowerCase())?.kanji ?? undefined)
          : undefined,
        deliverable_type: deliverable.deliverable_type ?? undefined,
        status: deliverable.status ?? undefined,
      }}
      variant="modal"
      open={true}
      onClose={onClose}
    />
  )
}

/* ─── Keywords Tab ─────────────────────────────────────── */
function KeywordsTab({ deliverables }: { deliverables: ReportDeliverable[] }) {
  const [sortKey, setSortKey] = useState<'volume' | 'difficulty' | 'keyword'>('volume')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedDeliverable, setSelectedDeliverable] = useState<ReportDeliverable | null>(null)

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

  const allKeywords: Array<{ keyword: string; volume: number; difficulty: number; intent: string; cluster: string }> = []
  deliverables.forEach((d) => {
    const parsed = parseReportContent(d.content)
    if (parsed && Array.isArray(parsed.keywords)) {
      (parsed.keywords as Array<Record<string, unknown>>).forEach((kw) => {
        allKeywords.push({
          keyword: String(kw.keyword ?? kw.term ?? ''),
          volume: Number(kw.volume ?? kw.search_volume ?? 0),
          difficulty: Number(kw.difficulty ?? kw.kd ?? 0),
          intent: String(kw.intent ?? kw.search_intent ?? '-'),
          cluster: String(kw.cluster ?? kw.topic_cluster ?? '-'),
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
    return (
      <>
        <div className="space-y-3">
          {deliverables.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeliverable(d)}
              className="w-full text-left bg-ivory rounded-tenkai border border-tenkai-border p-6 hover:shadow-tenkai-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <Search className="size-4 text-torii" />
                <span className="font-medium text-charcoal">{d.title ?? 'Keyword Research'}</span>
                <ScoreBadge score={d.score} />
              </div>
              {d.summary && <p className="text-sm text-warm-gray leading-relaxed">{d.summary}</p>}
              <span className="text-xs text-muted-gray mt-2 block">
                {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </button>
          ))}
        </div>
        {selectedDeliverable && (
          <DeliverableViewerModal deliverable={selectedDeliverable} onClose={() => setSelectedDeliverable(null)} />
        )}
      </>
    )
  }

  return (
    <>
      <div className="rounded-tenkai border border-tenkai-border bg-ivory overflow-hidden">
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
      {selectedDeliverable && (
        <DeliverableViewerModal deliverable={selectedDeliverable} onClose={() => setSelectedDeliverable(null)} />
      )}
    </>
  )
}

/* ─── Competitors Tab ──────────────────────────────────── */
function CompetitorsTab({ deliverables }: { deliverables: ReportDeliverable[] }) {
  const [selectedDeliverable, setSelectedDeliverable] = useState<ReportDeliverable | null>(null)

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
    <>
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
            <button
              key={d.id}
              onClick={() => setSelectedDeliverable(d)}
              className="text-left bg-ivory rounded-tenkai border border-tenkai-border p-6 hover:shadow-tenkai-md transition-all cursor-pointer"
            >
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
                    {findings.slice(0, 3).map((f, i) => <li key={i} className="text-sm text-warm-gray leading-relaxed">&#8226; {String(f)}</li>)}
                  </ul>
                </div>
              )}
              {gaps.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-charcoal mb-1">Content Gaps</p>
                  <div className="flex flex-wrap gap-1.5">
                    {gaps.slice(0, 4).map((g, i) => <span key={i} className="rounded-full bg-torii/10 text-torii px-2 py-0.5 text-xs">{String(g)}</span>)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#4A7C59] mb-1">Strengths</p>
                    <ul className="space-y-0.5">
                      {strengths.slice(0, 3).map((s, i) => <li key={i} className="text-xs text-warm-gray">{String(s)}</li>)}
                    </ul>
                  </div>
                )}
                {weaknesses.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-torii mb-1">Weaknesses</p>
                    <ul className="space-y-0.5">
                      {weaknesses.slice(0, 3).map((w, i) => <li key={i} className="text-xs text-warm-gray">{String(w)}</li>)}
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
            </button>
          )
        })}
      </div>
      {selectedDeliverable && (
        <DeliverableViewerModal deliverable={selectedDeliverable} onClose={() => setSelectedDeliverable(null)} />
      )}
    </>
  )
}

/* ─── Analytics Tab ────────────────────────────────────── */
function AnalyticsTab({ deliverables }: { deliverables: ReportDeliverable[] }) {
  const [selectedDeliverable, setSelectedDeliverable] = useState<ReportDeliverable | null>(null)

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
    <>
      <div className="space-y-6">
        {deliverables.map((d) => {
          const parsed = parseReportContent(d.content)
          const sessions = parsed?.sessions as number ?? parsed?.total_sessions as number ?? null
          const bounceRate = parsed?.bounce_rate as string ?? parsed?.bounceRate as string ?? null
          const ctr = parsed?.ctr as string ?? parsed?.click_through_rate as string ?? null
          const topPages = Array.isArray(parsed?.top_pages) ? parsed.top_pages as Array<Record<string, unknown>> : []
          const insights = Array.isArray(parsed?.insights) ? parsed.insights as string[] : []

          return (
            <button
              key={d.id}
              onClick={() => setSelectedDeliverable(d)}
              className="w-full text-left space-y-4 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-medium text-charcoal">{d.title ?? 'Analytics Report'}</h3>
                <ScoreBadge score={d.score} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sessions != null && (
                  <div className="bg-ivory rounded-tenkai border border-tenkai-border p-4">
                    <p className="text-xs text-warm-gray mb-1">Sessions</p>
                    <p className="text-lg font-semibold text-charcoal tabular-nums">{typeof sessions === 'number' ? sessions.toLocaleString() : sessions}</p>
                  </div>
                )}
                {bounceRate && (
                  <div className="bg-ivory rounded-tenkai border border-tenkai-border p-4">
                    <p className="text-xs text-warm-gray mb-1">Bounce Rate</p>
                    <p className="text-lg font-semibold text-charcoal tabular-nums">{bounceRate}</p>
                  </div>
                )}
                {ctr && (
                  <div className="bg-ivory rounded-tenkai border border-tenkai-border p-4">
                    <p className="text-xs text-warm-gray mb-1">CTR</p>
                    <p className="text-lg font-semibold text-charcoal tabular-nums">{ctr}</p>
                  </div>
                )}
                {topPages.length > 0 && (
                  <div className="bg-ivory rounded-tenkai border border-tenkai-border p-4">
                    <p className="text-xs text-warm-gray mb-1">Top Pages</p>
                    <p className="text-lg font-semibold text-charcoal tabular-nums">{topPages.length}</p>
                  </div>
                )}
              </div>

              {(insights.length > 0 || d.summary) && (
                <div className="bg-ivory rounded-tenkai border border-tenkai-border p-6">
                  <h4 className="font-serif text-sm font-medium text-charcoal mb-2">Insights</h4>
                  {d.summary && <p className="text-sm text-warm-gray leading-relaxed mb-2">{d.summary}</p>}
                  {insights.length > 0 && (
                    <ul className="space-y-1">
                      {insights.map((ins, i) => <li key={i} className="text-sm text-warm-gray leading-relaxed">&#8226; {String(ins)}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
      {selectedDeliverable && (
        <DeliverableViewerModal deliverable={selectedDeliverable} onClose={() => setSelectedDeliverable(null)} />
      )}
    </>
  )
}

/* ─── AI Visibility Tab ────────────────────────────────── */
function AIVisibilityTab({ deliverables }: { deliverables: ReportDeliverable[] }) {
  const [selectedDeliverable, setSelectedDeliverable] = useState<ReportDeliverable | null>(null)

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
    <>
      <div className="space-y-6">
        {geoReports.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif text-base font-medium text-charcoal">Geographic Targeting</h3>
            {geoReports.map((d) => {
              const parsed = parseReportContent(d.content)
              const hreflangStatus = parsed?.hreflang_status as string ?? parsed?.hreflang as string ?? null
              const regions = Array.isArray(parsed?.regions) ? parsed.regions as Array<Record<string, unknown>> : []
              const recommendations = Array.isArray(parsed?.recommendations) ? parsed.recommendations as string[] : []

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeliverable(d)}
                  className="w-full text-left bg-ivory rounded-tenkai border border-tenkai-border p-6 hover:shadow-tenkai-md transition-all cursor-pointer"
                >
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
                        {recommendations.slice(0, 3).map((rec, i) => <li key={i} className="text-sm text-warm-gray leading-relaxed">&#8226; {String(rec)}</li>)}
                      </ul>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {entityReports.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif text-base font-medium text-charcoal">Entity &amp; Knowledge Graph</h3>
            {entityReports.map((d) => {
              const parsed = parseReportContent(d.content)
              const kgStatus = parsed?.knowledge_graph_status as string ?? parsed?.kg_status as string ?? null
              const entities = Array.isArray(parsed?.entities) ? parsed.entities as Array<Record<string, unknown>> : []
              const recommendations = Array.isArray(parsed?.recommendations) ? parsed.recommendations as string[] : []

              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeliverable(d)}
                  className="w-full text-left bg-ivory rounded-tenkai border border-tenkai-border p-6 hover:shadow-tenkai-md transition-all cursor-pointer"
                >
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
                        {recommendations.slice(0, 3).map((rec, i) => <li key={i} className="text-sm text-warm-gray leading-relaxed">&#8226; {String(rec)}</li>)}
                      </ul>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {geoReports.length === 0 && entityReports.length === 0 && deliverables.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDeliverable(d)}
            className="w-full text-left bg-ivory rounded-tenkai border border-tenkai-border p-6 hover:shadow-tenkai-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4 text-torii" />
              <span className="font-medium text-charcoal">{d.title ?? 'AI Visibility Report'}</span>
              <ScoreBadge score={d.score} />
            </div>
            {d.summary && <p className="text-sm text-warm-gray leading-relaxed">{d.summary}</p>}
            <span className="text-xs text-muted-gray mt-2 block">
              {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </button>
        ))}
      </div>
      {selectedDeliverable && (
        <DeliverableViewerModal deliverable={selectedDeliverable} onClose={() => setSelectedDeliverable(null)} />
      )}
    </>
  )
}

/* ─── Performance Tab (report cards + viewer) ──────────── */
function PerformanceTab({ reports }: { reports: ReportData[] }) {
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-parchment/30 p-16 text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-torii-subtle flex items-center justify-center">
          <span className="text-lg font-serif text-torii">{TENKAI_AGENTS.yumi.kanji}</span>
        </div>
        <div>
          <p className="font-serif text-base font-medium text-charcoal mb-1">Your first report is being prepared</p>
          <p className="text-sm text-warm-gray max-w-sm">
            Yumi is analyzing your SEO data. Starter plans receive monthly reports, Growth bi-monthly, and Pro weekly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} onClick={() => setSelectedReport(report)} />
        ))}
      </div>
      {selectedReport && (
        <ReportViewerModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </>
  )
}

/* ─── Main Component ───────────────────────────────────── */
interface ReportsClientProps {
  reports: ReportData[]
  keywordDeliverables?: ReportDeliverable[]
  competitorDeliverables?: ReportDeliverable[]
  analyticsDeliverables?: ReportDeliverable[]
  aiDeliverables?: ReportDeliverable[]
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
            {reports.length > 0 && (
              <span className="ml-1 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
                {reports.length}
              </span>
            )}
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
