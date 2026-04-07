'use client'

import { Input } from '@/components/ui/input'

export const BUSINESS_TYPES = [
  'Plumbing',
  'HVAC',
  'Electrical',
  'Roofing',
  'Landscaping',
  'Dental',
  'Medical / Healthcare',
  'Legal',
  'Accounting / Financial',
  'Real Estate',
  'Restaurant / Food Service',
  'Auto Repair',
  'Cleaning Services',
  'Construction',
  'Salon / Spa',
  'Fitness / Gym',
  'Pet Services',
  'Photography',
  'Marketing / Advertising',
  'Consulting',
  'E-commerce / Retail',
  'SaaS / Technology',
  'Education / Tutoring',
  'Home Services (Other)',
  'Other',
] as const

export const BUSINESS_GOALS = [
  'Get more customers',
  'Rank higher on Google',
  'Beat competitors',
  'Local visibility',
  'Build brand awareness',
  'Generate more leads',
] as const

export interface BusinessInfoData {
  businessName: string
  websiteUrl: string
  businessType: string
  businessDescription: string
  idealCustomer: string
  services: string
  serviceArea: string
  competitors: string[]
  businessGoals: string[]
  targetGeography: string
}

interface StepBusinessInfoProps {
  data: BusinessInfoData
  onChange: (data: BusinessInfoData) => void
}

function isValidUrl(url: string): boolean {
  if (!url.trim()) return true // empty is valid (caught by required check)
  try {
    const withProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`
    new URL(withProtocol)
    return true
  } catch {
    return false
  }
}

export function StepBusinessInfo({ data, onChange }: StepBusinessInfoProps) {
  function update(field: keyof BusinessInfoData, value: string | string[]) {
    onChange({ ...data, [field]: value })
  }

  function updateCompetitor(index: number, value: string) {
    const updated = [...data.competitors]
    updated[index] = value
    onChange({ ...data, competitors: updated })
  }

  function toggleGoal(goal: string) {
    const current = data.businessGoals
    const updated = current.includes(goal)
      ? current.filter(g => g !== goal)
      : [...current, goal]
    onChange({ ...data, businessGoals: updated })
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-up">
      <div className="space-y-2">
        <h2 className="font-serif text-2xl text-charcoal">Tell us about your business</h2>
        <p className="text-warm-gray text-sm">This helps your AI team create better strategies.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-charcoal mb-1.5 block">
            Business Name <span className="text-torii">*</span>
          </label>
          <Input
            value={data.businessName}
            onChange={(e) => update('businessName', (e.target as HTMLInputElement).value)}
            placeholder="Your business name"
            className="h-11 border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-charcoal mb-1.5 block">
            Website URL <span className="text-torii">*</span>
          </label>
          <Input
            type="url"
            value={data.websiteUrl}
            onChange={(e) => update('websiteUrl', (e.target as HTMLInputElement).value)}
            placeholder="https://yourbusiness.com"
            className={`h-11 border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20 ${
              data.websiteUrl.trim() && !isValidUrl(data.websiteUrl) ? 'border-error focus-visible:border-error' : ''
            }`}
          />
          {data.websiteUrl.trim() && !isValidUrl(data.websiteUrl) && (
            <p className="text-xs text-error mt-1">Please enter a valid website URL (e.g., yourbusiness.com)</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-charcoal mb-1.5 block">
            Business Type
          </label>
          <select
            value={data.businessType}
            onChange={(e) => update('businessType', e.target.value)}
            className="w-full h-11 px-3 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none focus:border-torii focus:ring-2 focus:ring-torii/20 text-charcoal"
          >
            <option value="">Select your industry...</option>
            {BUSINESS_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-charcoal mb-1.5 block">
            Describe Your Business
          </label>
          <p className="text-xs text-warm-gray mb-1.5">What do you do and who do you serve? This helps your AI team understand your business.</p>
          <textarea
            value={data.businessDescription}
            onChange={(e) => update('businessDescription', e.target.value)}
            placeholder="e.g., We're an electronics manufacturer specializing in custom PCB assembly and embedded systems for aerospace and defense clients in the Western US."
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-charcoal mb-1.5 block">
            Who Is Your Ideal Customer?
          </label>
          <p className="text-xs text-warm-gray mb-1.5">Describe who you&apos;re trying to reach — this shapes your keyword strategy and content tone.</p>
          <textarea
            value={data.idealCustomer}
            onChange={(e) => update('idealCustomer', e.target.value)}
            placeholder="e.g., Homeowners in Vernal ages 25-55 who need quick, affordable electronics repairs. They'd rather fix their PS5 locally than ship it to Sony and wait 3 weeks."
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-charcoal mb-1.5 block">
            Primary Services
          </label>
          <textarea
            value={data.services}
            onChange={(e) => update('services', e.target.value)}
            placeholder="e.g., Residential plumbing, emergency repairs, water heater installation..."
            rows={2}
            className="w-full px-3 py-2.5 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-charcoal mb-1.5 block">
            Service Area
          </label>
          <Input
            value={data.serviceArea}
            onChange={(e) => update('serviceArea', (e.target as HTMLInputElement).value)}
            placeholder="e.g., Austin, TX"
            className="h-11 border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
          />
        </div>

        {/* ── What are your main goals? ──────────────────── */}
        <div>
          <label className="text-sm font-medium text-charcoal mb-2 block">
            What are your main goals?
          </label>
          <p className="text-xs text-warm-gray mb-2">Pick all that apply — this shapes your strategy.</p>
          <div className="flex flex-wrap gap-2">
            {BUSINESS_GOALS.map(goal => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors duration-fast ${
                  data.businessGoals.includes(goal)
                    ? 'bg-torii text-white border-torii'
                    : 'bg-transparent text-charcoal border-tenkai-border hover:border-torii/50'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* ── Target Geography ───────────────────────────── */}
        <div>
          <label className="text-sm font-medium text-charcoal mb-1.5 block">
            Where are your customers?
          </label>
          <select
            value={data.targetGeography}
            onChange={(e) => update('targetGeography', e.target.value)}
            className="w-full h-11 px-3 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none focus:border-torii focus:ring-2 focus:ring-torii/20 text-charcoal"
          >
            <option value="">Select...</option>
            <option value="local">Local — one city or neighborhood</option>
            <option value="regional">Regional — a few cities or a state</option>
            <option value="national">National — across the country</option>
            <option value="international">International — multiple countries</option>
          </select>
        </div>

        {/* ── Competitors ────────────────────────────────── */}
        <div>
          <label className="text-sm font-medium text-charcoal mb-1.5 block">
            Top competitors
          </label>
          <p className="text-xs text-warm-gray mb-2">Who shows up when people search for your services? (optional)</p>
          <div className="space-y-2">
            {[0, 1, 2].map(i => (
              <Input
                key={i}
                value={data.competitors[i] ?? ''}
                onChange={(e) => updateCompetitor(i, (e.target as HTMLInputElement).value)}
                placeholder={`Competitor ${i + 1} website or name`}
                className="h-10 border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
