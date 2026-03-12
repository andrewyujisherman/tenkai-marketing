'use client'

import { useState } from 'react'
import { Download, ArrowUpRight, BarChart3 } from 'lucide-react'
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

interface ReportsClientProps {
  reports: ReportData[]
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
        <Button className="bg-torii text-white hover:bg-torii-dark rounded-tenkai text-sm gap-1.5 flex-shrink-0">
          Upgrade to Pro
          <ArrowUpRight className="size-3.5" />
        </Button>
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

export default function ReportsClient({ reports }: ReportsClientProps) {
  const [period, setPeriod] = useState('30d')

  if (reports.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-charcoal">Performance Reports</h2>
            <p className="text-warm-gray text-sm mt-1">
              Track your SEO progress and content performance
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
          <BarChart3 className="size-12 text-muted-gray" />
          <div>
            <p className="font-medium text-charcoal">No reports yet</p>
            <p className="text-sm text-warm-gray mt-1 max-w-sm">
              Your first performance report will be generated after your content goes live.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Filter by period tab
  const filteredReports = reports.filter((r) => {
    if (period === '30d') return r.type === 'monthly'
    if (period === '3m') return r.type === 'quarterly'
    return true // '6m' shows all
  })

  const activeReport = filteredReports[0] ?? reports[0]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Performance Reports</h2>
          <p className="text-warm-gray text-sm mt-1">
            Track your SEO progress and content performance
          </p>
        </div>
        <Button
          variant="outline"
          className="border-tenkai-border text-charcoal hover:bg-parchment rounded-tenkai gap-2 self-start"
          onClick={() => activeReport && exportReportCSV(activeReport)}
          disabled={!activeReport}
        >
          <Download className="size-4" />
          Export Report
        </Button>
      </div>

      {/* Period Tabs */}
      <Tabs defaultValue="30d" onValueChange={(val) => setPeriod(val as string)}>
        <TabsList className="bg-parchment/60 border border-tenkai-border rounded-tenkai">
          <TabsTrigger
            value="30d"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Last 30 Days
          </TabsTrigger>
          <TabsTrigger
            value="3m"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Last 3 Months
          </TabsTrigger>
          <TabsTrigger
            value="6m"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Last 6 Months
          </TabsTrigger>
        </TabsList>

        <TabsContent value="30d">
          {activeReport ? (
            <ReportView report={activeReport} />
          ) : (
            <p className="text-sm text-warm-gray mt-6">No monthly report available.</p>
          )}
        </TabsContent>
        <TabsContent value="3m">
          {activeReport ? (
            <ReportView report={activeReport} />
          ) : (
            <p className="text-sm text-warm-gray mt-6">No quarterly report available.</p>
          )}
        </TabsContent>
        <TabsContent value="6m">
          {activeReport ? (
            <ReportView report={activeReport} />
          ) : (
            <p className="text-sm text-warm-gray mt-6">No reports available for this period.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
