import '../portal-theme.css'
import { redirect } from 'next/navigation'
import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { DemoBanner } from '@/components/portal/DemoBanner'
import { ToastProvider } from '@/components/ui/toast-notification'
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

  // Fetch client data for header company name and past_due check
  let companyName: string | null = null

  if (demo) {
    const { data: demoClient } = await supabaseAdmin
      .from('clients')
      .select('company_name')
      .eq('id', (await import('@/lib/demo')).DEMO_CLIENT_ID)
      .single()
    companyName = demoClient?.company_name ?? null
  }

  // Enforce past_due redirect (except on settings page where they can fix billing)
  if (user) {
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('status, company_name')
      .eq('auth_user_id', user.id)
      .single()

    if (!companyName && client?.company_name) companyName = client.company_name
    if (client?.status === 'past_due') {
      const headersList = await headers()
      const pathname = headersList.get('x-next-pathname') || ''
      if (!pathname.startsWith('/settings')) {
        redirect('/settings?tab=billing&alert=payment_required')
      }
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <PortalSidebar isAdmin={showAdmin} />
      <div className="lg:ml-sidebar flex flex-col min-h-screen">
        {demo && <DemoBanner />}
        <PortalHeader companyName={companyName} />
        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-6 max-w-[1200px]">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  )
}
