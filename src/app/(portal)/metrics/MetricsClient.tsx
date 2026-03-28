'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lock, RefreshCw, TrendingUp } from 'lucide-react'
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
  top_pages?: { url: string; sessions: number; users: number; bounce_rate: string; avg_duration: string }[]
  topChannels?: { channel: string; sessions: number; users: number }[]
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

// ---------- Mini Bar Chart ----------

const BAR_HEIGHTS = [55, 45, 60, 75, 65, 80, 70, 85, 72, 90, 78, 88]
const BAR_X_LABELS = ['Dec', 'Jan', 'Feb', 'Mar']

function MiniBarChart({ data }: { data?: number[] }) {
  const bars = data && data.length > 0 ? data.slice(-12) : BAR_HEIGHTS
  const max = Math.max(...bars, 1)
  return (
    <div>
      <div className="flex items-end gap-0.5 h-12">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-torii-subtle hover:bg-torii-light transition-colors cursor-default"
            style={{ height: `${(h / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {BAR_X_LABELS.map((label) => (
          <span key={label} className="text-[10px] text-warm-gray">{label}</span>
        ))}
      </div>
    </div>
  )
}

// ---------- Connect Prompt (inline, small) ----------

function ConnectPrompt({ service, href = '/settings#integrations' }: { service: string; href?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
      <div className="w-10 h-10 rounded-full bg-parchment/60 flex items-center justify-center">
        <Lock className="size-4 text-warm-gray" />
      </div>
      <p className="text-xs text-warm-gray text-center">Connect {service} to see this data</p>
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-torii text-white text-xs font-medium rounded-tenkai hover:bg-torii-dark transition-colors"
      >
        Connect
      </Link>
    </div>
  )
}

// ---------- Card 1: Website Visits ----------

function WebsiteVisitsCard({ data, loading }: { data: TrafficData | null; loading: boolean }) {
  const sessionsMetric = data?.summary?.find((m) => m.name === 'Sessions')
  const value = sessionsMetric?.value ?? '--'
  const badge = sessionsMetric?.change_pct ?? ''
  const isUp = sessionsMetric?.trend === 'up'

  return (
    <div className="portal-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-warm-gray uppercase tracking-wider">Website Visits</p>
          {loading ? (
            <div className="h-8 w-24 bg-parchment rounded animate-pulse mt-1" />
          ) : data && !data.connected ? null : (
            <p className="font-serif text-2xl font-semibold text-charcoal mt-0.5">{value}</p>
          )}
          <p className="text-xs text-warm-gray mt-0.5">Last 30 days</p>
        </div>
        {!loading && data?.connected && badge && badge !== 'N/A' && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-tenkai-sm flex items-center gap-0.5',
            isUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}>
            <TrendingUp className="size-3" />
            {badge}
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-14 bg-parchment/50 rounded animate-pulse" />
      ) : !data?.connected ? (
        <ConnectPrompt service="Google Analytics" />
      ) : (
        <MiniBarChart data={data?.chart?.data} />
      )}
    </div>
  )
}

// ---------- Card 2: Search Console ----------

function SearchConsoleCard({ data, loading }: { data: SearchData | null; loading: boolean }) {
  const impressions = data?.summary?.find((m) => m.name === 'Impressions')
  const clicks = data?.summary?.find((m) => m.name === 'Total Clicks')
  const ctr = data?.summary?.find((m) => m.name === 'Avg CTR')
  const position = data?.summary?.find((m) => m.name === 'Avg Position')

  const metrics = [
    { label: 'Impressions', value: impressions?.value ?? '--' },
    { label: 'Clicks', value: clicks?.value ?? '--' },
    { label: 'Click-through Rate', value: ctr?.value ?? '--' },
    { label: 'Avg. Position', value: position?.value ?? '--' },
  ]

  return (
    <div className="portal-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-warm-gray uppercase tracking-wider">Search Console</p>
        <span className="text-xs text-warm-gray">Last 28 days</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-parchment rounded animate-pulse w-3/4" />
              <div className="h-6 bg-parchment rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      ) : !data?.connected ? (
        <ConnectPrompt service="Google Search Console" />
      ) : (
        <div className="grid grid-cols-2 gap-3 flex-1">
          {metrics.map(({ label, value }) => (
            <div key={label} className="bg-parchment/40 rounded-tenkai p-3">
              <p className="text-[10px] text-warm-gray uppercase tracking-wider leading-tight">{label}</p>
              <p className="font-serif text-lg font-semibold text-charcoal mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Card 3: Google Business Profile ----------

function GBPCard({ data, loading }: { data: LocalData | null; loading: boolean }) {
  const views = data?.summary?.find((m) => m.name === 'Profile Views')
  const directions = data?.summary?.find((m) => m.name === 'Direction Requests')
  const calls = data?.summary?.find((m) => m.name === 'Phone Calls')
  const badge = views?.change_pct ?? ''
  const isUp = views?.trend === 'up'

  const stats = [
    { label: 'Profile Views', value: views?.value ?? '--' },
    { label: 'Directions', value: directions?.value ?? '--' },
    { label: 'Phone Calls', value: calls?.value ?? '--' },
  ]

  return (
    <div className="portal-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-warm-gray uppercase tracking-wider">Google Business</p>
        {!loading && data?.connected && badge && badge !== 'N/A' && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-tenkai-sm flex items-center gap-0.5',
            isUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}>
            <TrendingUp className="size-3" />
            {badge}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 bg-parchment rounded animate-pulse" />
                <div className="h-5 bg-parchment rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-10 bg-parchment/50 rounded animate-pulse" />
        </div>
      ) : !data?.connected ? (
        <ConnectPrompt service="Google Business Profile" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="font-serif text-lg font-semibold text-charcoal">{value}</p>
                <p className="text-[10px] text-warm-gray leading-tight mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <MiniBarChart />
        </>
      )}
    </div>
  )
}

// ---------- Card 4: Traffic Sources ----------

const SOURCE_COLORS: Record<string, string> = {
  'Organic Search': 'bg-torii',
  'organic': 'bg-torii',
  'Direct': 'bg-charcoal',
  'direct': 'bg-charcoal',
  'Referral': 'bg-success',
  'referral': 'bg-success',
  'Social': 'bg-warning',
  'social': 'bg-warning',
  'Email': 'bg-blue-500',
  'email': 'bg-blue-500',
}

function TrafficSourcesCard({ data, loading }: { data: TrafficData | null; loading: boolean }) {
  // Calculate sources from topChannels if available, otherwise use summary-derived defaults
  let sources: { label: string; pct: number; color: string }[] = []

  if (data?.connected && data.topChannels && data.topChannels.length > 0) {
    const total = data.topChannels.reduce((sum, ch) => sum + ch.sessions, 0) || 1
    sources = data.topChannels.slice(0, 4).map((ch) => ({
      label: ch.channel,
      pct: Math.round((ch.sessions / total) * 100),
      color: SOURCE_COLORS[ch.channel] ?? 'bg-muted-gray',
    }))
  }

  // Current month label
  const monthLabel = new Date().toLocaleString('default', { month: 'long' })

  return (
    <div className="portal-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-warm-gray uppercase tracking-wider">Traffic Sources</p>
        <span className="text-xs text-warm-gray">{monthLabel}</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-parchment rounded animate-pulse w-1/2" />
              <div className="h-2 bg-parchment rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : !data?.connected ? (
        <ConnectPrompt service="Google Analytics" />
      ) : (
        <div className="space-y-3 flex-1">
          {sources.length > 0 ? sources.map(({ label, pct, color }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-charcoal font-medium">{label}</span>
                <span className="text-warm-gray">{pct}%</span>
              </div>
              <div className="bg-parchment rounded-full h-1.5">
                <div className={cn(color, 'h-1.5 rounded-full transition-all duration-500')} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )) : (
            <p className="text-xs text-warm-gray text-center py-4">Traffic source data will appear once analytics data is collected.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- Main ----------

export default function MetricsClient() {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [searchData, setSearchData] = useState<SearchData | null>(null)
  const [localData, setLocalData] = useState<LocalData | null>(null)
  const [trafficLoading, setTrafficLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(true)
  const [localLoading, setLocalLoading] = useState(true)
  const [error, setError] = useState('')

  function loadAll() {
    setTrafficLoading(true)
    setSearchLoading(true)
    setLocalLoading(true)
    setError('')

    fetch('/api/metrics/traffic?range=30d')
      .then((r) => r.json())
      .then(setTrafficData)
      .catch(() => setError('Some metrics failed to load.'))
      .finally(() => setTrafficLoading(false))

    fetch('/api/metrics/search?range=30d')
      .then((r) => r.json())
      .then(setSearchData)
      .catch(() => {})
      .finally(() => setSearchLoading(false))

    fetch('/api/metrics/local')
      .then((r) => r.json())
      .then(setLocalData)
      .catch(() => {})
      .finally(() => setLocalLoading(false))
  }

  useEffect(() => { loadAll() }, [])

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center justify-between px-4 py-3 bg-parchment/50 rounded-tenkai border border-tenkai-border text-sm text-warm-gray">
          <span>{error}</span>
          <button onClick={loadAll} className="inline-flex items-center gap-1.5 text-torii hover:text-torii-dark">
            <RefreshCw className="size-3.5" /> Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <WebsiteVisitsCard data={trafficData} loading={trafficLoading} />
        <SearchConsoleCard data={searchData} loading={searchLoading} />
        <GBPCard data={localData} loading={localLoading} />
        <TrafficSourcesCard data={trafficData} loading={trafficLoading} />
      </div>
    </div>
  )
}
