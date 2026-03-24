'use client'

import { Input } from '@/components/ui/input'

export interface BusinessInfoData {
  businessName: string
  websiteUrl: string
  businessType: string
  services: string
  serviceArea: string
}

interface StepBusinessInfoProps {
  data: BusinessInfoData
  onChange: (data: BusinessInfoData) => void
}

export function StepBusinessInfo({ data, onChange }: StepBusinessInfoProps) {
  function update(field: keyof BusinessInfoData, value: string) {
    onChange({ ...data, [field]: value })
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
            className="h-11 border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-charcoal mb-1.5 block">
            Business Type
          </label>
          <Input
            value={data.businessType}
            onChange={(e) => update('businessType', (e.target as HTMLInputElement).value)}
            placeholder="e.g., Plumbing, Dental, Real Estate..."
            className="h-11 border-tenkai-border rounded-tenkai focus-visible:border-torii focus-visible:ring-torii/20"
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
      </div>
    </div>
  )
}
