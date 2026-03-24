'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MetricCard } from '@/components/ui/metric-card'
import { Lock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------- Types ----------

interface MetricSummary {
  name: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  change_pct: string
  period: string
  tooltip: string
}

interface TrafficData {
  connected: boolean
  integration?: string
  summary: MetricSummary[]
  chart: { labels: string[]; data: number[] }
  top_pages: { url: string; sessions: number; users: number; bounce_rate: string; avg_duration: string }[]
}

interface SearchData {
  connected: boolean
  integration?: string
  summary: MetricSummary[]
  chart: { labels: string[]; clicks: number[]; impressions: number[] }
}

interface LocalData {
  connected: boolean
  integration?: string
  summary: MetricSummary[]
}

// ---------- SVG Chart ----------

function SimpleLineChart({
  labels,
  datasets,
  height = 240,
}: {
  labels: string[]
  datasets: { data: number[]; color: string; label: string }[]
  height?: number
}) {
  if (!labels.length) return null

  const width = 700
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const allValues = datasets.flatMap((d) => d.data)
  const maxVal = Math.max(...allValues, 1)
  const minVal = Math.min(...allValues, 0)
  const range = maxVal - minVal || 1

  function toX(i: number) {
    return padding.left + (i / Math.max(labels.length - 1, 1)) * chartW
  }
  function toY(val: number) {
    return padding.top + chartH - ((val - minVal) / range) * chartH
  }

  // Y-axis ticks
  const yTicks = 5
  const yTickValues = Array.from({ length: yTicks }, (_, i) => minVal + (range * i) / (yTicks - 1))

  // X-axis label sampling (show ~6 labels)
  const xStep = Math.max(1, Math.floor(labels.length / 6))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTickValues.map((val, i) => (
        <g key={`grid-${i}`}>
          <line
            x1={padding.left} y1={toY(val)}
            x2={width - padding.right} y2={toY(val)}
            stroke="#E8E0D4" strokeWidth={1} strokeDasharray="4 4"
          />
          <text
            x={padding.left - 8} y={toY(val) + 4}
            textAnchor="end" fontSize={10} fill="#8B7E6A"
          >
            {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {labels.map((label, i) =>
        i % xStep === 0 ? (
          <text
            key={`x-${i}`}
            x={toX(i)} y={height - 8}
            textAnchor="middle" fontSize={10} fill="#8B7E6A"
          >
            {label.slice(5)}
          </text>
        ) : null
      )}

      {/* Data lines */}
      {datasets.map((ds, di) => {
        const pathData = ds.data
          .map((val, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(val)}`)
          .join(' ')

        // Area fill
        const areaPath = `${pathData} L${toX(ds.data.length - 1)},${toY(minVal)} L${toX(0)},${toY(minVal)} Z`

        return (
          <g key={`ds-${di}`}>
            <path d={areaPath} fill={ds.color} fillOpacity={0.08} />
            <path d={pathData} fill="none" stroke={ds.color} strokeWidth={2} strokeLinejoin="round" />
          </g>
        )
      })}

      {/* Legend */}
      {datasets.length > 1 && datasets.map((ds, i) => (
        <g key={`legend-${i}`} transform={`translate(${padding.left + i * 120}, ${padding.top - 8})`}>
          <rect width={12} height={3} fill={ds.color} rx={1.5} />
          <text x={16} y={4} fontSize={10} fill="#8B7E6A">{ds.label}</text>
        </g>
      ))}
    </svg>
  )
}

// ---------- Skeleton ----------

function MetricsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-ivory rounded-tenkai border border-tenkai-border p-5 space-y-3">
            <div className="h-3 bg-parchment rounded w-1/2" />
            <div className="h-8 bg-parchment rounded w-2/3" />
            <div className="h-3 bg-parchment rounded w-1/3" />
          </div>
        ))}
      </div>
      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-6 h-64" />
    </div>
  )
}

// ---------- Not Connected ----------

function NotConnectedPrompt({ integration }: { integration: string }) {
  const names: Record<string, string> = {
    ga4: 'Google Analytics',
    gsc: 'Google Search Console',
    gbp: 'Google Business Profile',
  }
  return (
    <div className="bg-ivory rounded-tenkai border border-tenkai-border p-12 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-parchment/60 flex items-center justify-center mx-auto">
        <Lock className="size-7 text-warm-gray" />
      </div>
      <h3 className="font-serif text-lg text-charcoal">
        Connect {names[integration] ?? integration} to see this data
      </h3>
      <p className="text-warm-gray text-sm max-w-md mx-auto">
        Once connected, your AI team will start tracking and reporting on your performance automatically.
      </p>
      <Link
        href="/settings#integrations"
        className="inline-flex items-center gap-2 px-4 py-2 bg-torii text-white text-sm font-medium rounded-tenkai hover:bg-torii-dark transition-colors"
      >
        Connect in Settings
      </Link>
    </div>
  )
}

// ---------- Time Range Selector ----------

const RANGES = ['7d', '30d', '90d', '1y'] as const

function TimeRangeSelector({
  active,
  onChange,
}: {
  active: string
  onChange: (range: string) => void
}) {
  return (
    <div className="flex items-center gap-1 bg-parchment/40 p-1 rounded-tenkai">
      {RANGES.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={cn(
            'px-3 py-1 text-xs font-medium rounded-tenkai-sm transition-colors',
            active === r
              ? 'bg-ivory text-charcoal shadow-tenkai-sm'
              : 'text-warm-gray hover:text-charcoal'
          )}
        >
          {r}
        </button>
      ))}
    </div>
  )
}

// ---------- Traffic Tab ----------

function TrafficTab() {
  const [data, setData] = useState<TrafficData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('30d')

  const fetchData = useCallback((r: string) => {
    setLoading(true)
    setError('')
    fetch(`/api/metrics/traffic?range=${r}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError('Unable to load traffic data.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(range) }, [range, fetchData])

  if (loading) return <MetricsSkeleton />
  if (error) return (
    <div className="bg-ivory rounded-tenkai border border-tenkai-border p-8 text-center space-y-3">
      <p className="text-warm-gray text-sm">{error}</p>
      <button onClick={() => fetchData(range)} className="inline-flex items-center gap-1.5 text-sm text-torii hover:text-torii-dark">
        <RefreshCw className="size-3.5" /> Retry
      </button>
    </div>
  )
  if (data && !data.connected) return <NotConnectedPrompt integration={data.integration ?? 'ga4'} />
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.summary.map((m) => (
          <MetricCard
            key={m.name}
            name={m.name}
            value={m.value}
            trend={m.trend}
            changePct={m.change_pct}
            period={m.period}
            tooltip={m.tooltip}
          />
        ))}
      </div>

      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base text-charcoal">Traffic Trend</h3>
          <TimeRangeSelector active={range} onChange={setRange} />
        </div>
        <SimpleLineChart
          labels={data.chart.labels}
          datasets={[{ data: data.chart.data, color: '#C1554D', label: 'Sessions' }]}
        />
      </div>

      {data.top_pages && data.top_pages.length > 0 && (
        <div className="bg-ivory rounded-tenkai border border-tenkai-border overflow-hidden">
          <div className="p-4 border-b border-tenkai-border">
            <h3 className="font-serif text-base text-charcoal">Top Pages</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-parchment/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wider">Page</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wider">Sessions</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wider">Users</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wider">Bounce Rate</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wider">Avg Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tenkai-border/50">
                {data.top_pages.map((page) => (
                  <tr key={page.url} className="hover:bg-parchment/20 transition-colors">
                    <td className="px-4 py-3 text-charcoal font-medium truncate max-w-[200px]" title={page.url}>{page.url}</td>
                    <td className="px-4 py-3 text-right text-charcoal">{page.sessions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-charcoal">{page.users.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-warm-gray">{page.bounce_rate}</td>
                    <td className="px-4 py-3 text-right text-warm-gray">{page.avg_duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Search Tab ----------

function SearchTab() {
  const [data, setData] = useState<SearchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('30d')

  const fetchData = useCallback((r: string) => {
    setLoading(true)
    setError('')
    fetch(`/api/metrics/search?range=${r}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError('Unable to load search data.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(range) }, [range, fetchData])

  if (loading) return <MetricsSkeleton />
  if (error) return (
    <div className="bg-ivory rounded-tenkai border border-tenkai-border p-8 text-center space-y-3">
      <p className="text-warm-gray text-sm">{error}</p>
      <button onClick={() => fetchData(range)} className="inline-flex items-center gap-1.5 text-sm text-torii hover:text-torii-dark">
        <RefreshCw className="size-3.5" /> Retry
      </button>
    </div>
  )
  if (data && !data.connected) return <NotConnectedPrompt integration={data.integration ?? 'gsc'} />
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.summary.map((m) => (
          <MetricCard
            key={m.name}
            name={m.name}
            value={m.value}
            trend={m.trend}
            changePct={m.change_pct}
            period={m.period}
            tooltip={m.tooltip}
          />
        ))}
      </div>

      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base text-charcoal">Search Performance</h3>
          <TimeRangeSelector active={range} onChange={setRange} />
        </div>
        <SimpleLineChart
          labels={data.chart.labels}
          datasets={[
            { data: data.chart.clicks, color: '#C1554D', label: 'Clicks' },
            { data: data.chart.impressions, color: '#8B7E6A', label: 'Impressions' },
          ]}
        />
      </div>
    </div>
  )
}

// ---------- Local Tab ----------

function LocalTab() {
  const [data, setData] = useState<LocalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/metrics/local')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError('Unable to load local data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <MetricsSkeleton />
  if (error) return (
    <div className="bg-ivory rounded-tenkai border border-tenkai-border p-8 text-center space-y-3">
      <p className="text-warm-gray text-sm">{error}</p>
      <button onClick={() => window.location.reload()} className="inline-flex items-center gap-1.5 text-sm text-torii hover:text-torii-dark">
        <RefreshCw className="size-3.5" /> Retry
      </button>
    </div>
  )
  if (data && !data.connected) return <NotConnectedPrompt integration={data.integration ?? 'gbp'} />
  if (!data) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {data.summary.map((m) => (
        <MetricCard
          key={m.name}
          name={m.name}
          value={m.value}
          trend={m.trend}
          changePct={m.change_pct}
          period={m.period}
          tooltip={m.tooltip}
        />
      ))}
    </div>
  )
}

// ---------- Main ----------

const TABS = [
  { id: 'traffic', label: 'Traffic' },
  { id: 'search', label: 'Search Performance' },
  { id: 'local', label: 'Local' },
] as const

export default function MetricsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  const activeTab = TABS.some((t) => t.id === tabParam) ? tabParam! : 'traffic'

  function handleTabChange(tab: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`/metrics?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="border-b border-tenkai-border">
        <nav className="flex gap-6" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'pb-3 text-sm font-medium transition-colors relative',
                activeTab === tab.id
                  ? 'text-charcoal'
                  : 'text-warm-gray hover:text-charcoal'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-torii rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'traffic' && <TrafficTab />}
      {activeTab === 'search' && <SearchTab />}
      {activeTab === 'local' && <LocalTab />}
    </div>
  )
}
