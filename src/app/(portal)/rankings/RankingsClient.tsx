'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { MetricCard } from '@/components/ui/metric-card'
import { OutputViewer } from '@/components/ui/output-viewer'
import { ApprovalForm } from '@/components/ui/approval-form'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
} from 'lucide-react'

/* ─── Types ───────────────────────────────────────────────── */
interface OverviewData {
  avg_position: number
  total_keywords: number
  improving: number
  declining: number
  period: string
}

interface KeywordData {
  keyword: string
  position: number
  change: number
  trend: number[]
  page_url: string
  recommendation: string
}

interface StrategyDeliverable {
  id: string
  title: string | null
  content: string | null
  summary: string | null
  agent_name: string | null
  status: string | null
  created_at: string
}

interface RankingsClientProps {
  overview: OverviewData
  keywords: KeywordData[]
  totalKeywords: number
  strategy: StrategyDeliverable | null
  clientTier: string
  hasData: boolean
}

type SortField = 'keyword' | 'position' | 'change'
type SortDir = 'asc' | 'desc'

/* ─── Sparkline ───────────────────────────────────────────── */
function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 64
  const h = 20
  const step = w / (data.length - 1)

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ')

  const isImproving = data[data.length - 1] < data[0] // lower position = better

  return (
    <svg width={w} height={h} className={cn('inline-block', className)} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={points}
        fill="none"
        stroke={isImproving ? '#4CAF50' : '#D32F2F'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ─── Change Arrow ────────────────────────────────────────── */
function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-success text-sm font-medium">
        <ArrowUp className="size-3.5" />
        {Math.abs(change)}
      </span>
    )
  }
  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-error text-sm font-medium">
        <ArrowDown className="size-3.5" />
        {Math.abs(change)}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-warm-gray text-sm">
      <Minus className="size-3.5" />
      0
    </span>
  )
}

/* ─── Empty State ─────────────────────────────────────────── */
export function RankingsEmptyState() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">My Rankings</h1>
        <p className="text-sm text-warm-gray mt-1">
          Keyword performance, ranking trends, and strategy recommendations
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-ivory p-16 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-torii-subtle flex items-center justify-center">
          <span className="text-2xl font-serif text-torii">春樹</span>
        </div>
        <div>
          <p className="font-medium text-charcoal">Your team is researching your market</p>
          <p className="text-sm text-warm-gray mt-1 max-w-sm">
            Haruki is building your keyword strategy. Check back soon!
          </p>
        </div>
        <a
          href="/settings#integrations"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-torii hover:text-torii-dark transition-colors"
        >
          Connect Google Search Console to track your rankings →
        </a>
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────── */
export default function RankingsClient({
  overview,
  keywords: initialKeywords,
  totalKeywords,
  strategy,
  clientTier,
  hasData,
}: RankingsClientProps) {
  const searchParams = useSearchParams()
  const filterKeyword = searchParams.get('keyword') ?? ''

  const [sortField, setSortField] = useState<SortField>('position')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(filterKeyword)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [strategyViewerOpen, setStrategyViewerOpen] = useState(false)

  // Auto-expand keyword from URL param
  useEffect(() => {
    if (filterKeyword) {
      setSearchQuery(filterKeyword)
      const match = initialKeywords.find(
        (k) => k.keyword.toLowerCase() === filterKeyword.toLowerCase()
      )
      if (match) {
        setExpandedRow(match.keyword)
      }
    }
  }, [filterKeyword, initialKeywords])

  // Sort & filter
  const displayKeywords = useMemo(() => {
    let filtered = initialKeywords
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = initialKeywords.filter((k) => k.keyword.toLowerCase().includes(q))
    }

    return [...filtered].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortField === 'keyword') return a.keyword.localeCompare(b.keyword) * dir
      if (sortField === 'position') return (a.position - b.position) * dir
      return (a.change - b.change) * dir
    })
  }, [initialKeywords, searchQuery, sortField, sortDir])

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir(field === 'keyword' ? 'asc' : 'desc')
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return null
    return sortDir === 'asc' ? (
      <ChevronUp className="size-3 inline ml-0.5" />
    ) : (
      <ChevronDown className="size-3 inline ml-0.5" />
    )
  }

  async function handleApproval(action: 'approve' | 'edit' | 'deny', feedback?: string) {
    if (!strategy) return
    setApprovalLoading(true)
    try {
      await fetch(`/api/content/${strategy.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
    } catch {
      // handled by toast in parent
    }
    setApprovalLoading(false)
  }

  if (!hasData) return <RankingsEmptyState />

  const showApproval = strategy && (clientTier === 'growth' || clientTier === 'pro')

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">My Rankings</h1>
        <p className="text-sm text-warm-gray mt-1">
          Keyword performance, ranking trends, and strategy recommendations
        </p>
      </div>

      {/* Overview metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          name="Avg Position"
          value={overview.avg_position > 0 ? overview.avg_position.toString() : '--'}
          tooltip="Average Position: Where your website appears in Google search results on average. Lower is better — position 1 means you're the first result."
          period={overview.period}
        />
        <MetricCard
          name="Keywords Tracked"
          value={overview.total_keywords > 0 ? overview.total_keywords.toString() : '--'}
          tooltip="Keywords Tracked: The total number of search terms we're monitoring for your website."
          period={overview.period}
        />
        <MetricCard
          name="Improving"
          value={overview.improving > 0 ? overview.improving.toString() : '--'}
          trend={overview.improving > 0 ? 'up' : 'neutral'}
          tooltip="Improving: Keywords that have moved to a better (higher) position in search results since last check."
          period={overview.period}
        />
        <MetricCard
          name="Declining"
          value={overview.declining > 0 ? overview.declining.toString() : '--'}
          trend={overview.declining > 0 ? 'down' : 'neutral'}
          tooltip="Declining: Keywords that have dropped to a lower position in search results since last check."
          period={overview.period}
        />
      </div>

      {/* Keyword Table */}
      <div className="rounded-tenkai border border-tenkai-border bg-ivory overflow-hidden">
        {/* Table header with search */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-tenkai-border bg-cream/50">
          <h2 className="font-serif text-lg font-semibold text-charcoal">Keyword Performance</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-warm-gray" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keywords..."
              className="pl-9 pr-3 py-1.5 text-sm rounded-tenkai border border-tenkai-border bg-ivory text-charcoal placeholder:text-muted-gray focus:outline-none focus:ring-2 focus:ring-torii/20 w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" style={{ minWidth: '600px' }}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort('keyword')}
                  className="px-3 py-2.5 text-left text-[11px] uppercase tracking-[0.5px] font-semibold text-warm-gray border-b-2 border-tenkai-border cursor-pointer hover:text-torii transition-colors select-none"
                >
                  Keyword <SortIcon field="keyword" />
                </th>
                <th
                  onClick={() => handleSort('position')}
                  className="px-3 py-2.5 text-left text-[11px] uppercase tracking-[0.5px] font-semibold text-warm-gray border-b-2 border-tenkai-border cursor-pointer hover:text-torii transition-colors select-none w-28"
                >
                  Position <SortIcon field="position" />
                </th>
                <th
                  onClick={() => handleSort('change')}
                  className="px-3 py-2.5 text-left text-[11px] uppercase tracking-[0.5px] font-semibold text-warm-gray border-b-2 border-tenkai-border cursor-pointer hover:text-torii transition-colors select-none w-24"
                >
                  Change <SortIcon field="change" />
                </th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-[0.5px] font-semibold text-warm-gray border-b-2 border-tenkai-border w-20">Trend</th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-[0.5px] font-semibold text-warm-gray border-b-2 border-tenkai-border">Page</th>
              </tr>
            </thead>
            <tbody>
              {displayKeywords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-warm-gray">
                    {searchQuery ? 'No keywords match your search.' : 'No keyword data available yet.'}
                  </td>
                </tr>
              ) : (
                displayKeywords.map((kw, idx) => (
                  <KeywordRow
                    key={kw.keyword}
                    kw={kw}
                    isExpanded={expandedRow === kw.keyword}
                    onToggle={() => setExpandedRow(expandedRow === kw.keyword ? null : kw.keyword)}
                    isEven={idx % 2 === 0}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {totalKeywords > 0 && (
          <div className="px-4 py-2.5 border-t border-tenkai-border bg-cream/30 text-xs text-warm-gray">
            Showing {displayKeywords.length} of {totalKeywords} keywords
          </div>
        )}
      </div>

      {/* Keyword Strategy Card */}
      {strategy && (
        <div className="rounded-tenkai border border-tenkai-border bg-ivory overflow-hidden hover:border-torii/20 hover:shadow-tenkai-md transition-all duration-normal">
          <div className="px-6 py-4 border-b border-tenkai-border bg-cream/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-torii-subtle flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-serif text-torii">春樹</span>
              </div>
              <div>
                <h2 className="font-serif text-lg font-semibold text-charcoal">
                  {strategy.title ?? 'Your Keyword Strategy'}
                </h2>
                <p className="text-xs text-warm-gray">
                  Prepared by Haruki, SEO Strategist
                  {strategy.created_at && ` · ${new Date(strategy.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            {strategy.summary && (
              <p className="text-sm text-charcoal/80 leading-relaxed mb-4">{strategy.summary}</p>
            )}
            <button
              onClick={() => setStrategyViewerOpen(true)}
              className="text-sm font-medium text-torii hover:text-torii-dark transition-colors"
            >
              View Full Strategy →
            </button>
          </div>

          {showApproval && (
            <div className="px-6 py-4 border-t border-tenkai-border">
              <ApprovalForm onSubmit={handleApproval} loading={approvalLoading} />
            </div>
          )}

          {strategy.content && (
            <OutputViewer
              data={{
                id: strategy.id,
                title: strategy.title ?? 'Keyword Strategy',
                content: strategy.content,
                deliverable_type: 'keyword_list',
                agent_name: 'Haruki',
                agent_kanji: '春樹',
                status: strategy.status ?? undefined,
              }}
              variant="modal"
              open={strategyViewerOpen}
              onClose={() => setStrategyViewerOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Keyword Row ─────────────────────────────────────────── */
function KeywordRow({
  kw,
  isExpanded,
  onToggle,
  isEven,
}: {
  kw: KeywordData
  isExpanded: boolean
  onToggle: () => void
  isEven: boolean
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={cn(
          'cursor-pointer transition-colors duration-fast',
          isEven ? 'bg-ivory' : 'bg-ivory',
          'hover:bg-parchment'
        )}
      >
        <td className="px-4 py-3">
          <span className="text-charcoal font-medium truncate block max-w-[300px]" title={kw.keyword}>
            {kw.keyword}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="text-charcoal font-serif font-semibold">
            {kw.position > 0 ? kw.position : '--'}
          </span>
        </td>
        <td className="px-4 py-3">
          <ChangeIndicator change={kw.change} />
        </td>
        <td className="px-4 py-3">
          <Sparkline data={kw.trend} />
        </td>
        <td className="px-4 py-3">
          <span className="text-warm-gray text-xs truncate block max-w-[200px]" title={kw.page_url}>
            {kw.page_url || '--'}
          </span>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={5} className="px-4 py-4 bg-cream/50 border-t border-tenkai-border-light">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Position History Chart */}
              <div>
                <h4 className="text-xs font-medium text-warm-gray uppercase tracking-wider mb-3">
                  Position History
                </h4>
                {kw.trend.length >= 2 ? (
                  <PositionHistoryChart data={kw.trend} />
                ) : (
                  <p className="text-sm text-warm-gray italic">Not enough data for position history.</p>
                )}
              </div>

              {/* Agent Recommendation */}
              <div>
                <h4 className="text-xs font-medium text-warm-gray uppercase tracking-wider mb-3">
                  Recommendation
                </h4>
                {kw.recommendation ? (
                  <div className="rounded-tenkai border border-tenkai-border bg-ivory p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-torii-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[10px] font-serif text-torii">春樹</span>
                      </div>
                      <p className="text-sm text-charcoal/80 leading-relaxed">{kw.recommendation}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-warm-gray italic">
                    No specific recommendation yet. Haruki is analyzing this keyword.
                  </p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* ─── Position History Chart ──────────────────────────────── */
function PositionHistoryChart({ data }: { data: number[] }) {
  const w = 280
  const h = 100
  const padding = { top: 10, right: 10, bottom: 20, left: 30 }
  const chartW = w - padding.left - padding.right
  const chartH = h - padding.top - padding.bottom

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = chartW / (data.length - 1)

  const points = data
    .map((v, i) => `${padding.left + i * step},${padding.top + ((v - min) / range) * chartH}`)
    .join(' ')

  // Y-axis labels (inverted — lower position is better, shown at top)
  const yLabels = [min, Math.round((min + max) / 2), max]

  return (
    <svg width={w} height={h} className="w-full" viewBox={`0 0 ${w} ${h}`}>
      {/* Grid lines */}
      {yLabels.map((val, i) => {
        const y = padding.top + ((val - min) / range) * chartH
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={w - padding.right}
              y2={y}
              stroke="#E8E4DE"
              strokeDasharray="4 2"
            />
            <text x={padding.left - 4} y={y + 4} textAnchor="end" className="text-[9px] fill-warm-gray">
              {val}
            </text>
          </g>
        )
      })}

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#C1554D"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {data.map((v, i) => {
        const x = padding.left + i * step
        const y = padding.top + ((v - min) / range) * chartH
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill="white"
            stroke="#C1554D"
            strokeWidth="1.5"
          />
        )
      })}
    </svg>
  )
}
