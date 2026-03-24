import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

export interface DashboardMetric {
  name: string
  value: string | number
  trend: 'up' | 'down' | 'flat'
  change_pct: string
  period: string
  link_to: string
}

export async function GET() {
  try {
    const demo = await isDemoMode()
    const supabase = await createServerClient()
    let clientId: string | null = null

    if (demo) {
      clientId = DEMO_CLIENT_ID
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      if (!client) {
        const { data: byEmail } = await supabaseAdmin
          .from('clients')
          .select('id')
          .eq('email', (user.email ?? '').toLowerCase())
          .single()
        clientId = byEmail?.id ?? null
      } else {
        clientId = client.id
      }
    }

    if (!clientId) {
      return NextResponse.json({ metrics: [] })
    }

    const db = demo ? supabaseAdmin : supabase

    // Get latest audit score
    const { data: auditData } = await db
      .from('audits')
      .select('overall_score')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Fallback: get score from deliverables
    let healthScore: number | null = auditData?.overall_score ?? null
    if (healthScore === null) {
      const { data: auditDeliverable } = await db
        .from('deliverables')
        .select('score')
        .eq('client_id', clientId)
        .eq('deliverable_type', 'audit_report')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      healthScore = auditDeliverable?.score ?? null
    }

    // Get content counts
    const { count: totalContent } = await db
      .from('content_posts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)

    const { count: publishedContent } = await db
      .from('content_posts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'published')

    // Build metrics array
    const metrics: DashboardMetric[] = [
      {
        name: 'Website Visits',
        value: '--',
        trend: 'flat' as const,
        change_pct: '',
        period: 'Connect analytics to track',
        link_to: '/metrics?tab=traffic',
      },
      {
        name: 'Rankings Position',
        value: '--',
        trend: 'flat' as const,
        change_pct: '',
        period: 'Run an audit to see rankings',
        link_to: '/rankings',
      },
      {
        name: 'Health Score',
        value: healthScore !== null ? `${healthScore}/100` : '--',
        trend: healthScore !== null ? (healthScore >= 70 ? 'up' : 'down') : 'flat' as const,
        change_pct: healthScore !== null ? '' : '',
        period: healthScore !== null ? 'Latest audit' : 'Run an audit to see score',
        link_to: '/health',
      },
      {
        name: 'Content Published',
        value: publishedContent ?? 0,
        trend: (publishedContent ?? 0) > 0 ? 'up' : 'flat' as const,
        change_pct: totalContent ? `${publishedContent ?? 0} of ${totalContent} total` : '',
        period: 'All time',
        link_to: '/content',
      },
    ]

    return NextResponse.json({ metrics })
  } catch {
    return NextResponse.json({ metrics: [] })
  }
}
