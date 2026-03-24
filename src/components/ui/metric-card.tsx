'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Trend = 'up' | 'down' | 'neutral'
type MetricVariant = 'compact' | 'full'

interface MetricCardProps {
  name: string
  value: string | number
  trend?: Trend
  changePct?: string
  period?: string
  tooltip?: string
  linkTo?: string
  variant?: MetricVariant
  className?: string
}

const trendConfig: Record<Trend, { icon: typeof TrendingUp; color: string }> = {
  up: { icon: TrendingUp, color: 'text-success' },
  down: { icon: TrendingDown, color: 'text-error' },
  neutral: { icon: Minus, color: 'text-warm-gray' },
}

export function MetricCard({
  name,
  value,
  trend,
  changePct,
  period,
  tooltip,
  linkTo,
  variant = 'full',
  className,
}: MetricCardProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null
  const trendColor = trend ? trendConfig[trend].color : ''

  const content = (
    <div
      className={cn(
        'bg-ivory rounded-tenkai border border-tenkai-border shadow-tenkai-sm',
        'transition-all duration-normal',
        linkTo && 'hover:shadow-tenkai-md hover:border-torii/20 cursor-pointer',
        variant === 'compact' ? 'p-3' : 'p-5',
        className
      )}
      title={tooltip}
    >
      <span className="text-warm-gray text-xs font-medium uppercase tracking-wider">{name}</span>
      <div className={cn('flex items-end gap-2', variant === 'compact' ? 'mt-1' : 'mt-2')}>
        <span className={cn('font-serif text-charcoal font-semibold tracking-tight', variant === 'compact' ? 'text-2xl' : 'text-3xl')}>
          {value}
        </span>
        {trend && changePct && TrendIcon && (
          <span className={cn('flex items-center gap-0.5 text-sm font-medium pb-0.5', trendColor)}>
            <TrendIcon className="size-3.5" />
            {changePct}
          </span>
        )}
      </div>
      {variant === 'full' && period && (
        <span className="text-warm-gray text-xs mt-1 block">{period}</span>
      )}
    </div>
  )

  if (linkTo) {
    return <Link href={linkTo} className="block">{content}</Link>
  }

  return content
}
