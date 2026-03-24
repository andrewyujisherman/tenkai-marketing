'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { StatusBadge } from './status-badge'

type AgentStatus = 'idle' | 'working'
type AgentSize = 'avatar-only' | 'compact' | 'full' | 'editable'

interface AgentCardProps {
  agentId?: string
  name: string
  kanji: string
  role: string
  customName?: string
  status?: AgentStatus
  showStatus?: boolean
  size?: AgentSize
  editable?: boolean
  onRename?: (newName: string) => void
  className?: string
}

function KanjiAvatar({ kanji, size, status }: { kanji: string; size: AgentSize; status: AgentStatus }) {
  const dimension = size === 'avatar-only' ? 'w-12 h-12' : size === 'compact' ? 'w-10 h-10' : 'w-14 h-14'
  const textSize = size === 'avatar-only' ? 'text-lg' : size === 'compact' ? 'text-base' : 'text-xl'

  return (
    <div className="relative flex-shrink-0">
      <div
        className={cn(
          dimension,
          'rounded-full bg-torii-subtle flex items-center justify-center',
          'border-2 border-torii/20'
        )}
      >
        <span className={cn(textSize, 'font-serif text-torii select-none')}>{kanji}</span>
      </div>
      {status === 'working' && (
        <svg className={cn('absolute inset-0', dimension, 'animate-progress-spin')} viewBox="0 0 48 48">
          <circle
            cx="24" cy="24" r="22"
            fill="none" stroke="#C1554D" strokeWidth="2"
            strokeDasharray="40 100" strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  )
}

export function AgentCard({
  name,
  kanji,
  role,
  customName,
  status = 'idle',
  showStatus = true,
  size = 'full',
  editable = false,
  onRename,
  className,
}: AgentCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(customName || name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const displayName = customName || name
  const showOriginal = customName && customName !== name

  function handleDoubleClick() {
    if (editable || size === 'editable') {
      setIsEditing(true)
      setEditValue(displayName)
    }
  }

  function handleSave() {
    const trimmed = editValue.trim()
    if (trimmed.length >= 1 && trimmed.length <= 20 && /^[a-zA-Z0-9\s]+$/.test(trimmed)) {
      onRename?.(trimmed)
    }
    setIsEditing(false)
  }

  if (size === 'avatar-only') {
    return (
      <div className={cn('inline-flex flex-col items-center gap-1', className)} title={`${displayName} — ${role}`}>
        <KanjiAvatar kanji={kanji} size={size} status={status} />
        {showStatus && <StatusBadge status={status} variant="dot" />}
      </div>
    )
  }

  if (size === 'compact') {
    return (
      <div className={cn('flex items-center gap-3 p-2 rounded-tenkai', className)}>
        <KanjiAvatar kanji={kanji} size={size} status={status} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-charcoal truncate">{displayName}</p>
          <p className="text-xs text-warm-gray truncate">{role}</p>
        </div>
        {showStatus && <StatusBadge status={status} variant="dot" />}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'bg-ivory rounded-tenkai border border-tenkai-border p-4 shadow-tenkai-sm',
        'transition-shadow duration-normal hover:shadow-tenkai-md',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <KanjiAvatar kanji={kanji} size={size} status={status} />
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') setIsEditing(false)
              }}
              maxLength={20}
              className="w-full text-sm font-medium text-charcoal bg-transparent border-b-2 border-torii outline-none pb-0.5"
            />
          ) : (
            <p
              className={cn(
                'text-sm font-medium text-charcoal truncate',
                (editable || size === 'editable') && 'cursor-pointer hover:text-torii'
              )}
              onDoubleClick={handleDoubleClick}
              title={editable || size === 'editable' ? 'Double-click to rename' : undefined}
            >
              {displayName}
              {showOriginal && (
                <span className="text-warm-gray font-normal ml-1">({name})</span>
              )}
            </p>
          )}
          <p className="text-xs text-warm-gray mt-0.5">{role}</p>
        </div>
        {showStatus && <StatusBadge status={status} variant="dot-label" />}
      </div>
    </div>
  )
}
