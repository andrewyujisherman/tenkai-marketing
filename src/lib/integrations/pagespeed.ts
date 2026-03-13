export interface PageSpeedData {
  performanceScore: number
  cwv: {
    lcp: { value: string; score: 'good' | 'needs_improvement' | 'poor' }
    fid: { value: string; score: 'good' | 'needs_improvement' | 'poor' }
    cls: { value: string; score: 'good' | 'needs_improvement' | 'poor' }
    inp: { value: string; score: 'good' | 'needs_improvement' | 'poor' } | null
    ttfb: { value: string; score: 'good' | 'needs_improvement' | 'poor' }
  }
  opportunities: Array<{ title: string; description: string; savings: string }>
  diagnostics: Array<{ title: string; description: string }>
  error?: string
}

type AuditScore = 'good' | 'needs_improvement' | 'poor'

function scoreFromAudit(audit: { score: number | null }): AuditScore {
  if (audit.score === null) return 'poor'
  if (audit.score >= 0.9) return 'good'
  if (audit.score >= 0.5) return 'needs_improvement'
  return 'poor'
}

function displayValue(audit: { displayValue?: string; numericValue?: number } | undefined): string {
  if (!audit) return 'N/A'
  if (audit.displayValue) return audit.displayValue
  if (audit.numericValue !== undefined) return String(Math.round(audit.numericValue))
  return 'N/A'
}

export async function fetchPageSpeed(url: string): Promise<PageSpeedData> {
  const apiKey = process.env.PAGESPEED_API_KEY
  if (!apiKey) {
    return { performanceScore: 0, cwv: { lcp: { value: 'N/A', score: 'poor' }, fid: { value: 'N/A', score: 'poor' }, cls: { value: 'N/A', score: 'poor' }, inp: null, ttfb: { value: 'N/A', score: 'poor' } }, opportunities: [], diagnostics: [], error: 'PAGESPEED_API_KEY not set' }
  }

  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  endpoint.searchParams.set('url', url)
  endpoint.searchParams.set('strategy', 'mobile')
  endpoint.searchParams.set('key', apiKey)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    const res = await fetch(endpoint.toString(), { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return { performanceScore: 0, cwv: { lcp: { value: 'N/A', score: 'poor' }, fid: { value: 'N/A', score: 'poor' }, cls: { value: 'N/A', score: 'poor' }, inp: null, ttfb: { value: 'N/A', score: 'poor' } }, opportunities: [], diagnostics: [], error: `PageSpeed API error ${res.status}: ${text}` }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()
    const lr = data.lighthouseResult

    if (!lr) {
      return { performanceScore: 0, cwv: { lcp: { value: 'N/A', score: 'poor' }, fid: { value: 'N/A', score: 'poor' }, cls: { value: 'N/A', score: 'poor' }, inp: null, ttfb: { value: 'N/A', score: 'poor' } }, opportunities: [], diagnostics: [], error: 'No lighthouseResult in response' }
    }

    const perfScore = Math.round((lr.categories?.performance?.score ?? 0) * 100)
    const audits = lr.audits ?? {}

    const lcpAudit = audits['largest-contentful-paint']
    const fidAudit = audits['max-potential-fid'] ?? audits['total-blocking-time']
    const clsAudit = audits['cumulative-layout-shift']
    const inpAudit = audits['interaction-to-next-paint'] ?? null
    const ttfbAudit = audits['server-response-time']

    const opportunities: PageSpeedData['opportunities'] = []
    const diagnostics: PageSpeedData['diagnostics'] = []

    for (const audit of Object.values(audits) as { details?: { type?: string }; title?: string; description?: string; displayValue?: string; score?: number | null }[]) {
      if (!audit.title) continue
      if (audit.details?.type === 'opportunity') {
        opportunities.push({
          title: audit.title,
          description: audit.description ?? '',
          savings: audit.displayValue ?? '',
        })
      } else if (
        audit.score !== null &&
        audit.score !== undefined &&
        audit.score < 0.9 &&
        audit.details?.type === 'table'
      ) {
        diagnostics.push({
          title: audit.title,
          description: audit.description ?? '',
        })
      }
    }

    return {
      performanceScore: perfScore,
      cwv: {
        lcp: { value: displayValue(lcpAudit), score: lcpAudit ? scoreFromAudit(lcpAudit) : 'poor' },
        fid: { value: displayValue(fidAudit), score: fidAudit ? scoreFromAudit(fidAudit) : 'poor' },
        cls: { value: displayValue(clsAudit), score: clsAudit ? scoreFromAudit(clsAudit) : 'poor' },
        inp: inpAudit ? { value: displayValue(inpAudit), score: scoreFromAudit(inpAudit) } : null,
        ttfb: { value: displayValue(ttfbAudit), score: ttfbAudit ? scoreFromAudit(ttfbAudit) : 'poor' },
      },
      opportunities: opportunities.slice(0, 10),
      diagnostics: diagnostics.slice(0, 10),
    }
  } catch (err) {
    clearTimeout(timeout)
    const msg = err instanceof Error ? err.message : String(err)
    return { performanceScore: 0, cwv: { lcp: { value: 'N/A', score: 'poor' }, fid: { value: 'N/A', score: 'poor' }, cls: { value: 'N/A', score: 'poor' }, inp: null, ttfb: { value: 'N/A', score: 'poor' } }, opportunities: [], diagnostics: [], error: msg }
  }
}
