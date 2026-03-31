# Anchor Text Distribution — Shared Reference

## What This Produces

A comprehensive anchor text strategy covering SpamBrain-safe distribution ratios, internal vs. external anchor text differences, over-optimization detection, and remediation plans. This reference defines the safe boundaries for anchor text across the client's entire link profile — both incoming backlinks and internal links — to maximize ranking signal while staying clear of algorithmic penalties.

**Deliverable type:** `anchor_text_analysis`
**Shared between:** Takeshi (external link anchors), all content agents (internal link anchors)
**Model:** gemini-2.5-pro

---

## Professional Standard

SpamBrain's August 2025 upgrade made anchor text distribution the most scrutinized link signal. Premium agencies don't just count anchor types — they analyze the distribution across ALL links to a target and compare against algorithmic thresholds. The difference between "safe" and "penalized" is a matter of percentages.

Premium anchor text analysis delivers:
- Profile-wide distribution mapping across all anchor categories
- Per-page anchor text analysis for priority ranking targets
- SpamBrain threshold assessment with safety ratings
- Internal vs. external anchor text separate analysis (different rules apply)
- Historical trend tracking (is the profile getting riskier over time?)
- Over-optimization detection with specific remediation steps
- Competitor anchor text benchmarking
- Anchor text strategy for future link acquisition campaigns

Safe distribution ratios (2026 research consensus):
- **Branded** (company name, domain): 30-50% — should be the dominant type
- **Generic** ("click here," "learn more," naked URLs): 10-25% — natural byproduct of editorial links
- **Partial match** (keyword + modifier phrase): 5-15% — "best SEO tools for startups"
- **Exact match** (target keyword alone): 1-5% — DANGER ZONE above 10%

---

## Build Process (Ordered Steps)

1. **Extract all anchor text data** — Pull the complete anchor text profile from backlink data sources (Ahrefs, Semrush). Include: anchor text string, source domain, target page, follow/nofollow status, and date first seen.

2. **Categorize every anchor** — Classify each anchor text into: branded, generic, partial match, exact match, naked URL, image alt text, compound (brand + keyword), or other. Use fuzzy matching for brand name variations.

3. **Calculate profile-wide distribution** — Compute percentages for each category across the entire backlink profile. This is the number SpamBrain evaluates.

4. **Run per-page analysis** — For each priority ranking target, calculate the anchor text distribution of links pointing specifically to that page. A page can be over-optimized even if the site-wide profile looks safe.

5. **Compare against safe thresholds** — Rate each category: safe (within range), warning (approaching threshold), danger (exceeds threshold). The critical threshold: exact match > 10% triggers SpamBrain alarms.

6. **Analyze internal anchors separately** — Internal link anchor text follows different rules. Google is more tolerant of descriptive keyword-rich anchors internally. But exact-match internal anchors on every link to the same page is still over-optimization.

7. **Benchmark against competitors** — Pull anchor text distributions for 3-5 competitors. Compare: are competitors more or less optimized? What does the industry norm look like?

8. **Detect trends** — Chart anchor text distribution over 6-12 months. Is the profile moving toward or away from safe ratios? Sudden shifts in anchor distribution are suspicious.

9. **Generate remediation plan** — For any category exceeding safe thresholds, provide specific actions: diversify with branded anchors, request anchor changes from willing webmasters, dilute with new links using safe anchor types.

10. **Create forward strategy** — Define anchor text guidelines for all future link building: outreach campaigns, guest posts, digital PR, and internal content creation.

---

## Critical Patterns

### 1. Exact Match Above 10% Is the Danger Line
**WHEN:** Evaluating any anchor text profile.
**HOW:** Calculate exact-match keyword anchor percentage across all backlinks to the site. If it exceeds 10%, this is a SpamBrain alarm trigger. If it exceeds 5%, it's a warning. Keep under 5% to be safe. Under 3% is ideal.
**WHY:** The August 2025 SpamBrain upgrade specifically evaluates exact-match anchor concentration. This is the single most common cause of algorithmic link penalties.
**DON'T:** Count partial-match anchors as exact-match. "Best SEO tools" and "SEO tools for startups" are different categories.

### 2. SpamBrain Evaluates Distribution, Not Individual Anchors
**WHEN:** Assessing any single backlink's anchor text.
**HOW:** A single exact-match anchor from a DR 80 site is fine. The problem is when exact-match is 15% of all anchors. Always evaluate at the profile level first, then per-page.
**WHY:** SpamBrain's network-level analysis looks at patterns across ALL links to the target. Individual anchor quality is secondary to distribution patterns.
**DON'T:** Flag a single exact-match anchor as dangerous. Context is the distribution, not the individual occurrence.

### 3. Branded Anchors Should Be the Dominant Type
**WHEN:** Setting anchor text strategy for any campaign.
**HOW:** Branded anchors (company name, domain name, brand variations) should represent 30-50% of all anchors. This is the natural state of an organically growing link profile. If branded is below 30%, actively build branded links.
**WHY:** When people link naturally, they use the brand name. A profile where branded anchors are a minority signals manipulation.
**DON'T:** Obsess over keyword anchors. The fastest way to build a safe profile is to increase the branded anchor percentage.

### 4. Internal vs. External Anchor Rules Differ
**WHEN:** Analyzing internal link anchor text.
**HOW:** Google is more tolerant of descriptive, keyword-rich internal anchors because site owners naturally describe their own content. Internal anchors should be descriptive phrases that indicate the target page's topic. However, using the exact same keyword anchor on every internal link to one page is still over-optimization.
**WHY:** Internal links are controlled by the site owner — Google expects them to be descriptive. External links should appear natural and varied — Google expects editorial diversity.
**DON'T:** Apply external anchor ratio rules to internal links. Internal links should be keyword-descriptive; external links should be naturally diverse.

### 5. Per-Page Analysis Catches Hidden Over-Optimization
**WHEN:** The site-wide profile looks safe but specific pages aren't ranking.
**HOW:** Calculate anchor text distribution for links pointing to each priority page individually. A page might receive 40% exact-match anchors even if the site-wide average is 4%.
**WHY:** SpamBrain evaluates both site-level and page-level distributions. A safe site-wide profile doesn't protect an over-optimized individual page.
**DON'T:** Only analyze at the site level. Per-page analysis is where actionable problems are found.

### 6. Naked URLs Are Safe Generic Anchors
**WHEN:** Categorizing anchor text types.
**HOW:** Naked URLs (https://example.com/page) count as generic anchors. They're a natural byproduct of people copy-pasting URLs. A healthy profile has 5-15% naked URL anchors.
**WHY:** High naked URL percentage indicates natural linking behavior. Low naked URL percentage suggests most links were intentionally placed with chosen anchors.
**DON'T:** Ignore naked URLs in the categorization. They're a positive signal of natural linking when present in reasonable quantities.

### 7. Image Alt Text Anchors Need Monitoring
**WHEN:** Analyzing the full anchor profile.
**HOW:** When images are used as links, the alt text becomes the anchor text. Some link builders exploit this with keyword-stuffed alt text on image links. Monitor image link anchors separately.
**WHY:** Image alt text anchors are less visible to manual review but fully visible to SpamBrain. Over-optimized image anchors are a hidden penalty risk.
**DON'T:** Exclude image anchors from the distribution analysis. They count in SpamBrain's calculation.

### 8. Competitor Benchmarking Reveals Industry Norms
**WHEN:** Deciding how aggressive to be with keyword anchors.
**HOW:** Pull anchor text distributions for the top 3-5 competitors in the same niche. If competitors average 8% exact-match and rank well, the threshold for that niche may be higher. If competitors average 2%, the niche is conservative.
**WHY:** Safe ratios vary slightly by industry and competitive landscape. Competitor data provides the actual floor and ceiling.
**DON'T:** Use competitor profiles to justify exceeding safe thresholds. If a competitor has 20% exact-match, they may be about to get penalized — don't copy their strategy.

### 9. Historical Trend Matters as Much as Current State
**WHEN:** Producing the anchor text report.
**HOW:** Chart the anchor text distribution over 6-12 months. A profile that was 3% exact-match six months ago and is now 12% shows a clear manipulation pattern. Even if 12% were safe (it's not), the rapid change is suspicious.
**WHY:** SpamBrain evaluates velocity of change in anchor distributions, not just static snapshots. Gradual shifts are safer than sudden changes.
**DON'T:** Only report current percentages. Include the trend line showing how the distribution has changed over time.

### 10. Remediation Is Dilution, Not Deletion
**WHEN:** A client's anchor text profile is over-optimized.
**HOW:** You cannot change most existing backlink anchors. Instead, dilute by building new links with branded and generic anchors. If the client has relationships with linking webmasters, request anchor text changes on the most impactful exact-match links.
**WHY:** Requesting anchor changes from random webmasters is impractical at scale. Dilution through new safe-anchor links is the reliable remediation strategy.
**DON'T:** Recommend disavowing links solely because of their anchor text. Disavow is for toxic/spam links, not for anchor text rebalancing.

### 11. Compound Anchors Are the Safest Keyword Strategy
**WHEN:** Guiding future anchor text choices for outreach.
**HOW:** Compound anchors combine the brand name with a keyword: "Acme Corp's SEO audit tool" or "see Acme Corp's guide to local SEO." These register as branded AND provide keyword context.
**WHY:** Compound anchors satisfy both brand signal and keyword relevance without triggering exact-match over-optimization.
**DON'T:** Force compound anchors into every link. They should be one part of a diverse, natural-looking distribution.

---

## Data Sources

| Source | What It Provides | Integration |
|--------|-----------------|-------------|
| Ahrefs API | Complete anchor text data for all backlinks | Primary anchor text source |
| Semrush API | Anchor text analysis, toxic anchor detection | Secondary validation |
| BFS Crawler | Internal link anchor text extraction | `crawlSite()` with anchor mapping |
| Link Analysis | Referring domain data, DR for weighting | `link_analysis_report` output |
| `client_seo_context` | Target keywords for exact-match detection | Supabase `client_seo_context` table |
| Competitor Data | Competitor anchor text benchmarks | Ahrefs/Semrush competitor profiles |

---

## Output Structure

```json
{
  "anchor_text_health_score": 0-100,
  "profile_distribution": {
    "branded_pct": 0,
    "generic_pct": 0,
    "partial_match_pct": 0,
    "exact_match_pct": 0,
    "naked_url_pct": 0,
    "image_alt_pct": 0,
    "compound_pct": 0,
    "other_pct": 0,
    "safety_rating": "safe|warning|danger"
  },
  "per_page_analysis": [
    {
      "url": "...",
      "target_keyword": "...",
      "exact_match_pct": 0,
      "branded_pct": 0,
      "safety_rating": "safe|warning|danger",
      "total_referring_domains": 0,
      "recommendations": []
    }
  ],
  "internal_anchor_analysis": {
    "total_internal_links": 0,
    "generic_anchors_count": 0,
    "descriptive_anchors_count": 0,
    "over_optimized_pages": [{ "url": "...", "repeated_anchor": "...", "count": 0 }],
    "recommendations": []
  },
  "competitor_benchmark": [
    { "competitor": "...", "exact_match_pct": 0, "branded_pct": 0, "generic_pct": 0 }
  ],
  "trend_analysis": {
    "monthly_snapshots": [{ "month": "YYYY-MM", "exact_match_pct": 0, "branded_pct": 0 }],
    "trend_direction": "improving|stable|deteriorating",
    "alerts": []
  },
  "remediation_plan": [
    { "priority": 1, "issue": "...", "action": "...", "target_ratio_change": "...", "effort": "low|medium|high" }
  ],
  "forward_strategy": {
    "outreach_anchor_guidelines": "...",
    "guest_post_anchor_guidelines": "...",
    "internal_link_anchor_guidelines": "...",
    "monthly_monitoring_checklist": []
  }
}
```

---

## Quality Gate

- [ ] All anchor text categorized into standard types with percentages calculated
- [ ] Exact-match percentage explicitly flagged with safety rating
- [ ] Per-page analysis completed for all priority ranking targets
- [ ] Internal and external anchors analyzed separately with different thresholds
- [ ] Competitor benchmark includes 3-5 competitors from the same niche
- [ ] Historical trend charted over 6-12 months with change velocity noted
- [ ] Remediation plan focuses on dilution through new safe-anchor links
- [ ] Forward strategy provides specific guidelines for outreach, guest posts, and internal links
- [ ] No recommendation suggests disavowing links solely for anchor text reasons
- [ ] All safe ratio thresholds cited with source (branded 30-50%, exact <5%)
- [ ] Business impact explained in plain English for client presentation
- [ ] Image alt text anchors included in the distribution analysis

---

## Cross-Service Connections

| Connected Service | Data Direction | What Flows |
|-------------------|---------------|------------|
| `link_analysis` | Backlink data → anchor text extraction | Complete referring domain list with anchor text |
| `outreach` | Anchor strategy → outreach campaigns | Safe anchor guidelines for link acquisition emails |
| `internal_linking` | Internal anchor analysis → link architecture | Over-optimized internal anchors → remediation in link audit |
| `content_article` | Anchor guidelines → content writing | Internal link anchor text standards for all articles |
| `content_brief` | Target keywords → exact-match monitoring | Keywords to watch for over-optimization in anchor profile |
| `monthly_report` | Anchor distribution snapshots → monthly tracking | Distribution percentages and trend direction |
| `site_audit` | Internal anchor data from crawl | Crawl-extracted anchor text → anchor analysis input |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|---|---|---|
| Optimizing for exact-match anchors to "boost keyword rankings" | Exceeding 10% exact-match triggers SpamBrain; this is the #1 penalty cause | Keep exact-match under 5%; use partial-match and compound anchors instead |
| Evaluating anchor text per-link instead of profile-wide | SpamBrain analyzes distribution patterns across ALL links, not individuals | Always calculate and report profile-wide percentages |
| Applying the same ratio rules to internal and external links | Internal links have higher keyword tolerance; external links need natural diversity | Analyze separately with different thresholds |
| Ignoring image alt text in anchor analysis | Image link alt text counts in SpamBrain's anchor evaluation | Include image anchors in every distribution calculation |
| Disavowing links because of their anchor text alone | Disavow is for toxic/spam domains, not anchor text rebalancing; wastes link equity | Dilute over-optimized anchors by building new links with safe anchors |
| Reporting only site-wide averages | Hides per-page over-optimization; a page can be penalized even with safe site-wide ratios | Run per-page anchor analysis on every priority ranking target |
| Using competitor over-optimization as justification | Competitors with aggressive anchors may be about to get penalized | Use competitor data as context, not as permission to exceed safe thresholds |
| Changing anchor strategy dramatically overnight | Sudden shifts in distribution patterns are a SpamBrain signal | Implement changes gradually over 3-6 months |
