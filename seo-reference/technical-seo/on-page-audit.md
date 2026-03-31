# On-Page SEO Audit — Agent Reference (Mika / on_page_audit)

## What This Produces
A per-page on-page SEO audit covering title tags, meta descriptions, heading hierarchy (H1-H6), image alt text, internal linking assessment, content quality signals, keyword placement, and URL structure — with specific fix recommendations tied to each URL and prioritized by ranking impact.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **URL-level specificity.** Every finding references the exact page, the exact element, and the exact fix — never "some pages have missing meta descriptions."
- **Heading hierarchy as information architecture.** H1-H6 analysis goes beyond "is there an H1" to evaluate whether the heading structure communicates topical relevance, matches search intent, and supports featured snippet targeting.
- **Internal linking as equity distribution.** Each page's inbound and outbound internal links are mapped against business priorities — high-value pages with few inbound links are critical findings, not footnotes.
- **Keyword placement audited against SERP competitors.** On-page optimization is evaluated relative to what's actually ranking, not abstract "best practices."
- **Content quality signals scored holistically.** Word count, readability, E-E-A-T signals, media richness, and engagement metrics (when available) combine into an actionable content quality assessment per page.

## Build Process (Ordered Steps)

1. **Receive page list and priority targets.** Accept crawl data from the site audit (or BFS crawler output), client-specified priority pages, and keyword-to-page mapping from keyword research.
2. **Pull on-page elements for each URL.** For every page: extract title tag (text + character count), meta description (text + character count), all headings (H1-H6 with hierarchy), image tags (src + alt text), internal links (outbound count + anchor text), canonical tag, URL slug, word count, and robots meta.
3. **Audit title tags.** Check: present, unique across site, 50-60 characters, primary keyword in first half, compelling for CTR (not just keyword-stuffed), matches search intent for target query. Flag duplicates, truncation risks (>60 chars), missing keywords, and generic titles.
4. **Audit meta descriptions.** Check: present, unique, 150-160 characters, includes primary keyword naturally, contains a call-to-action or value proposition, matches page content. Flag duplicates, truncation, missing descriptions, and keyword-stuffed descriptions.
5. **Audit heading hierarchy.** Check: single H1 per page, H1 contains primary keyword, H2s cover subtopic keywords, heading nesting is logical (no H4 under H1 with no H2/H3), heading text is descriptive (not "Section 1"), no skipped heading levels. Map heading structure against top-ranking competitor pages for the target keyword.
6. **Audit image optimization.** Check: alt text present on all images, alt text is descriptive (not "image1.jpg"), alt text includes relevant keywords where natural, image filenames are descriptive, images have width/height attributes (CLS prevention), large images flagged for compression.
7. **Assess internal linking per page.** Count inbound internal links per page. Cross-reference with page priority: if a page targets a high-value keyword but has fewer than 5 inbound internal links, flag as critical. Analyze anchor text of inbound links for keyword relevance. Identify pages that should link to this page but don't.
8. **Map link equity flow.** Identify the top 10 pages by inbound internal link count (authority donors). Identify the bottom 10 priority pages by inbound link count (equity-starved). Recommend specific internal links FROM authority donors TO equity-starved priority pages.
9. **Evaluate content quality signals.** Per page: word count (flag <300 as thin), readability score (target 8th grade / Flesch-Kincaid 60-70), E-E-A-T signals (author bio, credentials, experience markers, citations to sources), media presence (images, videos, infographics), and keyword density (target 1-2% for primary, 0.5-1% for secondary).
10. **Audit keyword placement.** For each page's target keyword: present in title tag, present in H1, present in first 100 words, present in at least one H2, present in meta description, present in URL slug, present in at least one image alt text. Score placement completeness (0-7 checkpoints).
11. **Audit URL structure.** Check: descriptive slugs (not /page?id=123), hyphens not underscores, lowercase, reasonable length (<75 chars), no unnecessary parameters, keyword in URL slug, logical folder hierarchy reflecting site architecture.
12. **Score and prioritize findings.** Assign each finding: severity (Critical/High/Medium/Low), affected URL, specific fix with before/after example, expected impact on ranking for the target keyword.
13. **Compile per-page audit cards and site-wide summary.** Each page gets an audit card; site-wide patterns get aggregate recommendations.

## Critical Patterns

### 1. Title Tag Optimization Against SERP
**WHEN:** Auditing title tags for pages targeting specific keywords.
**HOW:** Pull actual SERP results for the target keyword via Serper API. Compare the client's title tag against the top 5 ranking titles: keyword position within title, title length, presence of modifiers (year, "best," "guide"), emotional/CTR triggers. Identify what the ranking titles have in common that the client's title lacks.
**WHY:** Title tags optimized in isolation miss what Google is actually rewarding for that specific query. A title that works for "plumbing services" may fail for "emergency plumber near me" — the SERP tells you what format Google prefers.
**DON'T:** Recommend generic title formulas ("Primary Keyword | Brand Name") without checking what's actually ranking. Don't stuff multiple keywords into one title.

### 2. Meta Description as CTR Lever
**WHEN:** Every page audit — meta descriptions directly impact click-through rate from SERPs.
**HOW:** Check: present, 150-160 characters, includes target keyword (bolded in SERPs when matching query), contains a clear value proposition or CTA, accurately reflects page content (mismatches cause pogo-sticking). Flag descriptions that read like keyword lists instead of persuasive copy. Note that Google rewrites ~70% of meta descriptions — but a well-written one reduces rewrite likelihood.
**WHY:** While meta descriptions aren't a direct ranking factor, CTR is a behavioral signal. A compelling description that earns 5% higher CTR compounds across thousands of impressions. Google rewrites less often when the description accurately matches the page content and query intent.
**DON'T:** Write meta descriptions that are just keyword-stuffed sentences. Don't duplicate descriptions across pages. Don't leave them blank with the assumption "Google will write a better one."

### 3. H1-H6 Hierarchy as Topical Signal
**WHEN:** Analyzing heading structure on every content page.
**HOW:** Extract the full heading tree. Verify: exactly one H1 (containing primary keyword), H2s that map to subtopic keywords, H3s for supporting details under each H2. Check that heading nesting is semantic (H3 under H2, not H4 directly under H1). Compare heading structure against top 3 ranking pages for the target keyword — if competitors use 8 H2s covering specific subtopics and the client uses 3 generic H2s, that's a content depth gap.
**WHY:** Google uses heading hierarchy to understand page structure and topical coverage. H2s effectively function as "sections Google can evaluate independently" — each H2 section can match a different search query or appear as a featured snippet. Proper hierarchy also enables jump links in SERPs.
**DON'T:** Count headings mechanically. A page with 15 H2s is not better than one with 6 — evaluate whether headings cover the subtopics that ranking competitors cover. Don't recommend headings that are just keyword variations.

### 4. Image Alt Text as Accessibility and Ranking Signal
**WHEN:** Every page with images.
**HOW:** Check every <img> tag for alt text. Categorize: missing alt (critical for accessibility + SEO), generic alt ("image," "photo," "screenshot"), keyword-stuffed alt ("best plumber emergency plumber cheap plumber"), descriptive alt (ideal — describes image content with natural keyword inclusion). Flag decorative images that should have empty alt="" vs. content images that need descriptive alt.
**WHY:** Alt text serves three purposes: screen reader accessibility (legal requirement under ADA/WCAG), image search ranking, and contextual relevance signal for the page. Google Image search drives 22% of all web searches — missing alt text forfeits this traffic source.
**DON'T:** Recommend stuffing every alt tag with the primary keyword. Alt text should describe what the image shows, incorporating keywords only when they naturally describe the image content.

### 5. Internal Link Equity Distribution
**WHEN:** BFS crawler returns the internal link graph and the client has identified priority ranking pages.
**HOW:** Map inbound internal link count per page. Overlay with priority keyword targets. Calculate the ratio: pages the client wants to rank vs. how many internal links those pages receive compared to the site average. Identify "authority donor" pages (high inbound links, typically homepage, popular blog posts, navigation-linked pages) and recommend specific internal links FROM donors TO priority targets. Analyze anchor text of existing internal links — flag generic anchors ("click here," "read more") and recommend descriptive, keyword-relevant alternatives.
**WHY:** Internal links are the primary mechanism for distributing PageRank within a site. A priority page with 2 internal links competing against a competitor page with 30 internal links starts at a severe disadvantage. Strategic internal linking is the single highest-ROI on-page optimization — it costs nothing and directly impacts ranking.
**DON'T:** Just list link counts in a table. Every internal link finding must connect to a business priority: "Your /commercial-plumbing page targets a keyword worth $45 CPC but has only 3 internal links, while /blog/office-party-photos has 28." Provide specific link placement recommendations.

### 6. Content Quality Signal Assessment
**WHEN:** Evaluating whether a page has sufficient quality signals to rank for its target keyword.
**HOW:** Score across dimensions: (a) word count relative to SERP average for the keyword (if competitors average 2,000 words and the client has 400, flag it), (b) readability at 8th grade level or appropriate for audience, (c) E-E-A-T markers (author bio, credentials, first-person experience, citations), (d) media richness (images per 500 words, video embeds, infographics), (e) freshness signals (last updated date, current-year references), (f) unique value (does this page offer anything the top 10 results don't?).
**WHY:** Google's Helpful Content system evaluates content quality as a site-wide signal. Pages that exist purely for keyword targeting without genuine value drag down the entire domain. The threshold isn't "good enough" — it's "better than what currently ranks."
**DON'T:** Reduce content quality to word count. A 500-word page with original data and expert analysis can outrank a 3,000-word keyword-stuffed article. Evaluate the substance, not just the volume.

### 7. Keyword Placement Completeness Scoring
**WHEN:** Each page has an assigned target keyword (from keyword research or client input).
**HOW:** Check 7 placement points: (1) title tag, (2) H1, (3) first 100 words of body content, (4) at least one H2, (5) meta description, (6) URL slug, (7) at least one image alt text. Score 0-7. Pages scoring below 4/7 are under-optimized; pages scoring 7/7 should be checked for over-optimization. Also check for secondary keyword placement in remaining H2s and body content at 0.5-1% density.
**WHY:** Keyword placement signals topical relevance to search engines. Missing the keyword from the title tag alone can cost 20-30% ranking potential. But placement must be natural — forced insertion damages readability and triggers over-optimization filters.
**DON'T:** Recommend inserting the exact-match keyword into every possible location. Natural variations, synonyms, and partial matches count. Over-optimization (keyword in every H2, every paragraph opener, every alt tag) triggers spam signals.

### 8. URL Structure Optimization
**WHEN:** Auditing URL slugs across the site.
**HOW:** Check: (a) descriptive slugs containing target keyword (/commercial-plumbing-services not /page-47), (b) hyphens as separators (not underscores or spaces), (c) lowercase only, (d) reasonable length (3-5 words ideal, <75 characters), (e) no unnecessary parameters (?id=123&cat=7), (f) logical folder hierarchy (/services/plumbing/commercial not /p/s/c), (g) no stop words unless needed for readability. Flag URL changes carefully — every URL change requires a 301 redirect.
**WHY:** URLs are a lightweight ranking signal and a strong CTR signal. A descriptive URL in SERPs tells users what to expect before clicking. Clean URL structure also helps crawlers understand site architecture.
**DON'T:** Recommend changing URLs without acknowledging the redirect cost. Every URL change means implementing 301 redirects, updating internal links, and waiting for Google to process the change. Only recommend URL changes for severely broken structures.

### 9. Thin Content Triage
**WHEN:** Pages with <300 words of body content are identified.
**HOW:** Categorize each thin page: (a) intentionally thin — contact, login, utility pages — exempt from action, (b) thin with search impressions — high priority for content expansion, (c) thin with zero impressions and zero traffic — candidates for noindex, consolidation into a richer page, or removal, (d) thin product/service pages — need expansion with value propositions, FAQs, testimonials. For each actionable thin page, specify: target word count (based on SERP competitor average), content elements to add, and internal linking to connect.
**WHY:** Google's Helpful Content system penalizes sites with a high ratio of thin/unhelpful pages. This is a site-wide classifier — a site with 60% thin pages drags down the ranking potential of even its best content.
**DON'T:** Flag every short page as a problem. Utility pages are naturally short. Also don't assume more words = better. Specify what content to add, not just "make it longer."

### 10. Duplicate and Cannibalization Detection
**WHEN:** Multiple pages target the same or highly overlapping keywords.
**HOW:** Cross-reference the keyword-to-page mapping. If two or more pages target the same primary keyword, flag as cannibalization. Check GSC data (if available) for pages splitting impressions for the same query. Recommend: consolidate into one stronger page (301 redirect the weaker one), differentiate keywords (reassign one page to a related but distinct keyword), or use canonical tags if pages must coexist. Also flag duplicate/near-duplicate title tags and meta descriptions across the site.
**WHY:** Keyword cannibalization forces Google to choose between your own pages, splitting ranking signals and often resulting in neither page ranking well. Sites with cannibalization issues routinely see 30-50% ranking improvement after consolidation.
**DON'T:** Flag every pair of topically related pages as cannibalization. Two pages can cover related subtopics and both rank — cannibalization is specifically when pages compete for the same SERP position for the same query.

## Data Sources

| Source | What It Provides | Access Method |
|--------|-----------------|---------------|
| BFS Crawler | Pages array, internal link graph, heading structure, meta tags, image tags, word count | `src/lib/integrations/crawler.ts` — always available |
| PageSpeed Insights API | CWV metrics, render-blocking resources, image optimization opportunities | API call per URL — always available |
| Serper API | Actual SERP results for target keywords, competitor title/description analysis | API call — always available |
| Google Search Console | Impressions/clicks per page, queries driving traffic, index status | OAuth — only when client connects |
| Site scraper | Raw HTML, full heading tree, all meta tags, image inventory, internal link mapping | Direct fetch — always available |
| Site audit output | Orphan pages, broken links, redirect chains, thin content list, schema inventory | From upstream site_audit service |

## Output Structure

The final deliverable MUST contain these sections in this order:

1. **On-Page Health Summary** — Overall on-page optimization score (0-100), pages audited count, critical issues count, top 3 highest-impact fixes. Client reads this first.
2. **Title Tag Audit** — Per-page: current title, character count, target keyword presence, uniqueness status, recommended title with rationale. Site-wide: duplicate titles, missing titles, truncation risks.
3. **Meta Description Audit** — Per-page: current description, character count, keyword presence, CTA quality. Site-wide: duplicates, missing descriptions, rewrite candidates.
4. **Heading Hierarchy Report** — Per-page: full H1-H6 tree, H1 keyword presence, heading depth vs. competitors, structural issues. Site-wide: missing H1s, multiple H1s, heading skip patterns.
5. **Image Optimization Report** — Per-page: images missing alt text, generic alt text, oversized images. Site-wide: total images, % with proper alt text, image compression opportunities.
6. **Internal Linking Analysis** — Per-page: inbound link count, outbound link count, anchor text quality. Site-wide: equity distribution map, orphan pages, authority donor pages, specific link placement recommendations.
7. **Content Quality Assessment** — Per-page: word count, readability score, E-E-A-T signal inventory, media count, freshness. Site-wide: thin content pages, content quality distribution.
8. **Keyword Placement Scorecard** — Per-page: 0-7 placement score with each checkpoint marked pass/fail. Site-wide: average placement score, under-optimized pages ranked by keyword value.
9. **URL Structure Audit** — Flagged URLs with issues, recommended changes (with redirect warnings), folder hierarchy assessment.
10. **Prioritized Fix List** — Every finding as a row: Page URL, Issue, Severity, Current State, Recommended Fix (with exact before/after), Expected Impact, Effort Level.

## Quality Gate

Before delivering to the client, verify ALL of the following:

- [ ] Every finding references a specific URL — no generic "some pages have issues" statements
- [ ] Title tag recommendations include the actual recommended title text, not just "add keyword"
- [ ] Meta description recommendations include specific copy, not just "write a better description"
- [ ] Heading hierarchy analysis compared against actual SERP competitors for target keywords
- [ ] Internal linking recommendations specify exactly which page should link to which page, with suggested anchor text
- [ ] Thin content pages are triaged (expand/consolidate/noindex/exempt) — not just listed
- [ ] Keyword placement scores connect to keyword value — a 2/7 score on a $50 CPC keyword is more urgent than 2/7 on a $2 CPC keyword
- [ ] Image alt text recommendations are specific and natural, not keyword-stuffed templates
- [ ] URL change recommendations include redirect implementation warnings
- [ ] Duplicate/cannibalization findings include specific resolution paths (consolidate, differentiate, or canonical)
- [ ] Content quality assessment references SERP competitor benchmarks, not arbitrary standards
- [ ] Fix list is sorted by impact-to-effort ratio, not just severity

## Cross-Service Connections

- **Receives from:**
  - `site_audit` (Haruki) — crawl data, orphan pages, broken links, page inventory, thin content list
  - `keyword_research` (Haruki) — keyword-to-page mapping, primary/secondary keywords per page, search volumes
  - `link_analysis` (Haruki) — external backlink data identifying authority donor pages for internal link strategy
- **Sends to:**
  - `content_article` (Sakura) — pages flagged for content expansion with target word count and topic gaps
  - `content_calendar` (Ryo) — content expansion priorities ranked by keyword value and current optimization gaps
  - `meta_optimization` (Mika) — title/meta description rewrite candidates with SERP competitor analysis
  - `schema_generation` (Kenji) — pages missing schema with page type identification
  - `content_decay_audit` (Yumi) — baseline on-page scores for future decay comparison

**Data fields that transfer:**
- `page_audits[]` — `{url, title, title_length, meta_desc, meta_desc_length, h1, heading_tree[], images_total, images_missing_alt, word_count, internal_links_inbound, internal_links_outbound, keyword_placement_score, content_quality_score}`
- `internal_link_recommendations[]` — `{from_url, to_url, suggested_anchor_text, rationale}`
- `thin_content_pages[]` — `{url, word_count, action: expand|consolidate|noindex|exempt, target_word_count}`
- `cannibalization_pairs[]` — `{url_a, url_b, shared_keyword, resolution: consolidate|differentiate|canonical}`

## Output Examples

### Good Example: Page-Level Finding (Title Tag)

> **Page:** `/services/drain-cleaning`
> **Target keyword:** "drain cleaning services austin" (1,900 mo/search, $42 CPC)
> **Keyword placement score:** 2/7
>
> | Element | Current | Recommended | Status |
> |---------|---------|-------------|--------|
> | Title tag | "Our Services - Acme Plumbing" (30 chars) | "Drain Cleaning Services in Austin TX \| Acme Plumbing" (52 chars) | Keyword missing, generic, under-length |
> | H1 | "Welcome to Our Services Page" | "Professional Drain Cleaning Services in Austin" | Keyword missing, non-descriptive |
> | First 100 words | Starts with "Acme Plumbing has been serving the community since 1987..." | Lead with service description: "Clogged drains cause water damage, mold, and costly repairs. Our licensed Austin plumbers clear residential and commercial drain blockages same-day..." | Keyword absent from first 100 words |
> | Meta description | Missing | "Same-day drain cleaning in Austin TX. Licensed plumbers clear clogs in sinks, showers, and main lines. Free estimates — call (512) 555-0123." (147 chars) | No meta description present |
>
> **Impact:** This page targets a keyword worth $42/click with only 2 of 7 placement checkpoints met. Fixing title, H1, first 100 words, and meta description moves placement score to 6/7 — estimated to improve ranking from current #18 to page 1 contention.

### Bad Example: Page-Level Finding (Title Tag)

> The /services/drain-cleaning page has a short title tag and the keyword is missing. We recommend adding the target keyword to the title tag and making it longer. The meta description is also missing.

*Why it fails: No before/after text provided, no character counts, no keyword value context, no placement score, no estimated impact. The client cannot implement "add the keyword" without knowing exactly what the new title should say.*

### Good Example: Internal Link Recommendation

> **Equity-starved page:** `/services/water-heater-repair` — 2 inbound internal links
> **Target keyword:** "water heater repair austin" ($38 CPC, currently ranking #22)
>
> **Recommended internal links to add:**
>
> | Link From | Anchor Text | Placement Location |
> |-----------|------------|-------------------|
> | `/blog/signs-your-water-heater-is-failing` (28 inbound links, authority donor) | "professional water heater repair" | Body paragraph 3, after "If you notice any of these signs..." |
> | `/services/plumbing` (41 inbound links, top navigation page) | "water heater repair services" | Services list section, currently no link to this sub-service |
> | `/blog/winter-plumbing-prep-guide` (19 inbound links) | "repair or replace your water heater" | Section on water heater maintenance, paragraph 2 |
>
> **Rationale:** /services/water-heater-repair targets a $38 CPC keyword but has only 2 internal links. Meanwhile, /blog/office-holiday-party-photos has 31 internal links. Redirecting link equity from authority donor pages to this revenue page is the single highest-ROI fix in this audit.

### Bad Example: Internal Link Recommendation

> The water heater repair page doesn't have enough internal links. You should add more internal links from other pages on your site to help it rank better.

*Why it fails: No specific pages to link from, no anchor text suggestions, no placement guidance, no equity analysis showing why this matters. "Add more links" without specifying which pages, what anchor text, and where to place them is unimplementable.*

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| "Add keywords to your title tags" | No specificity — which pages, which keywords, what's the recommended title? | "Page /services has title 'Our Services' (15 chars). Recommended: 'Commercial Plumbing Services in Austin TX \| [Brand]' (52 chars) — adds target keyword, location, fits character limit." |
| Listing 200 missing alt tags without prioritization | Overwhelms client, decorative images mixed with content images | Prioritize: content images on high-value pages first. Note which images are decorative (empty alt="" is correct). Group by page priority. |
| "Your H1 should contain your keyword" | Correct advice delivered generically | "Page /drain-cleaning has H1 'Welcome to Our Site.' Recommended: 'Professional Drain Cleaning Services in [City]' — incorporates primary keyword and location modifier." |
| Recommending URL changes without redirect plan | URL changes without 301s destroy existing ranking equity | "URL /p?id=47 should be /emergency-plumbing — implement 301 redirect, update 12 internal links pointing to old URL, submit updated sitemap." |
| Counting internal links without connecting to strategy | Raw numbers without business context mean nothing | "/pricing has 2 internal links but targets 'plumbing pricing' ($35 CPC). /blog/cat-photos has 47 links. Recommended: add contextual links from /blog/bathroom-remodel and /services/residential to /pricing." |
| Auditing on-page elements in isolation | Missing the interaction between elements and search behavior | Cross-reference: if title tag has keyword but H1 doesn't, or meta description promises something the content doesn't deliver (pogo-stick risk), flag the inconsistency. |
| Treating all pages equally | Homepage, service pages, blog posts, and utility pages have different standards | Apply different benchmarks: service pages need 800-1500 words with conversion elements; blog posts need 1500-3000 with depth; contact pages need clear NAP only. |
| "Keyword density should be 2-3%" | Outdated metric that leads to unnatural writing | Evaluate keyword presence at placement checkpoints (title, H1, first 100 words, H2s, meta, URL, alt) rather than counting density percentages. Natural writing with proper placement beats mechanical density. |
