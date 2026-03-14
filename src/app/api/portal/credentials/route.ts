import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  upsertClientIntegration,
  deleteClientIntegration,
  getClientIntegrations,
} from '@/lib/integrations/client-store'

const ALLOWED_MANUAL_TYPES = new Set([
  'wordpress_api_key',
  'shopify_api_key',
  'ga4_property_id',
  'custom_api_key',
  'cms_access',
])

function maskCredentials(credentials: Record<string, unknown>): Record<string, string> {
  const masked: Record<string, string> = {}
  for (const [key, value] of Object.entries(credentials)) {
    if (typeof value === 'string' && value.length > 4) {
      masked[key] = `****${value.slice(-4)}`
    } else if (value !== null && value !== undefined) {
      masked[key] = '****'
    }
  }
  return masked
}

async function resolveClientId(user: { id: string; email?: string }): Promise<string | null> {
  const { data: byId } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (byId?.id) return byId.id

  const { data: byEmail } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('email', (user.email ?? '').toLowerCase())
    .single()

  return byEmail?.id ?? null
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = await resolveClientId(user)
  if (!clientId) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const integrations = await getClientIntegrations(clientId)

  const masked = integrations.map((i) => ({
    type: i.integration_type,
    status: i.status,
    connected_at: i.last_verified_at ?? i.created_at,
    metadata: i.metadata,
    masked_credentials: maskCredentials(i.credentials),
  }))

  return NextResponse.json({ integrations: masked })
}

export async function PUT(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = await resolveClientId(user)
  if (!clientId) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const body = await req.json()
  const { type, credentials, metadata } = body as {
    type?: string
    credentials?: Record<string, unknown>
    metadata?: Record<string, unknown>
  }

  if (!type || !ALLOWED_MANUAL_TYPES.has(type)) {
    return NextResponse.json(
      { error: `Invalid type. Allowed: ${[...ALLOWED_MANUAL_TYPES].join(', ')}` },
      { status: 400 }
    )
  }

  if (!credentials || typeof credentials !== 'object') {
    return NextResponse.json({ error: 'credentials object required' }, { status: 400 })
  }

  await upsertClientIntegration(clientId, type, credentials, metadata ?? {})

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = await resolveClientId(user)
  if (!clientId) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const body = await req.json()
  const { type } = body as { type?: string }

  if (!type) {
    return NextResponse.json({ error: 'type required' }, { status: 400 })
  }

  await deleteClientIntegration(clientId, type)

  return NextResponse.json({ success: true })
}
