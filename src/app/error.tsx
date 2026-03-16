'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  console.error('[GlobalError]', error)
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <div className="text-center max-w-md px-6">
        <h2 className="text-2xl font-serif text-charcoal mb-4">Something went wrong</h2>
        <p className="text-charcoal/60 mb-6">We hit an unexpected error. Please try again.</p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-torii text-white rounded-xl hover:bg-torii-dark"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
