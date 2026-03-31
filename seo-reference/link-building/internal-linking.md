# Internal Linking Architecture — Shared Reference

## What This Produces

A strategic internal link audit and optimization plan that maximizes the distribution of link equity from high-authority pages to priority ranking targets. Covers authority page identification, silo structure optimization, orphan page elimination, hub/spoke cluster architecture, and descriptive anchor text mapping. This is the mechanism that turns external backlinks into site-wide ranking power.

**Deliverable type:** `internal_link_audit`
**Shared between:** Takeshi (link building context), all content agents (linking within articles)
**Model:** gemini-2.5-pro

---

## Professional Standard

Internal linking is the most underrated aspect of SEO. Premium agencies treat it as a dedicated service, not an afterthought. The mechanism: external backlinks give a page authority (PageRank); internal links distribute that authority to other pages. Without strategic internal linking, authority stays trapped on the homepage.

Premium internal link audits deliver:
- Complete site crawl mapping every internal link and its direction
- Authority page identification (pages with the most external backlinks)
- Strategic linking recommendations FROM high-authority pages TO priority ranking targets
- Orphan page detection (pages with 0-1 internal links — always flagged)
- Silo structure analysis grouping content into themed categories
- Hub/spoke architecture within topic clusters
- Descriptive anchor text mapping (never "click here")
- Link equity flow visualization showing how authority distributes across the site
- Before/after projections for ranking improvement on target pages

---

## Build Process (Ordered Steps)

1. **Crawl the full site** — Use BFS crawler to map every page and every internal link. Record: source page, target page, anchor text, link position (content, navigation, sidebar, footer), and follow/nofollow status.

2. **Identify authority pages** — Cross-reference with backlink data from link_analysis. Rank pages by: number of external referring domains, total backlink equity, and DR of linking domains. These are the "power pages" — the sources of internal link equity.

3. **Map current link equity flow** — Trace how authority distributes from high-backlink pages through internal links. Identify bottlenecks where authority is trapped (pages with many backlinks but few outgoing internal links).

4. **Detect orphan pages** — Find pages with 0-1 internal links pointing to them. These pages receive no authority and are essentially invisible to Google's crawler. Every orphan page is an action item.

5. **Analyze silo structure** — Group content into topical categories. Evaluate whether internal links stay within silos (supporting topical authority) or scatter randomly. Identify broken silos where related content doesn't interlink.

6. **Map hub/spoke clusters** — For each topic cluster, identify the hub page (pillar content) and spoke pages (supporting subtopics). Verify that every spoke links to the hub and the hub links to every spoke.

7. **Audit anchor text** — Evaluate internal link anchor text. Flag: generic anchors ("click here," "read more," "learn more"), over-optimized exact-match anchors, and anchors that don't describe the target page's topic.

8. **Identify priority targets** — From the client's keyword strategy, identify which pages need the most ranking improvement. These become the targets for new internal links from authority pages.

9. **Generate recommendations** — Produce a specific, page-by-page action list: add link FROM [authority page URL] TO [target page URL] with suggested anchor text [descriptive phrase].

10. **Create ongoing monitoring plan** — Internal linking isn't one-time. Every new page needs links. Every new backlink changes the authority map. Set up quarterly re-audits.

---

## Critical Patterns

### 1. Link FROM High-Authority Pages TO Priority Targets
**WHEN:** Building internal link recommendations.
**HOW:** Identify the site's top 10-20 pages by external backlink count. Add contextual internal links from these pages to the pages the client most wants to rank. Use descriptive anchor text matching the target page's primary keyword theme.
**WHY:** Link equity flows from pages with backlinks through internal links to connected pages. This is the core mechanism of internal linking strategy.
**DON'T:** Link randomly or from low-authority pages. The source page's authority determines the equity transferred.

### 2. Orphan Pages Must Be Eliminated
**WHEN:** Running the site crawl analysis.
**HOW:** Flag every page with 0-1 internal links pointing to it. Categorize: should this page exist? If yes, add 3-5 internal links from topically related pages. If no, consider consolidating, redirecting, or removing.
**WHY:** Orphan pages receive no crawl priority and no link equity. Google may not even index them. They represent wasted content investment.
**DON'T:** Just add orphan pages to the sitemap and call it fixed. Sitemap inclusion doesn't replace internal links.

### 3. Silo Structure Groups Content for Topical Authority
**WHEN:** Evaluating the site's content architecture.
**HOW:** Group all content into topical silos (e.g., "Technical SEO," "Content Strategy," "Local SEO"). Internal links within a silo should be dense — every piece of content in a silo should link to 2-3 other pieces in the same silo. Cross-silo links should be intentional and limited.
**WHY:** When multiple pages cover related subtopics and link together, Google sees expertise. Silo structure is how you demonstrate topical authority at the site level.
**DON'T:** Create silos so rigid that naturally related cross-topic content can't link. Silos guide structure, not restrict it.

### 4. Hub/Spoke Architecture Within Topic Clusters
**WHEN:** Structuring content clusters.
**HOW:** Each cluster has one hub (pillar page — comprehensive coverage of the broad topic) and 5-15 spokes (subtopic pages covering specific aspects). Every spoke links to the hub. The hub links to every spoke. Spokes link to 2-3 related spokes.
**WHY:** Hub/spoke concentrates link equity on the pillar page while distributing it to supporting content. Google's crawler follows the structure to understand topic hierarchy.
**DON'T:** Create hub pages that just list links. The hub must be substantive content that deserves to rank on its own.

### 5. Descriptive Anchor Text — Never Generic
**WHEN:** Writing or recommending any internal link.
**HOW:** Anchor text should describe what the target page is about. "Our technical SEO audit checklist" is descriptive. "Click here" is generic. "Technical SEO audit" as exact-match keyword anchor is over-optimized.
**WHY:** Internal anchor text is a direct signal to Google about the target page's topic. Descriptive anchors reinforce topical relevance. Generic anchors waste the signal.
**DON'T:** Use "click here," "read more," "learn more," or naked URLs as internal anchors. Also avoid exact-match keyword stuffing — natural descriptive phrases perform best.

### 6. Link Equity Flow Must Be Intentional
**WHEN:** Designing the internal link architecture.
**HOW:** Visualize the site as a directed graph. Authority enters through pages with backlinks. Internal links distribute that authority. Every link from a page divides that page's equity among all outgoing links. Fewer outgoing links = more equity per link.
**WHY:** Pages with 100 outgoing links pass 1/100th of their equity per link. Pages with 5 outgoing links pass 1/5th. Strategic restraint in outgoing links concentrates equity where it matters.
**DON'T:** Add internal links indiscriminately. Every link is a distribution decision. Link to priority targets, not to everything.

### 7. Navigation Links Count but Content Links Are Stronger
**WHEN:** Evaluating where internal links are placed.
**HOW:** Distinguish between navigation links (header, footer, sidebar — present on every page) and contextual content links (within article body). Both pass equity, but contextual links pass more because they're surrounded by relevant content.
**WHY:** Google weights contextual links higher because the surrounding text provides topical context for the link relationship.
**DON'T:** Rely solely on navigation links. A page linked from the nav but never from content body is missing the strongest internal link signal.

### 8. New Content Needs Immediate Internal Links
**WHEN:** Any new page is published.
**HOW:** Before publishing, identify 3-5 existing pages that should link to the new page and 2-3 existing pages the new page should link to. Add these links at publication time, not as an afterthought.
**WHY:** New pages without internal links are orphans from day one. They get minimal crawl priority and zero link equity until linked.
**DON'T:** Publish content and "plan to add internal links later." Later rarely happens. Build linking into the publishing workflow.

### 9. Deep Pages Need Link Bridges
**WHEN:** Identifying pages more than 3 clicks from the homepage.
**HOW:** Pages 4+ clicks deep receive significantly less crawl frequency and link equity. If they're important, create direct links from higher-level pages to reduce click depth.
**WHY:** Google's crawler prioritizes pages closer to the homepage. Each click level reduces crawl frequency and equity flow.
**DON'T:** Flatten the entire site to 2 clicks deep. Use click depth strategically — not every page deserves homepage proximity.

### 10. Quarterly Re-Audits Are Non-Negotiable
**WHEN:** After completing the initial internal link optimization.
**HOW:** Every quarter: re-crawl the site, check for new orphan pages, verify that new content has been integrated into the linking structure, and update authority page rankings based on new backlinks.
**WHY:** Sites are living entities. New content, changed content, and new backlinks constantly shift the optimal internal link architecture.
**DON'T:** Treat internal linking as a one-time project. The first audit fixes the backlog; quarterly audits maintain the system.

---

## Data Sources

| Source | What It Provides | Integration |
|--------|-----------------|-------------|
| BFS Crawler | Complete internal link map, orphan detection, click depth | `crawlSite()` with internal link extraction |
| Link Analysis | External backlink data for authority page identification | `link_analysis_report` output |
| Site Scraper | Page content for anchor text analysis | `scrapeUrl()` |
| `client_seo_context` | Priority keywords, target pages | Supabase `client_seo_context` table |
| GSC (OAuth) | Indexed pages, crawl stats | `fetchGSCData()` via client integration |
| Keyword Research | Priority ranking targets | `keyword_research_report` output |

---

## Output Structure

```json
{
  "internal_link_health_score": 0-100,
  "site_summary": {
    "total_pages_crawled": 0,
    "total_internal_links": 0,
    "avg_internal_links_per_page": 0,
    "orphan_pages": 0,
    "max_click_depth": 0,
    "pages_at_depth_4_plus": 0
  },
  "authority_pages": [
    { "url": "...", "referring_domains": 0, "outgoing_internal_links": 0, "equity_distribution_status": "underutilized|balanced|over-linked" }
  ],
  "orphan_pages": [
    { "url": "...", "internal_links_to": 0, "recommendation": "link|consolidate|redirect|remove", "suggested_link_sources": ["..."] }
  ],
  "silo_analysis": [
    { "silo_name": "...", "page_count": 0, "internal_link_density": "low|medium|high", "cross_silo_leakage": 0, "recommendations": [] }
  ],
  "hub_spoke_clusters": [
    { "hub_url": "...", "spoke_urls": ["..."], "missing_hub_to_spoke": ["..."], "missing_spoke_to_hub": ["..."], "recommendations": [] }
  ],
  "anchor_text_audit": {
    "generic_anchors_count": 0,
    "generic_anchors_list": [{ "source": "...", "target": "...", "current_anchor": "click here", "suggested_anchor": "..." }],
    "over_optimized_count": 0,
    "descriptive_count": 0
  },
  "priority_link_recommendations": [
    { "priority": 1, "from_url": "...", "to_url": "...", "suggested_anchor": "...", "rationale": "...", "expected_impact": "high|medium" }
  ],
  "link_equity_flow": {
    "top_equity_sources": ["..."],
    "equity_bottlenecks": ["..."],
    "underserved_targets": ["..."]
  }
}
```

---

## Quality Gate

- [ ] Full site crawl completed with all internal links mapped
- [ ] Authority pages identified by cross-referencing external backlink data
- [ ] Every orphan page (0-1 internal links) flagged with specific action
- [ ] Silo structure analyzed with cross-silo leakage measured
- [ ] Hub/spoke clusters mapped with missing links identified
- [ ] Anchor text audit flags all generic anchors with replacement suggestions
- [ ] Priority recommendations specify exact FROM/TO URLs with suggested anchors
- [ ] Click depth analysis identifies pages 4+ levels deep
- [ ] Link equity flow traced from authority pages through to priority targets
- [ ] Recommendations sorted by expected ranking impact
- [ ] No recommendation links to noindex or redirected pages
- [ ] Quarterly re-audit schedule established

---

## Cross-Service Connections

| Connected Service | Data Direction | What Flows |
|-------------------|---------------|------------|
| `link_analysis` | External backlink data → authority page identification | Referring domain counts per page → internal link source priority |
| `content_brief` | Internal link targets → content planning | Pages needing links → new content opportunities |
| `content_article` | Internal linking requirements → article writing | Required internal links included in every article spec |
| `site_audit` | Crawl data → internal link analysis | Site structure, redirects, orphan detection |
| `outreach` | New backlinks → authority page updates | Newly earned backlinks change which pages are authority sources |
| `keyword_research` | Priority keywords → target page identification | Target pages for internal link equity distribution |
| `monthly_report` | Internal link metrics → monthly tracking | Orphan count, avg links per page, equity flow changes |

---

## Concrete Examples

### Sample Link Recommendations (FROM → TO → ANCHOR → RATIONALE)

| # | FROM (Authority Page) | TO (Priority Target) | Suggested Anchor Text | Rationale |
|---|---|---|---|---|
| 1 | `/blog/complete-guide-to-local-seo` (47 referring domains) | `/services/local-seo-audit` | "our local SEO audit process" | Highest-authority blog post → primary commercial page. Moves link equity from informational content to conversion page. Place in the "How to Audit Your Local Presence" section. |
| 2 | `/blog/google-business-profile-optimization` (31 referring domains) | `/blog/review-management-strategy` | "building a review management strategy" | Both pages are in the Local SEO silo. The GBP post mentions reviews in passing but doesn't link to the deep-dive. Place after the paragraph discussing review signals. |
| 3 | `/resources/seo-checklist-2026` (62 referring domains) | `/blog/technical-seo-crawl-errors` | "identifying and fixing crawl errors" | The checklist is the site's top authority page but has only 3 outgoing internal links — equity is bottlenecked. The crawl errors post ranks #8 and needs equity to push to top 5. Place in the "Technical SEO" checklist section. |
| 4 | `/blog/content-marketing-roi-study` (28 referring domains) | `/services/content-strategy` | "our content strategy methodology" | Data study → commercial service page. Natural bridge: the study proves the value, the service page converts the reader. Place in the conclusion section. |
| 5 | `/blog/backlink-building-guide` (38 referring domains) | `/blog/anchor-text-best-practices` | "how to choose safe anchor text ratios" | Spoke-to-spoke link within the Link Building cluster. The backlink guide covers outreach but doesn't connect to anchor strategy. Strengthens cluster density. Place in the "What Makes a Good Link" section. |

---

### Sample Equity Flow Analysis — Bottleneck Identification and Resolution

**Scenario:** The site's homepage has 210 referring domains, and the blog post `/blog/complete-guide-to-local-seo` has 47 referring domains. But the priority commercial page `/services/local-seo-audit` has only 3 referring domains and ranks on page 2 for "local SEO audit."

**Current equity flow (BOTTLENECK):**
```
Homepage (210 RDs) → Nav link → /services/ → Nav link → /services/local-seo-audit
                                                          (3 internal links, depth: 3 clicks)

/blog/complete-guide-to-local-seo (47 RDs) → 0 links to /services/local-seo-audit
                                              (equity trapped — no path to commercial page)
```

**Problem:** The blog post with 47 referring domains has ZERO internal links to the commercial page. All that authority is trapped. The commercial page is only reachable via navigation (3 clicks deep), receiving diluted equity from 200+ nav links.

**Resolution — after adding strategic internal links:**
```
Homepage (210 RDs) → Nav link → /services/local-seo-audit
                   → Body link in "Our Services" section → /services/local-seo-audit

/blog/complete-guide-to-local-seo (47 RDs) → Body link: "our local SEO audit process"
                                              → /services/local-seo-audit
                                              (equity now flows directly)

/blog/google-business-profile-optimization (31 RDs) → Body link: "a comprehensive local SEO audit"
                                                      → /services/local-seo-audit
```

**Expected impact:** The commercial page now receives direct equity from 3 authority pages totaling 288 referring domains, reducing click depth from 3 to 1-2 and significantly boosting ranking potential for "local SEO audit."

---

### Good vs. Bad Anchor Text — Internal Links

| Scenario | BAD Anchor | Why It's Bad | GOOD Anchor | Why It's Good |
|---|---|---|---|---|
| Linking to a local SEO audit page | "click here" | Zero topical signal; wastes the relevance opportunity entirely | "our local SEO audit process" | Describes the target page's topic; includes the keyword theme naturally |
| Linking to a review management guide | "read more" | Generic; tells Google nothing about the target content | "building a review management strategy" | Descriptive phrase that matches the target page's primary topic |
| Linking to a technical SEO page | "this article" | Vague; could point to anything | "identifying and fixing crawl errors" | Specific to the content the reader will find at the destination |
| Linking to a content strategy service page | "learn more about our services" | Generic CTA; no keyword relevance signal | "our content strategy methodology" | Tells both the reader and Google what the linked page covers |
| Linking to an anchor text guide | "local SEO anchor text strategy best practices guide" | Over-optimized exact-match keyword stuffing | "how to choose safe anchor text ratios" | Natural phrase that includes the keyword theme without forcing it |
| Linking to homepage | `https://www.example.com` | Naked URL; no descriptive value | "Example Agency" | Branded anchor for homepage links is natural and appropriate |

**Rule of thumb:** Read the anchor text out loud. If it sounds like something a human would naturally say in conversation to describe that page, it's good. If it sounds like a search query or a robot wrote it, rewrite it.

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|---|---|---|
| Adding 50 internal links to a single page | Dilutes equity per link; looks spammy; hurts readability | 3-8 contextual internal links per page, placed naturally in content |
| Using "click here" or "read more" as anchor text | Wastes Google's topical signal; provides no context about the target page | Use descriptive phrases that indicate the target page's topic |
| Linking only from navigation menus | Navigation links are site-wide and diluted across every page | Add contextual content links that carry topical relevance |
| Ignoring orphan pages because "they'll get linked eventually" | Orphan pages accumulate; each one is wasted content investment | Fix orphans at discovery; build linking into the publishing workflow |
| Building perfect silos with zero cross-silo links | Prevents natural topical relationships from being expressed | Allow intentional cross-silo links where topics genuinely relate |
| Linking new content only TO existing content, not FROM it | New content gets equity but existing priority pages miss the new linking opportunity | Bidirectional linking: new pages link to AND get linked from existing pages |
| Treating internal linking as a one-time cleanup | Sites change constantly; new content creates new orphans and opportunities | Quarterly re-audits with automated orphan detection |
| Exact-match keyword stuffing in internal anchors | Over-optimization signal; Google demotes pages with manipulated internal anchors | Use natural descriptive phrases that include the keyword theme |
