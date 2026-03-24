import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isDemoMode, DEMO_CLIENT_ID } from '@/lib/demo'

export interface ActionItemResponse {
  items: {
    id: string
    type: 'content_approval' | 'agent_question' | 'setup_task' | 'report_review'
    title: string
    agent_name: string
    preview: string
    created_at: string
    content_id?: string
    deliverable_id?: string
  }[]
  count: number
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
      return NextResponse.json({ items: [], count: 0 })
    }

    const db = demo ? supabaseAdmin : supabase

    // Get pending approvals
    const { data: pendingApprovals } = await db
      .from('approvals')
      .select('id, content_post_id, title, type, agent_name, description, created_at', { count: 'exact' })
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)

    // Get content posts needing review
    const { data: pendingContent } = await db
      .from('content_posts')
      .select('id, title, agent_author, content_type, created_at')
      .eq('client_id', clientId)
      .in('status', ['draft', 'pending_review', 'pending_approval'])
      .order('created_at', { ascending: false })
      .limit(10)

    // Build action items from approvals
    const approvalItems = (pendingApprovals ?? []).map(a => ({
      id: `approval-${a.id}`,
      type: 'content_approval' as const,
      title: a.title ?? 'Content needs your approval',
      agent_name: a.agent_name ?? 'Tenkai Team',
      preview: a.description ?? 'Review and approve this content.',
      created_at: a.created_at,
      content_id: a.content_post_id ?? undefined,
    }))

    // Build action items from content posts (avoid duplicates with approvals)
    const approvedContentIds = new Set(approvalItems.map(a => a.content_id).filter(Boolean))
    const contentItems = (pendingContent ?? [])
      .filter(p => !approvedContentIds.has(p.id))
      .map(p => ({
        id: `content-${p.id}`,
        type: 'content_approval' as const,
        title: p.title ?? 'Content ready for review',
        agent_name: p.agent_author ?? 'Tenkai Team',
        preview: `New ${(p.content_type ?? 'content').replace(/_/g, ' ')} is ready for your review.`,
        created_at: p.created_at,
        content_id: p.id,
      }))

    const allItems = [...approvalItems, ...contentItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15)

    return NextResponse.json({
      items: allItems,
      count: allItems.length,
    } satisfies ActionItemResponse)
  } catch {
    return NextResponse.json({ items: [], count: 0 })
  }
}
