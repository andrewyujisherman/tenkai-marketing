# Reference File HOW Audit

Audited: 2026-03-31
Scope: All 28 SEO reference files in `seo-reference/`
Method: Every instruction that says the agent should "check", "pull", "query", "analyze", "fetch", or "verify" was traced to a code path in `src/lib/`.

## Summary

- **REAL** (wired and working): 47 instructions
- **AVAILABLE** (code exists, needs wiring): 12 instructions
- **GAP** (no code, needs building): 31 instructions

---

## File-by-File

### technical-seo/site-audit.md
Request type: `site_audit` — gets: scrape + fetchAllSiteData (PageSpeed, Serper, CrUX, GSC, GA4) + crawlSite

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Run BFS crawler | REAL | `crawlSite()` in `crawler.ts`, called for `site_audit` via `CRAWL_REQUESTS` set |
| Pull PageSpeed Insights data | REAL | `fetchPageSpeed()` via `fetchAllSiteData()`, called for all URL_BASED_REQUESTS |
| Pull CrUX field data | REAL | `fetchCrUXData()` via `fetchAllSiteData()`, called for all URL_BASED_REQUESTS |
| Pull search visibility via Serper | REAL | `searchSerp()` via `fetchAllSiteData()`, called for all URL_BASED_REQUESTS |
| Pull GSC index coverage | REAL | `fetchGSCData()` via `fetchAllSiteData()` when client has OAuth |
| Pull GA4 bounce rate/session data | REAL | `fetchGA4Data()` via `fetchAllSiteData()` when client has GA4 property ID |
| Check structured data on pages | REAL | `crawlSite()` returns page HTML; scraper returns raw HTML for parsing |
| Check security headers (HTTPS, HSTS, CSP) | GAP | No response header extraction in crawler or scraper — both fetch HTML body only, don't capture/return response headers |

### technical-seo/technical-audit.md
Request type: `technical_audit` — gets: scrape + fetchAllSiteData + crawlSite

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Analyze URL architecture from crawl data | REAL | `crawlSite()` returns full URL list, link graph, pages with status codes |
| Audit robots.txt | REAL | `crawlSite()` calls `parseRobots()` internally; scraper can fetch `/robots.txt` directly |
| Validate XML sitemaps | GAP | No sitemap parser exists. Crawler checks robots.txt for Sitemap: directive but doesn't fetch/validate sitemap contents |
| Assess server response patterns (TTFB, HTTP/2, compression) | AVAILABLE | `fetchPageSpeed()` returns TTFB data; raw HTTP/2 and compression headers are NOT captured by scraper/crawler |
| JavaScript rendering assessment (raw HTML vs rendered DOM) | GAP | Scraper fetches raw HTML only. No headless browser or Puppeteer integration to compare rendered vs raw |
| Check hreflang tags | AVAILABLE | Scraper returns raw HTML which contains hreflang, but no dedicated parser extracts it |
| Log file analysis | GAP | No server log ingestion capability. Reference correctly notes this requires client-provided logs |

### technical-seo/on-page-audit.md
Request type: `on_page_audit` — gets: scrape + fetchAllSiteData (no crawl)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Pull on-page elements (title, meta, headings, images) | REAL | `scrapeUrl()` extracts title, meta description, headings, body text. `crawlSite()` extracts title, metaDescription, h1, canonical, links |
| Audit title tags against SERP competitors | REAL | `searchSerp()` via `fetchAllSiteData()` returns competitor titles. Serper data is available |
| Assess internal linking per page | AVAILABLE | `crawlSite()` returns full link graph with inbound counts — but crawl is NOT triggered for `on_page_audit` (only for `site_audit`, `technical_audit`, `link_analysis`) |
| Map link equity flow | AVAILABLE | Same as above — needs crawl data which isn't wired for this request type |
| Evaluate content quality (word count, readability) | REAL | Scraper returns body text; word count calculable. Readability computed by Gemini |
| Keyword placement audit against SERP | REAL | Serper API provides SERP data; scraper provides on-page content |

### technical-seo/cwv-optimization.md
Request type: Not a standalone request type — data sources available via fetchAllSiteData

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Pull CrUX field data | REAL | `fetchCrUXData()` at `crux.ts` — free API, returns LCP/INP/CLS p75 field data |
| Pull Lighthouse lab data via PSI | REAL | `fetchPageSpeed()` at `pagespeed.ts` — returns performance score, CWV metrics, opportunities, diagnostics |
| Diagnose LCP failures from PSI diagnostics | REAL | `fetchPageSpeed()` returns `opportunities[]` and `diagnostics[]` arrays |
| Third-party script impact assessment | GAP | No JS bundle analysis or third-party script cataloging. PSI returns some resource data but no dedicated script profiler |
| Chrome DevTools profiling | GAP | No headless Chrome or Puppeteer integration for runtime profiling |

### technical-seo/schema-markup.md
Request type: `schema_generation` — gets: scrape + fetchAllSiteData (no crawl)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Audit existing JSON-LD on pages | AVAILABLE | Scraper returns raw HTML containing JSON-LD, but no JSON-LD parser extracts/validates it. Crawl data could provide this but crawl isn't triggered for `schema_generation` |
| Validate against Google Rich Results Test | GAP | No Rich Results Test API integration |
| Generate JSON-LD blocks | REAL | Gemini generates schema based on reference guidance and page content from scraper |

### technical-seo/redirect-management.md
Request type: `redirect_map` + `robots_sitemap` — gets: scrape + fetchAllSiteData (no crawl)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Map all existing redirects from crawl data | AVAILABLE | `crawlSite()` returns `redirectChains[]` and `brokenLinks[]`, but crawl is NOT triggered for `redirect_map` or `robots_sitemap` — only for `site_audit`, `technical_audit`, `link_analysis` |
| Audit robots.txt | REAL | Scraper can fetch `/robots.txt` directly; `parseRobots()` exists in crawler |
| Validate XML sitemaps | GAP | No sitemap fetcher/validator |
| Generate redirect resolution map | REAL | Gemini generates based on upstream site_audit data (via service chain) |

### content/keyword-research.md
Request type: `keyword_research` — gets: fetchKeywordSerpData (KEYWORD_ENRICHED), no scrape, no crawl

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Expand seeds via Serper API (related searches, PAA) | REAL | `fetchKeywordSerpData()` returns `relatedSearches[]`, `peopleAlsoAsk[]` for each keyword |
| Pull SERP data for each keyword (top 10 results) | REAL | `fetchKeywordSerpData()` returns `topResults[]` with position, title, link, snippet |
| Detect SERP features (AI Overview, featured snippet, PAA) | REAL | `fetchKeywordSerpData()` returns `serpFeatures[]` and `aiOverviewPresent` |
| Pull GSC data for existing rankings | REAL | `fetchGSCData()` via `fetchAllSiteData()` — but only if `keyword_research` is in URL_BASED_REQUESTS... it is NOT. GSC data requires a target URL which keyword_research may not have |
| Pull search volume numbers | GAP | No search volume API (Google Keyword Planner, DataForSEO, etc.). Serper returns SERP results but NOT search volumes. Reference acknowledges this with "estimated" labels |
| Google Trends integration for seasonality | GAP | No Google Trends API integration |
| CPC data | GAP | No CPC/ad data API. Serper does not return CPC |

### content/content-brief.md
Request type: `content_brief` — gets: fetchKeywordSerpData (KEYWORD_ENRICHED), no scrape unless URL provided

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Pull top-10 SERP data via Serper | REAL | `fetchKeywordSerpData()` for seed keywords |
| Scrape top 3-5 competitor pages for analysis | AVAILABLE | `scrapeUrl()` exists and could scrape competitor URLs from Serper results, but process-service-request doesn't call it on competitor URLs — only on the client's target_url |
| Build semantic term list from competitor pages | GAP | No NLP term extraction from competitor pages. Would require scraping competitors + term frequency analysis |
| Map internal linking from BFS crawler | AVAILABLE | `crawlSite()` exists but not triggered for `content_brief` |

### content/content-article.md
Request type: `content_article` — gets: fetchKeywordSerpData (KEYWORD_ENRICHED)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Analyze SERP context via Serper | REAL | `fetchKeywordSerpData()` provides SERP data |
| Check word count of top-5 ranking pages | AVAILABLE | Would require scraping competitor URLs; `scrapeUrl()` exists but isn't called on SERP result URLs |
| NLP content optimization (Surfer/Clearscope methodology) | GAP | No term frequency analysis against SERP competitors |

### content/content-calendar.md
Request type: `content_calendar` — gets: fetchKeywordSerpData (KEYWORD_ENRICHED)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Ingest upstream keyword research data | REAL | Via `client_seo_context` table (accumulated from prior services) |
| Apply seasonal timing via Google Trends | GAP | No Google Trends integration |
| Check keyword overlap for cannibalization prevention | AVAILABLE | GSC data via `fetchGSCData()` can show which pages rank for which queries, but only available with OAuth |

### content/content-decay.md
Request type: `content_decay_audit` — gets: fetchKeywordSerpData (KEYWORD_ENRICHED)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Pull GSC performance data (clicks, impressions, CTR, position) | REAL | `fetchGSCData()` via `fetchAllSiteData()` when client connects OAuth. Returns topQueries, topPages, strikingDistance |
| Calculate traffic change per page | REAL | GSC data provides per-page metrics; Gemini calculates trends |
| Competitive displacement analysis via Serper | REAL | `fetchKeywordSerpData()` for target keywords shows current SERP |
| Pull GA4 conversion data for revenue page priority | REAL | `fetchGA4Data()` via `fetchAllSiteData()` when GA4 property connected |
| Google Trends for seasonal vs. true decay differentiation | GAP | No Google Trends integration |

### content/topic-clusters.md
Request type: `topic_cluster_map` — gets: fetchKeywordSerpData (KEYWORD_ENRICHED)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| SERP-overlap clustering (60%+ threshold) | REAL | `fetchKeywordSerpData()` provides top results per keyword; Gemini can compute overlap |
| Audit existing content against cluster map | AVAILABLE | `crawlSite()` could provide site inventory but isn't triggered for this request type |
| Competitor cluster analysis | AVAILABLE | `scrapeUrl()` could analyze competitor sites but isn't called for competitor URLs |

### competitor/competitor-analysis.md
Request type: `competitor_analysis` — gets: scrape + fetchAllSiteData (no crawl, no keyword enrichment)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Estimate domain-level organic traffic | GAP | No traffic estimation API (Semrush, SimilarWeb, Ahrefs). Reference lists this as a step with no code path |
| Top pages analysis for each competitor | AVAILABLE | `scrapeUrl()` can scrape competitor homepages; `searchSerp()` via `fetchAllSiteData()` gets SERP results. But no way to get a competitor's top pages by traffic |
| Content gap analysis | REAL | Serper SERP data + scraper can compare competitor content coverage |
| Backlink comparison | GAP | No Ahrefs/Semrush/Moz backlink API integrated. `searchCompetitors()` exists in serper.ts but only checks SERP positions — not backlink data |
| SERP feature audit (who owns snippets) | REAL | `searchSerp()` / `fetchKeywordSerpData()` returns SERP features |
| Share of voice calculation | GAP | Requires search volume data (not available) + ranking positions. Partial via Serper but no volume data |

### analytics/analytics-audit.md
Request type: `analytics_audit` — gets: scrape + fetchAllSiteData

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Verify GA4 property exists and collects data | REAL | `fetchGA4Data()` returns data or null/error — confirms property works |
| Evaluate GA4 configuration (retention, filters, enhanced measurement) | GAP | GA4 Admin API not integrated. `fetchGA4Data()` only runs reports, doesn't read property configuration |
| Audit conversion tracking completeness | GAP | Requires GA4 Admin API or GTM API to enumerate configured events/conversions |
| Review UTM parameter strategy | GAP | No UTM analysis tool |
| Check GSC verification and coverage | REAL | `fetchGSCData()` returns data confirming GSC is connected and working |

### analytics/monthly-report.md
Request type: `monthly_report` — gets: scrape + fetchAllSiteData

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Pull monthly metrics snapshot | REAL | `client_metrics_history` table via `getClientHistory()` |
| Fetch prior months for MoM/YoY comparison | REAL | `getClientHistory(clientId, 13)` returns up to 13 months |
| Aggregate service activity (deliverables created) | REAL | Supabase query on `deliverables` table |
| Pull client SEO context | REAL | `client_seo_context` table |
| Pull GSC query data | REAL | `fetchGSCData()` via `fetchAllSiteData()` |
| Pull GA4 session data | REAL | `fetchGA4Data()` via `fetchAllSiteData()` |

### link-building/link-analysis.md
Request type: `link_analysis` — gets: scrape + fetchAllSiteData + crawlSite

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Pull backlink profile (referring domains, DR, anchors) | GAP | No Ahrefs/Semrush/Moz API. This is the biggest gap. Reference lists Ahrefs, Semrush, Majestic as data sources with no code path |
| Map anchor text distribution | REAL (internal only) | `crawlSite()` returns `anchorTextDistribution` with branded/partial/exact/generic/nakedUrl — but this is INTERNAL anchor text only. External backlink anchor text requires Ahrefs/Semrush |
| Score toxic links | GAP | No toxic link scoring. Requires Ahrefs/Semrush Backlink Audit data |
| Generate disavow file | GAP | No disavow file generator |
| Run competitor backlink gap | GAP | No backlink data API for competitors |
| Analyze link velocity | GAP | No historical backlink data |
| Internal link graph analysis | REAL | `crawlSite()` returns `linkGraph[]`, `inboundLinkCounts`, `hubPages[]`, `orphanPages[]` |

### link-building/outreach.md
Request type: `outreach_emails` — gets: scrape + fetchAllSiteData (no crawl)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Build prospect list from competitor backlink gap | GAP | No backlink gap data (requires Ahrefs/Semrush) |
| Research each prospect's recent articles | AVAILABLE | `scrapeUrl()` could scrape prospect sites but isn't called on prospect URLs |
| Contact email discovery | GAP | No Hunter.io/Snov.io integration |
| HARO/Featured.com monitoring | GAP | No journalist query monitoring integration |
| Craft personalized emails | REAL | Gemini generates based on reference guidance |

### link-building/internal-linking.md
Shared reference — used by multiple request types

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Crawl full site for internal link map | REAL | `crawlSite()` returns complete internal link graph |
| Identify authority pages (external backlink cross-reference) | GAP | Requires external backlink data (Ahrefs/Semrush) to identify which pages have the most external referring domains |
| Detect orphan pages | REAL | `crawlSite()` returns `orphanPages[]` |
| Audit anchor text of internal links | REAL | `crawlSite()` returns `anchorTextDistribution` and per-link anchor text |

### link-building/anchor-text.md
Shared reference — used by link analysis

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Extract all anchor text data from backlink sources | GAP | No Ahrefs/Semrush for external anchor text. Internal anchor text available via `crawlSite()` |
| Compare against safe SpamBrain thresholds | REAL (internal only) | `crawlSite()` `anchorTextDistribution` includes `overOptimized` flag and alert when exact match > 10% |
| Benchmark against competitors | GAP | No competitor backlink/anchor data |

### local-seo/local-audit.md
Request type: `local_seo_audit` — gets: scrape + fetchAllSiteData + NAP check (via `checkNAPConsistency`)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| GBP completeness audit | AVAILABLE | `fetchGBPData()` exists in `google-business-profile.ts` but is NOT wired into `process-service-request.ts` — only used in `api/metrics/local/route.ts` for dashboard |
| NAP consistency check across directories | REAL | `checkNAPConsistency()` in `directory-checker.ts` is wired for `local_seo_audit` via `NAP_CHECK_REQUESTS` set. Checks Yelp, BBB, Yellow Pages, Facebook, Apple Maps, etc. |
| Citation audit (count, accuracy) | REAL | `checkNAPConsistency()` returns directory-by-directory results with found/not-found and match status |
| Review profile analysis | AVAILABLE | `fetchGBPData()` returns review-adjacent data (not review text). No dedicated review API pulling review text/ratings/sentiment |
| Geo-grid ranking check | GAP | No geo-grid ranking tool integration (would need Local Falcon or BrightLocal API) |
| Competitor local analysis | AVAILABLE | `searchSerp()` shows local pack results; scraper could check competitor GBPs — but no automated competitor GBP data pull |
| LocalBusiness schema validation | AVAILABLE | Scraper returns HTML containing JSON-LD, but no dedicated schema parser/validator |

### local-seo/gbp-optimization.md
Request type: `gbp_optimization` — gets: scrape + fetchAllSiteData (no crawl, no NAP check)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Audit current GBP state | AVAILABLE | `fetchGBPData()` exists but NOT wired into process-service-request for `gbp_optimization`. Only returns performance metrics (views, clicks, calls), not completeness data |
| Pull GBP insights (views, actions, search queries) | AVAILABLE | `fetchGBPData()` returns profileViews, searchAppearances, mapViews, websiteClicks, callClicks, directionRequests — exists but not wired |
| Research Google category list | GAP | No Google category list API. Manual research required |
| Photo geo-tag verification | GAP | No EXIF data reader for uploaded photos |

### local-seo/citations-nap.md
Request type: `directory_submissions` — gets: scrape + fetchAllSiteData

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Check NAP across directories | REAL | `checkNAPConsistency()` in `directory-checker.ts` (wired for `local_seo_audit`; would need to be wired for `directory_submissions` too) |
| Check data aggregators (InfoGroup, Neustar, Factual) | GAP | `checkNAPConsistency()` checks consumer-facing directories but not aggregator APIs |
| Detect duplicate listings | GAP | No duplicate listing detection |
| Whitespark/BrightLocal citation tracking | GAP | No Whitespark or BrightLocal API integration |

### local-seo/review-management.md
Request type: `review_responses` + `review_campaign`

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Pull review data (count, rating, distribution, recency) | AVAILABLE | `fetchGBPData()` exists but not wired; also GBP Performance API returns metrics, not individual reviews. Would need GBP Reviews API |
| Benchmark competitor reviews | GAP | No automated competitor review data pull |
| Sentiment analysis across reviews | GAP | No review text ingestion for sentiment analysis |
| Review monitoring and alerts | GAP | No real-time review monitoring/webhook |

### ai-search/entity-optimization.md
Request type: `entity_optimization` — gets: scrape + fetchAllSiteData

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Audit platform presence (LinkedIn, Crunchbase, Wikidata, etc.) | GAP | No platform-by-platform profile checker. Would need to scrape each platform |
| Score cross-platform consistency | GAP | No cross-platform NAP/entity consistency checker beyond directories |
| Check Organization schema | AVAILABLE | Scraper returns raw HTML containing JSON-LD, but no dedicated JSON-LD parser |
| Knowledge Graph evaluation | REAL | Serper API returns `knowledgeGraph` data in SERP results |
| Wikidata entry assessment | GAP | No Wikidata API integration |

### ai-search/geo-audit.md
Request type: `geo_audit` — gets: scrape + fetchAllSiteData (no crawl, no keyword enrichment)

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Platform citation check (AI Overview presence) | REAL | `fetchKeywordSerpData()` returns `aiOverviewPresent` boolean — but `geo_audit` is NOT in KEYWORD_ENRICHED_REQUESTS, so Serper keyword data isn't auto-fetched. However, `searchSerp()` via `fetchAllSiteData()` does return `aiOverview` for the domain query |
| Content citability audit (fact density, structure) | REAL | Scraper returns page content; Gemini evaluates citability based on reference guidance |
| Schema completeness check | AVAILABLE | Scraper returns HTML with JSON-LD, but no dedicated parser |
| Freshness audit (dateModified check) | AVAILABLE | Scraper returns HTML; `dateModified` could be parsed from schema, but no parser |
| Competitive citation analysis | REAL | Serper shows what's ranking; Gemini analyzes |

### cross-service/client-lifecycle.md
Process orchestration reference — no direct data fetch instructions.

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Run `captureMonthlySnapshot()` for baseline | REAL | Function exists in `metrics-snapshot.ts` |
| Service chain triggers | REAL | `CHAIN_MAP` in `service-chain.ts` handles auto-chaining |

### cross-service/data-flow.md
Architecture reference — no direct data fetch instructions. Documents how 26 services connect.

No actionable instructions to audit.

### cross-service/quality-gates.md
Quality criteria reference — no direct data fetch instructions.

| Instruction | Category | Code Path / Gap |
|---|---|---|
| Trace every number to its data source | REAL | Enforced by reference guidance; data comes from real APIs |

### agency-model.md
Structural reference — no data fetch instructions.

No actionable instructions to audit.

---

## Priority Gaps (things to build next)

### Tier 1 — Highest Impact (blocks core service quality)

1. **Backlink data API (Ahrefs or Moz)** — Blocks: `link_analysis`, `anchor-text`, `outreach`, `competitor_analysis`, `internal-linking` authority identification. 6+ reference files assume backlink data that doesn't exist. This is the single biggest gap.

2. **Search volume + CPC API (DataForSEO or similar)** — Blocks: `keyword_research` volume accuracy, `content_calendar` priority scoring, `competitor_analysis` share-of-voice. Without volume data, keyword research outputs are fundamentally incomplete.

3. **Wire `fetchGBPData()` into process-service-request** — Code exists at `src/lib/integrations/google-business-profile.ts`. Needs to be called for `local_seo_audit`, `gbp_optimization`, and `review_responses`/`review_campaign` request types. Estimated effort: 30 minutes.

4. **Wire `crawlSite()` for more request types** — Currently only triggered for `site_audit`, `technical_audit`, `link_analysis`. Should also run for: `on_page_audit` (needs link graph), `redirect_map` (needs redirect chain data), `schema_generation` (needs existing schema inventory), `internal_linking`. Estimated effort: 5 minutes (add to CRAWL_REQUESTS set).

### Tier 2 — High Impact (significant quality improvements)

5. **Wire `checkNAPConsistency()` for `directory_submissions`** — Code exists, just needs the request type added to `NAP_CHECK_REQUESTS` set. 1-line change.

6. **Wire SERP keyword enrichment for `geo_audit`** — `geo_audit` should be in `KEYWORD_ENRICHED_REQUESTS` to get real AI Overview presence data per keyword. 1-line change.

7. **XML sitemap fetcher/validator** — Referenced in `technical_audit` and `redirect-management`. Needs: fetch sitemap URL from robots.txt, parse XML, validate each URL status. Moderate build.

8. **JSON-LD schema parser** — Multiple reference files assume ability to parse existing JSON-LD from pages. Scraper returns raw HTML but nothing extracts/validates schema blocks. Moderate build.

9. **Google Trends API integration** — Referenced by `keyword_research`, `content_calendar`, `content_decay`. Would enable seasonal analysis and trend verification.

### Tier 3 — Nice-to-Have (incremental improvements)

10. **Response header extraction in scraper/crawler** — `site_audit` references checking HTTPS, HSTS, CSP, X-Frame-Options headers. Current scraper/crawler only extract HTML body.

11. **Competitor page scraping in content services** — `content_brief` and `content_article` reference scraping top SERP results for word count, heading structure, term frequency. `scrapeUrl()` exists but isn't called on competitor URLs.

12. **GA4 Admin API for analytics_audit** — `analytics_audit` references checking GA4 configuration (retention settings, filters, enhanced measurement). Current integration only runs reports.

13. **Headless browser for JS rendering assessment** — `technical_audit` references comparing raw HTML vs rendered DOM. Requires Puppeteer or similar.

14. **Contact email discovery (Hunter.io)** — Referenced by `outreach` for building prospect email lists.

15. **Review text ingestion for sentiment analysis** — Referenced by `review_management`. GBP Performance API returns metrics, not individual review text.

16. **Geo-grid ranking tools (Local Falcon/BrightLocal API)** — Referenced by `local_audit`. Would show rank variation across service area.

### Quick Wins (< 30 min each)

| Change | File | Impact |
|---|---|---|
| Add `on_page_audit`, `redirect_map`, `schema_generation` to `CRAWL_REQUESTS` | `process-service-request.ts` line 283 | 3 services gain crawl data |
| Add `directory_submissions` to `NAP_CHECK_REQUESTS` | `process-service-request.ts` line 295 | Directory submissions get NAP verification |
| Add `geo_audit` to `KEYWORD_ENRICHED_REQUESTS` | `process-service-request.ts` line 286 | GEO audit gets per-keyword AI Overview data |
| Import + call `fetchGBPData()` for local services | `process-service-request.ts` | 4 local services gain GBP performance data |
| Add `competitor_analysis` to `KEYWORD_ENRICHED_REQUESTS` | `process-service-request.ts` line 286 | Competitor analysis gets real SERP enrichment per keyword |
