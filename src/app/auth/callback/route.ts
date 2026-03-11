import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Called from Server Component — ignored
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if this is an invited user who needs to set a password
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.invited_at) {
        return NextResponse.redirect(`${origin}/auth/set-password`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // On failure, send to signup — never login
  return NextResponse.redirect(`${origin}/auth/signup`)
}
