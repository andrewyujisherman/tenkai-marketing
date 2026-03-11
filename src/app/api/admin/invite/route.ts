import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdmin } from '@/lib/admin'

async function getAdminUser() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getAdminUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: invites, error } = await supabaseAdmin
    .from('clients')
    .select('id, full_name, email, company_name, tier, created_at')
    .eq('status', 'invited')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ invites })
}

export async function POST(request: Request) {
  const user = await getAdminUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, email, company, tier } = body

  if (!name || !email || !company || !tier) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Create client record
  const { data: client, error: clientError } = await supabaseAdmin
    .from('clients')
    .insert({
      full_name: name,
      email,
      company_name: company,
      tier,
      status: 'invited',
    })
    .select('id')
    .single()

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 })
  }

  // Send Supabase invite email
  const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: name,
      company_name: company,
    },
  })

  if (inviteError) {
    // Clean up client record if invite fails
    await supabaseAdmin.from('clients').delete().eq('id', client.id)
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, clientId: client.id })
}
