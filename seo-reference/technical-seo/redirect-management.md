# Redirect Management, Robots.txt & Sitemaps — Agent Reference (Kenji / redirect_map + robots_sitemap)

## What This Produces
A comprehensive redirect strategy (301/302 mapping, chain resolution, migration planning), optimized robots.txt configuration, and clean XML sitemap — ensuring crawl budget is spent on indexable content, link equity is preserved through redirects, and search engines can discover and prioritize every important page.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **Full chain tracing with equity math.** Every redirect chain is mapped from origin to final destination with status codes per hop, total chain length, and estimated link equity loss (~15% per hop). Each chain resolution includes the specific flat redirect to implement.
- **Robots.txt as crawl budget strategy.** Not just "don't block important pages" — the robots.txt is engineered to protect crawl budget on large sites by blocking known low-value paths (faceted navigation, internal search results, session parameters) while keeping every indexable page accessible.
- **Sitemap as indexation directive.** The XML sitemap contains only canonical, indexable URLs with accurate lastmod dates — no 404s, no redirects, no noindexed pages, no non-canonical URLs. Sitemap quality directly influences crawl priority.
- **Migration-grade redirect planning.** For site redesigns, domain changes, or URL restructuring: a complete redirect map with old-to-new URL mapping, validation that every old URL with traffic/links gets a 301, and a monitoring plan for post-migration traffic recovery.

## Build Process (Ordered Steps)

1. **Receive crawl data and site context.** Accept BFS crawler output (all discovered URLs, status codes, redirect chains), site audit findings, and client context (planned URL changes, migrations, CMS platform).
2. **Map all existing redirects.** From crawl data: enumerate every redirect found. For each: origin URL, HTTP status code (301/302/307/308), destination URL. Trace chains to final destination. Flag chains with 2+ hops.
3. **Classify redirects.** Categorize: (a) 301 permanent — correct for permanent URL changes, (b) 302 temporary — flag if the change is actually permanent (common misconfiguration), (c) redirect chains — flag for flattening, (d) redirect loops — critical error, (e) redirects to 404s — critical error, (f) redirects to non-canonical URLs — creates conflicting signals.
4. **Calculate redirect impact.** For each chain or problem redirect: count internal links pointing to the origin URL (link equity at risk), check if the origin URL has external backlinks (high-value redirects), check if the origin URL has search impressions in GSC (traffic at risk). Prioritize fixes by equity/traffic at risk.
5. **Generate redirect resolution map.** For each problem redirect: specify the exact fix. Chains: "Change A → B → C to A → C directly." 302s that should be 301s: "Change 302 to 301 at [URL]." Redirect loops: "Break loop by pointing [URL] to [destination]." Format as a table ready for implementation.
6. **Audit robots.txt.** Fetch current robots.txt. Check: (a) important pages not blocked, (b) low-value paths blocked (faceted nav, internal search, parameter URLs, admin paths), (c) sitemap URL declared, (d) no blanket disallow blocking entire directories that contain indexable content, (e) user-agent directives are correct (Googlebot, Bingbot, specific AI crawlers if relevant), (f) crawl-delay directive present only if needed (large sites with crawl budget pressure).
7. **Optimize robots.txt.** Produce an optimized robots.txt with: appropriate disallow rules for crawl waste paths, sitemap declaration, user-agent specific rules where needed, and comments explaining each rule.
8. **Audit XML sitemap.** Fetch current sitemap(s). Check: (a) all indexable canonical pages are included, (b) no 404/410 URLs, (c) no redirecting URLs, (d) no noindexed URLs, (e) no non-canonical URLs, (f) lastmod dates are accurate (not all set to today's date), (g) sitemap is under 50MB / 50,000 URLs per file (Google's limits), (h) sitemap index file used for larger sites.
9. **Generate clean sitemap.** Produce a sitemap containing only canonical, indexable, 200-status URLs with accurate lastmod dates. For sites with multiple content types, recommend separate sitemaps (pages, posts, products, images, videos) combined under a sitemap index.
10. **Create migration redirect plan (if applicable).** For URL restructuring or domain migration: old URL → new URL mapping for every page, validation that every old URL with backlinks or GSC impressions has a 301, testing plan (pre-launch validation, post-launch monitoring), rollback strategy.
11. **Compile deliverable with implementation instructions.** Include CMS-specific guidance for redirect implementation (.htaccess for Apache, nginx.conf, Cloudflare page rules, WordPress plugins, Shopify URL redirects).

## Critical Patterns

### 1. 301 vs. 302 Classification
**WHEN:** Every redirect found during crawl.
**HOW:** A 301 signals a permanent move — search engines transfer link equity to the destination and eventually deindex the origin. A 302 signals a temporary move — search engines may keep the origin indexed and don't fully transfer equity. Audit every 302: if the content has permanently moved (URL restructure, old page replaced), it should be a 301. If the redirect is genuinely temporary (A/B test, seasonal page, maintenance), 302 is correct.
**WHY:** 302 redirects that should be 301s are the most common redirect misconfiguration. They silently prevent link equity transfer, keeping valuable PageRank trapped on URLs that no longer exist. Over months, this accumulates into significant ranking losses.
**DON'T:** Assume all 302s are wrong. Some are intentional (split testing, temporary maintenance pages). Ask the client about intent before blanket-recommending 301 conversion.

### 2. Redirect Chain Resolution
**WHEN:** Crawler finds redirect chains with 2+ hops (A → B → C or longer).
**HOW:** Trace each chain from origin to final destination. Report: origin URL, each intermediate hop with HTTP status code, final destination URL, total chain length, internal links pointing to the chain origin, external backlinks on the chain origin (if available). Calculate link equity loss: approximately 15% per hop, so a 3-hop chain loses ~40% of equity. Generate the flat redirect: A → C directly (skip B).
**WHY:** Each hop adds 50-300ms latency and leaks ~15% link equity. Chains of 3+ hops risk Googlebot abandoning the crawl entirely. On large sites, redirect chains consume crawl budget on non-productive requests.
**DON'T:** Only report "redirect chain found." Always specify the exact flat redirect to implement. Include the count of internal links pointing to the chain origin so the client understands the scope of equity at risk.

### 3. Redirect Loop Detection
**WHEN:** Crawler detects URLs that redirect back to themselves or into circular patterns.
**HOW:** Flag immediately as critical. A redirect loop means the URL is completely inaccessible — returns an error to both users and crawlers. Trace the loop pattern (A → B → A, or A → B → C → A). Identify the intended destination and specify the fix: break the loop by pointing one URL in the chain to the correct final destination.
**WHY:** Redirect loops are hard errors that prevent any content from being served. They waste crawl budget, break user experience, and cause search engines to drop the URLs from the index entirely.
**DON'T:** Classify redirect loops as "medium" severity. They are always critical — the affected URLs are completely broken.

### 4. Robots.txt Crawl Budget Engineering
**WHEN:** Optimizing robots.txt, especially for sites with 1,000+ pages.
**HOW:** Identify low-value crawl paths that consume Googlebot's crawl budget: (a) faceted navigation URLs (/products?color=red&size=large — potentially infinite combinations), (b) internal search result pages (/search?q=), (c) session ID parameters (?sid=, ?session=), (d) pagination beyond practical depth (/page/47), (e) print/PDF versions of pages, (f) admin/login/cart/checkout paths, (g) tag/category archives that duplicate content. Block these paths with specific Disallow rules while keeping the actual content pages accessible.
**WHY:** Google's crawl budget documentation states crawl budget management matters for large sites. Every Googlebot request spent on a faceted navigation URL is a request NOT spent on a new blog post or updated service page. For sites over 10K pages, this directly impacts how quickly new and updated content gets indexed.
**DON'T:** Use blanket Disallow rules that accidentally block indexable content. "Disallow: /products/" blocks all products when you only wanted to block filtered variations. Use specific patterns: "Disallow: /products?*color=" or "Disallow: /*?sid=". Always test changes with Google's robots.txt tester.

### 5. Robots.txt AI Crawler Management
**WHEN:** Client wants to control AI crawler access (ChatGPT, Perplexity, Anthropic, etc.).
**HOW:** Identify relevant user-agents: GPTBot (OpenAI/ChatGPT), PerplexityBot, ClaudeBot (Anthropic), Google-Extended (controls Gemini training, NOT search indexing), Bytespider (TikTok), CCBot (Common Crawl). Decision framework: blocking AI crawlers prevents content from being used in AI training BUT may also reduce AI search citation. Most businesses benefit from allowing AI crawlers — AI-referred sessions grew 527% YoY in 2025. Block only if the client has specific IP concerns.
**WHY:** AI crawler management is a 2025-2026 concern that most basic audits ignore entirely. The decision has real business implications: blocking GPTBot means content won't appear in ChatGPT Search results.
**DON'T:** Automatically block all AI crawlers. Provide the client with a clear trade-off analysis: blocking reduces AI training exposure but also reduces AI search visibility. Let the client make an informed decision.

### 6. XML Sitemap Hygiene
**WHEN:** Auditing or generating XML sitemaps.
**HOW:** The sitemap must contain ONLY URLs that are: (a) canonical (self-referencing canonical tag), (b) indexable (no noindex robots meta or X-Robots-Tag), (c) returning 200 status, (d) not redirecting, (e) not blocked by robots.txt. For each URL: include accurate lastmod date (actual last content modification, not sitemap generation date). Remove URLs that fail any criterion. For large sites: split into multiple sitemaps (max 50,000 URLs / 50MB per file) organized by content type, combined under a sitemap index.
**WHY:** A sitemap full of 404s, redirects, and noindexed pages signals poor site maintenance to search engines and wastes crawl budget. Google treats lastmod dates as hints for crawl priority — inaccurate dates (all set to today) cause Google to ignore lastmod entirely for the site.
**DON'T:** Include every URL discovered by the crawler. Don't set all lastmod dates to the generation date. Don't include URLs blocked by robots.txt (contradictory signals). Don't exceed Google's limits (50K URLs, 50MB per file).

### 7. Migration Redirect Planning
**WHEN:** Client is redesigning the site, changing domains, restructuring URLs, or switching CMS platforms.
**HOW:** Pre-migration: (a) crawl the current site to capture every URL, (b) pull GSC data for every URL with impressions or clicks in the last 12 months, (c) pull backlink data for URLs with external links, (d) create old-to-new URL mapping (every old URL that has traffic, links, or content maps to the most relevant new URL), (e) validate: every old URL with any SEO value has a 301 to a relevant destination, (f) prepare monitoring plan: track GSC impressions/clicks daily for 4 weeks post-migration, check index coverage for errors. Post-migration: (g) submit new sitemap, (h) monitor for 404 spikes, (i) track crawl stats in GSC, (j) weekly comparison of pre/post traffic for 8 weeks.
**WHY:** Site migrations are the #1 cause of catastrophic traffic loss. Without comprehensive redirect mapping, businesses routinely lose 30-80% of organic traffic. The recovery timeline is 3-12 months even with proper redirects in place. Every URL with backlinks that returns a 404 post-migration permanently destroys that link equity.
**DON'T:** Map old URLs to the new homepage as a catch-all. Each old URL should redirect to its most relevant new counterpart. If no equivalent exists, redirect to the most relevant category or parent page. Only 404 URLs that had zero traffic and zero backlinks.

### 8. Redirect Implementation by Platform
**WHEN:** Delivering redirect recommendations for implementation.
**HOW:** Provide platform-specific instructions: (a) Apache .htaccess — RewriteRule patterns with [R=301,L] flags, (b) Nginx — return 301 or rewrite directives in server block, (c) Cloudflare — Page Rules or Bulk Redirects, (d) WordPress — Redirection plugin or Yoast SEO premium redirect manager, (e) Shopify — URL Redirects in admin (limited to path-level, no regex), (f) Vercel/Netlify — _redirects file or vercel.json/netlify.toml. Include testing instructions: verify each redirect returns 301 (not 302), verify destination returns 200, verify no new chains created.
**WHY:** Generic "implement 301 redirects" instructions are useless to clients who don't know where to put them. CMS-specific guidance is the difference between a recommendation that gets implemented and one that sits in a report forever.
**DON'T:** Assume the client knows how to implement redirects. Always include the specific config syntax, file location, and testing steps for the client's platform.

### 9. Soft 404 Detection
**WHEN:** Reviewing crawl data for pages that return 200 but contain no meaningful content.
**HOW:** Flag pages that return HTTP 200 but show error messaging, "page not found" text, empty content, or redirect JavaScript. These are "soft 404s" — they waste crawl budget because Google crawls them expecting content but finds none, yet the 200 status prevents Google from efficiently removing them from the index. Check GSC's index coverage report for "Soft 404" entries.
**WHY:** Soft 404s are worse than hard 404s — at least a proper 404 tells Google to stop crawling. Soft 404s trap Googlebot in a loop of crawling useless pages that appear valid. On large sites, hundreds of soft 404s can consume significant crawl budget.
**DON'T:** Only check HTTP status codes. A 200 status doesn't mean the page is healthy. Verify that 200-status pages actually contain the expected content.

### 10. Redirect Monitoring Post-Implementation
**WHEN:** After any redirect changes are deployed.
**HOW:** Establish monitoring for 4 weeks post-deployment: (a) crawl the old URLs to verify 301 status and correct destination, (b) monitor GSC for crawl errors on redirected URLs, (c) track indexed page count in GSC (should stabilize within 2-4 weeks), (d) compare organic traffic week-over-week for affected pages, (e) check that no new redirect chains were created by the changes. Set up alerts for any 404 spikes.
**WHY:** Redirect implementations frequently have errors: wrong destinations, 302 instead of 301, missed URLs, or new chains created. Without monitoring, these errors compound silently for weeks before anyone notices the traffic impact.
**DON'T:** Consider the job done at implementation. The redirect deliverable must include a monitoring checklist and timeline for post-deployment verification.

## Data Sources

| Source | What It Provides | Access Method |
|--------|-----------------|---------------|
| BFS Crawler | All URLs with status codes, redirect chains traced, internal link counts per URL | `src/lib/integrations/crawler.ts` — always available |
| Site scraper | Robots.txt content, sitemap URLs, meta robots tags per page, canonical tags | Direct fetch — always available |
| Google Search Console | Index coverage (indexed, excluded, error), crawl stats, sitemap submission status, URL inspection | OAuth — only when client connects |
| Serper API | Indexed page count (site: query), cached page checks | API call — always available |
| Site audit output | Broken links, redirect chains, orphan pages, crawl depth data | From upstream site_audit service |
| Backlink data | External backlinks on redirected URLs (equity at risk) | From link_analysis service when available |

## Output Structure

The final deliverable MUST contain these sections in this order:

1. **Redirect Health Summary** — Total redirects found, chains count, loops count, 302s-that-should-be-301s count, estimated link equity leaking through chains, top 3 critical redirect fixes.
2. **Redirect Chain Resolution Table** — Each chain: origin URL → intermediate hops (with status codes) → final destination, internal links to origin, recommended flat redirect. Sorted by link equity at risk.
3. **301/302 Classification Audit** — Every 302 redirect flagged with recommendation: convert to 301 (permanent change) or keep as 302 (genuinely temporary). Includes rationale.
4. **Redirect Loop Report** — Each loop traced with fix recommendation. Always critical severity.
5. **Robots.txt Audit** — Current robots.txt with line-by-line analysis: what each rule does, whether it's correct, what's missing. Include AI crawler assessment.
6. **Optimized Robots.txt** — The recommended robots.txt with comments explaining each directive. Ready for deployment.
7. **Sitemap Audit** — Current sitemap analysis: total URLs, URLs returning non-200, URLs with noindex, URLs that aren't canonical, lastmod accuracy assessment.
8. **Clean Sitemap** — List of URLs that should be in the sitemap (canonical, indexable, 200-status) with accurate lastmod dates. Or the actual XML file if generation is feasible.
9. **Migration Redirect Map** (if applicable) — Old URL → New URL mapping for every page with traffic or backlinks. Includes monitoring plan.
10. **Implementation Guide** — Platform-specific redirect instructions, robots.txt deployment steps, sitemap submission steps, testing checklist.

## Quality Gate

Before delivering to the client, verify ALL of the following:

- [ ] Every redirect chain includes the full trace (origin → each hop with status code → final destination)
- [ ] Every chain resolution specifies the exact flat redirect to implement (not just "fix the chain")
- [ ] 302-to-301 recommendations include rationale (why this is a permanent change)
- [ ] Robots.txt doesn't accidentally block indexable content
- [ ] Robots.txt includes sitemap declaration
- [ ] Sitemap contains only canonical, indexable, 200-status URLs
- [ ] Sitemap lastmod dates are verified as accurate (not all identical)
- [ ] No URL exceeds sitemap limits (50K URLs / 50MB per file)
- [ ] Migration redirect map covers every URL with GSC impressions, clicks, or backlinks
- [ ] Implementation instructions are CMS/platform-specific
- [ ] Post-implementation monitoring checklist is included
- [ ] AI crawler management includes trade-off analysis, not just block/allow recommendation

## Cross-Service Connections

- **Receives from:**
  - `site_audit` (Haruki) — redirect chain data, broken link destinations, crawl depth data, security header findings
  - `on_page_audit` (Mika) — canonical tag issues, pages with conflicting directives
  - `link_analysis` (Haruki) — external backlinks on redirected URLs (equity at risk quantification)
- **Sends to:**
  - `technical_audit` (Kenji) — redirect health status, robots.txt issues, sitemap issues for technical health scoring
  - `site_audit` (Haruki) — crawl budget impact assessment, indexation directive conflicts
  - `content_decay_audit` (Yumi) — redirected URLs that previously had traffic (monitor for traffic recovery)
  - `monthly_report` (Yumi) — redirect fixes completed, sitemap health, index coverage changes

**Data fields that transfer:**
- `redirect_chains[]` — `{origin, hops[{url, status_code}], final_destination, internal_links_to_origin, backlinks_to_origin}`
- `redirect_fixes[]` — `{type: "chain"|"302_to_301"|"loop"|"soft_404", origin_url, recommended_destination, status_code_change, priority}`
- `robots_txt_issues[]` — `{line_number, current_rule, issue, recommended_change}`
- `sitemap_removals[]` — `{url, reason: "404"|"redirect"|"noindex"|"non_canonical"}`
- `migration_map[]` — `{old_url, new_url, impressions_12mo, backlinks, priority}`

## Output Examples

### Good Example: Redirect Map Entry (Chain Resolution)

> | # | Origin URL | Hop 1 | Hop 2 | Final Destination | Chain Length | Status Codes | Internal Links to Origin | External Backlinks | Recommended Fix |
> |---|-----------|-------|-------|-------------------|-------------|-------------|------------------------|-------------------|----------------|
> | 1 | `/services/plumbing-repair` | → `/services/plumbing-v2` (301) | → `/services/residential/plumbing` (302) | `/services/residential/plumbing` | 3 hops | 301 → 302 | 47 | 12 (DR 25-55) | Flatten: 301 from `/services/plumbing-repair` → `/services/residential/plumbing`. **Also fix Hop 2:** change 302 to 301 (this is a permanent move, not temporary). Estimated equity recovery: ~30% currently lost across 2 hops. Update 47 internal links to point directly to `/services/residential/plumbing`. |
>
> **Equity at risk:** 12 external backlinks (including links from HomeAdvisor DR 82 and local chamber of commerce DR 45) are passing through this 3-hop chain, losing ~40% of their equity before reaching the destination page.

### Bad Example: Redirect Map Entry

> | From | To | Status |
> |------|----|--------|
> | /services/plumbing-repair | /services/residential/plumbing | Redirect |

*Why it fails: No intermediate hops shown (masks the chain), no status codes (301 vs 302 distinction is critical for equity transfer), no internal link count or backlink data (can't assess impact), no implementation instruction. "Redirect" as a status tells the client nothing about what type or what to fix.*

### Good Example: Migration Checklist Item

> **Pre-migration checklist item #3: High-equity URL mapping**
>
> - [ ] All URLs with 1+ external backlinks mapped to equivalent new URLs (not homepage)
>   - **Current count:** 847 URLs with backlinks identified via Ahrefs export
>   - **Mapped:** 812/847 (95.9%)
>   - **Unmapped (action required):** 35 URLs — old blog posts with no equivalent in new site structure
>   - **Resolution for unmapped:** Redirect each to the most topically relevant new category page. Spreadsheet tab "Unmapped URLs" has specific mappings.
>   - **Validation method:** After deployment, crawl all 847 origin URLs. Verify each returns 301 to the correct destination (not 302, not 404, not homepage). Flag any chain > 1 hop.
>   - **Monitoring:** Track GSC crawl errors daily for 14 days post-launch. Any 404 spike on previously-redirected URLs triggers immediate investigation.

### Bad Example: Migration Checklist Item

> - [ ] Set up redirects for old pages to new pages

*Why it fails: No quantification of how many URLs need redirects, no validation method, no monitoring plan, no handling of edge cases (URLs without equivalents). A migration with this level of planning will lose 30-80% of organic traffic.*

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| "Fix your redirect chains" | No specificity — which chains, what's the correct destination? | "Chain: /old-page → /temp-page → /final-page (3 hops, 47 internal links to origin). Fix: redirect /old-page → /final-page directly. Saves ~30% link equity." |
| Blocking all AI crawlers in robots.txt by default | Prevents AI search citation, costing visibility in a channel growing 527% YoY | Present trade-off analysis. Most businesses benefit from AI crawler access. Block only with client's informed consent. |
| Sitemap with 404s and redirects | Wastes crawl budget, signals poor maintenance, teaches Google to ignore your sitemap | Only include canonical, indexable, 200-status URLs. Remove everything else. |
| Setting all sitemap lastmod to today's date | Google detects this pattern and stops trusting lastmod for the entire site | Use actual content modification dates. If you can't determine real dates, omit lastmod rather than fake it. |
| "Disallow: /" in robots.txt | Blocks entire site from crawling — complete deindexation | Never use unless intentionally blocking (staging sites only). Use specific path-level blocks. |
| Redirecting everything to the homepage during migration | Destroys ranking equity — Google treats redirect-to-homepage as a soft 404 for specific pages | Map each old URL to its most relevant new counterpart. Category pages to new categories, product pages to new products. |
| Ignoring redirect monitoring post-implementation | Errors in redirect deployment compound silently for weeks | Include 4-week monitoring checklist: verify status codes, check GSC for errors, track organic traffic to affected pages. |
| Using JavaScript redirects instead of server-side | JS redirects may not be followed by all bots; Bing, DuckDuckGo, and AI crawlers can't execute JS | Always use server-side redirects (301/302 HTTP status). Never rely on meta refresh or JavaScript window.location for SEO-critical redirects. |
