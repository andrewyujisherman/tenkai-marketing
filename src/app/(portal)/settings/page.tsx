import { Suspense } from 'react'
import SettingsClient from './SettingsClient'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl text-charcoal">Settings</h2>
        <p className="text-warm-gray text-sm mt-1">
          Manage your account, billing, and preferences
        </p>
      </div>
      <Suspense fallback={<div className="animate-pulse h-64 bg-parchment/30 rounded-tenkai" />}>
        <SettingsClient />
      </Suspense>
    </div>
  )
}
