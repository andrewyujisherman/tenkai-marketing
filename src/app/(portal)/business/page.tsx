import { Suspense } from 'react'
import BusinessClient from './BusinessClient'

export default function MyBusinessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-charcoal">My Business</h2>
        <p className="text-warm-gray text-sm mt-1">
          Your business profile helps your AI team create better strategies
        </p>
      </div>
      <Suspense fallback={<div className="animate-pulse h-64 bg-parchment/30 rounded-tenkai" />}>
        <BusinessClient />
      </Suspense>
    </div>
  )
}
