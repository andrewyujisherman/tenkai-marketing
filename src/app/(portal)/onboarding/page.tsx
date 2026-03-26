'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { StepWelcome } from '@/components/onboarding/step-welcome'
import { StepBusinessInfo, type BusinessInfoData } from '@/components/onboarding/step-business-info'
import { StepMeetTeam } from '@/components/onboarding/step-meet-team'
import { StepIntegrations, OAUTH_TO_WIZARD_ID } from '@/components/onboarding/step-integrations'
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
  const [finishError, setFinishError] = useState<string | null>(null)
  const [oauthToast, setOauthToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Handle OAuth return — detect ?connected= or ?error= from callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const error = params.get('error')
    if (connected) {
      const wizardId = OAUTH_TO_WIZARD_ID[connected]
      if (wizardId) {
        setDraft((d) => ({
          ...d,
          step: 3, // Return to integrations step
          connectedIntegrations: d.connectedIntegrations.includes(wizardId)
            ? d.connectedIntegrations
            : [...d.connectedIntegrations, wizardId],
        }))
        const label = connected.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        setOauthToast({ message: `${label} connected!`, type: 'success' })
      }
      window.history.replaceState({}, '', '/onboarding')
    } else if (error) {
      setDraft((d) => ({ ...d, step: 3 }))
      setOauthToast({ message: 'Connection failed. Please try again.', type: 'error' })
      window.history.replaceState({}, '', '/onboarding')
    }
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (oauthToast) {
      const timer = setTimeout(() => setOauthToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [oauthToast])

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
    setFinishError(null)
    try {
      const res = await fetch('/api/portal/onboarding', {
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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 401) {
          setFinishError('Your session has expired. Please refresh the page and log in again.')
        } else {
          setFinishError(data.error || 'Something went wrong. Please try again.')
        }
        setIsSubmitting(false)
        return
      }
      goTo(TOTAL_STEPS - 1)
    } catch {
      setFinishError('Network error. Please check your connection and try again.')
    }
    setIsSubmitting(false)
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
            <span className="section-label">Setting Up</span>
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
          <div className="onboarding-step-card max-w-xl mx-auto">
            <StepWelcome onContinue={handleContinue} />
          </div>
        )}

        {draft.step === 1 && (
          <div className="portal-card max-w-xl mx-auto">
            <StepBusinessInfo
              data={draft.businessInfo}
              onChange={(info) => setDraft((d) => ({ ...d, businessInfo: info }))}
            />
          </div>
        )}

        {draft.step === 2 && (
          <div className="portal-card max-w-xl mx-auto">
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
          </div>
        )}

        {draft.step === 3 && (
          <div className="portal-card max-w-xl mx-auto">
            <StepIntegrations
              connectedIds={draft.connectedIntegrations}
              tier={draft.tier}
            />
          </div>
        )}

        {draft.step === 4 && (
          <div className="onboarding-step-card max-w-xl mx-auto">
            <StepComplete businessName={draft.businessInfo.businessName || undefined} />
          </div>
        )}
      </div>

      {/* Error display */}
      {finishError && (
        <div className="max-w-xl mx-auto w-full px-4">
          <div className="rounded-tenkai border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {finishError}
          </div>
        </div>
      )}

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
              className="tk-btn tk-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isLastBeforeComplete ? 'Finish Setup' : 'Continue'}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* OAuth toast */}
      {oauthToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <div className={`rounded-tenkai border px-4 py-3 shadow-lg text-sm font-medium ${
            oauthToast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-[#4A7C59]/10 border-[#4A7C59]/30 text-[#4A7C59]'
          }`}>
            {oauthToast.message}
          </div>
        </div>
      )}
    </div>
  )
}
