'use client'

import { useState } from 'react'
import { ScoreCircle } from '@/components/portal/ScoreCircle'
import { IssueCard, type IssueCardProps } from '@/components/portal/IssueCard'
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  SearchX,
  FileText,
  Code2,
  FileSearch,
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { HealthDeliverable } from './page'

/* ─── Score color helper ──────────────────────────────────── */
function scoreClasses(score: number) {
  if (score >= 80) return 'text-[#4A7C59] bg-[#4A7C59]/10'
  if (score >= 50) return 'text-[#C49A3C] bg-[#C49A3C]/10'
  return 'text-torii bg-torii/10'
}

const priorityColor: Record<string, string> = {
  High: 'bg-torii/10 text-torii',
  Medium: 'bg-[#C49A3C]/10 text-[#C49A3C]',
  Low: 'bg-[#5B7B9A]/10 text-[#5B7B9A]',
}

const CODE_TYPES = ['schema_code', 'redirect_config', 'robots_config']

/* ─── Types ───────────────────────────────────────────────── */
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

interface HealthClientProps {
  overallScore: number
  categoryScores: CategoryScore[]
  criticalIssues: IssueCardProps[]
  warningIssues: IssueCardProps[]
  passedIssues: IssueCardProps[]
  recommendations: Recommendation[]
  technicalDeliverables: HealthDeliverable[]
  onPageDeliverables: HealthDeliverable[]
  hasAudit: boolean
}

/* ─── Code Block with Copy ────────────────────────────────── */
function CodeBlock({ content, label }: { content: string; label: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-tenkai border border-tenkai-border bg-[#2D2B2A] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-xs text-white/60 font-mono">{label}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 text-sm text-white/90 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {content}
      </pre>
    </div>
  )
}

/* ─── Expandable Deliverable Card ────────────────────────── */
function DeliverableCard({ d }: { d: HealthDeliverable }) {
  const [expanded, setExpanded] = useState(false)
  const isCode = CODE_TYPES.includes(d.deliverable_type ?? '')
  const typeLabel = (d.deliverable_type ?? 'report').replace(/_/g, ' ')

  return (
    <div className="rounded-tenkai border border-tenkai-border bg-white overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-start gap-4 w-full text-left p-4 hover:bg-parchment/30 transition-colors"
      >
        <div className="flex items-center justify-center size-8 rounded-full bg-parchment shrink-0 mt-0.5">
          {isCode ? (
            <Code2 className="size-4 text-charcoal" />
          ) : d.status === 'completed' ? (
            <CheckCircle2 className="size-4 text-[#4A7C59]" />
          ) : (
            <Clock className="size-4 text-[#C49A3C]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium text-charcoal">{d.title ?? 'Untitled'}</span>
            <span className="rounded-full bg-parchment px-2 py-0.5 text-[10px] font-medium text-charcoal">
              {typeLabel}
            </span>
            {d.score != null && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${scoreClasses(d.score)}`}>
                {d.score}/100
              </span>
            )}
          </div>
          {d.summary && (
            <p className="text-sm text-warm-gray leading-relaxed line-clamp-2">{d.summary}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {d.agent_name && (
              <span className="text-xs text-warm-gray/70">By {d.agent_name}</span>
            )}
            <span className="text-xs text-warm-gray/70">
              {new Date(d.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
        <div className="shrink-0 mt-1">
          {expanded ? (
            <ChevronUp className="size-4 text-warm-gray" />
          ) : (
            <ChevronDown className="size-4 text-warm-gray" />
          )}
        </div>
      </button>

      {expanded && d.content && (
        <div className="px-4 pb-4">
          {isCode ? (
            <CodeBlock content={d.content} label={typeLabel} />
          ) : (
            <div className="rounded-tenkai border border-tenkai-border bg-parchment/50 p-4 text-sm text-charcoal leading-relaxed whitespace-pre-wrap">
              {d.content}
            </div>
          )}
        </div>
      )}

      {expanded && !d.content && (
        <div className="px-4 pb-4">
          <p className="text-sm text-warm-gray italic">No detailed content available.</p>
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────── */
export default function HealthClient({
  overallScore,
  categoryScores,
  criticalIssues,
  warningIssues,
  passedIssues,
  recommendations,
  technicalDeliverables,
  onPageDeliverables,
  hasAudit,
}: HealthClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'onpage'>('overview')

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Website Health</h1>
        <p className="text-sm text-warm-gray mt-1">
          Technical SEO health, on-page analysis, and actionable recommendations
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-tenkai-border mb-6">
        {([
          { key: 'overview' as const, label: 'Overview' },
          { key: 'technical' as const, label: 'Technical' },
          { key: 'onpage' as const, label: 'On-Page' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-torii text-torii'
                : 'border-transparent text-warm-gray hover:text-charcoal'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Overview Tab ──────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {hasAudit ? (
            <>
              {/* Score overview */}
              <div className="rounded-tenkai border border-tenkai-border bg-white p-6">
                <div className="flex flex-col items-center gap-6 md:flex-row md:gap-10">
                  <div className="flex flex-col items-center">
                    <ScoreCircle score={overallScore} label="Overall SEO Score" size="lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-warm-gray mb-4">Category Breakdown</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {categoryScores.map((cat) => (
                        <ScoreCircle key={cat.label} score={cat.score} label={cat.label} size="sm" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues */}
              <div>
                <h2 className="font-serif text-lg font-medium text-charcoal mb-4">Issues Found</h2>

                {/* Issue severity groups */}
                {criticalIssues.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert className="size-4 text-torii" />
                      <h3 className="text-sm font-medium text-charcoal">
                        Critical
                        <span className="ml-2 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
                          {criticalIssues.length}
                        </span>
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {criticalIssues.map((issue, i) => (
                        <IssueCard key={i} {...issue} />
                      ))}
                    </div>
                  </div>
                )}

                {warningIssues.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="size-4 text-[#C49A3C]" />
                      <h3 className="text-sm font-medium text-charcoal">
                        Warnings
                        <span className="ml-2 rounded-full bg-[#C49A3C]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#C49A3C]">
                          {warningIssues.length}
                        </span>
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {warningIssues.map((issue, i) => (
                        <IssueCard key={i} {...issue} />
                      ))}
                    </div>
                  </div>
                )}

                {passedIssues.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="size-4 text-[#4A7C59]" />
                      <h3 className="text-sm font-medium text-charcoal">
                        Passed
                        <span className="ml-2 rounded-full bg-[#4A7C59]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#4A7C59]">
                          {passedIssues.length}
                        </span>
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {passedIssues.map((issue, i) => (
                        <IssueCard key={i} {...issue} />
                      ))}
                    </div>
                  </div>
                )}

                {criticalIssues.length === 0 && warningIssues.length === 0 && passedIssues.length === 0 && (
                  <p className="text-sm text-warm-gray py-4">No issues data available yet.</p>
                )}
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && (
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
                                priorityColor[rec.priority] ?? 'bg-parchment text-charcoal'
                              }`}
                            >
                              {rec.priority} Impact
                            </span>
                          </div>
                          <p className="text-sm text-warm-gray leading-relaxed">{rec.description}</p>
                          {rec.agent && (
                            <span className="text-xs text-warm-gray/70 mt-1 inline-block">
                              Recommended by {rec.agent}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
              <SearchX className="size-12 text-warm-gray/50" />
              <div>
                <p className="font-medium text-charcoal">No audit results yet</p>
                <p className="text-sm text-warm-gray mt-1 max-w-sm">
                  Kenji will run your first SEO audit after onboarding.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Technical Tab ─────────────────────────────────── */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          {technicalDeliverables.length > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-torii" />
                <h2 className="font-serif text-lg font-medium text-charcoal">
                  Technical Health Reports
                </h2>
              </div>
              <p className="text-sm text-warm-gray -mt-4">
                Technical audits, schema markup, redirect configs, and robots.txt
              </p>

              <div className="space-y-3">
                {technicalDeliverables.map((d) => (
                  <DeliverableCard key={d.id} d={d} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
              <FileSearch className="size-12 text-warm-gray/50" />
              <div>
                <p className="font-medium text-charcoal">No technical audits yet</p>
                <p className="text-sm text-warm-gray mt-1 max-w-sm">
                  Request a Technical Health Check from your Dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── On-Page Tab ───────────────────────────────────── */}
      {activeTab === 'onpage' && (
        <div className="space-y-6">
          {onPageDeliverables.length > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <FileSearch className="size-5 text-torii" />
                <h2 className="font-serif text-lg font-medium text-charcoal">
                  On-Page Analysis
                </h2>
              </div>
              <p className="text-sm text-warm-gray -mt-4">
                Page-level SEO analysis and meta tag optimization
              </p>

              <div className="space-y-3">
                {onPageDeliverables.map((d) => (
                  <DeliverableCard key={d.id} d={d} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
              <FileSearch className="size-12 text-warm-gray/50" />
              <div>
                <p className="font-medium text-charcoal">No on-page analysis yet</p>
                <p className="text-sm text-warm-gray mt-1 max-w-sm">
                  Request Page-by-Page SEO from your Dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function HealthEmptyState() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Website Health</h1>
        <p className="text-sm text-warm-gray mt-1">
          Technical SEO health, on-page analysis, and actionable recommendations
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
        <SearchX className="size-12 text-warm-gray/50" />
        <div>
          <p className="font-medium text-charcoal">No health data yet</p>
          <p className="text-sm text-warm-gray mt-1 max-w-sm">
            Kenji will run your first SEO audit after onboarding.
          </p>
        </div>
      </div>
    </div>
  )
}
