import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdmin } from '@/lib/admin'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Prevent self-removal
  if (id === user.id) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
  }

  // Verify target is an admin
  const { data: targetUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(id)
  if (fetchError || !targetUser?.user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (targetUser.user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'User is not an admin' }, { status: 400 })
  }

  // Remove admin role by updating app_metadata
  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    app_metadata: { ...targetUser.user.app_metadata, role: null },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
