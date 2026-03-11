import { createBrowserClient, createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Client-side Supabase client (browser). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/** Singleton browser client — use in client components that need a stable reference. */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

/** Server-side Supabase client (App Router server components / route handlers). */
export async function createServerClient() {
  const cookieStore = await cookies()

  return _createServerClient(supabaseUrl, supabaseAnonKey, {
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
          // setAll called from a Server Component — safe to ignore;
          // middleware handles session refresh.
        }
      },
    },
  })
}
