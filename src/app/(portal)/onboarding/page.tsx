'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react'
import Link from 'next/link'

// --- Questions ---

interface Question {
  id: string
  question: string
  placeholder?: string
  type: 'text' | 'textarea' | 'multi-input'
  fields?: { key: string; placeholder: string }[]
}

const round1: Question[] = [
  {
    id: 'business',
    question: "What's your business name and website URL?",
    type: 'multi-input',
    fields: [
      { key: 'name', placeholder: 'Business name' },
      { key: 'url', placeholder: 'https://yourbusiness.com' },
    ],
  },
  {
    id: 'industry',
    question: 'What industry are you in?',
    type: 'text',
    placeholder: 'e.g., Plumbing, Dental, Real Estate...',
  },
  {
    id: 'competitors',
    question: 'Who are your top 3 competitors?',
    type: 'multi-input',
    fields: [
      { key: 'comp1', placeholder: 'Competitor 1' },
      { key: 'comp2', placeholder: 'Competitor 2' },
      { key: 'comp3', placeholder: 'Competitor 3' },
    ],
  },
  {
    id: 'products',
    question: 'What are your main products or services?',
    type: 'textarea',
    placeholder: 'e.g., Residential plumbing, emergency repairs, water heater installation...',
  },
  {
    id: 'location',
    question: "What's your primary business location?",
    type: 'text',
    placeholder: 'e.g., Austin, TX',
  },
]

const round2: Question[] = [
  {
    id: 'unique',
    question: 'What makes your business unique compared to competitors?',
    type: 'textarea',
    placeholder: 'Your special sauce \u2014 what do customers love about you?',
  },
  {
    id: 'years',
    question: 'How long have you been in business?',
    type: 'text',
    placeholder: 'e.g., 5 years, Since 2019...',
  },
  {
    id: 'testimonials',
    question: 'Do you have any customer testimonials or case studies to share?',
    type: 'textarea',
    placeholder: 'Paste a favorite review or briefly describe a success story...',
  },
  {
    id: 'challenge',
    question: "What's your biggest challenge with getting found online?",
    type: 'textarea',
    placeholder: "e.g., We don't show up for local searches, competitors outrank us...",
  },
  {
    id: 'goals',
    question: 'Any specific goals for the next 6 months?',
    type: 'textarea',
    placeholder: 'e.g., Double website traffic, rank #1 for "plumber near me"...',
  },
]

// --- Onboarding Page ---

type Phase = 'round1' | 'transition' | 'round2' | 'complete' | 'error'

export default function OnboardingPage() {
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<Phase>('round1')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | Record<string, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill URL from hero CTA query param
  useEffect(() => {
    const urlParam = searchParams.get('url')
    if (urlParam) {
      setAnswers((prev) => ({
        ...prev,
        business: { ...((prev.business && typeof prev.business === 'object' ? prev.business : {}) as Record<string, string>), url: urlParam },
      }))
    }
  }, [searchParams])

  const questions = phase === 'round1' ? round1 : round2
  const current = phase === 'round1' || phase === 'round2' ? questions[step] : null
  const stepsPerRound = 5
  const totalQuestions = 10
  const overallStep = phase === 'round1' ? step + 1 : phase === 'round2' ? 6 + step : phase === 'transition' ? 5 : 10

  const setAnswer = useCallback(
    (value: string | Record<string, string>) => {
      if (!current) return
      setAnswers((prev) => ({ ...prev, [current.id]: value }))
    },
    [current]
  )

  const handleNext = async () => {
    if (step < stepsPerRound - 1) {
      setStep(step + 1)
    } else if (phase === 'round1') {
      setPhase('transition')
    } else if (phase === 'round2') {
      setIsSubmitting(true)
      try {
        const res = await fetch('/api/portal/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        })
        if (!res.ok) throw new Error('Submission failed')
        setPhase('complete')
      } catch {
        setSubmitError('Something went wrong. Please try again.')
        setPhase('error')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    } else if (phase === 'round2') {
      // Go back from round2 step 0 to the transition screen
      setPhase('transition')
    }
  }

  const handleSkip = () => handleNext()

  // --- Transition Screen ---
  if (phase === 'transition') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6 animate-fade-up">
          <div className="w-16 h-16 mx-auto rounded-full bg-torii-subtle flex items-center justify-center">
            <Sparkles className="size-7 text-torii" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-charcoal">Great start!</h2>
            <p className="text-warm-gray text-sm leading-relaxed">
              A few more questions to personalize your strategy and help our team
              understand what makes your business special.
            </p>
          </div>
          <Button
            onClick={() => {
              setPhase('round2')
              setStep(0)
            }}
            className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-2"
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    )
  }

  // --- Error Screen ---
  if (phase === 'error') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6 animate-fade-up">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-charcoal">Something went wrong</h2>
            <p className="text-warm-gray text-sm">{submitError}</p>
          </div>
          <Button
            onClick={() => {
              setSubmitError(null)
              setPhase('round2')
            }}
            className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // --- Completion Screen ---
  if (phase === 'complete') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6 animate-fade-up">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#4A7C59]/10 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-[#4A7C59]" />
          </div>
          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-charcoal">You&apos;re all set!</h2>
            <p className="text-warm-gray text-sm leading-relaxed">
              Your Tenkai team has everything they need. Here&apos;s what happens next:
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
          <Link href="/dashboard">
            <Button className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-2">
              Go to Dashboard
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // --- Question Screen ---
  const answer = current ? answers[current.id] : undefined

  return (
    <div className="min-h-[80vh] flex flex-col px-4">
      {/* Progress Bar — continuous 1-10 across both rounds */}
      <div className="max-w-xl mx-auto w-full pt-8 space-y-2">
        <div className="flex items-center justify-between text-xs text-warm-gray">
          <span>
            {phase === 'round1' ? 'Getting Started' : 'Personalizing Your Strategy'}
          </span>
          <span>
            {overallStep} of {totalQuestions}
          </span>
        </div>
        <div className="h-1.5 bg-parchment rounded-full overflow-hidden">
          <div
            className="h-full bg-torii rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(overallStep / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-xl w-full space-y-8 animate-fade-up" key={`${phase}-${step}`}>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal leading-snug">
            {current?.question}
          </h2>

          {/* Input */}
          <div className="space-y-3">
            {current?.type === 'text' && (
              <Input
                value={(answer as string) || ''}
                onChange={(e) => setAnswer((e.target as HTMLInputElement).value)}
                placeholder={current.placeholder}
                className="h-12 text-base border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
                autoFocus
              />
            )}

            {current?.type === 'textarea' && (
              <textarea
                value={(answer as string) || ''}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={current.placeholder}
                rows={4}
                className="w-full px-4 py-3 text-base border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
                autoFocus
              />
            )}

            {current?.type === 'multi-input' &&
              current.fields?.map((field) => (
                <Input
                  key={field.key}
                  value={
                    (answer && typeof answer === 'object'
                      ? (answer as Record<string, string>)[field.key]
                      : '') || ''
                  }
                  onChange={(e) =>
                    setAnswer({
                      ...((typeof answer === 'object' ? answer : {}) as Record<string, string>),
                      [field.key]: (e.target as HTMLInputElement).value,
                    })
                  }
                  placeholder={field.placeholder}
                  className="h-12 text-base border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
                />
              ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <div>
              {(step > 0 || phase === 'round2') ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-warm-gray hover:text-charcoal gap-1.5 rounded-tenkai"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="text-sm text-warm-gray hover:text-charcoal transition-colors"
              >
                Skip
              </button>
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-1.5"
              >
                {isSubmitting ? 'Submitting…' : phase === 'round2' && step === stepsPerRound - 1 ? 'Submit' : 'Next'}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
