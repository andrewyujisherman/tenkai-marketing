'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  MapPin,
  BarChart3,
  Settings,
  Menu,
  Shield,
} from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Rankings', href: '/rankings', icon: BarChart3 },
  { label: 'Website Health', href: '/health', icon: ShieldCheck },
  { label: 'My Content', href: '/content', icon: FileText },
  { label: 'My Reports', href: '/reports', icon: FileText },
  { label: 'Metrics', href: '/metrics', icon: BarChart3 },
  { label: 'My Business', href: '/business', icon: MapPin },
  { label: 'Settings', href: '/settings', icon: Settings },
]

type Tier = 'Starter' | 'Growth' | 'Pro'

const tierDisplayNames: Record<Tier, string> = {
  Starter: 'Visibility',
  Growth: 'Growth',
  Pro: 'Done-For-You',
}

function SidebarNav({ pathname, isAdmin }: { pathname: string; isAdmin: boolean }) {
  const allItems = isAdmin
    ? [...navItems, { label: 'Admin', href: '/admin', icon: Shield }]
    : navItems

  return (
    <nav className="flex flex-col py-3">
      {allItems.map((item) => {
        const isActive = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-[10px] px-5 py-2.5 text-[13px] font-medium transition-all border-l-[3px] border-l-transparent',
              isActive
                ? 'bg-torii-subtle text-torii border-l-torii'
                : 'text-warm-gray hover:bg-parchment hover:text-charcoal'
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
      <div className="px-5 py-6 border-b border-tenkai-border-light">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="text-2xl font-serif text-torii leading-none">天界</span>
          <span className="font-serif text-lg text-torii tracking-[0.5px]">Tenkai</span>
        </Link>
        <span className="text-[11px] text-warm-gray block mt-0.5">SEO Intelligence Platform</span>
      </div>

      {/* Navigation */}
      <SidebarNav pathname={pathname} isAdmin={isAdmin} />

      {/* Spacer */}
      <div className="flex-1" />

      {/* User section */}
      <div className="px-5 pb-5 border-t border-tenkai-border-light pt-4">
        <p className="text-xs text-warm-gray truncate">{userName}</p>
        <span
          className={cn(
            'inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold',
            'bg-torii-subtle text-torii'
          )}
        >
          {tierDisplayNames[userTier]} Plan
        </span>
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
      <aside className="hidden lg:fixed lg:flex lg:flex-col lg:left-0 lg:top-0 lg:bottom-0 lg:w-sidebar lg:bg-ivory lg:border-r lg:border-tenkai-border lg:z-30">
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
          <SheetContent side="left" className="w-sidebar p-0 bg-ivory border-r-tenkai-border">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent pathname={pathname} userName={displayName} userTier={userTier} isAdmin={isAdmin} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
