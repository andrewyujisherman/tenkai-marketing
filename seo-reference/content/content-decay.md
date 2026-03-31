# Content Decay — Agent Reference (Yumi / content_decay_audit)

## What This Produces
A content decay detection and remediation report that identifies pages losing traffic, diagnoses why they're declining, triages each page into the correct action (refresh, rewrite, merge, or retire), and produces a prioritized recovery queue with specific fix instructions tied to measurable outcomes.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **Data-driven detection, not guesswork.** Every flagged page has a measurable decline — >20% traffic drop over 8 weeks via GSC, or a leading indicator (CTR declining while impressions hold). No "this looks old" subjective calls.
- **Leading indicators caught before ranking drops.** Impressions steady but clicks falling means the title/meta description no longer matches searcher expectations. This precedes ranking drops by weeks. Catching it here is the difference between a quick refresh and an expensive rewrite.
- **Triage with specificity.** Each declining page gets one of four actions with detailed reasoning: refresh (update stats, add sections), rewrite (fundamental restructure), merge (combine thin competing pages), or retire (noindex/redirect obsolete content). No "update this page" without saying exactly what to update.
- **Connected to competitive context.** Decay isn't random — it happens because competitors published better content, search intent shifted, or the information became stale. Premium decay audits identify WHAT changed, not just THAT traffic dropped.
- **Cadence-matched to page value.** Revenue pages get monthly monitoring. Evergreen content gets quarterly review. Fast-changing niches get bi-weekly checks. One-size-fits-all review cadence wastes resources.

## Build Process (Ordered Steps)

1. **Pull GSC performance data.** Export clicks, impressions, CTR, and average position for all pages over the past 6 months (minimum). Monthly granularity for trend analysis. If 12+ months of data is available, use it — year-over-year comparison catches seasonal patterns that quarter-over-quarter misses.

2. **Calculate traffic change per page.** For each page: compare trailing 8-week clicks to the prior 8-week period. Flag any page with >20% decline. Also calculate year-over-year change if data is available.

3. **Identify leading indicators.** For pages not yet flagged by traffic decline: check for CTR decline (impressions steady or growing, but clicks falling). This means the page still ranks but searchers are choosing competitors' results. This is the early warning — fix it now before rankings follow.

4. **Cross-reference with ranking position changes.** For flagged pages: check if average position has dropped.
   - Position drops + traffic drops = ranking decay
   - Stable position + traffic drops = CTR problem (title/meta) or search volume decline for the keyword

5. **Assess content freshness.** For each flagged page: last modified date, age of statistics/data cited, whether competitors have fresher content on the same topic. 70%+ of top-ranking results were updated within 12 months — content older than this is at structural disadvantage.

6. **Analyze competitive displacement.** For each flagged page's target keyword: check current SERP. Which pages now outrank the client? What do they have that the client's page doesn't? (Newer data, more depth, better format, more media, fresher publish date.)

7. **Triage each page.** Apply the triage framework (see Critical Pattern #1) to assign one of four actions: refresh, rewrite, merge, or retire. Each assignment includes specific instructions.

8. **Prioritize the recovery queue.** Score by:
   - Page revenue impact (does it drive conversions?)
   - Severity of decline (how much traffic/CTR lost?)
   - Effort to fix (refresh = 2-4hrs, rewrite = 8-16hrs)
   - Probability of recovery (is the decline reversible?)

   Revenue pages with moderate decline get higher priority than low-value pages with severe decline.

9. **Set refresh cadence recommendations.** Based on page type and niche velocity: monthly for revenue pages, quarterly for evergreen, bi-weekly for fast-changing niches. Build a recurring review schedule.

10. **Compile the decay report.** Per Output Structure below with executive summary, flagged pages, triage assignments, and scheduled recovery queue.

## Critical Patterns

### 1. Four-Action Triage Framework
**WHEN:** Every flagged page must receive exactly one of four triage actions.
**HOW:**
- **Refresh:** Page structure and intent alignment are still sound. Fix: update outdated statistics, add 1-2 new sections covering recent developments, refresh the publish date, update meta description if CTR is declining. Effort: 2-4 hours. Use when: decline is < 30%, content is < 18 months old, no fundamental intent shift.
- **Rewrite:** Search intent has shifted or the page fundamentally fails to compete. Fix: restructure the entire article to match current SERP format and intent, rewrite from scratch on the same URL, update all data and sources. Effort: 8-16 hours. Use when: decline is > 30%, content is > 18 months old, SERP format has changed (e.g., listicles now dominate but page is a narrative essay), or intent has shifted (keyword now commercial but page is informational).
- **Merge:** Two or more thin pages compete for the same keyword, splitting signals. Fix: combine the best content from all competing pages into a single comprehensive page on the strongest URL, 301 redirect the other URLs. Effort: 4-8 hours. Use when: multiple client pages appear in GSC for the same query, none ranks well, combined content would be stronger.
- **Retire:** Content is obsolete, targets a dead keyword, or is fundamentally unhelpful. Fix: noindex the page (if it has no backlinks) or 301 redirect to the most relevant active page (if it has backlinks). Effort: 30 minutes. Use when: the keyword has near-zero search volume, the topic is no longer relevant to the business, or the page is a duplicate with no unique value.
**WHY:** Without a triage framework, every declining page gets the same treatment — usually a superficial refresh that doesn't address the root cause. A page that needs a rewrite won't recover from updated stats. A page that should be retired wastes resources on refreshes.
**DON'T:** Default everything to "refresh." Don't skip the merge option — cannibalization is one of the most common causes of decay. Don't retire pages with backlinks without redirecting them first.

### 2. Leading Indicator Detection (CTR Decline)
**WHEN:** Monitoring for early decay signals before traffic actually drops.
**HOW:** In GSC, compare CTR over time for stable-impression pages. The pattern: impressions hold steady (or grow), but clicks decline. This means the page still ranks and appears in search results, but searchers are choosing other results. Root causes: title tag no longer matches current search expectations, meta description doesn't communicate value, competitors have fresher dates in SERP, rich results (AI Overviews, featured snippets) are capturing clicks above the client's listing.
**WHY:** CTR decline precedes ranking decline by 2-6 weeks. Google interprets low CTR as a relevance signal — if searchers consistently skip a result, it drops. Catching CTR decline is the earliest intervention point with the lowest fix cost (update title + meta description = 30 minutes vs. full rewrite = 8+ hours).
**DON'T:** Only monitor traffic. By the time traffic drops, rankings have already moved — recovery is harder. Don't ignore CTR on pages with stable rankings — CTR decline is the canary in the coal mine.

### 3. Competitive Displacement Analysis
**WHEN:** Every page flagged for decay — understanding WHY it's declining requires looking at who's now winning.
**HOW:** For each flagged page's primary keyword: pull the current SERP (Serper API). Identify which pages now outrank the client. Compare: publish/update date (is theirs fresher?), word count (is theirs more comprehensive?), content format (has the winning format changed?), E-E-A-T signals (do they have author bios, citations, first-person experience?), media (do they have videos, interactive tools, original images?). Document what changed in the competitive landscape.
**WHY:** Decay isn't random — something changed. Either the client's content became stale, competitors improved, or Google's interpretation of user intent evolved. Without knowing the cause, the fix is a guess. "Competitor X published a 4,000-word updated guide in January with 15 original screenshots" tells you exactly what recovery requires.
**DON'T:** Assume all decay is staleness. Sometimes the page was never comprehensive enough and got lucky with early rankings. Sometimes intent shifted (informational → commercial). The SERP analysis reveals the true cause.

### 4. Revenue Page Priority Escalation
**WHEN:** Any page that directly drives conversions (product pages, service pages, pricing pages, demo/contact pages) shows any decay signal.
**HOW:** Revenue pages get automatic priority escalation regardless of decay severity. A 10% traffic decline on a page that drives $50K/month in leads is more urgent than a 50% decline on a blog post with zero conversion value. Flag revenue pages with a separate severity tier. Apply monthly monitoring cadence (not quarterly). For revenue pages, also check: conversion rate changes (GA4), not just traffic — a page can maintain traffic but lose conversion rate if the audience shifts.
**WHY:** Revenue pages are the business's lifeline. A 20% traffic decline on a high-converting page directly impacts revenue. These pages justify any recovery investment because the ROI is immediately measurable.
**DON'T:** Treat all pages equally in the priority queue. A blog post about industry trends and a service page that drives demos are not the same priority, even with identical traffic decline percentages.

### 5. Freshness Signal Management
**WHEN:** Refreshing or rewriting content — the publish/update date is a ranking signal.
**HOW:** When making substantive updates: update the `dateModified` in Article schema, update the visible "last updated" date on the page, add an "Originally published [date], updated [date]" note for transparency. Substantive means: updated statistics, added sections, revised recommendations — not just fixing typos. Google detects cosmetic-only date changes and may penalize for deceptive freshness signals.
**WHY:** 70%+ of top-ranking search results were updated within the past 12 months. Google's freshness algorithms favor recently updated content, especially for queries where information changes (technology, finance, health, regulations). The update date in the SERP listing also affects CTR — searchers prefer recent results.
**DON'T:** Update the date without making substantive content changes. Don't remove the original publish date entirely (it's an E-E-A-T transparency signal). Don't confuse "republishing" with "refreshing" — republishing should only happen after meaningful content improvements.

### 6. Refresh Cadence by Page Type
**WHEN:** Establishing ongoing monitoring and maintenance schedules.
**HOW:**
- **Revenue pages (service, product, pricing, demo):** Monthly review. Any decline signal triggers immediate investigation. These pages justify dedicated monitoring.
- **Evergreen content (comprehensive guides, pillar pages, foundational how-tos):** Quarterly review. Update statistics and examples. Add new sections when the topic evolves. Full refresh at minimum annually.
- **Fast-changing niches (technology, finance, health, regulations, AI):** Bi-weekly review of top pages. These topics evolve so rapidly that content older than 3-6 months is often outdated.
- **Seasonal content (tax guides, holiday campaigns, annual roundups):** Refresh 6-8 weeks before peak season. One deep update per year, timed to capture seasonal search demand.
- **News/trend content:** Short lifespan. Don't invest in refreshing — redirect to evergreen alternatives after relevance expires.
**WHY:** One-size-fits-all review cadence either wastes resources (checking stable evergreen content weekly) or misses critical decay (checking revenue pages quarterly). Match the review frequency to the page's value and the topic's rate of change.
**DON'T:** Set "annual review" as the only cadence. Don't review all pages on the same schedule. Don't invest refresh effort in news/trend content that has a natural expiration date.

### 7. Content Merge Protocol
**WHEN:** Multiple thin pages compete for the same keyword, cannibalize each other, and none ranks well.
**HOW:** Identify merge candidates: pages appearing for the same query in GSC with combined performance that would be strong as a single page. Steps: (a) choose the canonical URL — the one with more backlinks, older URL, or better historical performance, (b) extract the best unique content from each page, (c) combine into a single comprehensive page on the canonical URL, (d) 301 redirect all other URLs to the canonical, (e) update internal links pointing to redirected URLs, (f) submit redirected URLs for recrawl in GSC.
**WHY:** Two 600-word pages competing for the same keyword typically both rank on page 2-3. One 1,500-word comprehensive page combining the best of both often jumps to page 1. Merging consolidates backlinks, eliminates cannibalization, and creates a more authoritative resource.
**DON'T:** Delete pages without redirecting — lose their backlinks. Don't merge pages that target genuinely different intents (check SERP overlap first). Don't merge into the weaker URL — use the one with more authority.

### 8. Decay Monitoring Dashboard Metrics
**WHEN:** Setting up ongoing monitoring — define what to track and alert on.
**HOW:** Track per page, per month: clicks (GSC), impressions (GSC), CTR (GSC), average position (GSC), conversion rate (GA4 if connected). Set alert thresholds: clicks down >20% over 8 weeks = flag, CTR down >15% with stable impressions = flag, position dropped >5 positions from peak = flag. Group pages by category (revenue, pillar, cluster, evergreen, seasonal) for different alert sensitivity.
**WHY:** Manual quarterly reviews miss fast-declining pages. Automated monitoring catches decay in the leading-indicator phase when fixes are cheap. Teams that detect decay within 30 days fix it with focused updates; teams that wait 6+ months need expensive rebuilds.
**DON'T:** Monitor only traffic (clicks). CTR and position are earlier signals. Don't set the same thresholds for all page types — a 10% decline on a revenue page is more alarming than a 20% decline on a low-value blog post. Don't alert on daily fluctuations — use 8-week rolling windows to filter noise.

### 9. Seasonal Decay vs. True Decay Differentiation
**WHEN:** A page shows traffic decline that may be seasonal rather than competitive decay.
**HOW:** Compare year-over-year performance, not just quarter-over-quarter. Check Google Trends for the target keyword — does it have seasonal patterns? If last year's traffic in the same period was similar, it's seasonal, not decay. If year-over-year shows decline AND the keyword's search volume is stable, it's true competitive decay.
**WHY:** Flagging seasonal dips as decay wastes resources on unnecessary refreshes. A tax preparation article will naturally decline after April — that's not decay, it's seasonality. True decay is when the article also declined year-over-year during the peak season.
**DON'T:** Panic over quarterly dips without checking annual trends. Don't refresh seasonal content during its off-season (wait until 6-8 weeks before next peak). Don't ignore year-over-year decline during peak season — that IS true decay even if the off-season decline looks normal.

### 10. Post-Recovery Verification
**WHEN:** After implementing a refresh, rewrite, merge, or retire action — verify the fix worked.
**HOW:** After implementation: request reindexing via GSC URL Inspection tool. Set a 4-week verification window. Track: did clicks recover? Did CTR improve? Did position improve? Compare against the baseline (the pre-decline performance, not the declined state). If no recovery after 4 weeks, escalate — the triage action may have been wrong (a refresh when a rewrite was needed, or a fundamental intent mismatch).
**WHY:** Without verification, you don't know if the fix worked. Some refreshes fail because the root cause was misdiagnosed. The 4-week window gives Google time to recrawl and reprocess the updated content. Post-recovery data also validates the triage framework — track which action types succeed to improve future triage accuracy.
**DON'T:** Implement fixes and move on without checking. Don't check after 3 days — Google needs 2-4 weeks to fully reprocess. Don't count "reindexed" as "recovered" — reindexing confirms Google saw the update, not that rankings improved.

### 11. AI Overview Displacement Detection
**WHEN:** Traffic declines on pages that rank well but face increasing AI Overview (AIO) presence for their target keywords.
**HOW:** Check whether AI Overviews now appear for the page's target keywords (Serper API returns AIO presence). If AIO appeared recently and the page's CTR dropped while position remained stable, the traffic loss is likely zero-click absorption by the AI Overview — not traditional competitive displacement. When AI Overviews appear, zero-click rates hit 83%. Recovery approach: optimize content to BE CITED by the AI Overview (direct answers in first 40-60 words, high fact density, proper schema), rather than competing for the click below it.
**WHY:** AI Overviews now appear in ~47% of US searches. Traditional decay remediation (refresh title/meta, add depth) won't fix traffic loss caused by AIO absorption. This is a fundamentally different kind of decay requiring a different strategy — optimize for citation rather than click-through. Pages cited BY the AI Overview maintain visibility even when users don't click through.
**DON'T:** Treat AIO-caused traffic loss the same as competitive displacement. Don't assume a title/meta refresh will recover clicks absorbed by AI Overviews. Don't ignore this channel — AI-referred sessions grew 527% YoY in 2025.

### 12. Cluster-Level Decay Diagnosis
**WHEN:** Multiple pages within the same topic cluster decline simultaneously.
**HOW:** If 3+ pages in the same cluster show decay signals within the same 8-week period, investigate at the cluster level — not page by page. Check: has a competitor built a stronger cluster on the same topic? Has the pillar page declined (which drags down cluster pages)? Are interlinks within the cluster broken or weakened? Has a new page on the site created cannibalization within the cluster? Cluster-wide decay usually requires cluster-level remediation: strengthen the pillar page, add missing subtopics, repair interlinking, or add new cluster pages to match competitor depth.
**WHY:** When decay is cluster-wide, fixing individual pages is treating symptoms. The root cause is typically a loss of topical authority — which is a structural problem. A competitor who built a 15-page cluster while the client's cluster has 8 pages will gradually win across all keywords in the topic. Individual page refreshes won't overcome a structural authority gap.
**DON'T:** Treat each declining cluster page independently if the decline is cluster-wide. Don't refresh 5 cluster pages individually when the real problem is a weakened pillar page or missing subtopics. Don't ignore the interlinking — broken cluster interlinks can cause cluster-wide authority loss.

## Data Sources

| Source | What It Provides | Access Method |
|--------|-----------------|---------------|
| Google Search Console | Clicks, impressions, CTR, average position per page over time. Index coverage. URL inspection. | OAuth — primary data source, required for decay detection |
| Google Analytics 4 | Conversion rate per page, bounce rate, session duration, revenue attribution | OAuth — required for revenue page prioritization |
| Serper API | Current SERP for target keywords, competitor analysis for displacement diagnosis | API call — always available |
| BFS Crawler | Internal link graph (for merge/redirect impact analysis), current page inventory | Internal — from `site_audit` service |
| Content Article Metadata | Original publish dates, target keywords, word counts for freshness assessment | Internal — from `content_article` service |
| Google Trends | Seasonal search patterns for differentiating seasonal dips from true decay | Free — `trends.google.com` |

## Output Structure

The final deliverable MUST contain these sections in this order:

1. **Executive Summary** — Total pages analyzed, pages flagged for decay (count + percentage), estimated traffic at risk, estimated revenue impact (if GA4 connected), top 3 most urgent recovery actions.
2. **Decay Detection Results** — All flagged pages listed with: URL, primary keyword, traffic change (% and absolute), impression trend, CTR trend, position change, time since last update, decay classification (traffic decay, CTR decay, position decay, staleness risk).
3. **Leading Indicator Alerts** — Pages not yet in traffic decline but showing CTR erosion. These are the early warnings — cheapest to fix.
4. **Competitive Displacement Analysis** — For the top 10 most impactful declining pages: what competitor content has displaced them, what the competitor has that the client doesn't, what recovery requires.
5. **Triage Assignments** — Every flagged page assigned one action: refresh, rewrite, merge, or retire. Each with: specific instructions (what to update/add/remove/redirect), estimated effort, expected outcome, priority score.
6. **Recovery Queue** — Prioritized list of triage actions sorted by: revenue impact × recovery probability ÷ effort. Week-by-week schedule for implementation.
7. **Refresh Cadence Plan** — Ongoing monitoring schedule: which pages get monthly, quarterly, bi-weekly, or seasonal review. Alert thresholds per page category.
8. **Merge/Redirect Map** — For any merge or retire recommendations: source URL(s), destination URL, redirect type (301), backlink count on source URLs, internal links to update.

## Quality Gate

Before delivering to the client, verify ALL of the following:

- [ ] Every flagged page has a measurable decline metric (>20% traffic drop or >15% CTR drop) — no subjective "looks old" flags
- [ ] Seasonal patterns are accounted for — year-over-year comparison used where 12+ months of data exists
- [ ] Every flagged page has exactly one triage action assigned (refresh, rewrite, merge, or retire)
- [ ] Triage actions include specific instructions — not just "refresh this page"
- [ ] Revenue pages are priority-escalated regardless of decline severity
- [ ] Leading indicators (CTR decline) are reported separately from active traffic decline
- [ ] Competitive displacement analysis covers at least the top 10 most impactful declining pages
- [ ] Merge recommendations include redirect mapping and internal link update requirements
- [ ] Refresh cadence recommendations are differentiated by page type (revenue, evergreen, fast-changing, seasonal)
- [ ] Post-recovery verification timeline is defined (4-week check after each implementation)
- [ ] Retire recommendations verify backlink status before recommending noindex vs. redirect

## Cross-Service Connections

- **Receives from:**
  - `site_audit` (Haruki) — existing content inventory, thin content flags, internal link graph, cannibalization detection
  - `keyword_research` (Haruki) — target keywords per page for SERP monitoring and competitive displacement analysis
  - `content_article` (Sakura) — original publish dates and content metadata for freshness assessment
  - `monthly_report` — ongoing traffic and ranking trends feeding into decay detection
  - Google Search Console (OAuth) — clicks, impressions, CTR, position data (primary data source)
  - Google Analytics 4 (OAuth) — conversion data for revenue page prioritization
- **Sends to:**
  - `content_calendar` (Ryo) — flagged pages with triage action and priority score for scheduling into the editorial calendar (refresh/rewrite slots)
  - `content_article` (Sakura) — rewrite assignments with decline data, competitive analysis, and specific improvement requirements
  - `content_brief` (Sakura) — refresh/rewrite briefs with current performance data, competitor gaps, and target improvements
  - `redirect_map` (Kenji) — merge and retire URLs needing 301 redirects
  - `on_page_audit` (Mika) — internal link updates needed after merges/retires
  - `topic_cluster_map` (Ryo) — cluster pages showing decay (may indicate cluster-level authority problem)

**Data fields that transfer:**
- `decaying_pages[]` — `{url, primary_keyword, clicks_change_pct, impressions_trend, ctr_trend, position_change, last_updated, triage_action, priority_score}`
- `merge_map[]` — `{source_urls[], canonical_url, redirect_type, source_backlinks_count, internal_links_to_update[]}`
- `refresh_queue[]` — `{url, triage_action, specific_instructions, estimated_effort, scheduled_date, verification_date}`
- `leading_indicators[]` — `{url, impressions_trend, ctr_change_pct, days_until_estimated_traffic_impact}`

## Output Examples

### Good Example: Decay Detection Table

> **Decay Detection Results — BrightPath Financial (March 2026)**
>
> | URL | Primary Keyword | Clicks (8wk) | Δ Clicks | Impressions | Δ CTR | Avg Pos | Δ Pos | Last Updated | Decay Type | Triage |
> |-----|----------------|-------------|----------|------------|-------|---------|-------|-------------|-----------|--------|
> | /blog/best-savings-accounts | best savings accounts 2025 | 2,140 → 1,280 | **-40%** | 45,000 (stable) | 4.7% → 2.8% | 4.2 → 6.8 | -2.6 | 2025-01-15 | Traffic + Position decay | **Rewrite** |
> | /guides/emergency-fund | how much emergency fund | 890 → 640 | **-28%** | 18,200 (stable) | 4.9% → 3.5% | 7.1 → 7.3 | -0.2 | 2025-06-20 | CTR decay (position stable) | **Refresh** |
> | /blog/cd-rates-comparison | best cd rates | 3,200 → 2,400 | **-25%** | 62,000 → 58,000 | 5.2% → 4.1% | 3.8 → 5.1 | -1.3 | 2024-11-02 | Traffic + Position decay | **Rewrite** |
> | /blog/budgeting-tips + /blog/budget-guide | budgeting tips | 340 + 280 = 620 → 410 | **-34%** | Split across 2 URLs | 2.1% combined | Alternating 12-18 | Fluctuating | 2024-08-15 / 2025-02-10 | **Cannibalization** | **Merge** |
> | /blog/bitcoin-investing-2024 | bitcoin investing guide | 120 → 45 | **-63%** | 2,100 → 800 | 5.7% → 5.6% | 14 → 22 | -8 | 2024-03-01 | Obsolete content | **Retire** (redirect to /crypto-basics) |
>
> **Summary:** 47 pages analyzed. 5 flagged for action. Estimated traffic at risk: 3,185 clicks/8wk. Revenue impact: /best-savings-accounts drives ~$4,200/mo in affiliate revenue — highest priority.

### Bad Example: Decay Detection Table

> **Declining Pages:**
>
> Several pages on the site are showing decreased traffic over the past few months:
> - The savings accounts page is getting fewer visitors
> - The emergency fund guide could use an update
> - The CD rates page hasn't been updated in a while
> - There seem to be some duplicate budget pages
> - The Bitcoin article is outdated
>
> We recommend updating these pages to improve their performance.

**Why it fails:** No metrics — "fewer visitors" is not data. No percentage decline, no click/impression numbers, no position changes. No dates for when decline started. No triage actions (refresh vs. rewrite vs. merge vs. retire). No priority ordering. No revenue impact assessment. "Could use an update" and "hasn't been updated in a while" are subjective observations, not data-driven flags. The client can't evaluate urgency or allocate budget to specific fixes.

---

### Good Example: Triage Decision (Refresh vs. Rewrite vs. Merge)

> **Triage: /guides/emergency-fund → REFRESH**
>
> **Decline data:** -28% clicks over 8 weeks. Position stable at 7.1-7.3. CTR dropped from 4.9% to 3.5%.
>
> **Root cause analysis:**
> - Position is stable → ranking authority is intact, this is NOT a competitive displacement issue
> - CTR declining with stable impressions → searchers see the listing but choose competitors
> - Current title tag: "Emergency Fund Guide: How Much Should You Save?" — generic, no year
> - Current meta description: "Learn about emergency funds and how to build one." — no specificity, no hook
> - Competitor in position #3 (NerdWallet) updated their title to: "How Much Emergency Fund Do You Need? (2026 Calculator)" — includes year + interactive element
>
> **Refresh instructions (estimated effort: 3 hours):**
> 1. Update title tag to: "How Much Emergency Fund Do You Need? 2026 Guide + Calculator" (60 chars)
> 2. Update meta description to: "The 3-6 month rule is outdated. Use our 2026 emergency fund calculator based on your actual expenses, income stability, and risk factors." (156 chars)
> 3. Add new section: "2026 Emergency Fund Benchmarks by Income Level" with current data from Federal Reserve Survey of Consumer Finances
> 4. Update all statistics to 2026 data (current article cites 2024 Fed data)
> 5. Add an interactive savings calculator (or embed a simple table-based one)
> 6. Update `dateModified` in Article schema
> 7. Republish with updated date
>
> **Expected outcome:** CTR recovery to 4.5%+ within 4 weeks. No position change expected (position is healthy).
> **Verification date:** April 28, 2026 (4 weeks post-implementation)
>
> ---
>
> **Triage: /blog/budgeting-tips + /blog/budget-guide → MERGE**
>
> **Decline data:** Combined -34% clicks. Both pages alternate positions 12-18 for "budgeting tips" — classic cannibalization.
>
> **Root cause analysis:**
> - GSC shows both URLs appearing for "budgeting tips," "budget guide," and "how to budget"
> - Position fluctuates (one page appears, then the other) — Google can't decide which to show
> - /blog/budgeting-tips: 1,100 words, 12 backlinks, published 2024-08-15
> - /blog/budget-guide: 1,800 words, 3 backlinks, published 2025-02-10
>
> **Merge instructions (estimated effort: 5 hours):**
> 1. Canonical URL: /blog/budgeting-tips (more backlinks, older URL with more authority)
> 2. Extract unique sections from /blog/budget-guide: the "50/30/20 rule explained" section and "budgeting app comparison table" — incorporate into canonical
> 3. Target word count after merge: 2,500-3,000 words (competitor median is 2,800)
> 4. 301 redirect /blog/budget-guide → /blog/budgeting-tips
> 5. Update 4 internal links currently pointing to /blog/budget-guide
> 6. Submit both URLs for recrawl in GSC
>
> **Expected outcome:** Consolidated page targets position 5-8 within 6 weeks (from current position 12-18 oscillation). Combined backlink equity on single URL.
> **Verification date:** May 12, 2026

### Bad Example: Triage Decision

> **Recommendations:**
>
> - Emergency fund page: Refresh with updated information
> - Budget pages: Consider merging the duplicate content
> - Savings accounts page: Needs a rewrite with current rates
> - CD rates page: Update with latest rates
> - Bitcoin page: Remove or redirect
>
> We recommend prioritizing the highest-traffic pages first.

**Why it fails:** No root cause analysis for any page. "Refresh with updated information" — WHAT information? "Consider merging" — consider? Either it's cannibalization or it isn't. No specific instructions for any action. No effort estimates. No expected outcomes. No verification dates. No data supporting why each triage action was chosen. A content team receiving this would need to do the entire analysis themselves to execute any of these recommendations.

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| "This page is old, update it" | No data-driven decline signal, wastes resources on stable content | Flag only pages with measurable decline: >20% traffic drop over 8 weeks or CTR decline with stable impressions |
| Treating all declining pages the same | A page needing a merge gets a superficial refresh and doesn't recover | Apply the four-action triage: refresh, rewrite, merge, or retire — each has different criteria and effort |
| Refreshing content by only changing the date | Google detects cosmetic-only updates and may penalize deceptive freshness signals | Make substantive changes: update statistics, add sections, revise recommendations. Then update the date. |
| Ignoring CTR decline on stable-ranking pages | CTR decline is the earliest decay signal — precedes ranking drops by 2-6 weeks | Monitor CTR trends separately. CTR decline with stable impressions = title/meta needs immediate refresh |
| Same review cadence for all pages | Wastes resources on stable content, misses critical revenue page decay | Monthly for revenue pages, quarterly for evergreen, bi-weekly for fast-changing niches |
| Deleting declining pages without redirects | Destroys accumulated backlinks and internal link equity | Always 301 redirect retired pages to the most relevant active page. Only noindex if zero backlinks. |
| Quarterly-only manual reviews | Misses fast-declining pages where 30-day intervention saves the ranking | Set automated alert thresholds. 8-week rolling windows. Flag > 20% decline immediately. |
| Refreshing without checking competitors | Fixes staleness but misses the actual displacement cause | Analyze current SERP for each keyword. Identify what competitors now have that the client doesn't. Match or exceed. |
