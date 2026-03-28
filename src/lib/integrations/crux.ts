/**
 * Chrome User Experience Report (CrUX) API Integration
 * Provides REAL field data for Core Web Vitals at the 75th percentile.
 * This is the same data Google uses in its ranking algorithm — lab data alone
 * (PageSpeed Insights / Lighthouse) misses real user experience signals.
 *
 * CrUX API is free with a Google API key (same key as PageSpeed).
 * Docs: https://developer.chrome.com/docs/crux/api
 */

export interface CrUXMetric {
  p75: number
  good: number
  needsImprovement: number
  poor: number
  unit: string
}

export interface CrUXData {
  origin: string
  formFactor: 'ALL_FORM_FACTORS' | 'PHONE' | 'DESKTOP'
  lcp: CrUXMetric | null
  inp: CrUXMetric | null
  cls: CrUXMetric | null
  ttfb: CrUXMetric | null
  fcp: CrUXMetric | null
  overallCategory: 'fast' | 'average' | 'slow' | 'unknown'
  collectionPeriod?: { firstDate: string; lastDate: string }
  error?: string
}

type CWVStatus = 'good' | 'needs_improvement' | 'poor'

function classifyLCP(ms: number): CWVStatus {
  if (ms <= 2500) return 'good'
  if (ms <= 4000) return 'needs_improvement'
  return 'poor'
}

function classifyINP(ms: number): CWVStatus {
  if (ms <= 200) return 'good'
  if (ms <= 500) return 'needs_improvement'
  return 'poor'
}

function classifyCLS(value: number): CWVStatus {
  if (value <= 0.1) return 'good'
  if (value <= 0.25) return 'needs_improvement'
  return 'poor'
}

function determineOverall(lcp: CrUXMetric | null, inp: CrUXMetric | null, cls: CrUXMetric | null): CrUXData['overallCategory'] {
  if (!lcp && !inp && !cls) return 'unknown'

  const statuses: CWVStatus[] = []
  if (lcp) statuses.push(classifyLCP(lcp.p75))
  if (inp) statuses.push(classifyINP(inp.p75))
  if (cls) statuses.push(classifyCLS(cls.p75))

  if (statuses.every((s) => s === 'good')) return 'fast'
  if (statuses.some((s) => s === 'poor')) return 'slow'
  return 'average'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseMetric(record: any, metricKey: string, unit: string): CrUXMetric | null {
  const metric = record?.metrics?.[metricKey]
  if (!metric) return null

  const histogram = metric.histogram ?? []
  const p75 = metric.percentiles?.p75 ?? 0

  return {
    p75: typeof p75 === 'number' ? p75 : parseFloat(p75),
    good: (histogram[0]?.density ?? 0) * 100,
    needsImprovement: (histogram[1]?.density ?? 0) * 100,
    poor: (histogram[2]?.density ?? 0) * 100,
    unit,
  }
}

/**
 * Fetch CrUX field data for an origin (domain-level).
 * Falls back gracefully — many small sites won't have CrUX data.
 */
export async function fetchCrUXData(url: string): Promise<CrUXData> {
  const apiKey = process.env.PAGESPEED_API_KEY // Same key works for CrUX
  if (!apiKey) {
    return {
      origin: url,
      formFactor: 'ALL_FORM_FACTORS',
      lcp: null, inp: null, cls: null, ttfb: null, fcp: null,
      overallCategory: 'unknown',
      error: 'No API key configured (PAGESPEED_API_KEY)',
    }
  }

  let origin: string
  try {
    const parsed = new URL(url)
    origin = `${parsed.protocol}//${parsed.hostname}`
  } catch {
    origin = url
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(
      `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          formFactor: 'ALL_FORM_FACTORS',
        }),
        signal: controller.signal,
      }
    )
    clearTimeout(timeout)

    if (!res.ok) {
      // 404 means no CrUX data for this origin — not an error per se
      if (res.status === 404) {
        return {
          origin,
          formFactor: 'ALL_FORM_FACTORS',
          lcp: null, inp: null, cls: null, ttfb: null, fcp: null,
          overallCategory: 'unknown',
          error: 'No CrUX data available for this origin (site may be too small or too new)',
        }
      }
      const text = await res.text().catch(() => res.statusText)
      return {
        origin,
        formFactor: 'ALL_FORM_FACTORS',
        lcp: null, inp: null, cls: null, ttfb: null, fcp: null,
        overallCategory: 'unknown',
        error: `CrUX API error ${res.status}: ${text}`,
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()
    const record = data.record

    const lcp = parseMetric(record, 'largest_contentful_paint', 'ms')
    const inp = parseMetric(record, 'interaction_to_next_paint', 'ms')
    const cls = parseMetric(record, 'cumulative_layout_shift', 'unitless')
    const ttfb = parseMetric(record, 'experimental_time_to_first_byte', 'ms')
    const fcp = parseMetric(record, 'first_contentful_paint', 'ms')

    let collectionPeriod: CrUXData['collectionPeriod']
    if (record?.collectionPeriod) {
      const first = record.collectionPeriod.firstDate
      const last = record.collectionPeriod.lastDate
      if (first && last) {
        collectionPeriod = {
          firstDate: `${first.year}-${String(first.month).padStart(2, '0')}-${String(first.day).padStart(2, '0')}`,
          lastDate: `${last.year}-${String(last.month).padStart(2, '0')}-${String(last.day).padStart(2, '0')}`,
        }
      }
    }

    return {
      origin,
      formFactor: 'ALL_FORM_FACTORS',
      lcp, inp, cls, ttfb, fcp,
      overallCategory: determineOverall(lcp, inp, cls),
      collectionPeriod,
    }
  } catch (err) {
    clearTimeout(timeout)
    const msg = err instanceof Error ? err.message : String(err)
    return {
      origin,
      formFactor: 'ALL_FORM_FACTORS',
      lcp: null, inp: null, cls: null, ttfb: null, fcp: null,
      overallCategory: 'unknown',
      error: msg,
    }
  }
}
