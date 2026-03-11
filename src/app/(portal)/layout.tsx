import { PortalSidebar } from '@/components/portal/PortalSidebar'
import { PortalHeader } from '@/components/portal/PortalHeader'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <PortalSidebar />
      <div className="lg:ml-sidebar flex flex-col min-h-screen">
        <PortalHeader />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
