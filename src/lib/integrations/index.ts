export * from './pagespeed'
export * from './serper'
export * from './crux'
export * from './google-search-console'
export * from './google-analytics'
export * from './crawler'

import { fetchPageSpeed, PageSpeedData } from './pagespeed'
import { searchSerp, SerpData, KeywordSerpEnrichment } from './serper'
import { fetchCrUXData, CrUXData } from './crux'
import { fetchGSCData, GSCData } from './google-search-console'
import { fetchGA4Data, GA4Data } from './google-analytics'

export type { KeywordSerpEnrichment }

export interface SiteData {
  pageSpeed: PageSpeedData
  serp: SerpData
  crux: CrUXData | null
  gsc: GSCData | null
  ga4: GA4Data | null
  fetchedAt: string
}

export async function fetchAllSiteData(
  url: string,
  options?: {
    gscSiteUrl?: string
    ga4PropertyId?: string
    serpQuery?: string
    clientId?: string
  }
): Promise<SiteData> {
  const hostname = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  })()

  const serpQuery = options?.serpQuery ?? hostname

  const [pageSpeed, serp, crux, gsc, ga4] = await Promise.all([
    fetchPageSpeed(url),
    searchSerp(serpQuery),
    fetchCrUXData(url).catch(() => null),
    options?.gscSiteUrl ? fetchGSCData(options.gscSiteUrl, { clientId: options.clientId }) : Promise.resolve(null),
    options?.ga4PropertyId ? fetchGA4Data(options.ga4PropertyId, { clientId: options.clientId }) : Promise.resolve(null),
  ])

  return {
    pageSpeed,
    serp,
    crux,
    gsc,
    ga4,
    fetchedAt: new Date().toISOString(),
  }
}
