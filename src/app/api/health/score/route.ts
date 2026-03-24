import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

function scoreLabel(score: number): string {
  if (score >= 80) return 'Your site is in great shape'
  if (score >= 50) return 'A few things to improve'
  return 'Needs attention'
}

function scoreColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 80) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

export async function GET() {
  const supabase = await createServerClient()
  const demo = await isDemoMode()

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
      const { data: clientByEmail } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('email', (user.email ?? '').toLowerCase())
        .single()

      if (!clientByEmail) {
        return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })
      }
      clientId = clientByEmail.id
    } else {
      clientId = client.id
    }
  }

  const db = demo ? supabaseAdmin : supabase

  // Try audits table first
  const { data: audit } = await db
    .from('audits')
    .select('overall_score, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (audit && audit.overall_score != null) {
    const score = audit.overall_score
    return NextResponse.json({
      score,
      label: scoreLabel(score),
      color: scoreColor(score),
      last_audit_at: audit.created_at,
    })
  }

  // Fallback to audit_report deliverable
  const { data: deliverable } = await db
    .from('deliverables')
    .select('score, content, created_at')
    .eq('client_id', clientId)
    .eq('deliverable_type', 'audit_report')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (deliverable) {
    let score = deliverable.score ?? 0

    if (!score && deliverable.content) {
      try {
        const content = typeof deliverable.content === 'string'
          ? JSON.parse(deliverable.content)
          : deliverable.content

        if (content?.categories) {
          const cats = content.categories as Record<string, { score?: number }>
          const scores = Object.values(cats)
            .map((c) => c.score)
            .filter((s): s is number => typeof s === 'number')
          if (scores.length > 0) {
            score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          }
        }
      } catch {
        // not parseable
      }
    }

    return NextResponse.json({
      score,
      label: scoreLabel(score),
      color: scoreColor(score),
      last_audit_at: deliverable.created_at,
    })
  }

  // No data
  return NextResponse.json({
    score: 0,
    label: 'No audit data',
    color: 'red' as const,
    last_audit_at: null,
  })
}
