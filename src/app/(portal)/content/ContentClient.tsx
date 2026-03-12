'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { TopicCard, type TopicCardProps } from '@/components/portal/TopicCard'
import { DraftCard, type DraftCardProps } from '@/components/portal/DraftCard'
import { CheckCircle2, FileText, Globe } from 'lucide-react'

interface FeedbackDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (feedback: string) => Promise<void>
  title: string
}

function FeedbackDialog({ open, onClose, onSubmit, title }: FeedbackDialogProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    await onSubmit(text.trim())
    setLoading(false)
    setText('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-charcoal">{title}</DialogTitle>
        </DialogHeader>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe what you'd like changed..."
          rows={4}
          className="w-full px-4 py-3 text-sm border border-tenkai-border rounded-tenkai bg-transparent outline-none resize-none focus:border-torii focus:ring-2 focus:ring-torii/20 placeholder:text-muted-gray"
          autoFocus
        />
        <DialogFooter showCloseButton>
          <Button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="bg-torii text-white hover:bg-torii-dark rounded-tenkai"
          >
            {loading ? 'Sending…' : 'Send Feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type TopicItem = Omit<TopicCardProps, 'onApprove' | 'onEdit' | 'onDeny'> & { id: string }
type DraftItem = Omit<DraftCardProps, 'onApprove' | 'onRequestEdit' | 'onDeny'> & { id: string }
type PublishedItem = { id: string; title: string; date: string; seoScore: number | null; status: string; published_url: string | null }

interface ContentClientProps {
  initialTopics: TopicItem[]
  initialDrafts: DraftItem[]
  publishedPosts: PublishedItem[]
}

export default function ContentClient({ initialTopics, initialDrafts, publishedPosts }: ContentClientProps) {
  const [topics, setTopics] = useState(initialTopics)
  const [drafts, setDrafts] = useState(initialDrafts)
  const [topicFeedbackId, setTopicFeedbackId] = useState<string | null>(null)
  const [draftFeedbackId, setDraftFeedbackId] = useState<string | null>(null)

  const handleTopicApprove = async (id: string) => {
    setTopics((prev) => prev.map((t) => t.id === id ? { ...t, status: 'approved' as const } : t))
    await fetch(`/api/content/${id}/approve`, { method: 'POST' })
  }

  const handleTopicDeny = async (id: string) => {
    setTopics((prev) => prev.map((t) => t.id === id ? { ...t, status: 'denied' as const } : t))
    await fetch(`/api/content/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Denied by client' }) })
  }

  const handleApproveAll = async () => {
    const pendingIds = topics.filter((t) => t.status === 'pending').map((t) => t.id)
    setTopics((prev) => prev.map((t) => t.status === 'pending' ? { ...t, status: 'approved' as const } : t))
    await Promise.all(pendingIds.map((id) => fetch(`/api/content/${id}/approve`, { method: 'POST' })))
  }

  const handleDraftApprove = async (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
    await fetch(`/api/content/${id}/approve`, { method: 'POST' })
  }

  const handleDraftDeny = async (id: string) => {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
    await fetch(`/api/content/${id}/reject`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Denied by client' }) })
  }

  const handleTopicFeedback = async (id: string, feedback: string) => {
    await fetch(`/api/content/${id}/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback }) })
  }

  const handleDraftFeedback = async (id: string, feedback: string) => {
    await fetch(`/api/content/${id}/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback }) })
  }

  const pendingCount = topics.filter((t) => t.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Content Approval</h1>
        <p className="text-sm text-warm-gray mt-1">
          Review and approve content before it goes live
        </p>
      </div>

      <Tabs defaultValue="topics">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="topics" className="gap-1.5">
            <FileText className="size-3.5" />
            Topics
            {pendingCount > 0 && (
              <span className="ml-1 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="drafts" className="gap-1.5">
            <CheckCircle2 className="size-3.5" />
            Drafts
            {drafts.length > 0 && (
              <span className="ml-1 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
                {drafts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-1.5">
            <Globe className="size-3.5" />
            Published
          </TabsTrigger>
        </TabsList>

        {/* ─── Topics Tab ─────────────────────────────────────── */}
        <TabsContent value="topics">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-lg font-medium text-charcoal">
                  Blog Topics for Review
                </h2>
                <p className="text-sm text-warm-gray mt-0.5">
                  Haruki generated these based on your keywords, competitor gaps, and trending questions
                </p>
              </div>
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  className="bg-torii hover:bg-torii-dark text-white shrink-0"
                  onClick={handleApproveAll}
                >
                  Approve All ({pendingCount})
                </Button>
              )}
            </div>

            {topics.length === 0 ? (
              <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
                <FileText className="size-8 text-muted-gray mx-auto mb-3" />
                <p className="font-serif text-base font-medium text-charcoal mb-1">No topics yet</p>
                <p className="text-sm text-warm-gray max-w-sm mx-auto">
                  Your Tenkai team will start creating content after onboarding is complete.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    title={topic.title}
                    keywords={topic.keywords}
                    difficulty={topic.difficulty}
                    volume={topic.volume}
                    status={topic.status}
                    onApprove={() => handleTopicApprove(topic.id)}
                    onDeny={() => handleTopicDeny(topic.id)}
                    onEdit={() => setTopicFeedbackId(topic.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Drafts Tab ─────────────────────────────────────── */}
        <TabsContent value="drafts">
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-charcoal">
                Drafts Ready for Approval
              </h2>
              <p className="text-sm text-warm-gray mt-0.5">
                These posts have passed internal review and are ready for your final sign-off
              </p>
            </div>

            {drafts.length === 0 ? (
              <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
                <CheckCircle2 className="size-8 text-muted-gray mx-auto mb-3" />
                <p className="font-serif text-base font-medium text-charcoal mb-1">No drafts pending</p>
                <p className="text-sm text-warm-gray max-w-sm mx-auto">
                  Your Tenkai team will submit drafts for your review once topics are approved.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {drafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    title={draft.title}
                    author={draft.author}
                    wordCount={draft.wordCount}
                    readingTime={draft.readingTime}
                    seoScore={draft.seoScore}
                    aiScore={draft.aiScore}
                    eeatStatus={draft.eeatStatus}
                    excerpt={draft.excerpt}
                    fullContent={draft.fullContent}
                    checklist={draft.checklist}
                    onApprove={() => handleDraftApprove(draft.id)}
                    onRequestEdit={() => setDraftFeedbackId(draft.id)}
                    onDeny={() => handleDraftDeny(draft.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Published Tab ──────────────────────────────────── */}
        <TabsContent value="published">
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-lg font-medium text-charcoal">
                Published Content
              </h2>
              <p className="text-sm text-warm-gray mt-0.5">
                All published posts and their performance
              </p>
            </div>

            {publishedPosts.length === 0 ? (
              <div className="rounded-tenkai border border-tenkai-border bg-parchment/30 py-16 text-center">
                <Globe className="size-8 text-muted-gray mx-auto mb-3" />
                <p className="font-serif text-base font-medium text-charcoal mb-1">No published content yet</p>
                <p className="text-sm text-warm-gray max-w-sm mx-auto">
                  Your Tenkai team will start creating content after onboarding is complete.
                </p>
              </div>
            ) : (
              <div className="rounded-tenkai border border-tenkai-border bg-white overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-tenkai-border bg-parchment/50">
                      <th className="text-left py-3 px-4 font-medium text-warm-gray">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-warm-gray">Published</th>
                      <th className="text-right py-3 px-4 font-medium text-warm-gray">SEO Score</th>
                      <th className="text-right py-3 px-4 font-medium text-warm-gray">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publishedPosts.map((post) => (
                      <tr key={post.id} className="border-b border-tenkai-border-light last:border-none hover:bg-parchment/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-charcoal">
                          {post.published_url ? (
                            <a href={post.published_url} target="_blank" rel="noopener noreferrer" className="hover:text-torii transition-colors">
                              {post.title}
                            </a>
                          ) : post.title}
                        </td>
                        <td className="py-3 px-4 text-warm-gray">{post.date}</td>
                        <td className="py-3 px-4 text-right">
                          {post.seoScore != null ? (
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              post.seoScore >= 90
                                ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                                : post.seoScore >= 70
                                  ? 'bg-[#C49A3C]/10 text-[#C49A3C]'
                                  : 'bg-torii/10 text-torii'
                            }`}>
                              {post.seoScore}/100
                            </span>
                          ) : (
                            <span className="text-muted-gray text-xs">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#4A7C59]/10 px-2 py-0.5 text-xs font-medium text-[#4A7C59]">
                            <span className="size-1.5 rounded-full bg-[#4A7C59]" />
                            {post.status === 'published' ? 'Live' : 'Approved'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Topic feedback dialog */}
      <FeedbackDialog
        open={topicFeedbackId !== null}
        onClose={() => setTopicFeedbackId(null)}
        onSubmit={(feedback) => handleTopicFeedback(topicFeedbackId!, feedback)}
        title="Request Changes to Topic"
      />

      {/* Draft feedback dialog */}
      <FeedbackDialog
        open={draftFeedbackId !== null}
        onClose={() => setDraftFeedbackId(null)}
        onSubmit={(feedback) => handleDraftFeedback(draftFeedbackId!, feedback)}
        title="Request Edit on Draft"
      />
    </div>
  )
}
