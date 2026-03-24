'use client'

import { Search, BarChart3, Rocket } from 'lucide-react'

const steps = [
  {
    num: 1,
    title: 'Sign Up',
    description:
      'Pick a plan, tell us about your business, and meet your AI team.',
    icon: Search,
  },
  {
    num: 2,
    title: 'Your Team Gets to Work',
    description:
      'Your AI specialists start auditing, writing, and optimizing — 24/7.',
    icon: BarChart3,
  },
  {
    num: 3,
    title: 'Review & Approve',
    description:
      'Everything lands in your dashboard. Approve, request changes, or ask questions.',
    icon: Rocket,
  },
]

export function HowItWorks() {
  return (
    <section id="about">
      <div className="w-full max-w-container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4">
            How it works
          </h2>
          <p className="text-lg text-warm-gray">
            Three steps from signup to SEO growth
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-4 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px border-t-2 border-dashed border-warm-gray/30" />

          {steps.map((step, i) => (
            <div
              key={step.num}
              className="relative flex flex-col items-center text-center animate-fade-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Number badge */}
              <div className="relative z-10 w-[104px] h-[104px] rounded-2xl bg-cream border border-tenkai-border flex flex-col items-center justify-center mb-6">
                <div className="w-8 h-8 rounded-full bg-torii text-white flex items-center justify-center text-sm font-semibold mb-2">
                  {step.num}
                </div>
                <step.icon className="size-5 text-warm-gray" />
              </div>

              <h3 className="font-serif text-xl text-charcoal mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-warm-gray max-w-xs leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
