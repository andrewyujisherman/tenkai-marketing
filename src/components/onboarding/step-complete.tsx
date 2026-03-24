'use client'

import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface StepCompleteProps {
  businessName?: string
}

export function StepComplete({ businessName }: StepCompleteProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center space-y-6 animate-fade-up">
        <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="size-8 text-success" />
        </div>
        <div className="space-y-3">
          <h2 className="font-serif text-2xl text-charcoal">You&apos;re all set!</h2>
          <p className="text-warm-gray text-sm leading-relaxed">
            {businessName
              ? `Your AI team is ready to start working on ${businessName}.`
              : 'Your AI team is ready to start working.'}
          </p>
          <div className="text-left bg-parchment/50 rounded-tenkai p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="text-torii font-semibold text-sm mt-0.5">1.</span>
              <p className="text-sm text-charcoal"><span className="font-medium">Within 24 hours</span> — Kenji runs your first technical SEO audit</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-torii font-semibold text-sm mt-0.5">2.</span>
              <p className="text-sm text-charcoal"><span className="font-medium">Within 48 hours</span> — Haruki delivers your keyword strategy</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-torii font-semibold text-sm mt-0.5">3.</span>
              <p className="text-sm text-charcoal"><span className="font-medium">First content drafts</span> — Sakura starts writing within the week</p>
            </div>
          </div>
          <p className="text-warm-gray text-xs">
            We&apos;ll notify you when results are ready for review.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-torii hover:bg-torii-dark text-white px-8 py-3 rounded-tenkai text-sm font-medium transition-colors duration-fast"
        >
          Go to Dashboard
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
