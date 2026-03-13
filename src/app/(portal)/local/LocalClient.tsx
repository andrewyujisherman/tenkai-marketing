'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScoreCircle } from '@/components/portal/ScoreCircle'
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Star,
  Building2,
  MessageSquare,
  SearchX,
  FileText,
} from 'lucide-react'
import type { LocalDeliverable } from './page'

/* ── Score badge ──────────────────────────────────────────────── */
function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 80
      ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
      : score >= 50
        ? 'bg-[#C49A3C]/10 text-[#C49A3C]'
        : 'bg-torii/10 text-torii'
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {score}/100
    </span>
  )
}

/* ── Priority badge ───────────────────────────────────────────── */
const priorityColor: Record<string, string> = {
  high: 'bg-torii/10 text-torii',
  medium: 'bg-[#C49A3C]/10 text-[#C49A3C]',
  low: 'bg-[#5B7B9A]/10 text-[#5B7B9A]',
}

function PriorityBadge({ priority }: { priority: string }) {
  const key = priority.toLowerCase()
  const cls = priorityColor[key] ?? 'bg-parchment text-charcoal'
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${cls}`}>
      {priority}
    </span>
  )
}

/* ── Timestamp helper ─────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ── Try-parse content JSON ───────────────────────────────────── */
function tryParseContent(content: string | null): Record<string, unknown> | null {
  if (!content) return null
  try {
    const parsed = JSON.parse(content)
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/* ── Section renderers for structured local audit ─────────────── */
interface StructuredSection {
  label: string
  value: string | number | boolean | null
  status?: 'good' | 'warning' | 'bad'
}

function parseLocalSections(
  data: Record<string, unknown>
): { sections: StructuredSection[]; recommendations: Array<{ text: string; priority?: string }> } {
  const sections: StructuredSection[] = []
  const recommendations: Array<{ text: string; priority?: string }> = []

  const sectionKeys: Record<string, string> = {
    gbp_completeness: 'GBP Completeness',
    nap_consistency: 'NAP Consistency',
    citations: 'Citations',
    reviews: 'Reviews',
    local_pack_ranking: 'Local Pack Ranking',
    schema_markup: 'Schema Markup',
    map_visibility: 'Map Visibility',
  }

  for (const [key, label] of Object.entries(sectionKeys)) {
    if (key in data) {
      const val = data[key]
      let status: 'good' | 'warning' | 'bad' = 'good'
      let display: string

      if (typeof val === 'number') {
        display = `${val}%`
        status = val >= 80 ? 'good' : val >= 50 ? 'warning' : 'bad'
      } else if (typeof val === 'boolean') {
        display = val ? 'Yes' : 'No'
        status = val ? 'good' : 'bad'
      } else if (typeof val === 'object' && val !== null) {
        const obj = val as Record<string, unknown>
        display = obj.score != null ? `${obj.score}` : JSON.stringify(val)
        const s = Number(obj.score ?? 0)
        status = s >= 80 ? 'good' : s >= 50 ? 'warning' : 'bad'
      } else {
        display = String(val ?? 'N/A')
      }

      sections.push({ label, value: display, status })
    }
  }

  if (Array.isArray(data.recommendations)) {
    for (const rec of data.recommendations) {
      if (typeof rec === 'string') {
        recommendations.push({ text: rec })
      } else if (typeof rec === 'object' && rec !== null) {
        const r = rec as Record<string, unknown>
        recommendations.push({
          text: (r.text ?? r.title ?? r.description ?? '') as string,
          priority: (r.priority ?? r.impact) as string | undefined,
        })
      }
    }
  }

  return { sections, recommendations }
}

/* ── GBP field checklist ──────────────────────────────────────── */
interface GbpField {
  name: string
  complete: boolean
}

function parseGbpFields(data: Record<string, unknown>): GbpField[] {
  const fields: GbpField[] = []
  const fieldKeys: Record<string, string> = {
    business_name: 'Business Name',
    address: 'Address',
    phone: 'Phone Number',
    website: 'Website',
    hours: 'Business Hours',
    categories: 'Categories',
    description: 'Business Description',
    photos: 'Photos',
    services: 'Services',
    attributes: 'Attributes',
    posts: 'Posts',
    reviews_enabled: 'Reviews Enabled',
    messaging: 'Messaging',
  }

  const checklistData = (data.fields ?? data.checklist ?? data) as Record<string, unknown>

  for (const [key, label] of Object.entries(fieldKeys)) {
    if (key in checklistData) {
      const val = checklistData[key]
      fields.push({
        name: label,
        complete: val === true || val === 'complete' || val === 'yes' || (typeof val === 'number' && val > 0),
      })
    }
  }

  return fields
}

/* ══════════════════════════════════════════════════════════════════
   LOCAL AUDIT TAB
   ══════════════════════════════════════════════════════════════════ */
function LocalAuditTab({ items }: { items: LocalDeliverable[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
        <MapPin className="size-12 text-warm-gray/40" />
        <div>
          <p className="font-medium text-charcoal">No local audit yet</p>
          <p className="text-sm text-warm-gray mt-1 max-w-sm">
            Request a Local Visibility Audit from your Dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const parsed = tryParseContent(item.content)
        const { sections, recommendations } = parsed
          ? parseLocalSections(parsed)
          : { sections: [], recommendations: [] }

        return (
          <div
            key={item.id}
            className="rounded-tenkai border border-tenkai-border bg-white p-6 space-y-5"
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-serif font-medium text-charcoal">
                    {item.title ?? 'Local Audit Report'}
                  </h3>
                  {item.score != null && <ScoreBadge score={item.score} />}
                  {item.status && (
                    <span className="rounded-full bg-parchment px-2 py-0.5 text-[10px] font-medium text-charcoal capitalize">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-warm-gray">
                  {item.agent_name && <span>By {item.agent_name}</span>}
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
              {item.score != null && (
                <div className="shrink-0">
                  <ScoreCircle score={item.score} label="Local Score" size="sm" />
                </div>
              )}
            </div>

            {/* Summary */}
            {item.summary && (
              <p className="text-sm text-warm-gray leading-relaxed">{item.summary}</p>
            )}

            {/* Structured sections */}
            {sections.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {sections.map((sec) => (
                  <div
                    key={sec.label}
                    className="rounded-tenkai border border-tenkai-border bg-parchment/50 p-3"
                  >
                    <p className="text-[11px] text-warm-gray mb-1">{sec.label}</p>
                    <div className="flex items-center gap-1.5">
                      {sec.status === 'good' && (
                        <CheckCircle2 className="size-3.5 text-[#4A7C59]" />
                      )}
                      {sec.status === 'warning' && (
                        <AlertTriangle className="size-3.5 text-[#C49A3C]" />
                      )}
                      {sec.status === 'bad' && (
                        <AlertTriangle className="size-3.5 text-torii" />
                      )}
                      <span className="text-sm font-medium text-charcoal">{String(sec.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-charcoal mb-2">Recommendations</h4>
                <div className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-tenkai border border-tenkai-border bg-ivory/50 p-3"
                    >
                      <div className="flex items-center justify-center size-5 rounded-full bg-parchment text-[10px] font-semibold text-charcoal shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-charcoal">{rec.text}</span>
                          {rec.priority && <PriorityBadge priority={rec.priority} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback: plain text content when no structured data */}
            {sections.length === 0 && recommendations.length === 0 && item.content && !parsed && (
              <div className="rounded-tenkai bg-parchment/50 p-4">
                <p className="text-sm text-warm-gray whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   GOOGLE PROFILE TAB
   ══════════════════════════════════════════════════════════════════ */
function GoogleProfileTab({ items }: { items: LocalDeliverable[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
        <Building2 className="size-12 text-warm-gray/40" />
        <div>
          <p className="font-medium text-charcoal">No GBP analysis yet</p>
          <p className="text-sm text-warm-gray mt-1 max-w-sm">
            Request a Google Business Profile review from your Dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const parsed = tryParseContent(item.content)
        const fields = parsed ? parseGbpFields(parsed) : []
        const completeness =
          fields.length > 0
            ? Math.round((fields.filter((f) => f.complete).length / fields.length) * 100)
            : item.score ?? 0
        const gbpRecommendations: string[] = parsed && Array.isArray(parsed.recommendations)
          ? (parsed.recommendations as Array<string | Record<string, unknown>>).map((r) =>
              typeof r === 'string' ? r : ((r as Record<string, unknown>).text ?? (r as Record<string, unknown>).title ?? '') as string
            ).filter(Boolean)
          : []

        return (
          <div
            key={item.id}
            className="rounded-tenkai border border-tenkai-border bg-white p-6 space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-serif font-medium text-charcoal">
                    {item.title ?? 'Google Business Profile Report'}
                  </h3>
                  {item.status && (
                    <span className="rounded-full bg-parchment px-2 py-0.5 text-[10px] font-medium text-charcoal capitalize">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-warm-gray">
                  {item.agent_name && <span>By {item.agent_name}</span>}
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
              <div className="shrink-0">
                <ScoreCircle score={completeness} label="Complete" size="sm" />
              </div>
            </div>

            {/* Summary */}
            {item.summary && (
              <p className="text-sm text-warm-gray leading-relaxed">{item.summary}</p>
            )}

            {/* Checklist */}
            {fields.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-charcoal mb-3">Profile Checklist</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {fields.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-center gap-2.5 rounded-tenkai border border-tenkai-border bg-parchment/50 px-3 py-2"
                    >
                      {field.complete ? (
                        <CheckCircle2 className="size-4 text-[#4A7C59] shrink-0" />
                      ) : (
                        <AlertTriangle className="size-4 text-[#C49A3C] shrink-0" />
                      )}
                      <span className="text-sm text-charcoal">{field.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {gbpRecommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-charcoal mb-2">
                  Optimization Recommendations
                </h4>
                <div className="space-y-2">
                  {gbpRecommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-tenkai border border-tenkai-border bg-ivory/50 p-3"
                    >
                      <div className="flex items-center justify-center size-5 rounded-full bg-parchment text-[10px] font-semibold text-charcoal shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-sm text-charcoal">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback */}
            {fields.length === 0 && gbpRecommendations.length === 0 && item.content && !parsed && (
              <div className="rounded-tenkai bg-parchment/50 p-4">
                <p className="text-sm text-warm-gray whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   REVIEWS TAB
   ══════════════════════════════════════════════════════════════════ */
function ReviewsTab({ items }: { items: LocalDeliverable[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const responses = items.filter((d) => d.deliverable_type === 'review_responses')
  const campaigns = items.filter((d) => d.deliverable_type === 'campaign_templates')

  if (responses.length === 0 && campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
        <Star className="size-12 text-warm-gray/40" />
        <div>
          <p className="font-medium text-charcoal">No review strategies yet</p>
          <p className="text-sm text-warm-gray mt-1 max-w-sm">
            Request Review Replies or Get More Reviews from your Dashboard.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Review Responses */}
      {responses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="size-5 text-torii" />
            <h3 className="font-serif text-lg font-medium text-charcoal">Review Replies</h3>
          </div>

          <div className="space-y-4">
            {responses.map((item) => {
              const parsed = tryParseContent(item.content)
              const replyEntries: Array<{
                id: string
                context: string
                reply: string
                rating?: number
              }> = []

              if (parsed && Array.isArray(parsed.replies)) {
                for (const [idx, entry] of (parsed.replies as Array<Record<string, unknown>>).entries()) {
                  replyEntries.push({
                    id: `${item.id}-reply-${idx}`,
                    context: (entry.review ?? entry.context ?? entry.original ?? '') as string,
                    reply: (entry.reply ?? entry.response ?? entry.suggested_reply ?? '') as string,
                    rating: entry.rating as number | undefined,
                  })
                }
              }

              if (replyEntries.length === 0 && item.content) {
                replyEntries.push({
                  id: `${item.id}-single`,
                  context: item.summary ?? '',
                  reply: typeof item.content === 'string' && !parsed ? item.content : (parsed?.reply as string) ?? item.content ?? '',
                })
              }

              return (
                <div key={item.id} className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-warm-gray">
                    <span className="font-medium text-charcoal text-sm">
                      {item.title ?? 'Review Responses'}
                    </span>
                    {item.agent_name && <span>By {item.agent_name}</span>}
                    <span>{formatDate(item.created_at)}</span>
                  </div>

                  {replyEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-tenkai border border-tenkai-border bg-white p-4 space-y-3"
                    >
                      {/* Review context */}
                      {entry.context && (
                        <div className="rounded-tenkai bg-parchment/50 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[11px] font-medium text-warm-gray">
                              Customer Review
                            </span>
                            {entry.rating != null && (
                              <span className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`size-3 ${
                                      i < entry.rating!
                                        ? 'fill-[#C49A3C] text-[#C49A3C]'
                                        : 'text-warm-gray/30'
                                    }`}
                                  />
                                ))}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-charcoal leading-relaxed">{entry.context}</p>
                        </div>
                      )}

                      {/* Suggested reply */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-medium text-warm-gray">
                            Suggested Reply
                          </span>
                          <button
                            onClick={() => copyText(entry.id, entry.reply)}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-warm-gray hover:text-charcoal hover:bg-parchment transition-colors"
                          >
                            {copiedId === entry.id ? (
                              <>
                                <Check className="size-3 text-[#4A7C59]" />
                                <span className="text-[#4A7C59]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-charcoal leading-relaxed">{entry.reply}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Campaign Templates */}
      {campaigns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="size-5 text-torii" />
            <h3 className="font-serif text-lg font-medium text-charcoal">
              Review Campaign Templates
            </h3>
          </div>

          <div className="space-y-4">
            {campaigns.map((item) => {
              const parsed = tryParseContent(item.content)
              const templates: Array<{
                id: string
                label: string
                type: string
                body: string
              }> = []

              if (parsed && Array.isArray(parsed.templates)) {
                for (const [idx, tpl] of (parsed.templates as Array<Record<string, unknown>>).entries()) {
                  templates.push({
                    id: `${item.id}-tpl-${idx}`,
                    label: (tpl.label ?? tpl.name ?? tpl.subject ?? `Template ${idx + 1}`) as string,
                    type: (tpl.type ?? tpl.channel ?? 'email') as string,
                    body: (tpl.body ?? tpl.text ?? tpl.content ?? '') as string,
                  })
                }
              }

              if (templates.length === 0 && item.content) {
                templates.push({
                  id: `${item.id}-raw`,
                  label: item.title ?? 'Campaign Template',
                  type: 'template',
                  body: typeof item.content === 'string' && !parsed ? item.content : JSON.stringify(parsed, null, 2),
                })
              }

              return (
                <div key={item.id} className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-warm-gray">
                    <span className="font-medium text-charcoal text-sm">
                      {item.title ?? 'Campaign Templates'}
                    </span>
                    {item.agent_name && <span>By {item.agent_name}</span>}
                    <span>{formatDate(item.created_at)}</span>
                  </div>

                  {item.summary && (
                    <p className="text-sm text-warm-gray leading-relaxed">{item.summary}</p>
                  )}

                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-tenkai border border-tenkai-border bg-white p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-charcoal">{tpl.label}</span>
                          <span className="rounded-full bg-parchment px-2 py-0.5 text-[10px] font-medium text-charcoal capitalize">
                            {tpl.type}
                          </span>
                        </div>
                        <button
                          onClick={() => copyText(tpl.id, tpl.body)}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-warm-gray hover:text-charcoal hover:bg-parchment transition-colors"
                        >
                          {copiedId === tpl.id ? (
                            <>
                              <Check className="size-3 text-[#4A7C59]" />
                              <span className="text-[#4A7C59]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-warm-gray leading-relaxed whitespace-pre-wrap">
                        {tpl.body}
                      </p>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MAIN CLIENT COMPONENT
   ══════════════════════════════════════════════════════════════════ */
interface LocalClientProps {
  localAudits: LocalDeliverable[]
  gbpReports: LocalDeliverable[]
  reviews: LocalDeliverable[]
}

export default function LocalClient({ localAudits, gbpReports, reviews }: LocalClientProps) {
  const defaultTab =
    localAudits.length > 0 ? 'local' : gbpReports.length > 0 ? 'gbp' : 'reviews'

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Local &amp; Reviews</h1>
        <p className="text-sm text-warm-gray mt-1">
          Your local visibility, Google Business Profile, and review management
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList variant="line" className="mb-4">
          <TabsTrigger value="local" className="gap-1.5">
            <MapPin className="size-3.5" />
            Local Audit
            {localAudits.length > 0 && (
              <span className="ml-1 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
                {localAudits.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="gbp" className="gap-1.5">
            <Building2 className="size-3.5" />
            Google Profile
            {gbpReports.length > 0 && (
              <span className="ml-1 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
                {gbpReports.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5">
            <Star className="size-3.5" />
            Reviews
            {reviews.length > 0 && (
              <span className="ml-1 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
                {reviews.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local">
          <LocalAuditTab items={localAudits} />
        </TabsContent>

        <TabsContent value="gbp">
          <GoogleProfileTab items={gbpReports} />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab items={reviews} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ── Empty state (exported for server component) ──────────────── */
export function LocalEmptyState() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Local &amp; Reviews</h1>
        <p className="text-sm text-warm-gray mt-1">
          Your local visibility, Google Business Profile, and review management
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
        <SearchX className="size-12 text-warm-gray/40" />
        <div>
          <p className="font-medium text-charcoal">No local data yet</p>
          <p className="text-sm text-warm-gray mt-1 max-w-sm">
            Your Tenkai team will generate local audit reports, GBP analysis, and review strategies after onboarding.
          </p>
        </div>
      </div>
    </div>
  )
}
