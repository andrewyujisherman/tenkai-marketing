'use client'

import { useState } from 'react'
import { ScoreCircle } from '@/components/portal/ScoreCircle'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RefreshCw,
  Loader2,
  SearchX,
} from 'lucide-react'

/* ─── Types ───────────────────────────────────────────────── */
interface VitalData {
  name: string
  display_name: string
  value: string
  unit: string
  status: 'pass' | 'fail'
  explanation: string
}

interface Recommendation {
  priority: string
  title: string
  description: string
  agent?: string
}

interface HealthClientProps {
  score: number
  scoreLabel: string
  scoreColor: 'green' | 'amber' | 'red'
  lastAuditAt: string | null
  vitals: VitalData[]
  recommendations: Recommendation[]
  hasData: boolean
  clientTier: string
}

const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-error/10', text: 'text-error', label: 'High Impact' },
  medium: { bg: 'bg-warning/10', text: 'text-warning', label: 'Medium Impact' },
  low: { bg: 'bg-[#5B7B9A]/10', text: 'text-[#5B7B9A]', label: 'Low Impact' },
}

const tierAuditScope: Record<string, { label: string; description: string; request_types: string[] }> = {
  starter: {
    label: 'Basic Health Check',
    description: 'A quick check of your website\'s core health metrics.',
    request_types: ['site_audit'],
  },
  growth: {
    label: 'Health + Technical Analysis',
    description: 'Full health check plus a deep technical SEO audit.',
    request_types: ['site_audit', 'technical_audit'],
  },
  pro: {
    label: 'Full Health + Technical + On-Page Audit',
    description: 'Complete analysis of your website health, technical setup, and every page.',
    request_types: ['site_audit', 'technical_audit', 'on_page_audit'],
  },
}

/* ─── Empty State ─────────────────────────────────────────── */
export function HealthEmptyState() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Website Health</h1>
        <p className="text-sm text-warm-gray mt-1">
          Your website health score, Core Web Vitals, and recommendations
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-ivory p-16 text-center gap-4">
        <SearchX className="size-12 text-warm-gray/50" />
        <div>
          <p className="font-medium text-charcoal">No health data yet</p>
          <p className="text-sm text-warm-gray mt-1 max-w-sm">
            Run your first website audit to see your site health.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────── */
export default function HealthClient({
  score,
  scoreLabel,
  scoreColor,
  lastAuditAt,
  vitals,
  recommendations,
  hasData,
  clientTier,
}: HealthClientProps) {
  const [auditRunning, setAuditRunning] = useState(false)
  const [showAuditDialog, setShowAuditDialog] = useState(false)
  const [expandedRec, setExpandedRec] = useState<number | null>(null)
  const [showAllRecs, setShowAllRecs] = useState(false)

  const auditScope = tierAuditScope[clientTier] ?? tierAuditScope.starter

  async function handleRunAudit() {
    setAuditRunning(true)
    setShowAuditDialog(false)

    try {
      for (const requestType of auditScope.request_types) {
        await fetch('/api/services/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_type: requestType }),
        })
      }
      // On success, the page will refresh with new data
      // For now, reset state after a delay
      setTimeout(() => setAuditRunning(false), 5000)
    } catch {
      setAuditRunning(false)
    }
  }

  const visibleRecs = showAllRecs ? recommendations : recommendations.slice(0, 10)

  return (
    <div className="space-y-8">
      {/* Page header with Run Audit button */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal">Website Health</h1>
          <p className="text-sm text-warm-gray mt-1">
            Your website health score, Core Web Vitals, and recommendations
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => !auditRunning && setShowAuditDialog(true)}
            disabled={auditRunning}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-tenkai text-sm font-medium text-white transition-all duration-fast',
              auditRunning
                ? 'bg-warm-gray cursor-not-allowed'
                : 'bg-torii hover:bg-torii-dark active:scale-[0.98]'
            )}
            title={auditRunning ? 'An audit is already running.' : 'Run a new website audit'}
          >
            {auditRunning ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="size-4" />
                Run Audit
              </>
            )}
          </button>

          {/* Confirmation dialog */}
          {showAuditDialog && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAuditDialog(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-tenkai border border-tenkai-border bg-ivory shadow-tenkai-lg p-4">
                <h3 className="font-serif text-base font-semibold text-charcoal mb-1">
                  {auditScope.label}
                </h3>
                <p className="text-sm text-warm-gray mb-4">{auditScope.description}</p>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAuditDialog(false)}
                    className="px-3 py-1.5 text-sm rounded-tenkai border border-tenkai-border text-charcoal hover:bg-parchment transition-colors duration-fast"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRunAudit}
                    className="px-3 py-1.5 text-sm rounded-tenkai bg-torii text-white font-medium hover:bg-torii-dark transition-colors duration-fast"
                  >
                    Start Audit
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!hasData ? (
        /* Empty state with score gauge showing -- */
        <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-ivory p-16 text-center gap-6">
          <div className="relative" style={{ width: 160, height: 160 }}>
            <svg width={160} height={160} className="-rotate-90">
              <circle cx={80} cy={80} r={70} fill="none" stroke="#F5F1EB" strokeWidth={10} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-4xl font-semibold text-warm-gray">--</span>
            </div>
          </div>
          <div>
            <p className="font-medium text-charcoal">Run your first website audit</p>
            <p className="text-sm text-warm-gray mt-1 max-w-sm">
              Click the &ldquo;Run Audit&rdquo; button above to see your site health score.
            </p>
          </div>
          <a
            href="/settings#integrations"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-torii hover:text-torii-dark transition-colors"
          >
            Connect Google Search Console for more detailed insights →
          </a>
        </div>
      ) : (
        <>
          {/* Health Score Gauge */}
          <div className="flex justify-center">
            <div className="rounded-tenkai border border-tenkai-border bg-ivory p-8 text-center max-w-md w-full">
              <div
                className="mx-auto"
                title="Your score is based on technical health, page speed, mobile friendliness, and SEO best practices."
              >
                <ScoreCircle score={score} label="Website Health Score" size="lg" />
              </div>
              <p className={cn(
                'mt-4 text-sm font-medium',
                scoreColor === 'green' && 'text-success',
                scoreColor === 'amber' && 'text-warning',
                scoreColor === 'red' && 'text-error',
              )}>
                {scoreLabel}
              </p>
              {lastAuditAt && (
                <p className="text-xs text-warm-gray mt-1">
                  Last audit: {new Date(lastAuditAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Core Web Vitals */}
          <div>
            <h2 className="font-serif text-lg font-semibold text-charcoal mb-4">Core Web Vitals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {vitals.map((vital) => (
                <div
                  key={vital.name}
                  className="rounded-tenkai border border-tenkai-border bg-ivory p-5 hover:shadow-tenkai-md transition-shadow duration-normal group"
                  title={vital.explanation}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-warm-gray uppercase tracking-wider">
                      {vital.display_name}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-tenkai-sm text-xs font-semibold border',
                        vital.status === 'pass'
                          ? 'bg-success/10 border-success/20 text-success'
                          : 'bg-error/10 border-error/20 text-error'
                      )}
                    >
                      {vital.status === 'pass' ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <XCircle className="size-3" />
                      )}
                      {vital.status === 'pass' ? 'Good' : 'Needs Work'}
                    </span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="font-serif text-3xl font-semibold text-charcoal">
                      {vital.value}
                    </span>
                    {vital.unit && (
                      <span className="text-sm text-warm-gray pb-1">{vital.unit}</span>
                    )}
                  </div>
                  <p className="text-xs text-warm-gray mt-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-normal">
                    {vital.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="size-5 text-torii" />
                <h2 className="font-serif text-lg font-semibold text-charcoal">
                  Recommendations
                </h2>
              </div>
              <p className="text-sm text-warm-gray mb-4">
                Prioritized actions to improve your website health, in plain English
              </p>

              <div className="space-y-3">
                {visibleRecs.map((rec, i) => {
                  const config = priorityConfig[rec.priority.toLowerCase()] ?? priorityConfig.medium
                  const isExpanded = expandedRec === i

                  return (
                    <div
                      key={i}
                      className="rounded-tenkai border border-tenkai-border bg-ivory overflow-hidden hover:shadow-tenkai-sm transition-shadow duration-normal cursor-pointer"
                      onClick={() => setExpandedRec(isExpanded ? null : i)}
                    >
                      <div className="flex items-start gap-4 p-4">
                        <div className="flex items-center justify-center size-7 rounded-full bg-parchment text-sm font-semibold text-charcoal shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-charcoal">{rec.title}</span>
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                config.bg,
                                config.text
                              )}
                            >
                              {config.label}
                            </span>
                          </div>
                          {!isExpanded && (
                            <p className="text-sm text-warm-gray leading-relaxed line-clamp-1">
                              {rec.description}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 mt-1">
                          {isExpanded ? (
                            <ChevronUp className="size-4 text-warm-gray" />
                          ) : (
                            <ChevronDown className="size-4 text-warm-gray" />
                          )}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-0 ml-11">
                          <p className="text-sm text-charcoal/80 leading-relaxed">
                            {rec.description}
                          </p>
                          {rec.agent && (
                            <span className="text-xs text-warm-gray/70 mt-2 inline-block">
                              Being handled by {rec.agent}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {recommendations.length > 10 && !showAllRecs && (
                <button
                  onClick={() => setShowAllRecs(true)}
                  className="mt-4 text-sm font-medium text-torii hover:text-torii-dark transition-colors"
                >
                  Show all {recommendations.length} recommendations →
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
