'use client'

import Link from 'next/link'

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('[PortalError]', error)
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-serif text-charcoal mb-3">Something went wrong</h2>
        <p className="text-charcoal/60 mb-6 text-sm">This page encountered an error.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-torii text-white rounded-lg text-sm hover:bg-torii-dark"
          >
            Try again
          </button>
          <Link href="/dashboard" className="px-4 py-2 border border-charcoal/20 rounded-lg text-sm hover:bg-charcoal/5">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
