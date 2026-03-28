import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { renderForBusinessOwner } from '@/lib/plain-english'
import { generateSummary, extractScore } from '@/lib/deliverables'

// ─── Brand Colors ────────────────────────────────────────────
const TORII = '#B85042'
const CHARCOAL = '#2C2C2C'
const PARCHMENT = '#F5F0E8'
const MUTED = '#666666'

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', fontSize: 11, color: CHARCOAL },
  // Cover page
  coverPage: { padding: 50, fontFamily: 'Helvetica', justifyContent: 'center', alignItems: 'center', backgroundColor: PARCHMENT },
  coverBrand: { fontSize: 36, fontFamily: 'Helvetica-Bold', color: TORII, marginBottom: 8 },
  coverSubtitle: { fontSize: 14, color: MUTED, marginBottom: 60 },
  coverTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: CHARCOAL, textAlign: 'center', marginBottom: 16 },
  coverClient: { fontSize: 16, color: MUTED, textAlign: 'center', marginBottom: 8 },
  coverDate: { fontSize: 12, color: MUTED, textAlign: 'center', marginTop: 40 },
  // Content pages
  sectionTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: TORII, marginBottom: 12, marginTop: 20 },
  subsectionTitle: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: CHARCOAL, marginBottom: 8, marginTop: 14 },
  body: { fontSize: 11, lineHeight: 1.6, color: CHARCOAL, marginBottom: 8 },
  label: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: TORII, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4, marginTop: 12 },
  scoreBox: { backgroundColor: PARCHMENT, borderRadius: 6, padding: 12, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreNumber: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: TORII },
  scoreLabel: { fontSize: 10, color: MUTED },
  divider: { borderBottomWidth: 1, borderBottomColor: '#E0D8CC', marginVertical: 16 },
  footer: { position: 'absolute', bottom: 30, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: MUTED },
  bulletItem: { flexDirection: 'row', marginBottom: 4, paddingLeft: 8 },
  bullet: { width: 12, fontSize: 11, color: TORII },
  bulletText: { flex: 1, fontSize: 11, lineHeight: 1.5, color: CHARCOAL },
})

// ─── Helper: render JSON sections as readable content ────────
function renderContentSection(key: string, value: unknown, depth = 0): React.ReactElement[] {
  const elements: React.ReactElement[] = []

  if (value === null || value === undefined) return elements

  const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  if (typeof value === 'string') {
    if (value.length > 0) {
      elements.push(
        React.createElement(View, { key: `${key}-${depth}`, style: { marginBottom: 6 } },
          React.createElement(Text, { style: styles.label }, label),
          React.createElement(Text, { style: styles.body }, value)
        )
      )
    }
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    elements.push(
      React.createElement(View, { key: `${key}-${depth}`, style: { marginBottom: 4 } },
        React.createElement(Text, { style: styles.body }, `${label}: ${value}`)
      )
    )
  } else if (Array.isArray(value)) {
    elements.push(
      React.createElement(View, { key: `${key}-${depth}-header` },
        React.createElement(Text, { style: styles.label }, label)
      )
    )
    value.slice(0, 20).forEach((item, i) => {
      if (typeof item === 'string') {
        elements.push(
          React.createElement(View, { key: `${key}-${depth}-${i}`, style: styles.bulletItem },
            React.createElement(Text, { style: styles.bullet }, '•'),
            React.createElement(Text, { style: styles.bulletText }, item)
          )
        )
      } else if (typeof item === 'object' && item !== null) {
        const record = item as Record<string, unknown>
        const name = record.title ?? record.name ?? record.keyword ?? record.url ?? record.description
        if (typeof name === 'string') {
          elements.push(
            React.createElement(View, { key: `${key}-${depth}-${i}`, style: styles.bulletItem },
              React.createElement(Text, { style: styles.bullet }, '•'),
              React.createElement(Text, { style: styles.bulletText }, name)
            )
          )
        }
      }
    })
    if (value.length > 20) {
      elements.push(
        React.createElement(Text, { key: `${key}-more`, style: { ...styles.body, color: MUTED, fontStyle: 'italic' } },
          `...and ${value.length - 20} more items`
        )
      )
    }
  } else if (typeof value === 'object' && depth < 2) {
    elements.push(
      React.createElement(Text, { key: `${key}-${depth}-title`, style: styles.subsectionTitle }, label)
    )
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      elements.push(...renderContentSection(k, v, depth + 1))
    }
  }

  return elements
}

// ─── PDF Document Component ──────────────────────────────────
function TenkaiReport({
  title,
  clientName,
  date,
  score,
  plainEnglish,
  technicalSummary,
  content,
}: {
  title: string
  clientName: string
  date: string
  score: number | null
  plainEnglish: { headline: string; summary: string; impact: string; recommendedAction: string }
  technicalSummary: string
  content: Record<string, unknown>
}) {
  const contentElements: React.ReactElement[] = []
  const skipKeys = new Set(['executive_summary', 'raw_response', 'overall_score', 'technical_score',
    'analytics_score', 'article_score', 'rewrite_score', 'schema_score', 'redirect_score',
    'robots_sitemap_score', 'outreach_score', 'guest_post_score', 'submission_score',
    'response_score', 'campaign_score', 'seo_score', 'content_score', 'quality_score',
    'link_profile_score', 'on_page_score', 'optimization_score', 'calendar_score',
    'cluster_score', 'local_seo_score', 'gbp_score', 'geo_score', 'entity_score',
    'competitive_score', 'decay_score', 'keyword_quality_score', 'performance_score',
    'seo_health_score'])

  for (const [key, value] of Object.entries(content)) {
    if (skipKeys.has(key)) continue
    contentElements.push(...renderContentSection(key, value))
  }

  return React.createElement(Document, {},
    // Cover page
    React.createElement(Page, { size: 'A4', style: styles.coverPage },
      React.createElement(Text, { style: styles.coverBrand }, '鳥居 TENKAI'),
      React.createElement(Text, { style: styles.coverSubtitle }, 'AI-Powered Marketing Intelligence'),
      React.createElement(View, { style: { marginTop: 40 } }),
      React.createElement(Text, { style: styles.coverTitle }, title),
      React.createElement(Text, { style: styles.coverClient }, `Prepared for ${clientName}`),
      React.createElement(Text, { style: styles.coverDate }, date),
    ),
    // Executive summary page
    React.createElement(Page, { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.sectionTitle }, 'Executive Summary'),
      score !== null && React.createElement(View, { style: styles.scoreBox },
        React.createElement(View, {},
          React.createElement(Text, { style: styles.scoreNumber }, `${score}`),
          React.createElement(Text, { style: styles.scoreLabel }, 'out of 100'),
        ),
        React.createElement(View, { style: { flex: 1, marginLeft: 16 } },
          React.createElement(Text, { style: { ...styles.body, fontFamily: 'Helvetica-Bold' } }, plainEnglish.headline),
        ),
      ),
      React.createElement(Text, { style: styles.label }, 'What This Means'),
      React.createElement(Text, { style: styles.body }, plainEnglish.summary),
      React.createElement(Text, { style: styles.label }, 'Impact on Your Business'),
      React.createElement(Text, { style: styles.body }, plainEnglish.impact),
      React.createElement(Text, { style: styles.label }, 'Recommended Next Step'),
      React.createElement(Text, { style: styles.body }, plainEnglish.recommendedAction),
      React.createElement(View, { style: styles.divider }),
      React.createElement(Text, { style: styles.label }, 'Technical Summary'),
      React.createElement(Text, { style: styles.body }, technicalSummary),
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, {}, '鳥居 Tenkai Marketing'),
        React.createElement(Text, {}, 'tenkai-marketing.vercel.app'),
      ),
    ),
    // Detail pages
    React.createElement(Page, { size: 'A4', style: styles.page, wrap: true },
      React.createElement(Text, { style: styles.sectionTitle }, 'Detailed Findings'),
      ...contentElements,
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, {}, '鳥居 Tenkai Marketing'),
        React.createElement(Text, {}, 'tenkai-marketing.vercel.app'),
      ),
    ),
  )
}

// ─── API Route ───────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const deliverableId = request.nextUrl.searchParams.get('id')
  if (!deliverableId) {
    return NextResponse.json({ error: 'Missing deliverable id' }, { status: 400 })
  }

  // Fetch deliverable + client info
  const { data: deliverable, error: delError } = await supabaseAdmin
    .from('deliverables')
    .select('id, client_id, deliverable_type, title, content, summary, score, created_at, request_id')
    .eq('id', deliverableId)
    .single()

  if (delError || !deliverable) {
    return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 })
  }

  // Get request_type from service_requests for accurate plain-english rendering
  let requestType = deliverable.deliverable_type
  if (deliverable.request_id) {
    const { data: req } = await supabaseAdmin
      .from('service_requests')
      .select('request_type')
      .eq('id', deliverable.request_id)
      .single()
    if (req?.request_type) requestType = req.request_type
  }

  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('company_name, name, website_url')
    .eq('id', deliverable.client_id)
    .single()

  const clientName = client?.company_name ?? client?.name ?? 'Valued Client'
  const content = (deliverable.content as Record<string, unknown>) ?? {}
  const score = deliverable.score ?? extractScore(requestType, content)
  const plainEnglish = renderForBusinessOwner(requestType, content)
  const technicalSummary = deliverable.summary ?? generateSummary(requestType, content)
  const date = new Date(deliverable.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const doc = React.createElement(TenkaiReport, {
    title: deliverable.title ?? 'Tenkai Report',
    clientName,
    date,
    score,
    plainEnglish,
    technicalSummary,
    content,
  })

  const pdfBuffer = await renderToBuffer(doc)

  const filename = `tenkai-${requestType}-${deliverable.id.slice(0, 8)}.pdf`
  return new NextResponse(Buffer.from(pdfBuffer) as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
