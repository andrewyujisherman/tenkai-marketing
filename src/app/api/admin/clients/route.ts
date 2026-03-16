import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdmin } from '@/lib/admin'
import { sendWelcomeEmail } from '@/lib/email'
import crypto from 'crypto'

async function requireAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return null
  return user
}

function generateTempPassword(): string {
  return 'Tenkai!' + crypto.randomBytes(4).toString('hex')
}

// GET /api/admin/clients — list all clients
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: clients, error } = await supabaseAdmin
    .from('clients')
    .select('id, name, email, company_name, website_url, tier, status, onboarding_data, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ clients })
}

// POST /api/admin/clients — create new client with auth user
export async function POST(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, email, company, tier } = body

  if (!name || !email || !company || !tier) {
    return NextResponse.json({ error: 'Missing required fields: name, email, company, tier' }, { status: 400 })
  }

  // Check if client email already exists
  const { data: existingClient } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existingClient) {
    return NextResponse.json({ error: 'A client with this email already exists' }, { status: 409 })
  }

  const tempPassword = generateTempPassword()

  // Create auth user with temp password
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.toLowerCase(),
    password: tempPassword,
    email_confirm: true,
    app_metadata: { role: 'client' },
    user_metadata: { full_name: name, company_name: company },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  // Create client record linked to auth user
  // Try with auth_user_id first (after migration), fall back to email-only
  let client = null
  let clientError = null

  const insertData: Record<string, string> = {
    name,
    email: email.toLowerCase(),
    company_name: company,
    tier,
    status: 'invited',
  }

  // Try with auth_user_id (works after migration)
  const { data: c1, error: e1 } = await supabaseAdmin
    .from('clients')
    .insert({ ...insertData, auth_user_id: authUser.user.id })
    .select('id')
    .single()

  if (e1?.message?.includes('auth_user_id')) {
    // Column doesn't exist yet — insert without it
    const { data: c2, error: e2 } = await supabaseAdmin
      .from('clients')
      .insert(insertData)
      .select('id')
      .single()
    client = c2
    clientError = e2
  } else {
    client = c1
    clientError = e1
  }

  if (clientError || !client) {
    // Rollback: delete auth user if client record fails
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: clientError?.message ?? 'Failed to create client' }, { status: 500 })
  }

  // Send welcome email with temp password
  await sendWelcomeEmail(email.toLowerCase(), name, tempPassword)

  return NextResponse.json({
    success: true,
    client: {
      id: client.id,
      authUserId: authUser.user.id,
      email: email.toLowerCase(),
      tempPassword,
    },
  })
}

// PATCH /api/admin/clients — update client
export async function PATCH(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'Client id is required' }, { status: 400 })
  }

  // Only allow safe fields
  const allowed = ['name', 'company_name', 'website_url', 'tier', 'status']
  const safeUpdates: Record<string, string> = {}
  for (const key of allowed) {
    if (updates[key] !== undefined) safeUpdates[key] = updates[key]
  }

  const { data: client, error } = await supabaseAdmin
    .from('clients')
    .update(safeUpdates)
    .eq('id', id)
    .select('id, name, email, status')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, client })
}

// DELETE /api/admin/clients — deactivate client (soft delete)
export async function DELETE(request: Request) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Client id is required' }, { status: 400 })

  // Get client to find auth user
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('auth_user_id')
    .eq('id', id)
    .single()

  // Soft delete: set status to deactivated
  const { error } = await supabaseAdmin
    .from('clients')
    .update({ status: 'deactivated' })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Disable the auth user (ban, don't delete)
  if (client?.auth_user_id) {
    await supabaseAdmin.auth.admin.updateUserById(client.auth_user_id, {
      ban_duration: '876000h', // 100 years
    })
  }

  return NextResponse.json({ success: true })
}
