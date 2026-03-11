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
    .select('id, name, email, company_name, tier, created_at')
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tenkai-marketing.vercel.app'

  // Clean up any existing auth user for this email to avoid conflicts
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )
  if (existingUser) {
    await supabaseAdmin.auth.admin.deleteUser(existingUser.id)
  }

  // Delete any existing client record for this email
  await supabaseAdmin.from('clients').delete().eq('email', email)

  // Send Supabase invite email FIRST — redirectTo MUST point to production URL
  const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: name,
      company_name: company,
    },
    redirectTo: `${appUrl}/auth/callback`,
  })

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  // Create client record AFTER invite succeeds
  const { data: client, error: clientError } = await supabaseAdmin
    .from('clients')
    .insert({
      name,
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

  return NextResponse.json({ success: true, clientId: client.id })
}
