import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

const DEMO_QUESTIONS = [
  {
    id: 'q-1',
    agent_id: 'haruki',
    agent_name: 'Haruki',
    agent_kanji: '春樹',
    question: 'What geographic areas do you want to prioritize for SEO this quarter?',
    answer: 'We want to focus on Austin proper and Round Rock. Cedar Park is secondary.',
    answered_at: '2026-03-15T10:30:00Z',
  },
  {
    id: 'q-2',
    agent_id: 'sakura',
    agent_name: 'Sakura',
    agent_kanji: '桜',
    question: 'Do you have any upcoming promotions or seasonal offers we should feature in content?',
    answer: 'Yes — we\'re running a spring AC tune-up special through April. $89 for a full inspection.',
    answered_at: '2026-03-12T14:15:00Z',
  },
  {
    id: 'q-3',
    agent_id: 'hana',
    agent_name: 'Hana',
    agent_kanji: '花',
    question: 'How do you typically respond to negative reviews? Any specific tone or policy?',
    answer: 'Always apologize first, offer to make it right, and ask them to call us directly. Never get defensive.',
    answered_at: '2026-03-10T09:45:00Z',
  },
  {
    id: 'q-4',
    agent_id: 'kenji',
    agent_name: 'Kenji',
    agent_kanji: '健二',
    question: 'Are there any pages on your site you consider most important for conversions?',
    answer: 'The /contact and /emergency-plumbing pages are our top converters. Also /water-heater-installation.',
    answered_at: '2026-03-08T16:20:00Z',
  },
]

export async function GET() {
  try {
    const demo = await isDemoMode()

    let clientId: string | undefined

    if (demo) {
      clientId = DEMO_CLIENT_ID
    } else {
      const supabase = await createServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      clientId = client?.id
      if (!clientId) {
        const { data: byEmail } = await supabaseAdmin
          .from('clients')
          .select('id')
          .eq('email', (user.email ?? '').toLowerCase())
          .single()
        clientId = byEmail?.id
      }
    }

    if (!clientId) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    // Try loading from agent_questions table
    const { data: questions } = await supabaseAdmin
      .from('agent_questions')
      .select('*')
      .eq('client_id', clientId)
      .order('answered_at', { ascending: false })
      .limit(20)

    if (questions && questions.length > 0) {
      return NextResponse.json({ questions })
    }

    // Demo fallback
    if (demo) return NextResponse.json({ questions: DEMO_QUESTIONS })

    return NextResponse.json({ questions: [] })
  } catch (err: unknown) {
    console.error('[business/agent-questions] error:', err)
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 })
  }
}
