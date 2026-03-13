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
  const { data, error } = await supabaseAdmin
    .from('client_integrations')
    .select('credentials, status')
    .eq('client_id', clientId)
    .eq('integration_type', type)
    .single()

  if (error || !data) return null
  if (data.status !== 'active') return null

  const creds = data.credentials as Record<string, unknown>
  return (creds.access_token as string) ?? null
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
