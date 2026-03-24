import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

interface Vital {
  name: string
  display_name: string
  value: string
  unit: string
  status: 'pass' | 'fail'
  explanation: string
}

const VITALS_MAP: Record<string, { display_name: string; unit: string; threshold: number; explanation: string }> = {
  lcp: {
    display_name: 'Page Load Speed',
    unit: 's',
    threshold: 2.5,
    explanation: 'How fast your main content loads — customers leave if it takes too long.',
  },
  fid: {
    display_name: 'Response Time',
    unit: 'ms',
    threshold: 100,
    explanation: 'How quickly your site responds when someone clicks a button.',
  },
  cls: {
    display_name: 'Visual Stability',
    unit: '',
    threshold: 0.1,
    explanation: 'How much your page shifts around while loading — annoying for visitors.',
  },
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

  // Try audits table first for CWV data
  const { data: audit } = await db
    .from('audits')
    .select('content, created_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let vitalsData: Record<string, number> | null = null

  if (audit?.content) {
    try {
      const content = typeof audit.content === 'string'
        ? JSON.parse(audit.content)
        : audit.content

      if (content?.core_web_vitals) {
        vitalsData = content.core_web_vitals
      } else if (content?.vitals) {
        vitalsData = content.vitals
      }
    } catch {
      // not parseable
    }
  }

  // Fallback to technical_report deliverable
  if (!vitalsData) {
    const { data: deliverable } = await db
      .from('deliverables')
      .select('content')
      .eq('client_id', clientId)
      .in('deliverable_type', ['technical_report', 'audit_report'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (deliverable?.content) {
      try {
        const content = typeof deliverable.content === 'string'
          ? JSON.parse(deliverable.content)
          : deliverable.content

        if (content?.core_web_vitals) {
          vitalsData = content.core_web_vitals
        } else if (content?.vitals) {
          vitalsData = content.vitals
        } else if (content?.categories?.technical?.vitals) {
          vitalsData = content.categories.technical.vitals
        }
      } catch {
        // not parseable
      }
    }
  }

  // Build vitals response
  const vitals: Vital[] = Object.entries(VITALS_MAP).map(([key, config]) => {
    const rawValue = vitalsData?.[key]
    const numValue = typeof rawValue === 'number' ? rawValue : 0

    let displayValue: string
    if (key === 'cls') {
      displayValue = numValue > 0 ? numValue.toFixed(3) : '--'
    } else if (key === 'lcp') {
      displayValue = numValue > 0 ? numValue.toFixed(1) : '--'
    } else {
      displayValue = numValue > 0 ? Math.round(numValue).toString() : '--'
    }

    const status: 'pass' | 'fail' = numValue > 0 && numValue <= config.threshold ? 'pass' : numValue > config.threshold ? 'fail' : 'pass'

    return {
      name: key.toUpperCase(),
      display_name: config.display_name,
      value: displayValue,
      unit: config.unit,
      status: numValue === 0 ? 'pass' : status,
      explanation: config.explanation,
    }
  })

  return NextResponse.json({ vitals })
}
