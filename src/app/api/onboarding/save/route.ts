import { NextRequest, NextResponse } from 'next/server'
import { getClientContext, saveClientContext } from '@/lib/client-context-store'
import type { ClientContextForm } from '@/lib/client-context'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { client_id: clientId, form } = body as {
    client_id: string
    form: ClientContextForm
  }

  if (!clientId) {
    return NextResponse.json({ error: 'Missing client_id' }, { status: 400 })
  }

  const { client } = await getClientContext(clientId)
  await saveClientContext(clientId, form, client?.onboarding_data)

  return NextResponse.json({ ok: true })
}
