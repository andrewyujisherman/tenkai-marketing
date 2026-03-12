import { supabaseAdmin } from '@/lib/supabase-admin'
import { FileText, Clock, CheckCircle, XCircle, Globe } from 'lucide-react'

type ContentPost = {
  id: string
  title: string | null
  status: string | null
  agent_author: string | null
  created_at: string | null
  client_id: string | null
  clients: { name: string | null; company_name: string | null } | null
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  draft:            { label: 'Draft',            classes: 'bg-parchment text-warm-gray' },
  pending_approval: { label: 'Pending Approval', classes: 'bg-torii-subtle text-torii' },
  approved:         { label: 'Approved',         classes: 'bg-green-50 text-green-700' },
  published:        { label: 'Published',        classes: 'bg-blue-50 text-blue-700' },
  rejected:         { label: 'Rejected',         classes: 'bg-red-50 text-red-600' },
}

async function getContentStats() {
  const statuses = ['draft', 'pending_approval', 'approved', 'published', 'rejected']
  const counts = await Promise.all(
    statuses.map((s) =>
      supabaseAdmin
        .from('content_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', s)
        .then(({ count }) => ({ status: s, count: count ?? 0 }))
    )
  )
  return counts
}

async function getRecentContent(): Promise<ContentPost[]> {
  const { data } = await supabaseAdmin
    .from('content_posts')
    .select('id, title, status, agent_author, created_at, client_id, clients(name, company_name)')
    .order('created_at', { ascending: false })
    .limit(20)

  return (data ?? []) as unknown as ContentPost[]
}

function StatCard({ label, count, icon, classes }: { label: string; count: number; icon: React.ReactNode; classes: string }) {
  return (
    <div className="bg-white rounded-tenkai border border-tenkai-border p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-warm-gray text-sm font-medium">{label}</span>
        <span className={`p-1.5 rounded-full ${classes}`}>{icon}</span>
      </div>
      <span className="font-serif text-3xl text-charcoal font-semibold tracking-tight">{count}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  const cfg = STATUS_CONFIG[status ?? ''] ?? { label: status ?? '—', classes: 'bg-parchment text-warm-gray' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}

export default async function AdminContentPage() {
  const [stats, posts] = await Promise.all([getContentStats(), getRecentContent()])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-charcoal">Content</h1>
        <p className="text-warm-gray text-sm mt-1">All content posts across every client</p>
      </div>

      {/* Status stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(({ status, count }) => {
          const icons: Record<string, React.ReactNode> = {
            draft:            <FileText className="size-3.5" />,
            pending_approval: <Clock className="size-3.5" />,
            approved:         <CheckCircle className="size-3.5" />,
            published:        <Globe className="size-3.5" />,
            rejected:         <XCircle className="size-3.5" />,
          }
          const cfg = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-parchment text-warm-gray' }
          return (
            <StatCard
              key={status}
              label={cfg.label}
              count={count}
              icon={icons[status]}
              classes={cfg.classes}
            />
          )
        })}
      </div>

      {/* Recent content table */}
      <div className="bg-white rounded-tenkai border border-tenkai-border overflow-hidden">
        <div className="px-6 py-4 border-b border-tenkai-border flex items-center justify-between">
          <h2 className="font-serif text-base text-charcoal">Recent Content</h2>
          <span className="text-xs text-warm-gray">Last 20 posts</span>
        </div>

        {posts.length === 0 ? (
          <div className="px-6 py-12 text-center text-warm-gray text-sm">No content posts yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tenkai-border bg-ivory/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide hidden sm:table-cell">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide hidden md:table-cell">Author</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tenkai-border">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-parchment/30 transition-colors">
                  <td className="px-4 py-3 text-charcoal font-medium max-w-xs truncate">
                    {post.title || 'Untitled'}
                  </td>
                  <td className="px-4 py-3 text-warm-gray hidden sm:table-cell">
                    {post.clients?.company_name || post.clients?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3 text-warm-gray hidden md:table-cell">
                    {post.agent_author || '—'}
                  </td>
                  <td className="px-4 py-3 text-warm-gray text-xs hidden lg:table-cell">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
