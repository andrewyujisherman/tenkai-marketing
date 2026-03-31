# Local SEO Audit — Agent Hana Reference

## What This Produces

A comprehensive local search visibility audit covering Google Business Profile completeness, NAP consistency across directories, citation health, review profile analysis, geo-grid ranking concept, competitor comparison, LocalBusiness schema validation, and 2026 local ranking factor assessment. Produces an actionable audit report matching the quality of BrightLocal's 20-30 page white-labeled PDF reports.

**Deliverable type:** `local_seo_audit_report`
**Agent:** Hana (花) — Local SEO & GBP Specialist
**Model:** gemini-2.5-pro

---

## Professional Standard

Premium local SEO agencies use BrightLocal ($39-79/mo, 300+ data points), Whitespark (citation building + tracking), and Sterling Sky's hand-crafted audits. They produce 20-30 page white-labeled PDF reports with geo-grid maps, citation lists, and competitive benchmarks. These reports serve dual purposes: client deliverable and lead-gen tool (free audit to close deals).

Premium local SEO audits deliver:
- GBP completeness audit with every field checked against best practices and percentage complete
- NAP consistency verification across top 10-20 directories with specific discrepancies listed
- Citation audit with count and accuracy across aggregator networks
- Review profile analysis: total count, average rating, recency distribution, response rate, sentiment
- Geo-grid ranking concept explaining rank variation across the service area
- Competitor local analysis: side-by-side GBP comparison for top 3-5 competitors
- On-page local signals: NAP on website, city in title tags, location page quality
- LocalBusiness schema markup validation with specific field requirements
- 2026 ranking factor prioritization based on latest research

Local SEO packages: $500-1,500/month. Sterling Sky charges for custom hand-crafted audits. BrightLocal's audit tool costs $39-79/month for agencies.

---

## Build Process (Ordered Steps)

1. **GBP completeness audit** — Check every GBP field: primary category, secondary categories, business description, services list, attributes, photos (count, geo-tagging, recency), hours, Q&A section, Google Posts (last 4), products/services menu. Score as percentage complete.

2. **Primary category analysis** — The single most influential local ranking factor per 2026 research. Verify the primary category is the most specific option that matches the core business. Compare against competitors' category choices. Identify if a better primary category exists.

3. **NAP consistency check** — Verify Name, Address, Phone across top 10-20 directories: Google Business Profile, Bing Places, Apple Maps, Yelp, Facebook, BBB, industry-specific directories. Flag exact discrepancies: suite number variations, phone format differences, old addresses, abbreviated vs. full street names.

4. **Citation audit** — Count total citations found across directories. Check data aggregator coverage (InfoGroup, Neustar Localeze, Factual). Identify missing priority platforms. Score accuracy percentage.

5. **Review profile analysis** — Pull review metrics: total count, average rating, rating distribution (1-5 stars), recency (reviews per month over last 12 months), response rate, average response time, sentiment themes from negative reviews.

6. **Geo-grid ranking concept** — Explain to the client that local rankings vary by searcher location. A business may rank #1 near their location but #15 two miles away. Describe the geo-grid analysis methodology (ranking at multiple geographic points within the service area) and recommend geo-grid tracking tools.

7. **Competitor local analysis** — For top 3-5 local competitors, compare: GBP completeness, review count and rating, citation count, primary category, photo count, posting frequency. Produce a side-by-side comparison table.

8. **On-page local signals** — Check: NAP on website (footer, contact page), city/region in title tags, location pages quality (unique content per location or duplicate templates), embedded Google Map, driving directions link.

9. **Schema markup validation** — Check for LocalBusiness JSON-LD schema with required fields: name, address, telephone, geo coordinates, openingHoursSpecification, areaServed, priceRange, image. Flag missing or incomplete schema.

10. **Score and prioritize** — Assign an overall Local SEO Health Score (0-100). Rank all recommendations by the 2026 ranking factor weights: GBP signals (32%), reviews, on-page, links, proximity, citations, behavioral.

---

## Critical Patterns

### 1. GBP Primary Category Is the #1 Local Ranking Factor
**WHEN:** Auditing any Google Business Profile.
**HOW:** The 2026 Local Search Ranking Factors Survey (Whitespark/BrightLocal, ~50 experts) identifies GBP signals at 32% weight — and primary category is the single most influential factor within that. Verify the client has the most specific matching category. "Personal Injury Attorney" outranks "Lawyer" for personal injury queries.
**WHY:** GBP importance increased 15% year over year. Primary category directly determines which searches trigger the business listing.
**DON'T:** Accept a broad primary category when a specific one exists. Specificity wins.

### 2. NAP Consistency — Single Character Differences Matter
**WHEN:** Checking citations across directories.
**HOW:** Create a "Single Source of Truth" document with the exact business name, address, and phone number. Compare character-by-character against every directory listing. Flag: "Suite 100" vs "Ste 100," "Street" vs "St," "(555) 123-4567" vs "555-123-4567," old addresses not updated.
**WHY:** Citation inconsistency is the #1 issue affecting local SEO ranking. Businesses with 40+ accurate citations rank 53% higher in local search.
**DON'T:** Accept "close enough" — minor formatting differences confuse Google's entity matching algorithms.

### 3. Review Recency Outweighs Volume Post-2026
**WHEN:** Analyzing the review profile.
**HOW:** A business with 150 reviews at 4.8 stars typically outranks one with 30 reviews at 5.0. But recency now matters more than raw count post-March 2026 update. Track: reviews per month, recency distribution, whether the most recent review is within 14 days.
**WHY:** Google's 2026 algorithm weighs review recency higher than total count. Stale review profiles (no new reviews in 30+ days) lose ranking power.
**DON'T:** Report only total review count and average rating. Monthly velocity and recency are the actionable metrics.

### 4. Geo-Grid Explains Rank Variation by Location
**WHEN:** Client says "I rank #1" but isn't getting leads from parts of their service area.
**HOW:** Explain that local rankings change based on searcher location. A business at the center of a city may rank #1 there but #10 in surrounding neighborhoods. Recommend geo-grid tools (Local Falcon, BrightLocal's Local Search Grid) that show ranking at 25+ points across the service area.
**WHY:** Proximity is the 5th most influential local ranking factor. Being open at search time and distance from the searcher directly affect results.
**DON'T:** Report a single local rank position as representative of the entire service area. It's misleading.

### 5. Competitor Comparison Drives Priority Setting
**WHEN:** Presenting audit findings to the client.
**HOW:** Build a comparison table: Client vs. Top 3-5 competitors across reviews (count + rating), GBP completeness, citation count, primary category, photo count. Highlight where the client lags most.
**WHY:** Context matters. "You have 45 reviews" means nothing until the client sees their top competitor has 280. Competitive gaps set priorities.
**DON'T:** Audit in isolation. Every metric needs competitive context.

### 6. LocalBusiness Schema Must Include Geo and Hours
**WHEN:** Checking structured data.
**HOW:** Validate LocalBusiness JSON-LD includes at minimum: @type, name, address (with streetAddress, addressLocality, addressRegion, postalCode), telephone, geo (latitude, longitude), openingHoursSpecification, and image. For SABs, add areaServed.
**WHY:** Schema helps Google verify business information and present it in local results. Missing geo coordinates or hours reduces search feature eligibility.
**DON'T:** Check only for schema presence. Validate that every required field contains accurate, current data.

### 7. 2026 Ranking Factor Weights Guide Prioritization
**WHEN:** Ordering recommendations in the audit report.
**HOW:** Apply the 2026 ranking factor weights: GBP signals 32%, reviews (quantity + recency + quality + response rate), on-page local signals, link signals, proximity, citation consistency, behavioral signals. Prioritize recommendations by the factor they address.
**WHY:** Spending time on citations when the GBP is 40% complete is wrong prioritization. Fix the highest-weight factors first.
**DON'T:** List recommendations alphabetically or randomly. Weight-based prioritization ensures the client works on what matters most.

### 8. SAB vs. Storefront Requires Different Strategy
**WHEN:** The client is a service area business (plumber, electrician, cleaner).
**HOW:** SABs must hide their address per Google guidelines when they don't have staffed offices open to the public. This creates a ranking disadvantage. Compensate with: heavier review focus, maximum GBP completeness, service area pages for each major city/region, local content strategy (city-specific case studies, local event mentions).
**WHY:** Negative correlation exists between hiding address and local pack ranking. SABs need to overinvest in other ranking factors to compensate.
**DON'T:** Apply storefront optimization strategies to SABs without addressing the address-hiding disadvantage.

### 9. Photo Optimization Includes Geo-Tagging
**WHEN:** Auditing GBP photos.
**HOW:** Count total photos, check recency (last upload date), and verify geo-tagging (EXIF data includes location coordinates matching the business address). Recommend descriptive filenames (not IMG_4567.jpg) and a minimum of 10 photos covering: exterior, interior, products, services, team.
**WHY:** Businesses with 100+ photos get 520% more calls than those with fewer than 5. Geo-tagged photos reinforce location signals.
**DON'T:** Count photos without checking quality, recency, and geo-tagging. Ten recent, geo-tagged photos beat fifty stock photos.

### 10. AI Search Now Matters for Local Discovery
**WHEN:** Framing the audit findings in 2026 context.
**HOW:** 45% of shoppers now use generative AI to find local businesses. Local presence influences AI-driven discovery, not just Google Maps. Reference GEO audit findings where available. Ensure business information is structured for AI extraction.
**WHY:** Local SEO in 2026 isn't just about the local pack. AI assistants pull local business data from multiple sources.
**DON'T:** Ignore AI search in local audits. It's a growing discovery channel that compounds the value of GBP optimization and citation consistency.

---

## Data Sources

| Source | What It Provides | Integration |
|--------|-----------------|-------------|
| Google Business Profile API | GBP completeness data, posts, reviews, photos | Direct API access |
| BFS Crawler | Website local signals, NAP on site, location pages | `crawlSite()` |
| Site Scraper | Directory listing verification for NAP check | `scrapeUrl()` on each directory |
| Serper API | Local pack results, competitor listings | `fetchKeywordSerpData()` with local intent |
| `client_seo_context` | Business info, target locations, competitors | Supabase `client_seo_context` table |
| Schema Validator | LocalBusiness JSON-LD validation | Google Rich Results Test API |

---

## Output Structure

```json
{
  "local_seo_health_score": 0-100,
  "gbp_audit": {
    "completeness_pct": 0,
    "primary_category": "...",
    "primary_category_assessment": "optimal|suboptimal|missing",
    "secondary_categories": ["..."],
    "missing_fields": ["..."],
    "photo_count": 0,
    "photos_geo_tagged": true,
    "last_post_date": "...",
    "posts_last_30_days": 0,
    "qa_count": 0,
    "recommendations": []
  },
  "nap_consistency": {
    "source_of_truth": { "name": "...", "address": "...", "phone": "..." },
    "directories_checked": 0,
    "consistent_count": 0,
    "inconsistencies": [
      { "directory": "...", "field": "name|address|phone", "found": "...", "expected": "...", "severity": "critical|minor" }
    ],
    "missing_listings": ["..."]
  },
  "citation_audit": {
    "total_citations": 0,
    "accuracy_pct": 0,
    "aggregator_coverage": { "infogroup": true, "neustar": true, "factual": true },
    "priority_platforms_present": ["..."],
    "priority_platforms_missing": ["..."]
  },
  "review_profile": {
    "total_reviews": 0,
    "avg_rating": 0.0,
    "rating_distribution": { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
    "reviews_last_30_days": 0,
    "reviews_last_90_days": 0,
    "response_rate": "0%",
    "avg_response_time_hours": 0,
    "sentiment_themes": { "positive": ["..."], "negative": ["..."] }
  },
  "competitor_comparison": [
    { "competitor": "...", "reviews": 0, "rating": 0.0, "gbp_completeness": "0%", "citation_count": 0, "primary_category": "...", "photo_count": 0 }
  ],
  "on_page_signals": {
    "nap_on_website": true,
    "city_in_title_tags": true,
    "location_pages_count": 0,
    "location_pages_unique_content": true,
    "embedded_map": true,
    "recommendations": []
  },
  "schema_assessment": {
    "local_business_schema_present": true,
    "fields_present": ["..."],
    "fields_missing": ["..."],
    "geo_coordinates_accurate": true,
    "recommendations": []
  },
  "ranking_factor_priorities": [
    { "factor": "...", "weight": "32%", "client_status": "...", "action": "...", "priority": 1 }
  ],
  "action_plan": [
    { "priority": 1, "factor_weight": "...", "action": "...", "expected_impact": "...", "effort": "low|medium|high" }
  ]
}
```

---

## Quality Gate

- [ ] GBP completeness scored as percentage with every missing field listed
- [ ] Primary category assessed against all available options — most specific match identified
- [ ] NAP checked across minimum 10 directories with character-level discrepancies flagged
- [ ] Citation count includes aggregator coverage status
- [ ] Review metrics include recency (last 30/90 days), not just total count and average
- [ ] Review response rate and average response time calculated
- [ ] Competitor comparison table includes 3-5 local competitors
- [ ] Geo-grid concept explained with tool recommendations
- [ ] LocalBusiness schema validated with specific missing fields listed
- [ ] On-page local signals checked: NAP, title tags, location pages, map embed
- [ ] Recommendations ordered by 2026 ranking factor weights
- [ ] SAB vs. storefront differences addressed if applicable
- [ ] Business impact framed in plain English for client presentation

---

## Cross-Service Connections

| Connected Service | Data Direction | What Flows |
|-------------------|---------------|------------|
| `gbp_optimization` | Audit findings → GBP action items | Missing fields, category recommendation → GBP optimization work |
| `review_management` | Review profile analysis → review strategy | Review metrics, competitor benchmark → review campaign |
| `citations_nap` | NAP inconsistencies → citation cleanup | Discrepancies found → citation correction priorities |
| `schema_generation` | Schema gaps → schema creation | Missing LocalBusiness fields → schema service |
| `content_brief` | Local content needs → content planning | City pages, local case studies → content calendar |
| `site_audit` | Technical issues affecting local SEO | Crawl errors on location pages, redirect issues |
| `geo_audit` | AI search local visibility | Local entity signals → GEO audit assessment |
| `monthly_report` | Local metrics tracked monthly | Health score, review velocity, citation count → monthly report |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|---|---|---|
| Checking only Google for NAP consistency | Inconsistencies on Yelp, Bing, Apple Maps hurt ranking even if Google is correct | Check 10-20 directories including all Tier 1 platforms |
| Reporting a single local rank position | Rankings vary dramatically by searcher location within the service area | Explain geo-grid concept; recommend grid tracking tools |
| Recommending "get more reviews" without velocity context | 5 reviews/month when competitors get 20/month still loses; raw total isn't the metric | Set velocity targets based on competitor benchmarking |
| Ignoring GBP Posts as "not important" | Google Posts are a weekly activity signal; 4/month minimum recommended | Include Post frequency in GBP completeness audit |
| Accepting broad primary categories | "Lawyer" vs "Personal Injury Attorney" — the specific category ranks for specific queries | Research all available subcategories; recommend the most specific match |
| Running the audit without checking SAB status | SABs have hidden addresses, which changes the entire optimization strategy | Determine SAB vs storefront first; adjust recommendations accordingly |
| Listing all recommendations with equal weight | Client doesn't know what to do first; GBP at 32% weight should come before citations | Order all recommendations by 2026 ranking factor weights |
| Checking schema presence without validating field accuracy | Schema exists but has wrong geo coordinates or outdated hours — worse than no schema | Validate every field's accuracy against the Single Source of Truth |
