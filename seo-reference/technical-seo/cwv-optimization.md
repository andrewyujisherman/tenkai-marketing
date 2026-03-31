# Core Web Vitals Optimization — Agent Reference (Shared / cwv_optimization)

## What This Produces
A Core Web Vitals diagnostic and optimization report that identifies specific performance failures per page, traces each failure to its root cause (exact resource, exact bottleneck), and delivers implementation-ready fixes prioritized by ranking and conversion impact.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **Field data drives every recommendation.** CrUX p75 field data is the ranking signal — not Lighthouse lab scores. Both are reported; field data determines pass/fail and priority.
- **Root cause, not symptom.** "LCP is 4.2s" is a symptom. "LCP is 4.2s because `/images/hero.jpg` is 2.4MB uncompressed PNG served without CDN cache headers" is a diagnosis.
- **Per-page, per-metric specificity.** Every failing metric is traced to a specific resource, script, or layout behavior on a specific URL — never "your site has CLS issues."
- **Business impact quantified.** Sites failing CWV lose 8-35% of conversions, traffic, and revenue. Premium reports estimate the conversion/revenue impact of each fix.
- **INP is the new metric.** INP replaced FID in March 2024. Any report still referencing FID is outdated. INP measures full interaction responsiveness, not just first input delay.

## Metric Thresholds (2024-2026)

| Metric | Good | Needs Improvement | Poor | Measures |
|--------|------|-------------------|------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s | Loading performance — when main content is visible |
| **INP** (Interaction to Next Paint) | < 200ms | 200ms - 500ms | > 500ms | Interactivity — responsiveness to user input |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 | Visual stability — unexpected layout shifts |

**Assessment method:** Google uses the 75th percentile (p75) of real user data from the Chrome User Experience Report (CrUX). A page passes only if 75% of visits have a "good" experience across all three metrics.

**Impact data (2026):** Only 47% of sites reach Google's "good" thresholds. The remaining 53% lose between 8% and 35% of conversions, traffic, and revenue. Google's March 2026 core update strengthened the weight of performance in its ranking algorithm.

## Build Process (Ordered Steps)

1. **Identify target pages.** Homepage + top 5-10 pages by traffic (from GSC if connected, otherwise top navigation pages + highest-value commercial pages).

2. **Pull CrUX field data.** Use the CrUX API (free, no key required for origin-level data) or PSI API to get p75 field metrics for each target page: LCP, INP, CLS. Record origin-level summary as site baseline.

3. **Pull Lighthouse lab data.** Run PSI API for each target page (mobile + desktop). Extract: LCP breakdown (TTFB, resource load, render delay), TBT (proxy for INP), CLS sources, render-blocking resources, unused JS/CSS bytes.

4. **Compare field vs. lab.** Flag any metric where lab says "good" but field says "needs improvement" or "poor" — this indicates real-user conditions (slow devices, poor connections) that lab testing misses.

5. **Diagnose LCP failures.** For each page with LCP > 2.5s: identify the LCP element (hero image, heading text, video poster), trace the load chain (TTFB → resource discovery → download → render), identify the bottleneck stage.

6. **Diagnose INP failures.** For each page with INP > 200ms: identify long tasks (> 50ms) via TBT breakdown, trace to specific scripts (third-party tags, framework hydration, event handlers), measure main-thread blocking time.

7. **Diagnose CLS failures.** For each page with CLS > 0.1: identify shifting elements (images without dimensions, dynamic ad slots, late-loading web fonts, injected banners), record the shift score contribution of each element.

8. **Prioritize fixes.** Score each fix by: metric impact (how much it moves the needle), page importance (traffic/revenue), implementation effort. Quick wins first.

9. **Generate implementation specs.** For each fix: exact file/resource to change, before state, target after state, code snippet or config change, expected metric improvement.

10. **Compile report.** Per Output Structure below with executive summary, per-page breakdowns, and prioritized action plan.

## Critical Patterns

### 1. LCP Hero Image Optimization
**WHEN:** LCP element is an image and LCP > 2.5s.
**HOW:** Check image format (convert to WebP/AVIF, target 80% quality), dimensions (serve at display size, not oversized), compression (target < 200KB for hero images), loading priority (`fetchpriority="high"` on LCP image, remove `loading="lazy"`), and delivery (CDN with proper cache headers, preload via `<link rel="preload">`). Check if the image is discovered late (CSS background-image vs. `<img>` in HTML).
**WHY:** Hero images are the #1 LCP element on most pages. An unoptimized 2MB PNG served without CDN caching can add 2-4 seconds to LCP alone. Images in CSS `background-image` are discovered later than `<img>` tags in HTML, adding discovery delay.
**DON'T:** Lazy-load the LCP image. `loading="lazy"` on the largest above-the-fold image delays its load, worsening LCP. Only lazy-load below-fold images.

### 2. TTFB Reduction (Server Response Time)
**WHEN:** Lighthouse reports TTFB > 800ms, or field LCP is poor despite optimized resources.
**HOW:** Check server response time separately from resource loading. Common causes: no CDN (origin server serves all requests), no page-level caching (dynamic pages regenerated on every request), slow database queries, cold-start penalties on serverless functions. Solutions: CDN with edge caching, static generation or ISR for content pages, database query optimization, connection prewarming.
**WHY:** TTFB is the floor of LCP — nothing can paint until the first byte arrives. A 2s TTFB makes a 2.5s LCP target impossible regardless of resource optimization.
**DON'T:** Ignore TTFB and only optimize images. If the server is slow, no amount of image compression will fix LCP.

### 3. Render-Blocking Resource Elimination
**WHEN:** Lighthouse flags render-blocking CSS or JavaScript in the critical path.
**HOW:** Identify all `<link rel="stylesheet">` and `<script>` tags in `<head>` that block first render. Solutions: inline critical CSS (above-fold styles in `<style>` tags), defer non-critical CSS (`media="print" onload="this.media='all'"`), defer/async non-critical JS (`defer` or `async` attributes), move scripts to end of `<body>`.
**WHY:** Every render-blocking resource adds its download + parse time to LCP. Three blocking stylesheets of 50KB each can add 500ms-1.5s depending on connection speed.
**DON'T:** Async-load CSS that controls above-fold layout — this causes massive CLS as unstyled content flashes and then shifts when styles load.

### 4. INP Long Task Breaking
**WHEN:** INP > 200ms or TBT > 200ms in lab data.
**HOW:** Profile main-thread activity to find long tasks (> 50ms). Common culprits: framework hydration (React, Vue), third-party tag managers executing synchronously, complex event handlers (scroll, input, click). Solutions: break long tasks with `setTimeout(fn, 0)` or `requestIdleCallback`, use `requestAnimationFrame` for visual updates, defer non-critical JS to `afterInteractive`, move heavy computation to Web Workers.
**WHY:** INP measures the worst interaction latency during a page visit. A single 500ms long task during a button click fails INP for that entire page visit. p75 means 75% of visits must have all interactions under 200ms.
**DON'T:** Only optimize first-load performance. INP measures ALL interactions throughout the page lifecycle — a slow dropdown menu at minute 3 fails INP just as much as slow hydration at load.

### 5. Third-Party Script Impact Assessment
**WHEN:** Always — third-party scripts are the #1 cause of INP failures and a major LCP contributor.
**HOW:** Catalog all third-party scripts (analytics, tag managers, chat widgets, ad scripts, social embeds). For each: measure main-thread blocking time, download size, execution time. Solutions: load non-critical third parties after `onload`, use `async` or `defer`, replace heavy widgets with lightweight alternatives (e.g., facade pattern for YouTube embeds), implement consent-based loading.
**WHY:** The average website loads 20+ third-party scripts. Google Tag Manager alone, misconfigured, can add 500ms+ to TBT. Chat widgets frequently add 200-500KB of JavaScript that blocks interaction.
**DON'T:** Remove analytics or consent management scripts — these are business-critical. Defer them, don't delete them.

### 6. CLS Image and Media Dimension Enforcement
**WHEN:** CLS > 0.1, or any image/video/iframe lacks explicit width and height attributes.
**HOW:** Ensure every `<img>`, `<video>`, and `<iframe>` has explicit `width` and `height` attributes in HTML (not just CSS). Use CSS `aspect-ratio` for responsive containers. For responsive images, the HTML attributes provide the aspect ratio hint — CSS controls actual display size.
**WHY:** When the browser doesn't know an element's dimensions before loading, it allocates zero space, then shifts content when the element loads. A single hero image without dimensions can cause a CLS of 0.3+ by itself.
**DON'T:** Set dimensions only in CSS. The HTML `width`/`height` attributes are what the browser uses for pre-layout space reservation before CSS is parsed.

### 7. Web Font CLS Prevention
**WHEN:** CLS occurs during font loading — text renders in fallback font, then shifts when custom font loads (FOUT/FOIT).
**HOW:** Use `font-display: swap` in `@font-face` declarations (shows fallback immediately, swaps when ready). Preload critical fonts with `<link rel="preload" as="font" type="font/woff2" crossorigin>`. Use `size-adjust`, `ascent-override`, `descent-override` on fallback fonts to match custom font metrics, minimizing layout shift on swap.
**WHY:** Font swapping causes text to reflow — different fonts have different metrics, so lines wrap differently, causing CLS. A single font swap can cause 0.05-0.15 CLS.
**DON'T:** Use `font-display: block` — it creates invisible text (FOIT) for up to 3 seconds, harming both UX and LCP if text is the LCP element.

### 8. Dynamic Content Injection CLS
**WHEN:** CLS caused by dynamically inserted elements: ad slots, cookie banners, notification bars, lazy-loaded content above the fold.
**HOW:** Reserve space for dynamic elements with CSS `min-height` on container elements. For ad slots: set explicit dimensions matching the ad size. For cookie banners: use fixed/sticky positioning (positioned elements don't cause CLS). For above-fold lazy content: don't lazy-load anything above the fold.
**WHY:** A 250px ad banner injected above content pushes everything down, causing a CLS of 0.2+ affecting every element below it. Google specifically calls out ad-related CLS as a negative ranking signal.
**DON'T:** Inject content above existing content without reserving space. If space cannot be reserved (unknown ad size), use sticky/fixed positioning or place the slot below the fold.

### 9. CrUX Data Methodology Awareness
**WHEN:** Interpreting any CWV data — always clarify field vs. lab context.
**HOW:** CrUX collects data from Chrome users who have opted into usage statistic reporting. It uses the 75th percentile (p75) — meaning 75% of page visits must be "good" for the page to pass. Data is aggregated over a rolling 28-day window. Origin-level data (entire domain) is always available; page-level data requires sufficient traffic (typically 1,000+ page views per month in Chrome).
**WHY:** Google uses CrUX p75 field data as the ranking signal, not lab data. A site that scores 95 in Lighthouse but has poor CrUX scores is still penalized. Only 47% of sites pass all three CWV thresholds in CrUX.
**DON'T:** Claim a page "passes CWV" based on a single Lighthouse run. Lab conditions (fast machine, stable network) don't represent real users on slow phones over cellular connections.

### 10. Mobile-First Performance Priority
**WHEN:** Every CWV assessment — Google uses mobile-first indexing for all sites.
**HOW:** Always test mobile first. Mobile devices have less CPU (4-8x slower than desktop for JS execution), less memory, and slower connections. Mobile CrUX data is the primary ranking signal. Pull both mobile and desktop PSI results, but prioritize mobile failures.
**WHY:** The performance gap between mobile and desktop is typically 2-3x. A page with 1.5s LCP on desktop can easily have 4s LCP on mobile. Google ranks based on mobile performance.
**DON'T:** Only test desktop performance and assume mobile will be similar. If you only run one test, make it mobile.

### 11. Resource Preloading and Priority Hints
**WHEN:** LCP element loads late because the browser discovers it too late in the parsing process.
**HOW:** Use `<link rel="preload">` to tell the browser about critical resources before it discovers them naturally. For LCP images: `<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">`. For critical fonts: `<link rel="preload" as="font" type="font/woff2" href="/font.woff2" crossorigin>`. Use `fetchpriority="high"` on LCP elements and `fetchpriority="low"` on below-fold images. Use `<link rel="preconnect">` for third-party origins used early (CDNs, font providers, analytics).
**WHY:** Without preloading, the browser discovers resources sequentially as it parses HTML and CSS. An LCP image referenced only in a CSS file isn't discovered until the CSS is downloaded and parsed — adding 200-500ms to LCP. Preloading moves discovery to the initial HTML parse. The `fetchpriority` API (supported since Chrome 101) gives the browser explicit signals about which resources matter most.
**DON'T:** Preload everything — this defeats the purpose and can actually slow down critical resources by creating bandwidth contention. Preload only 1-3 truly critical resources (LCP image, primary font, critical CSS). Don't preload resources that are already discoverable in the HTML `<head>`.

### 12. JavaScript Bundle Optimization for INP
**WHEN:** INP failures trace to large JavaScript bundles that block the main thread during parsing and execution.
**HOW:** Audit JavaScript bundle size and composition. Common fixes: code-split by route (only load JS needed for the current page), tree-shake unused exports, replace heavy libraries with lighter alternatives (e.g., date-fns instead of moment.js, Preact instead of React for simple pages). Use dynamic `import()` for non-critical features (modals, tooltips, carousels). Implement module/nomodule pattern to serve modern ES modules to modern browsers and legacy bundles only to old browsers. Target < 150KB total JavaScript for initial page load (compressed).
**WHY:** Every kilobyte of JavaScript costs more than a kilobyte of images — JS must be downloaded, parsed, compiled, AND executed. On a mid-range mobile device, 1MB of JavaScript can take 4+ seconds of main-thread time. Large bundles cause long tasks that directly fail INP when users interact during execution.
**DON'T:** Serve a single monolithic bundle for the entire site. Don't load JavaScript for features not present on the current page. Don't assume gzip compression solves bundle size — compressed transfer size matters, but parse/execution time depends on uncompressed size.

## Data Sources

| Source | What It Provides | Access Method |
|--------|-----------------|---------------|
| CrUX API | p75 field data for LCP, INP, CLS per origin and per URL (28-day rolling) | Free API — `https://chromeuxreport.googleapis.com/v1/records:queryRecord` |
| PageSpeed Insights API | Lab data (Lighthouse) + CrUX field data, diagnostic opportunities, resource breakdown | Free API per URL — always available |
| Google Search Console | CWV report (good/needs-improvement/poor URL counts), URL groupings by template | OAuth — only when client connects |
| Chrome DevTools | Long task profiling, CLS source attribution, network waterfall, JS execution timeline | Manual testing or Puppeteer automation |
| Web Vitals JS Library | Real-user CWV measurement with attribution (identifies exact elements/resources) | `web-vitals` npm package, client-side instrumentation |
| HTTP Archive | Industry-wide CWV benchmarks by technology, CMS, industry | Public dataset via BigQuery or `httparchive.org` |

## Output Structure

The final deliverable MUST contain these sections in this order:

1. **Executive Summary** — Site-wide CWV pass/fail status (field data), count of pages passing vs. failing, estimated traffic/conversion impact of failures, top 3 quick wins.

2. **Site-Wide CrUX Summary** — Origin-level p75 for LCP, INP, CLS. Comparison against industry benchmarks. Trend direction (improving/declining if historical data available).

3. **Per-Page Breakdown** — For each measured page:
   - LCP: field + lab values, LCP element identified, bottleneck stage (TTFB / resource load / render delay)
   - INP: field + lab values, longest tasks identified, specific scripts responsible
   - CLS: field + lab values, shifting elements identified with individual shift score contribution
   - Pass/fail badge per metric per page

4. **LCP Optimization Plan** — Grouped by fix type (image optimization, TTFB reduction, render-blocking elimination). Each fix: specific URL, specific resource, current state, target state, implementation steps.

5. **INP Optimization Plan** — Grouped by fix type (long task breaking, third-party deferral, event handler optimization). Each fix: specific script, blocking time, recommended approach.

6. **CLS Optimization Plan** — Grouped by fix type (dimension enforcement, font optimization, dynamic content reservation). Each fix: specific element, shift score contribution, implementation steps.

7. **Prioritized Action Plan** — Every fix as a row: Fix, Metric Impacted, Pages Affected, Effort (Quick Win/Medium/Large), Expected Improvement (ms or CLS score reduction), Implementation Priority.

## Quality Gate

Before delivering to the client, verify ALL of the following:

- [ ] Field data (CrUX) is used as the primary pass/fail metric, not Lighthouse scores
- [ ] When field data is unavailable (low-traffic pages), this is explicitly stated with lab data limitations noted
- [ ] Every failing metric traces to a specific resource, script, or element — no vague "improve your speed" statements
- [ ] INP is used as the interaction metric, not FID (FID was replaced March 2024)
- [ ] Mobile performance is tested and reported — not just desktop
- [ ] Third-party scripts are assessed separately with blocking time attributed
- [ ] CLS sources are identified per shifting element, not just a page-level score
- [ ] LCP element is identified for every page (image, text block, video poster)
- [ ] Implementation fixes include specific code changes or config adjustments
- [ ] Effort estimates are provided for every fix
- [ ] Business impact is estimated (traffic/conversion risk of not fixing)

## Cross-Service Connections

- **Receives from:**
  - `site_audit` (Haruki) — PSI diagnostic data, failing metrics per page, specific resource URLs from the comprehensive audit
  - `technical_audit` (Kenji) — server configuration data, CDN status, caching headers
  - Client onboarding — priority pages, CMS platform, hosting environment
- **Sends to:**
  - `site_audit` (Haruki) — CWV section data for the comprehensive audit report
  - `technical_audit` (Kenji) — server-side optimization recommendations (TTFB, caching, CDN)
  - `content_article` (Sakura) — image optimization specs (format, dimensions, compression targets) for new content
  - `schema_generation` (Kenji) — performance-related structured data (WebPage speed metrics for internal tracking)
  - `monthly_report` — CWV trend data, before/after comparisons for implemented fixes

**Data fields that transfer:**
- `cwv_scores{}` — `{url, lcp_field, lcp_lab, inp_field, inp_lab, cls_field, cls_lab, lcp_element, inp_longest_task_ms}`
- `optimization_queue[]` — `{url, metric, current_value, target_value, fix_type, effort, priority}`
- `third_party_impact[]` — `{script_url, domain, blocking_time_ms, size_kb, recommendation}`

## Output Examples

### Good Example: CWV Finding (LCP)

> **Page:** `/services/emergency-plumbing` (3,200 sessions/mo, top commercial page)
> **Metric:** LCP
> **Field (CrUX p75):** 4.8s — POOR (threshold: < 2.5s)
> **Lab (Lighthouse mobile):** 3.9s — POOR
>
> **LCP Element:** Hero image — `/images/emergency-plumber-hero.png`
> **Root Cause Breakdown:**
> - TTFB: 380ms (acceptable)
> - Resource discovery delay: +1,200ms — image is set via CSS `background-image` in `/css/pages.css`, not discoverable until CSS is downloaded and parsed
> - Download time: +2,800ms — image is 3.1MB uncompressed PNG, served from origin (no CDN), no cache headers
> - Render delay: +420ms — render-blocking `<script src="/js/analytics-bundle.js">` in `<head>`
>
> **Fix:** Convert `/images/emergency-plumber-hero.png` (3.1MB PNG) to WebP at 80% quality (target: < 180KB). Move from CSS `background-image` to `<img>` tag in HTML with `fetchpriority="high"` and `width="1200" height="630"`. Add `<link rel="preload" as="image" href="/images/emergency-plumber-hero.webp">`. Defer analytics script with `async` attribute.
>
> **Expected improvement:** LCP reduction from 4.8s to ~1.8s (within "good" threshold). This page drives an estimated $12,800/mo in lead value — passing CWV removes the ranking penalty.

### Bad Example: CWV Finding (LCP)

> The emergency plumbing page is slow. LCP is above the recommended threshold. We recommend optimizing images and reducing JavaScript to improve load times.

*Why it fails: No field vs. lab distinction, no LCP element identified, no root cause breakdown (is it TTFB? Resource load? Render delay?), no specific file names, no target metrics, no business impact. "Optimize images" without naming which image, what format, and what size is not actionable.*

### Good Example: Before/After Optimization

> **Fix implemented:** Hero image optimization on `/services/emergency-plumbing`
>
> | Metric | Before | After | Change |
> |--------|--------|-------|--------|
> | Image format | PNG | WebP | — |
> | Image file size | 3.1 MB | 164 KB | -94.7% |
> | Image delivery | Origin server, no cache headers | CDN (Cloudflare), `Cache-Control: public, max-age=31536000` | Edge-cached |
> | Image discovery | CSS `background-image` (late discovery) | `<img>` in HTML with `fetchpriority="high"` + `<link rel="preload">` | Immediate discovery |
> | LCP (field p75) | 4.8s | 1.9s | -2.9s (60% improvement) |
> | LCP (lab mobile) | 3.9s | 1.4s | -2.5s (64% improvement) |
> | CWV status | POOR | GOOD | Passed threshold |
>
> **Note:** Field data reflects the 28-day CrUX rolling window. Full field improvement visible approximately 4 weeks after deployment.

### Bad Example: Before/After Optimization

> We optimized the images on the site. Page speed improved. The site should load faster now.

*Why it fails: No specific page, no specific image, no before/after metrics, no field vs. lab data, no CWV pass/fail status change. "Should load faster" is a guess — measurement confirms results.*

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| "Your site is slow" | No specificity, no actionable insight | "Homepage LCP is 4.2s (field p75) — LCP element is hero image `/img/hero.jpg` (2.4MB PNG, no CDN). Convert to WebP < 200KB, add `fetchpriority='high'`." |
| Reporting Lighthouse score as "your CWV score" | Lab data is not the ranking signal; Google uses CrUX field data | Report CrUX p75 as primary. Use Lighthouse only for diagnostics and when field data is unavailable. |
| Referencing FID in 2024+ reports | FID was replaced by INP in March 2024 | Use INP exclusively. INP measures all interactions, not just first input. |
| "Optimize your images" without specifics | Client doesn't know which images, what format, what size | "Convert `/img/hero.jpg` from PNG (2.4MB) to WebP (target < 200KB at 80% quality). Add `width='1200' height='630'` attributes." |
| Testing only on fast desktop connection | Doesn't represent real mobile users on 4G | Test mobile first. Use 4G throttling in Lighthouse. Prioritize mobile CrUX data. |
| Lazy-loading the LCP image | `loading="lazy"` delays the most important image | Use `fetchpriority="high"` on LCP image. Only lazy-load below-fold images. |
| "Remove all third-party scripts" | Analytics, consent, and business tools are necessary | Defer non-critical scripts to after `onload`. Use facade pattern for heavy embeds. Keep business-critical scripts but optimize their loading. |
| Fixing lab scores while ignoring field data | A Lighthouse 100 with poor CrUX still fails Google's assessment | Monitor CrUX over 28-day windows. Lab improvements should be validated against field data trends. |
