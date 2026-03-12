'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScoreCircle } from '@/components/portal/ScoreCircle'
import { IssueCard, type IssueCardProps } from '@/components/portal/IssueCard'
import { ShieldAlert, AlertTriangle, CheckCircle2, Lightbulb, SearchX } from 'lucide-react'

const priorityColor = {
  High: 'bg-torii/10 text-torii',
  Medium: 'bg-[#C49A3C]/10 text-[#C49A3C]',
  Low: 'bg-[#5B7B9A]/10 text-[#5B7B9A]',
}

interface CategoryScore {
  label: string
  score: number
}

interface Recommendation {
  priority: string
  title: string
  description: string
  agent?: string
}

interface AuditClientProps {
  overallScore: number
  categoryScores: CategoryScore[]
  criticalIssues: IssueCardProps[]
  warningIssues: IssueCardProps[]
  passedIssues: IssueCardProps[]
  recommendations: Recommendation[]
}

export default function AuditClient({
  overallScore,
  categoryScores,
  criticalIssues,
  warningIssues,
  passedIssues,
  recommendations,
}: AuditClientProps) {
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
          <div className="flex flex-col items-center">
            <ScoreCircle score={overallScore} label="Overall SEO Score" size="lg" />
          </div>
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
              {criticalIssues.length > 0 ? (
                criticalIssues.map((issue, i) => <IssueCard key={i} {...issue} />)
              ) : (
                <p className="text-sm text-warm-gray py-4">No critical issues found.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="warnings">
            <div className="space-y-3">
              {warningIssues.length > 0 ? (
                warningIssues.map((issue, i) => <IssueCard key={i} {...issue} />)
              ) : (
                <p className="text-sm text-warm-gray py-4">No warnings found.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="passed">
            <div className="space-y-3">
              {passedIssues.length > 0 ? (
                passedIssues.map((issue, i) => <IssueCard key={i} {...issue} />)
              ) : (
                <p className="text-sm text-warm-gray py-4">No passed checks yet.</p>
              )}
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
                      priorityColor[rec.priority as keyof typeof priorityColor] ?? 'bg-parchment text-charcoal'
                    }`}
                  >
                    {rec.priority} Impact
                  </span>
                </div>
                <p className="text-sm text-warm-gray leading-relaxed">{rec.description}</p>
                {rec.agent && (
                  <span className="text-xs text-muted-gray mt-1 inline-block">
                    Recommended by {rec.agent}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AuditEmptyState() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Audit Results</h1>
        <p className="text-sm text-warm-gray mt-1">
          Kenji&apos;s latest technical SEO audit of your website
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
        <SearchX className="size-12 text-muted-gray" />
        <div>
          <p className="font-medium text-charcoal">No audit results yet</p>
          <p className="text-sm text-warm-gray mt-1 max-w-sm">
            Kenji will run your first SEO audit after onboarding.
          </p>
        </div>
      </div>
    </div>
  )
}
