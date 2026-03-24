'use client'

import { SearchX } from 'lucide-react'

// This page has been replaced by /health. AuditClient is kept as a stub for any residual imports.
export default function AuditClient() {
  return null
}

export function AuditEmptyState() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Audit Results</h1>
        <p className="text-sm text-warm-gray mt-1">
          This page has moved to Website Health.
        </p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-tenkai border border-tenkai-border bg-ivory p-16 text-center gap-4">
        <SearchX className="size-12 text-warm-gray/50" />
        <div>
          <p className="font-medium text-charcoal">Redirecting to Website Health...</p>
        </div>
      </div>
    </div>
  )
}
