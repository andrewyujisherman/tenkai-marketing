import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Client-side Supabase client (browser). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/** Singleton browser client — use in client components that need a stable reference. */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
