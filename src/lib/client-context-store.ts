import { supabaseAdmin } from '@/lib/supabase-admin'
import { deleteClientIntegration, upsertClientIntegration } from '@/lib/integrations/client-store'

import {
  buildClientContextForm,
  splitLines,
  type ClientContextForm,
} from './client-context'

interface ClientRecord {
  id: string
  company_name: string | null
  name: string | null
  website_url: string | null
  onboarding_data: Record<string, unknown> | null
}

interface ClientIntegrationRecord {
  integration_type: string
  status: string
  metadata: Record<string, unknown> | null
  credentials: Record<string, unknown> | null
}

function compactRecord<T extends Record<string, unknown>>(record: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => {
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      return value !== null && value !== undefined
    })
  ) as Partial<T>
}

function buildOnboardingSnapshot(
  form: ClientContextForm,
  existingData: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  return {
    ...(existingData ?? {}),
    business: compactRecord({
      name: form.business_name,
      url: form.website_url,
    }),
    industry: form.business_industry,
    location: form.business_location,
    products: form.services,
    unique: form.differentiators,
    years: form.years_in_business,
    testimonials: form.proof_points,
    challenge: form.notes,
    goals: form.business_goals,
    target_audience: form.business_target_audience,
    competitors: splitLines(form.competitors).reduce<Record<string, string>>((acc, value, index) => {
      acc[`comp${index + 1}`] = value
      return acc
    }, {}),
  }
}

async function upsertOrDeleteIntegration(
  clientId: string,
  type: string,
  credentials: Record<string, unknown>,
  metadata: Record<string, unknown>
) {
  const hasContent =
    Object.keys(compactRecord(credentials)).length > 0 ||
    Object.keys(compactRecord(metadata)).length > 0

  if (!hasContent) {
    await deleteClientIntegration(clientId, type)
    return
  }

  await upsertClientIntegration(clientId, type, compactRecord(credentials), compactRecord(metadata))
}

export async function getClientContext(clientId: string): Promise<{
  client: ClientRecord | null
  integrations: ClientIntegrationRecord[]
  form: ClientContextForm
}> {
  const [{ data: client }, { data: integrations }] = await Promise.all([
    supabaseAdmin
      .from('clients')
      .select('id, company_name, name, website_url, onboarding_data')
      .eq('id', clientId)
      .single(),
    supabaseAdmin
      .from('client_integrations')
      .select('integration_type, status, metadata, credentials')
      .eq('client_id', clientId),
  ])

  return {
    client,
    integrations: (integrations ?? []) as ClientIntegrationRecord[],
    form: buildClientContextForm(client, (integrations ?? []) as ClientIntegrationRecord[]),
  }
}

export async function saveClientContext(
  clientId: string,
  form: ClientContextForm,
  existingOnboardingData: Record<string, unknown> | null | undefined
) {
  const onboardingData = buildOnboardingSnapshot(form, existingOnboardingData)

  await supabaseAdmin
    .from('clients')
    .update({
      company_name: form.business_name || null,
      website_url: form.website_url || null,
      onboarding_data: onboardingData,
    })
    .eq('id', clientId)

  await Promise.all([
    upsertOrDeleteIntegration(clientId, 'website_access', {}, { url: form.website_url }),
    upsertOrDeleteIntegration(
      clientId,
      'cms_access',
      { username: form.cms_username },
      { url: form.cms_url }
    ),
    upsertOrDeleteIntegration(clientId, 'competitors', {}, { urls: splitLines(form.competitors) }),
    upsertOrDeleteIntegration(clientId, 'brand_guidelines', {}, { text: form.brand_guidelines }),
    upsertOrDeleteIntegration(clientId, 'target_keywords', {}, {
      keywords: splitLines(form.target_keywords),
    }),
    upsertOrDeleteIntegration(clientId, 'business_info', {}, {
      name: form.business_name,
      location: form.business_location,
      industry: form.business_industry,
      target_audience: form.business_target_audience,
      services: splitLines(form.services),
      service_areas: splitLines(form.service_areas),
      differentiators: form.differentiators,
      goals: form.business_goals,
      proof_points: form.proof_points,
      notes: form.notes,
      years_in_business: form.years_in_business,
    }),
  ])
}
