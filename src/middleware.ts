import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? 'andrewyujisherman@gmail.com').split(',').map(e => e.trim().toLowerCase())

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Admin routes — must be authenticated AND admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    const email = user.email?.toLowerCase() ?? ''
    if (!ADMIN_EMAILS.includes(email)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Protected routes — redirect to login if not authenticated (demo mode bypasses)
  const protectedPaths = ['/dashboard', '/content', '/audit', '/health', '/reports', '/settings', '/onboarding', '/integrations', '/links', '/local', '/rankings', '/metrics', '/business']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isDemo = request.cookies.get('demo_mode')?.value === 'true'

  if (isProtected && !user && !isDemo) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    // Preserve full path + query params so post-login redirect works (e.g. /onboarding?url=...)
    const redirectPath = request.nextUrl.pathname + request.nextUrl.search
    url.searchParams.set('redirect', redirectPath)
    return NextResponse.redirect(url)
  }

  // Redirect /audit → /health (legacy route)
  if (request.nextUrl.pathname.startsWith('/audit')) {
    const url = request.nextUrl.clone()
    url.pathname = '/health'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages (except set-password for invited users)
  if (user && request.nextUrl.pathname.startsWith('/auth/') && request.nextUrl.pathname !== '/auth/set-password') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/content/:path*', '/audit/:path*', '/health/:path*', '/reports/:path*', '/settings/:path*', '/onboarding/:path*', '/integrations/:path*', '/links/:path*', '/local/:path*', '/rankings/:path*', '/metrics/:path*', '/business/:path*', '/auth/:path*', '/admin/:path*'],
}
