# GEO Audit — Agent Daichi Reference

## What This Produces

A platform-by-platform assessment of the client's visibility and citability across AI search engines — Google AI Overviews, Perplexity, ChatGPT Search, and Bing Copilot. Includes content citability scoring, entity signal evaluation, freshness tracking, and a prioritized action plan to increase AI-driven referral traffic.

**Deliverable type:** `geo_report`
**Agent:** Daichi (大地) — GEO / AI Search Specialist
**Model:** gemini-2.5-pro

---

## Professional Standard

A $5,000/month agency GEO audit does not treat AI search as an afterthought bolted onto traditional SEO. It recognizes that only 12% of AI-cited URLs also rank in Google's top 10 — AI search is a fundamentally different discovery channel requiring its own optimization strategy.

Premium GEO audits deliver:
- Platform-specific analysis, not a generic "optimize for AI" checklist
- Content-level citability scoring with actionable fix instructions
- Entity presence evaluation across 4+ third-party platforms
- Competitive citation gap analysis (who IS getting cited, and why)
- Freshness tracking calendar with quarterly update enforcement
- Direct connection between GEO findings and content strategy recommendations

---

## Build Process (Ordered Steps)

1. **Identify target queries** — Pull from client's keyword research (via `client_seo_context.top_keywords`) or parameters. Select 10-20 primary queries representing the client's core topics.

2. **Platform citation check** — For each target query, evaluate whether the client's content appears in AI-generated responses across all four platforms. Use Serper API with search type variations and Google grounding where available.

3. **Content citability audit** — Analyze the client's top 20 pages for AI citation readiness:
   - First 40-60 words: does the opening directly answer the target query?
   - Fact density: statistics/data every 150-200 words?
   - Conversational specificity: does content address "for whom," "under what conditions," "compared to what"?
   - Original research signals: proprietary data, benchmarks, unique datasets?

4. **Schema completeness check** — Evaluate JSON-LD structured data on key pages. AI engines use schema to verify claims and assess credibility. Check for Organization, Article, FAQ, HowTo, and LocalBusiness schemas.

5. **Entity signal evaluation** — Cross-reference with entity_optimization service. Check if the brand has consistent entity presence across platforms. (Defer deep entity work to entity_optimization.)

6. **Freshness audit** — Flag any priority page not updated within 90 days. Pages not updated quarterly are 3x more likely to lose AI citations.

7. **Competitive citation analysis** — For 3-5 target queries, identify which competitors ARE being cited. Analyze why (authority, freshness, format, schema).

8. **Score and prioritize** — Assign an overall AI Citability Score (0-100). Rank recommendations by impact and effort.

9. **Generate platform-specific action plans** — Separate recommendations for each AI platform based on their distinct citation patterns.

---

## Critical Patterns

### 1. Platform Citation Patterns Are Not Interchangeable
**WHEN:** Writing any GEO recommendation.
**HOW:** Segment all advice by platform. What works for Perplexity (freshness, fact density) actively differs from what works for ChatGPT (encyclopedic authority, Wikipedia-style writing).
**WHY:** Each platform has different crawling behavior, domain preferences, and citation styles.
**DON'T:** Write "optimize for AI search" generically. Always specify which platform the recommendation targets.

### 2. Google AI Overviews — Authority + Schema
**WHEN:** Client wants visibility in Google AIO.
**HOW:** 49% of cited domains are 15+ years old. Focus on schema markup (Organization, sameAs), entity relationships in Knowledge Graph, and authoritative content depth. AIO pulls from Google's existing index and Knowledge Graph.
**WHY:** AIO is the hardest platform for newer domains. Schema and entity signals compensate for domain age.
**DON'T:** Promise quick AIO results for new domains. Set realistic expectations.

### 3. Perplexity — Freshness + Fact Density
**WHEN:** Client wants Perplexity citations.
**HOW:** Perplexity averages 21+ citations per response and is 82% responsive to content published within 30 days. Pack statistics every 150-200 words. Cite primary sources. Use inline data.
**WHY:** Perplexity's per-claim inline attribution model rewards content that provides discrete, verifiable facts.
**DON'T:** Serve evergreen content without regular updates. Quarterly freshness is the minimum.

### 4. ChatGPT Search — Encyclopedic Authority
**WHEN:** Client wants ChatGPT citations.
**HOW:** Wikipedia is #1 cited source (7.8%). 45.8% of cited domains are 15+ years old. Write in encyclopedic, factual style. Build authority through third-party mentions.
**WHY:** ChatGPT heavily favors established, trusted sources. It's the hardest platform for newer brands.
**DON'T:** Expect ChatGPT citations from blog-style content on new domains.

### 5. Bing Copilot — Most Accessible for New Domains
**WHEN:** Client has a newer domain (under 5 years).
**HOW:** 18.85% of Bing Copilot citations come from domains under 5 years old — the most open platform to newer domains. Optimize for Bing ranking signals specifically.
**WHY:** Bing Copilot's willingness to cite newer sources makes it the best entry point for newer businesses.
**DON'T:** Ignore Bing-specific optimization (Bing Webmaster Tools, IndexNow protocol).

### 6. First 40-60 Words Are Everything
**WHEN:** Evaluating any page for AI citability.
**HOW:** AI systems evaluate relevance primarily on opening content. The first 200 words should directly answer the primary query. Check: does paragraph 1 answer the question without preamble?
**WHY:** AI engines need to extract a clean, cite-worthy passage. Preamble ("In today's digital landscape...") wastes the citation window.
**DON'T:** Accept pages that bury the answer below introductory fluff.

### 7. Original Research Is a Citation Magnet
**WHEN:** Planning content improvements for AI visibility.
**HOW:** Proprietary data, benchmark studies, unique datasets, expert commentary. If the client publishes something no one else has, AI engines have a reason to cite them specifically.
**WHY:** AI engines need to attribute claims. Unique data creates attribution obligation.
**DON'T:** Recommend creating "original research" from synthesized Google results. It must be genuinely proprietary.

### 8. The 12% Overlap Finding
**WHEN:** Client asks "won't our existing SEO work cover AI search?"
**HOW:** Only 12% of AI-cited URLs also rank in Google's top 10 for the original prompt (Ahrefs data). Present this data to justify GEO as a separate workstream.
**WHY:** AI citation is a fundamentally different discovery channel requiring separate optimization.
**DON'T:** Treat GEO as a subset of traditional SEO. They require parallel strategies.

### 9. Quarterly Freshness Is Mandatory
**WHEN:** Creating the freshness audit section.
**HOW:** Flag every priority page not updated in 90+ days. Create a content freshness calendar. Pages not updated quarterly are 3x more likely to lose AI citations.
**WHY:** AI platforms actively deprioritize stale content, especially Perplexity.
**DON'T:** Accept "we updated the date" as a freshness signal. Substantive content changes are required.

### 10. Fact Density Scoring
**WHEN:** Evaluating content pages for citability.
**HOW:** Count statistics, specific numbers, dates, and cited sources per 200-word block. Target: at least one verifiable data point every 150-200 words.
**WHY:** High fact density gives AI engines multiple citation anchor points within a single page.
**DON'T:** Count vague claims ("many businesses find...") as facts. Must be specific and verifiable.

### 11. Conversational Specificity Beats Generic Coverage
**WHEN:** Recommending content improvements.
**HOW:** Content addressing "for whom," "under what conditions," and "compared to what" gets cited far more than generic keyword-optimized content. Push for specificity.
**WHY:** AI queries are conversational. Content that mirrors conversational specificity matches user intent better.
**DON'T:** Recommend generic "comprehensive guides" for GEO. Specific, conditional answers perform better.

### 12. Schema Markup for AI Credibility
**WHEN:** Evaluating technical AI readiness.
**HOW:** JSON-LD structured data helps AI verify claims and assess credibility. Check for Organization schema with sameAs array, Article schema with author/dateModified, FAQ schema for Q&A content.
**WHY:** Proper schema is how AI engines programmatically verify entity relationships and content authority.
**DON'T:** Add schema just for traditional rich snippets — evaluate it through the lens of AI credibility assessment.

---

## Data Sources

| Source | What It Provides | Integration |
|--------|-----------------|-------------|
| Serper API | SERP data, AI Overview presence indicators | `fetchKeywordSerpData()` |
| PageSpeed API | Page performance (relevant to crawlability) | `fetchAllSiteData()` |
| BFS Crawler | On-page content analysis, schema detection | `crawlSite()` |
| GSC (OAuth) | Actual query data, click-through rates | `fetchGSCData()` via client integration |
| Site Scraper | Title, meta, headings, body text | `scrapeUrl()` |
| `client_seo_context` | Accumulated keywords, audit findings, competitors | Supabase `client_seo_context` table |

---

## Output Structure

```json
{
  "ai_citability_score": 0-100,
  "platform_analysis": {
    "google_aio": { "current_visibility": "...", "opportunities": [], "recommendations": [] },
    "perplexity": { "current_visibility": "...", "opportunities": [], "recommendations": [] },
    "chatgpt": { "current_visibility": "...", "opportunities": [], "recommendations": [] },
    "bing_copilot": { "current_visibility": "...", "opportunities": [], "recommendations": [] }
  },
  "content_citability_audit": [
    { "url": "...", "citability_score": 0-100, "first_60_words_pass": true/false, "fact_density_score": 0-100, "freshness_status": "...", "issues": [], "fixes": [] }
  ],
  "schema_assessment": { "pages_with_schema": 0, "schema_types_found": [], "missing_schema": [], "recommendations": [] },
  "entity_signals": { "cross_platform_presence": 0, "platforms_found": [], "consistency_score": 0-100 },
  "freshness_calendar": [ { "url": "...", "last_updated": "...", "days_stale": 0, "priority": "critical/high/medium" } ],
  "competitive_citation_analysis": [ { "query": "...", "cited_competitors": [], "why_cited": "..." } ],
  "action_plan": [ { "priority": 1, "platform": "...", "action": "...", "expected_impact": "...", "effort": "low/medium/high" } ]
}
```

---

## Quality Gate

- [ ] All four AI platforms analyzed separately with platform-specific recommendations
- [ ] At least 10 target queries evaluated for current AI citation status
- [ ] Content citability audit covers top 10-20 client pages
- [ ] Fact density scored per page, not just "needs improvement"
- [ ] First 40-60 words evaluated on each priority page
- [ ] Freshness audit flags every page not updated in 90+ days
- [ ] Schema assessment includes specific missing markup recommendations
- [ ] Competitive citation analysis identifies WHO is being cited and WHY
- [ ] All URLs cited are real, verified pages (no hallucinated URLs)
- [ ] Action plan prioritized by impact and effort
- [ ] Business impact framed in plain English ("This means more potential customers finding you through AI assistants")
- [ ] No generic "optimize for AI" recommendations — every item is specific and actionable

---

## Cross-Service Connections

| Connected Service | Data Direction | What Flows |
|-------------------|---------------|------------|
| `entity_optimization` | GEO audit findings feed entity work | Entity gaps identified in GEO audit → entity_optimization action items |
| `content_brief` | GEO audit recommendations shape briefs | AI citability requirements (fact density, opening format) → content brief specs |
| `content_article` | GEO standards applied to all content | Citability checklist from GEO audit → article writing guidelines |
| `schema_generation` | Schema gaps identified → schema service | Missing JSON-LD schemas → schema_generation queue |
| `content_decay_audit` | Freshness findings overlap | Stale pages flagged for freshness → decay audit triage |
| `keyword_research` | Target queries inform GEO analysis | Top keywords from keyword_research → GEO audit target queries |
| `monthly_report` | GEO metrics tracked over time | AI citability score, citation counts → monthly report section |

---

## Output Examples

### Good Example: Citability Score Breakdown

> **Page:** `/blog/water-heater-repair-cost-guide`
> **Overall Citability Score: 34/100**
>
> | Citability Factor | Score | Detail |
> |------------------|-------|--------|
> | First 60 words | 15/25 | Opens with "Wondering how much a water heater repair costs?" — addresses the query but lacks a direct numerical answer. **Fix:** Lead with "The average water heater repair costs $150-$700, depending on the issue. Here's what drives the price." |
> | Fact density | 8/25 | 2 statistics in 1,400 words (1 per 700 words). Target: 1 per 150-200 words = 7-9 data points needed. **Fix:** Add cost breakdowns per repair type, regional pricing data, labor vs. parts split percentages, and warranty claim statistics. |
> | Schema markup | 6/25 | Article schema present but missing `author` with credentials and `dateModified` (last updated 14 months ago). **Fix:** Add author with verifiable plumbing credentials, update `dateModified` to reflect content refresh date. |
> | Freshness | 5/25 | Last updated 427 days ago. Perplexity deprioritizes content not updated within 90 days. Google AIO uses `dateModified` as a recency signal. **Fix:** Refresh with 2026 pricing data and update dateModified. Move to quarterly update calendar. |
>
> **Platform-specific citability:**
> - Google AIO: Low — stale `dateModified`, weak author signals
> - Perplexity: Very Low — insufficient fact density and 14-month staleness
> - ChatGPT: Low — lacks encyclopedic depth and authoritative tone
> - Bing Copilot: Medium — domain is 6 years old (within Copilot's preference range), but content is too thin

### Bad Example: Citability Score Breakdown

> This page has a citability score of 34/100. It needs more facts, better schema, and fresher content to improve its AI visibility.

*Why it fails: No breakdown of what contributes to the score, no specific fix instructions, no per-platform analysis. The client knows the score is bad but has no idea which lever to pull first. The good example shows exactly which 4 factors are dragging the score down, with specific text rewrites and data additions for each.*

### Good Example: Platform-Specific Recommendation

> **Perplexity Optimization — `/blog/water-heater-repair-cost-guide`**
>
> Perplexity averages 21+ citations per response and uses per-claim inline attribution. It is 82% responsive to content published within 30 days. Current state: this page has NOT appeared in Perplexity responses for "water heater repair cost" (tested 2026-03-15).
>
> **Why competitors are cited instead:**
> - HomeServe.com cited in 3 of 5 test queries — their page has 14 statistics in 2,100 words (1 per 150 words), updated February 2026, includes proprietary cost data from 50,000+ service calls
> - Forbes.com cited in 4 of 5 test queries — editorial authority, updated January 2026, pulls from multiple contractor survey sources
>
> **Specific fixes for Perplexity citation:**
> 1. **Add 7+ data points:** Average repair cost by type (thermocouple: $150, heating element: $200-$400, tank replacement: $800-$2,500), labor cost per hour in Austin ($85-$150), warranty claim success rate for common issues, average time-to-repair by issue type
> 2. **Cite primary sources inline:** "According to the Bureau of Labor Statistics, plumber hourly rates in Austin average $34.50 (2025 Occupational Outlook)" — not in a footnote, inline with the claim
> 3. **Update within 30 days and maintain quarterly:** Perplexity's 82% recency bias means stale content is functionally invisible
> 4. **Add conditional specificity:** "For a 40-gallon gas water heater over 8 years old, repair typically costs $200-$450, but replacement ($1,200-$2,500 installed) is more cost-effective if the unit has had 2+ repairs in the past year" — this matches conversational query patterns

### Bad Example: Platform-Specific Recommendation

> To improve Perplexity visibility, update your content regularly and include more statistics. Make sure your content is fresh and factual.

*Why it fails: No competitive analysis (who IS being cited and why), no specific data points to add, no citation format guidance, no freshness threshold defined, no conditional specificity examples. "Include more statistics" without naming which statistics or citing which sources is not actionable. The good example provides exact data points to add, exact citation format, and the competitive context explaining what the cited competitors are doing differently.*

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|---|---|---|
| "Optimize for AI search" as one generic recommendation | Each platform has different citation patterns and preferences | Write platform-specific recommendations |
| Treating GEO as a subset of traditional SEO | Only 12% overlap between AI citations and Google top 10 | Position GEO as a separate, parallel channel |
| Checking only Google for AI visibility | Perplexity, ChatGPT, and Bing Copilot have very different behaviors | Audit all four platforms |
| Recommending "update content regularly" without a calendar | Vague advice produces no action | Create a specific freshness calendar with dates and pages |
| Counting any mention as a "fact" | "Many businesses find..." is not a citable fact | Only count specific, verifiable data points |
| Ignoring newer domains' AI potential | Bing Copilot actively cites newer domains | Route newer clients toward Bing Copilot optimization first |
| Adding schema for traditional SEO benefits only | AI uses schema differently (credibility assessment, not rich snippets) | Evaluate schema through the AI credibility lens |
| Promising AI citation results in 30 days | Authority-dependent platforms (Google AIO, ChatGPT) require sustained effort | Set platform-specific timelines (Perplexity: weeks; Google AIO: months) |
