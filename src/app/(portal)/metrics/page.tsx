import { Suspense } from 'react'
import MetricsClient from './MetricsClient'

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal">My Metrics</h2>
        <p className="text-warm-gray text-sm mt-1">
          Track your website traffic, search visibility, and local presence
        </p>
      </div>
      <Suspense fallback={<div className="animate-pulse h-64 bg-parchment/30 rounded-tenkai" />}>
        <MetricsClient />
      </Suspense>
    </div>
  )
}
