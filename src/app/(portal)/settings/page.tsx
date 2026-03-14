'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EMPTY_CLIENT_CONTEXT_FORM } from '@/lib/client-context'
import {
  CreditCard,
  Check,
} from 'lucide-react'

// --- Toggle Switch ---

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
          'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

// --- Form Field ---

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

// --- Profile Tab ---

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
      <div className="bg-white rounded-tenkai border border-tenkai-border p-6 max-w-xl">
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
    <div className="bg-white rounded-tenkai border border-tenkai-border p-6 space-y-6 max-w-xl">
      <div>
        <h3 className="font-serif text-lg text-charcoal">Business Profile</h3>
        <p className="text-warm-gray text-sm mt-1">
          Update your business information
        </p>
      </div>
      <div className="space-y-6">
        {/* Section: Business Basics */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Business Basics</h4>
          <FormField label="Business Name">
            <Input
              value={context.business_name}
              onChange={(e) => setField('business_name', (e.target as HTMLInputElement).value)}
              className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
            />
          </FormField>
          <FormField label="Website URL">
            <Input
              value={context.website_url}
              onChange={(e) => setField('website_url', (e.target as HTMLInputElement).value)}
              className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
            />
          </FormField>
          <FormField label="Industry">
            <Input
              value={context.business_industry}
              onChange={(e) => setField('business_industry', (e.target as HTMLInputElement).value)}
              className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="e.g. Home Services / Plumbing"
            />
          </FormField>
          <FormField label="Primary Location">
            <Input
              value={context.business_location}
              onChange={(e) => setField('business_location', (e.target as HTMLInputElement).value)}
              className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="e.g. Austin, TX"
            />
          </FormField>
          <FormField label="Years in Business">
            <Input
              value={context.years_in_business}
              onChange={(e) => setField('years_in_business', (e.target as HTMLInputElement).value)}
              className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="e.g. Since 2014"
            />
          </FormField>
          <FormField label="Contact Email">
            <Input
              value={email}
              disabled
              className="border-tenkai-border rounded-tenkai bg-parchment/40 text-warm-gray cursor-not-allowed"
            />
            <p className="text-xs text-muted-gray mt-1">This is your login email and cannot be changed here.</p>
          </FormField>
        </div>

        <div className="border-t border-tenkai-border" />

        {/* Section: Services & Market */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Services & Market</h4>
          <FormField label="Target Audience">
            <Input
              value={context.business_target_audience}
              onChange={(e) => setField('business_target_audience', (e.target as HTMLInputElement).value)}
              className="border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="e.g. Homeowners in Central Texas"
            />
          </FormField>
          <FormField label="Services">
            <Textarea
              value={context.services}
              onChange={(e) => setField('services', e.target.value)}
              rows={4}
              className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="One service per line"
            />
          </FormField>
          <FormField label="Service Areas">
            <Textarea
              value={context.service_areas}
              onChange={(e) => setField('service_areas', e.target.value)}
              rows={3}
              className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="Cities, metros, or neighborhoods you serve"
            />
          </FormField>
          <FormField label="What Makes You Different">
            <Textarea
              value={context.differentiators}
              onChange={(e) => setField('differentiators', e.target.value)}
              rows={3}
              className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="Guarantees, expertise, positioning, trust signals"
            />
          </FormField>
        </div>

        <div className="border-t border-tenkai-border" />

        {/* Section: SEO Strategy */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">SEO Strategy</h4>
          <FormField label="Business Goals">
            <Textarea
              value={context.business_goals}
              onChange={(e) => setField('business_goals', e.target.value)}
              rows={3}
              className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="Revenue, lead volume, geographic expansion, service-line growth"
            />
          </FormField>
          <FormField label="Target Keywords">
            <Textarea
              value={context.target_keywords}
              onChange={(e) => setField('target_keywords', e.target.value)}
              rows={4}
              className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="One keyword per line"
            />
          </FormField>
          <FormField label="Competitors">
            <Textarea
              value={context.competitors}
              onChange={(e) => setField('competitors', e.target.value)}
              rows={4}
              className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="Competitor domains or business names, one per line"
            />
          </FormField>
        </div>

        <div className="border-t border-tenkai-border" />

        {/* Section: Brand & Content */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-warm-gray uppercase tracking-wider">Brand & Content</h4>
          <FormField label="Brand Voice and Guidelines">
            <Textarea
              value={context.brand_guidelines}
              onChange={(e) => setField('brand_guidelines', e.target.value)}
              rows={4}
              className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="Tone, messaging rules, claims to avoid, compliance notes"
            />
          </FormField>
          <FormField label="Proof Points">
            <Textarea
              value={context.proof_points}
              onChange={(e) => setField('proof_points', e.target.value)}
              rows={3}
              className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="Testimonials, review highlights, case-study outcomes"
            />
          </FormField>
          <FormField label="Notes for the Tenkai Team">
            <Textarea
              value={context.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={4}
              className="border-tenkai-border rounded-tenkai resize-none focus-visible:border-torii focus-visible:ring-torii/20"
              placeholder="Context, constraints, seasonality, internal notes, campaign guidance"
            />
          </FormField>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-torii text-white hover:bg-torii-dark rounded-tenkai"
        >
          {saving ? 'Saving…' : 'Save Changes'}
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

// --- Billing Tab ---

function BillingTab() {
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState('')

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

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-white rounded-tenkai border border-tenkai-border p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-parchment/60 flex items-center justify-center">
            <CreditCard className="size-5 text-warm-gray" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-charcoal">Billing & Subscription</h3>
            <p className="text-warm-gray text-xs">Manage your plan, payment method, and invoices</p>
          </div>
        </div>
        <div className="space-y-4">
          <Button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="bg-torii text-white hover:bg-torii-dark rounded-tenkai"
          >
            {portalLoading ? 'Opening…' : 'Manage Billing'}
          </Button>
          {portalError && <p className="text-sm text-red-500">{portalError}</p>}
          <div className="bg-parchment/40 rounded-tenkai p-4 space-y-3">
            <p className="text-sm text-charcoal">
              Questions about your plan or invoices? We&apos;re happy to help:
            </p>
            <a
              href="mailto:support@tenkai.marketing?subject=Billing%20Question"
              className="inline-flex items-center gap-2 text-sm font-medium text-torii hover:text-torii-dark transition-colors"
            >
              support@tenkai.marketing
              <span className="text-xs text-warm-gray">(usually replies within a few hours)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Team Tab ---

function TeamTab() {
  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-white rounded-tenkai border border-tenkai-border p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-parchment/60 flex items-center justify-center">
            <svg className="size-5 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
          </div>
          <div>
            <h3 className="font-serif text-lg text-charcoal">Team Management</h3>
            <p className="text-warm-gray text-xs">Multi-seat access is launching soon</p>
          </div>
        </div>
        <div className="bg-parchment/40 rounded-tenkai p-4 space-y-3">
          <p className="text-sm text-charcoal">
            Need to give a teammate access now? We can set it up for you manually:
          </p>
          <a
            href="mailto:support@tenkai.marketing?subject=Team%20Access%20Request"
            className="inline-flex items-center gap-2 text-sm font-medium text-torii hover:text-torii-dark transition-colors"
          >
            support@tenkai.marketing
          </a>
          <p className="text-xs text-warm-gray">
            Include the email addresses and we&apos;ll send invites within a business day.
          </p>
        </div>
      </div>
    </div>
  )
}

// --- Notifications Tab ---

interface NotificationSetting {
  id: string
  label: string
  description: string
  defaultOn: boolean
}

const notificationSettings: NotificationSetting[] = [
  {
    id: 'content-approval',
    label: 'Content ready for approval',
    description: 'Get notified when your team creates content that needs your review',
    defaultOn: true,
  },
  {
    id: 'weekly-summary',
    label: 'Weekly performance summary',
    description: 'A digest of your key SEO metrics every Monday morning',
    defaultOn: true,
  },
  {
    id: 'ranking-changes',
    label: 'Ranking changes (significant moves)',
    description: 'Alerts when tracked keywords move 5+ positions up or down',
    defaultOn: true,
  },
  {
    id: 'audit-findings',
    label: 'New audit findings',
    description: 'Notified when Yuki finds new technical SEO issues on your site',
    defaultOn: false,
  },
  {
    id: 'billing-receipts',
    label: 'Monthly billing receipts',
    description: 'Receive payment confirmations and invoices via email',
    defaultOn: true,
  },
]

// Map UI ids to DB keys
const UI_TO_DB: Record<string, string> = {
  'content-approval': 'content_ready',
  'weekly-summary':   'weekly_report',
  'ranking-changes':  'strategy_updates',
  'audit-findings':   'audit_findings',
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
      <div className="bg-white rounded-tenkai border border-tenkai-border divide-y divide-tenkai-border/50">
        {notificationSettings.map((setting) => (
          <div
            key={setting.id}
            className="px-6 py-5 flex items-start justify-between gap-4"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-charcoal">{setting.label}</p>
              <p className="text-xs text-warm-gray leading-relaxed">
                {setting.description}
              </p>
            </div>
            <Toggle
              checked={settings[setting.id]}
              onChange={() => toggle(setting.id)}
            />
          </div>
        ))}
      </div>
      <p className={`text-xs transition-opacity duration-300 flex items-center gap-1 ${saved ? 'text-green-600 opacity-100' : saving ? 'text-warm-gray opacity-100' : 'opacity-0'}`}>
        <Check className="size-3.5" />
        {saving ? 'Saving…' : 'Preferences saved'}
      </p>
    </div>
  )
}

// --- Main Page ---

const VALID_TABS = ['profile', 'billing', 'team', 'notifications']

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  const activeTab = VALID_TABS.includes(tabParam ?? '') ? tabParam! : 'profile'

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`/settings?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl text-charcoal">Settings</h2>
        <p className="text-warm-gray text-sm mt-1">
          Manage your account, billing, and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-parchment/60 border border-tenkai-border rounded-tenkai">
          <TabsTrigger
            value="profile"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Billing
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Team
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-active:bg-white data-active:text-charcoal data-active:shadow-sm rounded-tenkai text-warm-gray"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab />
        </TabsContent>
        <TabsContent value="billing" className="mt-6">
          <BillingTab />
        </TabsContent>
        <TabsContent value="team" className="mt-6">
          <TeamTab />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
