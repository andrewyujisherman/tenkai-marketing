'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Save,
  Globe,
  Users,
  PenTool,
  Tag,
  Building,
  Wifi,
  WifiOff,
  Info,
} from 'lucide-react'
import { EMPTY_CLIENT_CONTEXT_FORM, type ClientContextForm } from '@/lib/client-context'

// ─── Types ────────────────────────────────────────────────────────────────────

type OAuthStatus = 'not_connected' | 'pending' | 'active' | 'expired' | 'error'
type FormState = ClientContextForm

interface StatusData {
  integrations: Array<{
    type: string
    status: OAuthStatus
    display_name: string
    description: string
    required: boolean
  }>
  completion_percentage: number
  client_id: string | null
  form: FormState
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countLines(val: string) {
  return val
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean).length
}

function hasValue(val: string) {
  return val.trim().length > 0
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function ConnectedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#4A7C59]/10 text-[#4A7C59] border border-[#4A7C59]/20">
      <CheckCircle2 className="size-3" />
      Connected
    </span>
  )
}

function NotConnectedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-parchment text-warm-gray border border-tenkai-border">
      <WifiOff className="size-3" />
      Not connected
    </span>
  )
}

function ErrorBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
      <AlertCircle className="size-3" />
      {label}
    </span>
  )
}

// ─── Section 1: Data Connections (OAuth) ──────────────────────────────────────

const OAUTH_CONNECTORS = [
  {
    type: 'google_search_console',
    label: 'Google Search Console',
    desc: 'Real keyword rankings, clicks, and impressions from your site.',
    icon: '🔍',
    note: null,
  },
  {
    type: 'google_analytics',
    label: 'Google Analytics 4',
    desc: 'Traffic, engagement, and conversion data.',
    icon: '📊',
    note: null,
  },
  {
    type: 'google_business_profile',
    label: 'Google Business Profile',
    desc: 'Local SEO, reviews, and GBP optimization.',
    icon: '📍',
    note: 'Recommended for local businesses',
  },
]

function OAuthConnectorCard({
  connector,
  status,
}: {
  connector: (typeof OAUTH_CONNECTORS)[number]
  status: OAuthStatus
}) {
  const isConnected = status === 'active'
  const isError = status === 'expired' || status === 'error'

  return (
    <div className="border border-tenkai-border rounded-tenkai bg-cream p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-torii/8 flex items-center justify-center text-xl flex-shrink-0">
        {connector.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-charcoal">{connector.label}</span>
          {connector.note && (
            <span className="text-[10px] text-warm-gray border border-tenkai-border rounded-full px-2 py-0.5">
              {connector.note}
            </span>
          )}
        </div>
        <p className="text-xs text-warm-gray mt-0.5">{connector.desc}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isConnected ? (
          <ConnectedBadge />
        ) : isError ? (
          <ErrorBadge label={status === 'expired' ? 'Expired' : 'Error'} />
        ) : (
          <NotConnectedBadge />
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-xs rounded-tenkai border-tenkai-border text-warm-gray cursor-not-allowed opacity-60"
              >
                {isConnected ? 'Reconnect' : 'Connect'}
              </Button>
            } />
            <TooltipContent
              side="top"
              className="max-w-[200px] text-center text-xs bg-charcoal text-cream border-0"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="size-3 text-torii flex-shrink-0" />
                Coming soon — we&apos;ll notify you when ready
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

// ─── Section 2: Website Platform (CMS) ────────────────────────────────────────

const CMS_PLATFORMS = [
  { id: 'wordpress', label: 'WordPress', icon: '🔵', available: true },
  { id: 'shopify', label: 'Shopify', icon: '🛍️', available: false },
  { id: 'wix', label: 'Wix', icon: '🟡', available: false },
  { id: 'squarespace', label: 'Squarespace', icon: '⬛', available: false },
  { id: 'webflow', label: 'Webflow', icon: '🌐', available: false },
  { id: 'other', label: 'Other / Custom', icon: '⚙️', available: true },
]

function CMSPlatformSection({
  form,
  setField,
  saving,
  onSave,
  saveSuccess,
}: {
  form: FormState
  setField: (k: keyof FormState, v: string) => void
  saving: boolean
  onSave: () => void
  saveSuccess: boolean
}) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)

  // Infer selected platform from form data
  useEffect(() => {
    if (form.cms_url && !selectedPlatform) {
      setSelectedPlatform('wordpress')
    }
  }, [form.cms_url, selectedPlatform])

  const isConnected = hasValue(form.cms_url)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {CMS_PLATFORMS.map((p) => {
          const active = selectedPlatform === p.id
          const connected = active && isConnected && p.id === 'wordpress'
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(active ? null : p.id)}
              className={[
                'relative flex flex-col items-center gap-1.5 p-3 rounded-tenkai border text-xs font-medium transition-all',
                active
                  ? 'border-torii bg-torii/6 text-torii'
                  : 'border-tenkai-border bg-cream text-warm-gray hover:bg-parchment/60',
                !p.available && !active ? 'opacity-60' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="text-xl">{p.icon}</span>
              <span className="text-[11px] leading-tight text-center">{p.label}</span>
              {connected && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#4A7C59] rounded-full flex items-center justify-center">
                  <CheckCircle2 className="size-2.5 text-white" />
                </span>
              )}
              {!p.available && !active && (
                <span className="text-[9px] text-torii/60 font-normal">Soon</span>
              )}
            </button>
          )
        })}
      </div>

      {selectedPlatform === 'wordpress' && (
        <div className="border border-tenkai-border rounded-tenkai bg-cream p-4 space-y-3">
          <p className="text-xs font-medium text-charcoal">WordPress credentials</p>
          <Input
            value={form.cms_url}
            onChange={(e) => setField('cms_url', (e.target as HTMLInputElement).value)}
            placeholder="https://yourbusiness.com/wp-admin"
            className="h-9 text-sm border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
          />
          <Input
            value={form.cms_username}
            onChange={(e) => setField('cms_username', (e.target as HTMLInputElement).value)}
            placeholder="Application password (Settings → Users → Application Passwords)"
            className="h-9 text-sm border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-warm-gray flex items-center gap-1">
              <Info className="size-3" />
              We only publish content — never modify settings
            </p>
            <Button
              onClick={onSave}
              disabled={saving}
              size="sm"
              className="bg-torii text-white hover:bg-torii-dark rounded-tenkai text-xs gap-1.5"
            >
              <Save className="size-3.5" />
              {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {selectedPlatform === 'other' && (
        <div className="border border-tenkai-border rounded-tenkai bg-cream p-4 space-y-3">
          <p className="text-xs font-medium text-charcoal">Describe your platform</p>
          <Textarea
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Tell us about your CMS or hosting setup. We'll figure out the best way to connect."
            rows={3}
            className="text-sm border-tenkai-border rounded-tenkai bg-transparent resize-none focus-visible:border-torii focus-visible:ring-torii/20"
          />
          <div className="flex justify-end">
            <Button
              onClick={onSave}
              disabled={saving}
              size="sm"
              className="bg-torii text-white hover:bg-torii-dark rounded-tenkai text-xs gap-1.5"
            >
              <Save className="size-3.5" />
              {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {selectedPlatform &&
        !['wordpress', 'other'].includes(selectedPlatform) && (
          <div className="border border-tenkai-border rounded-tenkai bg-parchment/40 p-4 flex items-center gap-3 text-sm text-warm-gray">
            <Clock className="size-4 text-torii flex-shrink-0" />
            <span>
              {CMS_PLATFORMS.find((p) => p.id === selectedPlatform)?.label} integration coming soon —
              we&apos;ll notify you when it&apos;s ready.
            </span>
          </div>
        )}
    </div>
  )
}

// ─── Section 3: Business Context (collapsible) ────────────────────────────────

interface ContextSectionDef {
  id: string
  label: string
  icon: React.ReactNode
  completionLabel: (form: FormState) => string | null
  isComplete: (form: FormState) => boolean
  required?: boolean
}

const CONTEXT_SECTIONS: ContextSectionDef[] = [
  {
    id: 'website_url',
    label: 'Website URL',
    icon: <Globe className="size-4" />,
    required: true,
    isComplete: (f) => hasValue(f.website_url),
    completionLabel: (f) => (hasValue(f.website_url) ? f.website_url : null),
  },
  {
    id: 'competitors',
    label: 'Competitors',
    icon: <Users className="size-4" />,
    isComplete: (f) => hasValue(f.competitors),
    completionLabel: (f) => {
      const n = countLines(f.competitors)
      return n > 0 ? `${n} competitor${n !== 1 ? 's' : ''}` : null
    },
  },
  {
    id: 'target_keywords',
    label: 'Target Keywords',
    icon: <Tag className="size-4" />,
    isComplete: (f) => hasValue(f.target_keywords),
    completionLabel: (f) => {
      const n = countLines(f.target_keywords)
      return n > 0 ? `${n} keyword${n !== 1 ? 's' : ''}` : null
    },
  },
  {
    id: 'brand_guidelines',
    label: 'Brand Voice & Guidelines',
    icon: <PenTool className="size-4" />,
    isComplete: (f) => hasValue(f.brand_guidelines),
    completionLabel: (f) => (hasValue(f.brand_guidelines) ? 'Added' : null),
  },
  {
    id: 'business_info',
    label: 'Business Information',
    icon: <Building className="size-4" />,
    required: true,
    isComplete: (f) => hasValue(f.business_name),
    completionLabel: (f) => (hasValue(f.business_name) ? f.business_name : null),
  },
]

function ContextSectionRow({
  def,
  form,
  setField,
  expanded,
  onToggle,
  onSave,
  saving,
  saveSuccess,
}: {
  def: ContextSectionDef
  form: FormState
  setField: (k: keyof FormState, v: string) => void
  expanded: boolean
  onToggle: () => void
  onSave: () => void
  saving: boolean
  saveSuccess: boolean
}) {
  const complete = def.isComplete(form)
  const completionLabel = def.completionLabel(form)

  return (
    <div className="border border-tenkai-border rounded-tenkai bg-cream overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-parchment/40 transition-colors"
      >
        <div
          className={[
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
            complete
              ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
              : 'bg-torii/8 text-torii',
          ].join(' ')}
        >
          {def.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal">{def.label}</span>
            {def.required && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-torii/50">
                required
              </span>
            )}
          </div>
          {completionLabel && (
            <p className="text-xs text-warm-gray mt-0.5 truncate">{completionLabel}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {complete ? (
            <CheckCircle2 className="size-4 text-[#4A7C59]" />
          ) : (
            <div className="size-4 rounded-full border-2 border-tenkai-border" />
          )}
          {expanded ? (
            <ChevronUp className="size-4 text-warm-gray" />
          ) : (
            <ChevronDown className="size-4 text-warm-gray" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-tenkai-border/50 bg-parchment/20 space-y-3">
          <ContextFields sectionId={def.id} form={form} setField={setField} />
          <div className="flex items-center justify-end pt-1">
            <Button
              onClick={onSave}
              disabled={saving}
              size="sm"
              className="bg-torii text-white hover:bg-torii-dark rounded-tenkai text-xs gap-1.5"
            >
              <Save className="size-3.5" />
              {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ContextFields({
  sectionId,
  form,
  setField,
}: {
  sectionId: string
  form: FormState
  setField: (k: keyof FormState, v: string) => void
}) {
  const inputClass =
    'h-9 text-sm border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20'
  const textareaClass =
    'text-sm border-tenkai-border rounded-tenkai bg-transparent resize-none focus-visible:border-torii focus-visible:ring-torii/20'

  if (sectionId === 'website_url') {
    return (
      <Input
        value={form.website_url}
        onChange={(e) => setField('website_url', (e.target as HTMLInputElement).value)}
        placeholder="https://yourbusiness.com"
        className={inputClass}
      />
    )
  }

  if (sectionId === 'competitors') {
    return (
      <Textarea
        value={form.competitors}
        onChange={(e) => setField('competitors', e.target.value)}
        placeholder={'One competitor URL per line\nhttps://competitor1.com\nhttps://competitor2.com'}
        rows={4}
        className={textareaClass}
      />
    )
  }

  if (sectionId === 'target_keywords') {
    return (
      <Textarea
        value={form.target_keywords}
        onChange={(e) => setField('target_keywords', e.target.value)}
        placeholder={'One keyword or phrase per line\nplumber near me\nemergency plumbing Austin'}
        rows={4}
        className={textareaClass}
      />
    )
  }

  if (sectionId === 'brand_guidelines') {
    return (
      <Textarea
        value={form.brand_guidelines}
        onChange={(e) => setField('brand_guidelines', e.target.value)}
        placeholder="Describe your brand voice, tone, and writing guidelines. What should we always/never say?"
        rows={5}
        className={textareaClass}
      />
    )
  }

  if (sectionId === 'business_info') {
    const inputCls = inputClass
    const textCls = textareaClass
    return (
      <div className="space-y-2">
        <Input
          value={form.business_name}
          onChange={(e) => setField('business_name', (e.target as HTMLInputElement).value)}
          placeholder="Business name"
          className={inputCls}
        />
        <Input
          value={form.business_location}
          onChange={(e) => setField('business_location', (e.target as HTMLInputElement).value)}
          placeholder="City, State (e.g., Austin, TX)"
          className={inputCls}
        />
        <Input
          value={form.business_industry}
          onChange={(e) => setField('business_industry', (e.target as HTMLInputElement).value)}
          placeholder="Industry (e.g., Plumbing, Dental, Real Estate)"
          className={inputCls}
        />
        <Input
          value={form.business_target_audience}
          onChange={(e) =>
            setField('business_target_audience', (e.target as HTMLInputElement).value)
          }
          placeholder="Target audience (e.g., homeowners in Austin, TX)"
          className={inputCls}
        />
        <Input
          value={form.years_in_business}
          onChange={(e) => setField('years_in_business', (e.target as HTMLInputElement).value)}
          placeholder="Years in business (e.g., Since 2014)"
          className={inputCls}
        />
        <Textarea
          value={form.services}
          onChange={(e) => setField('services', e.target.value)}
          placeholder={'Main services, one per line\nEmergency plumbing\nWater heater installation'}
          rows={3}
          className={textCls}
        />
        <Textarea
          value={form.service_areas}
          onChange={(e) => setField('service_areas', e.target.value)}
          placeholder={'Service areas, one per line\nAustin, TX\nRound Rock, TX'}
          rows={3}
          className={textCls}
        />
        <Textarea
          value={form.differentiators}
          onChange={(e) => setField('differentiators', e.target.value)}
          placeholder="What makes you different? Certifications, guarantees, response times..."
          rows={3}
          className={textCls}
        />
        <Textarea
          value={form.business_goals}
          onChange={(e) => setField('business_goals', e.target.value)}
          placeholder="Business or SEO goals for the next 3–6 months"
          rows={3}
          className={textCls}
        />
        <Textarea
          value={form.proof_points}
          onChange={(e) => setField('proof_points', e.target.value)}
          placeholder="Reviews, testimonials, case-study wins, trust signals"
          rows={3}
          className={textCls}
        />
        <Textarea
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="Anything else your Tenkai team should know: constraints, seasonality, offers..."
          rows={4}
          className={textCls}
        />
      </div>
    )
  }

  return null
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormState>(EMPTY_CLIENT_CONTEXT_FORM)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/onboarding/status')
      if (!res.ok) return
      const data: StatusData = await res.json()
      setStatusData(data)
      setForm({ ...EMPTY_CLIENT_CONTEXT_FORM, ...(data.form ?? {}) })
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        fetchStatus()
      }
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  const toggleSection = (id: string) => {
    setExpandedSection((prev) => (prev === id ? null : id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-warm-gray text-sm">Loading connectors…</div>
      </div>
    )
  }

  // Derive OAuth status map from integrations array
  const oauthStatusMap: Record<string, OAuthStatus> = {}
  for (const item of statusData?.integrations ?? []) {
    oauthStatusMap[item.type] = item.status
  }

  // Integration health calculation
  const totalConnectors = 3 + 1 + CONTEXT_SECTIONS.length // oauth + cms + context
  const oauthConnected = OAUTH_CONNECTORS.filter(
    (c) => oauthStatusMap[c.type] === 'active'
  ).length
  const cmsConnected = hasValue(form.cms_url) ? 1 : 0
  const contextConnected = CONTEXT_SECTIONS.filter((s) => s.isComplete(form)).length
  const totalConnected = oauthConnected + cmsConnected + contextConnected
  const healthPct = Math.round((totalConnected / totalConnectors) * 100)

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl text-charcoal">Connectors</h1>
        <p className="text-warm-gray text-sm">
          The more you connect, the smarter your SEO strategy.
        </p>
      </div>

      {/* Integration Health */}
      <div className="bg-cream rounded-tenkai border border-tenkai-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="size-4 text-torii" />
            <span className="text-sm font-medium text-charcoal">Integration Health</span>
          </div>
          <span className="text-sm font-semibold text-torii">
            {totalConnected} of {totalConnectors} connected
          </span>
        </div>
        <div className="h-2 bg-parchment rounded-full overflow-hidden">
          <div
            className="h-full bg-torii rounded-full transition-all duration-700 ease-out"
            style={{ width: `${healthPct}%` }}
          />
        </div>
        <p className="text-xs text-warm-gray">
          {healthPct < 100
            ? 'Complete your connections to unlock full agent capabilities.'
            : 'All connections active — agents running at full power.'}
        </p>
      </div>

      {/* Section 1: Data Connections */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-warm-gray">
            Data Connections
          </h2>
          <span className="text-xs text-warm-gray">
            {oauthConnected}/{OAUTH_CONNECTORS.length} connected
          </span>
        </div>
        <p className="text-xs text-warm-gray -mt-1">
          OAuth connections to pull live data. OAuth setup coming soon.
        </p>
        <div className="space-y-2">
          {OAUTH_CONNECTORS.map((connector) => (
            <OAuthConnectorCard
              key={connector.type}
              connector={connector}
              status={oauthStatusMap[connector.type] ?? 'not_connected'}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Website Platform */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-warm-gray">
            Website Platform
          </h2>
          {cmsConnected > 0 && (
            <span className="text-xs text-[#4A7C59] flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              Connected
            </span>
          )}
        </div>
        <p className="text-xs text-warm-gray -mt-1">
          Connect your CMS so we can publish content and apply technical fixes directly.
        </p>
        <div className="border border-tenkai-border rounded-tenkai bg-cream p-4">
          <CMSPlatformSection
            form={form}
            setField={setField}
            saving={saving}
            onSave={handleSave}
            saveSuccess={saveSuccess}
          />
        </div>
      </section>

      {/* Section 3: Business Context */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-warm-gray">
            Business Context
          </h2>
          <span className="text-xs text-warm-gray">
            {contextConnected}/{CONTEXT_SECTIONS.length} complete
          </span>
        </div>
        <p className="text-xs text-warm-gray -mt-1">
          Fill these in to give your agents full context. The more detail, the better the output.
        </p>
        <div className="space-y-2">
          {CONTEXT_SECTIONS.map((def) => (
            <ContextSectionRow
              key={def.id}
              def={def}
              form={form}
              setField={setField}
              expanded={expandedSection === def.id}
              onToggle={() => toggleSection(def.id)}
              onSave={handleSave}
              saving={saving}
              saveSuccess={saveSuccess}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
