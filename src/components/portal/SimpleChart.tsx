'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ChartDataItem {
  label: string
  value: number
  maxValue?: number
}

interface SimpleChartProps {
  data: ChartDataItem[]
  title?: string
  color?: string
  className?: string
}

export function SimpleChart({
  data,
  title,
  color = 'bg-torii',
  className,
}: SimpleChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const maxVal = Math.max(...data.map((d) => d.maxValue ?? d.value))

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <h3 className="font-serif text-lg text-charcoal">{title}</h3>
      )}
      <div className="space-y-3">
        {data.map((item, i) => {
          const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-warm-gray w-20 flex-shrink-0 text-right truncate">
                {item.label}
              </span>
              <div className="flex-1 h-7 bg-parchment/60 rounded overflow-hidden relative">
                <div
                  className={cn(
                    'h-full rounded transition-all duration-700 ease-out',
                    color
                  )}
                  style={{ width: mounted ? `${pct}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-medium text-charcoal w-14 text-right tabular-nums">
                {item.value.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface StackedBarItem {
  label: string
  segments: { value: number; color: string; name: string }[]
}

interface StackedBarChartProps {
  data: StackedBarItem[]
  title?: string
  legend?: { name: string; color: string }[]
  className?: string
}

export function StackedBarChart({
  data,
  title,
  legend,
  className,
}: StackedBarChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const maxTotal = Math.max(
    ...data.map((d) => d.segments.reduce((sum, s) => sum + s.value, 0))
  )

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <h3 className="font-serif text-lg text-charcoal">{title}</h3>
      )}
      {legend && (
        <div className="flex flex-wrap gap-4">
          {legend.map((l) => (
            <div key={l.name} className="flex items-center gap-1.5">
              <span className={cn('w-3 h-3 rounded-sm', l.color)} />
              <span className="text-xs text-warm-gray">{l.name}</span>
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {data.map((item, i) => {
          const total = item.segments.reduce((s, seg) => s + seg.value, 0)
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-warm-gray w-20 flex-shrink-0 text-right truncate">
                {item.label}
              </span>
              <div className="flex-1 h-7 bg-parchment/60 rounded overflow-hidden flex">
                {item.segments.map((seg, j) => {
                  const pct = maxTotal > 0 ? (seg.value / maxTotal) * 100 : 0
                  return (
                    <div
                      key={j}
                      className={cn(
                        'h-full transition-all duration-700 ease-out first:rounded-l last:rounded-r',
                        seg.color
                      )}
                      style={{ width: mounted ? `${pct}%` : '0%' }}
                      title={`${seg.name}: ${seg.value}`}
                    />
                  )
                })}
              </div>
              <span className="text-sm font-medium text-charcoal w-10 text-right tabular-nums">
                {total}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
