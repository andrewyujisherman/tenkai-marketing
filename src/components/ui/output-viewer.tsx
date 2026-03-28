'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { X, Maximize2, Download, FileDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

const MARKDOWN_PATTERN = /^#{1,3}\s|^\*\s|^\d+\.\s|\*\*[^*]+\*\*|`[^`]+`/m

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

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
  content: OutputContent[] | string | Record<string, unknown>
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

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function formatKey(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function KeywordLink({ keyword }: { keyword: string }) {
  return (
    <Link
      href={`/rankings?keyword=${encodeURIComponent(keyword)}`}
      className="text-torii hover:text-torii-dark font-medium underline underline-offset-2 transition-colors"
    >
      {keyword}
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════════════
   REPORT-STYLE RENDERERS (matches mockup report-content)
   ═══════════════════════════════════════════════════════════════ */

function ReportHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-8 pb-6 border-b border-tenkai-border">
      <p className="text-torii text-xs font-semibold tracking-[2px] uppercase mb-2">Tenkai SEO</p>
      <h2 className="font-serif text-xl text-charcoal font-semibold">{title}</h2>
      {subtitle && <p className="text-warm-gray text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

function ReportSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="font-serif text-base text-charcoal font-semibold mb-3">{heading}</h3>
      {children}
    </div>
  )
}

function ReportParagraph({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-[1.8] text-[#444] mb-3">{children}</p>
}

function renderAuditReport(data: Record<string, unknown>, title: string): React.ReactNode {
  const categories = data.categories as Record<string, { score: number; issues?: Array<{ title: string; severity: string; description: string }> }> | undefined
  if (!categories) return renderGenericAsReport(data, title)

  const overallScore = Object.values(categories).reduce((sum, c) => sum + (c.score ?? 0), 0) / Object.keys(categories).length

  return (
    <div className="report-content max-w-[800px] mx-auto">
      <ReportHeader title={title} />

      <ReportSection heading="Executive Summary">
        <ReportParagraph>
          Your site scored an average of <strong>{Math.round(overallScore)}/100</strong> across{' '}
          {Object.keys(categories).length} categories. Below is a breakdown of each area with specific issues
          identified and their severity.
        </ReportParagraph>
      </ReportSection>

      {Object.entries(categories).map(([catKey, cat]) => (
        <ReportSection key={catKey} heading={`${formatKey(catKey)} — ${cat.score}/100`}>
          {cat.issues && cat.issues.length > 0 ? (
            <div className="space-y-3">
              {cat.issues.map((issue, i) => (
                <div key={i} className="pl-4 border-l-2 border-tenkai-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase',
                      issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    )}>
                      {issue.severity}
                    </span>
                    <span className="text-sm font-medium text-charcoal">{issue.title}</span>
                  </div>
                  <p className="text-sm text-[#444] leading-relaxed">{issue.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <ReportParagraph>No issues found in this category.</ReportParagraph>
          )}
        </ReportSection>
      ))}
    </div>
  )
}

function renderKeywordList(data: Record<string, unknown>, title: string): React.ReactNode {
  const allKeywords: Array<{ keyword: string; volume: string; why_now?: string; category?: string }> = []
  for (const [groupKey, groupVal] of Object.entries(data)) {
    if (Array.isArray(groupVal)) {
      groupVal.forEach((item) => {
        if (item && typeof item === 'object' && ('keyword' in item || 'term' in item)) {
          allKeywords.push({
            keyword: String((item as Record<string, unknown>).keyword ?? (item as Record<string, unknown>).term ?? ''),
            volume: String((item as Record<string, unknown>).volume ?? (item as Record<string, unknown>).search_volume ?? '—'),
            why_now: (item as Record<string, unknown>).why_now as string | undefined,
            category: groupKey,
          })
        }
      })
    }
  }

  if (allKeywords.length === 0) return renderGenericAsReport(data, title)

  // Group by category
  const groups = new Map<string, typeof allKeywords>()
  allKeywords.forEach((kw) => {
    const cat = kw.category ?? 'Keywords'
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(kw)
  })

  return (
    <div className="report-content max-w-[800px] mx-auto">
      <ReportHeader title={title} />

      <ReportSection heading="Overview">
        <ReportParagraph>
          We identified <strong>{allKeywords.length} keywords</strong> across {groups.size} categories
          that represent the best opportunities for your business. Here&apos;s what we recommend targeting and why.
        </ReportParagraph>
      </ReportSection>

      {Array.from(groups.entries()).map(([cat, keywords]) => (
        <ReportSection key={cat} heading={formatKey(cat)}>
          <div className="overflow-x-auto rounded-tenkai border border-tenkai-border mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream">
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Keyword</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Volume</th>
                  <th className="px-4 py-2.5 text-left font-medium text-charcoal border-b border-tenkai-border">Why This Matters</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw, i) => (
                  <tr key={i} className="border-b border-tenkai-border last:border-0 hover:bg-cream/40 transition-colors">
                    <td className="px-4 py-2.5">
                      <KeywordLink keyword={kw.keyword} />
                    </td>
                    <td className="px-4 py-2.5 text-charcoal/70">{kw.volume}</td>
                    <td className="px-4 py-2.5 text-[#444] leading-relaxed">{kw.why_now ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      ))}
    </div>
  )
}

function renderContentDraftOrArticle(data: Record<string, unknown>, title: string): React.ReactNode {
  const meta = (data.meta ?? data.brief ?? {}) as Record<string, unknown>
  const body = data.body ?? data.content ?? data.sections ?? null
  const metaTitle = meta.meta_title ?? meta.title ?? title
  const targetKw = meta.target_keyword ?? meta.keyword ?? null

  return (
    <div className="report-content max-w-[800px] mx-auto">
      <ReportHeader title={String(metaTitle)} subtitle={targetKw ? `Target keyword: ${targetKw}` : undefined} />

      {/* Brief metadata as clean labeled fields */}
      {Object.keys(meta).length > 0 && (
        <ReportSection heading="Content Brief">
          <div className="bg-cream/40 rounded-tenkai border border-tenkai-border p-4 mb-4">
            {Object.entries(meta).map(([k, v]) => (
              <div key={k} className="flex gap-3 py-1.5 border-b border-tenkai-border/50 last:border-0">
                <span className="text-xs font-medium text-warm-gray uppercase tracking-wide w-32 flex-shrink-0 pt-0.5">{formatKey(k)}</span>
                <span className="text-sm text-charcoal/80">{String(v ?? '—')}</span>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Article body */}
      {body != null && (
        <div>
          {typeof body === 'string' ? (
            MARKDOWN_PATTERN.test(body) ? (
              <div className="prose prose-sm max-w-none text-[#444] [&>h1]:font-serif [&>h2]:font-serif [&>h3]:font-serif [&>h1]:text-charcoal [&>h2]:text-charcoal [&>h3]:text-charcoal [&>p]:leading-[1.8] [&>p]:mb-3">
                <ReactMarkdown>{body}</ReactMarkdown>
              </div>
            ) : (
              body.split('\n\n').map((p, i) => <ReportParagraph key={i}>{p}</ReportParagraph>)
            )
          ) : Array.isArray(body) ? (
            body.map((section, i) => {
              if (typeof section === 'string') return <ReportParagraph key={i}>{section}</ReportParagraph>
              const s = section as Record<string, unknown>
              const heading = s.heading ?? s.title ?? s.section_title
              const bodyContent = s.content ?? s.body ?? s.text
              return (
                <ReportSection key={i} heading={heading ? String(heading) : `Section ${i + 1}`}>
                  {typeof bodyContent === 'string' ? (
                    MARKDOWN_PATTERN.test(bodyContent) ? (
                      <div className="prose prose-sm max-w-none text-[#444] [&>p]:leading-[1.8] [&>p]:mb-3">
                        <ReactMarkdown>{bodyContent}</ReactMarkdown>
                      </div>
                    ) : (
                      bodyContent.split('\n\n').map((p, j) => <ReportParagraph key={j}>{p}</ReportParagraph>)
                    )
                  ) : bodyContent != null ? (
                    <ReportParagraph>{String(bodyContent)}</ReportParagraph>
                  ) : null}
                </ReportSection>
              )
            })
          ) : (
            <div className="space-y-2">
              {Object.entries(body as Record<string, unknown>).map(([k, v]) => (
                <ReportSection key={k} heading={formatKey(k)}>
                  <ReportParagraph>{typeof v === 'string' ? v : JSON.stringify(v)}</ReportParagraph>
                </ReportSection>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function renderGenericAsReport(data: Record<string, unknown>, title: string): React.ReactNode {
  return (
    <div className="report-content max-w-[800px] mx-auto">
      <ReportHeader title={title} />
      {Object.entries(data).map(([key, val]) => (
        <ReportSection key={key} heading={formatKey(key)}>
          {renderValueAsText(val)}
        </ReportSection>
      ))}
    </div>
  )
}

function renderValueAsText(value: unknown, depth = 0): React.ReactNode {
  if (value === null || value === undefined) return <span className="text-warm-gray italic">—</span>
  if (typeof value === 'boolean') return <ReportParagraph>{value ? 'Yes' : 'No'}</ReportParagraph>
  if (typeof value === 'number') return <ReportParagraph><strong>{value}</strong></ReportParagraph>
  if (typeof value === 'string') return <ReportParagraph>{value}</ReportParagraph>

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-warm-gray italic text-sm">None</span>
    if (value.every((v) => typeof v !== 'object' || v === null)) {
      return (
        <ul className="list-disc list-inside space-y-1 mb-3">
          {value.map((item, i) => (
            <li key={i} className="text-sm text-[#444] leading-relaxed">{String(item)}</li>
          ))}
        </ul>
      )
    }
    return (
      <div className="space-y-3">
        {value.map((item, i) => (
          <div key={i} className="pl-4 border-l-2 border-tenkai-border">
            {typeof item === 'object' && item !== null
              ? Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                  <div key={k} className="mb-1">
                    <span className="text-xs font-medium text-warm-gray uppercase">{formatKey(k)}: </span>
                    <span className="text-sm text-[#444]">{typeof v === 'string' || typeof v === 'number' ? String(v) : JSON.stringify(v)}</span>
                  </div>
                ))
              : <span className="text-sm text-[#444]">{String(item)}</span>
            }
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === 'object') {
    return (
      <div className={cn('space-y-2', depth > 0 && 'ml-4')}>
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k}>
            <span className="text-xs font-medium text-warm-gray uppercase tracking-wide">{formatKey(k)}</span>
            <div className="mt-0.5">{renderValueAsText(v, depth + 1)}</div>
          </div>
        ))}
      </div>
    )
  }

  return <ReportParagraph>{String(value)}</ReportParagraph>
}

/* ═══════════════════════════════════════════════════════════════
   MAIN RENDERER
   ═══════════════════════════════════════════════════════════════ */

function renderJsonContent(data: Record<string, unknown>, title: string, deliverableType?: string): React.ReactNode {
  const type = (deliverableType ?? '').toLowerCase()
  if (type.includes('audit_report') || type.includes('audit')) return renderAuditReport(data, title)
  if (type.includes('keyword')) return renderKeywordList(data, title)
  if (type.includes('article') || type.includes('content_draft') || type.includes('content_brief')) return renderContentDraftOrArticle(data, title)

  // Heuristic detection
  if ('categories' in data && typeof data.categories === 'object') return renderAuditReport(data, title)
  if ('quick_wins' in data || 'long_tail' in data || 'branded' in data) return renderKeywordList(data, title)
  if ('brief' in data || 'meta' in data) return renderContentDraftOrArticle(data, title)

  return renderGenericAsReport(data, title)
}

function renderContent(content: OutputContent[] | string | Record<string, unknown>, title: string, deliverableType?: string): React.ReactNode {
  if (content !== null && typeof content === 'object' && !Array.isArray(content)) {
    return renderJsonContent(content as Record<string, unknown>, title, deliverableType)
  }

  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && typeof parsed[0] === 'object' && 'type' in parsed[0]) {
          return renderContentArray(parsed as OutputContent[])
        }
        return renderJsonContent({ items: parsed }, title, deliverableType)
      }
      if (typeof parsed === 'object' && parsed !== null) {
        return renderJsonContent(parsed as Record<string, unknown>, title, deliverableType)
      }
    } catch {
      // Markdown or plain text
      if (MARKDOWN_PATTERN.test(content)) {
        return (
          <div className="report-content max-w-[800px] mx-auto">
            <ReportHeader title={title} />
            <div className="prose prose-sm max-w-none text-[#444] [&>h1]:font-serif [&>h2]:font-serif [&>h3]:font-serif [&>h1]:text-charcoal [&>h2]:text-charcoal [&>h3]:text-charcoal [&>p]:leading-[1.8] [&>p]:mb-3">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )
      }
      return (
        <div className="report-content max-w-[800px] mx-auto">
          <ReportHeader title={title} />
          {content.split('\n\n').map((block, i) => (
            <ReportParagraph key={i}>{block}</ReportParagraph>
          ))}
        </div>
      )
    }
    return <ReportParagraph>{content}</ReportParagraph>
  }

  if (Array.isArray(content)) return renderContentArray(content as OutputContent[])

  return null
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
        return <ReportParagraph key={i}>{block.text}</ReportParagraph>
      case 'list':
        return (
          <ul key={i} className="list-disc list-inside mb-3 space-y-1">
            {block.items?.map((item, j) => (
              <li key={j} className="text-sm text-[#444] leading-relaxed">{item}</li>
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
                  <tr key={j} className="border-b border-tenkai-border last:border-0">
                    {row.map((cell, k) => (
                      <td key={k} className="px-3 py-2 text-[#444]">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'keyword_link':
        return <KeywordLink key={i} keyword={block.keyword ?? ''} />
      case 'metric':
        return (
          <div key={i} className="inline-flex flex-col bg-cream rounded-tenkai p-3 mb-2 mr-2">
            <span className="text-xs text-warm-gray uppercase tracking-wider">{block.label}</span>
            <span className="font-serif text-lg text-charcoal font-semibold">{block.value}</span>
          </div>
        )
      case 'section_break':
        return <hr key={i} className="border-tenkai-border my-6" />
      default:
        return null
    }
  })
}

/* ═══════════════════════════════════════════════════════════════
   DOWNLOAD HELPERS
   ═══════════════════════════════════════════════════════════════ */

function generatePlainText(data: OutputData): string {
  const lines: string[] = [data.title, '='.repeat(data.title.length), '']

  function flatten(val: unknown, indent = 0): string {
    const pad = '  '.repeat(indent)
    if (val === null || val === undefined) return `${pad}—`
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return `${pad}${val}`
    if (Array.isArray(val)) return val.map((v) => flatten(v, indent)).join('\n')
    if (typeof val === 'object') {
      return Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => `${pad}${formatKey(k)}:\n${flatten(v, indent + 1)}`)
        .join('\n')
    }
    return `${pad}${String(val)}`
  }

  const content = data.content
  if (typeof content === 'string') {
    lines.push(content)
  } else if (Array.isArray(content)) {
    content.forEach((block) => {
      const b = block as OutputContent
      if (b.type === 'heading') lines.push(`\n## ${b.text}`)
      else if (b.type === 'paragraph') lines.push(b.text ?? '')
      else if (b.type === 'list') b.items?.forEach((item) => lines.push(`• ${item}`))
    })
  } else if (content && typeof content === 'object') {
    lines.push(flatten(content))
  }

  return lines.join('\n')
}

function hasCodeContent(data: OutputData): boolean {
  const type = (data.deliverable_type ?? '').toLowerCase()
  return type.includes('article') || type.includes('content_draft') || type.includes('schema')
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function OutputViewer({ data, variant = 'modal', open, onClose, className }: OutputViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (variant === 'modal' && !open) return null

  function handleDownload() {
    const text = generatePlainText(data)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.title.replace(/\s+/g, '-').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadCode() {
    const content = data.content
    let htmlBody = ''
    if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
      const c = content as Record<string, unknown>
      const body = c.body ?? c.content ?? c.sections
      if (typeof body === 'string') htmlBody = body
      else if (Array.isArray(body)) {
        htmlBody = body.map((s) => {
          if (typeof s === 'string') return `<p>${s}</p>`
          const sec = s as Record<string, unknown>
          const h = sec.heading ?? sec.title ?? ''
          const b = sec.content ?? sec.body ?? sec.text ?? ''
          return `${h ? `<h2>${h}</h2>` : ''}${b ? `<p>${b}</p>` : ''}`
        }).join('\n')
      }
    } else if (typeof content === 'string') {
      htmlBody = content
    }
    if (!htmlBody) return

    const meta = typeof content === 'object' && content !== null && !Array.isArray(content)
      ? ((content as Record<string, unknown>).meta as Record<string, unknown>) ?? {}
      : {}
    const metaTitle = meta.meta_title ?? data.title
    const metaDesc = meta.meta_description ?? ''

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metaTitle}</title>
  ${metaDesc ? `<meta name="description" content="${metaDesc}">` : ''}
</head>
<body>
  <article>
    <h1>${metaTitle}</h1>
    ${htmlBody}
  </article>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.title.replace(/\s+/g, '-').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const showCodeDownload = hasCodeContent(data)

  const viewerContent = (
    <div className={cn(
      variant === 'modal'
        ? 'bg-ivory rounded-tenkai-lg shadow-tenkai-lg overflow-hidden flex flex-col'
        : 'bg-ivory rounded-tenkai border border-tenkai-border overflow-hidden',
      variant === 'modal' && (isFullscreen ? 'w-full h-full' : 'w-[80%] max-w-4xl max-h-[90vh]'),
      className
    )}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-tenkai-border bg-cream/50">
        <div className="flex items-center gap-3 min-w-0">
          {data.agent_kanji && (
            <div className="w-8 h-8 rounded-full bg-torii-subtle flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-serif text-torii">{data.agent_kanji}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-charcoal truncate">{data.title}</p>
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
              className="p-2 rounded-tenkai hover:bg-parchment transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="size-4 text-warm-gray" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-2 rounded-tenkai hover:bg-parchment transition-colors"
            title="Download as text"
          >
            <Download className="size-4 text-warm-gray" />
          </button>
          {showCodeDownload && (
            <button
              onClick={handleDownloadCode}
              className="p-2 rounded-tenkai hover:bg-parchment transition-colors"
              title="Download HTML for website"
            >
              <FileDown className="size-4 text-warm-gray" />
            </button>
          )}
          {variant === 'modal' && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-tenkai hover:bg-parchment transition-colors"
            >
              <X className="size-4 text-warm-gray" />
            </button>
          )}
        </div>
      </div>

      {/* Report body */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {renderContent(data.content, data.title, data.deliverable_type)}
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
