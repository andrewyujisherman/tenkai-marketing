'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, Pencil, X } from 'lucide-react'

type ApprovalAction = 'approve' | 'edit' | 'deny'
type ApprovalVariant = 'inline' | 'bottom-bar'

interface ApprovalFormProps {
  onSubmit: (action: ApprovalAction, feedback?: string) => void
  variant?: ApprovalVariant
  loading?: boolean
  className?: string
}

export function ApprovalForm({ onSubmit, variant = 'inline', loading = false, className }: ApprovalFormProps) {
  const [activeAction, setActiveAction] = useState<'edit' | 'deny' | null>(null)
  const [feedback, setFeedback] = useState('')

  function handleAction(action: ApprovalAction) {
    if (action === 'approve') {
      onSubmit('approve')
      return
    }
    if (activeAction === action) {
      setActiveAction(null)
      setFeedback('')
      return
    }
    setActiveAction(action)
    setFeedback('')
  }

  function handleSubmitFeedback() {
    if (activeAction && feedback.trim().length >= 10) {
      onSubmit(activeAction, feedback.trim())
      setActiveAction(null)
      setFeedback('')
    }
  }

  const isBottomBar = variant === 'bottom-bar'

  return (
    <div
      className={cn(
        isBottomBar
          ? 'fixed bottom-0 left-0 right-0 bg-white border-t border-tenkai-border p-4 shadow-tenkai-lg z-40 lg:ml-sidebar'
          : 'bg-white rounded-tenkai border border-tenkai-border p-4',
        className
      )}
    >
      <div className={cn('flex gap-2', isBottomBar ? 'justify-center' : 'justify-start')}>
        <button
          onClick={() => handleAction('approve')}
          disabled={loading}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-tenkai text-sm font-medium transition-colors duration-fast',
            'bg-success text-white hover:bg-success/90',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Check className="size-4" />
          Approve
        </button>
        <button
          onClick={() => handleAction('edit')}
          disabled={loading}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-tenkai text-sm font-medium transition-colors duration-fast',
            activeAction === 'edit'
              ? 'bg-warning text-white'
              : 'bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Pencil className="size-4" />
          Request Changes
        </button>
        <button
          onClick={() => handleAction('deny')}
          disabled={loading}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-tenkai text-sm font-medium transition-colors duration-fast',
            activeAction === 'deny'
              ? 'bg-error text-white'
              : 'bg-error/10 text-error border border-error/30 hover:bg-error/20',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <X className="size-4" />
          Deny
        </button>
      </div>

      {activeAction && (
        <div className="mt-3">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={
              activeAction === 'edit'
                ? 'Describe what changes you\'d like (minimum 10 characters)...'
                : 'Explain why you\'re denying this (minimum 10 characters)...'
            }
            rows={3}
            className={cn(
              'w-full rounded-tenkai border border-tenkai-border p-3 text-sm text-charcoal',
              'placeholder:text-muted-gray focus:outline-none focus:ring-2',
              activeAction === 'edit' ? 'focus:ring-warning/30' : 'focus:ring-error/30'
            )}
          />
          <div className="flex items-center justify-between mt-2">
            <span className={cn('text-xs', feedback.trim().length < 10 ? 'text-muted-gray' : 'text-warm-gray')}>
              {feedback.trim().length}/10 minimum
            </span>
            <button
              onClick={handleSubmitFeedback}
              disabled={loading || feedback.trim().length < 10}
              className={cn(
                'px-4 py-1.5 rounded-tenkai text-sm font-medium text-white transition-colors duration-fast',
                activeAction === 'edit' ? 'bg-warning hover:bg-warning/90' : 'bg-error hover:bg-error/90',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
