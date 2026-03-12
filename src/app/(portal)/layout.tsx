import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { PortalHeader } from '@/components/portal/PortalHeader'
import { DemoBanner } from '@/components/portal/DemoBanner'
import { isDemoMode } from '@/lib/demo'
import { createServerClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const demo = await isDemoMode()
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const showAdmin = !!user && isAdmin(user.email)

  return (
    <div className="min-h-screen bg-ivory">
      <PortalSidebar isAdmin={showAdmin} />
      <div className="lg:ml-sidebar flex flex-col min-h-screen">
        {demo && <DemoBanner />}
        <PortalHeader />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
