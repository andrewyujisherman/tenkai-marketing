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

  const content = (
    <div
      className={cn(
        'portal-card text-center',
        linkTo && 'hover-lift cursor-pointer',
        variant === 'compact' ? 'p-3' : 'p-4',
        className
      )}
      title={tooltip}
    >
      <div className={cn('flex items-center justify-center gap-1', variant === 'compact' ? 'mt-0' : 'mt-1')}>
        <span className={cn('metric-lg text-charcoal', variant === 'compact' && 'text-xl')}>
          {value}
        </span>
        {trend && changePct && TrendIcon && (
          <span className={cn('metric-change flex items-center gap-0.5', trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'text-warm-gray')}>
            <TrendIcon className="size-3" />
            {changePct}
          </span>
        )}
      </div>
      <span className="metric-sub mt-1 block">{name}</span>
      {variant === 'full' && period && (
        <span className="text-muted-gray text-[11px] mt-0.5 block">{period}</span>
      )}
    </div>
  )

  if (linkTo) {
    return <Link href={linkTo} className="block">{content}</Link>
  }

  return content
}
