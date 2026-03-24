'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  trend: 'up' | 'down'
  trendValue: string
  icon?: React.ReactNode
}

export function StatCard({ label, value, trend, trendValue, icon }: StatCardProps) {
  return (
    <div className="bg-ivory rounded-tenkai shadow-tenkai-sm border border-tenkai-border p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-warm-gray text-sm font-medium">{label}</span>
        {icon && <span className="text-warm-gray">{icon}</span>}
      </div>
      <div className="flex items-end gap-3">
        <span className="font-serif text-3xl text-charcoal font-semibold tracking-tight">
          {value}
        </span>
        <span
          className={cn(
            'flex items-center gap-1 text-sm font-medium pb-1',
            trend === 'up' ? 'text-[#4A7C59]' : 'text-torii'
          )}
        >
          {trend === 'up' ? (
            <TrendingUp className="size-3.5" />
          ) : (
            <TrendingDown className="size-3.5" />
          )}
          {trendValue}
        </span>
      </div>
    </div>
  )
}
