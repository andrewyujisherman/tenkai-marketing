'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, FileText, HelpCircle, Plug } from 'lucide-react'
import { ApprovalForm } from './approval-form'

type ActionItemType = 'approval' | 'question' | 'setup'
type ApprovalAction = 'approve' | 'edit' | 'deny'

interface ActionItem {
  id: string
  title: string
  type: ActionItemType
  agentName: string
  agentKanji?: string
  timestamp: string
  preview: string
  content?: string
  questionText?: string
  setupInstructions?: string
}

interface ActionItemCardProps {
  item: ActionItem
  onApproval?: (id: string, action: ApprovalAction, feedback?: string) => void
  onAnswer?: (id: string, answer: string) => void
  onSkip?: (id: string) => void
  onSetupComplete?: (id: string) => void
  className?: string
}

const typeIcons: Record<ActionItemType, typeof FileText> = {
  approval: FileText,
  question: HelpCircle,
  setup: Plug,
}

const typeLabels: Record<ActionItemType, string> = {
  approval: 'Needs Your Approval',
  question: 'Has a Question',
  setup: 'Setup Required',
}

export function ActionItemCard({
  item,
  onApproval,
  onAnswer,
  onSkip,
  onSetupComplete,
  className,
}: ActionItemCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [answer, setAnswer] = useState('')
  const [resolved, setResolved] = useState<'approve' | 'edit' | 'deny' | 'answered' | 'skipped' | 'completed' | null>(null)

  const Icon = typeIcons[item.type]

  function handleApproval(action: ApprovalAction, feedback?: string) {
    setResolved(action)
    onApproval?.(item.id, action, feedback)
    setTimeout(() => setExpanded(false), 600)
  }

  function handleAnswer() {
    if (answer.trim().length >= 1) {
      setResolved('answered')
      onAnswer?.(item.id, answer.trim())
      setTimeout(() => setExpanded(false), 600)
    }
  }

  function handleSkip() {
    setResolved('skipped')
    onSkip?.(item.id)
    setTimeout(() => setExpanded(false), 600)
  }

  const flashClass = resolved === 'approve' || resolved === 'answered' || resolved === 'completed'
    ? 'animate-flash-green'
    : resolved === 'edit' || resolved === 'skipped'
    ? 'animate-flash-amber'
    : resolved === 'deny'
    ? 'animate-flash-red'
    : ''

  return (
    <div
      className={cn(
        'bg-ivory rounded-tenkai border border-tenkai-border overflow-hidden transition-shadow duration-normal',
        expanded ? 'shadow-tenkai-md' : 'shadow-tenkai-sm hover:shadow-tenkai-md',
        flashClass,
        resolved && !expanded ? 'animate-slide-out' : '',
        className
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-torii-subtle flex items-center justify-center">
          <Icon className="size-4 text-torii" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-charcoal truncate">{item.title}</span>
          </div>
          <p className="text-xs text-warm-gray mt-0.5">
            {item.agentName} {typeLabels[item.type].toLowerCase()} · {item.timestamp}
          </p>
          {!expanded && (
            <p className="text-xs text-charcoal/60 mt-1 truncate">{item.preview}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            'size-4 text-warm-gray flex-shrink-0 transition-transform duration-fast',
            expanded && 'rotate-180'
          )}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-tenkai-border-light pt-3">
          {item.type === 'approval' && (
            <>
              {item.content && (
                <div className="text-sm text-charcoal/80 mb-4 leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </div>
              )}
              <ApprovalForm onSubmit={handleApproval} />
            </>
          )}

          {item.type === 'question' && (
            <>
              <p className="text-sm text-charcoal mb-3">{item.questionText || item.preview}</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
                rows={2}
                className="w-full rounded-tenkai border border-tenkai-border p-3 text-sm text-charcoal placeholder:text-muted-gray focus:outline-none focus:ring-2 focus:ring-torii/20 mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAnswer}
                  disabled={answer.trim().length < 1}
                  className="px-4 py-1.5 rounded-tenkai bg-torii text-white text-sm font-medium hover:bg-torii-dark transition-colors duration-fast disabled:opacity-50"
                >
                  Answer
                </button>
                <button
                  onClick={handleSkip}
                  className="px-4 py-1.5 rounded-tenkai text-warm-gray text-sm hover:text-charcoal transition-colors duration-fast"
                >
                  Skip for now
                </button>
              </div>
            </>
          )}

          {item.type === 'setup' && (
            <>
              <div className="text-sm text-charcoal/80 mb-3 leading-relaxed whitespace-pre-wrap">
                {item.setupInstructions || item.preview}
              </div>
              <button
                onClick={() => {
                  setResolved('completed')
                  onSetupComplete?.(item.id)
                }}
                className="px-4 py-1.5 rounded-tenkai bg-success text-white text-sm font-medium hover:bg-success/90 transition-colors duration-fast"
              >
                Mark as Complete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
