'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Book a Demo', href: 'https://cal.com/alegius/tenkai-demo', external: true },
  ],
  Company: [
    { label: 'About', href: '#about' },
    { label: 'Sign Up', href: '/auth/signup' },
    { label: 'Log In', href: '/auth/login' },
  ],
}

export function Footer() {
  const [url, setUrl] = useState('')

  return (
    <footer className="relative overflow-hidden">
      {/* Torii watermark */}
      <div
        className="absolute bottom-0 right-0 w-[300px] h-[250px] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 100'%3E%3Crect x='10' y='20' width='100' height='8' rx='2' fill='%23C1554D'/%3E%3Crect x='5' y='12' width='110' height='6' rx='2' fill='%23C1554D'/%3E%3Crect x='20' y='28' width='8' height='72' fill='%23C1554D'/%3E%3Crect x='92' y='28' width='8' height='72' fill='%23C1554D'/%3E%3Crect x='20' y='50' width='80' height='5' rx='1' fill='%23C1554D'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          backgroundPosition: 'bottom right',
        }}
      />

      {/* Final CTA */}
      <div className="w-full max-w-container mx-auto px-6 pb-16">
        <div className="bg-cream rounded-2xl border border-tenkai-border p-8 md:p-12 text-center animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4">
            Ready to meet your SEO team?
          </h2>
          <p className="text-warm-gray mb-8 max-w-lg mx-auto">
            Start with a free audit — no credit card, no commitment.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="url"
              placeholder="Enter your website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 px-4 text-base bg-white border-tenkai-border rounded-xl focus-visible:border-torii focus-visible:ring-torii/20"
            />
            <Button
              className="bg-torii hover:bg-torii-dark text-white h-12 px-6 text-base font-medium rounded-xl gap-2 shrink-0"
              onClick={() => {
                const target = url.trim()
                if (target) {
                  window.location.href = `/auth/signup?url=${encodeURIComponent(target)}`
                } else {
                  window.location.href = '/auth/signup'
                }
              }}
            >
              Get Free Audit
              <ArrowRight className="size-4" />
            </Button>
          </div>
          <div className="mt-4">
            <a
              href="https://cal.com/alegius/tenkai-demo"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center h-11 px-6 text-sm font-medium rounded-xl border border-torii text-torii hover:bg-torii hover:text-white transition-colors"
            >
              Book a Live Demo
            </a>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-tenkai-border">
        <div className="w-full max-w-container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-torii font-serif text-xl font-semibold">
                  天界
                </span>
                <span className="font-serif text-lg text-charcoal">
                  Tenkai
                </span>
              </Link>
              <p className="text-sm text-warm-gray leading-relaxed">
                Your heavenly SEO team. AI-powered experts working 24/7 to grow your organic traffic.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="font-serif text-sm font-medium text-charcoal mb-4">
                  {category}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      {'external' in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener"
                          className="text-sm text-warm-gray hover:text-charcoal transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-warm-gray hover:text-charcoal transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-tenkai-border-light">
          <div className="w-full max-w-container mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-gray">
              &copy; 2026 Tenkai Marketing. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:andrew@alegius.com"
                className="text-xs text-muted-gray hover:text-charcoal transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
