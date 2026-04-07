import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { captureMonthlySnapshot } from '@/lib/metrics-snapshot'
import { tierAllowsRequestType } from '@/lib/tier-gates'

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
    .select('id, name, company_name, email, tier, created_at')
    .not('email', 'is', null)
    .eq('status', 'active')
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
        const cadenceTypes = [
          'keyword_research',
          'competitor_analysis',
          'content_decay_audit',
          'on_page_audit',
          'site_audit',
        ]
        const allowedTypes = cadenceTypes.filter(t => tierAllowsRequestType(client.tier, t))
        const cadenceRows = allowedTypes.map(svcType => ({
          client_id: client.id,
          request_type: svcType,
          status: 'queued' as const,
          parameters: { auto_triggered: true, trigger: 'monthly_orchestrator', month: monthLabel },
          priority: 2,
        }))
        const { error: cadenceErr } = await supabaseAdmin
          .from('service_requests')
          .insert(cadenceRows)
        if (cadenceErr) {
          console.warn(`[monthly-cron] cadence insert failed for ${client.id}: ${cadenceErr.message}`)
        }
      }

      // ── Fetch richer context for AI narrative ──────────────
      const [{ data: seoContext }, { data: prevSnapshot }] = await Promise.all([
        supabaseAdmin
          .from('client_seo_context')
          .select('top_keywords, audit_findings, content_gaps, competitors, last_audit_score')
          .eq('client_id', client.id)
          .maybeSingle(),
        supabaseAdmin
          .from('client_metrics_history')
          .select('metrics, snapshot_date')
          .eq('client_id', client.id)
          .order('snapshot_date', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      const taskTitles = (recentDeliverables ?? []).map(d => d.title ?? d.deliverable_type)
      const tasksByType: Record<string, number> = {}
      for (const d of recentDeliverables ?? []) {
        const t = d.deliverable_type ?? 'other'
        tasksByType[t] = (tasksByType[t] ?? 0) + 1
      }

      const prevHealth = prevSnapshot?.metrics?.health_score ?? null
      const prevTasks = prevSnapshot?.metrics?.tasks_completed ?? null
      const healthTrend = healthScore !== null && prevHealth !== null
        ? (healthScore > prevHealth ? `improved from ${prevHealth} to ${healthScore}` : healthScore < prevHealth ? `decreased from ${prevHealth} to ${healthScore}` : `maintained at ${healthScore}`)
        : null

      // ── AI narrative ─────────────────────────────────────────
      let executiveSummary = `Your Tenkai team completed ${taskCount} task${taskCount !== 1 ? 's' : ''} this month.${healthScore !== null ? ` Current website health score: ${healthScore}/100.` : ''} ${publishedCount ?? 0} pieces of content are published and working for you.`
      let strategicRecommendations: string[] = []
      let keyHighlights: string[] = []

      const geminiApiKey = process.env.GEMINI_API_KEY
      if (geminiApiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiApiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

          const contextParts: string[] = [
            `Month: ${monthLabel}`,
            `Company: ${client.company_name ?? client.name ?? 'Unknown'}`,
            `Tasks completed this month: ${taskCount}`,
            `Task breakdown: ${Object.entries(tasksByType).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ')}`,
            `Specific deliverables: ${taskTitles.slice(0, 10).join('; ')}`,
            `Website health score: ${healthScore ?? 'unknown'}/100`,
            healthTrend ? `Health trend: ${healthTrend}` : '',
            `Published content: ${publishedCount ?? 0} pieces`,
            seoContext?.top_keywords?.length ? `Top keywords being tracked: ${(seoContext.top_keywords as Array<{keyword: string}>).slice(0, 5).map(k => k.keyword).join(', ')}` : '',
            seoContext?.audit_findings?.length ? `Key audit findings: ${(seoContext.audit_findings as Array<{finding: string}>).slice(0, 3).map(f => f.finding).join('; ')}` : '',
            seoContext?.competitors?.length ? `Competitors being tracked: ${(seoContext.competitors as Array<{domain: string}>).slice(0, 3).map(c => c.domain).join(', ')}` : '',
            prevTasks !== null ? `Previous month tasks: ${prevTasks}` : '',
          ].filter(Boolean)

          const prompt = `You are writing a monthly SEO progress report for a business owner who has zero SEO knowledge. Write in plain English — no jargon.

Data:
${contextParts.join('\n')}

Return ONLY valid JSON with this structure (no markdown fences):
{
  "executive_summary": "3-4 sentences. Be specific about what was accomplished and what it means for their business. Reference specific deliverables by name. If health score changed, explain what that means.",
  "key_highlights": ["3-4 bullet points of the most important wins or findings this month"],
  "strategic_recommendations": ["2-3 specific, actionable next steps for next month"],
  "month_over_month": "1-2 sentences comparing to previous month if data available, or noting this as a baseline month"
}`
          const result = await model.generateContent(prompt)
          const text = result.response.text().trim()
          const cleaned = text.replace(/^```json?\s*/i, '').replace(/```\s*$/, '')
          const parsed = JSON.parse(cleaned)
          if (parsed.executive_summary) executiveSummary = parsed.executive_summary
          if (Array.isArray(parsed.key_highlights)) keyHighlights = parsed.key_highlights
          if (Array.isArray(parsed.strategic_recommendations)) strategicRecommendations = parsed.strategic_recommendations
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
          previous_health_score: prevHealth,
        },
        key_highlights: keyHighlights,
        strategic_recommendations: strategicRecommendations.map((r, i) => ({ title: `Recommendation ${i + 1}`, description: r, priority: i === 0 ? 'high' : 'medium' })),
        month: monthLabel,
        tasks_this_month: taskTitles,
        task_breakdown: tasksByType,
      }

      // Create a service_request + deliverable for the monthly report
      const { data: serviceReq } = await supabaseAdmin
        .from('service_requests')
        .insert({
          client_id: client.id,
          request_type: 'monthly_report',
          status: 'completed',
          parameters: { month: monthLabel, auto_generated: true },
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
