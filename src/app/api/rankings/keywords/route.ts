import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

export async function GET(request: Request) {
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
  const { searchParams } = new URL(request.url)
  const page = Math.max(parseInt(searchParams.get('page') ?? '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '20', 10), 1), 100)

  // Get keyword_list deliverables
  const { data: keywordDeliverables } = await db
    .from('deliverables')
    .select('content, created_at')
    .eq('client_id', clientId)
    .eq('deliverable_type', 'keyword_list')
    .order('created_at', { ascending: false })
    .limit(10)

  if (!keywordDeliverables || keywordDeliverables.length === 0) {
    return NextResponse.json({ keywords: [], total: 0 })
  }

  // Parse keywords from the latest deliverable
  const latest = keywordDeliverables[0]
  let allKeywords: Array<{
    keyword?: string
    position?: number
    change?: number
    trend?: number[]
    page_url?: string
    recommendation?: string
  }> = []

  try {
    const content = typeof latest.content === 'string'
      ? JSON.parse(latest.content)
      : latest.content

    if (content?.keywords && Array.isArray(content.keywords)) {
      allKeywords = content.keywords
    } else if (Array.isArray(content)) {
      allKeywords = content
    }
  } catch {
    // not parseable
  }

  const total = allKeywords.length
  const start = (page - 1) * limit
  const paged = allKeywords.slice(start, start + limit)

  const keywords = paged.map((k) => ({
    keyword: k.keyword ?? 'Unknown',
    position: k.position ?? 0,
    change: k.change ?? 0,
    trend: Array.isArray(k.trend) ? k.trend : [],
    page_url: k.page_url ?? '',
    recommendation: k.recommendation ?? '',
  }))

  return NextResponse.json({ keywords, total })
}
