'use client'

import { createBrowserClient } from '@supabase/ssr'

export function AdminLogoutButton() {
  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-warm-gray hover:text-torii transition-colors"
    >
      Sign out
    </button>
  )
}
