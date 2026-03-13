'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  Search,
  BarChart3,
  Settings,
  Menu,
  ChevronDown,
  Shield,
  Link2,
} from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Content', href: '/content', icon: FileText },
  { label: 'Audit Results', href: '/audit', icon: Search },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Integrations', href: '/integrations', icon: Link2 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

type Tier = 'Starter' | 'Growth' | 'Pro'

const tierColors: Record<Tier, string> = {
  Starter: 'bg-warm-gray/15 text-warm-gray border-warm-gray/20',
  Growth: 'bg-torii/10 text-torii border-torii/20',
  Pro: 'bg-[#C49A3C]/10 text-[#C49A3C] border-[#C49A3C]/20',
}

function SidebarNav({ pathname, isAdmin }: { pathname: string; isAdmin: boolean }) {
  const allItems = isAdmin
    ? [...navItems, { label: 'Admin', href: '/admin', icon: Shield }]
    : navItems

  return (
    <nav className="flex flex-col gap-1 px-3">
      {allItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-tenkai text-sm font-medium transition-colors',
              isActive
                ? 'bg-torii-subtle text-torii border-l-[3px] border-l-torii -ml-px'
                : 'text-charcoal/70 hover:bg-parchment/60 hover:text-charcoal'
            )}
          >
            <Icon className="size-[18px] flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({
  pathname,
  userName,
  userTier,
  isAdmin,
}: {
  pathname: string
  userName: string
  userTier: Tier
  isAdmin: boolean
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="text-2xl font-serif text-torii leading-none">天界</span>
          <span className="font-serif text-xl text-charcoal tracking-wide">Tenkai</span>
        </Link>
      </div>

      {/* Navigation */}
      <SidebarNav pathname={pathname} isAdmin={isAdmin} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* User section */}
      <div className="px-3 pb-5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-tenkai bg-parchment/50">
          <div className="w-8 h-8 rounded-full bg-torii-subtle flex items-center justify-center">
            <span className="text-torii text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-charcoal truncate">{userName}</p>
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border',
                tierColors[userTier]
              )}
            >
              {userTier}
            </span>
          </div>
          <ChevronDown className="size-4 text-warm-gray flex-shrink-0" />
        </div>
      </div>
    </div>
  )
}

export function PortalSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [userTier, setUserTier] = useState<Tier>('Starter')

  useEffect(() => {
    fetch('/api/portal/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.client) {
          const name = data.client.name || data.client.company_name || data.email || 'User'
          setUserName(name)
          const rawTier = (data.client.tier || data.client.plan || '') as string
          const tierMap: Record<string, Tier> = { starter: 'Starter', growth: 'Growth', pro: 'Pro' }
          const mapped = tierMap[rawTier.toLowerCase()] ?? (rawTier as Tier)
          if (mapped && ['Starter', 'Growth', 'Pro'].includes(mapped)) {
            setUserTier(mapped)
          }
        } else if (data.email) {
          setUserName(data.email)
        }
      })
      .catch(() => {/* silently fail — keep defaults */})
  }, [])

  const displayName = userName || 'User'

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-sidebar bg-cream border-r border-tenkai-border flex-col z-30">
        <SidebarContent pathname={pathname} userName={displayName} userTier={userTier} isAdmin={isAdmin} />
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <button className="p-2 rounded-tenkai bg-cream border border-tenkai-border shadow-sm hover:bg-parchment transition-colors" />
            }
          >
            <Menu className="size-5 text-charcoal" />
          </SheetTrigger>
          <SheetContent side="left" className="w-sidebar p-0 bg-cream border-r-tenkai-border">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent pathname={pathname} userName={displayName} userTier={userTier} isAdmin={isAdmin} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
