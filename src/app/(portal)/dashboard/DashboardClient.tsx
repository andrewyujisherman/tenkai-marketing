'use client'

import { useState } from 'react'
import { agents } from '@/lib/design-system'
import { StatCard } from '@/components/portal/StatCard'
import { ActivityItem } from '@/components/portal/ActivityItem'
import { Button } from '@/components/ui/button'
import {
  Search,
  FileText,
  Target,
  TrendingUp,
} from 'lucide-react'

const mockStats = [
  {
    label: 'Keywords Tracked',
    value: '47',
    trend: 'up' as const,
    trendValue: '+12 this month',
    icon: <Target className="size-4" />,
  },
  {
    label: 'Content Pipeline',
    value: '3',
    trend: 'up' as const,
    trendValue: 'drafts ready',
    icon: <FileText className="size-4" />,
  },
  {
    label: 'SEO Score',
    value: '72/100',
    trend: 'up' as const,
    trendValue: '+8 from last month',
    icon: <Search className="size-4" />,
  },
  {
    label: 'Organic Traffic',
    value: '2,340',
    trend: 'up' as const,
    trendValue: '+15%',
    icon: <TrendingUp className="size-4" />,
  },
]

const mockActivityItems = [
  {
    agent: 'Haruki',
    action: 'Analyzed 47 keywords and found 12 new ranking opportunities for your market',
    timestamp: '2h ago',
    needsAction: false,
  },
  {
    agent: 'Sakura',
    action: 'Drafted a blog post: "5 Local SEO Tips for Utah Businesses"',
    timestamp: '4h ago',
    needsAction: true,
    actionType: 'approve' as const,
  },
  {
    agent: 'Kenji',
    action: 'Fixed 3 broken internal links on your homepage — site health improved',
    timestamp: '5h ago',
    needsAction: false,
  },
  {
    agent: 'Takeshi',
    action: 'Detected ranking improvement: "plumber near me" moved from #8 to #5',
    timestamp: '6h ago',
    needsAction: false,
  },
  {
    agent: 'Sakura',
    action: 'Prepared a batch of 10 new blog topics for March based on keyword research',
    timestamp: '8h ago',
    needsAction: true,
    actionType: 'review' as const,
  },
  {
    agent: 'Aiko',
    action: 'Generated your weekly performance summary — organic traffic up 15%',
    timestamp: 'Yesterday',
    needsAction: false,
  },
]

const agentMap = Object.fromEntries(agents.map((a) => [a.name, a]))

type DateFilter = 'today' | 'week' | 'month'

interface ClientRecord {
  id: string
  company_name?: string | null
  website_url?: string | null
}

interface ContentPost {
  id: string
  title: string
  status: string
  created_at: string
}

interface Approval {
  id: string
  title?: string | null
  type?: string | null
  agent_name?: string | null
  description?: string | null
}

interface DashboardClientProps {
  client: ClientRecord | null
  userName: string | null
  pendingApprovals: Approval[]
  recentPosts: ContentPost[]
}

export default function DashboardClient({ client, userName, pendingApprovals, recentPosts }: DashboardClientProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')

  const displayName = client?.company_name || userName || null

  // Build pending approval cards — fall back to mock if none from DB
  const approvalCards = pendingApprovals.length > 0 ? pendingApprovals : null

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Quick Stats */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Activity Feed — 2/3 width */}
        <section className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg text-charcoal">
                {displayName ? `What your Tenkai team did today for ${displayName}` : 'What your Tenkai team did today'}
              </h2>
              <p className="text-warm-gray text-sm mt-0.5">
                Real-time updates from your AI SEO team
              </p>
            </div>
            <div className="flex items-center bg-cream rounded-tenkai border border-tenkai-border p-0.5">
              {(['today', 'week', 'month'] as DateFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDateFilter(filter)}
                  className={`px-3 py-1.5 rounded-[0.5rem] text-xs font-medium transition-colors capitalize ${
                    dateFilter === filter
                      ? 'bg-white text-charcoal shadow-sm'
                      : 'text-warm-gray hover:text-charcoal'
                  }`}
                >
                  {filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'Today'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {mockActivityItems.map((item, i) => {
              const agent = agentMap[item.agent]
              return (
                <ActivityItem
                  key={i}
                  agentName={agent.name}
                  agentIcon={agent.icon}
                  agentRole={agent.role}
                  action={item.action}
                  timestamp={item.timestamp}
                  needsAction={item.needsAction}
                  actionType={item.actionType}
                  onApprove={() => {}}
                  onDeny={() => {}}
                  onEdit={() => {}}
                />
              )
            })}
          </div>
        </section>

        {/* Pending Approvals — 1/3 width */}
        <section className="space-y-4">
          <div>
            <h2 className="font-serif text-lg text-charcoal">Pending Approvals</h2>
            <p className="text-warm-gray text-sm mt-0.5">Items waiting for your review</p>
          </div>

          <div className="space-y-4">
            {approvalCards ? (
              approvalCards.map((approval) => (
                <div key={approval.id} className="bg-white rounded-tenkai border border-tenkai-border p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">✍️</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-charcoal leading-snug">
                        {approval.title || 'Untitled'}
                      </h3>
                      <p className="text-warm-gray text-xs mt-1">
                        {approval.type || 'Content'} &middot; by {approval.agent_name || 'Agent'}
                      </p>
                      {approval.description && (
                        <p className="text-charcoal/70 text-xs mt-2 leading-relaxed">
                          {approval.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="bg-torii text-white hover:bg-torii-dark flex-1 text-xs h-8 rounded-tenkai">
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="text-charcoal border-tenkai-border flex-1 text-xs h-8 rounded-tenkai hover:bg-parchment"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="text-warm-gray border-tenkai-border text-xs h-8 px-3 rounded-tenkai hover:bg-parchment"
                    >
                      Deny
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Mock: Blog post approval */}
                <div className="bg-white rounded-tenkai border border-tenkai-border p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">✍️</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-charcoal leading-snug">
                        5 Local SEO Tips for Utah Businesses
                      </h3>
                      <p className="text-warm-gray text-xs mt-1">Blog post &middot; by Sakura</p>
                      <p className="text-charcoal/70 text-xs mt-2 leading-relaxed">
                        1,200 words &middot; EEAT optimized &middot; targets &ldquo;local SEO Utah&rdquo;
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="bg-torii text-white hover:bg-torii-dark flex-1 text-xs h-8 rounded-tenkai">
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="text-charcoal border-tenkai-border flex-1 text-xs h-8 rounded-tenkai hover:bg-parchment"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="text-warm-gray border-tenkai-border text-xs h-8 px-3 rounded-tenkai hover:bg-parchment"
                    >
                      Deny
                    </Button>
                  </div>
                </div>

                {/* Mock: Topic batch approval */}
                <div className="bg-white rounded-tenkai border border-tenkai-border p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🎯</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-charcoal leading-snug">
                        10 New Blog Topics for March
                      </h3>
                      <p className="text-warm-gray text-xs mt-1">Topic batch &middot; by Haruki</p>
                      <p className="text-charcoal/70 text-xs mt-2 leading-relaxed">
                        Based on keyword gap analysis &middot; avg. search volume 1.2k/mo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button className="bg-torii text-white hover:bg-torii-dark flex-1 text-xs h-8 rounded-tenkai">
                      Approve All
                    </Button>
                    <Button
                      variant="outline"
                      className="text-charcoal border-tenkai-border flex-1 text-xs h-8 rounded-tenkai hover:bg-parchment"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Summary note */}
            <div className="bg-parchment/50 rounded-tenkai px-4 py-3 text-center">
              <p className="text-warm-gray text-xs">
                <span className="font-semibold text-torii">
                  {approvalCards ? approvalCards.length : 2} item{(approvalCards?.length ?? 2) !== 1 ? 's' : ''}
                </span>{' '}
                waiting for your review
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
