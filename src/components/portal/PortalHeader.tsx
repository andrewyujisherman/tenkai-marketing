'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Bell, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase-browser'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/content': 'Content',
  '/audit': 'Audit Results',
  '/health': 'Website Health',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export function PortalHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const title = pageTitles[pathname] || 'Dashboard'

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="h-16 bg-white border-b border-tenkai-border flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20">
      {/* Page title */}
      <h1 className="font-serif text-xl text-charcoal">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          onClick={() => router.push('/settings?tab=notifications')}
          className="relative p-2 rounded-tenkai hover:bg-parchment transition-colors group"
        >
          <Bell className="size-[18px] text-warm-gray group-hover:text-charcoal transition-colors" />
          {/* Notification dot — hidden until we have real unread count */}
        </button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-tenkai hover:bg-parchment transition-colors outline-none">
            <div className="w-7 h-7 rounded-full bg-torii-subtle flex items-center justify-center">
              <span className="text-torii text-xs font-semibold">S</span>
            </div>
            <ChevronDown className="size-3.5 text-warm-gray" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings?tab=billing')}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
