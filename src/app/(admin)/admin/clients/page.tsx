import { supabaseAdmin } from '@/lib/supabase-admin'

type Client = {
  id: string
  full_name?: string | null
  company_name?: string | null
  email?: string | null
  tier?: string | null
  status?: string | null
  created_at?: string | null
}

export default async function AdminClientsPage() {
  const { data: clients } = await supabaseAdmin
    .from('clients')
    .select('id, full_name, company_name, email, tier, status, created_at')
    .order('created_at', { ascending: false })

  const rows: Client[] = clients ?? []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-charcoal">Clients</h1>
        <p className="text-warm-gray text-sm mt-1">{rows.length} total client{rows.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-white rounded-tenkai border border-tenkai-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-tenkai-border bg-ivory/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Company</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Tier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-warm-gray uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tenkai-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-warm-gray text-sm">
                  No clients yet. Send an invite to get started.
                </td>
              </tr>
            ) : (
              rows.map((client) => (
                <div key={client.id}>
                  <tr className="hover:bg-parchment/30 transition-colors">
                    <td className="px-4 py-3 text-charcoal font-medium">{client.full_name || '—'}</td>
                    <td className="px-4 py-3 text-charcoal">{client.company_name || '—'}</td>
                    <td className="px-4 py-3 text-warm-gray">{client.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-parchment text-charcoal text-xs px-2 py-0.5 rounded-full capitalize">
                        {client.tier || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        client.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : client.status === 'invited'
                          ? 'bg-torii-subtle text-torii'
                          : 'bg-parchment text-warm-gray'
                      }`}>
                        {client.status || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-warm-gray text-xs">
                      {client.created_at ? new Date(client.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                </div>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
