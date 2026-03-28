'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ScoreCircleProps {
  score: number
  label: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: { width: 80, stroke: 6, fontSize: 'text-lg', labelSize: 'text-[10px]' },
  md: { width: 140, stroke: 8, fontSize: 'text-4xl', labelSize: 'text-[11px]' },
  lg: { width: 160, stroke: 10, fontSize: 'text-4xl', labelSize: 'text-sm' },
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#4A7C59'
  if (score >= 40) return '#C49A3C'
  return '#C1554D'
}

export function ScoreCircle({ score, label, size = 'md' }: ScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const config = sizeConfig[size]
  const radius = (config.width - config.stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference
  const color = getScoreColor(score)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          width={config.width}
          height={config.width}
          className="-rotate-90"
        >
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="#F5F1EB"
            strokeWidth={config.stroke}
          />
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-serif font-semibold', config.fontSize)} style={{ color }}>
            {score}
          </span>
        </div>
      </div>
      <span className={cn('text-warm-gray font-medium', config.labelSize)}>{label}</span>
    </div>
  )
}
