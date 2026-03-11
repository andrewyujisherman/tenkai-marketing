'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScoreCircle } from '@/components/portal/ScoreCircle'
import { IssueCard, type IssueCardProps } from '@/components/portal/IssueCard'
import { agents } from '@/lib/design-system'
import { ShieldAlert, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react'

// ─── Mock Data ─────────────────────────────────────────────────
const overallScore = 72
const categoryScores = [
  { label: 'Technical', score: 85 },
  { label: 'Content', score: 68 },
  { label: 'On-Page', score: 75 },
  { label: 'Off-Page', score: 52 },
]

const kenji = agents.find((a) => a.name === 'Kenji')!
const haruki = agents.find((a) => a.name === 'Haruki')!
const sakura = agents.find((a) => a.name === 'Sakura')!

const criticalIssues: IssueCardProps[] = [
  {
    severity: 'critical',
    title: 'Missing meta descriptions on 12 pages',
    description: 'Pages without meta descriptions lose click-through rate in search results. Google may generate its own, which is often suboptimal.',
    agent: kenji.name,
    affectedCount: 12,
    actionLabel: 'Fix Now',
  },
  {
    severity: 'critical',
    title: 'Core Web Vitals: LCP exceeds 2.5s on mobile',
    description: 'Largest Contentful Paint is 3.8s on mobile. Google recommends under 2.5s for a good user experience. This directly impacts rankings.',
    agent: kenji.name,
    affectedCount: 8,
    actionLabel: 'Fix Now',
  },
  {
    severity: 'critical',
    title: 'No XML sitemap found',
    description: 'Without a sitemap, search engines may miss important pages on your site. This is especially critical for newer sites with fewer backlinks.',
    agent: kenji.name,
    affectedCount: 1,
    actionLabel: 'Generate',
  },
]

const warningIssues: IssueCardProps[] = [
  {
    severity: 'warning',
    title: 'Image alt text missing on 8 images',
    description: 'Images without alt text miss out on image search traffic and hurt accessibility scores.',
    agent: kenji.name,
    affectedCount: 8,
    actionLabel: 'View Details',
  },
  {
    severity: 'warning',
    title: 'Internal linking opportunities: 15 orphan pages',
    description: 'These pages have no internal links pointing to them, making them harder for search engines to discover and rank.',
    agent: kenji.name,
    affectedCount: 15,
    actionLabel: 'View Details',
  },
  {
    severity: 'warning',
    title: 'Schema markup incomplete on blog posts',
    description: 'Blog posts are missing Article schema markup, which helps Google understand your content and enables rich snippets.',
    agent: kenji.name,
    affectedCount: 6,
    actionLabel: 'View Details',
  },
]

const passedIssues: IssueCardProps[] = [
  {
    severity: 'passed',
    title: 'HTTPS properly configured',
    description: 'SSL certificate is valid and all pages redirect from HTTP to HTTPS correctly.',
    agent: kenji.name,
    actionLabel: 'View',
  },
  {
    severity: 'passed',
    title: 'Robots.txt present and valid',
    description: 'Your robots.txt file is correctly configured and not blocking any important pages.',
    agent: kenji.name,
    actionLabel: 'View',
  },
  {
    severity: 'passed',
    title: 'Mobile-friendly design confirmed',
    description: 'All pages pass Google\'s mobile-friendly test. Responsive design is working correctly across devices.',
    agent: kenji.name,
    actionLabel: 'View',
  },
]

const recommendations = [
  {
    priority: 'High',
    title: 'Fix all critical technical issues first',
    description: 'Missing meta descriptions, slow LCP, and missing sitemap are all blocking better rankings. Kenji can auto-generate meta descriptions and a sitemap within 24 hours.',
    agent: kenji.name,
  },
  {
    priority: 'High',
    title: 'Add EEAT signals to existing blog posts',
    description: 'Your published content lacks author bios and experience signals. Adding these can improve content quality scores by 15-20 points.',
    agent: sakura.name,
  },
  {
    priority: 'Medium',
    title: 'Build internal linking structure',
    description: '15 orphan pages need to be connected to your site\'s navigation flow. Creating content clusters around your top keywords will boost topical authority.',
    agent: haruki.name,
  },
  {
    priority: 'Medium',
    title: 'Implement schema markup across all post types',
    description: 'Article, FAQ, and LocalBusiness schema will help Google generate rich snippets for your pages, improving click-through rates.',
    agent: kenji.name,
  },
  {
    priority: 'Low',
    title: 'Start a link-building outreach campaign',
    description: 'Your off-page score is the weakest category at 52. Even 5-10 quality backlinks from local directories and industry blogs would significantly boost authority.',
    agent: haruki.name,
  },
]

const priorityColor = {
  High: 'bg-torii/10 text-torii',
  Medium: 'bg-[#C49A3C]/10 text-[#C49A3C]',
  Low: 'bg-[#5B7B9A]/10 text-[#5B7B9A]',
}

export default function AuditPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Audit Results</h1>
        <p className="text-sm text-warm-gray mt-1">
          Kenji&apos;s latest technical SEO audit of your website
        </p>
      </div>

      {/* ─── Overview Section ──────────────────────────────────── */}
      <div className="rounded-tenkai border border-tenkai-border bg-white p-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
          {/* Overall score */}
          <div className="flex flex-col items-center">
            <ScoreCircle score={overallScore} label="Overall SEO Score" size="lg" />
          </div>

          {/* Category scores */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-warm-gray mb-4">Category Breakdown</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {categoryScores.map((cat) => (
                <ScoreCircle key={cat.label} score={cat.score} label={cat.label} size="sm" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Issues Section ────────────────────────────────────── */}
      <div>
        <h2 className="font-serif text-lg font-medium text-charcoal mb-4">Issues Found</h2>

        <Tabs defaultValue="critical">
          <TabsList variant="line" className="mb-4">
            <TabsTrigger value="critical" className="gap-1.5">
              <ShieldAlert className="size-3.5" />
              Critical
              <span className="ml-1 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
                {criticalIssues.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="warnings" className="gap-1.5">
              <AlertTriangle className="size-3.5" />
              Warnings
              <span className="ml-1 rounded-full bg-[#C49A3C]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#C49A3C]">
                {warningIssues.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="passed" className="gap-1.5">
              <CheckCircle2 className="size-3.5" />
              Passed
              <span className="ml-1 rounded-full bg-[#4A7C59]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#4A7C59]">
                {passedIssues.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="critical">
            <div className="space-y-3">
              {criticalIssues.map((issue, i) => (
                <IssueCard key={i} {...issue} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="warnings">
            <div className="space-y-3">
              {warningIssues.map((issue, i) => (
                <IssueCard key={i} {...issue} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="passed">
            <div className="space-y-3">
              {passedIssues.map((issue, i) => (
                <IssueCard key={i} {...issue} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Recommendations Section ──────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="size-5 text-torii" />
          <h2 className="font-serif text-lg font-medium text-charcoal">
            What your Tenkai team recommends
          </h2>
        </div>
        <p className="text-sm text-warm-gray mb-4">
          Prioritized actions to improve your SEO performance, in plain English
        </p>

        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-tenkai border border-tenkai-border bg-white p-4"
            >
              <div className="flex items-center justify-center size-7 rounded-full bg-parchment text-sm font-semibold text-charcoal shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-charcoal">{rec.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      priorityColor[rec.priority as keyof typeof priorityColor]
                    }`}
                  >
                    {rec.priority} Impact
                  </span>
                </div>
                <p className="text-sm text-warm-gray leading-relaxed">{rec.description}</p>
                <span className="text-xs text-muted-gray mt-1 inline-block">
                  Recommended by {rec.agent}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
