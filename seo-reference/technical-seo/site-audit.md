# Site Audit — Agent Reference (Haruki / site_audit)

## What This Produces
A comprehensive site health audit report covering technical infrastructure, content quality, authority signals, UX performance, and internal linking — with a prioritized action plan that connects every finding to business impact.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **Real data, not simulation.** Every finding references actual URLs, status codes, and metrics — never "your site may have issues with X."
- **Prioritized by revenue impact.** Each issue is scored by effort vs. impact, not just listed as critical/medium/low based on category.
- **Cross-system diagnosis.** A broken redirect isn't just a "redirect issue" — it's a crawl budget waste, an internal link equity leak, and a user experience failure. Premium audits connect these dots.
- **Field data over lab data.** CrUX 75th percentile field data trumps Lighthouse lab scores. Both are reported; field data drives recommendations.
- **Actionable implementation guidance.** Every finding includes exactly what to change, in what file/tag/config, with before/after examples.

## Build Process (Ordered Steps)

1. **Ingest site URL and client context.** Capture target URL, business type, CMS platform (if known), number of pages, and any specific concerns from the client.
2. **Run BFS crawler.** Execute the BFS crawler (`src/lib/integrations/crawler.ts`) to get: pages array, internal link graph, orphan pages (0-1 inbound links), broken links (4xx/5xx), anchor text distribution.
3. **Pull PageSpeed Insights data.** For the homepage + 5 highest-traffic pages (from GSC if connected, otherwise top-level navigation pages), fetch both mobile and desktop PSI results. Extract LCP, INP, CLS, FCP, TTFB, and the CrUX field data origin summary.
4. **Pull search visibility data.** Use Serper API to check indexation (`site:domain.com`), check for branded search presence, and pull SERP feature appearances.
5. **If GSC connected:** Pull index coverage report (valid, excluded, error pages), CWV report (good/needs-improvement/poor URL counts), manual actions, and top 20 pages by impressions.
6. **If GA4 connected:** Pull bounce rate, session duration, and conversion rate for top landing pages.
7. **Analyze crawl results.** From BFS data: count total pages, identify orphan pages, map redirect chains (flag any chain > 2 hops), list broken links with referring pages, calculate average crawl depth.
8. **Assess on-page fundamentals.** For each crawled page: title tag (present, length 50-60 chars, unique), meta description (present, length 150-160 chars, unique), H1 (single, present), canonical tag (present, self-referencing or valid), robots meta (index status).
9. **Evaluate content signals.** Identify thin content pages (< 300 words), duplicate/near-duplicate titles, missing alt text on images, pages with no internal links pointing to them.
10. **Check structured data.** Validate JSON-LD on each page. Flag deprecated types (FAQ restricted to gov/health sites in 2026, HowTo removed entirely). Note missing schema opportunities (Organization, LocalBusiness, Product, BreadcrumbList).
11. **Assess security posture.** Check HTTPS enforcement, HSTS header, CSP header, X-Frame-Options. Note mixed content warnings.
12. **Score and prioritize.** Assign each finding: severity (Critical/High/Medium/Low), estimated effort (Quick Win/Medium/Large Project), expected impact (traffic/conversion/crawlability), and affected URL count.
13. **Generate executive summary.** Synthesize into overall health score (0-100), top 3 wins, top 3 risks, and a 30/60/90 day roadmap.
14. **Compile final deliverable.** Assemble all sections per Output Structure below.

## Critical Patterns

### 1. Orphan Page Detection
**WHEN:** BFS crawler returns pages with 0-1 inbound internal links.
**HOW:** Cross-reference orphan pages against GSC impression data (if available). Orphan pages with search impressions are high-value pages starved of internal link equity. Orphan pages with zero impressions and zero traffic are candidates for consolidation, redirect, or removal.
**WHY:** Orphan pages receive no link equity and are often missed by search engine crawlers. Google cannot discover pages it cannot reach through internal links or sitemaps.
**DON'T:** Simply list orphan pages without actionable guidance. Every orphan page needs a recommendation: add internal links, add to sitemap, redirect, or remove.

### 2. Redirect Chain Resolution
**WHEN:** Crawler finds redirect chains with 2+ hops (A -> B -> C or longer).
**HOW:** Trace the full chain from origin to final destination. Report: origin URL, each intermediate hop with HTTP status code (301 vs 302), final destination URL, total chain length. Calculate total internal links pointing to the origin of each chain.
**WHY:** Each hop adds latency (50-300ms per redirect) and leaks ~15% link equity per hop. Chains of 3+ hops risk Googlebot abandoning the crawl entirely. 302s pass zero link equity in most implementations.
**DON'T:** Recommend "fix redirect chains" without specifying which URL should point directly to which final destination. Always provide the flat mapping.

### 3. Core Web Vitals Field vs Lab Gap
**WHEN:** PSI returns both CrUX field data and Lighthouse lab data, and they disagree (e.g., lab LCP is "good" but field LCP is "needs improvement").
**HOW:** Always prioritize field data (CrUX p75). Report both. Explain that lab data tests under synthetic conditions (fixed network, CPU throttling), while field data reflects actual user experience across devices and connections. If field data is unavailable (low-traffic site), state this explicitly and note lab data limitations.
**WHY:** Google uses field data (CrUX p75) for ranking signals, not lab data. A site that passes Lighthouse but fails CrUX is still penalized.
**DON'T:** Report only Lighthouse scores. Never claim "your site passes CWV" based on lab data alone.

### 4. Internal Link Equity Flow Analysis
**WHEN:** BFS crawler returns the internal link graph.
**HOW:** Calculate inbound link count per page. Identify the top 10 most-linked pages (likely navigation/footer links) and the bottom 10 least-linked content pages. Cross-reference with pages the client wants to rank. If high-priority pages have low internal link counts, flag this as a critical finding with specific pages that should link to them.
**WHY:** Internal links are the primary mechanism for distributing PageRank within a site. Pages with 5+ internal links from topically relevant pages rank significantly better than isolated pages.
**DON'T:** Just show a link count table. Connect link distribution to business priorities — "Your /pricing page has 2 internal links, but your /blog/random-post has 47."

### 5. Thin Content Identification
**WHEN:** Crawled pages have < 300 words of body content (excluding navigation, footer, boilerplate).
**HOW:** Flag pages under 300 words. Cross-reference with search performance data (if GSC connected). Categorize: (a) thin pages with impressions — need content expansion, (b) thin pages with zero impressions — candidates for noindex, consolidation, or removal, (c) thin pages that are intentionally thin (contact, login, legal) — exempt.
**WHY:** Google's Helpful Content system penalizes sites with a high ratio of thin/unhelpful pages. This is a site-wide signal — thin pages drag down the entire domain.
**DON'T:** Flag every short page as "thin content." Login pages, contact forms, and utility pages are naturally short. Only flag pages that should have substantive content but don't.

### 6. Canonical Tag Audit
**WHEN:** Every crawled page is checked for canonical tag presence and correctness.
**HOW:** Verify: (a) canonical tag exists, (b) it's self-referencing OR points to the correct canonical version, (c) canonical URLs are absolute (not relative), (d) canonical target actually returns 200, (e) canonical and hreflang tags don't conflict. Flag pages with missing canonicals, canonicals pointing to 404s, and conflicting canonical/hreflang declarations.
**WHY:** Incorrect canonicals are the #1 cause of accidental deindexation. A page canonicalized to a different URL tells Google "don't index me, index that page instead."
**DON'T:** Only check if canonicals exist. A present-but-wrong canonical is worse than a missing one.

### 7. Mobile-First Assessment
**WHEN:** Every audit (Google uses mobile-first indexing for all sites since 2023).
**HOW:** Pull PSI data for mobile specifically. Check viewport meta tag, font size legibility (minimum 16px body text), tap target spacing (minimum 48x48px), and content parity between mobile and desktop versions. Flag any content present on desktop but hidden/removed on mobile.
**WHY:** Google crawls and indexes the mobile version of every site. Content hidden on mobile is effectively hidden from Google.
**DON'T:** Only test desktop performance. If you only run one test, make it mobile.

### 8. HTTPS and Security Header Check
**WHEN:** Every audit includes a security baseline check.
**HOW:** Verify HTTPS enforcement (HTTP -> HTTPS redirect with 301). Check response headers for: HSTS (Strict-Transport-Security with max-age >= 31536000), CSP (Content-Security-Policy), X-Frame-Options (DENY or SAMEORIGIN), X-Content-Type-Options (nosniff). Report which are present and which are missing.
**WHY:** 71% of top-ranking websites implement comprehensive security headers. HTTPS is a confirmed ranking factor. HSTS prevents protocol downgrade attacks. CSP prevents XSS. Brands with robust CSP see 18% higher conversion rates from increased trust signals.
**DON'T:** Overstate security headers as a ranking factor. They're indirect signals — report them as trust/conversion optimizations, not direct ranking levers.

### 9. Structured Data Opportunity Mapping
**WHEN:** After crawling, check every page for existing JSON-LD and identify gaps.
**HOW:** Parse existing schema. Validate against Google's current supported types (31 active types as of March 2026). Flag: deprecated FAQ schema (restricted to gov/health), deprecated HowTo schema (removed entirely), missing Organization schema on homepage, missing BreadcrumbList on all pages, missing Product/Service schema on commercial pages. For each missing type, provide the JSON-LD template.
**WHY:** Google's Gemini-powered AI Mode uses schema to verify claims and assess source credibility. Schema now matters for AI citation even without traditional rich results. JSON-LD is Google's preferred format.
**DON'T:** Recommend FAQ schema for non-government/health sites. Don't recommend HowTo schema at all. Don't recommend Microdata or RDFa — JSON-LD only.

### 10. Index Coverage Analysis
**WHEN:** GSC is connected and provides index coverage data.
**HOW:** Pull all URL statuses: Valid (indexed), Valid with warnings, Excluded (with reason), Error. For excluded pages, categorize by reason: "Crawled - currently not indexed," "Discovered - currently not indexed," "Duplicate without user-selected canonical," "Blocked by robots.txt," etc. Cross-reference excluded pages with the BFS crawler results to identify pages the client wants indexed but Google is excluding.
**WHY:** The gap between "pages you want indexed" and "pages Google has indexed" is one of the highest-value findings in any audit. Many sites have 30-50% of their content not indexed.
**DON'T:** Just report the numbers. Every excluded URL needs a diagnosis and fix recommendation.

### 11. Anchor Text Distribution Check
**WHEN:** BFS crawler returns anchor text data for internal links.
**HOW:** Analyze anchor text distribution per target page. Flag: exact-match keyword anchors exceeding 5% of total anchors to a page (over-optimization signal), generic anchors ("click here," "read more") exceeding 30% (wasted link signal), missing descriptive anchors on navigation links.
**WHY:** Internal anchor text signals topical relevance to search engines. Over-optimized anchors trigger spam filters; generic anchors waste the relevance signal entirely.
**DON'T:** Recommend changing all anchors to exact-match keywords. Natural diversity is the goal: branded, partial-match, descriptive, and navigational anchors mixed together.

### 12. Page Load Performance Diagnosis
**WHEN:** PSI data reveals LCP > 2.5s, INP > 200ms, or CLS > 0.1 on any measured page.
**HOW:** For each failing metric, identify the specific cause from PSI diagnostics: LCP (hero image unoptimized, render-blocking CSS/JS, slow server response), INP (heavy JavaScript execution, long tasks > 50ms, event handler bottlenecks), CLS (images without dimensions, dynamically injected content, web fonts causing FOIT/FOUT). Provide the specific resource URL and optimization action.
**WHY:** 53% of sites fail CWV thresholds. Sites failing lose 8-35% of conversions, traffic, and revenue. Google's March 2026 core update strengthened performance weight in ranking.
**DON'T:** Say "improve your page speed." Name the exact resource, the exact problem, and the exact fix.

## Data Sources

| Source | What It Provides | Access Method |
|--------|-----------------|---------------|
| BFS Crawler | Pages array, internal link graph, orphan pages, broken links, anchor text distribution | `src/lib/integrations/crawler.ts` — always available |
| PageSpeed Insights API | LCP, INP, CLS, FCP, TTFB (lab + field), CrUX origin data, diagnostic opportunities | API call per URL — always available |
| Serper API | SERP features, indexation check, competitor visibility | API call — always available |
| Google Search Console | Index coverage, CWV field report, manual actions, top pages by impressions, URL inspection | OAuth — only when client connects |
| Google Analytics 4 | Bounce rate, session duration, conversion rate, top landing pages | OAuth — only when client connects |
| Site scraper | Raw HTML, meta tags, headings, schema, response headers | Direct fetch — always available |

## Output Structure

The final deliverable MUST contain these sections in this order:

1. **Executive Summary** — Health score (0-100), 3 biggest wins, 3 biggest risks, 30/60/90 day priority roadmap. Client reads this first and may read nothing else — make it count.
2. **Technical Health** — Crawlability (orphan pages, crawl depth, broken links, redirect chains), indexability (canonical tags, robots directives, index coverage), HTTPS/security status.
3. **Core Web Vitals** — Per-page LCP, INP, CLS with field and lab data. Pass/fail against thresholds. Specific failing resources identified.
4. **On-Page Fundamentals** — Title tags, meta descriptions, H1s, image alt text. Per-page audit with specific issues flagged.
5. **Content Assessment** — Thin content pages, duplicate content signals, content gap indicators.
6. **Structured Data** — Existing schema (valid/invalid), missing schema opportunities, deprecated schema warnings.
7. **Internal Linking** — Link equity distribution map, orphan pages, anchor text analysis, recommended link additions.
8. **Mobile Readiness** — Mobile PSI scores, viewport/font/tap-target checks, content parity.
9. **Security Posture** — HTTPS, HSTS, CSP, X-Frame-Options, X-Content-Type-Options status.
10. **Prioritized Action Plan** — Every finding as a row: Issue, Severity, Affected URLs (count + examples), Effort, Expected Impact, Implementation Steps.

## Quality Gate

Before delivering to the client, verify ALL of the following:

- [ ] Every finding references at least one specific URL — no generic "your site has issues" statements
- [ ] Health score is calculated from actual data, not estimated
- [ ] CWV section includes field data (CrUX) when available, with explicit note when only lab data is used
- [ ] No deprecated schema recommendations (FAQ for non-gov/health, HowTo for any site)
- [ ] Redirect chains show the full chain with status codes, not just "redirect chain found"
- [ ] Orphan pages are cross-referenced with search performance data when GSC is available
- [ ] Action plan has effort estimates (Quick Win / Medium / Large) for every item
- [ ] Action plan items are sorted by impact-to-effort ratio, not just severity
- [ ] Mobile PSI data is included (not just desktop)
- [ ] Broken links include both the broken URL and the page(s) linking to it
- [ ] Internal link analysis connects to business priorities (which pages should rank)
- [ ] Executive summary is understandable by a non-technical business owner

## Cross-Service Connections

- **Receives from:** Client onboarding (target URL, business type, priority pages, CMS platform)
- **Sends to:**
  - `technical_audit` (Kenji) — broken links list, redirect chains, crawl depth data, security header findings
  - `on_page_audit` (Mika) — per-page title/meta/H1 issues, thin content page list, missing alt text
  - `schema_generation` (Kenji) — existing schema inventory, missing schema opportunities per page
  - `redirect_map` (Kenji) — redirect chain data, broken link destinations needing redirects
  - `meta_optimization` (Mika) — current title/meta data per page, character counts, duplication flags
  - `cwv_optimization` (shared) — PSI diagnostic data, failing metrics per page, specific resource URLs

**Data fields that transfer:**
- `orphan_pages[]` — URLs with 0-1 inbound links
- `broken_links[]` — `{url, status_code, referring_pages[]}`
- `redirect_chains[]` — `{origin, hops[{url, status}], final_destination}`
- `cwv_scores{}` — `{url, lcp_field, lcp_lab, inp_field, inp_lab, cls_field, cls_lab}`
- `page_meta[]` — `{url, title, title_length, description, description_length, h1, canonical, robots}`

## Output Examples

### Good Example: Executive Summary

> **Site Health Score: 62/100**
>
> Your site has strong content foundations but is leaking significant ranking potential through technical gaps. The three highest-impact fixes — resolving 23 redirect chains affecting 847 internal links, adding internal links to 14 orphan service pages with 12,400 monthly impressions, and compressing 38 oversized images causing LCP failures on your top landing pages — can be completed within 30 days and are projected to recover 15-20% of lost organic visibility. The biggest risk is your /services/ section: 9 of 12 service pages have fewer than 3 internal links each, while your blog archive pages average 34 internal links. Your crawl budget is being spent on 2,100 faceted navigation URLs instead of your 89 indexable product pages.

### Bad Example: Executive Summary

> Your website has some issues that need to be fixed. There are problems with page speed, some broken links, and meta descriptions are missing on several pages. We recommend improving your site's technical SEO to achieve better rankings. Overall, the site needs work but has potential.

*Why it fails: No health score, no specific URLs or numbers, no prioritization, no business impact. A client cannot take action on "some issues" and "several pages." The good example names exact counts, specific sections, and projected impact.*

### Good Example: Finding Row (Prioritized Action Plan)

> | Redirect chain: /services/plumbing → /old-services/plumbing-v2 → /services/residential-plumbing (3 hops, both 301) | Critical | 1 chain, 47 internal links to origin, 12 external backlinks | Quick Win | ~30% link equity recovery to /services/residential-plumbing; page currently ranks #14 for "residential plumbing austin" ($28 CPC) | Flatten to single 301: /services/plumbing → /services/residential-plumbing. Update 47 internal links to point directly to final destination. |

### Bad Example: Finding Row (Prioritized Action Plan)

> | Redirect chain found | Medium | Some pages | Medium effort | Could improve SEO | Fix the redirect chain |

*Why it fails: No URLs, no status codes, no link equity at risk, no specific implementation steps. "Some pages" and "could improve SEO" give the client nothing to act on.*

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| "Your site loads slowly" | No specificity, no actionable insight | "Homepage LCP is 4.2s (field) due to unoptimized hero image at /images/hero.jpg (2.4MB). Compress to WebP, target < 200KB." |
| Listing 500 issues with equal priority | Overwhelms client, nothing gets fixed | Prioritize by impact-to-effort ratio. Top 10 fixes first. |
| Recommending FAQ schema | Restricted to government/health sites since 2026 | Recommend applicable types: Organization, BreadcrumbList, Product, LocalBusiness, Article |
| "Add meta descriptions to all pages" | Generic advice, no implementation detail | "Page /services is missing meta description. Recommended: '[specific 155-char description based on page content]'" |
| Reporting Lighthouse score as "your CWV score" | Lab data ≠ field data; Google uses field data for ranking | Report CrUX field data as primary, Lighthouse as diagnostic supplement |
| Ignoring pages behind JavaScript rendering | Client-rendered content may be invisible to most bots | Note JS rendering dependency; recommend SSR or static generation for critical content |
| One-size-fits-all crawl depth recommendation | 3-click rule is a myth; relevance and link equity matter more | Analyze actual crawl depth distribution; flag pages > 4 clicks deep that have search value |
| Auditing only the homepage | Misses 90%+ of site issues | Audit all crawled pages; sample across templates (homepage, category, product/service, blog, utility) |
