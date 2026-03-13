'use client'

import { useState } from 'react'
import { Copy, Check, Link2, ExternalLink, Mail, FolderOpen, SearchX } from 'lucide-react'
import type { LinkDeliverable } from './page'

interface LinksClientProps {
  profileDeliverables: LinkDeliverable[]
  outreachDeliverables: LinkDeliverable[]
  directoryDeliverables: LinkDeliverable[]
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
      : score >= 50
        ? 'bg-[#C49A3C]/10 text-[#C49A3C]'
        : 'bg-torii/10 text-torii'

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>
      {score}/100
    </span>
  )
}

function DateLabel({ iso }: { iso: string }) {
  return (
    <span className="text-xs text-muted-gray">
      {new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </span>
  )
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-12 text-center gap-3">
      <FolderOpen className="size-10 text-muted-gray" />
      <p className="text-sm text-warm-gray max-w-sm">{message}</p>
    </div>
  )
}

export default function LinksClient({
  profileDeliverables,
  outreachDeliverables,
  directoryDeliverables,
}: LinksClientProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'outreach' | 'directories'>('profile')
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const tabs = [
    { key: 'profile' as const, label: 'Profile', count: profileDeliverables.length, icon: Link2 },
    { key: 'outreach' as const, label: 'Outreach', count: outreachDeliverables.length, icon: Mail },
    { key: 'directories' as const, label: 'Directories', count: directoryDeliverables.length, icon: ExternalLink },
  ]

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Link Building</h1>
        <p className="text-sm text-warm-gray mt-1">
          Backlink analysis, outreach campaigns, and directory submissions
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-tenkai-border">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors -mb-px ${
                activeTab === tab.key
                  ? 'border-b-2 border-torii text-torii'
                  : 'text-warm-gray hover:text-charcoal'
              }`}
            >
              <Icon className="size-3.5" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 rounded-full bg-parchment px-1.5 py-0.5 text-[10px] font-semibold text-charcoal">
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ─── Profile Tab ──────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {profileDeliverables.length === 0 ? (
            <EmptyTab message="No backlink analysis yet. Request a Backlink Profile check from your Dashboard." />
          ) : (
            profileDeliverables.map((d) => (
              <div
                key={d.id}
                className="rounded-tenkai border border-tenkai-border bg-white p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="size-4 text-torii flex-shrink-0" />
                      <h3 className="font-serif text-base font-medium text-charcoal truncate">
                        {d.title ?? 'Backlink Analysis'}
                      </h3>
                      {d.score != null && <ScoreBadge score={d.score} />}
                    </div>
                    {d.summary && (
                      <p className="text-sm text-warm-gray leading-relaxed mb-3">{d.summary}</p>
                    )}
                    <div className="flex items-center gap-3">
                      {d.agent_name && (
                        <span className="text-xs text-muted-gray">By {d.agent_name}</span>
                      )}
                      <DateLabel iso={d.created_at} />
                      {d.status && (
                        <span className="rounded-full bg-parchment px-2 py-0.5 text-[10px] font-medium text-charcoal">
                          {d.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Outreach Tab ─────────────────────────────────────── */}
      {activeTab === 'outreach' && (
        <div className="space-y-4">
          {outreachDeliverables.length === 0 ? (
            <EmptyTab message="No outreach campaigns yet. Request Outreach Campaigns from your Dashboard." />
          ) : (
            outreachDeliverables.map((d) => {
              const isTemplate = d.deliverable_type === 'outreach_templates'
              const copyText = d.content ?? d.summary ?? ''
              const preview = copyText.length > 200 ? copyText.slice(0, 200) + '...' : copyText

              return (
                <div
                  key={d.id}
                  className="rounded-tenkai border border-tenkai-border bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {isTemplate ? (
                          <Mail className="size-4 text-torii flex-shrink-0" />
                        ) : (
                          <ExternalLink className="size-4 text-torii flex-shrink-0" />
                        )}
                        <h3 className="font-serif text-base font-medium text-charcoal truncate">
                          {d.title ?? (isTemplate ? 'Email Template' : 'Guest Post')}
                        </h3>
                        <span className="rounded-full bg-parchment px-2 py-0.5 text-[10px] font-medium text-charcoal">
                          {isTemplate ? 'email template' : (d.deliverable_type ?? 'content').replace(/_/g, ' ')}
                        </span>
                      </div>
                      {preview && (
                        <p className="text-sm text-warm-gray leading-relaxed mb-3 whitespace-pre-line">
                          {preview}
                        </p>
                      )}
                      <div className="flex items-center gap-3">
                        {d.agent_name && (
                          <span className="text-xs text-muted-gray">By {d.agent_name}</span>
                        )}
                        <DateLabel iso={d.created_at} />
                      </div>
                    </div>
                    {copyText && (
                      <button
                        onClick={() => handleCopy(d.id, copyText)}
                        className="flex items-center gap-1.5 rounded-tenkai border border-tenkai-border px-3 py-1.5 text-xs font-medium text-warm-gray hover:text-charcoal hover:border-charcoal/30 transition-colors flex-shrink-0"
                      >
                        {copied === d.id ? (
                          <Check className="size-4 text-[#4A7C59]" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                        {copied === d.id ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ─── Directories Tab ──────────────────────────────────── */}
      {activeTab === 'directories' && (
        <div className="space-y-4">
          {directoryDeliverables.length === 0 ? (
            <EmptyTab message="No directory submissions yet. Request Directory Listings from your Dashboard." />
          ) : (
            directoryDeliverables.map((d) => (
              <div
                key={d.id}
                className="rounded-tenkai border border-tenkai-border bg-white p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="size-4 text-torii flex-shrink-0" />
                      <h3 className="font-serif text-base font-medium text-charcoal truncate">
                        {d.title ?? 'Directory Submission'}
                      </h3>
                      {d.score != null && <ScoreBadge score={d.score} />}
                      {d.status && (
                        <span className="rounded-full bg-parchment px-2 py-0.5 text-[10px] font-medium text-charcoal">
                          {d.status}
                        </span>
                      )}
                    </div>
                    {d.summary && (
                      <p className="text-sm text-warm-gray leading-relaxed mb-3">{d.summary}</p>
                    )}
                    <div className="flex items-center gap-3">
                      {d.agent_name && (
                        <span className="text-xs text-muted-gray">By {d.agent_name}</span>
                      )}
                      <DateLabel iso={d.created_at} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function LinksEmptyState() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Link Building</h1>
        <p className="text-sm text-warm-gray mt-1">
          Backlink analysis, outreach campaigns, and directory submissions
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-white p-16 text-center gap-4">
        <SearchX className="size-12 text-muted-gray" />
        <div>
          <p className="font-medium text-charcoal">No link building data yet</p>
          <p className="text-sm text-warm-gray mt-1 max-w-sm">
            Your Tenkai team will start building your backlink profile after onboarding.
          </p>
        </div>
      </div>
    </div>
  )
}
