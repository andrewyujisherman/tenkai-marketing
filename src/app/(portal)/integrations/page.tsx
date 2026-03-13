'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  BarChart3,
  MapPin,
  Globe,
  Layout,
  Users,
  PenTool,
  Tag,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Save,
} from 'lucide-react'
import type { Integration } from '@/app/api/onboarding/status/route'

// --- Icon map ---
const iconMap: Record<string, React.ReactNode> = {
  'search': <Search className="size-5" />,
  'bar-chart': <BarChart3 className="size-5" />,
  'map-pin': <MapPin className="size-5" />,
  'globe': <Globe className="size-5" />,
  'layout': <Layout className="size-5" />,
  'users': <Users className="size-5" />,
  'pen-tool': <PenTool className="size-5" />,
  'tag': <Tag className="size-5" />,
  'building': <Building className="size-5" />,
}

// --- Status badge ---
function StatusBadge({ status }: { status: Integration['status'] }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#4A7C59]/10 text-[#4A7C59] border border-[#4A7C59]/20">
        <CheckCircle2 className="size-3" />
        Connected
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="size-3" />
        Pending
      </span>
    )
  }
  if (status === 'expired' || status === 'error') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
        <AlertCircle className="size-3" />
        {status === 'expired' ? 'Expired' : 'Error'}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-parchment text-warm-gray border border-tenkai-border">
      Not connected
    </span>
  )
}

// --- Google OAuth types ---
type OAuthType = 'google_search_console' | 'google_analytics' | 'google_business_profile'

const GOOGLE_OAUTH_TYPES: OAuthType[] = [
  'google_search_console',
  'google_analytics',
  'google_business_profile',
]

// --- Form state ---
interface FormState {
  website_url: string
  cms_url: string
  cms_username: string
  competitors: string
  brand_guidelines: string
  target_keywords: string
  business_name: string
  business_location: string
  business_industry: string
  business_target_audience: string
}

const EMPTY_FORM: FormState = {
  website_url: '',
  cms_url: '',
  cms_username: '',
  competitors: '',
  brand_guidelines: '',
  target_keywords: '',
  business_name: '',
  business_location: '',
  business_industry: '',
  business_target_audience: '',
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [completionPct, setCompletionPct] = useState(0)
  const [clientId, setClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/onboarding/status')
      if (!res.ok) return
      const data = await res.json()
      setIntegrations(data.integrations ?? [])
      setCompletionPct(data.completion_percentage ?? 0)
      setClientId(data.client_id ?? null)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleOAuthConnect = (type: OAuthType) => {
    // Redirect to OAuth flow — these routes are expected to exist or be built
    window.location.href = `/api/auth/oauth/${type}?redirect=/integrations`
  }

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!clientId) return
    setSaving(true)
    try {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, form }),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-warm-gray text-sm">Loading integrations...</div>
      </div>
    )
  }

  const required = integrations.filter((i) => i.required)
  const optional = integrations.filter((i) => !i.required)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-serif text-2xl text-charcoal">Connect Your Tools</h1>
        <p className="text-warm-gray text-sm">
          The more you connect, the smarter your SEO strategy. Required items unlock the core reports.
        </p>
      </div>

      {/* Progress */}
      <div className="bg-cream rounded-tenkai border border-tenkai-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-charcoal">Setup progress</span>
          <span className="text-sm font-semibold text-torii">{completionPct}% complete</span>
        </div>
        <div className="h-2 bg-parchment rounded-full overflow-hidden">
          <div
            className="h-full bg-torii rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <p className="text-xs text-warm-gray">
          {completionPct < 100
            ? `${integrations.filter((i) => i.status === 'active').length} of ${integrations.length} connected`
            : 'All integrations connected — agents running at full power'}
        </p>
      </div>

      {/* Required */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-warm-gray">
          Required
        </h2>
        <div className="space-y-2">
          {required.map((item) => (
            <IntegrationRow
              key={item.type}
              item={item}
              form={form}
              setField={setField}
              expanded={expanded}
              setExpanded={setExpanded}
              onOAuth={handleOAuthConnect}
            />
          ))}
        </div>
      </section>

      {/* Optional */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-warm-gray">
          Optional (recommended)
        </h2>
        <div className="space-y-2">
          {optional.map((item) => (
            <IntegrationRow
              key={item.type}
              item={item}
              form={form}
              setField={setField}
              expanded={expanded}
              setExpanded={setExpanded}
              onOAuth={handleOAuthConnect}
            />
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center justify-between pt-4 border-t border-tenkai-border">
        <p className="text-xs text-warm-gray">
          {saveSuccess ? (
            <span className="text-[#4A7C59] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" /> Saved successfully
            </span>
          ) : (
            'Fields are saved to your client profile'
          )}
        </p>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-2"
        >
          <Save className="size-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

// --- Integration Row Component ---
function IntegrationRow({
  item,
  form,
  setField,
  expanded,
  setExpanded,
  onOAuth,
}: {
  item: Integration
  form: FormState
  setField: (key: keyof FormState, value: string) => void
  expanded: string | null
  setExpanded: (v: string | null) => void
  onOAuth: (type: OAuthType) => void
}) {
  const isOpen = expanded === item.type
  const isOAuth = ['google_search_console', 'google_analytics', 'google_business_profile'].includes(item.type)
  const isConnected = item.status === 'active'

  const toggle = () => setExpanded(isOpen ? null : item.type)

  return (
    <div className="border border-tenkai-border rounded-tenkai bg-cream overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-parchment/40 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-torii-subtle flex items-center justify-center text-torii flex-shrink-0">
          {iconMap[item.icon] ?? <Globe className="size-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal">{item.display_name}</span>
            {item.required && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-torii/60">
                required
              </span>
            )}
          </div>
          <p className="text-xs text-warm-gray mt-0.5">{item.description}</p>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={item.status} />
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t border-tenkai-border/50 bg-ivory/50 space-y-3">
          <IntegrationFields
            item={item}
            form={form}
            setField={setField}
            isOAuth={isOAuth}
            isConnected={isConnected}
            onOAuth={onOAuth}
          />
        </div>
      )}
    </div>
  )
}

// --- Fields by type ---
function IntegrationFields({
  item,
  form,
  setField,
  isOAuth,
  isConnected,
  onOAuth,
}: {
  item: Integration
  form: FormState
  setField: (key: keyof FormState, value: string) => void
  isOAuth: boolean
  isConnected: boolean
  onOAuth: (type: OAuthType) => void
}) {
  if (isOAuth) {
    return (
      <div className="pt-3">
        {isConnected ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#4A7C59]">
              <CheckCircle2 className="size-4" />
              Connected via Google OAuth
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOAuth(item.type as OAuthType)}
              className="text-warm-gray hover:text-charcoal text-xs rounded-tenkai"
            >
              Reconnect
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => onOAuth(item.type as OAuthType)}
            className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-2 text-sm"
          >
            <ExternalLink className="size-4" />
            Connect with Google
          </Button>
        )}
      </div>
    )
  }

  if (item.type === 'website_access') {
    return (
      <div className="pt-3">
        <Input
          value={form.website_url}
          onChange={(e) => setField('website_url', (e.target as HTMLInputElement).value)}
          placeholder="https://yourbusiness.com"
          className="h-10 text-sm border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
        />
      </div>
    )
  }

  if (item.type === 'cms_access') {
    return (
      <div className="pt-3 space-y-2">
        <Input
          value={form.cms_url}
          onChange={(e) => setField('cms_url', (e.target as HTMLInputElement).value)}
          placeholder="https://yourbusiness.com/wp-admin"
          className="h-10 text-sm border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
        />
        <Input
          value={form.cms_username}
          onChange={(e) => setField('cms_username', (e.target as HTMLInputElement).value)}
          placeholder="Username or API key"
          className="h-10 text-sm border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
        />
      </div>
    )
  }

  if (item.type === 'competitors') {
    return (
      <div className="pt-3">
        <textarea
          value={form.competitors}
          onChange={(e) => setField('competitors', e.target.value)}
          placeholder="One competitor URL per line&#10;https://competitor1.com&#10;https://competitor2.com"
          rows={3}
          className="w-full px-3 py-2.5 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
        />
      </div>
    )
  }

  if (item.type === 'brand_guidelines') {
    return (
      <div className="pt-3">
        <textarea
          value={form.brand_guidelines}
          onChange={(e) => setField('brand_guidelines', e.target.value)}
          placeholder="Describe your brand voice, tone, and writing guidelines. What should we always/never say?"
          rows={4}
          className="w-full px-3 py-2.5 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
        />
      </div>
    )
  }

  if (item.type === 'target_keywords') {
    return (
      <div className="pt-3">
        <textarea
          value={form.target_keywords}
          onChange={(e) => setField('target_keywords', e.target.value)}
          placeholder="One keyword or phrase per line&#10;plumber near me&#10;emergency plumbing Austin"
          rows={4}
          className="w-full px-3 py-2.5 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
        />
      </div>
    )
  }

  if (item.type === 'business_info') {
    return (
      <div className="pt-3 space-y-2">
        <Input
          value={form.business_name}
          onChange={(e) => setField('business_name', (e.target as HTMLInputElement).value)}
          placeholder="Business name"
          className="h-10 text-sm border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
        />
        <Input
          value={form.business_location}
          onChange={(e) => setField('business_location', (e.target as HTMLInputElement).value)}
          placeholder="City, State (e.g., Austin, TX)"
          className="h-10 text-sm border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
        />
        <Input
          value={form.business_industry}
          onChange={(e) => setField('business_industry', (e.target as HTMLInputElement).value)}
          placeholder="Industry (e.g., Plumbing, Dental, Real Estate)"
          className="h-10 text-sm border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
        />
        <Input
          value={form.business_target_audience}
          onChange={(e) => setField('business_target_audience', (e.target as HTMLInputElement).value)}
          placeholder="Target audience (e.g., homeowners in Austin, TX)"
          className="h-10 text-sm border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
        />
      </div>
    )
  }

  return null
}
