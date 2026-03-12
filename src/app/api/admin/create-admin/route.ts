import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdmin } from '@/lib/admin'

export async function POST(request: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email } = await request.json()
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const masterPassword = process.env.ADMIN_MASTER_PASSWORD
  if (!masterPassword) {
    return NextResponse.json({ error: 'ADMIN_MASTER_PASSWORD not configured' }, { status: 500 })
  }

  // Check if user already exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
  const existing = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  )

  if (existing) {
    // Update existing user to admin role
    const { error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password: masterPassword,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, action: 'updated', userId: existing.id })
  }

  // Create new admin user
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: masterPassword,
    email_confirm: true,
    app_metadata: { role: 'admin' },
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, action: 'created', userId: newUser.user.id })
}
