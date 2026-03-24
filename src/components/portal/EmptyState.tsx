'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({ icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-ivory p-12 text-center gap-4">
      <div className="text-warm-gray/50">{icon}</div>
      <div className="space-y-1">
        <p className="font-medium text-charcoal">{title}</p>
        <p className="text-sm text-warm-gray max-w-sm">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button
            variant="outline"
            className="text-torii border-torii/30 hover:bg-torii/5 hover:border-torii/50 rounded-tenkai gap-1.5 text-sm"
          >
            {actionLabel}
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      )}
    </div>
  )
}
