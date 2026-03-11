'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Eye, FileText, CheckCircle2, AlertTriangle } from 'lucide-react'

export interface ChecklistItem {
  label: string
  passed: boolean
}

export interface DraftCardProps {
  title: string
  author: string
  wordCount: number
  readingTime: number
  seoScore: number
  aiScore: number
  eeatStatus: 'present' | 'needs-input'
  excerpt: string
  fullContent?: string
  checklist: ChecklistItem[]
  onApprove?: () => void
  onRequestEdit?: () => void
  onDeny?: () => void
}

function ScoreBadge({ label, score, thresholds }: { label: string; score: number; thresholds: { good: number; warn: number } }) {
  const color =
    score >= thresholds.good
      ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
      : score >= thresholds.warn
        ? 'bg-[#C49A3C]/10 text-[#C49A3C]'
        : 'bg-torii/10 text-torii'

  return (
    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', color)}>
      {label}: {score}{label === 'SEO' ? '/100' : '%'}
    </span>
  )
}

export function DraftCard({
  title,
  author,
  wordCount,
  readingTime,
  seoScore,
  aiScore,
  eeatStatus,
  excerpt,
  fullContent,
  checklist,
  onApprove,
  onRequestEdit,
  onDeny,
}: DraftCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <div className="rounded-tenkai border border-tenkai-border bg-white p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-serif text-base font-medium text-charcoal leading-snug">
            {title}
          </h3>
          <p className="text-xs text-warm-gray mt-1">
            by {author} &middot; {wordCount.toLocaleString()} words &middot; {readingTime} min read
          </p>
        </div>
        <FileText className="size-5 text-muted-gray shrink-0 mt-0.5" />
      </div>

      {/* Score badges */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <ScoreBadge label="SEO" score={seoScore} thresholds={{ good: 70, warn: 50 }} />
        <ScoreBadge label="AI Detection" score={aiScore} thresholds={{ good: 0, warn: 10 }} />
        {eeatStatus === 'present' ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#4A7C59]/10 px-2.5 py-0.5 text-xs font-medium text-[#4A7C59]">
            <CheckCircle2 className="size-3" />
            EEAT signals present
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#C49A3C]/10 px-2.5 py-0.5 text-xs font-medium text-[#C49A3C]">
            <AlertTriangle className="size-3" />
            Needs EEAT input
          </span>
        )}
      </div>

      {/* Excerpt */}
      <p className="text-sm text-warm-gray leading-relaxed mb-4 line-clamp-3">
        {excerpt}
      </p>

      {/* Preview button */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogTrigger
          render={
            <Button variant="outline" size="sm" className="mb-4">
              <Eye className="size-3.5 mr-1.5" />
              Full Preview
            </Button>
          }
        />
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{title}</DialogTitle>
            <DialogDescription>
              by {author} &middot; {wordCount.toLocaleString()} words &middot; {readingTime} min read
            </DialogDescription>
          </DialogHeader>
          <div className="prose prose-sm max-w-none text-charcoal mt-4">
            {fullContent ? (
              fullContent.split('\n\n').map((p, i) => (
                <p key={i} className="mb-3 text-sm leading-relaxed text-warm-gray">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-sm text-warm-gray">{excerpt}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Internal review checklist */}
      <Accordion>
        <AccordionItem value="checklist" className="border-none">
          <AccordionTrigger className="py-2 text-xs text-warm-gray hover:no-underline">
            Internal Review Checklist
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-1.5 py-1">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs">
                  {item.passed ? (
                    <CheckCircle2 className="size-3.5 text-[#4A7C59]" />
                  ) : (
                    <AlertTriangle className="size-3.5 text-[#C49A3C]" />
                  )}
                  <span className={item.passed ? 'text-charcoal' : 'text-[#C49A3C]'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-tenkai-border">
        <Button
          size="sm"
          className="bg-torii hover:bg-torii-dark text-white"
          onClick={onApprove}
        >
          Approve
        </Button>
        <Button variant="outline" size="sm" onClick={onRequestEdit}>
          Request Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-warm-gray" onClick={onDeny}>
          Deny
        </Button>
      </div>
    </div>
  )
}
