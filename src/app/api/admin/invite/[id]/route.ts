import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdmin } from '@/lib/admin'

async function getAuthedAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Resend invite
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedAdmin()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: client, error: fetchError } = await supabaseAdmin
    .from('clients')
    .select('email, name, company_name')
    .eq('id', id)
    .eq('status', 'invited')
    .single()

  if (fetchError || !client) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tenkai-marketing.vercel.app'

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(client.email, {
    data: { full_name: client.name, company_name: client.company_name },
    redirectTo: `${appUrl}/auth/callback?type=invite`,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// Cancel invite
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedAdmin()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Fetch the invite to get the email
  const { data: client, error: fetchError } = await supabaseAdmin
    .from('clients')
    .select('email')
    .eq('id', id)
    .eq('status', 'invited')
    .single()

  if (fetchError || !client) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  }

  // Delete the auth user for this email if one exists
  const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers()
  const authUser = allUsers?.users?.find(
    (u) => u.email?.toLowerCase() === client.email.toLowerCase()
  )
  if (authUser) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.id)
  }

  // Delete the client record
  const { error } = await supabaseAdmin
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
