# Content Article — Agent Reference (Sakura / content_article)

## What This Produces
A publication-ready SEO article (or a complete rewrite of an existing article) that ranks for target keywords, earns AI citations, converts readers, and demonstrates E-E-A-T signals throughout — structured for both human scanners and machine parsers.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **E-E-A-T woven into every section.** Not bolted on — the article demonstrates experience, expertise, authority, and trust through its structure, voice, citations, and author attribution. First-person experience signals where applicable ("I tested this for 30 days"), citations to primary sources (studies, official docs, not other blog posts), and transparent methodology.
- **Hook in the first 50 words.** The opening must stop the scroll. A stat, a counterintuitive claim, a direct answer to the searcher's question — not a generic introduction. If the reader bounces in 10 seconds, nothing else matters.
- **Fact density for AI citation.** A statistic, data point, or specific claim every 150-200 words. AI engines (Perplexity, Google AI Overviews, ChatGPT) cite content with high factual density. Vague content gets skipped.
- **NLP-optimized against SERP competitors.** Term frequency analysis against the top 10 ranking pages. Cover the semantic topics competitors cover — then go deeper. This is what Surfer/Clearscope measure.
- **8th grade readability.** Flesch-Kincaid Grade Level 8 or below. Short sentences (15-20 words average). Short paragraphs (2-4 sentences). Active voice. No jargon without immediate definition.
- **Structured for AI parseability.** Clear H2/H3 hierarchy, direct answer paragraphs, numbered lists, comparison tables — these are the formats AI engines extract and cite.

## Build Process (Ordered Steps)

1. **Ingest the content brief.** If a content brief exists, pull:
   - Primary keyword and secondary keywords
   - Search intent classification
   - Target word count and audience
   - Angle/differentiator vs. competitors
   - Competitor gaps and SERP features to target
   - Internal link targets from cluster map

2. **Analyze SERP context.** If SERP data is available (from Serper API or content brief): review what the top 3-5 results cover, their word count, heading structure, and content gaps. Identify what they ALL cover (table stakes) and what NONE cover (differentiation opportunity).

3. **Draft the headline (H1).** Include the primary keyword. Front-load the value proposition. Keep under 60 characters for SERP display. Test emotional pull — numbers, "how to," specific outcomes perform best.

4. **Write the meta description.** 150-160 characters. Include primary keyword naturally. Write a compelling reason to click — not a summary, a promise. Include a soft CTA ("Learn how," "Discover why," "See the data").

5. **Write the opening hook (first 50 words).** Start with one of:
   - A surprising statistic
   - A direct answer to the search query
   - A counterintuitive claim backed by evidence
   - A relatable problem statement
   NO generic intros ("In today's digital landscape...").

6. **Build the H2/H3 outline.** H2s are major sections (6-10 per article). H3s are subsections within H2s. Include primary keyword in at least one H2. Include secondary keywords across other H2s naturally. Each H2 should be answerable as a standalone question.

7. **Write body content.** 2-4 sentence paragraphs. One idea per paragraph. Active voice. Concrete language (numbers > adjectives). Transition sentences between sections. Place a statistic or data point every 150-200 words.

8. **Place internal links.** 3-5 contextual internal links per article. Link from relevant anchor text (descriptive, not "click here"). Place in the body, not clustered in one section. Link to:
   - Pillar page (if part of a cluster)
   - Related service/product pages
   - Related blog posts with topical relevance

9. **Optimize images.** Every image needs: descriptive alt text (include keyword where natural, not forced), WebP format, explicit width/height dimensions in HTML, compressed to < 200KB for inline images. Use original images or properly licensed stock. Caption if it adds context.

10. **Add Article JSON-LD schema.** Include: headline, author (name + URL to bio), datePublished, dateModified, description, image, publisher. This signals to both Google and AI engines.

11. **Write the conclusion with CTA.** Summarize key takeaways (3-5 bullets). Include a clear call-to-action relevant to the content. Don't introduce new information in the conclusion.

12. **Add author bio.** Name, credentials relevant to the topic, link to author page. First-person voice. This is a critical E-E-A-T signal.

13. **Final quality pass.** Run through all checks:
    - Readability: target 8th grade Flesch-Kincaid
    - Keyword density: primary keyword 0.5-1.5%
    - Fact density: statistic every 150-200 words, all cited
    - Internal links: 3-5 contextual, distributed across body
    - External links: 3-5 to authoritative primary sources
    - Images: all have alt text, WebP format, explicit dimensions
    - Schema: Article JSON-LD complete and valid
    - Author bio: present with verifiable credentials
    - CTA: conclusion includes relevant call-to-action

## Critical Patterns

### 1. Opening Hook — First 50 Words
**WHEN:** Every article. The opening determines whether the reader stays or bounces. AI engines evaluate relevance primarily on opening content.
**HOW:** Choose one hook type based on search intent:
- **Stat hook:** Lead with a surprising data point. "Only 47% of websites pass Google's Core Web Vitals thresholds — and the other 53% are losing up to 35% of their traffic."
- **Direct answer:** Give the searcher what they came for immediately. "The best time to post on LinkedIn is Tuesday through Thursday, 8-10 AM in your audience's timezone."
- **Counterintuitive claim:** Challenge an assumption with evidence. "Most SEO audits are worthless. They list 500 issues with equal priority, so nothing gets fixed."
- **Problem/pain:** Name the exact frustration. "You published 30 blog posts last quarter and organic traffic didn't move. Here's why."
**WHY:** The first 200 words are what AI engines evaluate for citation relevance. Bounce rate in the first 10 seconds is the strongest negative engagement signal. Google's Helpful Content system penalizes pages with high pogo-sticking.
**DON'T:** Start with "In today's [industry]..." or "As a business owner..." or any throat-clearing. The first sentence must deliver value or provoke curiosity.

**GOOD example:**
> "70% of top-ranking pages were updated within the past 12 months. Your two-year-old blog post isn't just aging — it's actively losing ground to competitors who refresh quarterly. Here's the exact framework for detecting content decay before your rankings collapse."

**BAD example:**
> "Content is king, as they say. In today's digital marketing landscape, it's more important than ever to keep your content fresh and updated. In this comprehensive guide, we'll explore everything you need to know about content decay and how to address it."

### 2. H2/H3 Hierarchy for SEO and AI Parseability
**WHEN:** Every article — heading structure is both an SEO signal and the primary way AI engines parse content sections.
**HOW:** One H1 only (the title). H2s for major sections (6-10 per article). H3s for subsections within an H2. Never skip levels (H2 → H4). Include primary keyword in at least one H2. Use question-format H2s where natural (maps to PAA boxes). Each H2 section should be independently meaningful — AI engines extract individual sections, not full articles.
**WHY:** Google uses heading hierarchy to understand content structure and topic coverage. AI engines use H2/H3 to identify discrete answer blocks for citation. PAA-formatted headings increase the chance of appearing in People Also Ask.
**DON'T:** Use headings for visual styling. Don't put keywords in every H2 (over-optimization). Don't use H2s for single-sentence sections — each H2 should have 100-300 words of content beneath it.

**GOOD H2 structure (article: "Content Decay Detection"):**
> H2: What Is Content Decay? (definition — direct answer for AI)
> H2: How to Detect Content Decay in Google Search Console (actionable how-to)
> H2: The 4-Step Content Decay Triage Framework (original framework)
> H2: Content Refresh vs. Full Rewrite: When to Use Each (comparison — triggers tables)
> H2: How Often Should You Update Existing Content? (question — maps to PAA)
> H2: 3 Real Examples of Content Recovery After Decay (E-E-A-T experience signal)

**BAD H2 structure:**
> H2: Introduction
> H2: What You Need to Know
> H2: Important Information
> H2: More Details
> H2: Conclusion

### 3. Fact Density for AI Citation
**WHEN:** Throughout every article — AI engines prioritize content with specific, verifiable claims.
**HOW:** Include a statistic, data point, percentage, specific number, or cited finding every 150-200 words. Cite primary sources (studies, official documentation, tool data) not secondary blogs. Format facts for extraction: "According to [Source], [specific claim with number]." Place the most important facts in the first 200 words and under H2 headings.
**WHY:** Perplexity averages 21.87 citations per response and heavily favors content with high factual density. Content without specific claims is generic and uncitable. AI engines verify claims against other sources — accurate, well-cited content builds trust scores.
**DON'T:** Fabricate statistics. Don't cite "studies show" without naming the study. Don't cluster all stats in one section — distribute throughout. Don't use outdated data when current data is available.

### 4. E-E-A-T Signals in Writing
**WHEN:** Every article — E-E-A-T is the framework Google's quality raters use to evaluate content.
**HOW:** Experience: Use first-person experience signals where genuine ("I tested," "In my experience with 50+ clients," "After implementing this on our site"). Expertise: Demonstrate depth beyond surface-level knowledge — nuance, edge cases, when advice doesn't apply. Authoritativeness: Cite recognized sources, link to official documentation. Trustworthiness: Attribute claims, provide methodology, acknowledge limitations.
**WHY:** Google's September 2025 Quality Rater Guidelines update expanded E-E-A-T evaluation. Trustworthiness is the MOST important E-E-A-T factor. AI engines heavily weight source credibility for citation decisions — 45.8% of ChatGPT-cited domains are 15+ years old.
**DON'T:** Fake experience. Don't claim "we tested" if there's no test data to reference. Don't use generic author bios ("John is a passionate digital marketer"). Author bios must include verifiable credentials relevant to the article topic.

### 5. Keyword Placement Strategy
**WHEN:** Every article — keyword placement is both an SEO ranking signal and a relevance signal for AI systems.
**HOW:** Primary keyword placement (mandatory): title/H1, first 100 words, at least one H2, meta description, first image alt text. Secondary keyword placement: distributed across other H2s, body paragraphs, additional image alt text. Total primary keyword density: 0.5-1.5% of total word count. Use natural variations and related terms — not exact repetition.
**WHY:** Title and first 100 words are the strongest on-page keyword signals. Google's NLP understands semantic variations, but explicit keyword presence in key positions still matters for ranking. Over-optimization (> 2% density) triggers spam signals.
**DON'T:** Force keywords into every paragraph. Don't use exact-match keywords in more than 2 headings. Don't sacrifice readability for keyword placement — if it reads unnaturally, rewrite the sentence.

### 6. Internal Link Placement
**WHEN:** Every article — 3-5 contextual internal links minimum.
**HOW:** Link from descriptive anchor text (2-5 words that describe the target page's topic). Distribute links across the article body — not all in one paragraph. Link to: the pillar page if the article is part of a topic cluster, related product/service pages (MOFU/BOFU conversion paths), related blog content that deepens a point. Place at least one internal link in the first 300 words.
**WHY:** Internal links distribute PageRank within the site. Pages with 5+ internal links from topically relevant pages rank significantly better. Early internal links in the article get more click-through. Contextual links (within body paragraphs) pass more equity than navigation or sidebar links.
**DON'T:** Use "click here" or "read more" as anchor text — these waste the relevance signal. Don't link to the same page twice. Don't cluster all links in a "Related Resources" section at the bottom — body links are more valuable.

### 7. Image Optimization for SEO
**WHEN:** Every article with images — which should be every article (minimum 1 image per 300 words for engagement).
**HOW:** Alt text: Descriptive of the image content, include target keyword where natural (not forced), 8-15 words. Format: WebP (30% smaller than JPEG at equivalent quality) or AVIF. Dimensions: Explicit `width` and `height` attributes in HTML (prevents CLS). File size: < 200KB for inline content images, < 100KB for decorative images. File naming: descriptive, hyphenated (`content-decay-detection-chart.webp`, not `IMG_4523.jpg`).
**WHY:** Image alt text is an SEO ranking signal. Images without dimensions cause CLS (Core Web Vitals failure). Uncompressed images are the #1 cause of LCP failures. Google Image Search drives 20-30% of total search traffic for visual topics.
**DON'T:** Use the same alt text on every image. Don't stuff keywords into alt text ("SEO content decay SEO audit SEO strategy"). Don't use images without alt text — every image must have it.

### 8. Article Schema (JSON-LD)
**WHEN:** Every article page must have Article structured data.
**HOW:** Include in JSON-LD format: `@type: "Article"` (or `BlogPosting`, `TechArticle` based on content type), `headline`, `author` (with `@type: Person`, `name`, `url` to author bio page), `datePublished` (ISO 8601), `dateModified`, `description` (meta description), `image` (featured image URL), `publisher` (with `@type: Organization`, `name`, `logo`). For technical content, `TechArticle` type gets higher AI citation rates.
**WHY:** Schema helps Google understand article metadata and can trigger rich results (author info, publish date in SERPs). AI engines use schema to verify authorship and assess credibility. JSON-LD is Google's preferred format — less error-prone than Microdata.
**DON'T:** Use FAQ schema unless the site is an authoritative government or health source (restricted since 2026). Don't use HowTo schema (removed entirely). Don't include schema with missing required fields — incomplete schema is worse than no schema.

### 9. Readability Enforcement
**WHEN:** Every article — 8th grade readability target (Flesch-Kincaid Grade Level 8 or below).
**HOW:** Sentence length: 15-20 words average (mix short punchy sentences with occasional longer ones). Paragraph length: 2-4 sentences max. Use active voice (80%+ of sentences). Define jargon immediately on first use. Use bullet/numbered lists for 3+ items. Use comparison tables for "vs." content. One idea per paragraph.
**WHY:** 8th grade readability maximizes comprehension across all audience levels. Scannable content has lower bounce rates. AI engines parse simpler sentence structures more accurately. Walls of text without formatting are skipped by both readers and machines.
**DON'T:** Write 6-sentence paragraphs. Don't use passive voice for key claims ("It was found that..." → "Ahrefs found that..."). Don't assume the reader knows industry terminology.

### 10. Conclusion with CTA
**WHEN:** Every article ends with a conclusion section.
**HOW:** Summarize 3-5 key takeaways as bullet points (scanners skip to the end — make this standalone). Restate the core value proposition. Include a clear, relevant call-to-action: newsletter signup, related service page, free tool, consultation booking — whatever matches the content's funnel stage. For TOFU content: soft CTA (learn more, download guide). For MOFU/BOFU content: harder CTA (get audit, book demo, start trial).
**WHY:** 40-60% of readers scroll to the conclusion without reading the full article. A conclusion without a CTA is a missed conversion opportunity. The summary bullets serve as a second chance to communicate key points.
**DON'T:** Introduce new information in the conclusion. Don't use generic CTAs ("Contact us today!") — tie the CTA to the specific topic. Don't end abruptly without a conclusion section.

**GOOD conclusion:**
> **Key Takeaways:**
> - Content decay affects 70%+ of pages within 12 months of publication
> - Detect decay early: monitor GSC for >20% traffic drops over 8 weeks
> - Triage every declining page: refresh, rewrite, merge, or retire
> - Revenue pages need monthly review; evergreen content needs quarterly review
>
> Content decay is inevitable — but traffic loss isn't. The difference is whether you have a system to detect and fix it before rankings collapse.
>
> **[Get a free content decay audit →]** We'll analyze your top 20 pages and flag which ones are losing ground.

**BAD conclusion:**
> In conclusion, content decay is an important topic that all website owners should be aware of. We hope you found this guide helpful. If you have any questions, don't hesitate to reach out to our team. Thank you for reading!

### 11. External Citation Strategy
**WHEN:** Every article — 3-5 external links to authoritative sources.
**HOW:** Link to primary sources: official documentation, peer-reviewed studies, recognized industry reports, government data. Use descriptive anchor text. Open external links in new tab (`target="_blank" rel="noopener"`). Distribute throughout the article — not all in one "Sources" section (though a sources section at the end is also valuable).
**WHY:** External citations to authoritative sources are a trust signal. Google's Quality Rater Guidelines explicitly check whether content cites credible sources. Content without external citations appears unsupported. AI engines cross-reference citations — accurate citations boost credibility scores.
**DON'T:** Link to competitors' commercial pages. Don't link to low-authority blogs as "sources." Don't use nofollow on editorial external links (it signals you don't trust your own citations). Don't cite only your own content — this is a trust red flag.

### 12. Content Rewrite Specific Patterns
**WHEN:** Rewriting an existing article (as opposed to writing from scratch).
**HOW:** Preserve the existing URL (never change the URL of a page that has backlinks or search history). Update the `dateModified` in schema. Add new sections to address content gaps vs. current SERP competitors. Update all statistics to current data. Refresh internal links to include newer content. Keep content that still ranks well — don't rewrite sections that are performing. Add "Originally published [date], updated [date]" transparency note.
**WHY:** Rewrites on existing URLs preserve accumulated backlinks and search history. Republishing with an updated date signals freshness to Google. 70%+ of top results were updated within 12 months — freshness is a competitive advantage.
**DON'T:** Create a new URL for the rewritten content (kills accumulated authority). Don't strip content that currently ranks well for long-tail keywords. Don't remove sections without checking if they drive traffic in GSC. Don't update the date without making substantive content changes — Google detects cosmetic-only updates.

### 13. AI Citation Optimization Layer
**WHEN:** Every article — content should be structured for both traditional search ranking AND AI engine citation.
**HOW:** Apply these AI-citation-specific optimizations on top of standard SEO:

- **Direct answers in first 40-60 words of each H2 section.** AI engines extract section-level answers. Don't build up to the answer — state it, then explain.
- **Conversational specificity.** Address "for whom," "under what conditions," and "compared to what." AI engines cite content that answers the specific version of a question, not generic overviews.
- **Structured data as credibility signal.** Complete Article JSON-LD helps AI verify authorship and claims. TechArticle type for technical content gets higher citation rates.
- **Primary source citations in-text.** Not just a sources section at the bottom — cite within the paragraph where the claim is made. AI engines cross-reference citations.
- **Quarterly freshness.** Pages not updated quarterly are 3x more likely to lose AI citations. Schedule update reminders.

**WHY:** AI-referred sessions jumped 527% YoY in 2025. Only 12% of AI-cited URLs also rank in Google's top 10 — meaning AI citation is a separate discovery channel. Perplexity averages 21.87 citations per response. Content optimized for AI citation captures traffic from a completely different channel than traditional organic search.
**DON'T:** Sacrifice human readability for AI optimization. The content must serve human readers first — AI citation optimization is an additional layer, not a replacement for good writing. Don't optimize exclusively for one AI platform — different platforms have different citation patterns (Perplexity favors freshness, ChatGPT favors authority, Google AIO favors schema).

### 14. Featured Snippet and PAA Targeting
**WHEN:** Target keyword triggers featured snippets or People Also Ask boxes in the SERP.
**HOW:** Check SERP features for the target keyword (Serper API). If a featured snippet exists:

- **Paragraph snippets:** Write a 40-60 word direct answer immediately after the relevant H2. Start with a definition or direct statement.
- **List snippets:** Use numbered or bulleted lists with 5-8 items. Each item should be concise (one line).
- **Table snippets:** Use HTML tables for comparison content (X vs. Y, pricing tiers, feature matrices).

For PAA targeting: identify PAA questions for the target keyword. Include them as H2 or H3 headings. Answer each directly in the first 40-80 words of that section, then expand.

**WHY:** Featured snippet CTR is ~42.9% when snippets appear (First Page Sage 2025). Even though snippet visibility dropped 64% between Jan-June 2025 due to AI Overviews, the optimization patterns that win snippets also win AI citations — the same content structure serves both. PAA targeting captures long-tail question variations with minimal additional effort.
**DON'T:** Over-optimize for snippets at the expense of article flow. Don't stuff PAA questions as H2s if they don't fit the article's logical structure. Don't expect every article to win a snippet — target them where the SERP already shows snippet opportunity.

### 15. Word Count and Competitive Depth Calibration
**WHEN:** Determining article length — this must be data-driven, not arbitrary.
**HOW:** Check the word count of the top 5 ranking pages for the target keyword. Target the upper quartile — not the longest, but above average. General guidelines by content type:

- **Definitional/what-is articles:** 1,000-1,500 words
- **How-to guides:** 1,500-2,500 words
- **Comprehensive guides/pillar pages:** 2,500-5,000 words
- **Comparison/vs. articles:** 1,500-2,000 words
- **Listicles (best X):** 2,000-3,500 words (depends on number of items)
- **Case studies:** 1,200-2,000 words
- **Statistics roundups:** 1,500-2,500 words

**WHY:** Word count itself isn't a ranking factor — but comprehensiveness is. Longer content correlates with higher rankings because it covers more subtopics and earns more backlinks. However, padding to hit a word count produces thin content that harms the site. Every word must earn its place.
**DON'T:** Set a universal word count target for all articles. Don't pad articles to hit a number — if the topic is fully covered in 1,200 words, that's the right length. Don't assume longer is always better — match the depth of top SERP competitors, then add differentiated value.

## Data Sources

| Source | What It Provides | Access Method |
|--------|-----------------|---------------|
| Content Brief | Primary/secondary keywords, search intent, competitor gaps, target word count, SERP feature targets | Internal — from `content_brief` service |
| Serper API | Actual SERP results, PAA questions, featured snippet format, competitor content | API call — always available |
| Google Search Console | Current rankings, impressions, clicks for existing content (rewrites) | OAuth — only when client connects |
| NLP Content Tools | Term frequency against SERP competitors (Surfer/Clearscope methodology) | Third-party integration or manual analysis |
| CrUX/PSI | Page performance data for image/resource optimization specs | Free API — always available |
| Topic Cluster Map | Pillar page URL, related cluster pages for internal linking | Internal — from `topic_cluster_map` service |
| Content Decay Audit | Existing page performance data, decline metrics, competitive displacement findings | Internal — from `content_decay_audit` service (for rewrites) |
| GEO Audit | AI citation optimization requirements, platform-specific formatting guidance | Internal — from `geo_audit` service |

## Output Structure

The final deliverable MUST contain these components:

1. **Article Metadata**
   - Title (H1) with character count
   - Meta description with character count
   - Primary keyword and secondary keywords list
   - Target word count and actual word count
   - Target readability grade and actual grade
   - Author name and credentials summary
   - Funnel stage (TOFU/MOFU/BOFU)
   - Cluster assignment (if applicable)

2. **Full Article Content** — Complete article with H1, H2/H3 hierarchy, body content, images with alt text, internal links (3-5), external citations (3-5), conclusion with CTA.

3. **Article JSON-LD Schema** — Complete, valid Article (or TechArticle/BlogPosting) JSON-LD ready for implementation. Must include:
   - `@type` (Article, TechArticle, or BlogPosting)
   - `headline`, `description`, `image`
   - `author` with `@type: Person`, `name`, `url`
   - `publisher` with `@type: Organization`, `name`, `logo`
   - `datePublished` and `dateModified` in ISO 8601

4. **SEO Checklist** — Verification that all keyword placement, readability, fact density, link, and schema requirements are met.

5. **Author Bio** — Name, credentials, first-person voice, link to author page.

6. **Image Specifications** — For each image: recommended alt text, format (WebP), max dimensions, max file size.

7. **Internal Link Map** — For each internal link: anchor text used, target URL, location in article (which H2 section).

8. **Fact Density Audit** — List of all statistics and data points cited, with source attribution and position in the article (which H2 section). Verify minimum density of 1 per 150-200 words.

## Quality Gate

Before delivering to the client, verify ALL of the following:

**Keyword & On-Page:**
- [ ] Primary keyword appears in: title/H1, first 100 words, at least one H2, meta description
- [ ] Primary keyword density is 0.5-1.5% — not over-optimized
- [ ] Secondary keywords are distributed across H2s and body naturally
- [ ] Meta description is 150-160 characters with keyword and compelling CTA
- [ ] Title/H1 is under 60 characters

**Content Quality:**
- [ ] Opening hook delivers value or provokes curiosity in the first 50 words — no throat-clearing
- [ ] Fact density: at least one statistic or specific data point every 150-200 words
- [ ] All statistics cite a named source — no "studies show" without attribution
- [ ] Readability is at or below 8th grade Flesch-Kincaid level
- [ ] Article addresses at least one gap not covered by top 3 SERP competitors

**Structure:**
- [ ] H2/H3 hierarchy is logical with no skipped levels (no H2 → H4)
- [ ] 6-10 H2 sections, each with 100-300 words of content
- [ ] Conclusion includes 3-5 bullet takeaways and a relevant CTA

**Links & Media:**
- [ ] 3-5 contextual internal links with descriptive anchor text, distributed across the article
- [ ] 3-5 external links to authoritative primary sources
- [ ] Every image has descriptive alt text, WebP format specified, explicit dimensions
- [ ] At least one internal link in the first 300 words

**Schema & E-E-A-T:**
- [ ] Article JSON-LD schema is complete with author, dates, publisher, image
- [ ] No FAQ or HowTo schema recommended (deprecated/restricted)
- [ ] Author bio includes verifiable credentials relevant to the topic
- [ ] First-person experience signals present where applicable

## Cross-Service Connections

- **Receives from:**
  - `content_brief` (Sakura) — keyword targets, search intent, competitor gaps, SERP features, angle/differentiator, target word count
  - `content_calendar` (Ryo) — publishing priority, funnel stage (TOFU/MOFU/BOFU), content type assignment
  - `topic_cluster_map` (Ryo) — pillar page URL for internal linking, sibling cluster pages for cross-linking
  - `keyword_research` (Haruki) — primary/secondary keywords, search volume, keyword difficulty, intent classification
  - `content_decay_audit` (Yumi) — existing articles flagged for rewrite with specific decline data and triage recommendation
  - `geo_audit` (shared) — AI citation optimization checklist (fact density targets, schema requirements, direct answer formatting)
  - `cwv_optimization` (shared) — image optimization specs (format, max file size, dimension requirements)

- **Sends to:**
  - `on_page_audit` (Mika) — published article URL for on-page verification
  - `schema_generation` (Kenji) — article metadata for JSON-LD generation (if not included inline)
  - `outreach_emails` — linkable angles from the article for outreach targeting
  - `content_decay_audit` (Yumi) — new article URL + publish date for future decay monitoring
  - `monthly_report` — content production metrics (articles published, keywords targeted)

**Data fields that transfer:**

- `article_meta{}` — `{title, url, primary_keyword, secondary_keywords[], publish_date, word_count, author, funnel_stage, cluster_id}`
- `internal_links[]` — `{anchor_text, target_url, section_placement}`
- `schema_data{}` — `{type, headline, author, datePublished, dateModified, description, image, publisher}`
- `linkable_angles[]` — `{angle_description, target_audience, outreach_hook}`
- `fact_density_audit[]` — `{claim, source, section, word_position}`
- `rewrite_meta{}` — `{original_url, original_publish_date, decline_metrics, competitive_gaps[], sections_preserved[], sections_rewritten[]}`

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---------|---------------|-------------------|
| "In today's digital landscape..." opening | Generic throat-clearing — reader bounces, AI ignores | Lead with a stat, direct answer, or counterintuitive claim in the first sentence |
| No statistics in the entire article | Uncitable by AI engines, lacks credibility signals | Include a specific data point every 150-200 words, cite named sources |
| "Studies show" without naming the study | Fails E-E-A-T trust test, unverifiable claim | "According to Ahrefs' 2025 study of 1M pages..." — name the source |
| All internal links in a "Related Posts" sidebar | Sidebar/footer links pass less equity than body links | Place 3-5 internal links within body paragraphs using descriptive anchor text |
| 500-word articles targeting competitive keywords | Thin content penalty, can't compete on topic depth | Match or exceed top SERP competitors' word count; 1,500-3,000 words for competitive terms |
| Keyword stuffed to 3%+ density | Triggers spam signals, reads unnaturally | Target 0.5-1.5% density with natural variations and related terms |
| Same alt text on every image | Missed SEO signal, accessibility violation | Unique descriptive alt text per image, keyword only where natural |
| No author bio or generic "content team" attribution | Fails E-E-A-T Experience and Expertise signals | Named author with verifiable credentials relevant to the article topic |
| FAQ schema on non-gov/health sites | Restricted to authoritative government and health sites since 2026 | Use Article, TechArticle, or BlogPosting schema instead |
| Changing the URL when rewriting existing content | Destroys accumulated backlinks and search history | Keep the same URL, update content and dateModified |
| No conclusion or abrupt ending | 40-60% of readers scroll to the conclusion — missed conversion opportunity | Conclusion with 3-5 bullet takeaways and a CTA tied to the content topic |
| Generic CTA ("Contact us today!") | Disconnected from content topic, low conversion rate | CTA specific to the article topic: "Get your free content decay audit" on a decay article |
| No external citations | Fails E-E-A-T trust test, appears unsupported | 3-5 external links to authoritative primary sources distributed through the article |
| All images are stock photos with generic alt text | Missed SEO signal, low engagement, zero differentiation | Original images, screenshots, charts where possible. Unique descriptive alt text per image. |
| Writing at college reading level | Limits audience reach, higher bounce rates | Target 8th grade Flesch-Kincaid. Short sentences (15-20 words avg). Define jargon on first use. |
| Publishing without JSON-LD schema | Misses rich result opportunities and AI credibility signals | Every article gets Article/TechArticle/BlogPosting schema with complete author, dates, publisher fields |
| Building up to the answer instead of leading with it | AI engines extract first 40-60 words of a section — burying the answer means no citation | State the answer first, then explain. Direct answer then context then nuance. |
| Ignoring SERP format when choosing article structure | If top results are listicles and you publish an essay, format mismatch kills rankings | Check what format ranks for the target keyword. Match the winning format, then differentiate on depth. |
| No differentiation from top SERP competitors | Matches existing content but offers nothing new — no reason to rank higher | Every article must have at least one angle, data point, or section that top competitors lack |
