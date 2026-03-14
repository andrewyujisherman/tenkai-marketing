'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Zap, Clock, Shield } from 'lucide-react'

function SakuraPetal({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`absolute sakura-petal opacity-40 animate-sakura-fall pointer-events-none ${className}`}
      style={style}
    />
  )
}

function MockDashboard() {
  const activities = [
    { agent: 'Haruki', action: 'Generated keyword strategy', time: '2m ago', color: 'bg-torii' },
    { agent: 'Sakura', action: 'Drafted blog post: "5 SEO Tips"', time: '8m ago', color: 'bg-emerald-500' },
    { agent: 'Kenji', action: 'Fixed 3 broken links', time: '15m ago', color: 'bg-blue-500' },
    { agent: 'Takeshi', action: 'Rank improved: +4 positions', time: '1h ago', color: 'bg-amber-500' },
  ]

  return (
    <div className="bg-white rounded-xl border border-tenkai-border shadow-lg p-4 max-w-sm w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-torii/60" />
        <span className="text-xs font-medium text-warm-gray uppercase tracking-wider">
          Your Dashboard Preview
        </span>
      </div>
      <div className="space-y-3">
        {activities.map((a, i) => (
          <div
            key={i}
            className="flex items-start gap-3 animate-fade-up"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.color}`} />
            <div className="min-w-0">
              <p className="text-sm text-charcoal truncate">
                <span className="font-medium">{a.agent}</span>{' '}
                <span className="text-warm-gray">{a.action}</span>
              </p>
              <p className="text-xs text-muted-gray">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Hero() {
  const [url, setUrl] = useState('')
  const router = useRouter()

  function handleAnalyze() {
    const dest = url.trim()
      ? `/onboarding?url=${encodeURIComponent(url.trim())}`
      : '/onboarding'
    router.push(dest)
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-[72px] overflow-hidden">
      {/* Sakura petals */}
      <SakuraPetal className="top-[15%] left-[10%]" />
      <SakuraPetal className="top-[30%] right-[15%]" style={{ animationDelay: '3s' } as React.CSSProperties} />
      <SakuraPetal className="top-[60%] left-[75%]" style={{ animationDelay: '7s' } as React.CSSProperties} />

      {/* Subtle gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory to-cream -z-10" />

      <div className="w-full max-w-container mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="lg:col-span-3 space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif leading-tight text-charcoal animate-fade-up">
              Your heavenly SEO team,{' '}
              <span className="text-torii">working 24/7</span>
            </h1>

            <p
              className="text-lg sm:text-xl text-warm-gray max-w-xl leading-relaxed animate-fade-up"
              style={{ animationDelay: '100ms' }}
            >
              AI-powered SEO experts with Japanese names and real expertise.
              From $150/mo — no contracts, no jargon, no autopilot.
            </p>

            {/* CTA: URL input */}
            <div
              className="animate-fade-up"
              style={{ animationDelay: '200ms' }}
            >
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <Input
                  type="url"
                  placeholder="Enter your website URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 px-4 text-base bg-white border-tenkai-border rounded-xl focus-visible:border-torii focus-visible:ring-torii/20"
                />
                <Button
                  onClick={handleAnalyze}
                  className="bg-torii hover:bg-torii-dark text-white h-12 px-6 text-base font-medium rounded-xl gap-2 shrink-0"
                >
                  Analyze My Site
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-gray mt-3 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Shield className="size-3.5" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  Setup in under 5 minutes
                </span>
              </p>
              <p className="text-sm text-muted-gray mt-2">
                or{' '}
                <a
                  href="https://cal.com/alegius/tenkai-demo"
                  target="_blank"
                  rel="noopener"
                  className="text-torii hover:text-torii-dark underline underline-offset-2 transition-colors"
                >
                  Schedule a Live Demo →
                </a>
              </p>
            </div>

            {/* Trust signals */}
            <div
              className="flex items-center gap-6 pt-4 animate-fade-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="flex items-center gap-2 text-sm text-warm-gray">
                <Zap className="size-4 text-torii" />
                <span>6 AI experts included</span>
              </div>
              <div className="w-px h-4 bg-tenkai-border" />
              <div className="text-sm text-warm-gray">
                Month-to-month plans
              </div>
            </div>
          </div>

          {/* Right: Dashboard mock */}
          <div
            className="lg:col-span-2 flex justify-center animate-fade-up"
            style={{ animationDelay: '400ms' }}
          >
            <MockDashboard />
          </div>
        </div>
      </div>
    </section>
  )
}
