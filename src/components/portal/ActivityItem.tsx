'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ActivityItemProps {
  agentName: string
  agentIcon: string
  agentRole: string
  action: string
  timestamp: string
  needsAction?: boolean
  actionType?: 'approve' | 'review'
  onApprove?: () => void
  onDeny?: () => void
  onEdit?: () => void
}

export function ActivityItem({
  agentName,
  agentIcon,
  agentRole,
  action,
  timestamp,
  needsAction = false,
  actionType,
  onApprove,
  onDeny,
  onEdit,
}: ActivityItemProps) {
  return (
    <div
      className={cn(
        'bg-cream rounded-tenkai border border-tenkai-border p-4 flex gap-4 transition-colors hover:bg-parchment/60',
        needsAction && 'border-l-[3px] border-l-torii bg-torii-subtle/30'
      )}
    >
      {/* Agent avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-parchment flex items-center justify-center text-lg">
        {agentIcon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-charcoal text-sm">{agentName}</span>
              <span className="text-warm-gray text-xs">({agentRole})</span>
              {needsAction && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-torii/10 text-torii border border-torii/20">
                  Action needed
                </span>
              )}
            </div>
            <p className="text-charcoal/80 text-sm mt-1 leading-relaxed">{action}</p>
          </div>
          <span className="text-warm-gray text-xs whitespace-nowrap flex-shrink-0 pt-0.5">
            {timestamp}
          </span>
        </div>

        {/* Action buttons */}
        {needsAction && (
          <div className="flex items-center gap-2 mt-3">
            {actionType === 'approve' && (
              <>
                <Button
                  onClick={onApprove}
                  className="bg-torii text-white hover:bg-torii-dark text-xs h-7 px-3 rounded-tenkai"
                >
                  Approve
                </Button>
                <Button
                  onClick={onEdit}
                  variant="outline"
                  className="text-charcoal border-tenkai-border text-xs h-7 px-3 rounded-tenkai hover:bg-parchment"
                >
                  Edit
                </Button>
                <Button
                  onClick={onDeny}
                  variant="outline"
                  className="text-warm-gray border-tenkai-border text-xs h-7 px-3 rounded-tenkai hover:bg-parchment"
                >
                  Deny
                </Button>
              </>
            )}
            {actionType === 'review' && (
              <>
                <Button
                  onClick={onApprove}
                  className="bg-torii text-white hover:bg-torii-dark text-xs h-7 px-3 rounded-tenkai"
                >
                  Approve All
                </Button>
                <Button
                  onClick={onEdit}
                  variant="outline"
                  className="text-charcoal border-tenkai-border text-xs h-7 px-3 rounded-tenkai hover:bg-parchment"
                >
                  Review
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
