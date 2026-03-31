# Competitor Analysis — Agent Haruki Reference

## What This Produces

A comprehensive competitive intelligence report covering domain-level organic traffic estimation, top pages with keyword attribution, content gap analysis, backlink comparison, SERP feature ownership, and share of voice calculation. The output directly feeds content strategy (via content_brief, keyword_research chains) and link building prioritization.

**Deliverable type:** `competitive_report`
**Agent:** Haruki (春樹) — SEO Strategist
**Model:** gemini-2.5-pro
**Chains to:** `content_brief`, `keyword_research` (via CHAIN_MAP)

---

## Professional Standard

Premium competitor analysis is not "here are your competitors and their traffic." It answers: What are they doing that you're not? What opportunities exist in the gaps? Where can you win, and where should you not bother?

A $5,000/month agency competitor analysis delivers:
- Domain-level organic visibility comparison (not just traffic — visibility in the SERP ecosystem)
- Page-level keyword attribution (which pages drive their traffic, for which keywords)
- Content gap matrix (topics they cover systematically that the client doesn't)
- Backlink gap analysis (referring domains they have that the client doesn't)
- SERP feature ownership (who holds featured snippets, People Also Ask, knowledge panels for target queries)
- Share of voice calculation across the target keyword universe
- Competitive positioning map (where the client stands relative to each competitor)
- Actionable strategy: which gaps to close first, which to ignore, and why

---

## Build Process (Ordered Steps)

1. **Identify competitors** — Pull from client parameters, `client_seo_context.competitors`, or discover via SERP overlap. Select 3-5 direct competitors. Include at least 1 "aspirational" competitor (larger player the client wants to challenge) and 1 "adjacent" competitor (similar size, adjacent market).

2. **Domain-level organic assessment** — For each competitor, estimate: organic traffic range, number of ranking keywords, domain authority/rating equivalent, site age, content volume.

3. **Top pages analysis** — For each competitor, identify their top 10-20 pages by organic traffic. For each page: primary keyword, estimated traffic, content format (blog, landing page, tool, resource), and what makes it rank.

4. **Content gap analysis** — Map topics and keyword clusters. Identify: topics ALL competitors cover that the client doesn't, topics SOME competitors cover (opportunity to catch up), topics NO competitor covers well (blue ocean opportunity).

5. **Backlink comparison** — For each competitor: total referring domains, DR distribution of referring domains, link velocity (links acquired per month), top linking pages. Identify the client's backlink gap (referring domains competitors have that the client doesn't).

6. **SERP feature audit** — For the client's target keywords (from keyword_research or parameters): who owns featured snippets? Who appears in People Also Ask? Who has video carousels? Map SERP feature ownership across competitors.

7. **Share of voice calculation** — Across the target keyword universe, calculate each competitor's share of voice: (sum of estimated traffic for ranked keywords / total estimated traffic for all target keywords). This is the single most important competitive metric.

8. **Competitive positioning** — Synthesize all data into a positioning assessment: where the client is strong, where they're weak, and where the opportunities are. Frame as a strategic recommendation.

9. **Chain data extraction** — Output competitor domains, keyword gaps, and content gaps in the format expected by the CHAIN_MAP targets (content_brief and keyword_research).

---

## Critical Patterns

### 1. Competitors Are Defined by SERP Overlap, Not Business Category
**WHEN:** Identifying competitors to analyze.
**HOW:** True SEO competitors are the domains that rank for the same keywords, not necessarily the same type of business. A plumber's SEO competitors may include Angi, Yelp, and HomeAdvisor — not just other plumbing companies.
**WHY:** The SERP is the competitive arena. A business competitor that doesn't rank for target keywords isn't an SEO competitor.
**DON'T:** Only analyze business competitors. Always check who actually occupies the target SERPs.

### 2. Content Gap ≠ Keyword Gap
**WHEN:** Analyzing competitive content.
**HOW:** Content gaps are TOPICS the competitor covers systematically. Keyword gaps are specific search terms the competitor ranks for. A content gap might be "HVAC maintenance guides" (a topic cluster); a keyword gap might be "how often to change furnace filter" (a specific query). Both matter; they're different analyses.
**WHY:** Content gaps inform content strategy (what to write about). Keyword gaps inform specific page optimization (what terms to target).
**DON'T:** Conflate content gaps and keyword gaps. Report them separately.

### 3. Share of Voice Is the North Star Metric
**WHEN:** Summarizing competitive positioning.
**HOW:** For a defined keyword universe (e.g., 100 target keywords), calculate each domain's estimated traffic from those keywords. Express as a percentage. Track over time.
**WHY:** Share of voice captures the combined effect of rankings, traffic, and keyword coverage in a single number. It's the most concise competitive metric.
**DON'T:** Rely on domain authority alone as a competitive metric. DA doesn't translate directly to visibility.

### 4. Page-Level Attribution Reveals Strategy
**WHEN:** Analyzing competitor top pages.
**HOW:** For each top page, identify: what keyword cluster it targets, what format it uses (list, guide, tool, comparison), how comprehensive it is, and what makes it rank (authority, freshness, depth, featured snippet optimization).
**WHY:** Understanding WHY a competitor's page ranks reveals their strategy. This is more valuable than knowing THAT it ranks.
**DON'T:** Just list competitor top pages. Analyze what makes each one successful.

### 5. Backlink Gap Analysis Must Filter for Quality
**WHEN:** Comparing backlink profiles.
**HOW:** Don't compare raw backlink counts. Compare referring domain counts filtered by DR 20+. Identify high-quality referring domains the competitor has that the client doesn't. These become link building targets.
**WHY:** 1,000 low-quality links are worse than 20 relevant, authoritative ones. Quality-filtered comparison produces actionable outreach targets.
**DON'T:** Report total backlink counts without quality filtering. Unfiltered numbers are misleading.

### 6. Link Velocity Signals Momentum
**WHEN:** Assessing competitive trajectory.
**HOW:** Estimate how many new referring domains each competitor acquires per month. Compare link velocity, not just total links.
**WHY:** A competitor gaining 50 referring domains/month will overtake one with more total links but only gaining 5/month. Velocity predicts future rankings.
**DON'T:** Only compare current totals. Show trajectory.

### 7. SERP Features Are Prime Real Estate
**WHEN:** Mapping competitive SERP ownership.
**HOW:** For each target keyword, check: who owns the featured snippet? Who appears in People Also Ask? Who has FAQ rich results? Who has video carousels? Map this across 20-50 target keywords.
**WHY:** SERP features capture disproportionate clicks. A featured snippet can capture 30%+ of clicks. Losing SERP features even while maintaining position 1 means traffic loss.
**DON'T:** Ignore SERP features and only report ranking positions.

### 8. Three Tiers of Competitive Opportunities
**WHEN:** Prioritizing the action plan.
**HOW:** Tier 1: Quick wins — keywords where the client is on page 2 and competitors are on page 1 (close the gap). Tier 2: Content gaps — topics competitors own that the client has zero coverage on. Tier 3: Authority plays — high-difficulty keywords requiring sustained link building.
**WHY:** Tiering prevents the client from chasing everything. Resources are finite; prioritization is strategy.
**DON'T:** Present 50 equal-priority recommendations. Tier them.

### 9. Blue Ocean Opportunities
**WHEN:** Looking beyond competitive gaps.
**HOW:** Identify topics and keywords where NO competitor has strong coverage. These are blue ocean opportunities — easier to win, less competitive, often high-intent long-tail queries.
**WHY:** Competing for saturated keywords is expensive. Finding uncontested territory provides faster wins.
**DON'T:** Only analyze what competitors ARE doing. Explicitly look for what they're NOT doing.

### 10. Competitive Intelligence Has a Shelf Life
**WHEN:** Setting expectations and cadence.
**HOW:** Competitor landscapes shift. New content, new links, algorithm updates, and new entrants change the competitive picture. Recommend monthly competitive monitoring (not quarterly).
**WHY:** A quarterly competitor analysis is outdated by the time it's delivered. Monthly competitive scans catch shifts within the response window.
**DON'T:** Treat competitor analysis as a one-time project. Build it into the monthly cycle.

### 11. Aspirational Competitor Analysis
**WHEN:** Client wants to understand what it takes to compete at the next level.
**HOW:** Include one competitor significantly larger/more established. Analyze: what investment level produced their results? How long did it take? What's the gap between the client and this aspirational benchmark?
**WHY:** Aspirational comparisons set realistic expectations and help clients understand the investment required for ambitious goals.
**DON'T:** Only compare against similar-sized competitors. Include one "stretch" benchmark.

---

## Data Sources

| Source | What It Provides | Integration |
|--------|-----------------|-------------|
| Serper API | SERP results, competitor rankings, SERP features | `fetchKeywordSerpData()` |
| Site Scraper | Competitor page content, structure, meta data | `scrapeUrl()` |
| BFS Crawler | Competitor site structure, internal linking, content inventory | `crawlSite()` |
| GSC (OAuth) | Client's actual ranking data for overlap comparison | `fetchGSCData()` via client integration |
| `client_seo_context` | Prior competitor data, keyword targets | Supabase `client_seo_context` table |
| Google Search (grounding) | Real-time competitive intelligence | Gemini `googleSearch` tool |

---

## Output Structure

```json
{
  "competitive_landscape_score": 0-100,
  "competitors_analyzed": [
    {
      "domain": "...",
      "type": "direct/aspirational/adjacent",
      "estimated_organic_traffic": "...",
      "ranking_keywords_estimate": 0,
      "domain_age": "...",
      "content_pages_estimate": 0,
      "authority_estimate": 0,
      "link_velocity": "...",
      "top_pages": [
        { "url": "...", "primary_keyword": "...", "estimated_traffic": 0, "format": "...", "why_it_ranks": "..." }
      ]
    }
  ],
  "content_gap_analysis": {
    "topics_all_competitors_cover": [ { "topic": "...", "competitor_coverage": [], "client_coverage": "none/partial/strong" } ],
    "blue_ocean_opportunities": [ { "topic": "...", "search_volume_estimate": "...", "difficulty": "low/medium", "rationale": "..." } ]
  },
  "keyword_gaps": [
    { "keyword": "...", "search_volume": "...", "competitor_ranking": "...", "client_ranking": "not_found/position", "opportunity": "..." }
  ],
  "backlink_comparison": {
    "client": { "referring_domains": 0, "dr_distribution": {}, "link_velocity": "..." },
    "competitors": [
      { "domain": "...", "referring_domains": 0, "dr_distribution": {}, "link_velocity": "...", "unique_referring_domains": 0 }
    ],
    "link_gap_targets": [ { "referring_domain": "...", "links_to_competitors": [], "outreach_opportunity": "..." } ]
  },
  "serp_feature_ownership": {
    "featured_snippets": [ { "keyword": "...", "owner": "...", "client_opportunity": "..." } ],
    "people_also_ask": {},
    "knowledge_panels": {}
  },
  "share_of_voice": {
    "keyword_universe_size": 0,
    "rankings": [ { "domain": "...", "sov_percentage": 0, "trend": "..." } ]
  },
  "strategic_positioning": {
    "client_strengths": [],
    "client_weaknesses": [],
    "priority_opportunities": [
      { "tier": 1, "opportunity": "...", "effort": "low/medium/high", "expected_impact": "..." }
    ]
  },
  "action_plan": [
    { "priority": 1, "action": "...", "feeds_service": "content_brief/keyword_research", "expected_timeline": "..." }
  ]
}
```

---

## Quality Gate

- [ ] 3-5 competitors analyzed (including 1 aspirational, 1 adjacent)
- [ ] Competitors selected based on SERP overlap, not just business category
- [ ] Top pages analyzed with attribution (WHY they rank, not just THAT they rank)
- [ ] Content gaps and keyword gaps reported separately
- [ ] Backlink comparison filtered for quality (not raw counts)
- [ ] Share of voice calculated across defined keyword universe
- [ ] SERP feature ownership mapped for target keywords
- [ ] Blue ocean opportunities identified (not just gaps with existing competitors)
- [ ] Opportunities tiered by priority (quick wins, content gaps, authority plays)
- [ ] All cited URLs and domains are real and verified
- [ ] Action plan connects to specific downstream services (content_brief, keyword_research)
- [ ] Business impact framed ("This means your competitors are capturing potential customers searching for [topic]")

---

## Cross-Service Connections

| Connected Service | Data Direction | What Flows |
|-------------------|---------------|------------|
| `content_brief` | **AUTO-CHAIN** — Competitor analysis triggers content briefs | Content gaps, keyword gaps → content brief topics and differentiation strategy |
| `keyword_research` | **AUTO-CHAIN** — Competitor analysis triggers keyword research | Keyword gaps, competitor keyword universe → keyword research seed data |
| `link_analysis` | Backlink gap informs link strategy | Competitor referring domains → link building target list |
| `outreach_emails` | Link gap targets become outreach recipients | High-quality referring domains → outreach email targets |
| `content_calendar` | Content gaps prioritize the calendar | Topics competitors cover → content calendar priorities |
| `monthly_report` | Competitive context for performance narrative | Share of voice, competitive positioning → report strategic context |
| `geo_audit` | Competitive AI citation analysis | Competitor AI visibility → GEO competitive positioning |

**Chain data extracted for downstream services:**
- `competitor_domains`: top 5 competitor domains (strings)
- `keyword_gaps`: top 15 keyword opportunities
- `from_competitor_analysis`: top 10 content gap topics

---

## Output Examples

### Good Example: Competitor Profile Entry

> **Competitor: RotoRooter.com** (Direct competitor)
>
> | Metric | Value | vs. Client |
> |--------|-------|-----------|
> | Estimated organic traffic | 285,000 sessions/mo | 67x client (4,247/mo) |
> | Ranking keywords (page 1) | 12,400 | 23x client (540) |
> | Referring domains (DR 20+) | 8,900 | 89x client (100) |
> | Link velocity | ~120 new referring domains/mo | Client: ~4/mo |
> | Domain age | 18 years | Client: 6 years |
> | Content pages | ~4,200 | Client: ~89 |
>
> **Top 3 pages driving traffic:**
> 1. `/plumbing-101/water-heater-repair-cost` — ranks #1 for "water heater repair cost" (14,800 mo/search). Format: 3,200-word guide with interactive cost calculator, video walkthrough, and user-submitted cost data. **Why it ranks:** original data (12,000+ user cost submissions), multimedia, 340 referring domains to this single page.
> 2. `/plumbing-101/how-to-unclog-a-drain` — ranks #1 for "how to unclog a drain" (33,100 mo/search). Format: step-by-step guide with images per step, tool comparison table, "when to call a pro" CTA. **Why it ranks:** content depth (2,800 words), 520 referring domains, featured snippet ownership.
> 3. `/locations/austin-tx` — ranks #3 for "plumber austin" (6,600 mo/search). Format: location page with service list, reviews, team photos, service area map. **Why it ranks:** strong internal linking from national site authority, local schema, 45 location-specific backlinks.
>
> **Strategic takeaway:** Roto-Rooter is an aspirational competitor — the client cannot match their domain authority or link profile in the short term. However, their local Austin page ranks on content depth and local signals, not raw authority. The client can compete at the local level with location-specific content and local link building.

### Bad Example: Competitor Profile Entry

> **Roto-Rooter** — Large national plumbing company with high traffic. They rank for a lot of keywords and have many backlinks. They have more content than the client.

*Why it fails: No metrics, no specific page analysis, no explanation of WHY their pages rank, no strategic framing of what the client can learn or where they can compete. "A lot of keywords" and "many backlinks" communicate zero actionable intelligence.*

### Good Example: Content Gap Finding

> **Content gap: "Plumbing cost guides" cluster**
>
> All 4 competitors have dedicated cost guide sections. The client has zero coverage.
>
> | Competitor | Pages in cluster | Combined est. traffic | Keywords covered |
> |-----------|-----------------|---------------------|-----------------|
> | RotoRooter.com | 12 cost guides | 34,000/mo | 89 keywords |
> | MrRooter.com | 8 cost guides | 18,500/mo | 52 keywords |
> | BenjaminFranklin.com | 6 cost guides | 9,200/mo | 31 keywords |
> | ARS.com | 5 cost guides | 7,800/mo | 28 keywords |
> | **Client** | **0 pages** | **0/mo** | **0 keywords** |
>
> **Top keywords in this cluster the client is missing:**
> - "water heater repair cost" — 14,800 mo/search, $8.50 CPC, commercial intent
> - "cost to replace sewer line" — 6,600 mo/search, $12.20 CPC, commercial intent
> - "plumbing repair cost estimator" — 3,400 mo/search, $6.80 CPC, commercial intent
>
> **Recommendation:** Build a 5-page cost guide cluster as Tier 2 priority. Start with "water heater repair cost" (highest volume). Include original pricing data from client's job history — this creates a differentiation angle no national competitor can replicate with generic data. Estimated timeline: 4 weeks for 5 pages. Feeds → `content_brief` service.

### Bad Example: Content Gap Finding

> Competitors have content about plumbing costs that the client doesn't. The client should create similar content to compete.

*Why it fails: No specific competitors named, no volume data, no keyword list, no prioritization, no differentiation angle. "Create similar content" without specifying which topics, in what order, and how to differentiate is a non-strategy.*

### Good Example: Share-of-Voice Table Row

> **Share of Voice — "Austin plumbing services" keyword universe (47 tracked keywords)**
>
> | Domain | SOV % | Trend (3mo) | Top Position Keywords | Est. Monthly Traffic from Universe |
> |--------|-------|-------------|----------------------|----------------------------------|
> | abcplumbing.com (client) | 4.2% | +1.8% | 6 | 890 |
> | roto-rooter.com | 31.7% | -0.4% | 18 | 6,720 |
> | radiantplumbing.com | 12.3% | +2.1% | 11 | 2,610 |
> | mrplumbersa.com | 8.9% | +0.6% | 8 | 1,890 |
> | stanleyplumbing.com | 6.1% | -1.2% | 7 | 1,290 |
>
> **Interpretation:** The client holds 4.2% share of voice, up from 2.4% three months ago — the fastest growth rate in the competitive set. Radiant Plumbing is the most direct threat, growing at +2.1% and now at 12.3%. Roto-Rooter dominates at 31.7% but is declining. The client's realistic 6-month target is to surpass Stanley Plumbing (6.1%) and challenge Mr. Plumber (8.9%).

### Bad Example: Share-of-Voice Table Row

> The client has a small share of voice compared to competitors. They need to increase their visibility by ranking for more keywords.

*Why it fails: No percentage, no competitor comparison, no trend data, no target. "Small" is not a metric. The good example shows exact percentages, 3-month trends, and a realistic target timeline.*

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|---|---|---|
| Comparing only raw traffic numbers | Traffic without context (industry, monetization) is meaningless | Show traffic + keyword attribution + content strategy |
| Listing 50 keyword gaps with no prioritization | Overwhelms and produces no action | Tier into quick wins, content gaps, authority plays |
| Ignoring SERP features | Featured snippets capture 30%+ clicks, changing competitive dynamics | Map feature ownership across target keywords |
| Only analyzing business competitors | SEO competitors include aggregators, directories, content sites | Identify competitors based on SERP overlap |
| Comparing total backlink counts | 10k spam links ≠ 100 quality links | Filter referring domains by DR 20+ |
| One-time competitor analysis | Competitive landscape shifts monthly | Recommend monthly competitive monitoring |
| Reporting what competitors have without an action plan | Intelligence without action is noise | Every finding must connect to a specific recommendation |
| Recommending the client compete for everything | Resources are finite; competing everywhere means winning nowhere | Identify where to compete AND where to deliberately not compete |
