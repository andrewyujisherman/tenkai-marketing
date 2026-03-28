export interface SerpResult {
  title: string
  link: string
  snippet: string
  position: number
}

export interface SerpData {
  organic: SerpResult[]
  peopleAlsoAsk: string[]
  relatedSearches: string[]
  knowledgeGraph?: { title: string; type: string; description: string }
  aiOverview?: string
  error?: string
}

export interface CompetitorData {
  rankings: Array<{
    keyword: string
    position: number | null
    topCompetitors: Array<{ domain: string; position: number }>
  }>
  competitorDomains: string[]
  error?: string
}

async function serperFetch(query: string, options: { num?: number; gl?: string } = {}): Promise<Response> {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) throw new Error('SERPER_API_KEY not set')

  const body = JSON.stringify({
    q: query,
    num: options.num ?? 10,
    ...(options.gl ? { gl: options.gl } : {}),
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body,
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return res
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export async function searchSerp(query: string, options: { num?: number; gl?: string } = {}): Promise<SerpData> {
  try {
    const res = await serperFetch(query, options)

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return { organic: [], peopleAlsoAsk: [], relatedSearches: [], error: `Serper API error ${res.status}: ${text}` }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()

    const organic: SerpResult[] = (data.organic ?? []).map((r: { title?: string; link?: string; snippet?: string; position?: number }, i: number) => ({
      title: r.title ?? '',
      link: r.link ?? '',
      snippet: r.snippet ?? '',
      position: r.position ?? i + 1,
    }))

    const peopleAlsoAsk: string[] = (data.peopleAlsoAsk ?? []).map((q: { question?: string }) => q.question ?? '').filter(Boolean)

    const relatedSearches: string[] = (data.relatedSearches ?? []).map((s: { query?: string }) => s.query ?? '').filter(Boolean)

    let knowledgeGraph: SerpData['knowledgeGraph']
    if (data.knowledgeGraph) {
      knowledgeGraph = {
        title: data.knowledgeGraph.title ?? '',
        type: data.knowledgeGraph.type ?? '',
        description: data.knowledgeGraph.description ?? '',
      }
    }

    const aiOverview: string | undefined = data.answerBox?.answer ?? data.answerBox?.snippet ?? undefined

    return { organic, peopleAlsoAsk, relatedSearches, knowledgeGraph, aiOverview }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { organic: [], peopleAlsoAsk: [], relatedSearches: [], error: msg }
  }
}

export interface KeywordSerpEnrichment {
  keyword: string
  topResults: Array<{ position: number; title: string; link: string; snippet: string }>
  peopleAlsoAsk: string[]
  relatedSearches: string[]
  serpFeatures: string[]
  aiOverviewPresent: boolean
}

/**
 * Fetch real SERP data for a list of keywords.
 * Used to enrich keyword_research, content_brief, and content_article requests
 * with actual Google search results instead of "mental simulation."
 */
export async function fetchKeywordSerpData(keywords: string[], options: { gl?: string } = {}): Promise<KeywordSerpEnrichment[]> {
  const limitedKeywords = keywords.slice(0, 5) // Cap API calls
  const results: KeywordSerpEnrichment[] = []

  for (const keyword of limitedKeywords) {
    try {
      const serpData = await searchSerp(keyword, { num: 10, gl: options.gl })
      const serpFeatures: string[] = []
      if (serpData.knowledgeGraph) serpFeatures.push('knowledge_graph')
      if (serpData.aiOverview) serpFeatures.push('ai_overview')
      if (serpData.peopleAlsoAsk.length > 0) serpFeatures.push('people_also_ask')
      if (serpData.relatedSearches.length > 0) serpFeatures.push('related_searches')

      results.push({
        keyword,
        topResults: serpData.organic.slice(0, 5).map((r) => ({
          position: r.position,
          title: r.title,
          link: r.link,
          snippet: r.snippet,
        })),
        peopleAlsoAsk: serpData.peopleAlsoAsk.slice(0, 5),
        relatedSearches: serpData.relatedSearches.slice(0, 5),
        serpFeatures,
        aiOverviewPresent: !!serpData.aiOverview,
      })
    } catch {
      results.push({
        keyword,
        topResults: [],
        peopleAlsoAsk: [],
        relatedSearches: [],
        serpFeatures: [],
        aiOverviewPresent: false,
      })
    }
  }

  return results
}

export async function searchCompetitors(domain: string, keywords: string[]): Promise<CompetitorData> {
  const limitedKeywords = keywords.slice(0, 5)
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]

  try {
    const results = await Promise.all(
      limitedKeywords.map(async (keyword) => {
        const serpData = await searchSerp(keyword, { num: 10 })

        if (serpData.error) {
          return { keyword, position: null, topCompetitors: [] as Array<{ domain: string; position: number }> }
        }

        let position: number | null = null
        const competitors: Array<{ domain: string; position: number }> = []

        for (const result of serpData.organic) {
          const resultDomain = extractDomain(result.link)
          if (resultDomain === cleanDomain || resultDomain.includes(cleanDomain)) {
            position = result.position
          } else {
            competitors.push({ domain: resultDomain, position: result.position })
          }
        }

        return { keyword, position, topCompetitors: competitors.slice(0, 5) }
      })
    )

    const allCompetitorDomains = new Set<string>()
    for (const r of results) {
      for (const c of r.topCompetitors) {
        allCompetitorDomains.add(c.domain)
      }
    }

    return {
      rankings: results,
      competitorDomains: Array.from(allCompetitorDomains),
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { rankings: [], competitorDomains: [], error: msg }
  }
}
