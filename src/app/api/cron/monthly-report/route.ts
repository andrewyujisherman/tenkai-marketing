import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { captureMonthlySnapshot } from '@/lib/metrics-snapshot'

// ─── GET /api/cron/monthly-report ────────────────────────
// Vercel cron: runs 09:00 on the 1st of each month
// Auth: Vercel sends Authorization: Bearer $CRON_SECRET automatically
// Manual test: GET /api/cron/monthly-report?dryRun=true

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tenkai-marketing.vercel.app'

export async function GET(request: NextRequest) {
  // Auth check — only skip in development
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true'

  // Fetch all active clients with email
  const { data: clients, error } = await supabaseAdmin
    .from('clients')
    .select('id, name, company_name, email, created_at')
    .not('email', 'is', null)
    .neq('id', '00000000-0000-0000-0000-000000000001') // exclude demo

  if (error || !clients) {
    return NextResponse.json({ error: 'Failed to fetch clients', details: error }, { status: 500 })
  }

  const results: Array<{
    clientId: string
    email: string
    status: 'sent' | 'skipped' | 'error' | 'dry_run'
    reason?: string
  }> = []

  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  for (const client of clients) {
    try {
      // Capture snapshot for this month
      if (!dryRun) {
        await captureMonthlySnapshot(client.id)
      }

      // Check if we already sent a monthly report this month
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { data: existing } = await supabaseAdmin
        .from('deliverables')
        .select('id')
        .eq('client_id', client.id)
        .eq('deliverable_type', 'monthly_report')
        .gte('created_at', firstOfMonth)
        .limit(1)
        .maybeSingle()

      if (existing) {
        results.push({ clientId: client.id, email: client.email!, status: 'skipped', reason: 'already sent this month' })
        continue
      }

      if (dryRun) {
        results.push({ clientId: client.id, email: client.email!, status: 'dry_run', reason: `would send report for ${monthLabel}` })
        continue
      }

      // Get recent metrics for the report content
      const [{ data: recentDeliverables }, { count: publishedCount }, { data: auditRow }] = await Promise.all([
        supabaseAdmin
          .from('deliverables')
          .select('deliverable_type, title, created_at')
          .eq('client_id', client.id)
          .gte('created_at', new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString())
          .order('created_at', { ascending: false })
          .limit(20),
        supabaseAdmin
          .from('content_posts')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('status', 'published'),
        supabaseAdmin
          .from('audits')
          .select('overall_score')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      const taskCount = recentDeliverables?.length ?? 0
      const healthScore = auditRow?.overall_score ?? null

      // ── Trigger monthly service cadence for this client ──────
      // Queue worker processes these over the month; chains handle the rest.
      if (!dryRun) {
        const cadenceServices = [
          'keyword_research',
          'competitor_analysis',
          'content_decay_audit',
          'on_page_audit',
          'site_audit',
        ]
        const cadenceRows = cadenceServices.map(svcType => ({
          client_id: client.id,
          request_type: svcType,
          status: 'pending' as const,
          input_data: { auto_triggered: true, trigger: 'monthly_orchestrator', month: monthLabel },
          priority: 2,
        }))
        const { error: cadenceErr } = await supabaseAdmin
          .from('service_requests')
          .insert(cadenceRows)
        if (cadenceErr) {
          console.warn(`[monthly-cron] cadence insert failed for ${client.id}: ${cadenceErr.message}`)
        }
      }

      // ── AI narrative ─────────────────────────────────────────
      let executiveSummary = `Your Tenkai team completed ${taskCount} task${taskCount !== 1 ? 's' : ''} this month.${healthScore !== null ? ` Current website health score: ${healthScore}/100.` : ''} ${publishedCount ?? 0} pieces of content are published and working for you.`

      const geminiApiKey = process.env.GEMINI_API_KEY
      if (geminiApiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiApiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
          const prompt = `Write a 3-4 sentence plain-English SEO progress summary for a business owner. Be specific, positive, and actionable. Data: month=${monthLabel}, tasks_completed=${taskCount}, health_score=${healthScore ?? 'unknown'}/100, published_content=${publishedCount ?? 0} pieces. No jargon. No bullet points. No sign-offs.`
          const result = await model.generateContent(prompt)
          const text = result.response.text().trim()
          if (text) executiveSummary = text
        } catch (aiErr) {
          console.warn(`[monthly-cron] Gemini narrative failed for ${client.id}:`, aiErr)
          // fall through to hardcoded summary
        }
      }

      const reportContent = {
        executive_summary: executiveSummary,
        kpi_dashboard: {
          organic_traffic: null,
          content_published: publishedCount ?? 0,
          health_score: healthScore,
          tasks_completed: taskCount,
        },
        month: monthLabel,
        tasks_this_month: (recentDeliverables ?? []).map(d => d.title ?? d.deliverable_type),
      }

      // Create a service_request + deliverable for the monthly report
      const { data: serviceReq } = await supabaseAdmin
        .from('service_requests')
        .insert({
          client_id: client.id,
          request_type: 'monthly_report',
          status: 'completed',
          input_data: { month: monthLabel, auto_generated: true },
        })
        .select('id')
        .single()

      const { data: deliverable } = await supabaseAdmin
        .from('deliverables')
        .insert({
          client_id: client.id,
          request_id: serviceReq?.id ?? null,
          deliverable_type: 'monthly_report',
          title: `${monthLabel} SEO Report — ${client.company_name ?? client.name ?? 'Your Business'}`,
          agent_name: 'Tenkai Team',
          content: reportContent,
          summary: reportContent.executive_summary,
          score: healthScore,
        })
        .select('id')
        .single()

      if (!deliverable) {
        results.push({ clientId: client.id, email: client.email!, status: 'error', reason: 'failed to create deliverable' })
        continue
      }

      // Send email via existing email route
      const emailRes = await fetch(`${SITE_URL}/api/reports/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliverableId: deliverable.id }),
      })

      if (emailRes.ok) {
        results.push({ clientId: client.id, email: client.email!, status: 'sent' })
      } else {
        const emailErr = await emailRes.json().catch(() => ({}))
        results.push({ clientId: client.id, email: client.email!, status: 'error', reason: JSON.stringify(emailErr) })
      }
    } catch (err) {
      results.push({
        clientId: client.id,
        email: client.email!,
        status: 'error',
        reason: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const sent = results.filter(r => r.status === 'sent').length
  const skipped = results.filter(r => r.status === 'skipped').length
  const errors = results.filter(r => r.status === 'error').length

  return NextResponse.json({
    success: true,
    month: monthLabel,
    dryRun,
    summary: { total: clients.length, sent, skipped, errors },
    results,
  })
}
