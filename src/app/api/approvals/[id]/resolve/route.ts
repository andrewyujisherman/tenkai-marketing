import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getAgentForRequest } from '@/lib/agents'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const status = body.status as string
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Fetch the approval to verify ownership
  const { data: approval, error: fetchErr } = await supabaseAdmin
    .from('approvals')
    .select('id, client_id, type, created_at')
    .eq('id', params.id)
    .single()

  if (fetchErr || !approval) {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
  }

  // Verify the user owns this client
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id, website_url, tier')
    .eq('auth_user_id', user.id)
    .single()

  if (!client || client.id !== approval.client_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Resolve the approval
  await supabaseAdmin
    .from('approvals')
    .update({
      status,
      resolved_at: new Date().toISOString(),
      reviewer_notes: body.notes ?? null,
    })
    .eq('id', params.id)

  // If profile_review was resolved, check if business_profile was edited
  // since the review was created — if so, re-trigger keyword_research
  if (approval.type === 'profile_review' && status === 'approved') {
    const { data: profile } = await supabaseAdmin
      .from('business_profile')
      .select('updated_at')
      .eq('client_id', client.id)
      .single()

    const profileUpdated = profile?.updated_at
    const reviewCreated = approval.created_at

    if (profileUpdated && reviewCreated && new Date(profileUpdated) > new Date(reviewCreated)) {
      // Profile was edited after the review was created — re-run keyword_research
      await supabaseAdmin
        .from('service_requests')
        .insert({
          client_id: client.id,
          request_type: 'keyword_research',
          target_url: client.website_url,
          parameters: { source: 'profile_correction', use_approved_keywords: false },
          assigned_agent: getAgentForRequest('keyword_research'),
          priority: 8,
        })
      console.log(`[approvals] Profile corrected — re-triggered keyword_research for ${client.id}`)
    }
  }

  return NextResponse.json({ success: true })
}
