'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: 'up' | 'down' | 'neutral'
  changePercent?: string
  period?: string
  detail?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  change,
  changePercent,
  period,
  detail,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-ivory rounded-tenkai shadow-tenkai-sm border border-tenkai-border p-5 flex flex-col gap-2',
        className
      )}
    >
      <span className="text-warm-gray text-sm font-medium">{title}</span>
      <div className="flex items-end gap-3">
        <span className="font-serif text-3xl text-charcoal font-semibold tracking-tight">
          {value}
        </span>
        {change && changePercent && (
          <span
            className={cn(
              'flex items-center gap-1 text-sm font-medium pb-1',
              change === 'up' && 'text-[#4A7C59]',
              change === 'down' && 'text-torii',
              change === 'neutral' && 'text-warm-gray'
            )}
          >
            {change === 'up' && <TrendingUp className="size-3.5" />}
            {change === 'down' && <TrendingDown className="size-3.5" />}
            {change === 'neutral' && <Minus className="size-3.5" />}
            {changePercent}
          </span>
        )}
      </div>
      {period && (
        <span className="text-warm-gray text-xs">{period}</span>
      )}
      {detail && (
        <p className="text-charcoal/70 text-xs mt-1 leading-relaxed">
          {detail}
        </p>
      )}
    </div>
  )
}
