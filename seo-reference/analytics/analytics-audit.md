# Analytics Audit — Agent Yumi Reference

## What This Produces

A comprehensive evaluation of the client's analytics infrastructure — GA4 configuration, conversion tracking, GSC setup, attribution modeling, and data hygiene. The goal is to ensure every meaningful user action is tracked, attributed correctly, and reportable. Without clean analytics, no other SEO work can be measured.

**Deliverable type:** `audit_report`
**Agent:** Yumi (由美) — Analytics
**Model:** gemini-2.5-pro

---

## Professional Standard

Analytics is the nervous system of SEO. Premium agencies treat analytics setup as a P0 prerequisite — before content, before link building, before anything. If tracking is broken or incomplete, the monthly report is fiction and strategic decisions are guesses.

A $5,000/month agency analytics audit covers:
- GA4 property configuration (data streams, filters, retention settings)
- Conversion tracking completeness (form fills, phone calls, purchases, chat initiations)
- UTM parameter strategy and enforcement
- Attribution model selection and configuration
- GSC verification, property type, and coverage
- Cross-domain tracking (if applicable)
- Anomaly detection baseline establishment
- Dashboard setup with business-outcome KPIs (not vanity metrics)
- Data layer / GTM tag audit
- Referral spam and bot filtering

BrightEdge finding: Clients who fully understand their SEO reports are 64% more likely to approve budget increases. Clean analytics makes reports understandable.

---

## Build Process (Ordered Steps)

1. **Verify GA4 property exists and is collecting data** — Check for active data stream, measurement ID present on all key pages, data retention set to 14 months (not the 2-month default).

2. **Evaluate GA4 configuration** — Check: enhanced measurement settings, internal traffic filters (office IPs excluded), cross-domain tracking (if multi-domain), custom dimensions/metrics, user properties for segmentation.

3. **Audit conversion tracking** — Identify all meaningful user actions:
   - Form submissions (contact, quote, newsletter)
   - Phone calls (click-to-call tracking)
   - Purchases / e-commerce transactions
   - Chat initiations
   - File downloads (whitepapers, proposals)
   - Video plays (if video is a key content type)
   - Scroll depth on key pages

   For each: is it tracked? Is it marked as a conversion? Is the value set?

4. **Review UTM parameter strategy** — Check if the client uses UTM parameters consistently on external campaigns. Evaluate naming conventions. Look for common UTM problems (inconsistent capitalization, misspellings, missing parameters on paid campaigns).

5. **Assess attribution modeling** — Review which attribution model is in use. GA4 uses data-driven attribution by default. Determine if this is appropriate for the client's conversion path length.

6. **Audit GSC configuration** — Check: correct property type (domain vs URL prefix), sitemap submitted, all relevant domains/subdomains verified, international targeting (if applicable), crawl stats review.

7. **Check for data quality issues** — Referral spam, bot traffic, self-referrals, duplicate tracking codes, missing tracking on key pages, inconsistent event naming.

8. **Evaluate existing dashboards/reporting** — If the client has Looker Studio, GA4 explorations, or other dashboards, assess whether they show business outcomes or vanity metrics.

9. **Establish anomaly detection baseline** — Document current traffic patterns, seasonal trends, and typical conversion rates. This becomes the baseline for monthly report anomaly flagging.

10. **Produce prioritized fix list** — Every finding scored by impact on data quality. Critical items: missing conversion tracking, broken tracking code, incorrect filters. High: UTM inconsistencies, missing GSC verification. Medium: dashboard improvements, custom dimensions.

---

## Critical Patterns

### 1. Data Retention Is Almost Always Wrong
**WHEN:** Starting any GA4 audit.
**HOW:** Check Settings > Data Settings > Data Retention. Default is 2 months, which makes YoY comparison impossible. Must be set to 14 months.
**WHY:** Monthly reports require MoM comparison. Annual trends require YoY. Two-month retention destroys historical data silently.
**DON'T:** Skip this check. It's the single most common GA4 misconfiguration.

### 2. Conversion Tracking Completeness Determines Report Value
**WHEN:** Auditing what the client tracks.
**HOW:** Map every meaningful business action to a GA4 event. For each: does the event fire? Is it marked as a conversion? Does it have a value? Test by triggering the action and verifying in GA4 Realtime.
**WHY:** A monthly report that shows traffic but not conversions is a vanity metric report. Business owners care about leads and revenue.
**DON'T:** Assume tracking works because the tag is installed. Verify by triggering events in real-time.

### 3. Internal Traffic Filters Prevent Data Pollution
**WHEN:** Evaluating data quality.
**HOW:** Check if internal IP addresses (office, home office, agency) are excluded via GA4 data filters. Check for developer mode exclusions.
**WHY:** Without IP filtering, employee visits inflate traffic numbers and skew conversion rates.
**DON'T:** Forget remote workers. Modern teams may have 5-10 IPs to exclude, not just one office IP.

### 4. GSC Property Type Matters
**WHEN:** Auditing GSC configuration.
**HOW:** Domain property (verified via DNS) captures ALL subdomains and protocols. URL-prefix property captures only one specific URL format. Domain property is almost always correct.
**WHY:** URL-prefix properties miss data from www vs non-www, http vs https, and subdomains. The client sees incomplete data.
**DON'T:** Accept URL-prefix verification when domain verification is possible.

### 5. UTM Naming Conventions Must Be Documented
**WHEN:** Reviewing campaign tracking.
**HOW:** Document the UTM taxonomy: utm_source values, utm_medium values, utm_campaign naming convention. Create or review a UTM naming guide.
**WHY:** Inconsistent UTMs (utm_source=Facebook vs facebook vs fb) fragment data and make channel analysis unreliable.
**DON'T:** Just note "UTMs are inconsistent" — provide a specific naming convention to adopt.

### 6. Attribution Model Must Match Business Reality
**WHEN:** Evaluating conversion attribution.
**HOW:** GA4 defaults to data-driven attribution. For businesses with short conversion paths (local services), last-click may be more appropriate. For long B2B cycles, data-driven or position-based is better.
**WHY:** Wrong attribution model misallocates credit and distorts ROI calculations for SEO.
**DON'T:** Recommend a specific model without understanding the client's typical conversion path.

### 7. Cross-Domain Tracking for Multi-Domain Businesses
**WHEN:** Client has multiple domains (main site + booking system, payment processor, etc.).
**HOW:** Check if GA4 cross-domain measurement is configured so sessions aren't broken when users move between domains.
**WHY:** Without cross-domain tracking, a user clicking from the main site to a booking domain appears as a referral, not a continuous session.
**DON'T:** Skip this if the client has any external checkout, booking, or form system.

### 8. Anomaly Detection Baseline
**WHEN:** Setting up ongoing monitoring capability.
**HOW:** Document current traffic levels, day-of-week patterns, seasonal trends, and typical conversion rates. Calculate standard deviations. Any future metric outside 2 standard deviations triggers investigation.
**WHY:** Without a baseline, the monthly report can't distinguish normal fluctuation from meaningful change.
**DON'T:** Set anomaly thresholds too tight (triggers false alarms) or too loose (misses real problems).

### 9. Phone Call Tracking Is Often Missing
**WHEN:** Auditing conversion completeness for local/service businesses.
**HOW:** Check if click-to-call events are tracked in GA4. For businesses where phone is a primary conversion path, recommend call tracking solution (CallRail, CallTrackingMetrics) with GA4 integration.
**WHY:** For local service businesses, phone calls may represent 50-70% of conversions. Missing phone tracking makes organic look like it converts poorly.
**DON'T:** Assume web forms are the only conversion path. Always ask about phone call volume.

### 10. Sitemap Submission in GSC
**WHEN:** Checking GSC configuration.
**HOW:** Verify XML sitemap is submitted in GSC, has been successfully processed, and the URL count matches expectations. Check for sitemap errors and warnings.
**WHY:** Sitemap issues directly impact crawl budget and indexation — the foundation of SEO.
**DON'T:** Just check if a sitemap exists. Verify it's submitted, processed, and error-free.

---

## Data Sources

| Source | What It Provides | Integration |
|--------|-----------------|-------------|
| GA4 (OAuth) | Property config, event data, conversion setup | `fetchGA4Data()` via client integration |
| GSC (OAuth) | Property verification, sitemap status, coverage | `fetchGSCData()` via client integration |
| PageSpeed API | CWV lab data, performance metrics | `fetchAllSiteData()` |
| Site Scraper | Tracking code presence on pages | `scrapeUrl()` |
| BFS Crawler | Tracking code consistency across site | `crawlSite()` |
| `client_seo_context` | Prior audit findings, business context | Supabase `client_seo_context` table |

---

## Output Structure

```json
{
  "analytics_health_score": 0-100,
  "ga4_configuration": {
    "property_found": true/false,
    "data_stream_active": true/false,
    "data_retention": "2_months/14_months",
    "internal_filters": true/false,
    "enhanced_measurement": true/false,
    "cross_domain": "not_needed/configured/missing",
    "issues": [],
    "recommendations": []
  },
  "conversion_tracking": {
    "completeness_score": 0-100,
    "tracked_conversions": [
      { "action": "...", "event_name": "...", "marked_as_conversion": true/false, "value_set": true/false }
    ],
    "missing_conversions": [
      { "action": "...", "business_impact": "...", "implementation": "..." }
    ]
  },
  "utm_strategy": {
    "current_state": "none/inconsistent/documented",
    "issues": [],
    "recommended_taxonomy": { "sources": [], "mediums": [], "campaign_format": "..." }
  },
  "gsc_configuration": {
    "property_type": "domain/url_prefix",
    "verified": true/false,
    "sitemap_submitted": true/false,
    "sitemap_errors": 0,
    "coverage_issues": [],
    "recommendations": []
  },
  "data_quality": {
    "issues_found": [],
    "bot_filtering": true/false,
    "self_referrals": true/false,
    "duplicate_tracking": true/false
  },
  "anomaly_baseline": {
    "avg_daily_sessions": 0,
    "avg_conversion_rate": 0,
    "seasonal_pattern": "...",
    "day_of_week_pattern": {}
  },
  "priority_fixes": [
    { "priority": "critical/high/medium", "finding": "...", "fix": "...", "business_impact": "..." }
  ]
}
```

---

## Quality Gate

- [ ] GA4 data retention setting checked and documented
- [ ] Every meaningful conversion action audited (not just forms)
- [ ] Phone call tracking evaluated for service businesses
- [ ] Internal traffic filter status verified
- [ ] GSC property type and verification status confirmed
- [ ] Sitemap submission and processing status checked
- [ ] UTM naming convention assessed with specific recommendations
- [ ] Attribution model appropriateness evaluated for the client's business model
- [ ] Anomaly detection baseline established with actual numbers
- [ ] All findings prioritized by business impact (critical/high/medium)
- [ ] Recommendations written in plain English ("Set data retention to 14 months so you can compare year-over-year trends")
- [ ] No hallucinated metrics — only report what was actually found

---

## Cross-Service Connections

| Connected Service | Data Direction | What Flows |
|-------------------|---------------|------------|
| `monthly_report` | Analytics setup determines report quality | Conversion tracking completeness → what the monthly report CAN report on |
| `site_audit` | Technical issues overlap with tracking issues | Broken pages → broken tracking; redirect chains → session fragmentation |
| `content_decay_audit` | Analytics data feeds decay detection | GA4 traffic trends per page → content decay signal detection |
| `geo_audit` | Analytics tracks AI-referred traffic | GA4 referral data → AI search traffic measurement |
| `keyword_research` | GSC data informs keyword strategy | GSC query data → keyword research seed data |
| All services | Analytics audit is a P0 prerequisite | Clean analytics → everything else becomes measurable |

---

## Output Examples

### Good Example: GA4 Finding

> **Finding: Data retention set to 2 months (default) — CRITICAL**
>
> GA4 property `G-AB12CD34EF` has data retention set to 2 months. This means all user-level and event-level data older than 2 months is permanently deleted. Consequences:
> - Year-over-year comparisons are impossible in Explorations (only aggregated reports preserve historical data)
> - Audience segments based on historical behavior are truncated
> - Any custom funnel analysis is limited to the most recent 2 months
>
> **Fix:** GA4 Admin → Data Settings → Data Retention → Change to 14 months. This takes effect immediately but does NOT recover already-deleted data. Every day this remains at 2 months, another day of historical data is lost.
>
> **Business impact:** Without YoY comparison data, the monthly report cannot contextualize seasonal patterns. A traffic dip in January that's normal seasonally will appear as a problem, eroding trust in the SEO program.

### Bad Example: GA4 Finding

> Data retention is set to the default value. We recommend changing it to 14 months for better historical analysis.

*Why it fails: Doesn't name the current setting, doesn't explain the consequences of inaction, doesn't provide the exact navigation path to fix it, doesn't mention that deleted data is unrecoverable. The urgency of "every day you wait, data is lost" is completely absent.*

### Good Example: UTM Taxonomy Table

> **Current UTM Chaos (sample from last 90 days):**
>
> | What they meant | utm_source values found | utm_medium values found |
> |----------------|----------------------|----------------------|
> | Facebook Ads | `Facebook`, `facebook`, `fb`, `FB`, `facebook.com`, `meta` | `cpc`, `paid`, `paid-social`, `social`, `CPC` |
> | Email newsletter | `newsletter`, `email`, `Newsletter`, `mailchimp`, `mc` | `email`, `Email`, `newsletter` |
> | Google Ads | `google`, `Google`, `GoogleAds`, `google-ads`, `adwords` | `cpc`, `CPC`, `ppc`, `paid`, `paid-search` |
>
> **Impact:** Facebook Ads traffic is split across 6 source values and 5 medium values — 30 possible combinations. GA4 reports show 30 separate line items instead of 1. Actual Facebook Ads performance is unknowable without manual data consolidation.
>
> **Recommended UTM taxonomy:**
>
> | Channel | utm_source | utm_medium | utm_campaign format |
> |---------|-----------|-----------|-------------------|
> | Facebook Ads | `facebook` | `paid-social` | `{YYYY-MM}_{campaign-name}_{audience}` |
> | Email newsletter | `newsletter` | `email` | `{YYYY-MM}_{issue-number}_{topic}` |
> | Google Ads | `google` | `paid-search` | `{YYYY-MM}_{campaign-name}_{ad-group}` |

### Bad Example: UTM Taxonomy Table

> UTM parameters are inconsistent. We recommend using a consistent naming convention for sources and mediums. This will improve your analytics reporting.

*Why it fails: Doesn't show the actual messy data to demonstrate the problem, doesn't provide the specific taxonomy to adopt, doesn't quantify the fragmentation. The client has no idea what "inconsistent" means or what "consistent" looks like.*

### Good Example: Executive Summary

> **Analytics Health Score: 38/100**
>
> Your analytics infrastructure has critical gaps that make your SEO investment unmeasurable. GA4 is installed and collecting pageview data, but 3 of your 5 primary conversion actions are untracked — contact form submissions, phone calls, and quote request downloads. This means the monthly report can show you traffic trends but cannot tell you whether that traffic is generating business. Additionally, data retention is set to 2 months (should be 14), your office IP (203.0.113.42) is not filtered (inflating session counts by an estimated 8-12%), and your GSC is verified as URL-prefix (missing subdomain and protocol variant data). Fixing these 4 critical items takes approximately 3 hours of implementation and transforms your analytics from a traffic counter into a business measurement system.

### Bad Example: Executive Summary

> Your analytics setup needs some work. There are a few things that could be improved to give you better data. We recommend making some changes to GA4 and GSC to improve tracking accuracy.

*Why it fails: No health score, no specific issues named, no quantified impact, no implementation estimate. "Some work" and "a few things" communicate nothing. The good example names exact conversion gaps, exact IP addresses, exact property type issues, and a time estimate.*

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|---|---|---|
| "GA4 is installed" as the entire audit | Installation ≠ configuration; most GA4 setups are incomplete | Audit configuration, conversions, filters, retention, and data quality |
| Ignoring phone call tracking | Service businesses get 50-70% of leads via phone | Always evaluate call tracking for local/service clients |
| Skipping GSC sitemap verification | Sitemap errors silently prevent indexation | Check submission, processing status, and error count |
| Setting anomaly thresholds without data | Arbitrary thresholds trigger false positives | Calculate actual standard deviations from historical data |
| Recommending Looker Studio before fixing tracking | A pretty dashboard of broken data is still broken data | Fix tracking first, build dashboards second |
| Treating all conversions as equal value | A newsletter signup ≠ a purchase request | Assign conversion values that reflect business reality |
| Auditing only the homepage tracking | Tracking breaks on specific page types (blog, product, landing pages) | Verify tracking on every major page template |
| Assuming GA4 defaults are correct | Most GA4 defaults (2-month retention, no filters, basic events) are wrong for SEO reporting | Explicitly check and configure every setting |
