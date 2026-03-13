'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Lightbulb, ArrowRight } from 'lucide-react'

interface InsightCardProps {
  agentName: string
  agentIcon: string
  title: string
  insights: string[]
  recommendations?: string[]
  onRecommendationClick?: (rec: string) => void
  className?: string
}

function guessRoute(rec: string): string {
  const lower = rec.toLowerCase()
  if (lower.includes('content') || lower.includes('blog') || lower.includes('publish') || lower.includes('article') || lower.includes('cluster') || lower.includes('topic')) return '/content'
  if (lower.includes('audit') || lower.includes('crawl') || lower.includes('seo score') || lower.includes('meta') || lower.includes('broken link')) return '/health'
  if (lower.includes('report') || lower.includes('traffic') || lower.includes('ranking') || lower.includes('keyword')) return '/reports'
  return '/content'
}

export function InsightCard({
  agentName,
  agentIcon,
  title,
  insights,
  recommendations,
  onRecommendationClick,
  className,
}: InsightCardProps) {
  const router = useRouter()

  function handleRecClick(rec: string) {
    if (onRecommendationClick) {
      onRecommendationClick(rec)
    } else {
      router.push(guessRoute(rec))
    }
  }

  return (
    <div
      className={cn(
        'bg-cream rounded-tenkai border-l-4 border-torii p-6 space-y-4',
        className
      )}
    >
      {/* Agent attribution */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-parchment flex items-center justify-center text-lg flex-shrink-0">
          {agentIcon}
        </div>
        <div>
          <p className="text-sm font-semibold text-charcoal">{agentName}</p>
          <p className="font-serif text-base text-charcoal/90">{title}</p>
        </div>
      </div>

      {/* Insights */}
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <li key={i} className="flex gap-3 text-sm text-charcoal/80 leading-relaxed">
            <span className="text-torii mt-0.5 flex-shrink-0">
              <span className="inline-block w-1.5 h-1.5 bg-torii rounded-full mt-1.5" />
            </span>
            <span>{insight}</span>
          </li>
        ))}
      </ul>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="pt-2 border-t border-tenkai-border space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-torii" />
            <span className="text-sm font-semibold text-charcoal">Recommendations</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((rec, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs border-tenkai-border hover:bg-torii-subtle hover:text-torii hover:border-torii/30 rounded-tenkai gap-1.5"
                onClick={() => handleRecClick(rec)}
              >
                {rec}
                <ArrowRight className="size-3" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
