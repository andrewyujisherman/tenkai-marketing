# Technical Audit — Agent Reference (Kenji / technical_audit)

## What This Produces
A deep-dive technical infrastructure audit covering crawlability, indexability, rendering, server configuration, and site architecture — the engineering-grade layer beneath the general site audit that identifies root causes a surface scan cannot reach.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **Root cause analysis, not symptom listing.** Don't report "slow page" — identify the unoptimized 3MB hero image, the render-blocking third-party script, or the missing CDN configuration causing it.
- **Crawl behavior evidence.** Premium audits reference how Googlebot actually behaves — two-wave indexing, JS rendering delays, crawl budget allocation — not just "best practices."
- **Server-level diagnostics.** Response headers, TTFB patterns, redirect configurations, robots.txt directives — the things only a technical audit catches.
- **Architecture assessment.** URL structure, site hierarchy, faceted navigation handling, pagination strategy — the structural decisions that compound across thousands of pages.
- **Quantified impact.** Every finding includes the scope (how many URLs affected) and estimated impact (traffic, crawl efficiency, indexation rate).

## Build Process (Ordered Steps)

1. **Receive inputs from site audit.** Ingest broken links list, redirect chains, crawl depth data, and security header findings from Haruki's site_audit output. Also take the raw BFS crawler data.
2. **Analyze URL architecture.** Map the URL structure: folder depth, parameter usage, trailing slashes consistency, URL length distribution. Identify faceted navigation patterns, session IDs in URLs, and duplicate URL variants (www vs non-www, HTTP vs HTTPS, trailing slash vs no trailing slash).
3. **Audit robots.txt.** Fetch and parse robots.txt. Verify: no critical paths blocked, crawl-delay directives present (and appropriate), sitemap declaration present, wildcard rules not accidentally blocking important content. Check for user-agent-specific rules.
4. **Validate XML sitemaps.** Fetch all declared sitemaps. Check: all URLs return 200 status, all URLs are canonical versions, lastmod dates are accurate (not all the same date), sitemap index structure is logical, no URLs blocked by robots.txt appear in sitemap, total URL count matches expected indexable pages.
5. **Assess server response patterns.** Check TTFB across multiple pages (target < 600ms). Verify HTTP/2 or HTTP/3 support. Check compression (gzip/brotli). Verify CDN presence via response headers. Check for proper cache-control headers.
6. **Map redirect architecture.** From site_audit data plus additional testing: verify all redirects are 301 (not 302 for permanent moves), trace all chains to resolution, identify redirect loops, check that old URLs from any known migrations are properly redirected.
7. **JavaScript rendering assessment.** For each unique page template: compare raw HTML response against rendered DOM. Identify content that exists only after JS execution. Flag any critical content (headings, body text, links, schema) that requires JavaScript to render. Note: Bing, DuckDuckGo, and AI crawlers (ChatGPT, Perplexity) cannot execute JavaScript.
8. **Evaluate pagination and infinite scroll.** Check how paginated content is handled: rel=prev/next (deprecated but still useful as hints), canonical strategy, parameter-based vs path-based pagination, whether paginated pages are indexable or noindexed. For infinite scroll: verify that discrete URLs exist for each page of content.
9. **International SEO check (if applicable).** Validate hreflang implementation: reciprocal tags present, valid ISO language/region codes, x-default tag present, no conflicts between hreflang and canonical tags. Check URL structure choice (subfolder vs subdomain vs ccTLD).
10. **Compile technical findings.** Categorize every issue with severity, scope, root cause, and fix recommendation. Generate the deliverable per Output Structure.

## Critical Patterns

### 1. Robots.txt Misconfiguration
**WHEN:** Robots.txt contains overly broad Disallow rules or is missing entirely.
**HOW:** Fetch robots.txt. Parse all Disallow directives. Cross-reference with the sitemap and BFS crawler results. Flag any indexed pages that are blocked by robots.txt (Google may still index them without crawling — showing URL-only results). Flag any critical content paths in Disallow rules. Verify the Sitemap directive points to a valid, accessible sitemap.
**WHY:** A single misplaced Disallow can deindex entire sections of a site. Common culprit: staging environments going live with `Disallow: /` still in robots.txt. Also common: blocking CSS/JS paths that prevent Googlebot from rendering pages.
**DON'T:** Copy-paste a "standard" robots.txt template. Every robots.txt must be specific to the site's architecture and needs.

### 2. XML Sitemap Hygiene
**WHEN:** Sitemaps contain non-indexable URLs, stale lastmod dates, or URLs returning non-200 status codes.
**HOW:** Parse every URL in the sitemap. Cross-check: (a) URL returns 200, (b) URL is the canonical version (not redirected, not canonicalized elsewhere), (c) URL is not blocked by robots.txt, (d) URL is not noindexed. Check lastmod accuracy — if all URLs have the same lastmod, or lastmod dates don't change when content changes, flag this. Validate sitemap against the 50,000 URL / 50MB limits.
**WHY:** Sitemaps are a crawl prioritization signal. Sitemaps full of junk URLs waste crawl budget and reduce Googlebot's trust in the sitemap as a discovery mechanism. Accurate lastmod dates help Google prioritize re-crawling recently updated content.
**DON'T:** Just validate XML syntax. A syntactically valid sitemap full of 404s and redirects is worse than useless.

### 3. TTFB and Server Response Analysis
**WHEN:** TTFB exceeds 600ms on any page, or varies dramatically across the site.
**HOW:** Measure TTFB for: homepage, a deep content page, a high-traffic landing page, and a paginated page. Check from multiple perspectives if possible. If TTFB is high, diagnose: is it the origin server (no CDN), database queries (dynamic pages), or geographic distance (no edge caching)? Check for HTTP/2 or HTTP/3 support. Verify gzip/brotli compression via Content-Encoding header. Check Cache-Control headers for appropriate caching directives.
**WHY:** TTFB directly impacts LCP and overall crawl efficiency. Google has a finite time budget per crawl session — slow TTFB means fewer pages crawled per session. Target: < 200ms for cached/static content, < 600ms for dynamic pages.
**DON'T:** Report TTFB without context. 400ms TTFB on a dynamic e-commerce page with personalization is reasonable; 400ms on a static blog post is not.

### 4. Redirect Type Validation
**WHEN:** Any redirect is found during crawling (301, 302, 303, 307, 308, meta refresh, JavaScript redirect).
**HOW:** For each redirect, document: source URL, status code, destination URL, redirect type. Classify: permanent moves should be 301 or 308 (pass link equity). Temporary redirects (302, 307) do NOT pass full link equity. Meta refresh and JavaScript redirects are not reliably followed by all crawlers. Flag: 302s used for permanent moves, chains > 2 hops, redirects to redirects, redirect loops, HTTPS->HTTP redirects (security downgrade).
**WHY:** Redirect misconfiguration is one of the most common causes of lost rankings after site migrations. A permanent URL change using 302 instead of 301 can take months to correct in Google's index. Each redirect hop leaks approximately 15% of link equity.
**DON'T:** Recommend changing all 302s to 301s blindly. Some 302s are intentionally temporary (A/B tests, seasonal content, maintenance pages). Ask about intent before recommending changes.

### 5. JavaScript Rendering Gap Analysis
**WHEN:** Site uses any client-side JavaScript framework (React, Vue, Angular, Next.js in CSR mode) or heavy JavaScript for content rendering.
**HOW:** For each unique page template, fetch the raw HTML response (what crawlers see on first pass). Then render with JavaScript (what Google sees on second pass, potentially days later). Compare: are headings, body content, internal links, and schema markup present in the raw HTML? If not, they depend on JS rendering. Flag the specific elements that are JS-dependent. Test with JavaScript disabled in browser to visualize the gap.
**WHY:** Bing, DuckDuckGo, and AI crawlers (ChatGPT, Perplexity) cannot process JavaScript at all — they see only raw HTML. Google's two-wave indexing means JS-dependent content may take days or weeks to be processed. Google confirmed in 2025 that a noindex in original HTML means Googlebot "may skip rendering and JavaScript execution entirely."
**DON'T:** Assume Next.js = SSR. Next.js pages can be CSR, SSR, SSG, or ISR depending on configuration. Check the actual HTML response, not the framework name.

### 6. Crawl Depth Optimization
**WHEN:** BFS crawler shows pages at depth > 4 that have search value (impressions in GSC, commercial intent, or part of core site structure).
**HOW:** Map crawl depth distribution: how many pages at depth 1, 2, 3, 4, 5+. Identify high-value pages buried at depth 4+. Calculate the minimum clicks from homepage to each important page. Check if key pages are linked from the main navigation, category pages, or internal contextual links.
**WHY:** Crawl depth is a proxy for importance. Pages deeper in the architecture receive less crawl frequency and less link equity. For sites with 10K+ pages, crawl budget becomes a real constraint — deep pages may not be crawled for weeks or months.
**DON'T:** Cite the "3-click rule" as a hard limit. It's not a Google rule. Instead, focus on whether important pages are reachable through natural navigation paths and have sufficient internal link equity.

### 7. Duplicate URL Resolution
**WHEN:** The same content is accessible via multiple URLs (with/without trailing slash, with/without www, HTTP/HTTPS variants, parameter variations, print versions).
**HOW:** Test each URL variant: `domain.com/page`, `domain.com/page/`, `www.domain.com/page`, `http://domain.com/page`, `domain.com/page?ref=xyz`. For each, check: does it redirect to the canonical? Does it serve the same content with a canonical tag? Does it serve the same content with no canonical (worst case — pure duplicate)? For parameter URLs, check if URL parameters are handled via Search Console parameter settings or canonical tags.
**WHY:** Duplicate URLs split link equity, confuse crawlers, and waste crawl budget. A page with 4 accessible URL variants has its link equity split 4 ways. Even with canonical tags, Google treats canonicals as hints, not directives.
**DON'T:** Only check www vs non-www. Test all variant types. The most overlooked duplicates are parameter-based (UTM tags, session IDs, sort/filter parameters creating thousands of indexable URL combinations).

### 8. Faceted Navigation Handling
**WHEN:** Site has product/service listings with filters (price, color, size, category, location) that generate unique URLs per filter combination.
**HOW:** Identify the URL pattern for faceted navigation. Calculate the total URL combinatorial explosion (e.g., 10 colors x 5 sizes x 3 price ranges = 150 URLs per product category). Check how these are handled: canonical to unfiltered page? Noindex? Blocked by robots.txt? Using AJAX (no URL change)? The best approach depends on whether filtered pages have search value.
**WHY:** Faceted navigation is the #1 crawl trap for e-commerce sites. A site with 50 categories and 10 filters can generate millions of indexable URLs, most with duplicate or near-duplicate content. This exhausts crawl budget on worthless pages.
**DON'T:** Recommend blocking all faceted URLs. Some filtered combinations have genuine search value ("red running shoes size 10"). Identify which filter combinations have search volume and preserve their indexability while blocking the rest.

### 9. Pagination Strategy
**WHEN:** Site has paginated content (blog archives, product listings, search results).
**HOW:** Check current implementation: Are paginated pages indexable? Do they have unique canonical tags (self-referencing)? Is there a view-all page? For infinite scroll, are there discrete URLs for each page segment? Check if rel=prev/next is implemented (deprecated by Google in 2019 but still used as a hint by some crawlers). Verify that paginated pages aren't orphaned (page 7 should be reachable from page 6 and page 8).
**WHY:** Poor pagination causes: deep pages never crawled, duplicate content across paginated series, link equity trapped on page 1 never reaching later pages. Sites with thousands of paginated pages can waste significant crawl budget.
**DON'T:** Recommend noindexing all paginated pages. Products/content on page 2+ still need to be discoverable. Noindex the paginated index pages but ensure the individual items on those pages are linked from other places.

### 10. HTTP Status Code Audit
**WHEN:** Every audit. The full spectrum of status codes tells the story of a site's technical health.
**HOW:** From BFS crawler data, categorize all responses: 200 (healthy), 301/302 (redirects — check type appropriateness), 304 (not modified — healthy caching), 403 (forbidden — investigate), 404 (not found — check for inbound links to these), 410 (gone — intentional removal, good), 500/502/503 (server errors — critical, intermittent issues). For 404s, cross-reference with internal links pointing to them (broken links) and external backlinks (lost link equity).
**WHY:** Status codes are how search engines understand your site's state. A site returning 200 for "page not found" content (soft 404) is worse than a proper 404 — it tells Google the page exists and should be indexed. 500-level errors during Googlebot visits can trigger reduced crawl rate.
**DON'T:** Only look at 404s. Soft 404s (200 status on error pages), 302s used as permanent redirects, and intermittent 500s during peak traffic are more dangerous because they're less visible.

### 11. Hreflang Validation (International Sites)
**WHEN:** Site serves content in multiple languages or targets multiple regions.
**HOW:** For every page with hreflang tags: (a) verify reciprocal tags — if page A declares page B as its French version, page B must declare page A as its English version, (b) validate ISO codes (en-US not en_US, zh-Hans not zh-CN for simplified Chinese), (c) verify x-default tag points to a sensible default, (d) check that hreflang URLs match canonical URLs — if a page canonicalizes to URL X, the hreflang must point to URL X, not the non-canonical version, (e) verify hreflang URLs are indexable (not noindexed, not blocked by robots.txt).
**WHY:** Inconsistency between hreflang and canonical tags is present in 68% of e-commerce hreflang implementations (Ahrefs data). A single broken reciprocal invalidates the entire hreflang cluster for that page set.
**DON'T:** Only validate the hreflang syntax. Validate the relationships. A syntactically perfect hreflang that points to a 404 or a redirected URL is functionally broken.

### 12. Log File Analysis Indicators
**WHEN:** Site has 10K+ pages, or GSC shows significant crawl anomalies (many "discovered but not indexed" pages).
**HOW:** If log files are available: analyze Googlebot crawl frequency per URL, identify pages never crawled by Googlebot, identify pages crawled excessively (crawl traps), measure crawl budget waste (requests to 404s, redirects, blocked resources). If log files are NOT available: note this as a limitation and recommend the client provide server logs or install a log analysis tool (JetOctopus, OnCrawl) for enterprise-grade insights.
**WHY:** Log file analysis is the only way to see exactly what Googlebot does. GSC shows what Google indexed; logs show what Google crawled. The gap between crawled and indexed reveals rendering issues, quality problems, and crawl budget waste.
**DON'T:** Skip this section for smaller sites. Even sites with 1K pages benefit from understanding Googlebot behavior. At minimum, note whether log analysis was performed and recommend it for ongoing monitoring.

### 13. Mixed Content and Protocol Issues
**WHEN:** Site serves over HTTPS but loads some resources over HTTP.
**HOW:** Check page source for HTTP-loaded resources: images, scripts, stylesheets, fonts, iframes. Check for protocol-relative URLs (//example.com) which can cause issues. Verify that ALL internal links use HTTPS (no HTTP internal links that trigger redirect chains). Check for mixed content warnings in browser console.
**WHY:** Mixed content triggers browser warnings that destroy trust. Insecure resource loads can be blocked by modern browsers, breaking page functionality. Each HTTP -> HTTPS redirect on a resource adds latency.
**DON'T:** Only check the main document. Mixed content most commonly appears in embedded resources: images uploaded years ago with HTTP URLs, third-party scripts loaded via HTTP, legacy iframe embeds.

## Data Sources

| Source | What It Provides | Access Method |
|--------|-----------------|---------------|
| BFS Crawler | Page URLs, status codes, internal link graph, redirect chains, orphan pages | `src/lib/integrations/crawler.ts` — always available |
| Site scraper | Raw HTML, rendered DOM, response headers, status codes | Direct fetch — always available |
| PageSpeed Insights API | TTFB, compression, caching headers, HTTP/2 status, resource diagnostics | API call — always available |
| robots.txt | Crawl directives per user-agent | Direct fetch at /robots.txt — always available |
| XML sitemaps | Declared indexable URLs, lastmod dates | Fetch from robots.txt sitemap directive — always available |
| Google Search Console | Index coverage, crawl stats, URL inspection, manual actions | OAuth — only when client connects |

## Output Structure

1. **Technical Summary** — Overall technical health grade (A-F), critical issue count, top 3 infrastructure risks.
2. **Crawlability Assessment** — Robots.txt analysis, XML sitemap audit, crawl depth distribution, crawl budget indicators, redirect architecture.
3. **Indexability Assessment** — Canonical tag audit, noindex/nofollow usage, index coverage analysis (if GSC available), duplicate URL resolution status.
4. **Rendering Assessment** — JavaScript rendering gap analysis per page template, SSR/CSR/SSG detection, content visibility without JS.
5. **Server Infrastructure** — TTFB analysis, HTTP version, compression, caching headers, CDN detection, security headers.
6. **URL Architecture** — URL structure analysis, parameter handling, faceted navigation assessment, pagination strategy, duplicate URL variants.
7. **International SEO** (if applicable) — Hreflang validation, URL structure assessment, language/region targeting.
8. **Status Code Report** — Full categorization of all HTTP responses with diagnosis and recommendations.
9. **Prioritized Technical Roadmap** — Each issue as a row: Finding, Severity, URLs Affected, Root Cause, Fix (specific implementation), Effort, Expected Impact.

## Quality Gate

- [ ] Every finding identifies the specific root cause, not just the symptom
- [ ] Robots.txt is fully parsed with every directive evaluated — not just "robots.txt exists"
- [ ] Sitemap URLs are cross-validated against actual crawl data (URLs in sitemap that return non-200 are flagged)
- [ ] JavaScript rendering assessment covers every unique page template, not just the homepage
- [ ] Redirect analysis includes status code type (301 vs 302) and intent evaluation
- [ ] TTFB is measured across multiple page types, not just the homepage
- [ ] International SEO section includes reciprocal hreflang validation (if applicable)
- [ ] No finding says "consider improving" — every finding has a specific, implementable fix
- [ ] Status code analysis covers the full spectrum (200, 301, 302, 403, 404, 410, 500, soft 404)
- [ ] URL architecture assessment addresses trailing slash consistency, www canonicalization, and HTTPS enforcement
- [ ] All 2026 technical SEO changes are reflected (INP not FID, schema restrictions, JS rendering importance for AI crawlers)

## Cross-Service Connections

- **Receives from:**
  - `site_audit` (Haruki) — broken links list, redirect chains, crawl depth data, security header findings, BFS crawler raw data
  - Client input — known migrations, CMS platform, hosting provider, CDN usage
- **Sends to:**
  - `redirect_map` (Kenji) — complete redirect chain map, 302-to-301 conversion list, broken link redirect targets
  - `robots_sitemap` (Kenji) — robots.txt rewrite, sitemap regeneration requirements, blocked paths to unblock
  - `schema_generation` (Kenji) — page template types identified, rendering method per template (SSR/CSR), JSON-LD injection points
  - `cwv_optimization` (shared) — TTFB data, compression status, caching gaps, render-blocking resources

**Data fields that transfer:**
- `url_architecture{}` — `{trailing_slash_policy, www_policy, https_enforcement, parameter_handling}`
- `rendering_assessment[]` — `{template_type, url_example, js_dependent_elements[], ssr_status}`
- `server_config{}` — `{ttfb_avg_ms, http_version, compression, cdn_detected, cache_policy}`
- `redirect_map[]` — `{source, status_code, destination, type_assessment, recommendation}`
- `sitemap_issues[]` — `{url, issue_type, current_status, recommendation}`

## Output Examples

### Good Example: Robots.txt Annotation

> ```
> # robots.txt — acmeplumbing.com (Audited 2026-03-15)
>
> User-agent: *
> Disallow: /search?           # Internal search results — infinite URL combinations, no index value
> Disallow: /cart/              # Shopping cart — private, no SEO value
> Disallow: /*?sort=            # Sort parameter on listings — duplicate content of canonical listing pages
> Disallow: /*?session=         # Session ID parameters — creates duplicate URLs per visitor
> Allow: /services/             # Explicitly allow service pages (overrides any inherited block)
>
> # AI Crawlers — allowing for AI search visibility (client decision: 2026-03-10)
> User-agent: GPTBot
> Allow: /
> User-agent: PerplexityBot
> Allow: /
>
> Sitemap: https://acmeplumbing.com/sitemap_index.xml
> ```
>
> **Issues found:**
> - Line 4 of current robots.txt has `Disallow: /services/emergency` — this blocks the client's highest-traffic page (/services/emergency-plumbing, 2,400 impressions/mo in GSC). **Remove immediately.**
> - No sitemap declaration in current file. Googlebot must discover sitemap through GSC only.
> - No AI crawler directives. Client is invisible to ChatGPT Search and Perplexity by default.

### Bad Example: Robots.txt Annotation

> The robots.txt file looks standard. It has some Disallow rules and a User-agent directive. We recommend reviewing it to make sure important pages aren't blocked. Consider adding a sitemap reference.

*Why it fails: Didn't parse the actual directives, didn't cross-reference blocked paths against crawl data, didn't check for AI crawler rules, didn't identify the specific page being accidentally blocked.*

### Good Example: JavaScript Rendering Finding

> **JS Rendering Gap — /services/ template (affects 12 pages)**
>
> | Element | Raw HTML (First Pass) | After JS Render (Second Pass) |
> |---------|----------------------|------------------------------|
> | H1 heading | Missing — empty `<div id="heading">` | "Emergency Plumbing Services in Austin" |
> | Body content | Missing — `<div id="content">` placeholder | 1,847 words of service description |
> | Internal links | 0 contextual links in body | 7 internal links injected by React |
> | Article JSON-LD | Missing | Complete Article schema injected by JS |
>
> **Impact:** Google's second-wave rendering may process these pages days after initial crawl. Bing, DuckDuckGo, Perplexity, and ChatGPT crawlers cannot execute JavaScript at all — they see an empty page. These 12 service pages are effectively invisible to 4 of 5 major search engines.
>
> **Fix:** Migrate /services/ template from CSR to SSR (Next.js `getServerSideProps` or SSG with `getStaticProps`). Estimated effort: 8-12 dev hours.

### Bad Example: JavaScript Rendering Finding

> Some pages on the site use JavaScript to load content. This could affect SEO because search engines may not see the content. We recommend looking into server-side rendering.

*Why it fails: No specific pages identified, no before/after HTML comparison, no quantified impact (how many crawlers miss the content), no implementation path. "Looking into" is not an actionable recommendation.*

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| "Your robots.txt looks fine" | Didn't actually parse the directives against the crawl data | Parse every Disallow, cross-reference with crawled URLs, verify nothing important is blocked |
| Recommending `Disallow: /` for staging | Staging should use noindex + password protection, not robots.txt | Recommend noindex meta tag + HTTP auth. Robots.txt doesn't prevent indexation, only crawling. |
| "Your site uses HTTPS" (checkbox done) | Didn't check for mixed content, HTTP internal links, or protocol enforcement | Full protocol audit: mixed content scan, internal link protocol check, HSTS header validation |
| Reporting FID instead of INP | FID was replaced by INP in March 2024 | Always report INP. If you see FID data, note it's deprecated and use INP instead. |
| "JavaScript is fine because you use Next.js" | Next.js can be CSR, SSR, SSG, or ISR — must check actual HTML output | Fetch raw HTML and check if content is present before JS execution |
| Listing every 404 without context | Not all 404s matter equally | Prioritize 404s with inbound internal links or external backlinks. Orphan 404s are low priority. |
| Recommending log file analysis without data | Can't do log analysis without actual server logs | Note the limitation clearly. Recommend specific tools for the client to implement. |
| "Add canonical tags to all pages" | Canonical tags already exist but may be wrong | Audit existing canonicals first. Wrong canonicals are worse than missing ones. |
