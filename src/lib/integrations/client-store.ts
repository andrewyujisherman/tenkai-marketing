import { supabaseAdmin } from '@/lib/supabase-admin'

export interface ClientIntegration {
  id: string
  client_id: string
  integration_type: string
  credentials: Record<string, unknown>
  metadata: Record<string, unknown>
  status: 'pending' | 'active' | 'expired' | 'error'
  last_verified_at: string | null
  created_at: string
  updated_at: string
}

export async function getClientIntegrations(clientId: string): Promise<ClientIntegration[]> {
  const { data, error } = await supabaseAdmin
    .from('client_integrations')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'active')

  if (error) {
    console.error('[client-store] getClientIntegrations error:', error)
    return []
  }

  return data ?? []
}

export async function getClientOAuthToken(
  clientId: string,
  type: 'google_search_console' | 'google_analytics' | 'google_business_profile'
): Promise<string | null> {
  return getValidAccessToken(clientId, type)
}

/**
 * Get a valid Google OAuth access token, refreshing if expired.
 * Does NOT overwrite metadata when saving refreshed credentials.
 */
export async function getValidAccessToken(
  clientId: string,
  type: string
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('client_integrations')
    .select('credentials, status')
    .eq('client_id', clientId)
    .eq('integration_type', type)
    .single()

  if (error || !data || data.status !== 'active') return null

  const creds = data.credentials as {
    access_token?: string
    refresh_token?: string
    expiry_date?: number
    client_id?: string
    client_secret?: string
  }

  // Token still valid — return it
  if (creds.expiry_date && Date.now() < creds.expiry_date - 60_000 && creds.access_token) {
    return creds.access_token
  }

  // Need refresh
  const oauthClientId = creds.client_id ?? process.env.GOOGLE_OAUTH_WEB_CLIENT_ID
  const oauthClientSecret = creds.client_secret ?? process.env.GOOGLE_OAUTH_WEB_CLIENT_SECRET
  if (!oauthClientId || !oauthClientSecret || !creds.refresh_token) return null

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: creds.refresh_token,
        client_id: oauthClientId,
        client_secret: oauthClientSecret,
      }),
    })
    if (!res.ok) return null
    const tokens = await res.json()

    const newCreds = {
      ...creds,
      access_token: tokens.access_token,
      expiry_date: Date.now() + (tokens.expires_in ?? 3600) * 1000,
    }

    // Update only credentials — do NOT touch metadata
    await supabaseAdmin
      .from('client_integrations')
      .update({ credentials: newCreds, updated_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('integration_type', type)

    return tokens.access_token
  } catch {
    return null
  }
}

export async function upsertClientIntegration(
  clientId: string,
  type: string,
  credentials: Record<string, unknown>,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('client_integrations')
    .upsert(
      {
        client_id: clientId,
        integration_type: type,
        credentials,
        metadata: metadata ?? {},
        status: 'active',
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_id,integration_type' }
    )

  if (error) {
    console.error('[client-store] upsertClientIntegration error:', error)
    throw error
  }
}

export async function deleteClientIntegration(clientId: string, type: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('client_integrations')
    .delete()
    .eq('client_id', clientId)
    .eq('integration_type', type)

  if (error) {
    console.error('[client-store] deleteClientIntegration error:', error)
    throw error
  }
}
