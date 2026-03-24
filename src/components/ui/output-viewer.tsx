'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { X, Maximize2, Download } from 'lucide-react'

interface OutputContent {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'keyword_link' | 'metric' | 'section_break'
  level?: number
  text?: string
  items?: string[]
  headers?: string[]
  rows?: string[][]
  keyword?: string
  href?: string
  label?: string
  value?: string
}

interface OutputData {
  id: string
  title: string
  content: OutputContent[] | string
  deliverable_type?: string
  agent_name?: string
  agent_kanji?: string
  status?: string
}

type OutputVariant = 'modal' | 'full-page'

interface OutputViewerProps {
  data: OutputData
  variant?: OutputVariant
  open?: boolean
  onClose?: () => void
  className?: string
}

function renderContent(content: OutputContent[] | string): React.ReactNode {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) return renderContentArray(parsed)
    } catch {
      // Plain text fallback — render as paragraphs
      return content.split('\n\n').map((block, i) => (
        <p key={i} className="text-sm text-charcoal/80 leading-relaxed mb-3">{block}</p>
      ))
    }
    return <p className="text-sm text-charcoal/80 leading-relaxed">{content}</p>
  }
  return renderContentArray(content)
}

function renderContentArray(blocks: OutputContent[]): React.ReactNode {
  return blocks.map((block, i) => {
    switch (block.type) {
      case 'heading': {
        const Tag = block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'h4'
        const sizes = { 1: 'text-xl', 2: 'text-lg', 3: 'text-base' }
        return (
          <Tag key={i} className={cn('font-serif text-charcoal font-semibold mt-6 mb-2', sizes[block.level as 1 | 2 | 3] || 'text-base')}>
            {block.text}
          </Tag>
        )
      }
      case 'paragraph':
        return <p key={i} className="text-sm text-charcoal/80 leading-relaxed mb-3">{block.text}</p>
      case 'list':
        return (
          <ul key={i} className="list-disc list-inside mb-3 space-y-1">
            {block.items?.map((item, j) => (
              <li key={j} className="text-sm text-charcoal/80 leading-relaxed">{item}</li>
            ))}
          </ul>
        )
      case 'table':
        return (
          <div key={i} className="overflow-x-auto mb-4 rounded-tenkai border border-tenkai-border">
            <table className="w-full text-sm">
              {block.headers && (
                <thead>
                  <tr className="bg-cream">
                    {block.headers.map((h, j) => (
                      <th key={j} className="px-3 py-2 text-left font-medium text-charcoal border-b border-tenkai-border">{h}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {block.rows?.map((row, j) => (
                  <tr key={j} className="border-b border-tenkai-border-light last:border-0">
                    {row.map((cell, k) => (
                      <td key={k} className="px-3 py-2 text-charcoal/80">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'keyword_link':
        return (
          <a
            key={i}
            href={block.href || `/rankings?keyword=${encodeURIComponent(block.keyword || '')}`}
            className="text-torii hover:text-torii-dark font-medium text-sm underline underline-offset-2 transition-colors duration-fast"
          >
            {block.keyword}
          </a>
        )
      case 'metric':
        return (
          <div key={i} className="inline-flex flex-col bg-cream rounded-tenkai p-3 mb-2 mr-2">
            <span className="text-xs text-warm-gray uppercase tracking-wider">{block.label}</span>
            <span className="font-serif text-lg text-charcoal font-semibold">{block.value}</span>
          </div>
        )
      case 'section_break':
        return <hr key={i} className="section-divider my-6" />
      default:
        return null
    }
  })
}

export function OutputViewer({ data, variant = 'modal', open, onClose, className }: OutputViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (variant === 'modal' && !open) return null

  const viewerContent = (
    <div className={cn(
      variant === 'modal'
        ? 'bg-ivory rounded-tenkai-lg shadow-tenkai-lg overflow-hidden flex flex-col'
        : 'bg-ivory rounded-tenkai border border-tenkai-border overflow-hidden',
      variant === 'modal' && (isFullscreen ? 'w-full h-full' : 'w-[80%] max-w-4xl max-h-[90vh]'),
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-tenkai-border bg-cream/50">
        <div className="flex items-center gap-3 min-w-0">
          {data.agent_kanji && (
            <div className="w-8 h-8 rounded-full bg-torii-subtle flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-serif text-torii">{data.agent_kanji}</span>
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-serif text-lg text-charcoal font-semibold truncate">{data.title}</h2>
            {data.agent_name && (
              <p className="text-xs text-warm-gray">
                Prepared by {data.agent_name}
                {data.deliverable_type && ` · ${data.deliverable_type.replace(/_/g, ' ')}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {variant === 'modal' && (
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-tenkai hover:bg-parchment transition-colors duration-fast"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="size-4 text-warm-gray" />
            </button>
          )}
          <button
            className="p-2 rounded-tenkai hover:bg-parchment transition-colors duration-fast"
            title="Download"
          >
            <Download className="size-4 text-warm-gray" />
          </button>
          {variant === 'modal' && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-tenkai hover:bg-parchment transition-colors duration-fast"
            >
              <X className="size-4 text-warm-gray" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {renderContent(data.content)}
      </div>
    </div>
  )

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
          {viewerContent}
        </div>
      </div>
    )
  }

  return viewerContent
}
