'use client'

import { useState, useCallback } from 'react'
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

type Phase = 'round1' | 'transition' | 'round2' | 'complete'

export default function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>('round1')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | Record<string, string>>>({})

  const questions = phase === 'round1' ? round1 : round2
  const current = phase === 'round1' || phase === 'round2' ? questions[step] : null
  const totalSteps = 5
  const currentStepNum = step + 1

  const setAnswer = useCallback(
    (value: string | Record<string, string>) => {
      if (!current) return
      setAnswers((prev) => ({ ...prev, [current.id]: value }))
    },
    [current]
  )

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1)
    } else if (phase === 'round1') {
      setPhase('transition')
    } else if (phase === 'round2') {
      setPhase('complete')
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
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

  // --- Completion Screen ---
  if (phase === 'complete') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6 animate-fade-up">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#4A7C59]/10 flex items-center justify-center">
            <CheckCircle2 className="size-8 text-[#4A7C59]" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl text-charcoal">Your Tenkai team is ready!</h2>
            <p className="text-warm-gray text-sm leading-relaxed">
              Our AI agents are already analyzing your site and building your personalized
              SEO strategy. Head to your dashboard to see what they find.
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
      {/* Progress Bar */}
      <div className="max-w-xl mx-auto w-full pt-8 space-y-2">
        <div className="flex items-center justify-between text-xs text-warm-gray">
          <span>
            {phase === 'round1' ? 'Getting Started' : 'Personalizing Your Strategy'}
          </span>
          <span>
            {currentStepNum} of {totalSteps}
          </span>
        </div>
        <div className="h-1.5 bg-parchment rounded-full overflow-hidden">
          <div
            className="h-full bg-torii rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStepNum / totalSteps) * 100}%` }}
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
              {step > 0 ? (
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
                className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-1.5"
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
