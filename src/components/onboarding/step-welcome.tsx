'use client'

import { Sparkles } from 'lucide-react'

interface StepWelcomeProps {
  customerName?: string
  onContinue: () => void
}

export function StepWelcome({ customerName, onContinue }: StepWelcomeProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center space-y-6 animate-fade-up">
        <div className="w-16 h-16 mx-auto rounded-full bg-torii-subtle flex items-center justify-center">
          <Sparkles className="size-7 text-torii" />
        </div>
        <div className="space-y-3">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
            {customerName ? `Welcome, ${customerName}!` : 'Welcome to Tenkai!'}
          </h2>
          <p className="text-warm-gray text-sm leading-relaxed max-w-sm mx-auto">
            Let&apos;s set up your AI team. This takes about 3 minutes.
            You can skip anything and come back later.
          </p>
        </div>
        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2 bg-torii hover:bg-torii-dark text-white px-8 py-3 rounded-tenkai text-sm font-medium transition-colors duration-fast"
        >
          Let&apos;s Get Started
        </button>
      </div>
    </div>
  )
}
