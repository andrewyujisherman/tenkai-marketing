export interface ClientContextForm {
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
  services: string
  service_areas: string
  differentiators: string
  business_goals: string
  proof_points: string
  notes: string
  years_in_business: string
  phone: string
  server_type: string
  conversion_goals: string
}

interface ClientRecordLike {
  company_name?: string | null
  name?: string | null
  website_url?: string | null
  onboarding_data?: Record<string, unknown> | null
}

interface ClientIntegrationLike {
  integration_type: string
  metadata?: Record<string, unknown> | null
  credentials?: Record<string, unknown> | null
}

export const EMPTY_CLIENT_CONTEXT_FORM: ClientContextForm = {
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
  services: '',
  service_areas: '',
  differentiators: '',
  business_goals: '',
  proof_points: '',
  notes: '',
  years_in_business: '',
  phone: '',
  server_type: '',
  conversion_goals: '',
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function linesFromUnknown(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  const record = asRecord(value)
  if (record) {
    return Object.values(record)
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean)
  }

  return []
}

export function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function hasValue(value: string): boolean {
  return value.trim().length > 0
}

export function buildClientContextForm(
  client: ClientRecordLike | null | undefined,
  integrations: ClientIntegrationLike[] = []
): ClientContextForm {
  const onboarding = asRecord(client?.onboarding_data) ?? {}
  const businessAnswer = asRecord(onboarding.business)
  const businessInfo = asRecord(
    integrations.find((item) => item.integration_type === 'business_info')?.metadata
  ) ?? {}
  const cmsAccess = integrations.find((item) => item.integration_type === 'cms_access')
  const cmsMetadata = asRecord(cmsAccess?.metadata) ?? {}
  const cmsCredentials = asRecord(cmsAccess?.credentials) ?? {}
  const competitors = asRecord(
    integrations.find((item) => item.integration_type === 'competitors')?.metadata
  ) ?? {}
  const brandGuidelines = asRecord(
    integrations.find((item) => item.integration_type === 'brand_guidelines')?.metadata
  ) ?? {}
  const targetKeywords = asRecord(
    integrations.find((item) => item.integration_type === 'target_keywords')?.metadata
  ) ?? {}

  return {
    website_url: asString(client?.website_url) || asString(businessAnswer?.url),
    cms_url: asString(cmsMetadata.url),
    cms_username: asString(cmsCredentials.username),
    competitors: linesFromUnknown(competitors.urls ?? onboarding.competitors).join('\n'),
    brand_guidelines: asString(brandGuidelines.text),
    target_keywords: linesFromUnknown(targetKeywords.keywords).join('\n'),
    business_name:
      asString(businessInfo.name) ||
      asString(client?.company_name) ||
      asString(client?.name) ||
      asString(businessAnswer?.name),
    business_location: asString(businessInfo.location) || asString(onboarding.location),
    business_industry: asString(businessInfo.industry) || asString(onboarding.industry),
    business_target_audience:
      asString(businessInfo.target_audience) || asString(onboarding.target_audience),
    services: linesFromUnknown(businessInfo.services ?? onboarding.products).join('\n'),
    service_areas: linesFromUnknown(businessInfo.service_areas).join('\n'),
    differentiators:
      asString(businessInfo.differentiators) || asString(onboarding.unique),
    business_goals: asString(businessInfo.goals) || asString(onboarding.goals),
    proof_points:
      asString(businessInfo.proof_points) || asString(onboarding.testimonials),
    notes: asString(businessInfo.notes) || asString(onboarding.challenge),
    years_in_business:
      asString(businessInfo.years_in_business) || asString(onboarding.years),
    phone: asString(businessInfo.phone),
    server_type: asString(businessInfo.server_type),
    conversion_goals: asString(businessInfo.conversion_goals),
  }
}
