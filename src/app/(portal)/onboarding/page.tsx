'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { StepWelcome } from '@/components/onboarding/step-welcome'
import { StepBusinessInfo, type BusinessInfoData } from '@/components/onboarding/step-business-info'
import { StepMeetTeam } from '@/components/onboarding/step-meet-team'
import { StepIntegrations } from '@/components/onboarding/step-integrations'
import { StepComplete } from '@/components/onboarding/step-complete'

const TOTAL_STEPS = 5
const STORAGE_KEY = 'tenkai_onboarding_draft'

interface OnboardingDraft {
  step: number
  businessInfo: BusinessInfoData
  customNames: Record<string, string>
  connectedIntegrations: string[]
  tier: string
}

const defaultBusinessInfo: BusinessInfoData = {
  businessName: '',
  websiteUrl: '',
  businessType: '',
  services: '',
  serviceArea: '',
}

const defaultDraft: OnboardingDraft = {
  step: 0,
  businessInfo: defaultBusinessInfo,
  customNames: {},
  connectedIntegrations: [],
  tier: 'starter',
}

export default function OnboardingPage() {
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch user tier from profile API
  useEffect(() => {
    fetch('/api/portal/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.client) {
          const rawTier = (data.client.tier || data.client.plan || 'starter') as string
          const tierMap: Record<string, string> = { starter: 'starter', growth: 'growth', pro: 'pro' }
          const resolved = tierMap[rawTier.toLowerCase()] || 'starter'
          setDraft((d) => ({ ...d, tier: resolved }))
        }
      })
      .catch(() => {})
  }, [])

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.step < TOTAL_STEPS - 1) {
          setDraft({ ...defaultDraft, ...parsed })
        }
      }
    } catch { /* ignore */ }
  }, [])

  // Persist to localStorage
  useEffect(() => {
    if (draft.step >= TOTAL_STEPS - 1) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch { /* ignore quota */ }
  }, [draft])

  function goTo(step: number) {
    setDraft((d) => ({ ...d, step }))
  }

  function handleContinue() {
    if (draft.step < TOTAL_STEPS - 1) {
      goTo(draft.step + 1)
    }
  }

  async function handleFinish() {
    setIsSubmitting(true)
    try {
      await fetch('/api/portal/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: {
            business: { name: draft.businessInfo.businessName, url: draft.businessInfo.websiteUrl },
            industry: draft.businessInfo.businessType,
            products: draft.businessInfo.services,
            location: draft.businessInfo.serviceArea,
            customNames: draft.customNames,
            connectedIntegrations: draft.connectedIntegrations,
          },
        }),
      })
    } catch { /* continue to completion regardless */ }
    setIsSubmitting(false)
    goTo(TOTAL_STEPS - 1)
  }

  function canContinue(): boolean {
    if (draft.step === 1) {
      return draft.businessInfo.businessName.trim().length >= 2 && draft.businessInfo.websiteUrl.trim().length > 0
    }
    return true
  }

  const showNav = draft.step > 0 && draft.step < TOTAL_STEPS - 1
  const isLastBeforeComplete = draft.step === TOTAL_STEPS - 2

  return (
    <div className="min-h-[80vh] flex flex-col px-4">
      {/* Progress bar — steps 1-4 (not shown on complete) */}
      {draft.step > 0 && draft.step < TOTAL_STEPS - 1 && (
        <div className="max-w-xl mx-auto w-full pt-8 space-y-2">
          <div className="flex items-center justify-between text-xs text-warm-gray">
            <span>Setting Up</span>
            <span>Step {draft.step} of {TOTAL_STEPS - 1}</span>
          </div>
          <div className="h-1.5 bg-parchment rounded-full overflow-hidden">
            <div
              className="h-full bg-torii rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(draft.step / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 py-8">
        {draft.step === 0 && (
          <StepWelcome onContinue={handleContinue} />
        )}

        {draft.step === 1 && (
          <StepBusinessInfo
            data={draft.businessInfo}
            onChange={(info) => setDraft((d) => ({ ...d, businessInfo: info }))}
          />
        )}

        {draft.step === 2 && (
          <StepMeetTeam
            tier={draft.tier}
            customNames={draft.customNames}
            onRename={(agentId, newName) =>
              setDraft((d) => ({
                ...d,
                customNames: { ...d.customNames, [agentId]: newName },
              }))
            }
          />
        )}

        {draft.step === 3 && (
          <StepIntegrations
            connectedIds={draft.connectedIntegrations}
            onConnect={(id) =>
              setDraft((d) => ({
                ...d,
                connectedIntegrations: [...d.connectedIntegrations, id],
              }))
            }
            tier={draft.tier}
          />
        )}

        {draft.step === 4 && (
          <StepComplete businessName={draft.businessInfo.businessName || undefined} />
        )}
      </div>

      {/* Navigation */}
      {showNav && (
        <div className="max-w-xl mx-auto w-full pb-8 flex items-center justify-between">
          <button
            onClick={() => goTo(draft.step - 1)}
            className="inline-flex items-center gap-1.5 text-sm text-warm-gray hover:text-charcoal transition-colors duration-fast"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            {!isLastBeforeComplete && (
              <button
                onClick={handleContinue}
                className="text-sm text-warm-gray hover:text-charcoal transition-colors"
              >
                Skip for now
              </button>
            )}
            <button
              onClick={isLastBeforeComplete ? handleFinish : handleContinue}
              disabled={!canContinue() || isSubmitting}
              className="inline-flex items-center gap-1.5 bg-torii hover:bg-torii-dark text-white px-6 py-2.5 rounded-tenkai text-sm font-medium transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isLastBeforeComplete ? 'Finish Setup' : 'Continue'}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
