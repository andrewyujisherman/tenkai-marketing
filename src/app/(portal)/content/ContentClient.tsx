'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { OutputViewer } from '@/components/ui/output-viewer'
import { ApprovalForm } from '@/components/ui/approval-form'
import { StatusBadge } from '@/components/ui/status-badge'
import { useToast } from '@/components/ui/toast-notification'
import { TENKAI_AGENTS, type AgentId } from '@/lib/agents/index'
import { Plus, Download, Send, Loader2 } from 'lucide-react'
import type { ContentPost } from './page'

/* ─── Status filter type ───────────────────────────────── */
type StatusFilter = 'all' | 'pending_review' | 'approved' | 'published' | 'rejected'

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
]

/* ─── Agent lookup helper ──────────────────────────────── */
function getAgentInfo(authorName: string) {
  const key = Object.keys(TENKAI_AGENTS).find(
    (k) => TENKAI_AGENTS[k as AgentId].name.toLowerCase() === authorName.toLowerCase()
  ) as AgentId | undefined
  if (!key) return { name: authorName, kanji: '\u685C', role: 'Content Agent' }
  const agent = TENKAI_AGENTS[key]
  return { name: agent.name, kanji: agent.kanji, role: agent.role }
}

/* ─── Tier quota config ────────────────────────────────── */
function getTierQuota(tier: string): number {
  if (tier === 'pro') return 20
  if (tier === 'growth') return 10
  return 5
}

function getTierContentTypes(tier: string): { type: string; label: string; description: string }[] {
  const base = [{ type: 'content_article', label: 'Blog Post', description: 'Full SEO-optimized blog post written by Sakura' }]
  if (tier === 'growth' || tier === 'pro') {
    base.push({ type: 'content_brief', label: 'Content Brief', description: 'Detailed content outline with keywords and structure' })
  }
  if (tier === 'pro') {
    base.push({ type: 'gbp_optimization', label: 'GBP Post', description: 'Google Business Profile post for local SEO' })
  }
  return base
}

/* ─── Map status to StatusBadge status type ─────────────── */
function mapStatus(status: string): 'draft' | 'pending' | 'approved' | 'published' | 'rejected' {
  if (status === 'pending_review') return 'pending'
  if (status === 'approved') return 'approved'
  if (status === 'published') return 'published'
  if (status === 'rejected') return 'rejected'
  return 'draft'
}

/* ─── Sort: pending_review first, then by date ──────────── */
function sortPosts(posts: ContentPost[]): ContentPost[] {
  return [...posts].sort((a, b) => {
    if (a.status === 'pending_review' && b.status !== 'pending_review') return -1
    if (b.status === 'pending_review' && a.status !== 'pending_review') return 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

/* ─── Relative date formatter ──────────────────────────── */
function relativeDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ─── Content detail type from API ─────────────────────── */
interface ContentDetail {
  id: string
  title: string
  content: unknown
  status: string
  agent_author: string
  content_type: string
  seo_score: number | null
  ai_detection_score: number | null
  keywords: string[]
  client_feedback: string | null
  created_at: string
  updated_at: string
}

/* ─── Props ────────────────────────────────────────────── */
interface ContentClientProps {
  initialPosts: ContentPost[]
  tier: string
  monthlyContentCount: number
}

export default function ContentClient({ initialPosts, tier, monthlyContentCount }: ContentClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [posts, setPosts] = useState(initialPosts)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('id'))
  const [detail, setDetail] = useState<ContentDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatSending, setChatSending] = useState(false)

  // Deep link: ?id=X opens viewer
  useEffect(() => {
    const idParam = searchParams.get('id')
    if (idParam && idParam !== selectedId) {
      setSelectedId(idParam)
    }
  }, [searchParams, selectedId])

  // Fetch detail when selectedId changes
  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/content/${id}`)
      if (!res.ok) throw new Error('Failed to load content')
      const data = await res.json()
      setDetail(data)
    } catch {
      addToast('error', 'Unable to load content. Please try again.')
      setSelectedId(null)
    } finally {
      setDetailLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    if (selectedId) {
      fetchDetail(selectedId)
    } else {
      setDetail(null)
    }
  }, [selectedId, fetchDetail])

  // Filter posts client-side
  const filteredPosts = sortPosts(
    filter === 'all' ? posts : posts.filter((p) => p.status === filter)
  )

  // Close viewer
  const closeViewer = () => {
    setSelectedId(null)
    setDetail(null)
    setChatMessage('')
    // Remove ?id from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('id')
    router.replace(url.pathname + url.search, { scroll: false })
  }

  // Open viewer
  const openViewer = (id: string) => {
    setSelectedId(id)
    const url = new URL(window.location.href)
    url.searchParams.set('id', id)
    router.replace(url.pathname + url.search, { scroll: false })
  }

  // Approval handler
  const handleApproval = async (action: 'approve' | 'edit' | 'deny', feedback?: string) => {
    if (!selectedId || !detail) return
    setApprovalLoading(true)
    try {
      let endpoint = ''
      let body: Record<string, unknown> = {}

      if (action === 'approve') {
        endpoint = `/api/content/${selectedId}/approve`
      } else if (action === 'edit') {
        endpoint = `/api/content/${selectedId}/feedback`
        body = { feedback: feedback ?? '' }
      } else {
        endpoint = `/api/content/${selectedId}/reject`
        body = { reason: feedback ?? '' }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error()

      const newStatus = action === 'approve' ? 'approved' : action === 'deny' ? 'rejected' : detail.status
      setDetail((prev) => prev ? { ...prev, status: newStatus } : prev)
      setPosts((prev) =>
        prev.map((p) => p.id === selectedId ? { ...p, status: newStatus } : p)
      )

      const messages: Record<string, string> = {
        approve: 'Content approved successfully.',
        edit: 'Feedback sent to your content team.',
        deny: 'Content denied.',
      }
      addToast('success', messages[action])
    } catch {
      addToast('error', 'Action failed. Please try again.')
    } finally {
      setApprovalLoading(false)
    }
  }

  // Chat / feedback send
  const handleChatSend = async () => {
    if (!selectedId || !chatMessage.trim()) return
    setChatSending(true)
    try {
      const res = await fetch(`/api/content/${selectedId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: chatMessage.trim() }),
      })
      if (!res.ok) throw new Error()
      addToast('success', 'Feedback sent.')
      setChatMessage('')
    } catch {
      addToast('error', 'Message failed to send. Please try again.')
    } finally {
      setChatSending(false)
    }
  }

  // Generate content request
  const handleGenerate = async (requestType: string) => {
    setGenerateLoading(true)
    try {
      const res = await fetch('/api/services/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_type: requestType }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Request failed')
      }
      addToast('success', 'Content generation started. Your team is on it!')
      setGenerateOpen(false)
    } catch (e) {
      addToast('error', e instanceof Error ? e.message : 'Failed to start content generation.')
    } finally {
      setGenerateLoading(false)
    }
  }

  // Download HTML/CSS
  const handleDownload = () => {
    if (!detail) return
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${detail.title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <article class="blog-post">
    <h1>${detail.title}</h1>
    <div class="content">${typeof detail.content === 'string' ? detail.content : JSON.stringify(detail.content)}</div>
  </article>
</body>
</html>`
    const css = `/* Tenkai Marketing — Blog Post Styles */
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #2C2C2C; }
h1 { font-family: Georgia, serif; font-size: 2rem; margin-bottom: 1rem; }
.content { font-size: 1rem; }
`
    // Create a simple download (no zip needed for now)
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${detail.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)

    const cssBlob = new Blob([css], { type: 'text/css' })
    const cssUrl = URL.createObjectURL(cssBlob)
    const cssA = document.createElement('a')
    cssA.href = cssUrl
    cssA.download = 'style.css'
    cssA.click()
    URL.revokeObjectURL(cssUrl)
  }

  const quota = getTierQuota(tier)
  const quotaReached = monthlyContentCount >= quota
  const contentTypes = getTierContentTypes(tier)
  const canDownload = tier === 'growth' || tier === 'pro'

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-charcoal">My Content</h1>
          <p className="text-sm text-warm-gray mt-1">
            Browse, review, and approve content from your AI writing team
          </p>
        </div>
        <Button
          onClick={() => setGenerateOpen(true)}
          disabled={quotaReached}
          className="bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-1.5 flex-shrink-0"
          title={quotaReached ? `You've used all ${quota} pieces this month.` : 'Generate new content'}
        >
          <Plus className="size-4" />
          Generate Content
        </Button>
      </div>

      {/* ─── Status Filter Pills ─────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-tenkai text-sm font-medium transition-colors duration-fast ${
              filter === f.value
                ? 'bg-torii text-white'
                : 'bg-cream text-warm-gray hover:bg-parchment'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                {posts.filter((p) => p.status === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Content Grid ────────────────────────────────── */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-torii-subtle flex items-center justify-center mx-auto mb-3">
            <span className="text-lg font-serif text-torii">{TENKAI_AGENTS.sakura.kanji}</span>
          </div>
          <p className="font-serif text-base font-medium text-charcoal mb-1">
            {filter === 'all' ? 'No content yet' : `No ${STATUS_FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} content`}
          </p>
          <p className="text-sm text-warm-gray max-w-sm mx-auto">
            {filter === 'all'
              ? 'Your content team is working on your first piece! Or generate a blog post now.'
              : 'Try a different filter to find what you need.'}
          </p>
          {filter === 'all' && (
            <Button
              onClick={() => setGenerateOpen(true)}
              disabled={quotaReached}
              className="mt-4 bg-torii text-white hover:bg-torii-dark rounded-tenkai gap-1.5"
            >
              <Plus className="size-4" />
              Generate Your First Post
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => {
            const agent = getAgentInfo(post.agent_author)
            return (
              <button
                key={post.id}
                onClick={() => openViewer(post.id)}
                className="text-left bg-ivory rounded-tenkai border border-tenkai-border p-5 shadow-tenkai-sm hover:shadow-tenkai-md transition-all duration-normal cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-serif text-sm font-semibold text-charcoal line-clamp-2 group-hover:text-torii transition-colors">
                    {post.title}
                  </h3>
                  <StatusBadge status={mapStatus(post.status)} className="flex-shrink-0" />
                </div>

                {post.excerpt && (
                  <p className="text-xs text-warm-gray line-clamp-2 mb-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-tenkai-border-light">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-torii-subtle flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-serif text-torii">{agent.kanji}</span>
                    </div>
                    <span className="text-xs text-warm-gray">{agent.name}</span>
                  </div>
                  <span className="text-xs text-muted-gray">{relativeDate(post.created_at)}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* ─── Content Viewer Modal ────────────────────────── */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={closeViewer} />
          <div className="relative z-10 w-[90%] max-w-3xl max-h-[90vh] bg-ivory rounded-tenkai-lg shadow-tenkai-lg flex flex-col overflow-hidden">
            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-6 text-torii animate-spin" />
              </div>
            ) : detail ? (
              <>
                {/* Viewer header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-tenkai-border bg-cream/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-torii-subtle flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-serif text-torii">{getAgentInfo(detail.agent_author).kanji}</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-serif text-lg text-charcoal font-semibold truncate">{detail.title}</h2>
                      <p className="text-xs text-warm-gray">
                        By {getAgentInfo(detail.agent_author).name} &middot; {getAgentInfo(detail.agent_author).role}
                        {detail.seo_score != null && (
                          <span className="ml-2">SEO Score: {detail.seo_score}/100</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canDownload && detail.status === 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="gap-1.5 rounded-tenkai"
                      >
                        <Download className="size-3.5" />
                        Download HTML
                      </Button>
                    )}
                    {canDownload && detail.status !== 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="gap-1.5 rounded-tenkai opacity-50"
                        title="Approve this content before downloading."
                      >
                        <Download className="size-3.5" />
                        Download HTML
                      </Button>
                    )}
                    <button
                      onClick={closeViewer}
                      className="p-2 rounded-tenkai hover:bg-parchment transition-colors duration-fast text-warm-gray"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Styled content body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <OutputViewer
                    data={{
                      id: detail.id,
                      title: detail.title,
                      content: detail.content as string,
                      agent_name: getAgentInfo(detail.agent_author).name,
                      agent_kanji: getAgentInfo(detail.agent_author).kanji,
                      deliverable_type: detail.content_type,
                      status: detail.status,
                    }}
                    variant="full-page"
                  />
                </div>

                {/* Bottom actions */}
                <div className="border-t border-tenkai-border bg-cream/30">
                  {/* Approval form — only for pending_review status */}
                  {detail.status === 'pending_review' && (
                    <div className="px-6 py-4">
                      <ApprovalForm
                        onSubmit={handleApproval}
                        loading={approvalLoading}
                      />
                    </div>
                  )}

                  {/* Chat input — disabled for published/rejected */}
                  {detail.status !== 'published' && detail.status !== 'rejected' && (
                    <div className="flex items-center gap-2 px-6 py-3 border-t border-tenkai-border-light">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleChatSend()
                          }
                        }}
                        placeholder="Type feedback or paste an image..."
                        className="flex-1 px-3 py-2 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
                        disabled={chatSending}
                      />
                      <button
                        onClick={handleChatSend}
                        disabled={chatSending || !chatMessage.trim()}
                        className="p-2 rounded-tenkai bg-torii text-white hover:bg-torii-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {chatSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* ─── Generate Content Dialog ─────────────────────── */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-charcoal">Generate Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-warm-gray">
              {monthlyContentCount} of {quota} pieces used this month
            </p>
            <div className="w-full bg-cream rounded-full h-1.5">
              <div
                className="bg-torii rounded-full h-1.5 transition-all"
                style={{ width: `${Math.min((monthlyContentCount / quota) * 100, 100)}%` }}
              />
            </div>

            {contentTypes.map((ct) => (
              <button
                key={ct.type}
                onClick={() => handleGenerate(ct.type)}
                disabled={generateLoading || quotaReached}
                className="w-full text-left p-4 rounded-tenkai border border-tenkai-border hover:border-torii/50 hover:bg-torii-subtle/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-sm font-medium text-charcoal">{ct.label}</p>
                <p className="text-xs text-warm-gray mt-0.5">{ct.description}</p>
              </button>
            ))}

            {generateLoading && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 className="size-4 text-torii animate-spin" />
                <span className="text-sm text-warm-gray">Starting generation...</span>
              </div>
            )}
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  )
}
