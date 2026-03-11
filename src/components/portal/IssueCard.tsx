'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

export interface IssueCardProps {
  severity: 'critical' | 'warning' | 'passed'
  title: string
  description: string
  agent: string
  affectedCount?: number
  actionLabel: string
  onAction?: () => void
}

const severityConfig = {
  critical: {
    bg: 'bg-torii/5',
    border: 'border-torii/30',
    badgeBg: 'bg-torii/10 text-torii',
    icon: XCircle,
    label: 'Critical',
  },
  warning: {
    bg: 'bg-[#C49A3C]/5',
    border: 'border-[#C49A3C]/30',
    badgeBg: 'bg-[#C49A3C]/10 text-[#C49A3C]',
    icon: AlertTriangle,
    label: 'Warning',
  },
  passed: {
    bg: 'bg-[#4A7C59]/5',
    border: 'border-[#4A7C59]/30',
    badgeBg: 'bg-[#4A7C59]/10 text-[#4A7C59]',
    icon: CheckCircle2,
    label: 'Passed',
  },
}

export function IssueCard({
  severity,
  title,
  description,
  agent,
  affectedCount,
  actionLabel,
  onAction,
}: IssueCardProps) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-tenkai border p-4',
        config.bg,
        config.border
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('mt-0.5 size-5 shrink-0', config.badgeBg.split(' ')[1])} />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-charcoal">{title}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', config.badgeBg)}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-warm-gray">{description}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-gray">by {agent}</span>
            {affectedCount !== undefined && (
              <span className="text-xs text-muted-gray">
                {affectedCount} page{affectedCount !== 1 ? 's' : ''} affected
              </span>
            )}
          </div>
        </div>
      </div>
      <Button
        variant={severity === 'passed' ? 'ghost' : 'outline'}
        size="sm"
        onClick={onAction}
        className="shrink-0"
      >
        {actionLabel}
      </Button>
    </div>
  )
}
