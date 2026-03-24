import { redirect } from 'next/navigation'
import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { DemoBanner } from '@/components/portal/DemoBanner'
import { isDemoMode } from '@/lib/demo'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { isAdmin } from '@/lib/admin'
import { headers } from 'next/headers'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const demo = await isDemoMode()
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const showAdmin = !!user && isAdmin(user.email)

  // Enforce past_due redirect (except on settings page where they can fix billing)
  if (user) {
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('status')
      .eq('auth_user_id', user.id)
      .single()

    if (client?.status === 'past_due') {
      const headersList = await headers()
      const pathname = headersList.get('x-next-pathname') || ''
      if (!pathname.startsWith('/settings')) {
        redirect('/settings?tab=billing&alert=payment_required')
      }
    }
  }

  return (
    <div className="min-h-screen bg-ivory">
      <PortalSidebar isAdmin={showAdmin} />
      <div className="lg:ml-sidebar flex flex-col min-h-screen">
        {demo && <DemoBanner />}
        <PortalHeader />
        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-6 max-w-[1200px]">{children}</main>
      </div>
    </div>
  )
}
