import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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
      const { data: { user } } = await supabase.auth.getUser()

      // Admin-invited users go to set-password flow — no client row needed here
      if (user?.invited_at) {
        return NextResponse.redirect(`${origin}/auth/set-password`)
      }

      if (user) {
        // Ensure a clients row exists for self-signup users
        const { data: existingClient } = await supabaseAdmin
          .from('clients')
          .select('id, onboarding_data')
          .or(`auth_user_id.eq.${user.id},email.eq.${(user.email ?? '').toLowerCase()}`)
          .single()

        if (!existingClient) {
          const name = user.user_metadata?.full_name ?? ''
          const company_name = user.user_metadata?.company_name ?? ''
          const website_url = user.user_metadata?.website_url ?? null

          const insertData: Record<string, string | null> = {
            email: (user.email ?? '').toLowerCase(),
            auth_user_id: user.id,
            name,
            company_name,
            status: 'onboarding',
          }
          if (website_url) insertData.website_url = website_url

          await supabaseAdmin.from('clients').insert(insertData)

          // New client — needs onboarding
          return NextResponse.redirect(`${origin}/onboarding`)
        }

        // Existing client — redirect based on onboarding completion
        const needsOnboarding =
          !existingClient.onboarding_data ||
          (typeof existingClient.onboarding_data === 'object' &&
            Object.keys(existingClient.onboarding_data).length === 0)

        if (needsOnboarding) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // On failure, send to signup — never login
  return NextResponse.redirect(`${origin}/auth/signup`)
}
