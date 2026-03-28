import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { renderForBusinessOwner } from '@/lib/plain-english'
import { generateSummary, extractScore } from '@/lib/deliverables'
import { sendReportEmail } from '@/lib/email'

// ─── Brand Colors ────────────────────────────────────────────
const TORII = '#B85042'
const CHARCOAL = '#2C2C2C'
const PARCHMENT = '#F5F0E8'

// ─── POST /api/reports/email ─────────────────────────────────
// Body: { deliverableId: string, to?: string }
// If `to` is omitted, sends to the client's email on file
export async function POST(request: NextRequest) {
  let body: { deliverableId?: string; to?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { deliverableId, to: overrideEmail } = body
  if (!deliverableId) {
    return NextResponse.json({ error: 'Missing deliverableId' }, { status: 400 })
  }

  // Fetch deliverable
  const { data: deliverable, error: delError } = await supabaseAdmin
    .from('deliverables')
    .select('id, client_id, deliverable_type, title, content, summary, score, created_at, request_id')
    .eq('id', deliverableId)
    .single()

  if (delError || !deliverable) {
    return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 })
  }

  // Get request_type
  let requestType = deliverable.deliverable_type
  if (deliverable.request_id) {
    const { data: req } = await supabaseAdmin
      .from('service_requests')
      .select('request_type')
      .eq('id', deliverable.request_id)
      .single()
    if (req?.request_type) requestType = req.request_type
  }

  // Fetch client
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('company_name, name, email, website_url')
    .eq('id', deliverable.client_id)
    .single()

  const recipientEmail = overrideEmail ?? client?.email
  if (!recipientEmail) {
    return NextResponse.json({ error: 'No recipient email — client has no email on file and none provided' }, { status: 400 })
  }

  const clientName = client?.name ?? client?.company_name ?? 'there'
  const content = (deliverable.content as Record<string, unknown>) ?? {}
  const score = deliverable.score ?? extractScore(requestType, content)
  const plainEnglish = renderForBusinessOwner(requestType, content)
  const technicalSummary = deliverable.summary ?? generateSummary(requestType, content)
  const title = deliverable.title ?? 'Tenkai Report'

  // Build PDF URL for download link
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tenkai-marketing.vercel.app'
  const pdfUrl = `${baseUrl}/api/reports/pdf?id=${deliverable.id}`

  // Build HTML email
  const html = buildEmailHtml({
    clientName,
    title,
    score,
    plainEnglish,
    technicalSummary,
    pdfUrl,
    isMonthlyReport: requestType === 'monthly_report',
  })

  const subject = requestType === 'monthly_report'
    ? `Your Monthly SEO Report — ${title}`
    : `New Report Ready: ${title}`

  const result = await sendReportEmail(recipientEmail, subject, html)

  if (!result.success) {
    return NextResponse.json({ error: 'Failed to send email', details: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, sentTo: recipientEmail })
}

// ─── HTML Email Builder ──────────────────────────────────────
function buildEmailHtml({
  clientName,
  title,
  score,
  plainEnglish,
  technicalSummary,
  pdfUrl,
  isMonthlyReport,
}: {
  clientName: string
  title: string
  score: number | null
  plainEnglish: { headline: string; summary: string; impact: string; recommendedAction: string }
  technicalSummary: string
  pdfUrl: string
  isMonthlyReport: boolean
}): string {
  const scoreHtml = score !== null ? `
    <div style="background: ${PARCHMENT}; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <div style="font-size: 42px; font-weight: bold; color: ${TORII};">${score}<span style="font-size: 16px; color: #999;">/100</span></div>
      <div style="font-size: 13px; color: #777; margin-top: 4px;">Overall Score</div>
    </div>
  ` : ''

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: ${CHARCOAL};">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 24px; font-weight: bold; color: ${TORII};">鳥居 TENKAI</div>
        <div style="font-size: 12px; color: #999; margin-top: 4px;">AI-Powered Marketing Intelligence</div>
      </div>

      <h1 style="font-size: 22px; color: ${CHARCOAL}; margin-bottom: 8px;">${isMonthlyReport ? 'Your Monthly Report' : 'New Report Ready'}</h1>
      <p style="color: #555; line-height: 1.6;">Hi ${clientName},</p>
      <p style="color: #555; line-height: 1.6;">${isMonthlyReport
        ? 'Here\'s your monthly SEO performance summary from Tenkai.'
        : `Your latest report is ready: <strong>${title}</strong>`
      }</p>

      ${scoreHtml}

      <h2 style="font-size: 16px; color: ${TORII}; margin-top: 24px; margin-bottom: 8px;">${plainEnglish.headline}</h2>
      <p style="color: #555; line-height: 1.6;">${plainEnglish.summary}</p>

      <div style="background: #f9f9f7; border-left: 3px solid ${TORII}; padding: 12px 16px; margin: 16px 0;">
        <div style="font-size: 11px; font-weight: bold; color: ${TORII}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Impact on Your Business</div>
        <p style="color: #555; line-height: 1.5; margin: 0;">${plainEnglish.impact}</p>
      </div>

      <div style="background: #f9f9f7; border-left: 3px solid ${TORII}; padding: 12px 16px; margin: 16px 0;">
        <div style="font-size: 11px; font-weight: bold; color: ${TORII}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Recommended Next Step</div>
        <p style="color: #555; line-height: 1.5; margin: 0;">${plainEnglish.recommendedAction}</p>
      </div>

      <details style="margin: 16px 0;">
        <summary style="cursor: pointer; color: ${TORII}; font-weight: bold; font-size: 13px;">Technical Summary</summary>
        <p style="color: #777; line-height: 1.5; font-size: 13px; margin-top: 8px;">${technicalSummary}</p>
      </details>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${pdfUrl}" style="display: inline-block; background: ${TORII}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Download Full PDF Report</a>
      </div>

      <a href="https://tenkai-marketing.vercel.app/dashboard" style="display: block; text-align: center; color: ${TORII}; font-size: 13px; margin-top: 12px;">View Dashboard →</a>

      <hr style="border: none; border-top: 1px solid #e8e4dc; margin: 30px 0;" />
      <p style="color: #999; font-size: 11px; text-align: center;">
        鳥居 Tenkai Marketing — AI-powered SEO for growing businesses<br/>
        <a href="https://tenkai-marketing.vercel.app" style="color: #999;">tenkai-marketing.vercel.app</a>
      </p>
    </div>
  `
}
