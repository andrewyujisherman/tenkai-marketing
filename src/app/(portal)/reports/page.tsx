'use client'

import { useState } from 'react'
import { Download, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MetricCard } from '@/components/portal/MetricCard'
import { InsightCard } from '@/components/portal/InsightCard'
import { SimpleChart, StackedBarChart } from '@/components/portal/SimpleChart'

// --- Mock data ---

const trafficData = [
  { label: 'Oct', value: 1420 },
  { label: 'Nov', value: 1580 },
  { label: 'Dec', value: 1690 },
  { label: 'Jan', value: 1870 },
  { label: 'Feb', value: 2030 },
  { label: 'Mar', value: 2340 },
]

const keywordLegend = [
  { name: '#1–3', color: 'bg-torii' },
  { name: '#4–10', color: 'bg-torii-light' },
  { name: '#11–20', color: 'bg-[#D4A574]' },
  { name: '#21–50', color: 'bg-muted-gray' },
  { name: '#51–100', color: 'bg-parchment' },
]

const keywordDistribution = [
  {
    label: 'Current',
    segments: [
      { value: 5, color: 'bg-torii', name: '#1–3' },
      { value: 12, color: 'bg-torii-light', name: '#4–10' },
      { value: 15, color: 'bg-[#D4A574]', name: '#11–20' },
      { value: 10, color: 'bg-muted-gray', name: '#21–50' },
      { value: 5, color: 'bg-parchment', name: '#51–100' },
    ],
  },
  {
    label: 'Prior',
    segments: [
      { value: 3, color: 'bg-torii', name: '#1–3' },
      { value: 9, color: 'bg-torii-light', name: '#4–10' },
      { value: 14, color: 'bg-[#D4A574]', name: '#11–20' },
      { value: 13, color: 'bg-muted-gray', name: '#21–50' },
      { value: 8, color: 'bg-parchment', name: '#51–100' },
    ],
  },
]

const contentPerformance = [
  {
    title: '10 Local SEO Tips for Small Businesses',
    views: 892,
    avgTime: '4:32',
    bounceRate: '34%',
  },
  {
    title: 'How to Choose a Reliable Plumber',
    views: 645,
    avgTime: '3:15',
    bounceRate: '42%',
  },
  {
    title: 'Emergency Plumbing: What to Do Before Help Arrives',
    views: 478,
    avgTime: '2:58',
    bounceRate: '48%',
  },
  {
    title: 'Water Heater Maintenance Guide (2026)',
    views: 325,
    avgTime: '5:10',
    bounceRate: '29%',
  },
]

const insights = [
  "Your organic traffic grew 15% \u2014 most of it came from the blog post about 'local SEO tips' which now ranks #3.",
  "Three keywords moved into the top 5. 'plumber near me' is your best performer.",
  "Your competitor (ABC Plumbing) lost 3 positions on 'emergency plumber' \u2014 this is an opportunity.",
  "Content engagement is strong: average time on page increased to 3:59, up from 3:12 last month.",
]

const recommendations = [
  "Focus on 'same-day plumber' long-tail keywords",
  "Publish competitor gap content on emergency plumbing",
  "Add FAQ schema to top 3 blog posts",
]

// --- Page ---

export default function ReportsPage() {
  const [period, setPeriod] = useState('30d')

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

        {/* Content is the same for all periods in this mock */}
        <TabsContent value={period}>
          <div className="space-y-8 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Organic Traffic"
                value="2,340"
                change="up"
                changePercent="+15%"
                period="vs prior period"
                detail="Visits from search engines"
              />
              <MetricCard
                title="Keyword Rankings"
                value="47"
                change="up"
                changePercent="12 improved"
                period="3 declined"
                detail="Tracked keywords"
              />
              <MetricCard
                title="Content Published"
                value="4"
                change="neutral"
                changePercent="avg 1,200 words"
                period="This period"
                detail="Blog posts published"
              />
              <MetricCard
                title="Domain Authority"
                value="28"
                change="up"
                changePercent="+2"
                period="vs last month"
              />
            </div>

            {/* "So What" Insights */}
            <InsightCard
              agentName="Aiko"
              agentIcon="\u{1F338}"
              title="Here's what matters this month"
              insights={insights}
              recommendations={recommendations}
            />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-tenkai border border-tenkai-border p-5">
                <SimpleChart
                  data={trafficData}
                  title="Traffic Over Time"
                  color="bg-torii"
                />
              </div>
              <div className="bg-white rounded-tenkai border border-tenkai-border p-5">
                <StackedBarChart
                  data={keywordDistribution}
                  title="Keyword Distribution"
                  legend={keywordLegend}
                />
              </div>
            </div>

            {/* Content Performance Table */}
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
                          {post.views.toLocaleString()}
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

            {/* Tier Upgrade Banner */}
            <div className="bg-parchment/50 rounded-tenkai border border-tenkai-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-charcoal">
                  Upgrade to Pro for deeper insights
                </p>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
