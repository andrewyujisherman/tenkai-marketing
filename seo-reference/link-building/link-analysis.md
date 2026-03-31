# Link Analysis — Agent Takeshi Reference

## What This Produces

A comprehensive backlink profile audit covering anchor text distribution analysis, toxic link identification, competitor backlink gap analysis, link velocity tracking, and disavow file generation. Evaluates the client's entire link profile through Google's SpamBrain lens — not just individual link quality, but network-level relational patterns that determine whether links help or hurt rankings.

**Deliverable type:** `link_analysis_report`
**Agent:** Takeshi (武) — Link Building & Digital PR Specialist
**Model:** gemini-2.5-pro

---

## Professional Standard

A $5,000/month agency backlink audit uses Ahrefs (best-in-class backlink index), Semrush Backlink Audit, and Majestic Trust Flow/Citation Flow to build a complete picture. They don't just count links — they map the entire link ecosystem.

Premium backlink audits deliver:
- Complete referring domain inventory with DR/DA distribution curves
- Anchor text distribution map with safe ratio assessment against SpamBrain thresholds
- Toxic link identification with severity scoring and ready-to-submit disavow file
- Competitor backlink gap analysis showing exactly where competitors have links that the client doesn't
- Link velocity tracking with historical trend analysis and spike detection
- Network-level analysis evaluating linking domain relationships and patterns
- Monthly acquisition reports: new links gained, links lost, net authority change

Expected results from premium link campaigns: 42 unique referring domains per campaign, average DR 61, 20% from DR 70-79, 82% dofollow. Average cost per earned link: ~$750. First results in 2-6 weeks, measurable SEO impact in 3-6 months.

---

## Build Process (Ordered Steps)

1. **Pull backlink profile** — Extract the client's complete backlink data from available sources (Ahrefs API, Semrush API, or Moz). Capture: referring domains, total backlinks, DR/DA distribution, follow/nofollow ratio, link types (text, image, redirect).

2. **Map anchor text distribution** — Categorize every anchor text into: branded, generic, partial match, exact match, naked URL, image alt. Calculate percentages and compare against safe ratios (branded 30-50%, generic 10-25%, partial 5-15%, exact <5%).

3. **Score toxic links** — Evaluate each referring domain against spam signals: low DR + high outbound links, PBN patterns, foreign language irrelevant sites, thin content sites, link farms, and known SpamBrain-flagged networks. Assign severity: critical, high, medium, low.

4. **Generate disavow file** — For critical and high severity toxic links, generate a Google Search Console-ready disavow file. Include domain-level disavows for obvious spam networks, URL-level for borderline cases.

5. **Run competitor backlink gap** — Compare the client's referring domains against 3-5 competitors. Identify domains linking to competitors but not the client. Prioritize by DR and topical relevance.

6. **Analyze link velocity** — Chart link acquisition rate over 6-12 months. Flag unnatural spikes (>3x average monthly acquisition) or sudden drops. Calculate healthy acquisition targets.

7. **Perform network-level analysis** — Evaluate whether linking domains share hosting, ownership, or interlinking patterns that SpamBrain would flag as coordinated. Check for reciprocal link networks.

8. **Compile findings and prioritize** — Generate the full report with an overall Link Health Score (0-100), prioritized action items, and timeline for improvements.

---

## Critical Patterns

### 1. Anchor Text Distribution Is the #1 SpamBrain Signal
**WHEN:** Evaluating any backlink profile.
**HOW:** Map every anchor text into categories. The August 2025 SpamBrain upgrade evaluates anchor text distribution across ALL links to the target — not just individual anchors. Calculate percentages: branded should be 30-50%, generic 10-25%, partial match 5-15%, exact match under 5%.
**WHY:** Exact match anchor text exceeding 10% triggers SpamBrain alarms. This is the most common penalty cause in 2026.
**DON'T:** Evaluate anchors in isolation. The distribution across the entire profile is what matters.

### 2. SpamBrain Operates at Network Level
**WHEN:** Assessing any set of backlinks.
**HOW:** SpamBrain (August 2025 upgrade) evaluates linking domain topic, anchor text distribution across ALL links to the target, and historical behavior of every domain in the network. Look for shared hosting, reciprocal patterns, and coordinated link timing.
**WHY:** A link that looks clean individually may be toxic when its source domain participates in a link network.
**DON'T:** Clear a link as safe just because the individual domain looks legitimate. Check the network.

### 3. Toxic Link Severity Must Be Tiered
**WHEN:** Building the disavow file.
**HOW:** Critical = obvious spam/PBN/link farm. High = low DR + unrelated topic + high outbound. Medium = borderline signals, may be natural. Low = minor concerns, monitor only. Only disavow critical and high. Medium gets monitored.
**WHY:** Over-disavowing removes legitimate link equity. Under-disavowing leaves penalties active.
**DON'T:** Bulk-disavow everything below DR 20. Low-DR editorial links from niche sites are often the most valuable.

### 4. Competitor Backlink Gap Drives Strategy
**WHEN:** Producing outreach target recommendations.
**HOW:** Pull referring domains for 3-5 competitors. Filter to domains linking to 2+ competitors but not the client. Sort by DR descending. Cross-reference with topical relevance to the client's industry.
**WHY:** Sites already linking to competitors are proven willing to link in the client's niche. Highest conversion rate for outreach.
**DON'T:** Include competitor-only domains that are clearly branded assets or partnerships (e.g., competitor's own microsites).

### 5. Link Velocity Spikes Trigger Spam Filters
**WHEN:** Reviewing link acquisition history.
**HOW:** Chart monthly new referring domains over 12 months. Calculate the rolling average. Flag any month with >3x the average as a potential spam trigger. Also flag sudden drops (lost links from a deindexed network).
**WHY:** Google's October 2025 spam update explicitly targeted unnatural link velocity patterns.
**DON'T:** Recommend "build 50 links this month" without checking the historical baseline. Gradual growth is safe.

### 6. Follow/Nofollow Ratio Matters
**WHEN:** Evaluating overall profile health.
**HOW:** A natural profile has 60-80% dofollow links. Profiles with >90% dofollow are suspicious. Profiles with <40% dofollow have weak link equity. Social profiles and major publications naturally add nofollow.
**WHY:** An all-dofollow profile signals manipulated link building. An all-nofollow profile provides minimal ranking benefit.
**DON'T:** Chase only dofollow links. A nofollow mention on a DR 90 news site has indirect SEO value through traffic and brand signals.

### 7. DR Distribution Curve Should Be Natural
**WHEN:** Assessing referring domain quality.
**HOW:** Plot referring domains by DR in buckets (0-10, 11-20, ... 90-100). A natural profile has a bell curve skewing toward DR 20-40. Spikes at DR 0-10 suggest spam. Unusual concentration at any single tier suggests purchased links.
**WHY:** SpamBrain evaluates the overall distribution pattern, not just individual domain quality.
**DON'T:** Report "average DR" alone — it hides bimodal distributions where spam and a few premium links produce a misleading average.

### 8. Lost Links Require Investigation
**WHEN:** Link velocity analysis shows link losses.
**HOW:** Identify domains that stopped linking. Categorize: removed by webmaster, domain expired, page deleted, domain deindexed. Deindexed domains suggest the link network was penalized.
**WHY:** If multiple linking domains are deindexed simultaneously, the client may have been part of a flagged network. Proactive disavow is needed.
**DON'T:** Ignore lost links. A pattern of deindexed referring domains is a leading indicator of an incoming penalty.

### 9. Link Type Diversity Is a Health Signal
**WHEN:** Evaluating link profile composition.
**HOW:** Categorize links by type: editorial in-content, sidebar/footer, directory listing, forum/comment, image link, resource page. A healthy profile has 60%+ editorial in-content links.
**WHY:** Sidebar, footer, and comment links are low-value signals that SpamBrain flags when overrepresented.
**DON'T:** Count a sidebar link on a DR 70 site as equivalent to an editorial in-content link on a DR 40 site. Context placement matters.

### 10. Disavow Files Need the Domain Directive
**WHEN:** Generating disavow files for Google Search Console.
**HOW:** Use `domain:example.com` format for entire spam domains. Use individual URL format only for borderline cases on otherwise legitimate domains. Include comments explaining why each entry was disavowed.
**WHY:** URL-level disavows miss future spam links from the same domain. Domain-level is more protective.
**DON'T:** Submit a disavow file without documenting the rationale. Clients switch agencies — the next team needs to understand decisions.

---

## Data Sources

| Source | What It Provides | Integration |
|--------|-----------------|-------------|
| Ahrefs API | Referring domains, DR, anchor text, link velocity, follow/nofollow | Primary backlink data source |
| Semrush API | Backlink Audit tool, toxic score, Authority Score | Secondary validation + toxic scoring |
| Majestic API | Trust Flow / Citation Flow metrics | Quality triangulation |
| Google Search Console | Disavow file submission, manual action notices | Disavow delivery endpoint |
| BFS Crawler | On-site link analysis, internal link detection | `crawlSite()` |
| `client_seo_context` | Historical link data, past disavow actions, competitors | Supabase `client_seo_context` table |

---

## Output Structure

```json
{
  "link_health_score": 0-100,
  "backlink_summary": {
    "total_backlinks": 0,
    "referring_domains": 0,
    "dofollow_ratio": "0%",
    "avg_referring_domain_dr": 0,
    "dr_distribution": { "0-10": 0, "11-20": 0, "21-30": 0, "31-40": 0, "41-50": 0, "51-60": 0, "61-70": 0, "71-80": 0, "81-90": 0, "91-100": 0 }
  },
  "anchor_text_analysis": {
    "branded_pct": 0,
    "generic_pct": 0,
    "partial_match_pct": 0,
    "exact_match_pct": 0,
    "naked_url_pct": 0,
    "image_alt_pct": 0,
    "safety_assessment": "safe|warning|danger",
    "over_optimized_anchors": [],
    "recommendations": []
  },
  "toxic_links": {
    "critical": [{ "domain": "...", "reason": "...", "action": "disavow" }],
    "high": [{ "domain": "...", "reason": "...", "action": "disavow" }],
    "medium": [{ "domain": "...", "reason": "...", "action": "monitor" }],
    "total_toxic_domains": 0,
    "disavow_file_generated": true
  },
  "competitor_gap": [
    { "domain": "...", "dr": 0, "links_to_competitors": ["..."], "topical_relevance": "high|medium|low", "outreach_priority": 1 }
  ],
  "link_velocity": {
    "monthly_trend": [{ "month": "YYYY-MM", "new_domains": 0, "lost_domains": 0 }],
    "average_monthly_acquisition": 0,
    "spike_alerts": [],
    "recommended_monthly_target": 0
  },
  "network_analysis": {
    "potential_pbn_clusters": [],
    "reciprocal_link_pairs": [],
    "risk_assessment": "low|medium|high"
  },
  "action_plan": [
    { "priority": 1, "action": "...", "expected_impact": "...", "effort": "low|medium|high" }
  ]
}
```

---

## Quality Gate

- [ ] Anchor text distribution mapped with percentages for all categories
- [ ] Exact match percentage flagged if above 5% (warning) or 10% (danger)
- [ ] Toxic links tiered by severity with clear rationale for each
- [ ] Disavow file generated in correct Google Search Console format
- [ ] Competitor gap analysis includes 3-5 competitors with prioritized domains
- [ ] Link velocity charted over 6-12 months with spike detection
- [ ] Network-level patterns evaluated (not just individual domain quality)
- [ ] DR distribution plotted — not just average DR
- [ ] Follow/nofollow ratio assessed against natural benchmarks
- [ ] All recommendations are specific and actionable (not "build more links")
- [ ] Business impact framed in plain English for client presentation
- [ ] No hallucinated referring domains — all data from verified API sources

---

## Cross-Service Connections

| Connected Service | Data Direction | What Flows |
|-------------------|---------------|------------|
| `outreach` | Link analysis findings → outreach targets | Competitor gap domains become outreach priority list |
| `internal_linking` | Authority pages identified → internal link strategy | Pages with most backlinks become internal link sources |
| `anchor_text` | Anchor analysis → anchor text strategy | Over-optimized anchors inform future anchor text planning |
| `content_brief` | Link gap analysis → content topics | Topics where competitors earn links → content brief ideas |
| `monthly_report` | Link metrics tracked monthly | Link health score, new domains, velocity → monthly report |
| `local_audit` | Citation links separated from editorial links | Directory/citation links identified → local SEO audit |
| `geo_audit` | Authority signals inform AI citability | High-authority pages → GEO audit priority pages |

---

## Concrete Examples

### Sample Anchor Text Distribution Analysis — Safe vs. Danger Profile

**SAFE profile (Client A — Local Plumbing Company):**

| Anchor Category | Count | Percentage | Status |
|---|---|---|---|
| Branded ("Greenfield Plumbing," "Greenfield") | 142 | 41.5% | Safe (target: 30-50%) |
| Generic ("click here," "this website," "learn more") | 58 | 17.0% | Safe (target: 10-25%) |
| Naked URL ("greenfieldplumbing.com," "www.greenfield...") | 52 | 15.2% | Safe (natural pattern) |
| Partial match ("Portland plumbing company," "plumber in Portland area") | 41 | 12.0% | Safe (target: 5-15%) |
| Exact match ("Portland plumber," "emergency plumber Portland") | 12 | 3.5% | Safe (target: <5%) |
| Image alt / no text | 37 | 10.8% | Safe (normal for image links) |
| **Total** | **342** | **100%** | **Overall: SAFE** |

**Assessment:** Healthy, natural-looking distribution. Branded anchors dominate. Exact match is well under 5%. No action needed — monitor quarterly.

---

**DANGER profile (Client B — SaaS Company with manipulated links):**

| Anchor Category | Count | Percentage | Status |
|---|---|---|---|
| Branded ("AcmeSaaS," "Acme Software") | 45 | 9.2% | DANGER — far below 30% minimum |
| Generic ("click here," "visit site") | 22 | 4.5% | WARNING — below 10% floor |
| Naked URL | 18 | 3.7% | Low but not alarming alone |
| Partial match ("project management software tool," "best PM software") | 127 | 26.0% | DANGER — exceeds 15% ceiling |
| Exact match ("project management software," "best project management tool") | 198 | 40.5% | CRITICAL — 8x above safe threshold |
| Image alt / no text | 79 | 16.1% | Elevated (often from widget/badge links) |
| **Total** | **489** | **100%** | **Overall: CRITICAL RISK** |

**Assessment:** This profile screams manipulation. Exact match anchors at 40.5% (should be <5%) and partial match at 26% (should be <15%) indicate a history of purchased links with requested anchor text. Branded at only 9.2% is unnaturally low — real editorial links almost always use the brand name. **Immediate action:** Audit the 198 exact-match links, disavow the clearly purchased ones, and begin a branded link acquisition campaign to dilute the toxic distribution.

---

### Sample Disavow File

```
# Disavow file for greenfieldplumbing.com
# Generated: 2026-03-15
# Analyst: Takeshi — Link Analysis Service
# Reason: Toxic backlinks identified in quarterly audit
# Review date: 2026-06-15 (re-evaluate at next quarterly audit)

# =============================================
# DOMAIN-LEVEL DISAVOWS — Confirmed spam networks
# =============================================

# PBN network — 47 domains sharing same hosting (AS12345), identical templates,
# each with 500+ outbound links. Discovered via network analysis 2026-03-10.
domain:seo-links-directory.xyz
domain:best-business-listings.xyz
domain:top-web-directory.online
domain:premium-link-exchange.net

# Link farm — auto-generated pages with random anchor text.
# All domains registered within 2 weeks of each other (Nov 2025).
# DR 0-2, 100% outbound links, zero organic traffic.
domain:spamsite8821.com
domain:linkfarm-gen.net
domain:autoblog-network-3847.com

# Foreign-language gambling sites — zero topical relevance.
# Likely from a negative SEO attack or scraped content.
domain:casino-slots-bonus.ru
domain:online-betting-tips.cn

# =============================================
# URL-LEVEL DISAVOWS — Borderline domains with some legitimate content
# =============================================

# blogosphere-weekly.com is a legitimate blog (DR 35) but this specific
# sponsored post page has 200+ outbound links and was clearly a paid placement.
# Other pages on this domain may link naturally — only disavow this URL.
https://blogosphere-weekly.com/sponsored/top-plumbing-companies-2025/

# techreviews-hub.com has real content but this page is a link roundup
# with 150 outbound links and exact-match anchor "Portland plumber" —
# the only link we have from this domain.
https://techreviews-hub.com/resources/home-services-directory-portland/
```

**Key points:** Every entry has a comment explaining why it was disavowed and when it was identified. Domain-level disavows (`domain:`) for obvious spam networks. URL-level disavows for specific problematic pages on otherwise legitimate domains. Includes a review date for the next audit.

---

### Sample Competitor Backlink Gap Table

**Client:** Greenfield Plumbing (Portland, OR)
**Competitors analyzed:** RotoFlow Plumbing, ClearDrain Portland, PipeWorks NW

| Gap Domain | DR | Links to Competitors | Topical Relevance | Outreach Priority | Notes |
|---|---|---|---|---|---|
| oregonlive.com (The Oregonian) | 89 | RotoFlow (editorial mention in "Best Plumbers" roundup) | High — local news covering Portland services | 1 — Highest | Digital PR pitch: local data study on Portland water quality or pipe infrastructure age. The Oregonian publishes local business roundups annually in Q4. |
| portlandmonthlymag.com | 72 | ClearDrain (advertorial feature), PipeWorks (source quote in home maintenance article) | High — Portland lifestyle publication | 2 — High | Guest expert opportunity. Pitch: "Portland Home Maintenance Calendar" with plumbing seasonal tips. Two competitors already present — we need to be here. |
| homeadvisor.com/r/portland | 91 | RotoFlow, ClearDrain, PipeWorks (all three have claimed profiles with reviews) | High — home services directory | 3 — High (but different tactic) | Not outreach — claim and optimize the existing HomeAdvisor profile. All three competitors are listed with reviews. This is a citation gap, not a link gap. |
| pdxmonthly.com | 58 | PipeWorks (quoted as expert in winter pipe freeze article) | High — Portland-focused publication | 4 — Medium-High | Reactive PR opportunity. Monitor for journalist queries about plumbing/home services in Portland. Offer Robert Greenfield as a source (40+ years experience is a strong credential). |
| bobvila.com | 82 | RotoFlow (contributor byline on "How to Unclog a Drain" guide) | Medium — national home improvement, not Portland-specific | 5 — Medium | Guest post opportunity. National audience but topic-relevant. Pitch: "When to DIY vs. Call a Plumber" with specific cost breakdowns from our service data. Byline link to homepage. |

**How to read this table:** These 5 domains link to one or more competitors but NOT to Greenfield Plumbing. They are proven willing to link in the plumbing/home services space. Sorted by a blend of DR, topical relevance, and feasibility. Each entry includes a specific tactic — not just "reach out to them."

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|---|---|---|
| Reporting "average DR" as the quality metric | Hides bimodal distributions; spam + premium links average to misleading numbers | Plot full DR distribution curve in buckets |
| Bulk-disavowing everything below DR 20 | Removes legitimate niche editorial links that drive real authority | Tier toxic links by severity; only disavow critical and high |
| Evaluating anchor text per-link instead of profile-wide | SpamBrain analyzes distribution across ALL links to the target | Calculate profile-wide anchor text category percentages |
| Ignoring nofollow links in the analysis | Nofollow links from major publications provide traffic and brand signals | Include nofollow in profile analysis; assess indirect value |
| Recommending a specific number of links per month without baseline | Velocity spikes trigger spam filters; what's safe depends on history | Calculate historical average first, recommend gradual increase |
| Treating all referring domains equally regardless of placement | A sidebar blogroll link is not equivalent to an in-content editorial mention | Categorize by link placement type; weight editorial links higher |
| Generating disavow files without documentation | Next agency or client can't understand decisions; may accidentally re-acquire toxic links | Comment every disavow entry with rationale and date |
| Running competitor gap without topical relevance filter | Produces lists of irrelevant high-DR domains that won't convert | Filter gap results by industry/topic relevance before prioritizing |
