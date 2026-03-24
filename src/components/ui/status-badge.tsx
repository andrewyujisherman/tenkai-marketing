'use client'

import { cn } from '@/lib/utils'

type BadgeStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'connected'
  | 'not-connected'
  | 'working'
  | 'idle'

type BadgeVariant = 'pill' | 'dot' | 'dot-label'

interface StatusBadgeProps {
  status: BadgeStatus
  variant?: BadgeVariant
  label?: string
  className?: string
}

const statusConfig: Record<BadgeStatus, { color: string; bg: string; dotColor: string; label: string; animate?: string }> = {
  draft: { color: 'text-warm-gray', bg: 'bg-warm-gray/10 border-warm-gray/20', dotColor: 'bg-warm-gray', label: 'Draft' },
  pending: { color: 'text-warning', bg: 'bg-warning/10 border-warning/20', dotColor: 'bg-warning', label: 'Pending' },
  approved: { color: 'text-success', bg: 'bg-success/10 border-success/20', dotColor: 'bg-success', label: 'Approved' },
  published: { color: 'text-torii', bg: 'bg-torii/10 border-torii/20', dotColor: 'bg-torii', label: 'Published' },
  rejected: { color: 'text-error', bg: 'bg-error/10 border-error/20', dotColor: 'bg-error', label: 'Rejected' },
  connected: { color: 'text-success', bg: 'bg-success/10 border-success/20', dotColor: 'bg-success', label: 'Connected' },
  'not-connected': { color: 'text-warm-gray', bg: 'bg-warm-gray/10 border-warm-gray/20', dotColor: 'bg-warm-gray', label: 'Not Connected' },
  working: { color: 'text-torii', bg: 'bg-torii/10 border-torii/20', dotColor: 'bg-torii', label: 'Working', animate: 'animate-pulse-dot' },
  idle: { color: 'text-success', bg: 'bg-success/10 border-success/20', dotColor: 'bg-success', label: 'Idle' },
}

export function StatusBadge({ status, variant = 'pill', label, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const displayLabel = label || config.label

  if (variant === 'dot') {
    return (
      <span
        className={cn('inline-block w-2.5 h-2.5 rounded-full', config.dotColor, config.animate, className)}
        title={displayLabel}
      />
    )
  }

  if (variant === 'dot-label') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', config.color, className)}>
        <span className={cn('w-2 h-2 rounded-full', config.dotColor, config.animate)} />
        {displayLabel}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-tenkai-sm text-xs font-semibold border',
        config.bg,
        config.color,
        className
      )}
    >
      {displayLabel}
    </span>
  )
}
