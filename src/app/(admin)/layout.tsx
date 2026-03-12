import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'

const navLinks = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/clients', label: 'Clients' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/users', label: 'Team' },
  { href: '/admin/invites', label: 'Invites' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdmin(user.email)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-tenkai-border flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-tenkai-border">
          <span className="font-serif text-lg text-charcoal">天界 <span className="text-torii">Admin</span></span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center px-3 py-2 rounded-tenkai text-sm text-warm-gray hover:text-charcoal hover:bg-parchment transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-tenkai-border">
          <Link
            href="/dashboard"
            className="text-xs text-warm-gray hover:text-charcoal transition-colors"
          >
            ← Back to Portal
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-tenkai-border flex items-center justify-between px-6 shrink-0">
          <span className="text-sm font-medium text-charcoal">Admin Portal</span>
          <span className="text-xs text-warm-gray">{user.email}</span>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
