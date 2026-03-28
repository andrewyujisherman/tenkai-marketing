'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast-notification'
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

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}

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
  gscConnected?: boolean
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

/* ─── Health Score Circle (mockup-matched: r=60, dasharray=377, torii arc) ─ */
function HealthScoreCircle({ score }: { score: number }) {
  const dasharray = 377
  const dashoffset = dasharray - (dasharray * score / 100)

  return (
    <div className="score-circle">
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={60} fill="none" stroke="var(--border-light)" strokeWidth={10} />
        <circle
          cx={70}
          cy={70}
          r={60}
          fill="none"
          stroke="var(--torii)"
          strokeWidth={10}
          strokeDasharray={dasharray}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="score-text">
        <span className="score-number">{score}</span>
        <span className="score-label">out of 100</span>
      </div>
    </div>
  )
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
            Run your first website audit to see your site health score, Core Web Vitals, and recommendations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="/health"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-tenkai bg-torii text-white text-sm font-medium hover:bg-torii-dark transition-colors duration-fast"
          >
            Run New Audit
          </a>
          <a
            href="/settings?tab=integrations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-tenkai border border-tenkai-border text-charcoal text-sm font-medium hover:bg-parchment transition-colors duration-fast"
          >
            Connect Search Console
          </a>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ──────────────────────────────────────── */
export default function HealthClient({
  score,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scoreLabel: _scoreLabel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scoreColor: _scoreColor,
  lastAuditAt,
  vitals,
  recommendations,
  hasData,
  clientTier,
  gscConnected = false,
}: HealthClientProps) {
  const { addToast } = useToast()
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
      setTimeout(() => setAuditRunning(false), 5000)
      addToast('success', 'Your audit is running — results will appear here shortly.')
    } catch {
      setAuditRunning(false)
      addToast('error', 'Audit request failed. Please try again.')
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
        <div className="portal-card flex flex-col items-center justify-center p-16 text-center gap-6">
          <div className="score-circle">
            <svg width={140} height={140}>
              <circle cx={70} cy={70} r={62} fill="none" stroke="#F5F1EB" strokeWidth={10} />
            </svg>
            <div className="score-text">
              <span className="score-number" style={{ color: 'var(--warm-gray)' }}>--</span>
            </div>
          </div>
          <div>
            <p className="font-medium text-charcoal">Run your first website audit</p>
            <p className="text-sm text-warm-gray mt-1 max-w-sm">
              Click the &ldquo;Run Audit&rdquo; button above to see your site health score.
            </p>
          </div>
          {!gscConnected && (
            <a
              href="/settings?tab=integrations"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-torii hover:text-torii-dark transition-colors"
            >
              Connect Google Search Console for more detailed insights →
            </a>
          )}
        </div>
      ) : (
        <>
          {/* Health Score + Summary */}
          <div className="portal-card">
            <div
              className="health-score-wrap"
              title="Your score is based on technical health, page speed, mobile friendliness, and SEO best practices."
            >
              <HealthScoreCircle score={score} />
              <div className="health-summary">
                <h3 className="font-serif text-base font-semibold text-charcoal">
                  {score >= 70 ? 'Good Health' : score >= 40 ? 'Needs Work' : 'Critical'}
                </h3>
                {lastAuditAt && (
                  <p className="text-xs text-warm-gray mt-1">
                    Last audit: {new Date(lastAuditAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                <p className="mt-3" style={{ fontSize: 13, color: 'var(--warm-gray)', lineHeight: 1.7 }}>
                  {score >= 70
                    ? 'Your site is in good shape. Keep an eye on the recommendations below to stay ahead of any issues.'
                    : score >= 40
                    ? 'Your site has some issues that need attention. Review the recommendations below to improve your score.'
                    : 'Your site has critical issues that may be hurting your visibility and performance. Act on the recommendations below.'}
                </p>
              </div>
            </div>
          </div>

          {/* Core Web Vitals */}
          <div>
            <h2 className="font-serif text-lg font-semibold text-charcoal mb-4">Core Web Vitals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {vitals.map((vital) => (
                <div
                  key={vital.name}
                  className="portal-card hover-lift group"
                  title={vital.explanation}
                  style={{ marginBottom: 0 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="section-label">
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
                    <span className="metric-lg">
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
            <div className="portal-card">
              <div className="portal-card-header" style={{ marginBottom: 4 }}>
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-5 text-torii" />
                  <h3>Recommendations</h3>
                </div>
              </div>
              <p className="text-sm text-warm-gray mb-4">
                Prioritized actions to improve your website health, in plain English
              </p>

              <div>
                {visibleRecs.map((rec, i) => {
                  const priority = rec.priority.toLowerCase() as 'high' | 'medium' | 'low'
                  const isExpanded = expandedRec === i

                  return (
                    <div
                      key={i}
                      className="recommendation-item cursor-pointer"
                      onClick={() => setExpandedRec(isExpanded ? null : i)}
                    >
                      <div className={cn('severity-dot', priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'medium')} />
                      <div className="rec-text">
                        <div className="rec-title flex items-center gap-2">
                          {rec.title}
                          <span className="shrink-0 mt-0.5">
                            {isExpanded ? (
                              <ChevronUp className="size-4 text-warm-gray" />
                            ) : (
                              <ChevronDown className="size-4 text-warm-gray" />
                            )}
                          </span>
                        </div>
                        {!isExpanded ? (
                          <p className="rec-desc line-clamp-1">{stripMarkdown(rec.description)}</p>
                        ) : (
                          <div className="mt-1">
                            <p className="rec-desc" style={{ fontSize: 13, color: 'var(--charcoal)', opacity: 0.8 }}>
                              {stripMarkdown(rec.description)}
                            </p>
                            {rec.agent && (
                              <span className="text-xs text-warm-gray/70 mt-2 inline-block">
                                Being handled by {rec.agent}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
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
