import { supabaseAdmin } from '@/lib/supabase-admin'
import { DemoModeToggle } from '@/components/admin/DemoModeToggle'
import { Users, CreditCard, Clock, FileText } from 'lucide-react'

async function getStats() {
  const [
    { count: totalClients },
    { count: activeSubscriptions },
    { count: pendingApprovals },
    { count: recentAudits },
  ] = await Promise.all([
    supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('approvals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('audit_results').select('*', { count: 'exact', head: true }),
  ])
  return {
    totalClients: totalClients ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    recentAudits: recentAudits ?? 0,
  }
}

async function getRecentActivity() {
  const [{ data: posts }, { data: approvals }] = await Promise.all([
    supabaseAdmin
      .from('content_posts')
      .select('id, title, status, created_at, client_id')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseAdmin
      .from('approvals')
      .select('id, title, type, agent_name, status, created_at, client_id')
      .order('created_at', { ascending: false })
      .limit(5),
  ])
  return { posts: posts ?? [], approvals: approvals ?? [] }
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-tenkai shadow-sm border border-tenkai-border p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-warm-gray text-sm font-medium">{label}</span>
        <span className="text-warm-gray">{icon}</span>
      </div>
      <span className="font-serif text-3xl text-charcoal font-semibold tracking-tight">{value}</span>
    </div>
  )
}

export default async function AdminOverviewPage() {
  const [stats, activity] = await Promise.all([
    getStats(),
    getRecentActivity(),
  ])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-charcoal">Overview</h1>
        <p className="text-warm-gray text-sm mt-1">Agency-wide metrics across all clients</p>
      </div>

      {/* Demo Mode Toggle */}
      <DemoModeToggle />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={stats.totalClients} icon={<Users className="size-4" />} />
        <StatCard label="Active Subscriptions" value={stats.activeSubscriptions} icon={<CreditCard className="size-4" />} />
        <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon={<Clock className="size-4" />} />
        <StatCard label="Audit Results" value={stats.recentAudits} icon={<FileText className="size-4" />} />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent content posts */}
        <div className="bg-white rounded-tenkai border border-tenkai-border p-5 space-y-4">
          <h2 className="font-serif text-base text-charcoal">Recent Content Posts</h2>
          {activity.posts.length === 0 ? (
            <p className="text-warm-gray text-sm">No content posts yet.</p>
          ) : (
            <ul className="space-y-3">
              {activity.posts.map((post: { id: string; title?: string | null; status?: string | null; created_at?: string | null }) => (
                <li key={post.id} className="flex items-start justify-between gap-4">
                  <span className="text-sm text-charcoal truncate">{post.title || 'Untitled'}</span>
                  <span className="text-xs text-warm-gray shrink-0 bg-parchment px-2 py-0.5 rounded-full">
                    {post.status ?? 'draft'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent approvals */}
        <div className="bg-white rounded-tenkai border border-tenkai-border p-5 space-y-4">
          <h2 className="font-serif text-base text-charcoal">Recent Approvals</h2>
          {activity.approvals.length === 0 ? (
            <p className="text-warm-gray text-sm">No approvals yet.</p>
          ) : (
            <ul className="space-y-3">
              {activity.approvals.map((approval: { id: string; title?: string | null; type?: string | null; status?: string | null; agent_name?: string | null }) => (
                <li key={approval.id} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-charcoal truncate">{approval.title || 'Untitled'}</p>
                    <p className="text-xs text-warm-gray">{approval.type} &middot; {approval.agent_name}</p>
                  </div>
                  <span className={`text-xs shrink-0 px-2 py-0.5 rounded-full ${
                    approval.status === 'pending'
                      ? 'bg-torii-subtle text-torii'
                      : 'bg-parchment text-warm-gray'
                  }`}>
                    {approval.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
