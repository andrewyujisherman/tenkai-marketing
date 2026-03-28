'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AgentCard } from '@/components/ui/agent-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast-notification'
import { EMPTY_CLIENT_CONTEXT_FORM } from '@/lib/client-context'
import {
  CreditCard,
  Check,
  ExternalLink,
  Link2,
  Link2Off,
  AlertTriangle,
} from 'lucide-react'

// ============================================================
// Toggle Switch (preserved from original)
// ============================================================

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-torii' : 'bg-muted-gray/40'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-ivory shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

// ============================================================
// Form Field (preserved from original)
// ============================================================

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-charcoal">{label}</label>
      {children}
    </div>
  )
}

// ============================================================
// Profile Tab (preserved from original)
// ============================================================

function ProfileTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [context, setContext] = useState(EMPTY_CLIENT_CONTEXT_FORM)
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetch('/api/portal/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data.client) {
          setContext({ ...EMPTY_CLIENT_CONTEXT_FORM, ...(data.context ?? {}) })
        }
        if (data.email) setEmail(data.email)
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  function setField<K extends keyof typeof context>(key: K, value: (typeof context)[K]) {
    setContext((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-ivory rounded-tenkai border border-tenkai-border p-6 max-w-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-parchment rounded w-1/3" />
          <div className="h-8 bg-parchment rounded" />
          <div className="h-8 bg-parchment rounded" />
          <div className="h-8 bg-parchment rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ivory rounded-tenkai border border-tenkai-border p-6 space-y-6 max-w-xl">
      <div>
        <h3 className="font-serif text-lg text-charcoal">Business Profile</h3>
        <p className="text-warm-gray text-sm mt-1">Update your business information</p>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Business Basics</h4>
          <FormField label="Business Name">
            <Input value={context.business_name} onChange={(e) => setField('business_name', (e.target as HTMLInputElement).value)} className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20" />
          </FormField>
          <FormField label="Website URL">
            <Input value={context.website_url} onChange={(e) => setField('website_url', (e.target as HTMLInputElement).value)} className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20" />
          </FormField>
          <FormField label="Industry">
            <Input value={context.business_industry} onChange={(e) => setField('business_industry', (e.target as HTMLInputElement).value)} className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20" placeholder="e.g. Home Services / Plumbing" />
          </FormField>
          <FormField label="Primary Location">
            <Input value={context.business_location} onChange={(e) => setField('business_location', (e.target as HTMLInputElement).value)} className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20" placeholder="e.g. Austin, TX" />
          </FormField>
          <FormField label="Years in Business">
            <Input value={context.years_in_business} onChange={(e) => setField('years_in_business', (e.target as HTMLInputElement).value)} className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20" placeholder="e.g. Since 2014" />
          </FormField>
          <FormField label="Contact Email">
            <Input value={email} disabled className="border-tenkai-border rounded-tenkai bg-parchment/40 text-warm-gray cursor-not-allowed" />
            <p className="text-xs text-muted-gray mt-1">This is your login email and cannot be changed here.</p>
          </FormField>
        </div>
        <div className="border-t border-tenkai-border" />
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Services & Market</h4>
          <FormField label="Target Audience">
            <Input value={context.business_target_audience} onChange={(e) => setField('business_target_audience', (e.target as HTMLInputElement).value)} className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20" placeholder="e.g. Homeowners in Central Texas" />
          </FormField>
          <FormField label="Services">
            <Textarea value={context.services} onChange={(e) => setField('services', e.target.value)} rows={4} className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20" placeholder="One service per line" />
          </FormField>
          <FormField label="Service Areas">
            <Textarea value={context.service_areas} onChange={(e) => setField('service_areas', e.target.value)} rows={3} className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20" placeholder="Cities, metros, or neighborhoods you serve" />
          </FormField>
          <FormField label="What Makes You Different">
            <Textarea value={context.differentiators} onChange={(e) => setField('differentiators', e.target.value)} rows={3} className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20" placeholder="Guarantees, expertise, positioning, trust signals" />
          </FormField>
        </div>
        <div className="border-t border-tenkai-border" />
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">SEO Strategy</h4>
          <FormField label="Business Goals">
            <Textarea value={context.business_goals} onChange={(e) => setField('business_goals', e.target.value)} rows={3} className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20" placeholder="Revenue, lead volume, geographic expansion, service-line growth" />
          </FormField>
          <FormField label="Target Keywords">
            <Textarea value={context.target_keywords} onChange={(e) => setField('target_keywords', e.target.value)} rows={4} className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20" placeholder="One keyword per line" />
          </FormField>
          <FormField label="Competitors">
            <Textarea value={context.competitors} onChange={(e) => setField('competitors', e.target.value)} rows={4} className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20" placeholder="Competitor domains or business names, one per line" />
          </FormField>
        </div>
        <div className="border-t border-tenkai-border" />
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Brand & Content</h4>
          <FormField label="Brand Voice and Guidelines">
            <Textarea value={context.brand_guidelines} onChange={(e) => setField('brand_guidelines', e.target.value)} rows={4} className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20" placeholder="Tone, messaging rules, claims to avoid, compliance notes" />
          </FormField>
          <FormField label="Proof Points">
            <Textarea value={context.proof_points} onChange={(e) => setField('proof_points', e.target.value)} rows={3} className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20" placeholder="Testimonials, review highlights, case-study outcomes" />
          </FormField>
          <FormField label="Notes for the Tenkai Team">
            <Textarea value={context.notes} onChange={(e) => setField('notes', e.target.value)} rows={4} className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20" placeholder="Context, constraints, seasonality, internal notes, campaign guidance" />
          </FormField>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-torii text-white hover:bg-torii-dark rounded-tenkai">
          {saving ? 'Saving\u2026' : 'Save Changes'}
        </Button>
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <Check className="size-3.5" /> Saved
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Billing Tab (enhanced with billing status API)
// ============================================================

interface BillingStatus {
  tier: string
  tier_display: string
  price: number
  next_billing: string
  payment_last4: string
  is_highest_tier: boolean
}

function BillingTab() {
  const [status, setStatus] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState('')

  useEffect(() => {
    fetch('/api/billing/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleManageBilling() {
    setPortalLoading(true)
    setPortalError('')
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to open billing portal')
      window.location.href = data.url
    } catch (e: unknown) {
      setPortalError(e instanceof Error ? e.message : 'Something went wrong')
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl animate-pulse">
        <div className="bg-ivory rounded-tenkai border border-tenkai-border p-8 space-y-4">
          <div className="h-6 bg-parchment rounded w-1/3" />
          <div className="h-4 bg-parchment rounded w-1/2" />
          <div className="h-10 bg-parchment rounded w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="portal-card space-y-5">
        <div className="portal-card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-parchment/60 flex items-center justify-center">
              <CreditCard className="size-5 text-warm-gray" />
            </div>
            <div>
              <h3>Billing & Subscription</h3>
              <p className="text-warm-gray text-xs">Manage your plan, payment method, and invoices</p>
            </div>
          </div>
        </div>

        {status && (
          <div className="bg-parchment/30 rounded-tenkai p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-charcoal">{status.tier_display} Plan</span>
              <span className="text-sm font-semibold text-torii">${status.price}/mo</span>
            </div>
            <div className="flex items-center justify-between text-xs text-warm-gray">
              <span>Next billing: {new Date(status.next_billing).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>Card ending in {status.payment_last4}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="bg-torii text-white hover:bg-torii-dark rounded-tenkai"
          >
            {portalLoading ? 'Opening\u2026' : 'Manage Billing'}
          </Button>
          {status && !status.is_highest_tier && (
            <Button
              variant="outline"
              className="rounded-tenkai border-torii text-torii hover:bg-torii/5"
              onClick={() => window.location.href = '/#pricing'}
            >
              Upgrade Plan
            </Button>
          )}
        </div>
        {portalError && <p className="text-sm text-red-500">{portalError}</p>}

        <div className="bg-parchment/40 rounded-tenkai p-4 space-y-3">
          <p className="text-sm text-charcoal">
            Questions about your plan or invoices? We&apos;re happy to help:
          </p>
          <a
            href="mailto:support@tenkaimarketing.com?subject=Billing%20Question"
            className="inline-flex items-center gap-2 text-sm font-medium text-torii hover:text-torii-dark transition-colors"
          >
            support@tenkaimarketing.com
            <span className="text-xs text-warm-gray">(usually replies within a few hours)</span>
          </a>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Team Tab (agent rename)
// ============================================================

interface AgentInfo {
  id: string
  name: string
  custom_name: string | null
  kanji: string
  role: string
  handles: string[]
}

function TeamTab() {
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then((data) => setAgents(data.agents ?? []))
      .catch(() => addToast('error', 'Failed to load your team'))
      .finally(() => setLoading(false))
  }, [addToast])

  const handleRename = useCallback(async (agentId: string, newName: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Rename failed')

      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? { ...a, custom_name: newName === a.name ? null : newName }
            : a
        )
      )
      addToast('success', `Renamed to ${newName}`)
    } catch (e: unknown) {
      addToast('error', e instanceof Error ? e.message : 'Failed to save name change.')
    }
  }, [addToast])

  if (loading) {
    return (
      <div className="max-w-xl space-y-3 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-ivory rounded-tenkai border border-tenkai-border p-4 h-16" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-1">
        <h3 className="font-serif text-lg text-charcoal">Your Team</h3>
        <p className="text-warm-gray text-xs">Double-click a name to rename your AI agents</p>
      </div>
      <div className="space-y-3">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agentId={agent.id}
            name={agent.name}
            kanji={agent.kanji}
            role={agent.role}
            customName={agent.custom_name ?? undefined}
            showStatus={false}
            size="editable"
            editable
            onRename={(newName) => handleRename(agent.id, newName)}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Integrations Tab
// ============================================================

interface Integration {
  type: string
  name: string
  oauth_type: string
  status: string
  connected_at: string | null
  metadata?: Record<string, unknown> | null
}

interface PropertyOption {
  value: string
  label: string
}

interface WizardConfig {
  serviceUrl: string
  step2Instructions: string[]
  step2HelpText: string
}

const WIZARD_CONFIG: Record<string, WizardConfig> = {
  google_search_console: {
    serviceUrl: 'https://search.google.com/search-console',
    step2Instructions: [
      'In the left sidebar, click on the property dropdown at the top',
      'Select the property that matches your website (e.g. "https://yoursite.com")',
      'If you don\'t see your site, you may need to add and verify it first',
    ],
    step2HelpText: 'Can\'t find your property? Make sure you\'re signed into the correct Google account that owns the Search Console property.',
  },
  google_analytics: {
    serviceUrl: 'https://analytics.google.com',
    step2Instructions: [
      'Click the property selector at the top of the page',
      'Choose the GA4 property for your website (look for "GA4" — not Universal Analytics)',
      'Confirm the property name and measurement ID match your site',
    ],
    step2HelpText: 'Only GA4 properties are supported. If you only see Universal Analytics properties, you\'ll need to set up GA4 for your site first.',
  },
  google_business_profile: {
    serviceUrl: 'https://business.google.com',
    step2Instructions: [
      'You\'ll see your business listing on the main dashboard',
      'Confirm the business name and address match your actual location',
      'If you manage multiple locations, select the primary one',
    ],
    step2HelpText: 'Don\'t have a Google Business Profile yet? You\'ll need to create and verify one at business.google.com before connecting.',
  },
}

// Step indicator dots
function WizardSteps({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all',
            i < current
              ? 'w-2 h-2 bg-torii'
              : i === current
              ? 'w-2.5 h-2.5 bg-torii'
              : 'w-2 h-2 bg-warm-gray/30'
          )}
        />
      ))}
    </div>
  )
}

function IntegrationCard({
  integration,
  tier,
  onDisconnect,
}: {
  integration: Integration
  tier: string
  onDisconnect: (type: string) => void
}) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(0) // 0-indexed: 0, 1, 2
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [propertyLoading, setPropertyLoading] = useState(false)
  const [propertySaving, setPropertySaving] = useState(false)
  const isConnected = integration.status === 'connected'
  const isExpired = integration.status === 'expired'
  const config = WIZARD_CONFIG[integration.type]

  const hasMultipleProperties = (integration.type === 'google_search_console' || integration.type === 'google_analytics') && isConnected

  useEffect(() => {
    if (!hasMultipleProperties) return
    setPropertyLoading(true)
    fetch(`/api/integrations/properties?type=${integration.type}`)
      .then((r) => r.json())
      .then((data) => {
        setPropertyOptions(data.options ?? [])
        setSelectedProperty(data.selected ?? null)
      })
      .catch(() => {})
      .finally(() => setPropertyLoading(false))
  }, [hasMultipleProperties, integration.type])

  async function handlePropertyChange(value: string) {
    setPropertySaving(true)
    const body: Record<string, string> = { type: integration.type }
    if (integration.type === 'google_search_console') body.site_url = value
    else body.property_id = value
    try {
      const res = await fetch('/api/integrations/select-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) setSelectedProperty(value)
    } catch {}
    setPropertySaving(false)
  }

  function openWizard() {
    setStep(0)
    setWizardOpen(true)
  }

  function closeWizard() {
    setWizardOpen(false)
    setStep(0)
  }

  const stepLabels = ['Open Service', 'Find Property', 'Authorize Tenkai']

  return (
    <div className="portal-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Card header row */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-parchment/60 flex items-center justify-center flex-shrink-0">
              {isConnected ? (
                <Link2 className="size-5 text-success" />
              ) : isExpired ? (
                <AlertTriangle className="size-5 text-warning" />
              ) : (
                <Link2Off className="size-5 text-warm-gray" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">{integration.name}</p>
              <StatusBadge
                status={isConnected ? 'connected' : 'not-connected'}
                variant="dot-label"
                label={isExpired ? 'Reconnect Needed' : undefined}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected && !confirmDisconnect && (
              <button
                onClick={() => setConfirmDisconnect(true)}
                className="text-xs text-warm-gray hover:text-error transition-colors"
              >
                Disconnect
              </button>
            )}
            {confirmDisconnect && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-error">Disconnect?</span>
                <button
                  onClick={() => { onDisconnect(integration.type); setConfirmDisconnect(false) }}
                  className="text-xs font-medium text-error hover:text-error/80"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDisconnect(false)}
                  className="text-xs text-warm-gray hover:text-charcoal"
                >
                  Cancel
                </button>
              </div>
            )}
            {(!isConnected || isExpired) && !wizardOpen && (
              <button
                onClick={openWizard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-torii text-white text-xs font-medium rounded-tenkai hover:bg-[#a84540] transition-colors"
              >
                <Link2 className="size-3" />
                {isExpired ? 'Reconnect' : 'Connect'}
              </button>
            )}
            {wizardOpen && (
              <button
                onClick={closeWizard}
                className="text-xs text-warm-gray hover:text-charcoal transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {isConnected && integration.connected_at && (
          <p className="text-xs text-[#8A8580] mt-3">
            Connected {new Date(integration.connected_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        )}

        {hasMultipleProperties && propertyOptions.length > 1 && (
          <div className="mt-3">
            <label className="text-xs font-medium text-charcoal block mb-1">
              {integration.type === 'google_search_console' ? 'Active Site' : 'Active Property'}
            </label>
            <div className="relative">
              <select
                value={selectedProperty ?? ''}
                onChange={(e) => handlePropertyChange(e.target.value)}
                disabled={propertySaving || propertyLoading}
                className="w-full text-xs px-3 py-2 bg-ivory border border-tenkai-border rounded-tenkai text-charcoal appearance-none cursor-pointer hover:border-torii transition-colors disabled:opacity-50 pr-8"
              >
                {propertyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                {propertySaving ? (
                  <span className="text-[10px] text-warm-gray">Saving...</span>
                ) : (
                  <svg className="size-3 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                )}
              </div>
            </div>
          </div>
        )}

        {tier === 'done_for_you' && !isConnected && !wizardOpen && (
          <a
            href="mailto:support@tenkaimarketing.com?subject=Integration%20Setup%20Help"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-torii hover:text-[#a84540] transition-colors mt-3"
          >
            Schedule Setup Call
          </a>
        )}
      </div>

      {/* Wizard panel */}
      {wizardOpen && config && (
        <div className="connection-wizard px-5">
          {/* Step progress */}
          <div className="flex items-center justify-between mb-3">
            <WizardSteps current={step} total={3} />
            <span className="text-xs text-warm-gray">Step {step + 1} of 3</span>
          </div>

          {/* Step 1: Open the service */}
          {step === 0 && (
            <div className="wizard-step">
              <div className="wizard-step-num">1</div>
              <div className="wizard-step-content space-y-3">
                <div>
                  <p className="text-sm font-medium text-charcoal">{stepLabels[0]}</p>
                  <p className="text-xs text-warm-gray mt-1">
                    First, open {integration.name} in a new tab and make sure you&apos;re signed in with the Google account that has access to your property.
                  </p>
                </div>
                <a
                  href={config.serviceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-ivory border border-tenkai-border rounded-tenkai text-xs font-medium text-charcoal hover:border-torii hover:text-torii transition-colors"
                >
                  <ExternalLink className="size-3" />
                  Open {integration.name}
                </a>
                <div className="flex justify-end pt-1">
                  <button onClick={() => setStep(1)} className="tk-btn tk-btn-primary tk-btn-sm">
                    I&apos;m signed in — next step
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Find your property */}
          {step === 1 && (
            <div className="wizard-step">
              <div className="wizard-step-num">2</div>
              <div className="wizard-step-content space-y-3">
                <div>
                  <p className="text-sm font-medium text-charcoal">{stepLabels[1]}</p>
                  <p className="text-xs text-warm-gray mt-1">Locate the property you want to connect to Tenkai.</p>
                </div>
                <ol className="space-y-1.5">
                  {config.step2Instructions.map((instruction, i) => (
                    <li key={i} className="flex gap-2 text-xs text-warm-gray">
                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-parchment/80 border border-tenkai-border flex items-center justify-center text-[10px] font-semibold text-warm-gray">
                        {i + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
                {config.step2HelpText && (
                  <div className="bg-ivory border border-tenkai-border rounded-tenkai p-3">
                    <p className="text-xs text-warm-gray leading-relaxed">
                      <span className="font-medium text-charcoal">Having trouble? </span>
                      {config.step2HelpText}
                    </p>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <button onClick={() => setStep(0)} className="tk-btn tk-btn-secondary tk-btn-sm">Back</button>
                  <button onClick={() => setStep(2)} className="tk-btn tk-btn-primary tk-btn-sm">I found it — next step</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Authorize Tenkai */}
          {step === 2 && (
            <div className="wizard-step">
              <div className="wizard-step-num">3</div>
              <div className="wizard-step-content space-y-3">
                <div>
                  <p className="text-sm font-medium text-charcoal">{stepLabels[2]}</p>
                  <p className="text-xs text-warm-gray mt-1">
                    Tenkai requests <span className="font-medium text-charcoal">read-only</span> access — we never modify your data. You&apos;ll see a Google permission screen where you can review exactly what&apos;s being requested before approving.
                  </p>
                </div>
                <div className="bg-ivory border border-tenkai-border rounded-tenkai p-3 space-y-1">
                  <p className="text-xs font-medium text-charcoal">What Tenkai can do:</p>
                  <ul className="space-y-0.5">
                    {['View your search performance data', 'Read traffic and user metrics', 'See your property information'].map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-warm-gray">
                        <Check className="size-3 text-success flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-between pt-1">
                  <button onClick={() => setStep(1)} className="tk-btn tk-btn-secondary tk-btn-sm">Back</button>
                  <a
                    href={`/api/auth/oauth/google?type=${integration.oauth_type}`}
                    className="tk-btn tk-btn-primary tk-btn-sm"
                  >
                    <ExternalLink className="size-3" />
                    Authorize Tenkai to read my data
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [tier, setTier] = useState('growth')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/integrations')
      .then((r) => r.json())
      .then((data) => {
        setIntegrations(data.integrations ?? [])
        setTier(data.tier ?? 'growth')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-xl space-y-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-ivory rounded-tenkai border border-tenkai-border p-5 h-20" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-4" id="integrations">
      <div className="space-y-1">
        <h3 className="font-serif text-lg text-charcoal">Connected Accounts</h3>
        <p className="text-warm-gray text-xs">Manage your integration connections for analytics and search data</p>
      </div>
      <div className="space-y-3">
        {integrations.map((integration) => (
          <IntegrationCard
            key={integration.type}
            integration={integration}
            tier={tier}
            onDisconnect={() => {
              // In production this would call a disconnect API
              setIntegrations((prev) =>
                prev.map((i) =>
                  i.type === integration.type ? { ...i, status: 'not_connected', connected_at: null } : i
                )
              )
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Notifications Tab (preserved from original)
// ============================================================

interface NotificationSetting {
  id: string
  label: string
  description: string
  defaultOn: boolean
}

const notificationSettings: NotificationSetting[] = [
  { id: 'content-approval', label: 'Content ready for approval', description: 'Get notified when your team creates content that needs your review', defaultOn: true },
  { id: 'weekly-summary', label: 'Weekly performance summary', description: 'A digest of your key SEO metrics every Monday morning', defaultOn: true },
  { id: 'ranking-changes', label: 'Ranking changes (significant moves)', description: 'Alerts when tracked keywords move 5+ positions up or down', defaultOn: true },
  { id: 'audit-findings', label: 'New audit findings', description: 'Notified when Kenji finds new technical SEO issues on your site', defaultOn: false },
  { id: 'billing-receipts', label: 'Monthly billing receipts', description: 'Receive payment confirmations and invoices via email', defaultOn: true },
]

const UI_TO_DB: Record<string, string> = {
  'content-approval': 'content_ready',
  'weekly-summary': 'weekly_report',
  'ranking-changes': 'strategy_updates',
  'audit-findings': 'audit_findings',
  'billing-receipts': 'billing_alerts',
}

function NotificationsTab() {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationSettings.map((s) => [s.id, s.defaultOn]))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/portal/notifications')
      .then((r) => r.json())
      .then((data) => {
        if (data.preferences) {
          const prefs = data.preferences
          setSettings((prev) => {
            const next = { ...prev }
            for (const [uiId, dbKey] of Object.entries(UI_TO_DB)) {
              if (prefs[dbKey] !== undefined) next[uiId] = prefs[dbKey]
            }
            return next
          })
        }
      })
  }, [])

  function savePreferences(next: Record<string, boolean>) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSaving(true)
      const dbPrefs: Record<string, boolean> = {}
      for (const [uiId, dbKey] of Object.entries(UI_TO_DB)) {
        dbPrefs[dbKey] = next[uiId] ?? false
      }
      await fetch('/api/portal/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: dbPrefs }),
      })
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }, 600)
  }

  function toggle(id: string) {
    setSettings((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      savePreferences(next)
      return next
    })
  }

  return (
    <div className="space-y-3 max-w-xl">
      <div className="bg-ivory rounded-tenkai border border-tenkai-border divide-y divide-tenkai-border/50">
        {notificationSettings.map((setting) => (
          <div key={setting.id} className="px-6 py-5 flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-charcoal">{setting.label}</p>
              <p className="text-xs text-warm-gray leading-relaxed">{setting.description}</p>
            </div>
            <Toggle checked={settings[setting.id]} onChange={() => toggle(setting.id)} />
          </div>
        ))}
      </div>
      <p className={`text-xs transition-opacity duration-300 flex items-center gap-1 ${saved ? 'text-green-600 opacity-100' : saving ? 'text-warm-gray opacity-100' : 'opacity-0'}`}>
        <Check className="size-3.5" />
        {saving ? 'Saving\u2026' : 'Preferences saved'}
      </p>
      <p className="text-xs text-warm-gray mt-2">
        Email notifications are delivered to your account email. Manage delivery preferences above.
      </p>
    </div>
  )
}

// ============================================================
// Main Settings Page
// ============================================================

const VALID_TABS = ['profile', 'billing', 'team', 'integrations', 'notifications']

export default function SettingsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  const activeTab = VALID_TABS.includes(tabParam ?? '') ? tabParam! : 'profile'

  // Handle hash-based anchor scrolling (e.g., /settings#integrations)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash === 'integrations') {
      router.replace('/settings?tab=integrations')
    }
  }, [router])

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`/settings?${params.toString()}`)
  }

  const tabLabels: Record<string, string> = {
    profile: 'Profile',
    billing: 'Billing',
    team: 'Your Team',
    integrations: 'Integrations',
    notifications: 'Notifications',
  }

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="border-b border-tenkai-border">
        <nav className="flex gap-6" role="tablist">
          {VALID_TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => handleTabChange(tab)}
              className={cn(
                'pb-3 text-sm font-medium transition-colors relative',
                activeTab === tab
                  ? 'text-torii'
                  : 'text-warm-gray hover:text-charcoal'
              )}
            >
              {tabLabels[tab]}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-torii rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'billing' && <BillingTab />}
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
      </div>
    </div>
  )
}
