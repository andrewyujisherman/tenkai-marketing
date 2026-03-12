import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'

// GET /api/admin/demo-mode?launch=true — sets cookie and redirects to /dashboard
// GET /api/admin/demo-mode?exit=true — clears cookie and redirects to /admin
// GET /api/admin/demo-mode — returns current state
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const launch = request.nextUrl.searchParams.get('launch')
  const exit = request.nextUrl.searchParams.get('exit')

  if (launch === 'true') {
    const url = new URL('/dashboard', request.url)
    const response = NextResponse.redirect(url)
    response.cookies.set('demo_mode', 'true', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
    })
    return response
  }

  if (exit === 'true') {
    const url = new URL('/admin', request.url)
    const response = NextResponse.redirect(url)
    response.cookies.delete('demo_mode')
    return response
  }

  const enabled = request.cookies.get('demo_mode')?.value === 'true'
  return NextResponse.json({ enabled })
}
