import { createServerClient } from '@/lib/supabase'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  let clientRecord = null
  let pendingApprovals: { id: string; title?: string | null; type?: string | null; agent_name?: string | null; description?: string | null }[] = []
  let recentPosts: { id: string; title: string; status: string; created_at: string }[] = []
  let userName: string | null = null

  if (user) {
    userName = user.user_metadata?.full_name ?? user.email ?? null

    // Fetch client record
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, company_name, website_url')
      .eq('user_id', user.id)
      .single()

    clientRecord = clientData ?? null

    if (clientRecord) {
      // Fetch pending approvals
      const { data: approvalsData } = await supabase
        .from('approvals')
        .select('id, title, type, agent_name, description')
        .eq('client_id', clientRecord.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      pendingApprovals = approvalsData ?? []

      // Fetch recent content posts
      const { data: postsData } = await supabase
        .from('content_posts')
        .select('id, title, status, created_at')
        .eq('client_id', clientRecord.id)
        .order('created_at', { ascending: false })
        .limit(10)

      recentPosts = postsData ?? []
    }
  }

  return (
    <DashboardClient
      client={clientRecord}
      userName={userName}
      pendingApprovals={pendingApprovals}
      recentPosts={recentPosts}
    />
  )
}
