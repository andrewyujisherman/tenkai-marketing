# Keyword Research — Agent Reference (Haruki)

## What This Produces
A prioritized keyword database with verified search data, intent classification, SERP feature analysis, difficulty tiering, and clustering — organized to directly feed content briefs, calendars, and topic cluster maps.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **Real data, not invented numbers.** Every search volume, difficulty score, and trend comes from API data (Serper, GSC, DataForSEO) or is explicitly marked as an estimate with methodology disclosed.
- **SERP-verified intent.** Intent is classified by what actually ranks (product pages = transactional) not by keyword phrasing alone.
- **Actionable difficulty tiering.** Keywords are grouped into quick-win, medium-term, and long-term buckets with distinct strategies for each — not just a flat list sorted by volume.
- **Clustering based on SERP overlap.** Keywords that share 60%+ of the same top-10 results are grouped together so one content piece can target the entire cluster.
- **Business value mapping.** Every keyword connects to a funnel stage and revenue potential, not just traffic potential.

---

## Build Process (Ordered Steps)

1. **Collect seed keywords.** Extract from client brief, site scrape (existing page titles, H1s, meta descriptions), competitor domains, and any connected GSC data showing current ranking keywords.

2. **Expand seed list via Serper API.** For each seed keyword, query Serper API and extract: related searches, People Also Ask questions, autocomplete suggestions. Target 200-500 raw keywords minimum for a standard project, 1,000+ for competitive niches.

3. **Pull SERP data for each keyword.** Query Serper API for top 10 organic results per keyword. Extract: URL, title tag, meta description, domain authority signals, SERP features present (AI Overview, featured snippet, PAA box, local pack, video carousel, image pack, knowledge panel).

4. **Classify search intent.** For each keyword, analyze the SERP composition:
   - If 70%+ results are blog posts/guides → Informational
   - If 70%+ results are product/service pages → Transactional
   - If 70%+ results are comparison/review pages → Commercial Investigation
   - If top results are all one brand's pages → Navigational
   - Assign subtype (see Pattern 1 below)

5. **Score keyword difficulty.** Analyze top 10 results for each keyword: domain diversity, presence of major authority sites, SERP feature saturation. Assign to difficulty tier (see Pattern 3).

6. **Cluster keywords by SERP overlap.** Compare top-10 results between all keyword pairs. Keywords sharing 60%+ of the same URLs form a cluster. One content piece should target each cluster, not individual keywords.

7. **Detect cannibalization risks.** If the client site already ranks, check for multiple client pages appearing for the same keyword or cluster. Flag these for resolution.

8. **Map to business value.** Cross-reference keyword clusters with funnel stage (TOFU/MOFU/BOFU), estimated CPC as a proxy for commercial value, and client's stated business priorities.

9. **Prioritize and tier.** Score each keyword cluster on: search volume x business value x (1 / difficulty). Produce a ranked list with clear quick-win, medium-term, and long-term buckets.

10. **Generate output document.** Structure per Output Structure below. Include data source attribution for every metric.

---

## Critical Patterns

### 1. Intent Classification — Four Types Plus Subtypes
**WHEN:** Classifying every keyword in the research set.
**HOW:**
| Primary Intent | Subtypes | SERP Signal |
|---|---|---|
| Informational | Factual ("what is X"), Educational ("how to X"), Exploratory ("X guide"), How-to ("X tutorial") | Blog posts, guides, Wikipedia, knowledge panels dominate |
| Navigational | Brand ("Nike shoes"), Product ("Ahrefs keyword explorer"), Feature ("Gmail settings") | Single brand dominates top 3-5 results |
| Commercial | Comparison ("X vs Y"), Review ("X review"), Best-of ("best X for Y"), Alternative ("X alternatives") | Review sites, comparison articles, affiliate content dominate |
| Transactional | Purchase ("buy X"), Sign-up ("X free trial"), Download ("X template download"), Contact ("X pricing") | Product pages, pricing pages, signup flows dominate |

**WHY:** SERP-based intent classification is far more accurate than keyword phrase analysis alone. A keyword like "best CRM" looks informational from phrasing but ranks commercial/transactional pages — the SERP tells the truth.
**DON'T:** Classify intent by keyword phrasing alone. Always verify against actual SERP composition from Serper API data.

### 2. Search Volume Accuracy — The Honesty Problem
**WHEN:** Reporting any search volume number.
**HOW:**
- Use Serper API organic result data as primary signal. If GSC is connected, use actual impression/click data — this is the most accurate source.
- When exact volume is unavailable, provide a range estimate and label it: "Estimated range: 500-1,000/mo (methodology: SERP competition density + related keyword aggregation)."
- Never present a round number (1,000, 5,000, 10,000) without a source — round numbers are the hallmark of fabricated data.
- A study by Ahrefs found 91% of Google Keyword Planner volumes are overestimations because GKP groups similar keywords and shows combined volumes.

**WHY:** Fake search volumes destroy client trust the moment they cross-reference with any paid tool. One caught fabrication undermines the entire deliverable.
**DON'T:** Generate plausible-looking search volume numbers. Ever. If you don't have real data, say "volume data unavailable — estimated relative demand: HIGH/MEDIUM/LOW based on SERP competition density."

### 3. Difficulty Tiering — Quick Wins vs. Long-Term Plays
**WHEN:** Categorizing every keyword for strategic prioritization.
**HOW:**
- **Quick Wins (Target immediately):** Low SERP competition — top 10 includes forums, thin content, outdated pages (2+ years old), low-authority domains. Client already ranks positions 11-30. Few or no major authority sites in top 5.
- **Medium-Term (3-6 months):** Moderate competition — established but beatable sites in top 10. Requires strong content + some backlinks. Client has topical relevance.
- **Long-Term (6-12+ months):** High competition — top 10 dominated by high-authority domains (DR 70+), major brands, or sites with hundreds of referring domains to that specific page. Requires sustained content investment + link building campaign.

**WHY:** Clients need wins in the first 30-60 days to maintain confidence. Quick wins are the fuel that funds long-term strategy.
**DON'T:** Present a flat keyword list sorted only by volume. This leads to chasing impossible keywords while ignoring easy wins.

### 4. SERP Feature Detection
**WHEN:** Analyzing every keyword in the research set.
**HOW:** From Serper API response, flag presence of:
- **AI Overview:** If present, note that zero-click rate hits ~83%. Content must be structured for AI citation (clear definitions, structured data, factual density).
- **Featured Snippet:** If present, note snippet type (paragraph, list, table) and current owner. Design content to capture it.
- **People Also Ask:** Extract all PAA questions — these become H2/H3 headings or FAQ sections in content.
- **Local Pack:** If present, keyword has local intent — different content strategy needed.
- **Video Carousel:** If present, video content may outperform written content for this keyword.
- **Image Pack:** If present, image optimization is a ranking factor for this keyword.

**WHY:** Featured snippet CTR is ~42.9% when present. AI Overviews appear in ~47% of US searches. Ignoring SERP features means missing the actual search landscape.
**DON'T:** Report keywords without noting which SERP features are present. A keyword with an AI Overview has fundamentally different traffic potential than one without.

### 5. SERP-Based Clustering
**WHEN:** Grouping keywords after SERP data is collected.
**HOW:**
1. For each keyword pair, compare their top-10 organic URLs.
2. Calculate overlap percentage: (shared URLs / 10) x 100.
3. Keywords with 60%+ overlap belong to the same cluster — one content piece targets the entire cluster.
4. Name each cluster by the highest-volume keyword (the "primary keyword").
5. Within each cluster, designate supporting keywords that add semantic breadth.

**WHY:** Intent-first clustering delivers 40% higher organic traffic and 60% better conversion rates compared to traditional keyword-first approaches. If the same pages rank for two keywords, Google considers them the same topic — creating separate pages wastes resources and risks cannibalization.
**DON'T:** Cluster by semantic similarity alone (grouping "CRM software" with "customer relationship management" without checking if they share SERPs). Semantic similarity ≠ SERP overlap.

### 6. Keyword Gap Analysis
**WHEN:** Client provides competitor domains or competitors are identified during research.
**HOW:**
1. Query Serper API for competitor domain's top-ranking pages.
2. Extract keywords each competitor page targets (from title, H1, URL structure).
3. Cross-reference against client's current keyword set (from GSC if connected, or from site scrape).
4. Keywords where competitors rank but client does not = keyword gaps.
5. Prioritize gaps by: search volume x business relevance x ease of entry.

**WHY:** Competitor gaps represent proven demand that the client is leaving on the table. These are often faster wins than net-new keyword targets because the market is already validated.
**DON'T:** Present keyword gaps without difficulty context. A gap against a DR 90 competitor for a DR 20 client isn't an opportunity — it's a fantasy.

### 7. Cannibalization Detection
**WHEN:** Client has an existing site with 50+ pages, or any time GSC data is available.
**HOW:**
1. From GSC data or site scrape, identify all pages and their target keywords.
2. Flag any keyword that maps to 2+ pages on the same domain.
3. Check SERP: if Google is alternating which client page it shows (position fluctuation), cannibalization is confirmed.
4. Recommend resolution: consolidate (merge pages), differentiate (re-target one page to a different keyword), or redirect (301 the weaker page).

**WHY:** Cannibalization splits ranking signals between pages, often resulting in both pages ranking worse than a single consolidated page would.
**DON'T:** Assume every keyword overlap is cannibalization. Two pages can legitimately target related keywords in the same cluster if they serve different intents.

### 8. Seasonal and Trend Analysis
**WHEN:** Building keyword strategy for any client with time-sensitive products or services.
**HOW:**
1. Use Serper API trend data or Google Trends integration to identify monthly volume patterns.
2. Flag keywords with >50% volume variance between peak and trough months.
3. Map peak months to content calendar — content for seasonal keywords must be published 6-8 weeks BEFORE the peak to build ranking momentum.
4. Identify evergreen vs. seasonal keywords and label accordingly.

**WHY:** Publishing a "best winter coats" article in December means competing against established content that's been ranking since October. Lead time is everything for seasonal keywords.
**DON'T:** Treat all keywords as evergreen. Seasonal keywords need different publishing timelines and refresh cadences.

### 9. CPC as Business Value Proxy
**WHEN:** Prioritizing keywords by commercial value.
**HOW:**
- High CPC (>$5) = high commercial intent and business value, even if organic volume is lower.
- Cross-reference CPC with funnel stage: high CPC + transactional intent = priority target.
- Low CPC + high volume = informational TOFU content — good for awareness, not direct revenue.
- Include CPC data in output alongside volume to give clients a revenue-weighted view.

**WHY:** A keyword with 500 searches/month and $25 CPC is worth more than a keyword with 5,000 searches/month and $0.50 CPC. CPC is the market's revealed preference for keyword value.
**DON'T:** Prioritize by volume alone. Volume without value is vanity traffic.

### 10. Long-Tail Keyword Mining
**WHEN:** Expanding keyword sets beyond head terms, especially for lower-authority sites.
**HOW:**
1. Extract all People Also Ask questions from Serper results for head terms.
2. Mine autocomplete suggestions for each seed keyword.
3. Append modifiers: "best," "how to," "vs," "[year]," "for [audience]," "near me," "[location]."
4. Long-tail keywords (4+ words) typically have lower competition and higher conversion rates.
5. Group long-tails under their parent head term for cluster mapping.

**WHY:** Long-tail keywords make up ~70% of all search queries. For newer or lower-authority sites, these are the only realistic ranking targets in the short term.
**DON'T:** Ignore long-tails because their individual volume is low. Their aggregate volume and conversion value often exceeds head terms.

---

## Data Sources

| Source | What It Provides | Format | Access |
|---|---|---|---|
| **Serper API** | Top 10 organic results, SERP features, PAA questions, related searches | JSON | Available — primary data source |
| **Google Search Console** | Actual impressions, clicks, CTR, average position for existing rankings | JSON via OAuth | Available when client connects |
| **Google Analytics 4** | Traffic, conversions, engagement metrics for existing content | JSON via OAuth | Available when client connects |
| **Site Scraper** | Existing page titles, H1s, meta descriptions, URL structure | Structured data | Available — BFS crawler |
| **Client Brief** | Business goals, target audience, priority products/services | Free text | Provided per project |

---

## Output Structure

The keyword research deliverable MUST contain these sections:

### 1. Executive Summary
- Total keywords analyzed, clusters identified, quick wins flagged
- Top 3 priority keyword clusters with rationale
- Key competitor gaps identified

### 2. Keyword Database (Primary Deliverable)
For each keyword:
- Keyword phrase
- Search volume (with source attribution or "estimated" label)
- Difficulty tier (Quick Win / Medium-Term / Long-Term)
- Intent type + subtype
- SERP features present
- CPC (if available)
- Cluster assignment
- Funnel stage (TOFU / MOFU / BOFU)

### 3. Keyword Clusters
For each cluster:
- Primary keyword (highest volume in cluster)
- Supporting keywords (with SERP overlap %)
- Recommended content format (based on what ranks)
- Combined cluster volume
- Difficulty assessment

### 4. Quick Wins Report
- Keywords where client ranks positions 11-30 (from GSC)
- Keywords with low competition + decent volume
- Immediate action recommendations

### 5. Keyword Gaps vs. Competitors
- Keywords competitors rank for that client does not
- Prioritized by business value x attainability

### 6. Cannibalization Report (if applicable)
- Keywords with multiple client pages competing
- Recommended resolution for each

### 7. SERP Feature Opportunities
- Keywords with featured snippet opportunities
- Keywords with PAA boxes (questions extracted)
- Keywords triggering AI Overviews (citation optimization notes)

### 8. Methodology & Data Sources
- Which APIs provided which data points
- Where estimates were used and how they were derived
- Date of data collection

---

## Quality Gate

Before output goes to client, verify ALL of the following:

1. [ ] Every search volume number has a source attribution or is labeled "estimated" with methodology
2. [ ] Intent classification was verified against actual SERP data, not keyword phrasing alone
3. [ ] Keywords are clustered by SERP overlap (60%+ threshold), not just semantic similarity
4. [ ] Difficulty tiers have clear, defensible criteria — not arbitrary assignments
5. [ ] SERP features are noted for every keyword (AI Overview, snippet, PAA, local pack, video)
6. [ ] Quick wins are identified separately with action recommendations
7. [ ] Cannibalization risks are flagged if client site data is available
8. [ ] Business value mapping exists (funnel stage + CPC proxy) — not just volume sorting
9. [ ] Competitor gap analysis is included if competitor domains were provided
10. [ ] No round-number search volumes without source data (1,000 / 5,000 / 10,000 = fabrication signal)
11. [ ] Methodology section documents exactly which data is real vs. estimated
12. [ ] Output is structured so it can feed directly into content_brief and content_calendar services

---

## Cross-Service Connections

- **Receives from:** Client onboarding (seed keywords, business goals, competitor domains), site scraper (existing page inventory), GSC/GA4 (current ranking data)
- **Sends to:** `content_brief` (primary + secondary keywords, intent, SERP features, competitor data), `content_calendar` (prioritized keyword clusters with difficulty tiers), `topic_cluster_map` (keyword clusters with SERP overlap data), `competitor_analysis` (keyword gap data)

---

## Output Examples

### Good Example: Keyword Database Entries

> | Keyword | Volume | Source | KD Tier | Intent | Subtype | SERP Features | CPC | Cluster | Funnel |
> |---------|--------|--------|---------|--------|---------|---------------|-----|---------|--------|
> | best crm for small business | 14,800/mo | Serper API, Mar 2026 | Medium-Term | Commercial | Best-of | AI Overview, Featured Snippet (list), PAA ×6 | $12.40 | CRM-selection | MOFU |
> | crm for startups | 3,100/mo | Serper API, Mar 2026 | Quick Win | Commercial | Best-of | PAA ×4 | $8.75 | CRM-selection | MOFU |
> | free crm software | 22,400/mo | Serper API, Mar 2026 | Long-Term | Commercial | Best-of | AI Overview, Featured Snippet (table), PAA ×8 | $6.20 | CRM-free-tier | MOFU |
> | what is a crm | 33,100/mo | Serper API, Mar 2026 | Long-Term | Informational | Factual | AI Overview, Knowledge Panel, PAA ×6 | $2.10 | CRM-basics | TOFU |
> | hubspot vs salesforce | 5,400/mo | Serper API, Mar 2026 | Quick Win | Commercial | Comparison | PAA ×5, Video Carousel | $15.80 | CRM-comparison | MOFU |

### Bad Example: Keyword Database Entries

> | Keyword | Volume | Difficulty | Intent |
> |---------|--------|-----------|--------|
> | best crm | 10,000 | Medium | Commercial |
> | crm software | 50,000 | High | Informational |
> | small business crm | 5,000 | Low | Commercial |
> | crm tools | 20,000 | Medium | Informational |
> | crm system | 15,000 | Medium | Informational |

**Why it fails:** Round numbers without source attribution scream fabricated data. No SERP features noted — missing that "what is a crm" has an AI Overview changes the entire content strategy. No CPC data means no business value context. No cluster assignment — just a flat list. No funnel stage. Intent for "crm software" classified as "informational" but actual SERP is dominated by commercial/comparison content (SERP-verification skipped). Difficulty is a vague label with no tier criteria.

---

### Good Example: Keyword Gap Finding

> **Keyword Gaps vs. Competitors (client: freshbooks.com vs. competitors: hubspot.com, zoho.com)**
>
> | Gap Keyword | Competitor Ranking | Client Status | Volume | KD Tier | Action |
> |-------------|-------------------|---------------|--------|---------|--------|
> | crm for freelancers | hubspot.com #3, zoho.com #7 | Not ranking | 2,900/mo | Quick Win | High fit — FreshBooks' core audience. Create comparison article targeting freelancer use case. |
> | crm with invoicing | zoho.com #4 | Ranking #34 | 1,800/mo | Quick Win | Already ranking page 4 — optimize existing /features/crm page, add invoicing comparison section. |
> | best crm for consulting firms | hubspot.com #5 | Not ranking | 1,200/mo | Quick Win | No high-authority competitors in top 5. Low-hanging fruit for niche content. |
> | crm implementation cost | hubspot.com #2, zoho.com #3 | Not ranking | 4,100/mo | Medium-Term | Both competitors have deep guides. Need comprehensive comparison with real pricing data to compete. |
>
> **Gap summary:** 23 keywords where at least one competitor ranks top 10 and client does not. 8 classified as Quick Wins (combined volume: 14,200/mo). Highest-value gap: "crm with invoicing" — client already ranks #34 and the keyword maps directly to a revenue feature.

### Bad Example: Keyword Gap Finding

> **Keyword Gaps:**
> The client is missing coverage on several important topics that competitors rank for, including CRM implementation, CRM pricing, CRM comparisons, and CRM integrations. We recommend creating content targeting these topic areas to close the gap with competitors.

**Why it fails:** No specific keywords with volume data. No indication of which competitors rank where. No difficulty assessment — are these gaps achievable or fantasies? No prioritization. "CRM implementation" is not a keyword — it's a vague topic. No action plan beyond "create content." A strategist reading this has nothing to act on.

---

### Good Example: Clustering Output

> **Cluster: CRM-selection (SERP-overlap validated)**
>
> Primary keyword: "best crm for small business" (14,800/mo)
>
> | Cluster Keyword | Volume | SERP Overlap with Primary | Role |
> |-----------------|--------|--------------------------|------|
> | small business crm software | 6,200/mo | 72% (7/10 shared URLs) | Supporting — target in same article |
> | free crm for small business | 8,900/mo | 65% (6.5/10) | Supporting — can co-target |
> | simple crm for small business | 2,400/mo | 71% (7/10) | Supporting — include as H2 |
> | best crm for startups | 3,100/mo | 48% (5/10) | **Borderline** — may need separate article if startup-specific SERPs diverge further |
> | affordable crm software | 4,600/mo | 61% (6/10) | Supporting — anchor text opportunity |
>
> **Combined cluster volume:** 40,000/mo
> **Recommended content:** Single comprehensive listicle targeting all 5 keywords. Monitor "best crm for startups" — if overlap drops below 50% in 3 months, split into dedicated article.

### Bad Example: Clustering Output

> **CRM Cluster:**
> - best crm
> - crm software
> - crm tools
> - crm system
> - crm platform
> - customer relationship management
> - crm for business
> - crm solutions
>
> These keywords are all related to CRM and should be targeted together in a comprehensive guide about CRM software.

**Why it fails:** No SERP overlap data — "crm software" and "crm platform" may have completely different top-10 results. No volume data per keyword. No overlap percentages to justify grouping. "Customer relationship management" likely has a different SERP (Wikipedia/definitional) than "best crm" (commercial listicles). Clustering by semantic similarity without SERP validation leads to content that tries to serve multiple intents and serves none well.

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---|---|---|
| Generating plausible search volumes | Client will cross-check with Ahrefs/Semrush in 5 minutes and lose all trust | Use real API data or label as estimated with methodology |
| Flat keyword list sorted by volume | No strategy, no prioritization, no actionability | Cluster, tier, and map to business value |
| Intent from keyword phrasing only | "best CRM" looks informational but ranks commercial pages | Verify intent against actual SERP composition |
| Ignoring SERP features | Missing that 47% of searches now show AI Overviews | Flag every SERP feature for every keyword |
| Same strategy for all difficulty levels | Quick wins and long-term plays need different approaches | Separate tiers with distinct action plans |
| Recommending FAQ schema broadly | Google restricted FAQ rich results to authoritative sites in 2026 | Use Article and TechArticle schema instead |
| Clustering by topic intuition | "Seems related" ≠ same ranking opportunity | Use 60%+ SERP overlap as the clustering threshold |
| Presenting keyword gaps without context | A DR 20 site can't compete for DR 90 keywords | Always include difficulty and attainability assessment |
| Ignoring seasonality | Publishing seasonal content during peak = too late | Identify seasonal patterns and flag lead times |
| Treating all traffic as equal | 10,000 visits from informational queries ≠ 500 visits from transactional | Weight by CPC and funnel stage, not just volume |
