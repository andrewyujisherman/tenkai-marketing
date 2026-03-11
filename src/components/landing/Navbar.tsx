'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-300 ${
        scrolled
          ? 'bg-cream/95 backdrop-blur-md border-b border-tenkai-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-torii font-serif text-2xl font-semibold tracking-tight">
            天界
          </span>
          <span className="font-serif text-xl text-charcoal tracking-wide">
            Tenkai
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-warm-gray hover:text-charcoal transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Button className="bg-torii hover:bg-torii-dark text-white px-5 h-9 text-sm font-medium">
            Get Free Audit
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-ivory w-[280px]">
              <SheetHeader>
                <SheetTitle className="font-serif text-lg">
                  <span className="text-torii">天界</span> Tenkai
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 p-6">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-base text-charcoal hover:text-torii transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <Button className="bg-torii hover:bg-torii-dark text-white w-full h-10 mt-2">
                  Get Free Audit
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
