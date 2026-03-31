# Monthly Report — Agent Yumi Reference

## What This Produces

An 8-section monthly SEO performance report that tells a strategic narrative — connecting actions taken to outcomes achieved, framed in business impact. Not a data dump. Not vanity metrics. A story about what happened, why, and what comes next.

**Deliverable type:** `performance_report`
**Agent:** Yumi (由美) — Analytics
**Model:** gemini-2.5-pro
**Cadence:** Automated on the 1st of each month via Vercel cron (`/api/cron/monthly-report`). Email delivery via Resend.

---

## Professional Standard

**The gap Tenkai must close:** "4,200 visits this month" means nothing. "4,200 visits vs. 3,100 last month, driven by the content cluster we built around [topic], with a 12-month upward trend" tells a strategy story.

Premium monthly reports are:
- Written at an 8th-grade reading level
- Delivered within 5 business days of month-end (Tenkai: instant via cron)
- Framed around business impact (leads, revenue) not vanity metrics (traffic, impressions)
- Connected: actions taken → outcomes observed → strategic implications
- Comparative: MoM and YoY with trend context
- Narrative-driven: the "why" behind every number
- Actionable: specific priorities for the next month
- 8-12 pages equivalent in depth

BrightEdge finding: Clients who fully understand their SEO reports are 64% more likely to approve budget increases. Clarity drives retention.

---

## Build Process (Ordered Steps)

1. **Pull the monthly snapshot** — `captureMonthlySnapshot()` runs on the 1st via cron. Data from `client_metrics_history` table: organic_traffic, keyword_count_page1, keyword_count_top10, health_score, content_pieces_published, backlink_count.

2. **Fetch prior months for comparison** — `getClientHistory(clientId, 13)` returns up to 13 months of snapshots for MoM and YoY comparison.

3. **Aggregate service activity** — Query all `deliverables` created for this client in the reporting period. Group by deliverable_type. This shows what work was done.

4. **Pull client SEO context** — From `client_seo_context`: top keywords, audit findings, competitors, content gaps, CWV status. This provides strategic framing.

5. **Calculate MoM and YoY deltas** — For every metric with comparison data: compute absolute change, percentage change, and trend direction (up/down/flat).

6. **Write the executive summary** — One paragraph. Direction of travel + biggest win + biggest concern + next month priority. Written for a business owner who reads only this section.

7. **Build each report section** — Follow the 8-section structure below.

8. **Frame everything as business impact** — Convert metrics to meaning. "12 new page-1 keywords" becomes "12 more search terms now showing your business on Google's first page, where 90% of clicks happen."

9. **Set next month priorities** — Based on this month's data, what should the strategy focus on? Be specific.

---

## The 8-Section Report Structure

### Section 1: Cover
- Client name and branding
- Reporting period (month + year)
- Biggest single achievement highlighted
- Tenkai team attribution

### Section 2: Executive Summary
- One paragraph, 3-5 sentences
- Traffic direction + key win + next month priority
- Written for the owner who reads only this page
- 8th-grade reading level

### Section 3: Traffic Overview
- Organic sessions: this month vs. last month vs. same month last year
- 6-month trend visualization description
- Traffic sources breakdown (organic, direct, referral, social)
- Geographic distribution if relevant
- **Narrative:** Why traffic moved (or didn't). Connect to actions taken.

### Section 4: Keyword Performance
- 5-8 priority keywords with current ranking and change
- New page-1 rankings gained this month
- Keywords moved from page 2 to page 1 (high impact)
- Keywords at risk (dropped positions)
- **Narrative:** Which content/optimization efforts moved which keywords

### Section 5: Top Performing Pages
- Top 5-10 pages by organic traffic
- Top converting pages (if conversion tracking is set up)
- Pages with biggest traffic gains this month
- Pages with biggest traffic losses this month
- **Narrative:** What makes top pages work; what declining pages need

### Section 6: Technical Health
- Overall health score and trend
- Fixes completed this month (in plain English: "We fixed 15 broken pages")
- Outstanding critical issues
- Core Web Vitals status (LCP, INP, CLS with pass/fail)
- **Narrative:** Technical health as a business enabler ("A faster site means visitors stay longer and buy more")

### Section 7: Core Web Vitals Detail
- LCP: value + target + pass/fail
- INP: value + target + pass/fail
- CLS: value + target + pass/fail
- Before/after comparisons if CWV work was done
- **Narrative:** What CWV means for user experience and Google ranking

### Section 8: Highlights + Next Steps
- 3-5 specific achievements from this month
- 3-5 specific priorities for next month
- Strategic context: where we are in the overall plan
- Anything that needs client input or decision

---

## Critical Patterns

### 1. Business Impact Framing Is Non-Negotiable
**WHEN:** Writing any metric or finding.
**HOW:** Every number must be connected to business meaning. "Organic traffic up 35%" → "35% more potential customers found your business through Google this month."
**WHY:** Business owners don't care about SEO metrics. They care about customers and revenue.
**DON'T:** Report raw numbers without context. "2,847 organic sessions" means nothing to a plumbing company owner.

### 2. MoM AND YoY Comparison on Every Metric
**WHEN:** Presenting any performance metric.
**HOW:** Show: current value, last month, same month last year, percentage change for both periods. Use the `client_metrics_history` table for historical data.
**WHY:** MoM shows short-term momentum. YoY eliminates seasonal distortion. Both are required for accurate interpretation.
**DON'T:** Present point-in-time numbers. "3,200 sessions" without comparison is meaningless.

### 3. Connect Actions to Outcomes
**WHEN:** Explaining why a metric changed.
**HOW:** "We published 4 articles targeting [keyword cluster] in February. Those pages generated 380 organic sessions in March, accounting for 12% of the traffic increase." Always show the chain: what we did → what happened.
**WHY:** This is what separates a data dump from a strategic report. Clients need to see that the work is working.
**DON'T:** Present metrics without connecting them to specific actions taken.

### 4. 8th-Grade Reading Level
**WHEN:** Writing every section, especially the executive summary.
**HOW:** Short sentences. Common words. No jargon without definition. "Your site's Core Web Vitals are passing" not "LCP is sub-2.5s with INP under 200ms."
**WHY:** The target client (small business owner) is not an SEO professional. Jargon creates distance and reduces trust.
**DON'T:** Use terms like "crawl budget," "canonical tags," or "SERP features" without explanation.

### 5. The Executive Summary Must Stand Alone
**WHEN:** Writing section 2.
**HOW:** If the client reads ONLY the executive summary and nothing else, they should understand: (1) are things going up or down, (2) what was the biggest win, (3) what happens next.
**WHY:** Most clients skim. The executive summary may be the only section read cover-to-cover.
**DON'T:** Write a summary that requires reading other sections to understand.

### 6. Flag Anomalies and Explain Them
**WHEN:** Any metric shows unusual movement (beyond the anomaly baseline from analytics_audit).
**HOW:** Call out the anomaly explicitly. Explain the likely cause. State whether it requires action. "Traffic dropped 22% week-over-week. This coincides with a Google core update on [date]. Here's what we're monitoring and our response plan."
**WHY:** Unexplained drops create client anxiety. Proactive explanation builds trust.
**DON'T:** Ignore negative metrics hoping the client won't notice.

### 7. Show Leading AND Lagging Indicators
**WHEN:** Client is in months 1-3 (before traffic results materialize).
**HOW:** Leading indicators: pages indexed, backlinks acquired, content published, technical fixes completed. Lagging indicators: traffic, rankings, conversions. Clearly label which is which and explain why leading indicators matter.
**WHY:** SEO results lag by 3-6 months. Early reports need to show progress through leading indicators or clients lose faith.
**DON'T:** Wait until traffic moves to show progress. Months 1-3 reports must focus on leading indicators.

### 8. Keywords at Risk Section
**WHEN:** Any tracked keyword drops 3+ positions.
**HOW:** Flag it in the keyword performance section with: keyword, old position, new position, suspected cause, proposed response.
**WHY:** Catching ranking drops early allows intervention before traffic loss compounds.
**DON'T:** Only report gains. Honest reporting of declines (with response plans) builds more trust than hiding bad news.

### 9. Content Performance Attribution
**WHEN:** Reporting on content published in previous months.
**HOW:** Track content from publication → indexation → ranking → traffic → conversions. Show the lifecycle of each major piece.
**WHY:** This proves the content strategy is working (or identifies what needs adjustment).
**DON'T:** Report content as "published" and never follow up on performance.

### 10. Next Steps Must Be Specific
**WHEN:** Writing section 8.
**HOW:** "Publish 3 articles targeting the [topic] cluster" not "continue content production." "Fix the 7 pages with missing meta descriptions identified in this month's audit" not "continue technical optimization."
**WHY:** Vague next steps signal lack of strategy. Specific next steps show intentional, data-driven planning.
**DON'T:** Use generic placeholders like "optimize content" or "build links."

---

## Data Sources

| Source | What It Provides | Integration |
|--------|-----------------|-------------|
| `client_metrics_history` | Monthly snapshots (organic traffic, keyword counts, health score, content pieces) | `getClientHistory()` in `metrics-snapshot.ts` |
| GA4 (OAuth) | Session data, traffic sources, conversions | `fetchGA4Data()` via client integration |
| GSC (OAuth) | Query data, impressions, clicks, positions | `fetchGSCData()` via client integration |
| `deliverables` table | All work completed this reporting period | Supabase query filtered by date range |
| `content_posts` table | Content published count and status | Supabase query |
| `audits` table | Latest health score | Supabase query |
| `client_seo_context` | Accumulated keywords, findings, competitors | Supabase `client_seo_context` table |
| Cron trigger | Automated monthly execution | `GET /api/cron/monthly-report` on 1st of month |
| Resend | Email delivery | `POST /api/reports/email` with deliverableId |

---

## Output Structure

```json
{
  "report_period": "March 2026",
  "executive_summary": "Your website attracted X organic visitors this month, up Y% from last month...",
  "kpi_dashboard": {
    "organic_traffic": { "current": 0, "mom_change": "+X%", "yoy_change": "+X%", "trend": "up/down/flat" },
    "keyword_count_page1": { "current": 0, "mom_change": 0, "new_this_month": 0 },
    "health_score": { "current": 0, "mom_change": 0 },
    "content_published": { "current": 0, "total": 0 },
    "tasks_completed": 0
  },
  "traffic_overview": {
    "organic_sessions": { "current": 0, "previous_month": 0, "same_month_last_year": 0 },
    "traffic_sources": {},
    "narrative": "..."
  },
  "keyword_performance": {
    "priority_keywords": [ { "keyword": "...", "position": 0, "change": 0, "trend": "..." } ],
    "new_page1_rankings": [],
    "at_risk_keywords": [],
    "narrative": "..."
  },
  "top_pages": {
    "by_traffic": [ { "url": "...", "sessions": 0, "change": "+X%" } ],
    "biggest_gains": [],
    "biggest_losses": [],
    "narrative": "..."
  },
  "technical_health": {
    "health_score": 0,
    "fixes_completed": [ "Fixed 15 broken pages", "..." ],
    "outstanding_issues": [],
    "cwv": { "lcp": "...", "inp": "...", "cls": "..." },
    "narrative": "..."
  },
  "highlights": [ "Achievement 1", "Achievement 2" ],
  "next_steps": [ { "priority": 1, "action": "...", "rationale": "..." } ],
  "tasks_this_month": [ "Deliverable title 1", "..." ],
  "month": "March 2026"
}
```

---

## Quality Gate

- [ ] Executive summary readable by a non-SEO person (8th grade level)
- [ ] Every metric has MoM comparison (YoY if 12+ months of data exist)
- [ ] Actions taken this month connected to outcomes observed
- [ ] Business impact framing on all metrics (not raw numbers)
- [ ] Leading indicators shown for clients in months 1-3
- [ ] Anomalies called out with explanations and response plans
- [ ] Keyword drops flagged with response strategy
- [ ] Next steps are specific actions, not generic categories
- [ ] Health score trend shown, not just current value
- [ ] No hallucinated metrics — all numbers from actual data sources
- [ ] Technical findings written in plain English ("We fixed 15 broken pages")
- [ ] Report covers all 8 sections

---

## Cross-Service Connections

| Connected Service | Data Direction | What Flows |
|-------------------|---------------|------------|
| `analytics_audit` | Analytics setup determines what report CAN show | Conversion tracking completeness → report section depth |
| `content_decay_audit` | Decay findings feed report narrative | Declining pages → "pages at risk" section |
| `keyword_research` | Keyword targets → report tracking | Priority keywords → keyword performance section |
| `competitor_analysis` | Competitive context → report narrative | Share of voice, competitive positioning → strategic context |
| `site_audit` | Audit score → health section | Overall health score, fixes completed → technical health section |
| `content_article` | Content published → report section | Articles written → content performance tracking |
| `link_analysis` | Backlink data → report metrics | Links acquired → link building progress section |
| `geo_audit` | AI visibility data → report section | AI citability score → emerging metric in report |
| ALL services | Monthly report aggregates everything | All deliverables created in period → tasks_this_month |

---

## Output Examples

### Good Example: Executive Summary

> Your website attracted 4,247 organic visitors in March, up 37% from February (3,100) and up 89% from March last year (2,248). This growth was driven by the content cluster we built around "emergency plumbing services" — the 4 articles published in February generated 812 organic sessions in their first full month, accounting for nearly 70% of the traffic increase. Three new keywords reached Google's first page this month, including "emergency plumber austin" (now #7, up from #16), which represents an estimated $4,200/month in equivalent ad spend. Your biggest risk: the /water-heater-repair page dropped from #8 to #14 after a competitor published a comprehensive guide. Next month's priority is refreshing that page with updated pricing data and customer testimonials to reclaim the position.

### Bad Example: Executive Summary

> March 2026 Report: Your website had 4,247 organic sessions this month. Page 1 keywords: 23. Health score: 74. Backlinks acquired: 7. Content published: 2 articles. Core Web Vitals: passing. Top page: /services (892 sessions). Bounce rate: 54.2%.

*Why it fails: This is a data dump, not a narrative. No MoM or YoY comparison on the key metric, no explanation of WHY traffic changed, no connection between actions taken and outcomes achieved, no business impact framing, no strategic context. A plumbing company owner reads the good example and understands their investment is working. They read the bad example and see meaningless numbers.*

### Good Example: Keyword Performance Section

> **Keyword Performance — March 2026**
>
> **Priority keywords:**
>
> | Keyword | Position | Change | Monthly Search Volume | Est. Monthly Value |
> |---------|----------|--------|----------------------|-------------------|
> | emergency plumber austin | #7 | +9 positions | 2,400 | $4,200 |
> | drain cleaning austin tx | #4 | +2 positions | 1,900 | $2,850 |
> | water heater repair austin | #14 | -6 positions | 1,600 | $2,400 |
> | plumber near me austin | #11 | +1 position | 3,800 | $5,700 |
> | sewer line replacement cost | #3 | new to page 1 | 880 | $1,320 |
>
> **What moved and why:**
> - "Emergency plumber austin" jumped 9 positions after we published the emergency plumbing response time guide in February and added 4 internal links from high-authority service pages. This keyword is now within striking distance of the top 5 — next month's content refresh should push it higher.
> - "Water heater repair austin" dropped 6 positions. Competitor analysis shows HomeServe published a 3,500-word guide with cost calculators and video content on March 8. Our page is 800 words with no multimedia. **Action required:** content expansion planned for April's first deliverable.
>
> **New page 1 rankings this month:** 3 keywords reached page 1 (sewer line replacement cost, austin plumber reviews, commercial plumbing inspection). Combined estimated monthly value: $2,940.

### Bad Example: Keyword Performance Section

> Here are your keyword rankings for this month:
> - emergency plumber austin: #7
> - drain cleaning austin tx: #4
> - water heater repair austin: #14
> - plumber near me austin: #11
> - sewer line replacement cost: #3
>
> Some keywords went up and some went down. We will continue to optimize for these keywords next month.

*Why it fails: No change data (up or down from what?), no search volume or business value, no explanation of why rankings moved, no connection to work performed, no action plan for declining keywords. "Some went up and some went down" is not analysis — it's observation. The good example tells a story: what moved, why, and what we're doing about the ones that dropped.*

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|---|---|---|
| Data dump without narrative | Client doesn't know what the numbers mean or what to do | Frame every metric with "so what" and "now what" |
| Reporting only positive metrics | Hides problems, erodes trust when client notices themselves | Report declines honestly with response plans |
| Vanity metrics (impressions, "total keywords") | Don't connect to business outcomes | Focus on conversions, leads, revenue-attributed traffic |
| Generic next steps ("continue optimization") | Signals lack of strategy | Name specific actions, specific pages, specific keywords |
| Point-in-time snapshots without comparison | Numbers without context are meaningless | Always show MoM and YoY |
| Jargon-heavy writing | Client doesn't understand, feels excluded | 8th-grade reading level, plain English throughout |
| Waiting for traffic results before reporting progress | Client loses faith during months 1-3 lag period | Report leading indicators (pages indexed, content published, links built) |
| Same report template regardless of client maturity | Month 1 clients need different framing than month 12 clients | Adapt emphasis: leading indicators early, ROI metrics later |
