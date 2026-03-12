import { cookies } from 'next/headers'

export const DEMO_CLIENT_ID = '00000000-0000-0000-0000-000000000001'

export async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('demo_mode')?.value === 'true'
}
