'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  Mail,
  Star,
  Link,
  Share2,
  Bell,
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
  onDisconnect,
}: {
  connector: (typeof OAUTH_CONNECTORS)[number]
  status: OAuthStatus
  onDisconnect?: () => void
}) {
  const isConnected = status === 'active'
  const isError = status === 'expired' || status === 'error'
  const [connecting, setConnecting] = useState(false)

  const handleConnect = () => {
    setConnecting(true)
    window.location.href = `/api/auth/oauth/google?type=${connector.type}`
  }

  const handleDisconnect = async () => {
    try {
      await fetch('/api/portal/credentials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: connector.type }),
      })
      onDisconnect?.()
    } catch {
      // ignore
    }
  }

  return (
    <div className={`border rounded-tenkai bg-cream p-4 flex items-center gap-4 ${
      isConnected ? 'border-[#4A7C59]/30' : 'border-tenkai-border'
    }`}>
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
        {isConnected ? (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnect}
              className="text-xs rounded-tenkai border-tenkai-border text-warm-gray"
            >
              Reconnect
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              className="text-xs text-warm-gray hover:text-torii"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            disabled={connecting}
            className="text-xs rounded-tenkai border-torii/30 text-torii hover:bg-torii/5"
          >
            {connecting ? 'Connecting…' : 'Connect'}
          </Button>
        )}
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

// ─── Future Integrations Roadmap ──────────────────────────────────────────────

const ROADMAP_ITEMS = [
  {
    icon: <Mail className="size-4" />,
    name: 'Email & Outreach',
    services: 'Gmail, Mailchimp',
    description: 'Automate outreach campaigns and track email-driven conversions.',
    eta: 'Coming Q2 2026',
  },
  {
    icon: <Star className="size-4" />,
    name: 'Review Platforms',
    services: 'Yelp, Google Reviews',
    description: 'Monitor and respond to reviews across platforms.',
    eta: 'Coming Q2 2026',
  },
  {
    icon: <Link className="size-4" />,
    name: 'Backlink Tools',
    services: 'Ahrefs, SEMrush',
    description: 'Track your backlink profile and find link-building opportunities.',
    eta: 'Coming Q3 2026',
  },
  {
    icon: <Share2 className="size-4" />,
    name: 'Social Media',
    services: 'Facebook, Instagram',
    description: 'Sync social performance data with your SEO strategy.',
    eta: 'Coming Q3 2026',
  },
]

function FutureIntegrationsSection() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-warm-gray">
          Coming Soon
        </h2>
        <p className="text-xs text-warm-gray mt-1">
          We&apos;re building more integrations to supercharge your SEO. Get notified when they launch.
        </p>
      </div>
      <div className="grid gap-2">
        {ROADMAP_ITEMS.map((item) => (
          <div
            key={item.name}
            className="border border-tenkai-border rounded-tenkai bg-cream p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-parchment flex items-center justify-center text-warm-gray flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-charcoal">{item.name}</span>
                <span className="text-[10px] text-torii/70 border border-torii/20 rounded-full px-2 py-0.5 font-medium">
                  {item.eta}
                </span>
              </div>
              <p className="text-xs text-warm-gray mt-0.5">
                <span className="font-medium">{item.services}</span> — {item.description}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = `mailto:support@tenkai.marketing?subject=Notify me: ${encodeURIComponent(item.name)}`
              }}
              className="text-xs rounded-tenkai border-tenkai-border text-warm-gray hover:text-torii hover:border-torii/30 gap-1.5 flex-shrink-0"
            >
              <Bell className="size-3" />
              Notify Me
            </Button>
          </div>
        ))}
      </div>
    </section>
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

const SERVER_TYPE_OPTIONS = [
  { value: '', label: 'Select your website server...' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'wix', label: 'Wix' },
  { value: 'squarespace', label: 'Squarespace' },
  { value: 'webflow', label: 'Webflow' },
  { value: 'vercel_nextjs', label: 'Vercel / Next.js' },
  { value: 'netlify', label: 'Netlify' },
  { value: 'apache', label: 'Apache' },
  { value: 'nginx', label: 'Nginx' },
  { value: 'other', label: 'Other' },
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
          value={form.phone}
          onChange={(e) => setField('phone', (e.target as HTMLInputElement).value)}
          placeholder="Business phone (e.g., (512) 555-0100)"
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
        <select
          value={form.server_type}
          onChange={(e) => setField('server_type', e.target.value)}
          className="flex h-9 w-full rounded-tenkai border border-tenkai-border bg-transparent px-3 py-1 text-sm text-charcoal shadow-xs transition-colors focus-visible:border-torii focus-visible:ring-torii/20 focus-visible:outline-none focus-visible:ring-[3px]"
        >
          {SERVER_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
          value={form.conversion_goals}
          onChange={(e) => setField('conversion_goals', e.target.value)}
          placeholder="e.g., Contact form submissions, phone calls, online purchases, email signups"
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState('connections')

  // Handle OAuth callback params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const error = params.get('error')
    if (connected) {
      const label = OAUTH_CONNECTORS.find((c) => c.type === connected)?.label ?? connected.replace(/_/g, ' ')
      setToast({ message: `${label} connected successfully!`, type: 'success' })
      window.history.replaceState({}, '', '/integrations')
    } else if (error) {
      setToast({ message: 'Connection failed. Please try again.', type: 'error' })
      window.history.replaceState({}, '', '/integrations')
    }
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000)
      return () => clearTimeout(timer)
    }
  }, [toast])

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
      <div className="max-w-3xl mx-auto space-y-10 pb-16">
        <div className="space-y-1">
          <div className="h-8 w-48 bg-parchment rounded-tenkai animate-pulse" />
          <div className="h-4 w-72 bg-parchment rounded-tenkai animate-pulse" />
        </div>
        <div className="h-16 bg-parchment rounded-tenkai animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-parchment rounded-tenkai animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Derive OAuth status map from integrations array
  const oauthStatusMap: Record<string, OAuthStatus> = {}
  for (const item of statusData?.integrations ?? []) {
    oauthStatusMap[item.type] = item.status
  }

  // Integration health — only real connections (OAuth + CMS), NOT business context
  const totalConnectors = OAUTH_CONNECTORS.length + 1 // 3 oauth + 1 CMS
  const oauthConnected = OAUTH_CONNECTORS.filter(
    (c) => oauthStatusMap[c.type] === 'active'
  ).length
  const cmsConnected = hasValue(form.cms_url) ? 1 : 0
  const totalConnected = oauthConnected + cmsConnected
  const healthPct = Math.round((totalConnected / totalConnectors) * 100)

  // Business profile completion
  const contextCompleted = CONTEXT_SECTIONS.filter((s) => s.isComplete(form)).length
  const contextPct = Math.round((contextCompleted / CONTEXT_SECTIONS.length) * 100)

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl text-charcoal">Integrations</h1>
        <p className="text-warm-gray text-sm">
          The more you connect, the smarter your SEO strategy.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-parchment/60 border border-tenkai-border rounded-tenkai">
          <TabsTrigger
            value="connections"
            className="rounded-tenkai text-xs data-active:text-torii"
          >
            <Wifi className="size-3.5" />
            Connections
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="rounded-tenkai text-xs data-active:text-torii"
          >
            <Building className="size-3.5" />
            Business Profile
          </TabsTrigger>
        </TabsList>

        {/* ─── Connections Tab ─── */}
        <TabsContent value="connections" className="mt-6 space-y-10">
          {/* Integration Health Bar */}
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

          {/* Data Connections (OAuth) */}
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
              Connect your Google accounts so our agents can pull live data and generate accurate insights.
            </p>
            <div className="space-y-2">
              {OAUTH_CONNECTORS.map((connector) => (
                <OAuthConnectorCard
                  key={connector.type}
                  connector={connector}
                  status={oauthStatusMap[connector.type] ?? 'not_connected'}
                  onDisconnect={fetchStatus}
                />
              ))}
            </div>
          </section>

          {/* Website Platform (CMS) */}
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

          {/* Future Integrations Roadmap */}
          <FutureIntegrationsSection />
        </TabsContent>

        {/* ─── Business Profile Tab ─── */}
        <TabsContent value="profile" className="mt-6 space-y-8">
          {/* Profile Completion */}
          <div className="bg-cream rounded-tenkai border border-tenkai-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="size-4 text-torii" />
                <span className="text-sm font-medium text-charcoal">Profile Completion</span>
              </div>
              <span className="text-sm font-semibold text-torii">
                {contextCompleted} of {CONTEXT_SECTIONS.length} complete
              </span>
            </div>
            <div className="h-2 bg-parchment rounded-full overflow-hidden">
              <div
                className="h-full bg-torii rounded-full transition-all duration-700 ease-out"
                style={{ width: `${contextPct}%` }}
              />
            </div>
            <p className="text-xs text-warm-gray">
              {contextPct < 100
                ? 'Fill in your business details to give your agents full context.'
                : 'Profile complete — your agents have everything they need.'}
            </p>
          </div>

          {/* Context Sections */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-warm-gray">
                Business Context
              </h2>
              <span className="text-xs text-warm-gray">
                {contextCompleted}/{CONTEXT_SECTIONS.length} complete
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
        </TabsContent>
      </Tabs>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in">
          <div className={`rounded-tenkai border px-4 py-3 shadow-lg text-sm font-medium flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-[#4A7C59]/10 border-[#4A7C59]/30 text-[#4A7C59]'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {toast.message}
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-current opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
