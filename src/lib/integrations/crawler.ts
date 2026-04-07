// ============================================================
// Site Crawler — BFS crawl up to 100 pages
// Returns internal link graph, anchor text distribution,
// orphan pages, broken links, redirect chains
// Designed for Vercel serverless: 60s total budget
// ============================================================

export interface CrawledPage {
  url: string
  statusCode: number
  title: string
  metaDescription: string
  h1: string
  canonicalUrl: string | null
  responseTimeMs: number
  internalLinks: Array<{ href: string; anchorText: string }>
  externalLinks: Array<{ href: string; anchorText: string }>
  isRedirect: boolean
  redirectTarget: string | null
  error?: string
}

export interface AnchorTextDistribution {
  branded: number
  partialMatch: number
  exactMatch: number
  generic: number
  nakedUrl: number
  total: number
  brandedPct: number
  partialMatchPct: number
  exactMatchPct: number
  genericPct: number
  nakedUrlPct: number
  overOptimized: boolean
  alert: string | null
}

export interface CrawlResult {
  startUrl: string
  pagesFound: number
  pagesCrawled: number
  crawlDurationMs: number
  pages: CrawledPage[]
  linkGraph: Array<{ from: string; to: string; anchorText: string }>
  linkDepthMap: Record<string, number>
  orphanPages: string[]          // pages with 0 inbound internal links
  brokenLinks: Array<{ from: string; to: string; statusCode: number }>
  redirectChains: Array<{ from: string; chain: string[]; final: string }>
  inboundLinkCounts: Record<string, number>  // url → count of inbound internal links
  hubPages: Array<{ url: string; outboundLinks: number }>  // pages with most outbound internal links
  anchorTextDistribution: AnchorTextDistribution
  robotsBlocked: boolean
  error?: string
}

// Categorize anchor text
function categorizeAnchor(
  anchor: string,
  brandName: string,
  brandUrl: string,
): 'branded' | 'partial_match' | 'exact_match' | 'generic' | 'naked_url' {
  const a = anchor.trim().toLowerCase()
  if (!a || a === '') return 'generic'

  // Naked URL
  if (a.startsWith('http') || a.startsWith('www.') || a === brandUrl.toLowerCase()) {
    return 'naked_url'
  }

  // Generic
  const genericTerms = ['click here', 'read more', 'learn more', 'here', 'this', 'link', 'page', 'visit', 'see more', 'more', 'source', 'view', 'details', 'info', 'get started', 'sign up', 'buy now', 'shop now']
  if (genericTerms.some(t => a === t || a.includes(t))) return 'generic'

  // Branded
  const brandLower = brandName.toLowerCase()
  if (a === brandLower || a.includes(brandLower)) return 'branded'

  // Exact match — 1-3 words, looks like a keyword (simple heuristic)
  const words = a.split(/\s+/)
  if (words.length <= 3 && !a.includes(brandLower)) return 'exact_match'

  return 'partial_match'
}

function computeAnchorDistribution(
  anchors: Array<{ text: string; category: string }>,
): AnchorTextDistribution {
  const counts = { branded: 0, partialMatch: 0, exactMatch: 0, generic: 0, nakedUrl: 0 }
  for (const a of anchors) {
    if (a.category === 'branded') counts.branded++
    else if (a.category === 'partial_match') counts.partialMatch++
    else if (a.category === 'exact_match') counts.exactMatch++
    else if (a.category === 'naked_url') counts.nakedUrl++
    else counts.generic++
  }
  const total = anchors.length || 1
  const exactPct = Math.round((counts.exactMatch / total) * 100)
  const brandedPct = Math.round((counts.branded / total) * 100)
  const overOptimized = exactPct > 10

  let alert: string | null = null
  if (exactPct > 15) {
    alert = `CRITICAL: Exact match anchor text is ${exactPct}% of total — over-optimization penalty risk (SpamBrain). Should be <5%.`
  } else if (exactPct > 10) {
    alert = `WARNING: Exact match anchor text is ${exactPct}% — approaching over-optimization threshold. Target <5%.`
  } else if (brandedPct < 25) {
    alert = `WARNING: Branded anchor text is only ${brandedPct}% — healthy profiles have 35-45%. Looks unnatural.`
  }

  return {
    branded: counts.branded,
    partialMatch: counts.partialMatch,
    exactMatch: counts.exactMatch,
    generic: counts.generic,
    nakedUrl: counts.nakedUrl,
    total: anchors.length,
    brandedPct,
    partialMatchPct: Math.round((counts.partialMatch / total) * 100),
    exactMatchPct: exactPct,
    genericPct: Math.round((counts.generic / total) * 100),
    nakedUrlPct: Math.round((counts.nakedUrl / total) * 100),
    overOptimized,
    alert,
  }
}

// Parse robots.txt — return set of disallowed paths for the given user agent
async function parseRobots(baseUrl: string): Promise<Set<string>> {
  const disallowed = new Set<string>()
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).toString()
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 5_000)
    const res = await fetch(robotsUrl, { signal: ctrl.signal, headers: { 'User-Agent': 'TenkaiSEO/1.0' } })
    clearTimeout(t)
    if (!res.ok) return disallowed
    const text = await res.text()

    let inRelevantBlock = false
    for (const line of text.split('\n')) {
      const trimmed = line.trim()
      if (trimmed.toLowerCase().startsWith('user-agent:')) {
        const ua = trimmed.slice(11).trim()
        inRelevantBlock = ua === '*' || ua.toLowerCase().includes('tenkaiseo')
      } else if (inRelevantBlock && trimmed.toLowerCase().startsWith('disallow:')) {
        const path = trimmed.slice(9).trim()
        if (path) disallowed.add(path)
      }
    }
  } catch {
    // robots.txt unavailable — treat as no restrictions
  }
  return disallowed
}

function isDisallowed(pathname: string, disallowedPaths: Set<string>): boolean {
  for (const d of disallowedPaths) {
    if (pathname.startsWith(d)) return true
  }
  return false
}

// Extract links from HTML, returns [{href, anchorText}]
function extractLinks(html: string): Array<{ href: string; anchorText: string; raw: string }> {
  const links: Array<{ href: string; anchorText: string; raw: string }> = []
  const linkRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi
  const hrefRegex = /href=["']([^"']*)["']/i

  let match
  while ((match = linkRegex.exec(html)) !== null) {
    const tag = match[0]
    const innerHtml = match[1]
    const hrefMatch = hrefRegex.exec(tag)
    if (!hrefMatch) continue
    const rawHref = hrefMatch[1].trim()
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('javascript:')) continue
    const anchorText = innerHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100)
    links.push({ href: rawHref, anchorText, raw: rawHref })
  }
  return links
}

function resolveUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString()
  } catch {
    return null
  }
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    // Remove trailing slash, fragment, common tracking params
    u.hash = ''
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']
    for (const p of trackingParams) u.searchParams.delete(p)
    let href = u.toString()
    if (href.endsWith('/') && u.pathname !== '/') href = href.slice(0, -1)
    return href
  } catch {
    return url
  }
}

// Crawl with up to maxConcurrency parallel requests using a semaphore pattern
async function crawlPage(
  url: string,
  baseOrigin: string,
): Promise<CrawledPage> {
  const startMs = Date.now()
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 10_000)

    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'TenkaiSEO/1.0 (SEO Audit Bot; site-crawler)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    clearTimeout(t)

    const responseTimeMs = Date.now() - startMs
    const statusCode = res.status
    const isRedirect = res.redirected
    const redirectTarget = res.redirected ? res.url : null
    const contentType = res.headers.get('content-type') ?? ''

    if (!contentType.includes('text/html')) {
      return {
        url, statusCode, title: '', metaDescription: '', h1: '',
        canonicalUrl: null, responseTimeMs,
        internalLinks: [], externalLinks: [],
        isRedirect, redirectTarget,
      }
    }

    if (!res.ok) {
      return {
        url, statusCode, title: '', metaDescription: '', h1: '',
        canonicalUrl: null, responseTimeMs,
        internalLinks: [], externalLinks: [],
        isRedirect, redirectTarget,
        error: `HTTP ${statusCode}`,
      }
    }

    const html = await res.text()

    // Title
    const titleM = html.match(/<title[^>]*>(.*?)<\/title>/is)
    const title = titleM ? titleM[1].replace(/\s+/g, ' ').trim() : ''

    // Meta description
    const metaM = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/is)
      ?? html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/is)
    const metaDescription = metaM ? metaM[1].trim() : ''

    // H1
    const h1M = html.match(/<h1[^>]*>(.*?)<\/h1>/is)
    const h1 = h1M ? h1M[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : ''

    // Canonical
    const canonM = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)
      ?? html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i)
    const canonicalUrl = canonM ? canonM[1].trim() : null

    // Links
    const rawLinks = extractLinks(html)
    const internalLinks: Array<{ href: string; anchorText: string }> = []
    const externalLinks: Array<{ href: string; anchorText: string }> = []

    for (const { href, anchorText } of rawLinks) {
      const resolved = resolveUrl(href, url)
      if (!resolved) continue
      try {
        const resolvedOrigin = new URL(resolved).origin
        if (resolvedOrigin === baseOrigin) {
          internalLinks.push({ href: normalizeUrl(resolved), anchorText })
        } else {
          externalLinks.push({ href: resolved, anchorText })
        }
      } catch { /* skip malformed */ }
    }

    return {
      url: normalizeUrl(url),
      statusCode,
      title,
      metaDescription,
      h1,
      canonicalUrl,
      responseTimeMs,
      internalLinks,
      externalLinks,
      isRedirect,
      redirectTarget,
    }
  } catch (err) {
    return {
      url,
      statusCode: 0,
      title: '', metaDescription: '', h1: '',
      canonicalUrl: null,
      responseTimeMs: Date.now() - startMs,
      internalLinks: [], externalLinks: [],
      isRedirect: false, redirectTarget: null,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export async function crawlSite(startUrl: string): Promise<CrawlResult> {
  const crawlStart = Date.now()
  const MAX_PAGES = 100
  const MAX_CONCURRENCY = 5
  const TOTAL_TIMEOUT_MS = 55_000  // stay under Vercel's 60s limit

  let parsedBase: URL
  try {
    parsedBase = new URL(startUrl)
  } catch {
    return {
      startUrl, pagesFound: 0, pagesCrawled: 0, crawlDurationMs: 0,
      pages: [], linkGraph: [], linkDepthMap: {}, orphanPages: [],
      brokenLinks: [], redirectChains: [], inboundLinkCounts: {}, hubPages: [],
      anchorTextDistribution: computeAnchorDistribution([]),
      robotsBlocked: false, error: 'Invalid start URL',
    }
  }

  const baseOrigin = parsedBase.origin
  const brandName = parsedBase.hostname.replace(/^www\./, '').split('.')[0]

  // Fetch robots.txt
  const disallowedPaths = await parseRobots(baseOrigin)
  const normalizedStart = normalizeUrl(startUrl)
  const robotsBlocked = isDisallowed(parsedBase.pathname, disallowedPaths)

  const queue: Array<{ url: string; depth: number }> = [{ url: normalizedStart, depth: 0 }]
  const visited = new Set<string>([normalizedStart])
  const pages: CrawledPage[] = []
  const linkDepthMap: Record<string, number> = { [normalizedStart]: 0 }
  const linkGraph: Array<{ from: string; to: string; anchorText: string }> = []
  const inboundLinkCounts: Record<string, number> = {}
  const brokenLinks: Array<{ from: string; to: string; statusCode: number }> = []
  const redirectChains: Array<{ from: string; chain: string[]; final: string }> = []
  const allAnchorTexts: Array<{ text: string; category: string }> = []

  while (queue.length > 0 && pages.length < MAX_PAGES && (Date.now() - crawlStart) < TOTAL_TIMEOUT_MS) {
    // Take up to maxConcurrency items from queue
    const batch = queue.splice(0, MAX_CONCURRENCY)
    const results = await Promise.all(
      batch.map(({ url }) => {
        try {
          const pathname = new URL(url).pathname
          if (isDisallowed(pathname, disallowedPaths)) {
            return Promise.resolve(null)
          }
        } catch { /* continue */ }
        return crawlPage(url, baseOrigin)
      })
    )

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const { url: batchUrl, depth } = batch[i]
      if (!result) continue

      pages.push(result)

      // Track broken links
      if (result.statusCode >= 400 || result.error) {
        brokenLinks.push({ from: batchUrl, to: result.url, statusCode: result.statusCode })
      }

      // Track redirect chains
      if (result.isRedirect && result.redirectTarget) {
        redirectChains.push({ from: batchUrl, chain: [batchUrl], final: result.redirectTarget })
      }

      // Process internal links — add to queue and graph
      for (const link of result.internalLinks) {
        const normalized = normalizeUrl(link.href)

        // Update link graph
        linkGraph.push({ from: result.url, to: normalized, anchorText: link.anchorText })

        // Inbound count
        inboundLinkCounts[normalized] = (inboundLinkCounts[normalized] ?? 0) + 1

        // Anchor text classification
        const category = categorizeAnchor(link.anchorText, brandName, baseOrigin)
        allAnchorTexts.push({ text: link.anchorText, category })

        // BFS expansion
        if (!visited.has(normalized) && pages.length + queue.length < MAX_PAGES) {
          try {
            const linkPathname = new URL(normalized).pathname
            if (!isDisallowed(linkPathname, disallowedPaths)) {
              visited.add(normalized)
              const nextDepth = depth + 1
              linkDepthMap[normalized] = nextDepth
              queue.push({ url: normalized, depth: nextDepth })
            }
          } catch { /* skip malformed */ }
        }
      }

      // External link anchor text
      for (const link of result.externalLinks) {
        const category = categorizeAnchor(link.anchorText, brandName, baseOrigin)
        allAnchorTexts.push({ text: link.anchorText, category })
      }
    }
  }

  // Orphan pages: crawled pages with 0 inbound internal links (excluding start URL)
  const orphanPages = pages
    .filter(p => p.url !== normalizedStart && !inboundLinkCounts[p.url])
    .map(p => p.url)

  // Hub pages: top 10 by outbound internal links
  const hubPages = pages
    .map(p => ({ url: p.url, outboundLinks: p.internalLinks.length }))
    .sort((a, b) => b.outboundLinks - a.outboundLinks)
    .slice(0, 10)

  const anchorTextDistribution = computeAnchorDistribution(allAnchorTexts)

  return {
    startUrl,
    pagesFound: visited.size,
    pagesCrawled: pages.length,
    crawlDurationMs: Date.now() - crawlStart,
    pages,
    linkGraph,
    linkDepthMap,
    orphanPages,
    brokenLinks,
    redirectChains,
    inboundLinkCounts,
    hubPages,
    anchorTextDistribution,
    robotsBlocked,
  }
}
