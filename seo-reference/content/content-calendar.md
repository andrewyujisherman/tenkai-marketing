# Content Calendar — Agent Reference (Ryo / content_calendar)

## What This Produces
A prioritized editorial calendar that schedules content production based on audit findings, keyword opportunity, business value, and content decay signals — connecting every piece of content to a measurable business outcome and a position in the search funnel.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **Data-driven prioritization, not editorial intuition.** Every piece of content is scored by a formula that weighs audit urgency, keyword opportunity, business value, and decay signals. The calendar reflects math, not gut feeling.
- **Funnel-mapped content mix.** Each piece is tagged TOFU/MOFU/BOFU with explicit conversion path logic — not just "we need more blog posts."
- **Connected to upstream data.** The calendar ingests keyword research output, audit findings, and decay signals. It doesn't exist in isolation — it's the planning layer between research and execution.
- **Cadence matched to resources.** Starter clients publishing 4/month get a different calendar than growth clients at 8/month or pro clients at 12/month. Overcommitting destroys quality.
- **Seasonal and competitive timing.** Content is scheduled when search demand peaks, not when it's convenient to write. A tax article published in April is 3 months late.

## Build Process (Ordered Steps)

1. **Ingest upstream data.** Pull from available sources:
   - Keyword research clusters (primary keywords, volumes, difficulty, intent)
   - Audit findings (thin content pages, missing topics, cannibalization issues)
   - Content decay report (declining pages needing refresh/rewrite)
   - Topic cluster map (gaps in existing clusters)
   - Competitor analysis (topics competitors cover that the client doesn't)

2. **Score every content opportunity.** Apply the priority scoring formula (see Critical Pattern #1) to every potential piece of content. This produces a ranked backlog.

3. **Determine publishing cadence.** Based on client tier and available resources: Starter (4 articles/month), Growth (8 articles/month), Pro (12 articles/month). Adjust if client has in-house writers supplementing.

4. **Apply content mix ratios.** Allocate the monthly slots: 60% informational (TOFU), 25% commercial investigation (MOFU), 15% transactional (BOFU). Adjust ratios based on where the client's funnel is weakest.

5. **Map to funnel stages.** For each piece: define the funnel stage, the target keyword cluster, the intended next action (what the reader should do after this content), and the internal link target (where does this piece push the reader next).

6. **Apply seasonal timing.** Cross-reference content topics against seasonal search trends (Google Trends data). Schedule content to publish 4-6 weeks before peak demand — content needs time to index and gain traction.

7. **Slot content into calendar weeks.** Distribute across the month: don't publish 4 articles in week 1 and none in weeks 2-4. Consistent publishing signals freshness to Google. Alternate between content types (blog post, comparison guide, case study, how-to).

8. **Assign content types and formats.** Based on search intent and SERP format: listicles for "best X" queries, how-to guides for procedural queries, comparison tables for "vs." queries, long-form guides for broad informational queries, case studies for MOFU/BOFU.

9. **Flag refresh/rewrite slots.** Reserve 20-30% of monthly capacity for updating existing content (refreshes and rewrites from decay audit). New content alone isn't enough — maintaining existing rankings is equally important.

10. **Compile the calendar.** Per Output Structure below, with each entry fully specified.

## Critical Patterns

### 1. Priority Scoring Formula
**WHEN:** Every content opportunity must be scored before placement in the calendar.
**HOW:** Calculate:
```
Priority Score = (audit_urgency × 3) + (keyword_opportunity × 2) + (business_value × 2) + (decay_signal × 1)
```
Each factor scored 1-5:
- **audit_urgency (×3 weight):** 5 = critical gap found in site audit (thin content, cannibalization), 4 = competitor covers topic and client doesn't, 3 = related to audit finding, 2 = general topic gap, 1 = nice-to-have
- **keyword_opportunity (×2 weight):** 5 = high volume + low difficulty + clear intent, 4 = high volume + medium difficulty, 3 = medium volume + low difficulty, 2 = medium volume + medium difficulty, 1 = low volume or high difficulty
- **business_value (×2 weight):** 5 = directly tied to revenue page or core service, 4 = supports key conversion path, 3 = builds topical authority in priority cluster, 2 = general brand awareness, 1 = tangential topic
- **decay_signal (×1 weight):** 5 = >40% traffic drop, active decline, 4 = >20% traffic drop, 3 = CTR declining (impressions steady, clicks falling), 2 = stale content (>12 months, no update), 1 = no decay signal

**Score range:** 8 (minimum) to 40 (maximum). Schedule highest scores first.
**WHY:** Without a formula, calendars are driven by what's easy to write or what the client requests — not what moves the business. The 3x weight on audit urgency ensures technical findings drive content priorities.
**DON'T:** Skip scoring and just list topics. Don't let client "pet projects" override high-scoring opportunities without explicit discussion. Don't score without data — if keyword data isn't available, use estimates and flag them.

### 2. Content Mix Ratios
**WHEN:** Building any monthly content plan — the ratio of content types must be deliberate.
**HOW:** Default ratio: 60% informational (TOFU), 25% commercial investigation (MOFU), 15% transactional (BOFU). Adjust based on funnel diagnosis:
- Client has traffic but no conversions → shift to 40/35/25 (more MOFU/BOFU)
- Client has no traffic → shift to 75/15/10 (heavy TOFU to build audience)
- Client has strong TOFU but weak authority → shift to 50/30/20 (more comparison/case study content)
**WHY:** All-TOFU calendars build traffic but not revenue. All-BOFU calendars target keywords that are too competitive without topical authority. The 60/25/15 default builds the authority base that makes commercial content competitive.
**DON'T:** Publish only blog posts. Mix formats: articles, comparison guides, case studies, tool reviews, templates, checklists, data studies. Each format serves different intent types and earns different kinds of engagement.

### 3. TOFU/MOFU/BOFU Funnel Mapping
**WHEN:** Every content piece in the calendar must have an explicit funnel tag and conversion path.
**HOW:**
- **TOFU (Top of Funnel):** Informational content answering broad questions. Reader is researching, not buying. Content types: how-to guides, educational articles, industry explainers, beginner guides. CTA: newsletter signup, related guide download, "learn more" to MOFU content. Keywords: informational intent ("what is," "how to," "guide to").
- **MOFU (Middle of Funnel):** Commercial investigation content for readers evaluating options. Content types: comparison guides ("X vs. Y"), "best [category]" listicles, case studies, product reviews, ROI calculators. CTA: free trial, demo request, consultation booking. Keywords: commercial intent ("best," "vs.," "review," "comparison").
- **BOFU (Bottom of Funnel):** Transactional content for readers ready to act. Content types: product/service pages, pricing guides, implementation guides, "how to get started with [product]." CTA: purchase, sign up, contact sales. Keywords: transactional intent ("buy," "pricing," "get started," "sign up").
**WHY:** Content without a funnel position has no conversion strategy. Each piece should push the reader to the next funnel stage or capture them at their current stage.
**DON'T:** Tag everything as TOFU. Don't create BOFU content without TOFU/MOFU content to feed it — readers need the journey. Don't skip the CTA definition — every piece needs a "what next."

### 4. Publishing Cadence by Tier
**WHEN:** Setting monthly content volume — must match client resources and quality standards.
**HOW:**
- **Starter (4/month):** 1 per week. 2-3 TOFU, 1 MOFU, 0-1 BOFU. Focus on highest-scoring opportunities only. Quality over quantity.
- **Growth (8/month):** 2 per week. 5 TOFU, 2 MOFU, 1 BOFU. Enough volume to build topic clusters. Can sustain one cluster build per quarter.
- **Pro (12/month):** 3 per week. 7 TOFU, 3 MOFU, 2 BOFU. Full cluster velocity. Can build 2-3 clusters per quarter. Requires dedicated writers.
**WHY:** Publishing 12 thin articles is worse than publishing 4 deep ones. Google's Helpful Content system penalizes sites with high ratios of low-quality content. The cadence must match the client's ability to produce premium content.
**DON'T:** Promise 12/month if the client has one part-time writer. Don't set cadence without discussing quality expectations. Don't count social posts or email content toward SEO publishing cadence.

### 5. Seasonal Planning and Timing
**WHEN:** Scheduling content for any topic with seasonal search demand.
**HOW:** Check Google Trends for seasonal patterns on primary keywords. Schedule content to publish 4-6 weeks before peak demand — content needs time to be indexed, earn initial backlinks, and gain ranking traction. For recurring seasonal content: schedule a refresh 6-8 weeks before peak (update stats, refresh date, add new information).
**WHY:** A "best tax software 2026" article published in January when people search in March-April misses the window. Published in February with a refresh in early March hits peak demand with fresh content.
**DON'T:** Ignore seasonality for "evergreen" topics — even evergreen content has seasonal variation. Don't publish seasonal content at peak demand (too late to rank). Don't forget to schedule refreshes for last year's seasonal content.

### 6. Refresh/Rewrite Slot Reservation
**WHEN:** Every monthly calendar must reserve capacity for maintaining existing content.
**HOW:** Reserve 20-30% of monthly publishing slots for refreshes and rewrites. Priority order: (1) revenue pages with any decline signal, (2) pages flagged by content decay audit (>20% traffic drop), (3) high-ranking pages not updated in 12+ months, (4) pages with declining CTR (impressions steady, clicks falling). Refreshes are lighter (update stats, add a section, republish with new date). Rewrites are heavier (fundamental restructure for changed intent).
**WHY:** 70%+ of top-ranking results were updated within the past 12 months. Content that isn't maintained loses ground regardless of initial quality. Teams that catch decay within 30 days fix it with focused updates; teams that wait 6+ months need expensive rebuilds.
**DON'T:** Allocate 100% of capacity to new content. Don't treat refreshes as lower priority than new content — maintaining a #3 ranking is often more valuable than earning a new #15. Don't schedule refreshes without checking decay data.

### 7. Topic Cluster Integration
**WHEN:** The calendar should build toward complete topic clusters, not scatter content across unrelated topics.
**HOW:** Identify which topic clusters are in progress (from `topic_cluster_map`). Prioritize content that fills gaps in active clusters before starting new clusters. Schedule cluster content in sequence: pillar page first (or early), then supporting cluster pages over subsequent weeks. Ensure each new piece links to the existing cluster content.
**WHY:** A half-built cluster provides minimal topical authority benefit. Google rewards comprehensive coverage of a topic — 3 articles on the same cluster signal more authority than 3 articles on 3 different topics. Completing clusters compounds ranking gains across all pages in the cluster.
**DON'T:** Start 5 clusters simultaneously with 1 article each. Complete clusters before starting new ones. Don't schedule cluster content without confirming the pillar page exists or is scheduled first.

### 8. Keyword-to-Content Type Mapping
**WHEN:** Assigning content format for each calendar entry.
**HOW:** Match content format to search intent and SERP format:
- "How to [X]" → Step-by-step guide with numbered lists
- "Best [X]" → Listicle with comparison criteria and clear winner
- "[X] vs [Y]" → Comparison guide with feature table
- "What is [X]" → Definitional article with examples and depth
- "[X] template/checklist" → Downloadable asset + supporting article
- "[X] statistics" → Data roundup (high AI citation potential)
- "[X] case study" → Narrative with metrics (E-E-A-T experience signal)
**WHY:** Content format mismatch kills rankings. If every top result for "best CRM software" is a listicle and you publish a 3,000-word essay, you won't rank — Google has determined the format users want.
**DON'T:** Default everything to "blog post." Different intents demand different formats. Check what format ranks in the SERP and match it.

### 9. Cannibalization Prevention in Calendar Planning
**WHEN:** Scheduling new content that may target keywords already covered by existing pages.
**HOW:** Before scheduling any new piece, check: (a) Does the client already have a page targeting this keyword? (Check GSC query data.) (b) Is another calendar entry already targeting the same keyword or a keyword with 60%+ SERP overlap? If yes to either: reassign the new piece to target a differentiated long-tail variant, or schedule it as a refresh/expansion of the existing page instead of net-new content. Maintain a keyword registry — a running list of which keywords are assigned to which URLs — and check it before every new calendar entry.
**WHY:** Publishing two articles targeting the same keyword is one of the most common self-inflicted SEO wounds. Both pages split ranking signals, confuse Google, and typically both rank worse than either would alone. Prevention at the calendar stage is far cheaper than detection and remediation after publication.
**DON'T:** Schedule content based only on topic — check keyword overlap at the SERP level. Two articles that seem different ("SEO audit checklist" vs. "how to audit your website for SEO") may target keywords with 80% SERP overlap and would cannibalize each other.

### 10. Content Velocity vs. Quality Tradeoff
**WHEN:** Client pressure to publish more content, or when comparing cadence to competitor output.
**HOW:** Run a quality audit on existing content before increasing velocity. If current content scores poorly (thin, low engagement, few rankings), publishing more of the same wastes budget. Fix quality first, then increase velocity. Use the "2:1 rule" — for every 2 new articles, allocate 1 refresh of existing content. Track content ROI: articles published per month vs. organic traffic gained. If the ratio is declining (more articles, same or less traffic growth), quality is the bottleneck, not quantity.
**WHY:** Google's Helpful Content system evaluates site-wide content quality. A site with 200 articles where 150 are thin gets penalized — the 50 good articles are dragged down by the 150 weak ones. Publishing 12 thin articles per month is actively harmful. 4 excellent articles per month compound far faster.
**DON'T:** Match competitor publishing velocity without matching their quality. Don't increase cadence to compensate for poor SEO performance — diagnose the real problem first. Don't count words as a proxy for quality.

### 11. AI Citation Optimized Content Slots
**WHEN:** Planning content with high potential for AI engine citation (Perplexity, Google AI Overviews, ChatGPT).
**HOW:** Reserve 1-2 slots per month specifically for AI-citation-optimized content. Best candidates: data roundups and statistics pages (Perplexity cites these 3x more than opinion pieces), definitional/encyclopedic content (ChatGPT favors this format), comprehensive guides with high fact density (stat every 150 words). Structure these pieces with: direct answers in first 40-60 words of each section, extensive JSON-LD schema, cited primary sources throughout. Tag these entries with an "AI citation target" flag in the calendar.
**WHY:** AI-referred sessions jumped 527% YoY in 2025. Only 12% of AI-cited URLs also rank in Google's top 10 — meaning AI citation is a separate discovery channel. Content optimized specifically for AI citation captures traffic that traditional SEO misses. Perplexity averages 21.87 citations per response — there are many citation slots to win.
**DON'T:** Optimize every piece for AI citation — it's a secondary channel. Most calendar slots should target traditional organic search. Don't sacrifice readability for fact density — the content must serve human readers first.

## Data Sources

| Source | What It Provides | Access Method |
|--------|-----------------|---------------|
| Keyword Research Output | Keyword clusters, volumes, difficulty, intent classification | Internal — from `keyword_research` service |
| Site Audit Findings | Thin content pages, missing topics, cannibalization, content gaps | Internal — from `site_audit` service |
| Content Decay Audit | Declining pages with traffic drop %, triage recommendation | Internal — from `content_decay_audit` service |
| Topic Cluster Map | Existing clusters, gap analysis, pillar page status | Internal — from `topic_cluster_map` service |
| Competitor Analysis | Topics competitors cover, content gaps, format analysis | Internal — from `competitor_analysis` service |
| Google Trends | Seasonal search demand patterns per keyword | Free — `trends.google.com` or API |
| Google Search Console | Current rankings, traffic, CTR trends for existing content | OAuth — only when client connects |

## Output Structure

The final deliverable MUST contain these sections in this order:

1. **Calendar Summary** — Total pieces planned, content mix breakdown (TOFU/MOFU/BOFU counts), cluster coverage, refresh/rewrite allocation, publishing cadence.
2. **Priority Backlog** — Full scored list of content opportunities with formula breakdown (audit_urgency, keyword_opportunity, business_value, decay_signal, total score). Sorted by total score descending.
3. **Monthly Calendar** — Week-by-week schedule. Each entry includes: title/topic, primary keyword, funnel stage (TOFU/MOFU/BOFU), content type/format, target word count, cluster assignment, priority score, new vs. refresh/rewrite, target publish date.
4. **Quarterly View** — 3-month overview showing cluster build progression, seasonal content timing, and cumulative content mix ratios.
5. **Refresh/Rewrite Queue** — Existing pages scheduled for updates, with: current URL, current traffic trend, decline severity, triage recommendation (refresh/rewrite/merge/retire), scheduled date.
6. **Content Dependencies** — Any pieces that require upstream work first (keyword research needed, brief needed, subject matter expert input needed, image/asset creation needed).
7. **Measurement Plan** — How each piece will be measured: target keyword rankings, organic traffic baseline (if refresh), expected indexation timeline, conversion tracking setup needed.

## Quality Gate

Before delivering to the client, verify ALL of the following:

- [ ] Every content piece has a priority score calculated via the formula — no unscored entries
- [ ] Content mix ratios are within range (default 60/25/15 TOFU/MOFU/BOFU, adjusted with reasoning)
- [ ] Refresh/rewrite slots represent 20-30% of total calendar capacity
- [ ] Seasonal content is scheduled 4-6 weeks before peak demand
- [ ] Every piece has a funnel stage tag (TOFU/MOFU/BOFU) and defined CTA/next action
- [ ] Calendar connects to at least one upstream data source (keyword research, audit, or decay report)
- [ ] Content builds toward complete topic clusters, not scattered across unrelated topics
- [ ] Publishing cadence matches client tier and resource capacity
- [ ] No more than 2 pieces targeting the same keyword cluster in the same week
- [ ] Each entry specifies content type/format based on SERP intent analysis
- [ ] Quarterly view shows cluster completion progression

## Cross-Service Connections

- **Receives from:**
  - `keyword_research` (Haruki) — keyword clusters with volume, difficulty, intent for opportunity scoring
  - `site_audit` (Haruki) — thin content findings, missing topic coverage, cannibalization flags for audit_urgency scoring
  - `content_decay_audit` (Yumi) — declining pages with traffic data for decay_signal scoring and refresh/rewrite queue
  - `topic_cluster_map` (Ryo) — cluster structure, gap analysis, pillar page status for cluster integration
  - `competitor_analysis` (Haruki) — competitor topic coverage for gap identification
  - Client onboarding — business goals, priority services/products, resource capacity, publishing tier
- **Sends to:**
  - `content_brief` (Sakura) — scheduled topics with primary keyword, intent, format, word count target, funnel stage, cluster assignment
  - `content_article` (Sakura) — production queue with publish dates and priorities
  - `monthly_report` — planned vs. actual publishing velocity, content pipeline status

**Data fields that transfer:**
- `calendar_entries[]` — `{title, primary_keyword, funnel_stage, content_type, word_count, cluster_id, priority_score, publish_date, new_or_refresh}`
- `priority_backlog[]` — `{topic, audit_urgency, keyword_opportunity, business_value, decay_signal, total_score}`
- `refresh_queue[]` — `{url, traffic_trend, decline_pct, triage, scheduled_date}`

## Output Examples

### Good Example: Calendar Entries (3-Month Quarterly View)

> **Q2 2026 Content Calendar — GreenLeaf Landscaping (Growth Tier, 8/month)**
>
> **Month 1 — April (Focus: Complete "Lawn Care" cluster)**
>
> | Week | Title | Primary Keyword | Funnel | Type | Score | New/Refresh | Cluster |
> |------|-------|----------------|--------|------|-------|-------------|---------|
> | W1 | How to Aerate Your Lawn: Complete Guide | lawn aeration guide | TOFU | How-to | 34 | New | Lawn Care |
> | W1 | Best Lawn Fertilizers for Spring 2026 | best lawn fertilizer spring | MOFU | Listicle | 32 | New | Lawn Care |
> | W2 | When to Start Mowing in Spring (By Region) | when to start mowing | TOFU | Guide | 30 | New | Lawn Care |
> | W2 | [REFRESH] Complete Lawn Care Schedule | lawn care schedule | TOFU | Guide | 29 | Refresh (-22% traffic) | Lawn Care |
> | W3 | Lawn Care Cost Guide: What to Expect in 2026 | lawn care cost | BOFU | Pricing guide | 28 | New | Lawn Care |
> | W3 | Overseeding vs. Sod: Which Is Right for Your Yard? | overseeding vs sod | MOFU | Comparison | 27 | New | Lawn Care |
> | W4 | 7 Lawn Care Mistakes Killing Your Grass | lawn care mistakes | TOFU | Listicle | 26 | New | Lawn Care |
> | W4 | [REFRESH] Organic Lawn Care: The Complete Guide | organic lawn care guide | TOFU | Guide | 25 | Refresh (-18% CTR) | Lawn Care |
>
> **Month 2 — May (Focus: Start "Tree Services" cluster + seasonal timing)**
>
> | Week | Title | Primary Keyword | Funnel | Type | Score | New/Refresh | Cluster |
> |------|-------|----------------|--------|------|-------|-------------|---------|
> | W1 | The Ultimate Guide to Tree Trimming | tree trimming guide | TOFU | Pillar | 33 | New | Tree Services |
> | W1 | Tree Removal Cost: 2026 Price Guide by Tree Size | tree removal cost | BOFU | Pricing guide | 31 | New | Tree Services |
> | W2 | How to Know If a Tree Is Dead (7 Warning Signs) | dead tree signs | TOFU | How-to | 29 | New | Tree Services |
> | W2 | [REFRESH] Summer Lawn Watering Schedule | lawn watering schedule | TOFU | Guide | 28 | Refresh (seasonal pre-peak) | Lawn Care |
> | W3 | When to Trim Oak Trees vs. Maple Trees | when to trim trees | TOFU | Guide | 27 | New | Tree Services |
> | W3 | Tree Trimming vs. Tree Pruning: What's the Difference? | tree trimming vs pruning | MOFU | Comparison | 26 | New | Tree Services |
> | W4 | How to Choose a Tree Service Company | how to choose tree service | MOFU | Guide | 25 | New | Tree Services |
> | W4 | Best Time to Plant Trees in [Region] | best time to plant trees | TOFU | Guide | 24 | New | Tree Services |
>
> **Month 3 — June (Focus: Complete "Tree Services" cluster + summer seasonal)**
>
> | Week | Title | Primary Keyword | Funnel | Type | Score | New/Refresh | Cluster |
> |------|-------|----------------|--------|------|-------|-------------|---------|
> | W1 | Emergency Tree Removal: What to Do After a Storm | emergency tree removal | BOFU | Guide | 32 | New | Tree Services |
> | W1 | Tree Stump Removal Methods Compared | tree stump removal | MOFU | Comparison | 28 | New | Tree Services |
> | W2 | [REFRESH] Best Lawn Mowers for Large Yards 2026 | best lawn mower large yard | MOFU | Listicle | 27 | Refresh (annual update) | Lawn Care |
> | W2 | How Much Does Stump Grinding Cost? | stump grinding cost | BOFU | Pricing guide | 26 | New | Tree Services |
> | W3 | Summer Landscaping Ideas That Boost Curb Appeal | summer landscaping ideas | TOFU | Listicle | 25 | New | Landscaping Design |
> | W3 | [REFRESH] Drought-Resistant Landscaping Guide | drought resistant landscaping | TOFU | Guide | 24 | Refresh (-25% traffic) | Landscaping Design |
> | W4 | Tree Disease Identification: Photos & Treatment Guide | tree disease identification | TOFU | Guide | 23 | New | Tree Services |
> | W4 | Landscaping ROI: Which Projects Increase Home Value? | landscaping roi home value | MOFU | Data roundup | 22 | New | Landscaping Design |

### Bad Example: Calendar Entries

> **Content Calendar — Q2 2026**
>
> **April:**
> - Blog post about lawn care tips
> - Blog post about spring gardening
> - Blog post about landscaping ideas
> - Blog post about tree services
>
> **May:**
> - Blog post about summer lawn maintenance
> - Blog post about outdoor living spaces
> - Blog post about garden design trends
> - Blog post about pest control
>
> **June:**
> - Blog post about drought-resistant plants
> - Blog post about landscape lighting
> - Blog post about pool landscaping
> - Blog post about water features

**Why it fails:** No priority scores — entries are listed without any data-driven ranking. No keywords, no funnel stages, no content types (everything is "blog post"). No cluster assignments — content scatters across unrelated topics instead of building topical authority. No refresh/rewrite slots (100% new content). No seasonal timing consideration. No word count targets. A writer could not distinguish which piece matters most or what format to use.

---

### Good Example: TOFU/MOFU/BOFU Mix Visualization

> **Q2 Content Mix — GreenLeaf Landscaping (24 pieces total)**
>
> ```
> TOFU (Informational)     ████████████████  14 pieces (58%)  Target: 60%  ✓
> MOFU (Commercial)        ██████            6 pieces  (25%)  Target: 25%  ✓
> BOFU (Transactional)     ████              4 pieces  (17%)  Target: 15%  ✓ (slightly over — justified by seasonal pricing search peaks)
> ```
>
> **Mix rationale:** Slight over-index on BOFU (17% vs. 15% target) because June-July sees peak "cost" and "pricing" searches for tree/landscaping services. Three pricing guides timed to when homeowners actively seek quotes.
>
> **Refresh allocation:** 5 of 24 pieces (21%) are refreshes of existing content. Within target range of 20-30%.
>
> **Cluster progression:**
> - Lawn Care cluster: 10/12 pages complete after April refreshes → **92% complete**
> - Tree Services cluster: 0/10 → 9/10 pages by end of June → **90% complete**
> - Landscaping Design cluster: 2/10 pages started → **20% started** (full build in Q3)

### Bad Example: TOFU/MOFU/BOFU Mix Visualization

> **Content Mix:**
> We'll be creating a balanced mix of top-of-funnel educational content, middle-of-funnel comparison content, and bottom-of-funnel conversion content. The exact breakdown will be adjusted based on performance data as we go.

**Why it fails:** No actual numbers or percentages. No visualization of the mix. "Balanced" is meaningless without specific ratios. "Adjusted based on performance" defers all strategic decisions to the future. No cluster progression tracking. No refresh allocation mentioned. A client receiving this has no idea what they're paying for or how content strategy maps to their business goals.

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| "Let's publish 3 blog posts a week" without scoring | No prioritization — easy topics get written, high-impact ones sit in backlog | Score every opportunity with the priority formula. Highest scores publish first. |
| 100% new content, 0% refreshes | Existing rankings decay while chasing new keywords | Reserve 20-30% of capacity for refreshes and rewrites of existing content |
| All TOFU, no MOFU/BOFU | Builds traffic with no conversion path | Apply 60/25/15 content mix. Adjust based on funnel diagnosis. |
| Publishing seasonal content at peak demand | Too late to index and rank — missed the window | Publish 4-6 weeks before peak. Schedule refresh of last year's seasonal content. |
| Calendar disconnected from keyword research | Content targets are guesses, not data-driven opportunities | Every calendar entry must trace to a keyword cluster with volume and difficulty data |
| Starting 5 topic clusters with 1 article each | Half-built clusters provide minimal authority benefit | Complete one cluster before starting the next. Depth before breadth. |
| Same format for every piece | Format mismatch with SERP intent kills rankings | Match format to what actually ranks: listicles, comparisons, how-tos, guides |
| No measurement plan | Can't prove ROI or adjust strategy | Define target metrics per piece: ranking position, traffic, conversions |
