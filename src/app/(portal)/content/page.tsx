'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TopicCard, type TopicCardProps } from '@/components/portal/TopicCard'
import { DraftCard, type DraftCardProps } from '@/components/portal/DraftCard'
import { CheckCircle2, FileText, Globe } from 'lucide-react'

// ─── Mock Data: Topics ─────────────────────────────────────────
const initialTopics: (Omit<TopicCardProps, 'onApprove' | 'onEdit' | 'onDeny'> & { id: string })[] = [
  {
    id: '1',
    title: 'How to Optimize Your Google Business Profile in 2026',
    keywords: ['google business profile', 'GBP optimization', 'local SEO'],
    difficulty: 'Medium',
    volume: '2,400',
    status: 'pending',
  },
  {
    id: '2',
    title: 'The Complete Guide to AI Overview Optimization',
    keywords: ['AI overview', 'AIO optimization', 'SGE'],
    difficulty: 'Hard',
    volume: '1,800',
    status: 'pending',
  },
  {
    id: '3',
    title: '7 Local SEO Mistakes Killing Your Rankings',
    keywords: ['local SEO mistakes', 'local rankings', 'NAP consistency'],
    difficulty: 'Easy',
    volume: '3,100',
    status: 'pending',
  },
  {
    id: '4',
    title: 'Schema Markup for Small Businesses: A Beginner\'s Guide',
    keywords: ['schema markup', 'structured data', 'rich snippets'],
    difficulty: 'Medium',
    volume: '1,600',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Why Your Website\'s Core Web Vitals Are Hurting Your SEO',
    keywords: ['core web vitals', 'page speed', 'LCP', 'CLS'],
    difficulty: 'Hard',
    volume: '2,200',
    status: 'pending',
  },
  {
    id: '6',
    title: 'How to Get More Google Reviews (Ethically)',
    keywords: ['google reviews', 'review generation', 'reputation management'],
    difficulty: 'Easy',
    volume: '4,500',
    status: 'pending',
  },
  {
    id: '7',
    title: 'Content Clusters vs. Single Posts: What Ranks Better in 2026',
    keywords: ['content clusters', 'pillar pages', 'topic authority'],
    difficulty: 'Medium',
    volume: '1,200',
    status: 'pending',
  },
  {
    id: '8',
    title: 'EEAT Signals: What Google Really Looks For',
    keywords: ['EEAT', 'experience expertise authority trust', 'Google quality'],
    difficulty: 'Hard',
    volume: '2,800',
    status: 'pending',
  },
  {
    id: '9',
    title: 'The Best Free SEO Tools for Small Business Owners',
    keywords: ['free SEO tools', 'SEO for small business', 'keyword research tools'],
    difficulty: 'Easy',
    volume: '5,200',
    status: 'pending',
  },
  {
    id: '10',
    title: 'How to Write Meta Descriptions That Actually Get Clicks',
    keywords: ['meta descriptions', 'click-through rate', 'SERP optimization'],
    difficulty: 'Easy',
    volume: '3,400',
    status: 'pending',
  },
]

// ─── Mock Data: Drafts ─────────────────────────────────────────
const mockDrafts: (Omit<DraftCardProps, 'onApprove' | 'onRequestEdit' | 'onDeny'> & { id: string })[] = [
  {
    id: 'd1',
    title: 'The Complete Guide to Google Business Profile Optimization in 2026',
    author: 'Sakura',
    wordCount: 2450,
    readingTime: 11,
    seoScore: 92,
    aiScore: 6,
    eeatStatus: 'present',
    excerpt: 'Your Google Business Profile is the most powerful free tool for local visibility. In this comprehensive guide, we break down exactly how to optimize every section of your GBP listing, from choosing the right categories to crafting posts that convert browsers into customers.',
    fullContent: 'Your Google Business Profile is the most powerful free tool for local visibility. In this comprehensive guide, we break down exactly how to optimize every section of your GBP listing, from choosing the right categories to crafting posts that convert browsers into customers.\n\nFirst, let\'s talk about why GBP matters more than ever in 2026. With AI Overviews now dominating the top of search results for many queries, your Google Business Profile has become one of the few ways to maintain visibility in local search without paying for ads.\n\nThe key to GBP optimization starts with your business categories. Most businesses pick one or two categories and call it done. But Google allows up to 10 secondary categories, and each one helps you rank for a different set of local queries.\n\nNext, your business description. You get 750 characters, and every single one matters. Lead with your primary keyword naturally, mention your service area, and highlight what makes you different from competitors. Don\'t stuff keywords — write for humans first.\n\nPhotos are often overlooked but critically important. Businesses with more than 100 photos get 520% more calls than the average business. Post photos of your team, your workspace, your products, and most importantly, your happy customers (with permission).\n\nFinally, Google Posts. Think of these as mini-blog posts that appear right on your listing. Post weekly updates about offers, events, or helpful tips. Each post lives for 7 days, so consistency is key.',
    checklist: [
      { label: 'Keyword density 1-2%', passed: true },
      { label: 'Meta tags optimized', passed: true },
      { label: 'Heading hierarchy (H1-H4)', passed: true },
      { label: 'Internal links (3+)', passed: true },
      { label: 'EEAT signals embedded', passed: true },
      { label: 'AI detection score <10%', passed: true },
      { label: 'Readability score >60', passed: true },
    ],
  },
  {
    id: 'd2',
    title: '7 Local SEO Mistakes That Are Killing Your Rankings',
    author: 'Sakura',
    wordCount: 1820,
    readingTime: 8,
    seoScore: 85,
    aiScore: 8,
    eeatStatus: 'present',
    excerpt: 'We see the same local SEO mistakes over and over again. From inconsistent NAP data to ignoring your Google Business Profile posts, these seven common errors are costing local businesses thousands in lost revenue every month.',
    fullContent: 'We see the same local SEO mistakes over and over again. From inconsistent NAP data to ignoring your Google Business Profile posts, these seven common errors are costing local businesses thousands in lost revenue every month.\n\nMistake #1: Inconsistent NAP (Name, Address, Phone). If your business name is "Joe\'s Plumbing LLC" on your website but "Joe\'s Plumbing" on Yelp and "Joseph\'s Plumbing LLC" on your Google Business Profile, search engines get confused. Consistency matters across every single directory.\n\nMistake #2: Not responding to reviews. Every review — positive or negative — deserves a response. Businesses that respond to reviews earn 35% more revenue than those that don\'t. It signals to both Google and potential customers that you care.\n\nMistake #3: Ignoring mobile optimization. Over 60% of local searches happen on mobile devices. If your site takes more than 3 seconds to load on a phone, you\'re losing most of your potential customers before they even see your content.',
    checklist: [
      { label: 'Keyword density 1-2%', passed: true },
      { label: 'Meta tags optimized', passed: true },
      { label: 'Heading hierarchy (H1-H4)', passed: true },
      { label: 'Internal links (3+)', passed: false },
      { label: 'EEAT signals embedded', passed: true },
      { label: 'AI detection score <10%', passed: true },
      { label: 'Readability score >60', passed: true },
    ],
  },
  {
    id: 'd3',
    title: 'EEAT Signals: What Google Really Looks For in 2026',
    author: 'Sakura',
    wordCount: 3100,
    readingTime: 14,
    seoScore: 78,
    aiScore: 12,
    eeatStatus: 'needs-input',
    excerpt: 'Google\'s EEAT framework — Experience, Expertise, Authoritativeness, and Trustworthiness — has become the most important quality signal for content rankings. But most businesses get it wrong. Here\'s what actually moves the needle.',
    fullContent: 'Google\'s EEAT framework — Experience, Expertise, Authoritativeness, and Trustworthiness — has become the most important quality signal for content rankings. But most businesses get it wrong. Here\'s what actually moves the needle.\n\nThe "Experience" signal is the newest addition to EEAT, and it\'s become crucial. Google wants to see that your content comes from someone with real, first-hand experience. This means author bios with credentials, personal anecdotes in articles, original photos, and case studies from real client work.\n\nFor Expertise, think about how you can demonstrate deep knowledge. Don\'t just skim the surface — dive into specifics. Use data, cite studies, reference industry standards. The more specific and detailed your content, the more expertise signals you\'re sending.\n\nAuthoritativeness comes from being recognized by others. This includes backlinks from reputable sites, mentions in industry publications, speaking at conferences, and having your team quoted as experts.',
    checklist: [
      { label: 'Keyword density 1-2%', passed: true },
      { label: 'Meta tags optimized', passed: true },
      { label: 'Heading hierarchy (H1-H4)', passed: true },
      { label: 'Internal links (3+)', passed: true },
      { label: 'EEAT signals embedded', passed: false },
      { label: 'AI detection score <10%', passed: false },
      { label: 'Readability score >60', passed: true },
    ],
  },
]

// ─── Mock Data: Published ──────────────────────────────────────
const publishedPosts = [
  { id: 'p1', title: 'Why Every Small Business Needs a Google Business Profile', date: 'Mar 1, 2026', views: 1240, seoScore: 94, status: 'Live' },
  { id: 'p2', title: 'The Beginner\'s Guide to Keyword Research', date: 'Feb 22, 2026', views: 890, seoScore: 88, status: 'Live' },
  { id: 'p3', title: '5 Quick Wins for Better Local SEO', date: 'Feb 15, 2026', views: 2100, seoScore: 91, status: 'Live' },
  { id: 'p4', title: 'Understanding Your SEO Audit Report', date: 'Feb 8, 2026', views: 650, seoScore: 82, status: 'Live' },
  { id: 'p5', title: 'How to Track Your SEO Progress', date: 'Feb 1, 2026', views: 430, seoScore: 79, status: 'Live' },
]

export default function ContentPage() {
  const [topics, setTopics] = useState(initialTopics)

  const handleTopicAction = (id: string, action: 'approved' | 'denied') => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: action } : t))
    )
  }

  const handleApproveAll = () => {
    setTopics((prev) =>
      prev.map((t) => (t.status === 'pending' ? { ...t, status: 'approved' as const } : t))
    )
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
            <span className="ml-1 rounded-full bg-torii/10 px-1.5 py-0.5 text-[10px] font-semibold text-torii">
              {mockDrafts.length}
            </span>
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

            <div className="grid gap-3 sm:grid-cols-2">
              {topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  title={topic.title}
                  keywords={topic.keywords}
                  difficulty={topic.difficulty}
                  volume={topic.volume}
                  status={topic.status}
                  onApprove={() => handleTopicAction(topic.id, 'approved')}
                  onDeny={() => handleTopicAction(topic.id, 'denied')}
                  onEdit={() => {}}
                />
              ))}
            </div>
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

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {mockDrafts.map((draft) => (
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
                  onApprove={() => {}}
                  onRequestEdit={() => {}}
                  onDeny={() => {}}
                />
              ))}
            </div>
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

            <div className="rounded-tenkai border border-tenkai-border bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-tenkai-border bg-parchment/50">
                    <th className="text-left py-3 px-4 font-medium text-warm-gray">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-warm-gray">Published</th>
                    <th className="text-right py-3 px-4 font-medium text-warm-gray">Views</th>
                    <th className="text-right py-3 px-4 font-medium text-warm-gray">SEO Score</th>
                    <th className="text-right py-3 px-4 font-medium text-warm-gray">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {publishedPosts.map((post) => (
                    <tr key={post.id} className="border-b border-tenkai-border-light last:border-none hover:bg-parchment/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-charcoal">{post.title}</td>
                      <td className="py-3 px-4 text-warm-gray">{post.date}</td>
                      <td className="py-3 px-4 text-right text-charcoal tabular-nums">{post.views.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          post.seoScore >= 90
                            ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                            : post.seoScore >= 70
                              ? 'bg-[#C49A3C]/10 text-[#C49A3C]'
                              : 'bg-torii/10 text-torii'
                        }`}>
                          {post.seoScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#4A7C59]/10 px-2 py-0.5 text-xs font-medium text-[#4A7C59]">
                          <span className="size-1.5 rounded-full bg-[#4A7C59]" />
                          {post.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
