import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { renderForBusinessOwner } from '@/lib/plain-english'
import { generateSummary, extractScore } from '@/lib/deliverables'

// ─── Brand Colors ────────────────────────────────────────────
const TORII = [197, 61, 61] as const   // #C53D3D
const CHARCOAL = [44, 44, 44] as const // #2C2C2C
const PARCHMENT = [245, 240, 232] as const // #F5F0E8
const MUTED = [102, 102, 102] as const // #666666
const DIVIDER = [224, 216, 204] as const // #E0D8CC
const WHITE = [255, 255, 255] as const
const SCORE_GREEN = [34, 139, 34] as const  // ≥70
const SCORE_AMBER = [204, 153, 0] as const  // 40-69
const SCORE_RED = [197, 61, 61] as const    // <40

function scoreColor(score: number): readonly [number, number, number] {
  if (score >= 70) return SCORE_GREEN
  if (score >= 40) return SCORE_AMBER
  return SCORE_RED
}

// ─── Layout Constants ────────────────────────────────────────
const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 25
const CONTENT_W = PAGE_W - 2 * MARGIN
const LINE_H = 6
const FOOTER_Y = PAGE_H - 15

// ─── Helper: wrap text and track Y, auto-paginate ───────────
let _footerDate = ''
function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth)
  for (const line of lines) {
    if (y > FOOTER_Y - 10) {
      addFooter(doc, _footerDate)
      doc.addPage()
      y = MARGIN
    }
    doc.text(line, x, y)
    y += lineHeight
  }
  return y
}

function addFooter(doc: jsPDF, dateStr?: string) {
  const pageNum = doc.getNumberOfPages()
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  const footerText = `Prepared by Tenkai SEO${dateStr ? ` · ${dateStr}` : ''} · Confidential`
  doc.text(footerText, MARGIN, FOOTER_Y)
  doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' })
}

function addLabel(doc: jsPDF, label: string, y: number): number {
  if (y > FOOTER_Y - 20) { addFooter(doc); doc.addPage(); y = MARGIN }
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TORII)
  doc.text(label.toUpperCase(), MARGIN, y)
  return y + 5
}

function addBody(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CHARCOAL)
  return addWrappedText(doc, text, MARGIN, y, CONTENT_W, LINE_H)
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  if (y > FOOTER_Y - 25) { addFooter(doc); doc.addPage(); y = MARGIN }
  y += 4
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TORII)
  doc.text(title, MARGIN, y)
  return y + 10
}

function addSubsectionTitle(doc: jsPDF, title: string, y: number): number {
  if (y > FOOTER_Y - 20) { addFooter(doc); doc.addPage(); y = MARGIN }
  y += 3
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CHARCOAL)
  doc.text(title, MARGIN, y)
  return y + 7
}

// ─── Skip keys (scores already shown in summary) ────────────
const SKIP_KEYS = new Set([
  'executive_summary', 'raw_response', 'overall_score', 'technical_score',
  'analytics_score', 'article_score', 'rewrite_score', 'schema_score', 'redirect_score',
  'robots_sitemap_score', 'outreach_score', 'guest_post_score', 'submission_score',
  'response_score', 'campaign_score', 'seo_score', 'content_score', 'quality_score',
  'link_profile_score', 'on_page_score', 'optimization_score', 'calendar_score',
  'cluster_score', 'local_seo_score', 'gbp_score', 'geo_score', 'entity_score',
  'competitive_score', 'decay_score', 'keyword_quality_score', 'performance_score',
  'seo_health_score',
])

function formatKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function renderContentSection(doc: jsPDF, key: string, value: unknown, y: number, depth = 0): number {
  if (value === null || value === undefined) return y
  const label = formatKey(key)

  if (typeof value === 'string' && value.trim()) {
    y = addLabel(doc, label, y)
    y = addBody(doc, value.trim(), y)
    y += 2
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...CHARCOAL)
    y = addWrappedText(doc, `${label}: ${value}`, MARGIN, y, CONTENT_W, LINE_H)
    y += 1
  } else if (Array.isArray(value)) {
    y = addLabel(doc, label, y)
    const items = value.slice(0, 20)
    for (const item of items) {
      if (y > FOOTER_Y - 10) { addFooter(doc); doc.addPage(); y = MARGIN }
      let text = ''
      if (typeof item === 'string') {
        text = item
      } else if (typeof item === 'object' && item !== null) {
        const rec = item as Record<string, unknown>
        const name = rec.title ?? rec.name ?? rec.keyword ?? rec.url ?? rec.description
        if (typeof name === 'string') text = name
      }
      if (text) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...CHARCOAL)
        doc.text('\u2022', MARGIN + 2, y)
        y = addWrappedText(doc, text, MARGIN + 8, y, CONTENT_W - 8, LINE_H)
      }
    }
    if (value.length > 20) {
      doc.setFontSize(9)
      doc.setTextColor(...MUTED)
      doc.text(`...and ${value.length - 20} more items`, MARGIN + 8, y)
      y += LINE_H
    }
    y += 2
  } else if (typeof value === 'object' && depth < 2) {
    y = addSubsectionTitle(doc, label, y)
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      y = renderContentSection(doc, k, v, y, depth + 1)
    }
  }
  return y
}

// ─── Build PDF ──────────────────────────────────────────────
function buildPdf({
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
}): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  _footerDate = date

  // ── Cover Page ──────────────────────────────────────────
  doc.setFillColor(...PARCHMENT)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')

  // Torii red header bar
  doc.setFillColor(...TORII)
  doc.rect(0, 0, PAGE_W, 18, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('TENKAI SEO', PAGE_W / 2, 12, { align: 'center' })

  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TORII)
  doc.text('TENKAI', PAGE_W / 2, 100, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.text('AI-Powered SEO Intelligence', PAGE_W / 2, 112, { align: 'center' })

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CHARCOAL)
  const titleLines = doc.splitTextToSize(title, CONTENT_W)
  doc.text(titleLines, PAGE_W / 2, 150, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.text(`Prepared for ${clientName}`, PAGE_W / 2, 175, { align: 'center' })

  doc.setFontSize(11)
  doc.text(date, PAGE_W / 2, 200, { align: 'center' })

  // ── Executive Summary Page ─────────────────────────────
  doc.addPage()
  let y = MARGIN

  y = addSectionTitle(doc, 'Executive Summary', y)

  // Score box with color-coded score
  if (score !== null) {
    doc.setFillColor(...PARCHMENT)
    doc.roundedRect(MARGIN, y, CONTENT_W, 22, 3, 3, 'F')
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...scoreColor(score))
    doc.text(`${score}`, MARGIN + 8, y + 15)
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text('/100', MARGIN + 8 + doc.getTextWidth(`${score}`) + 2, y + 15)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...CHARCOAL)
    const headlineLines = doc.splitTextToSize(plainEnglish.headline, CONTENT_W - 55)
    doc.text(headlineLines, MARGIN + 50, y + 10)
    y += 28
  }

  y = addLabel(doc, 'What This Means', y)
  y = addBody(doc, plainEnglish.summary, y)
  y += 2

  y = addLabel(doc, 'Impact on Your Business', y)
  y = addBody(doc, plainEnglish.impact, y)
  y += 2

  y = addLabel(doc, 'Recommended Next Step', y)
  y = addBody(doc, plainEnglish.recommendedAction, y)
  y += 4

  // Divider
  doc.setDrawColor(...DIVIDER)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
  y += 6

  y = addLabel(doc, 'Technical Summary', y)
  y = addBody(doc, technicalSummary, y)

  addFooter(doc, date)

  // ── Detailed Findings Page(s) ──────────────────────────
  doc.addPage()
  y = MARGIN
  y = addSectionTitle(doc, 'Detailed Findings', y)

  for (const [key, value] of Object.entries(content)) {
    if (SKIP_KEYS.has(key)) continue
    y = renderContentSection(doc, key, value, y)
  }

  addFooter(doc, date)

  return Buffer.from(doc.output('arraybuffer'))
}

// ─── Shared: fetch deliverable + generate PDF response ──────
async function generatePdfResponse(deliverableId: string): Promise<NextResponse> {
  const { data: deliverable, error: delError } = await supabaseAdmin
    .from('deliverables')
    .select('id, client_id, deliverable_type, title, content, summary, score, created_at, request_id')
    .eq('id', deliverableId)
    .single()

  if (delError || !deliverable) {
    return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 })
  }

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

  const pdfBuffer = buildPdf({
    title: deliverable.title ?? 'Tenkai Report',
    clientName,
    date,
    score,
    plainEnglish,
    technicalSummary,
    content,
  })

  const filename = `tenkai-${requestType}-${deliverable.id.slice(0, 8)}.pdf`
  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}

// ─── GET /api/reports/pdf?id=<deliverableId> ────────────────
export async function GET(request: NextRequest) {
  const deliverableId = request.nextUrl.searchParams.get('id')
  if (!deliverableId) {
    return NextResponse.json({ error: 'Missing deliverable id' }, { status: 400 })
  }
  return generatePdfResponse(deliverableId)
}

// ─── POST /api/reports/pdf { deliverableId } ────────────────
export async function POST(request: NextRequest) {
  let body: { deliverableId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!body.deliverableId) {
    return NextResponse.json({ error: 'Missing deliverableId' }, { status: 400 })
  }
  return generatePdfResponse(body.deliverableId)
}
