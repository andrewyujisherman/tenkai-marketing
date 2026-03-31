# Topic Clusters — Agent Reference (Ryo / topic_cluster_map)

## What This Produces
A topic cluster architecture document that maps pillar pages, cluster content, and interlinking structure — built from keyword data and SERP overlap analysis — designed to establish topical authority with Google and create a defensible content moat around core business topics.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **SERP-overlap clustering, not intuition.** Keywords are grouped because the same pages rank for them (60%+ top-10 overlap), not because they "seem related." This is the methodology Keyword Insights, Semrush, and premium agencies use.
- **Pillar pages with genuine depth.** 2,500-5,000 words covering the full breadth of the topic. Not a thin overview that links out — a comprehensive resource that could stand alone as the definitive guide.
- **Deliberate interlinking architecture.** Every cluster page links to the pillar. The pillar links to every cluster page. Cluster pages cross-link where relevant. This isn't decoration — it's the mechanism that signals topical authority.
- **Gap analysis at the cluster level.** Comparing the client's cluster coverage against competitors to find entire subtopic areas that are missing — not just individual keyword gaps.
- **Prioritized build order.** Which clusters to build first based on business impact, existing content assets, keyword opportunity, and competitive difficulty.

## Build Process (Ordered Steps)

1. **Ingest keyword research.** Pull the full keyword dataset from keyword research: all target keywords with volume, difficulty, intent classification. If SERP data is available, include the top 10 ranking URLs per keyword.

2. **Perform SERP-overlap clustering.** Group keywords where 60%+ of the top 10 results overlap. If two keywords show the same pages ranking, one piece of content can target both — they belong in the same cluster. If SERP data is not available, use semantic clustering as fallback (NLP topic similarity), but flag that SERP validation is needed.

3. **Identify pillar topics.** From each cluster, identify the broadest keyword — the one with the highest volume and the most general intent. This becomes the pillar page topic. Pillar keywords are typically 1-2 word head terms or broad informational queries.

4. **Map cluster subtopics.** Within each cluster, identify 8-15 specific subtopics that support the pillar. Each subtopic targets a more specific keyword (long-tail). Each becomes a standalone article. Subtopics should cover:
   - Definitions and overviews
   - How-to and procedural guides
   - Comparison and "vs." articles
   - Tool and resource roundups
   - Real-world examples and case studies
   - Common mistakes and myths
   - Advanced techniques and strategies

5. **Audit existing content.** Check which cluster subtopics the client already covers with existing pages. Categorize:
   - Existing content that's strong — link it into the cluster
   - Existing content that's thin — schedule for expansion/rewrite
   - Missing subtopics — schedule for creation

6. **Design interlinking architecture.** For each cluster: define pillar → cluster links (pillar must link to every cluster page), cluster → pillar links (every cluster page links back to pillar), cluster → cluster cross-links (where subtopics naturally reference each other). Specify anchor text recommendations for each link.

7. **Perform competitor cluster analysis.** For the client's top 3 competitors: map their cluster coverage on the same topics. Identify:
   - Clusters where competitors have depth and client doesn't (threats)
   - Subtopics competitors miss (opportunities)
   - Cluster topics no competitor covers well (blue ocean)

8. **Prioritize cluster build order.** Score each cluster: business alignment (does it map to a revenue page?), keyword opportunity (total addressable search volume), competitive gap (can we win?), existing asset leverage (how much content do we already have?). Build highest-scoring clusters first.

9. **Define pillar page specifications.** For each pillar: target word count (2,500-5,000), H2 structure covering all subtopics at overview level, FAQ section addressing common questions, internal link targets to every cluster page, schema recommendation (typically Article or comprehensive guide format).

10. **Compile cluster map.** Per Output Structure below, with visual cluster diagram and detailed specs per cluster.

## Critical Patterns

### 1. SERP-Overlap Clustering Methodology
**WHEN:** Grouping keywords into clusters — always prefer SERP-based over purely semantic clustering.
**HOW:** For any two keywords, pull the top 10 ranking URLs for each. Count how many URLs appear in both top-10 lists. If 6+ of 10 overlap (60%+), the keywords belong in the same cluster and can be targeted by a single page. If 3-5 overlap (30-59%), they're related but may need separate pages. If 0-2 overlap (< 30%), they definitely need separate pages.
**WHY:** SERP overlap tells you what Google considers the same topic. Two keywords that look similar semantically ("content marketing strategy" vs. "content marketing plan") may have completely different SERPs — meaning Google sees them as different intents requiring different content. Conversely, "SEO audit" and "website SEO analysis" may have 80% overlap — one page handles both.
**DON'T:** Cluster purely by semantic similarity without SERP validation. Two keywords can be semantically identical but have different SERPs (different intent). Don't assume related keywords belong on the same page — let SERP data decide.

### 2. Pillar Page Specifications
**WHEN:** Defining the central pillar page for each topic cluster.
**HOW:** Word count: 2,500-5,000 words. Structure: H1 is the pillar topic, H2s preview each subtopic (overview level, not exhaustive), each H2 section links to the corresponding cluster page for full depth. Include: definition/overview section, comprehensive coverage of the topic's breadth (not depth — cluster pages go deep), FAQ section targeting PAA questions, comparison or overview table if applicable, schema markup (Article type). The pillar should be THE resource a reader would bookmark on the topic.
**WHY:** Pillar pages are the authority anchor. Google sees that a single URL covers the broad topic AND links to detailed sub-content, signaling comprehensive expertise. A well-built pillar page can rank for 100+ long-tail variations because it covers the full semantic territory.
**DON'T:** Make pillar pages thin overviews (under 2,000 words). Don't go deep on any single subtopic in the pillar — that's what cluster pages do. Don't create pillar pages without linking to cluster content — an orphaned pillar has no structural advantage.

### 3. Cluster Size and Scope
**WHEN:** Determining how many cluster pages to build per pillar.
**HOW:** Target 8-15 cluster pages per pillar. Minimum viable cluster: 5 pages (pillar + 4 cluster pages) — below this, topical authority signal is too weak. Maximum practical cluster: 20 pages — beyond this, split into two related clusters with their own pillars. Each cluster page should target 1-3 keywords from the SERP-overlap group.
**WHY:** A cluster of 3 pages doesn't provide enough internal linking density or topical coverage to move rankings. A cluster of 30 becomes unwieldy and dilutes link equity across too many pages. 8-15 is the sweet spot where each page reinforces the others without spreading too thin.
**DON'T:** Build clusters of 3 pages and expect topical authority benefits. Don't build 25-page mega-clusters — split them. Don't count existing pages that are off-topic just to inflate cluster size.

### 4. Interlinking Rules
**WHEN:** Defining the link architecture within and between clusters.
**HOW:** Three mandatory link types per cluster:
- **Pillar → Cluster:** The pillar page MUST link to every cluster page. Use descriptive anchor text that includes the cluster page's target keyword. Place links within the relevant H2 section of the pillar, not in a list at the bottom.
- **Cluster → Pillar:** Every cluster page MUST link back to the pillar page. Place within the first 300 words (contextual body link) using the pillar's target keyword or a natural variation.
- **Cluster ↔ Cluster:** Cluster pages cross-link to other cluster pages where the content naturally references the other subtopic. Not every cluster page links to every other — only where relevant (typically 2-4 cross-links per cluster page).
**WHY:** This linking structure creates a PageRank loop: authority flows from pillar to clusters, clusters link back to reinforce the pillar, and cross-links distribute authority laterally. Google crawls these connections and interprets them as comprehensive topical coverage. One high-performing cluster page elevates rankings for all pages in the cluster via this mechanism.
**DON'T:** Use "click here" or "read more" as anchor text — descriptive anchors pass topical relevance signals. Don't put all links in a "Related Articles" section — body links within relevant context carry more weight. Don't create one-way links (cluster → pillar but no pillar → cluster) — the structure must be bidirectional.

### 5. Content Gap Analysis at Cluster Level
**WHEN:** Comparing the client's topic cluster coverage against competitors.
**HOW:** For each target cluster topic: map the client's existing content coverage (which subtopics are covered, at what depth), map the top 3 competitors' coverage on the same topic. Identify three categories:
- **Table stakes:** Subtopics ALL top competitors cover. Client must cover these to compete.
- **Differentiation opportunities:** Subtopics some competitors cover but not all. Easier wins.
- **Blue ocean:** Subtopics NO competitor covers well. First-mover advantage — highest ROI for content investment.
**WHY:** Building a cluster in a vacuum ignores competitive reality. If every competitor has 15 articles on "content marketing" and you publish 3, topical authority is insufficient. If no competitor has a cluster on "AI content optimization," building one first creates a defensible position.
**DON'T:** Only look at keyword gaps — look at structural gaps. A competitor may rank for a keyword with a thin page inside a weak cluster. That's an opportunity to build a stronger cluster and outrank them across the entire topic. Don't ignore competitors' thin clusters — they're your biggest opportunity.

### 6. Cluster Prioritization and Build Order
**WHEN:** Deciding which cluster to build first — resources are always limited.
**HOW:** Score each cluster on four dimensions (each 1-5):
- **Business alignment:** Does the cluster map to a revenue-generating service/product? (5 = core offering, 1 = tangentially related)
- **Keyword opportunity:** Total addressable search volume across all cluster keywords, adjusted for difficulty. (5 = high volume + achievable difficulty, 1 = low volume or unreachable difficulty)
- **Existing asset leverage:** How much content does the client already have that can be incorporated? (5 = 50%+ of cluster pages exist, 1 = starting from zero)
- **Competitive gap:** How well do competitors cover this cluster? (5 = no competitor has a strong cluster, 1 = all competitors have deep coverage)
Build clusters with the highest composite score first.
**WHY:** Building the highest-scoring cluster first maximizes ROI on content investment. A cluster where the client already has 60% of the content, competitors are weak, and the topic maps to core revenue is a faster win than building from scratch in a saturated topic.
**DON'T:** Build the "most interesting" cluster first. Don't start multiple clusters simultaneously — finish one before starting the next (see content calendar integration). Don't ignore existing content that could be restructured into a cluster.

### 7. Keyword Cannibalization Resolution
**WHEN:** Two or more existing pages target the same primary keyword, splitting ranking signals.
**HOW:** Identify cannibalization: check GSC for keywords where multiple client URLs appear in search results. For each cannibalization case: (a) if one page is clearly stronger, consolidate by redirecting the weaker page to the stronger one and merging the best content, (b) if both are valuable, differentiate their target keywords (one targets the head term, the other targets a long-tail variant), (c) if neither ranks well, merge into a single comprehensive page on the canonical URL.
**WHY:** Cannibalization splits PageRank, confuses Google on which page to rank, and typically results in both pages ranking worse than either would alone. Resolving cannibalization is one of the highest-ROI activities in content strategy.
**DON'T:** Ignore cannibalization and just publish more content on the same topic. Don't delete the lower-ranking page without redirecting it (lose its backlinks). Don't assume two pages on similar topics are always cannibalizing — check SERP overlap first.

### 8. Hub-and-Spoke Visual Architecture
**WHEN:** Presenting the cluster map to the client or using it for implementation planning.
**HOW:** Create a visual diagram for each cluster: pillar page at center (hub), cluster pages around it (spokes), with arrows showing link direction. Color-code pages by status: green = exists and is strong, yellow = exists but needs improvement, red = missing (to be created). Include keyword and estimated volume on each node.
**WHY:** Visual cluster maps communicate the strategy instantly. Clients understand a diagram in 30 seconds; they won't read a 5-page text description. The visual also makes implementation tracking simple — color-code progress as pages are created/updated.
**DON'T:** Present clusters as spreadsheet-only deliverables. The visual is essential for client buy-in and team alignment. Don't create the visual without the underlying data (keyword targets, link specs) — it's both a communication tool AND a technical blueprint.

### 9. Cluster Content Type Diversity
**WHEN:** Planning the 8-15 articles within a cluster — they shouldn't all be the same format.
**HOW:** A well-structured cluster includes a mix: 1 pillar page (comprehensive guide), 2-3 how-to articles (procedural), 1-2 comparison/vs. articles (commercial investigation), 1-2 listicles (best X, top X), 1 case study or example-driven piece (E-E-A-T experience), 1 data/statistics roundup (high AI citation potential), 1 common mistakes/myths article (engagement driver). Assign format based on keyword intent and SERP format analysis.
**WHY:** Diverse content types cover more search intents within the same topic, attract different types of engagement (and backlinks), and signal to Google that the site covers the topic from multiple angles. A cluster of 10 how-to articles is less authoritative than a cluster with varied perspectives.
**DON'T:** Default every cluster page to "blog post" format. Don't create multiple articles of the same format targeting nearly identical keywords — that's cannibalization waiting to happen.

### 10. Cross-Cluster Linking Strategy
**WHEN:** The client has multiple topic clusters — they shouldn't be completely isolated from each other.
**HOW:** Identify natural connection points between clusters. Example: a "Content Marketing" cluster and an "SEO" cluster naturally connect on topics like "content optimization for search" or "keyword research for content planning." Create bridge links between clusters where subtopics genuinely overlap — not forced, only where a reader would benefit from the cross-reference. Limit cross-cluster links to 1-2 per page (cluster-internal links should dominate). If two clusters have 5+ natural connection points, consider whether they should be one larger cluster.
**WHY:** Completely isolated clusters miss opportunities to distribute authority across the site. A strong cluster on Topic A can boost a newer cluster on Topic B through strategic bridge links. This mirrors how real expertise works — topics are interconnected, not siloed.
**DON'T:** Link between clusters indiscriminately — each cross-cluster link slightly dilutes the topical focus of the source cluster. Don't force connections where none exist naturally. Don't use cross-cluster links as a substitute for completing cluster-internal linking first.

### 11. Topical Authority Measurement
**WHEN:** Evaluating whether a cluster is actually building authority and driving results.
**HOW:** Track per cluster over time: (a) average ranking position across all cluster keywords, (b) total organic traffic to all cluster pages, (c) number of cluster keywords ranking in top 10 vs. top 20 vs. not ranking, (d) pillar page's ranking position for the head term, (e) impressions growth across the cluster (leading indicator). Topical authority is building when: new cluster pages rank faster than standalone content, the pillar page ranks for increasingly competitive terms, and existing cluster pages improve without direct updates (lifted by new cluster additions).
**WHY:** Without measurement, you can't prove clusters work or identify which clusters need more investment. The compound effect of clusters is the core value proposition — new pages should rank faster because the cluster already has authority. If this isn't happening, the cluster structure or interlinking has a problem.
**DON'T:** Measure only the pillar page. The whole point of clusters is aggregate authority — measure at the cluster level. Don't expect immediate results — topical authority compounds over 3-6 months as Google recrawls and reprocesses the interlinking structure.

### 12. Cluster Refresh and Maintenance Lifecycle
**WHEN:** An existing cluster is complete but aging — individual pages may need updates over time.
**HOW:** Treat the cluster as a unit for maintenance planning. When any cluster page decays (traffic decline, CTR drop): first check if the issue is page-specific or cluster-wide. Cluster-wide decay (multiple pages declining simultaneously) suggests a competitor built a stronger cluster or intent shifted across the topic. Page-specific decay is handled with the standard refresh/rewrite triage. Schedule cluster-level reviews quarterly: are all interlinks still working? Have new subtopics emerged that should be added? Are there new competitors in this topic space? Refresh the pillar page at minimum annually — it's the authority anchor and must stay comprehensive.
**WHY:** Clusters are living structures, not one-time builds. A cluster completed 12 months ago with no updates is losing ground to actively maintained competitor clusters. The pillar page especially must reflect current state — if it references outdated information, the entire cluster's authority signal weakens.
**DON'T:** Set and forget completed clusters. Don't only refresh individual pages without checking the cluster structure. Don't let broken interlinks persist — a cluster with broken internal links loses its structural authority advantage.

## Data Sources

| Source | What It Provides | Access Method |
|--------|-----------------|---------------|
| Keyword Research | Full keyword dataset with volume, difficulty, intent, SERP URLs | Internal — from `keyword_research` service |
| Serper API | Top 10 SERP results per keyword for overlap analysis | API call — always available |
| Google Search Console | Existing keyword rankings, cannibalization detection, URL performance | OAuth — only when client connects |
| Competitor Analysis | Competitor content maps, topic coverage, cluster structures | Internal — from `competitor_analysis` service |
| BFS Crawler | Client's existing content inventory, internal link graph | Internal — from `site_audit` service |
| Content Decay Audit | Existing pages needing refresh/rewrite, reusable within clusters | Internal — from `content_decay_audit` service |

## Output Structure

The final deliverable MUST contain these sections in this order:

1. **Cluster Strategy Summary** — Total clusters mapped, total content pieces across all clusters, existing content that fits into clusters, new content needed, estimated build timeline at client's publishing cadence.
2. **Cluster Priority Ranking** — Each cluster scored and ranked: cluster topic, business alignment score, keyword opportunity score, existing asset score, competitive gap score, composite score. Build order defined.
3. **Per-Cluster Map** — For each cluster:
   - Visual hub-and-spoke diagram (or text equivalent with clear structure)
   - Pillar page: topic, target keyword, estimated volume, word count target, H2 outline
   - Cluster pages (8-15): subtopic, target keyword(s), estimated volume, content type/format, status (exists/needs update/to create)
   - Interlinking spec: pillar → cluster links, cluster → pillar links, cluster ↔ cluster cross-links with recommended anchor text
4. **Content Gap Analysis** — Per cluster: table stakes subtopics (all competitors cover), differentiation opportunities (some cover), blue ocean subtopics (none cover well).
5. **Cannibalization Report** — Any existing pages competing for the same keywords, with resolution recommendations (consolidate, differentiate, or merge).
6. **Implementation Roadmap** — Which cluster to build first, week-by-week content creation sequence, internal link implementation schedule, estimated time to cluster completion at current cadence.

## Quality Gate

Before delivering to the client, verify ALL of the following:

- [ ] Clusters are based on SERP overlap data (60%+ threshold) — or explicitly flagged as semantic-only pending validation
- [ ] Every cluster has 8-15 subtopic pages defined (minimum 5 for small clusters)
- [ ] Every pillar page spec includes 2,500-5,000 word target with H2 outline
- [ ] Interlinking rules are fully specified: pillar ↔ cluster bidirectional, cluster cross-links where relevant
- [ ] Each cluster page has a defined content type/format (not all "blog post")
- [ ] Existing content is audited and mapped into clusters where applicable
- [ ] Competitor cluster coverage is analyzed with gap categories (table stakes, differentiation, blue ocean)
- [ ] Clusters are prioritized with composite scores and build order is defined
- [ ] Cannibalization is identified and resolved with specific recommendations
- [ ] Build timeline is realistic given client's publishing cadence
- [ ] Visual cluster diagram or clear structural representation is included

## Cross-Service Connections

- **Receives from:**
  - `keyword_research` (Haruki) — full keyword dataset with volumes, difficulty, intent, SERP overlap data for clustering
  - `competitor_analysis` (Haruki) — competitor content maps and topic coverage for gap analysis
  - `site_audit` (Haruki) — existing content inventory, internal link graph, thin content identification
  - `content_decay_audit` (Yumi) — existing pages that can be refreshed/rewritten to fit cluster structure
  - Client onboarding — business priorities, core service/product areas for business alignment scoring
- **Sends to:**
  - `content_calendar` (Ryo) — cluster build schedule, prioritized content queue with cluster assignments
  - `content_brief` (Sakura) — per-article specs: target keyword, cluster context, pillar page URL, interlinking targets, content type/format
  - `content_article` (Sakura) — pillar page specifications and cluster page specs for production
  - `on_page_audit` (Mika) — interlinking requirements for existing pages being added to clusters
  - `monthly_report` — cluster completion status, topical authority metrics

**Data fields that transfer:**
- `clusters[]` — `{cluster_id, pillar_topic, pillar_keyword, cluster_pages[], build_priority, status}`
- `cluster_pages[]` — `{subtopic, target_keywords[], content_type, status, pillar_id, cross_links[]}`
- `interlinks[]` — `{source_url, target_url, anchor_text, link_type (pillar_to_cluster|cluster_to_pillar|cross_link)}`
- `gaps[]` — `{cluster_id, subtopic, gap_type (table_stakes|differentiation|blue_ocean), competitor_coverage}`

## Output Examples

### Good Example: Cluster Map (Pillar + 10 Cluster Pages)

> **Cluster: "Email Marketing" — Priority Score: 4.2/5**
>
> **Pillar Page:** The Complete Guide to Email Marketing (2026)
> - Target keyword: "email marketing guide" (18,200/mo)
> - Word count: 4,000-5,000 words
> - Status: TO CREATE
>
> | # | Subtopic | Target Keyword(s) | Volume | Type | Status | SERP Overlap w/ Pillar |
> |---|----------|-------------------|--------|------|--------|----------------------|
> | 1 | How to Build an Email List From Scratch | how to build email list | 6,600/mo | How-to | TO CREATE | 62% |
> | 2 | Best Email Marketing Platforms Compared | best email marketing software | 12,100/mo | Comparison | EXISTS — needs expansion (1,200 words → 3,000) | 58% |
> | 3 | Email Marketing vs. Social Media Marketing | email marketing vs social media | 2,900/mo | Comparison | TO CREATE | 44% |
> | 4 | Email Subject Line Best Practices (+ 50 Examples) | email subject lines | 8,100/mo | Listicle | TO CREATE | 65% |
> | 5 | Email Segmentation: The Complete Guide | email segmentation | 3,400/mo | How-to | EXISTS — strong, link into cluster | 71% |
> | 6 | Email Marketing ROI Statistics (2026 Data) | email marketing statistics | 4,800/mo | Data roundup | TO CREATE | 55% |
> | 7 | How to Write Marketing Emails That Convert | how to write marketing emails | 2,200/mo | How-to | TO CREATE | 63% |
> | 8 | Email Automation Workflows: 7 Sequences That Work | email automation workflows | 1,900/mo | Listicle + How-to | TO CREATE | 52% |
> | 9 | Email Marketing for Small Business: Getting Started | email marketing small business | 3,100/mo | Guide | EXISTS — thin (600 words), needs rewrite | 68% |
> | 10 | Common Email Marketing Mistakes (And How to Fix Them) | email marketing mistakes | 1,400/mo | Mistakes/myths | TO CREATE | 48% |
>
> **Cluster totals:** Combined volume: 64,700/mo | 3 existing pages (1 strong, 2 need work) | 7 new pages needed
>
> **Build timeline at 2 articles/week:** 5 weeks to complete (including 2 rewrites of existing content)
>
> **Color-coded status:**
> - 🟢 EXISTS — strong: Email Segmentation guide
> - 🟡 EXISTS — needs work: Best Email Marketing Platforms (expand), Email Marketing for Small Business (rewrite)
> - 🔴 TO CREATE: 7 articles

### Bad Example: Cluster Map

> **Email Marketing Cluster:**
>
> Pillar: Email Marketing Guide
>
> Cluster pages:
> - Email list building
> - Email tools
> - Email vs social media
> - Subject lines
> - Segmentation
> - Email statistics
> - Writing emails
> - Automation
> - Small business email
> - Email mistakes

**Why it fails:** No target keywords — "Email tools" is not a keyword, it's a topic. No search volumes, so no way to prioritize. No content types assigned. No status tracking (which pages exist already?). No SERP overlap data to validate the clustering. No word count targets. No build timeline. A content team receiving this has topic ideas but zero execution specifications.

---

### Good Example: Interlinking Diagram

> **Interlinking Architecture — Email Marketing Cluster**
>
> ```
> ┌─────────────────────────────────────────────────────────────────┐
> │                                                                 │
> │              PILLAR: Email Marketing Guide                      │
> │              (email marketing guide — 18,200/mo)                │
> │                                                                 │
> │    Links OUT to all 10 cluster pages (within relevant H2s)     │
> │    All 10 cluster pages link BACK to pillar (first 300 words)  │
> │                                                                 │
> └───┬───┬───┬───┬───┬───┬───┬───┬───┬───────────────────────────┘
>     │   │   │   │   │   │   │   │   │
>     ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼
>    C1  C2  C3  C4  C5  C6  C7  C8  C9  C10
> ```
>
> **Cross-links between cluster pages (where contextually relevant):**
>
> | Source Page | Links To | Anchor Text | Rationale |
> |-----------|----------|-------------|-----------|
> | C1 (Build Email List) | C5 (Segmentation) | "segment your list as it grows" | List building naturally leads to segmentation |
> | C1 (Build Email List) | C2 (Best Platforms) | "choose an email marketing platform" | Need a platform to collect emails |
> | C2 (Best Platforms) | C8 (Automation Workflows) | "automation capabilities" | Platform comparison should reference automation |
> | C4 (Subject Lines) | C7 (Writing Emails) | "email copywriting best practices" | Subject lines are part of the writing process |
> | C6 (Statistics) | C3 (Email vs Social) | "email delivers 36x ROI compared to social" | Stats page provides evidence for the comparison |
> | C7 (Writing Emails) | C4 (Subject Lines) | "craft a compelling subject line" | Writing process includes subject lines |
> | C8 (Automation) | C5 (Segmentation) | "segment-based automation triggers" | Automation depends on segmentation |
> | C9 (Small Business) | C1 (Build Email List) | "start building your email list" | Small biz guide references list building |
> | C10 (Mistakes) | C5 (Segmentation) | "not segmenting your audience" | #1 mistake is no segmentation |
>
> **Total internal links in cluster:** 10 pillar→cluster + 10 cluster→pillar + 9 cross-links = **29 internal links**

### Bad Example: Interlinking Diagram

> **Internal Links:**
> All cluster pages should link to the pillar page and to each other where relevant. Use descriptive anchor text that includes target keywords. Aim for 3-5 internal links per page.

**Why it fails:** No specific link map — which pages link to which? "Where relevant" leaves the decision to the writer, who doesn't have the keyword strategy context. No anchor text recommendations. No cross-link specifics. "3-5 internal links per page" doesn't distinguish between pillar→cluster, cluster→pillar, and cross-links. Without a concrete link map, each writer will make ad-hoc decisions that don't build the deliberate architecture that drives topical authority.

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| Clustering by "what seems related" | Ignores what Google actually treats as the same topic | Use SERP-overlap clustering (60%+ top-10 overlap = same cluster) |
| 3-page clusters | Insufficient topical authority signal, weak interlinking density | Minimum 5 pages, target 8-15 per cluster |
| Pillar page as a thin 800-word overview | Pillar lacks the depth to serve as a topical anchor | 2,500-5,000 words, comprehensive coverage, links to every cluster page |
| One-way links (cluster → pillar only) | Misses PageRank flow back to cluster pages | Bidirectional: pillar links to all clusters AND clusters link back to pillar |
| Building 5 clusters at once | All clusters stay incomplete — no topical authority benefit from any | Complete one cluster before starting the next |
| All cluster pages are the same format | Misses diverse intent types, looks like content mill | Mix formats: how-to, comparison, listicle, case study, data roundup, mistakes |
| Ignoring existing content | Rebuilds from scratch when reusable assets exist | Audit existing content first. Incorporate, restructure, or redirect into clusters |
| No competitor cluster analysis | Builds in a vacuum, misses threats and opportunities | Map competitor coverage per cluster. Find blue ocean subtopics. |
