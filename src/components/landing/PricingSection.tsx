'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tiers } from '@/lib/design-system'
import { Button } from '@/components/ui/button'
import { Check, Minus, Lock } from 'lucide-react'

const featureLabels: Record<string, string> = {
  audit: 'SEO Audit',
  content: 'Blog Content',
  reporting: 'Reporting',
  gbp: 'Google Business Profile',
  keywords: 'Keyword Tracking',
  strategy: 'Strategy Reviews',
  approval: 'Content Approval',
  support: 'Support',
}

const featureOrder = ['audit', 'content', 'reporting', 'gbp', 'keywords', 'strategy', 'approval', 'support']

export function PricingSection() {
  const router = useRouter()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)

  async function handleCheckout(tierName: string) {
    setLoadingTier(tierName)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierName.toLowerCase() }),
      })
      const { url, error } = await res.json()
      if (error || !url) throw new Error(error ?? 'No checkout URL')
      router.push(url)
    } catch {
      setLoadingTier(null)
    }
  }

  return (
    <section id="pricing" className="scroll-mt-20">
      <div className="w-full max-w-container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-lg text-warm-gray max-w-xl mx-auto">
            Month-to-month. Cancel anytime. 14-day money-back guarantee.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier, i) => {
            const isPopular = 'popular' in tier && tier.popular
            return (
              <div
                key={tier.name}
                className={`relative rounded-xl p-6 md:p-8 transition-all animate-fade-up ${
                  isPopular
                    ? 'bg-white border-2 border-torii shadow-lg scale-[1.02]'
                    : 'bg-cream border border-tenkai-border'
                }`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-torii text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                {/* Tier header */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="font-serif text-2xl text-charcoal">
                      {tier.name}
                    </h3>
                    <span className="text-sm text-torii/60 font-serif">
                      {tier.nameJp}
                    </span>
                  </div>
                  <p className="text-sm text-warm-gray mb-4">
                    {tier.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-serif font-semibold text-charcoal">
                      ${tier.price}
                    </span>
                    <span className="text-warm-gray text-sm">/month</span>
                  </div>
                </div>

                {/* Feature list */}
                <ul className="space-y-3 mb-8">
                  {featureOrder.map((key) => {
                    const value = tier.features[key as keyof typeof tier.features]
                    const hasFeature = value !== false

                    return (
                      <li key={key} className="flex items-start gap-2.5">
                        {hasFeature ? (
                          <Check className="size-4 text-torii mt-0.5 shrink-0" />
                        ) : (
                          <Minus className="size-4 text-muted-gray mt-0.5 shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            hasFeature ? 'text-charcoal' : 'text-muted-gray'
                          }`}
                        >
                          {hasFeature ? String(value) : featureLabels[key]}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleCheckout(tier.name)}
                  disabled={loadingTier === tier.name}
                  className={`w-full h-11 text-sm font-medium rounded-xl ${
                    isPopular
                      ? 'bg-torii hover:bg-torii-dark text-white'
                      : 'bg-charcoal hover:bg-charcoal/90 text-white'
                  }`}
                >
                  {loadingTier === tier.name ? 'Redirecting…' : `Start with ${tier.name}`}
                </Button>
              </div>
            )
          })}
        </div>

        {/* All plans include */}
        <div className="text-center animate-fade-up" style={{ animationDelay: '400ms' }}>
          <p className="text-sm text-warm-gray mb-4">
            <span className="font-medium text-charcoal">All plans include:</span>{' '}
            Multi-stage content approval · Plain English reporting · Named AI team · Dashboard access
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-warm-gray mb-4">
            <Lock className="size-3.5" />
            <span>No contracts · Cancel anytime · 14-day money-back</span>
          </div>
          <p className="text-sm text-warm-gray">
            Not sure which plan?{' '}
            <a
              href="https://cal.com/alegius/tenkai-demo"
              target="_blank"
              rel="noopener"
              className="text-torii hover:text-torii-dark underline underline-offset-2 transition-colors"
            >
              Schedule a demo
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
