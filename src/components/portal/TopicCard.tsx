'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Search, BarChart3, Gauge } from 'lucide-react'

export interface TopicCardProps {
  title: string
  keywords: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  volume: string
  status: 'pending' | 'approved' | 'denied'
  onApprove?: () => void
  onEdit?: () => void
  onDeny?: () => void
}

const difficultyColor = {
  Easy: 'bg-[#4A7C59]/10 text-[#4A7C59]',
  Medium: 'bg-[#C49A3C]/10 text-[#C49A3C]',
  Hard: 'bg-torii/10 text-torii',
}

const statusColor = {
  pending: 'border-tenkai-border',
  approved: 'border-[#4A7C59]/40 bg-[#4A7C59]/[0.02]',
  denied: 'border-torii/30 bg-torii/[0.02]',
}

export function TopicCard({
  title,
  keywords,
  difficulty,
  volume,
  status,
  onApprove,
  onEdit,
  onDeny,
}: TopicCardProps) {
  return (
    <div
      className={cn(
        'rounded-tenkai border bg-white p-5 transition-colors',
        statusColor[status]
      )}
    >
      <h3 className="font-serif text-base font-medium text-charcoal leading-snug mb-3">
        {title}
      </h3>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {keywords.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center gap-1 rounded-full bg-parchment px-2.5 py-0.5 text-xs text-warm-gray"
          >
            <Search className="size-2.5" />
            {kw}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-warm-gray">
          <Gauge className="size-3.5" />
          <span>Difficulty:</span>
          <span className={cn('rounded-full px-2 py-0.5 font-medium', difficultyColor[difficulty])}>
            {difficulty}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-warm-gray">
          <BarChart3 className="size-3.5" />
          <span>Volume:</span>
          <span className="font-medium text-charcoal">{volume}/mo</span>
        </div>
      </div>

      {status === 'pending' && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-torii hover:bg-torii-dark text-white"
            onClick={onApprove}
          >
            Approve
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-warm-gray" onClick={onDeny}>
            Deny
          </Button>
        </div>
      )}

      {status === 'approved' && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#4A7C59]">
          Approved
        </span>
      )}

      {status === 'denied' && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-torii">
          Denied
        </span>
      )}
    </div>
  )
}
