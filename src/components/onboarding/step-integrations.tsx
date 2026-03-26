'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ExternalLink, Check, Calendar, Loader2 } from 'lucide-react'

interface Integration {
  id: string
  oauthType: string
  name: string
  description: string
  instructions: string
}

const integrations: Integration[] = [
  {
    id: 'gsc',
    oauthType: 'google_search_console',
    name: 'Google Search Console',
    description: 'See which keywords bring visitors to your site and track your rankings.',
    instructions: 'Connect your Google account to share Search Console data with your AI team.',
  },
  {
    id: 'ga4',
    oauthType: 'google_analytics',
    name: 'Google Analytics',
    description: 'Track visitor behavior and measure the impact of SEO improvements.',
    instructions: 'Connect your Google account to share Analytics data with your AI team.',
  },
  {
    id: 'gbp',
    oauthType: 'google_business_profile',
    name: 'Google Business Profile',
    description: 'Manage your local presence and respond to reviews.',
    instructions: 'Connect your Google account to let your AI team manage your Business Profile.',
  },
]

// Map OAuth types back to wizard IDs (used by parent on return)
export const OAUTH_TO_WIZARD_ID: Record<string, string> = {
  google_search_console: 'gsc',
  google_analytics: 'ga4',
  google_business_profile: 'gbp',
}

interface StepIntegrationsProps {
  connectedIds: string[]
  tier: string
}

export function StepIntegrations({ connectedIds, tier }: StepIntegrationsProps) {
  const showScheduleCall = tier.toLowerCase() === 'pro'
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const handleConnect = (integration: Integration) => {
    setConnectingId(integration.id)
    // Navigate to real OAuth flow — return_to brings user back to onboarding after Google consent
    window.location.href = `/api/auth/oauth/google?type=${integration.oauthType}&return_to=/onboarding`
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-up">
      <div className="space-y-2 text-center">
        <h2 className="font-serif text-2xl text-charcoal">Connect Your Accounts</h2>
        <p className="text-warm-gray text-sm">
          Optional but recommended. Your AI team works better with access to your data.
        </p>
      </div>

      <div className="space-y-3">
        {integrations.map((integration) => {
          const isConnected = connectedIds.includes(integration.id)
          const isConnecting = connectingId === integration.id

          return (
            <div
              key={integration.id}
              className={cn(
                'rounded-tenkai border p-4 transition-all duration-normal',
                isConnected
                  ? 'border-success/30 bg-success/5'
                  : 'border-tenkai-border bg-white hover:shadow-tenkai-sm'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-charcoal">{integration.name}</h3>
                    {isConnected && <Check className="size-4 text-success" />}
                  </div>
                  <p className="text-xs text-warm-gray mt-0.5">{integration.description}</p>
                  {!isConnected && (
                    <p className="text-xs text-charcoal/60 mt-2">{integration.instructions}</p>
                  )}
                </div>
                {!isConnected && (
                  <button
                    onClick={() => handleConnect(integration)}
                    disabled={isConnecting}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-tenkai border border-torii/30 text-torii text-xs font-medium hover:bg-torii/5 transition-colors duration-fast disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <ExternalLink className="size-3" />
                    )}
                    {isConnecting ? 'Redirecting…' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showScheduleCall && (
        <div className="text-center pt-2">
          <button className="inline-flex items-center gap-1.5 text-sm text-torii hover:text-torii-dark transition-colors">
            <Calendar className="size-4" />
            Schedule a Setup Call Instead
          </button>
        </div>
      )}

      <p className="text-center text-xs text-muted-gray">
        You can connect these anytime from Settings.
      </p>
    </div>
  )
}
