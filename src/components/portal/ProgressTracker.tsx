'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ProgressSnapshot } from '@/app/(portal)/dashboard/page'

interface ProgressTrackerProps {
  initial: ProgressSnapshot | null
  current: ProgressSnapshot | null
  clientStartDate: string | null
}

function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function monthsElapsed(startIso: string): number {
  const start = new Date(startIso)
  const now = new Date()
  return Math.max(
    1,
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  )
}

interface MetricTileProps {
  label: string
  from: number | null
  to: number | null
  suffix?: string
  zeroMessage?: string
  onlyTo?: boolean
}

function MetricTile({ label, from, to, suffix = '', zeroMessage, onlyTo }: MetricTileProps) {
  if (to === null && from === null) return null

  const hasComparison = !onlyTo && from !== null && to !== null && from !== to
  const delta = hasComparison ? to! - from! : null
  const improved = delta !== null && delta > 0
  const declined = delta !== null && delta < 0

  return (
    <div className="text-center p-3 rounded-tenkai" style={{ background: 'var(--parchment)' }}>
      <div className="text-[11px] uppercase tracking-wide text-warm-gray font-semibold mb-1">
        {label}
      </div>

      {hasComparison ? (
        <div className="flex items-center justify-center gap-2">
          <span className="text-warm-gray text-sm">{from}{suffix}</span>
          {improved
            ? <TrendingUp className="size-3.5 text-torii" />
            : declined
              ? <TrendingDown className="size-3.5 text-warm-gray" />
              : <Minus className="size-3 text-warm-gray" />}
          <span className="font-serif text-lg text-charcoal font-medium">{to}{suffix}</span>
        </div>
      ) : (
        <div className="font-serif text-lg text-charcoal font-medium">
          {to ?? from}{suffix}
        </div>
      )}

      <p className="text-[11px] text-warm-gray/80 mt-1">
        {hasComparison && delta !== null
          ? improved
            ? `+${delta}${suffix} improvement`
            : declined
              ? `${delta}${suffix} — working on it`
              : 'Holding steady'
          : to === 0 && zeroMessage
            ? zeroMessage
            : to !== null && to > 0
              ? `${to}${suffix} now`
              : '—'}
      </p>
    </div>
  )
}

export function ProgressTracker({ initial, current, clientStartDate }: ProgressTrackerProps) {
  const hasComparison = !!(initial && current)
  const hasAnyData = !!(initial || current)

  if (!hasAnyData) return null

  // Only one snapshot — show baseline recorded state
  if (!hasComparison) {
    return (
      <div className="portal-card animate-fade-in">
        <h3 className="font-serif text-[15px] text-charcoal font-medium mb-2">Your Progress</h3>
        <p className="text-[13px] text-warm-gray leading-relaxed">
          Your baseline has been recorded.
          Come back next month to see your progress with side-by-side comparisons.
        </p>
      </div>
    )
  }

  const sinceLabel = clientStartDate
    ? `Since ${formatMonthYear(clientStartDate)}`
    : `Since you started`

  const months = clientStartDate ? monthsElapsed(clientStartDate) : null
  const monthsLabel = months ? `${months} month${months !== 1 ? 's' : ''} ago` : null

  const tiles: MetricTileProps[] = []

  if (initial.healthScore !== null || current.healthScore !== null) {
    tiles.push({
      label: 'Health Score',
      from: initial.healthScore,
      to: current.healthScore,
      zeroMessage: 'Run an audit to see score',
    })
  }

  if (current.keywordsInTop10 !== null) {
    tiles.push({
      label: 'Page 1 Keywords',
      from: initial.keywordsInTop10,
      to: current.keywordsInTop10,
      zeroMessage: 'Building momentum — results take 2-3 months',
    })
  }

  if ((current.contentPublished ?? 0) > 0 || (initial.contentPublished ?? 0) > 0) {
    tiles.push({
      label: 'Content Published',
      from: initial.contentPublished,
      to: current.contentPublished,
      zeroMessage: 'First pieces coming soon',
    })
  }

  if (tiles.length === 0) return null

  return (
    <div className="portal-card animate-fade-in">
      <h3 className="font-serif text-[15px] text-charcoal font-medium mb-1">Your Progress</h3>
      <p className="text-[12px] text-warm-gray mb-4">
        {sinceLabel}{monthsLabel ? ` · ${monthsLabel}` : ''}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiles.map(tile => (
          <MetricTile key={tile.label} {...tile} />
        ))}
      </div>
    </div>
  )
}
