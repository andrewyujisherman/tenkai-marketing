import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { upsertClientIntegration } from '@/lib/integrations/client-store'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { client_id: clientId, form } = body as {
    client_id: string
    form: {
      website_url?: string
      cms_url?: string
      cms_username?: string
      competitors?: string
      brand_guidelines?: string
      target_keywords?: string
      business_name?: string
      business_location?: string
      business_industry?: string
      business_target_audience?: string
    }
  }

  if (!clientId) {
    return NextResponse.json({ error: 'Missing client_id' }, { status: 400 })
  }

  const updates: Array<Promise<void>> = []

  // website_access — stored on clients table + as integration
  if (form.website_url) {
    updates.push(
      supabaseAdmin
        .from('clients')
        .update({ website_url: form.website_url })
        .eq('id', clientId)
        .then(() => undefined) as Promise<void>
    )
    updates.push(
      upsertClientIntegration(clientId, 'website_access', {}, { url: form.website_url })
    )
  }

  // cms_access
  if (form.cms_url || form.cms_username) {
    updates.push(
      upsertClientIntegration(
        clientId,
        'cms_access',
        { username: form.cms_username ?? '' },
        { url: form.cms_url ?? '' }
      )
    )
  }

  // competitors
  if (form.competitors) {
    const urls = form.competitors
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    updates.push(
      upsertClientIntegration(clientId, 'competitors', {}, { urls })
    )
  }

  // brand_guidelines
  if (form.brand_guidelines) {
    updates.push(
      upsertClientIntegration(clientId, 'brand_guidelines', {}, { text: form.brand_guidelines })
    )
  }

  // target_keywords
  if (form.target_keywords) {
    const keywords = form.target_keywords
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    updates.push(
      upsertClientIntegration(clientId, 'target_keywords', {}, { keywords })
    )
  }

  // business_info
  const hasBusinessInfo =
    form.business_name ||
    form.business_location ||
    form.business_industry ||
    form.business_target_audience

  if (hasBusinessInfo) {
    updates.push(
      upsertClientIntegration(clientId, 'business_info', {}, {
        name: form.business_name ?? '',
        location: form.business_location ?? '',
        industry: form.business_industry ?? '',
        target_audience: form.business_target_audience ?? '',
      })
    )
  }

  await Promise.all(updates)

  return NextResponse.json({ ok: true })
}
