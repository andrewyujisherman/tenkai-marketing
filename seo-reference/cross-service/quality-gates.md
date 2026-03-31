# Quality Gates — Cross-Service Reference

## What This Produces

Review criteria applied before ANY deliverable reaches a client. These gates ensure every output meets Tenkai's quality standard: accurate data, actionable recommendations, plain English, business impact framing, and no hallucinated information.

---

## Universal Quality Criteria (All 26 Services)

Every deliverable, regardless of type, must pass these gates:

### 1. No Hallucinated Data
- Every URL cited must be a real, accessible page
- Every metric must come from an actual data source (PageSpeed API, Serper, GSC, GA4, crawler)
- No fabricated traffic numbers, keyword volumes, or domain authority scores
- If real data is unavailable, state "data not available" — never estimate without disclosure
- **Test:** Can you trace every number in the deliverable to its data source?

### 2. No Outdated Recommendations
- Schema markup guidance reflects current Google supported types
- Core Web Vitals thresholds use current values (LCP: 2.5s, INP: 200ms, CLS: 0.1)
- No references to deprecated practices (keyword density, exact-match domains, meta keywords)
- Algorithm guidance reflects current ranking factors
- **Test:** Would an SEO expert reviewing this find anything that was true in 2020 but isn't now?

### 3. Specific URLs Cited
- Audit findings reference exact page URLs, not "some pages on your site"
- Content recommendations reference specific competitor pages as examples
- Technical fixes identify the exact files, pages, or templates affected
- **Test:** Could a developer act on this recommendation without asking "which page?"

### 4. Business Impact Framed
- Every metric connected to business meaning ("12 new page-1 rankings means more potential customers finding you")
- Technical findings translated to business consequences ("Slow loading time means visitors leave before seeing your services")
- Recommendations prioritized by revenue impact, not technical severity
- **Test:** Would the plumbing company owner understand why this matters to their business?

### 5. Plain English (8th Grade Reading Level)
- No unexplained jargon (if "canonical tag" must appear, define it inline)
- Short sentences (under 25 words average)
- Active voice
- "We fixed 15 broken pages" not "15 4xx responses were remediated"
- **Test:** Read the executive summary aloud. Does it sound like something you'd say to a business owner over coffee?

### 6. Actionable, Not Theoretical
- Every finding must include a specific recommended action
- "Your homepage loads in 4.2 seconds; compress the hero image to get under 2.5 seconds" not "Consider improving page speed"
- Recommendations include effort level (low/medium/high) and expected impact
- **Test:** Could someone act on this recommendation today without additional research?

### 7. Properly Structured JSON
- Output must parse as valid JSON
- Required fields present for the deliverable type
- No null values where data should exist (use explicit "data_not_available" strings)
- Arrays contain the expected object shape
- **Test:** Does `JSON.parse()` succeed? Do downstream consumers get the fields they expect?

### 8. Score Reflects Reality
- Deliverable scores (0-100) must correlate with findings
- A site with 20 critical issues should not score 80
- Score methodology should be transparent (what factors, what weights)
- **Test:** Does the score match what an expert would assign after reading the findings?

---

## Per-Category Quality Criteria

### Technical Audits (site_audit, technical_audit, on_page_audit)

| Gate | Criteria |
|------|----------|
| Coverage | All major page templates audited, not just the homepage |
| Priority scoring | Every issue scored by impact (critical/high/medium/low) |
| False positive check | No flagging non-issues (e.g., flagging noindex on pages that SHOULD be noindexed) |
| CWV accuracy | Core Web Vitals values match PageSpeed API data |
| Crawl verification | Issues verified against actual crawl data, not inferred |
| Implementation guidance | Each fix includes HOW, not just WHAT |
| Redirect chain detection | Redirect chains identified with full chain paths |
| Schema validation | Schema assessment against current Google supported types |

### Content Services (content_brief, content_article, content_rewrite, content_calendar)

| Gate | Criteria |
|------|----------|
| Keyword integration | Primary and secondary keywords naturally incorporated |
| Search intent match | Content format matches intent (informational = guide, transactional = landing page) |
| E-E-A-T signals | Experience, expertise, authoritativeness, trustworthiness demonstrated |
| Internal linking | 3-5 internal link recommendations included |
| Meta optimization | Title tag, meta description, and URL slug recommended |
| Differentiation | Content offers something competitors don't (original angle, unique data, better format) |
| Fact density | Statistics or data points every 150-200 words for AI citability |
| Opening format | First 40-60 words directly answer the target query |

### Link Building (link_analysis, outreach_emails, guest_post_draft, directory_submissions)

| Gate | Criteria |
|------|----------|
| Domain relevance | Every prospect site is topically relevant to the client |
| Quality threshold | No PBN, spam, or low-quality sites (DR/DA floor of 20+) |
| Personalization | Outreach emails reference the recipient's recent content |
| Link target alignment | Building links to pages that are in the content/keyword strategy |
| Anchor text diversity | Natural anchor text profile (no keyword-stuffed anchors) |
| Contact verification | Outreach targets include verifiable contact methods |

### Local SEO (local_seo_audit, gbp_optimization, review_campaign, review_responses)

| Gate | Criteria |
|------|----------|
| NAP consistency | Name, Address, Phone verified across checked directories |
| GBP completeness | All applicable GBP fields evaluated |
| Review velocity | Review acquisition recommendations are ethical (no fake reviews) |
| Response quality | Review response templates are personalized, not generic |
| Citation accuracy | Directory listings checked for correctness |
| Service area coverage | Service area pages recommended if applicable |

### AI Search (geo_audit, entity_optimization)

| Gate | Criteria |
|------|----------|
| Platform-specific | Recommendations segmented by AI platform |
| Entity consistency | Cross-platform entity information verified for consistency |
| Schema for AI | Schema evaluated through AI credibility lens, not just SEO |
| Citability scoring | Content scored for fact density, opening format, conversational specificity |
| Freshness tracking | Stale pages flagged with dates and update priorities |

### Analytics & Reporting (analytics_audit, monthly_report)

| Gate | Criteria |
|------|----------|
| Data accuracy | All reported metrics traceable to real data sources |
| Comparison context | MoM and YoY on every metric where historical data exists |
| Strategic narrative | "Why" explained for every significant change |
| Action-outcome connection | This month's actions connected to observed results |
| Anomaly explanation | Unusual movements explained, not ignored |
| Leading indicators | Shown for clients in months 1-3 (before traffic results) |

---

## The Review Process

### Automated Checks (Before Delivery)

1. **JSON validity** — Response must parse successfully
2. **Required fields** — All fields for the deliverable type present
3. **Score extraction** — `extractScore()` must return a valid number
4. **Summary generation** — `generateSummary()` must produce non-empty text
5. **Title generation** — `buildDeliverableTitle()` must produce meaningful title

### Quality Scoring

Every deliverable gets a score via `extractScore()` in `src/lib/deliverables.ts`. The score is stored in the `deliverables` table and visible in the client dashboard.

### Deliverable Status Flow

```
queued → processing → completed → draft → [client review] → approved/revision_needed
```

- **draft** status means the deliverable is ready for client review
- Content articles are promoted to `content_posts` with status `pending_approval`
- Monthly reports are delivered via email automatically

---

## Common Quality Failures and Prevention

### 1. Hallucinated Competitor Data
**Failure:** Agent fabricates traffic numbers, keyword rankings, or backlink counts for competitors.
**Prevention:** All competitive metrics must be grounded in Serper API data or Google Search grounding. When real data is unavailable, report ranges or state "estimated based on available signals."
**Detection:** Cross-reference any specific number with its claimed data source.

### 2. Outdated Technical Recommendations
**Failure:** Recommending practices that were valid in 2020 but are wrong now (e.g., keyword density targets, meta keywords, exact-match anchor text).
**Prevention:** Agent prompts include current year context. Reference files are updated with current best practices.
**Detection:** Expert review of technical recommendations against current Google documentation.

### 3. Generic Recommendations Without Specificity
**Failure:** "Improve your page speed" instead of "Compress the 2.4MB hero image on /homepage to under 200KB using WebP format."
**Prevention:** Every recommendation must reference a specific URL, file, or element.
**Detection:** The "which page?" test — if someone would ask "which page?" the recommendation fails.

### 4. Vanity Metrics Without Business Context
**Failure:** Reporting "impressions up 15%" without explaining what that means for the business.
**Prevention:** Business impact framing is a universal quality gate. Every metric must connect to customers, leads, or revenue.
**Detection:** The "so what?" test — if a business owner would say "so what?" the framing fails.

### 5. Missing Connection to Other Services
**Failure:** A keyword research deliverable that doesn't mention content brief implications. A site audit that doesn't flag content calendar priorities.
**Prevention:** Every deliverable must include a "cross-service implications" section identifying what downstream services should act on.
**Detection:** Check the Cross-Service Connections section of each service reference file.

### 6. Inconsistent Scoring
**Failure:** A site with critical issues scoring 85/100, or a healthy site scoring 40/100.
**Prevention:** Score methodology must be transparent. Critical issues should cap the maximum possible score.
**Detection:** Read the findings, then predict what the score should be. Compare to actual score.

### 7. Stale Context Data
**Failure:** Recommendations based on months-old client_seo_context that no longer reflects reality.
**Prevention:** writeBackClientContext() updates after every service completion. Flag when context data is >60 days old.
**Detection:** Check context timestamps against current date.

### 8. SEO Jargon in Client-Facing Content
**Failure:** Monthly report uses terms like "canonical tags," "crawl budget," or "SERP volatility" without definition.
**Prevention:** 8th-grade reading level gate. Technical terms must be defined inline or replaced with plain English equivalents.
**Detection:** Readability scoring or the "coffee conversation" test.

---

## Output Examples

### Good Example: Quality Review Checklist (site_audit — PASSES)

> **Quality Review: site_audit for BrightPath Financial — PASS (7/8 gates)**
>
> | Gate | Status | Evidence |
> |------|--------|----------|
> | No Hallucinated Data | ✅ PASS | All CWV values match PageSpeed API response timestamps. 43 URLs referenced — spot-checked 10, all resolve to real pages. Health score of 62 derived from weighted formula: 8 critical × 5pts + 12 high × 3pts + 15 medium × 1pt = 95 deduction points from 157 max. |
> | No Outdated Recommendations | ✅ PASS | Schema recommendations use Article and TechArticle (no FAQ schema). CWV thresholds correct: LCP 2.5s, INP 200ms, CLS 0.1. No mention of keyword density or meta keywords. |
> | Specific URLs Cited | ✅ PASS | Every finding references exact URL. Example: "The /services/financial-planning page has LCP of 4.8s due to unoptimized hero image (2.4MB PNG). Compress to WebP under 200KB." — not "some pages have slow loading times." |
> | Business Impact Framed | ✅ PASS | Executive summary: "Your 8 broken service pages mean potential clients searching for your financial planning services hit error pages instead of your offerings — estimated 340 lost visits/month based on GSC impression data." |
> | Plain English | ✅ PASS | Technical terms defined inline: "Your site is missing structured data (code that helps Google understand your page content) on 23 of 47 pages." Flesch-Kincaid grade: 7.2. |
> | Actionable Recommendations | ✅ PASS | Each finding includes specific fix: "301 redirect /old-retirement-planning to /services/retirement-planning (the current page). This preserves the 12 backlinks pointing to the old URL." Effort levels assigned to all 35 findings. |
> | Properly Structured JSON | ✅ PASS | JSON.parse succeeds. All required fields present: findings[], health_score, recommendations[], executive_summary. |
> | Score Reflects Reality | ⚠️ WARNING | Score of 62 is reasonable for 8 critical + 12 high issues, but the scoring doesn't cap maximum when critical issues exist. A site with 8 critical issues arguably shouldn't score above 50. Review scoring formula. |
>
> **Overall verdict: PASS with scoring methodology note for future calibration.**

### Bad Example: Quality Review Checklist (site_audit — FAILS)

> **Quality Review: site_audit for BrightPath Financial**
>
> | Gate | Status | Evidence |
> |------|--------|----------|
> | No Hallucinated Data | ❌ FAIL | Deliverable states "Domain Authority: 34" — Tenkai does not have access to Moz or Ahrefs DA data. This number is fabricated. Also states "approximately 2,500 monthly organic visitors" without GA4 connected — no source for this traffic estimate. |
> | No Outdated Recommendations | ❌ FAIL | Recommends "Add FAQ schema to your top 10 service pages for rich results" — FAQ rich results were restricted to authoritative/government sites in 2026. Also suggests "Target keyword density of 2-3% for primary keywords" — keyword density targeting is a deprecated practice. |
> | Specific URLs Cited | ❌ FAIL | Finding: "Several pages on your site have slow loading times and could benefit from image optimization." Which pages? What loading times? What images? A developer cannot act on this. |
> | Business Impact Framed | ⚠️ PARTIAL | Some technical findings translated to business impact, but 12 of 35 findings use only technical language: "Implement hreflang tags for international targeting" without explaining why a local financial planning firm would need international targeting (they wouldn't — this is a false positive). |
> | Plain English | ❌ FAIL | "Canonical tags are not self-referencing on 18 pages, resulting in potential duplicate content signals that may dilute PageRank across multiple URL variants." — would a financial planner understand this? |
> | Actionable Recommendations | ⚠️ PARTIAL | 20 of 35 recommendations are actionable. 15 are vague: "Improve internal linking structure" (which pages? linking to what?), "Optimize images across the site" (which images? what format? what size?). |
> | Properly Structured JSON | ✅ PASS | Valid JSON, all fields present. |
> | Score Reflects Reality | ❌ FAIL | Site scores 78/100 despite 8 critical issues and fabricated DA data. A score of 78 suggests "good with minor issues" — not a site with critical broken pages and missing schema on half its pages. |
>
> **Overall verdict: FAIL — 4 hard failures. Must fix hallucinated DA/traffic data, remove outdated FAQ schema recommendation, add URL specificity to all findings, and recalibrate score before client delivery.**

**Why the bad example fails review:** The most damaging failure is hallucinated data (fabricated DA score and traffic estimate). A client who checks their actual Moz DA and finds a different number loses trust in the entire deliverable. The outdated FAQ schema recommendation marks the audit as non-current. Generic findings without URLs waste the client's time and money — they'd need to hire someone else to figure out which pages the audit is referring to.

---

## Quality Gate Summary Table

| Deliverable Category | Critical Gates | Warning Gates |
|---|---|---|
| Technical audits | No false positives, specific URLs, implementation guidance | CWV accuracy, redirect chain detection |
| Content services | Keyword integration, intent match, differentiation | E-E-A-T signals, fact density, internal links |
| Link building | Domain relevance, quality threshold, no PBN/spam | Personalization, anchor diversity |
| Local SEO | NAP consistency, ethical reviews, GBP completeness | Citation accuracy, service area coverage |
| AI search | Platform-specific, entity consistency, schema for AI | Citability scoring, freshness tracking |
| Analytics/reporting | Data accuracy, comparison context, narrative | Anomaly explanation, leading indicators |
| **All deliverables** | **No hallucinated data, specific URLs, plain English, business impact** | **Proper JSON, score reflects reality** |
