# Content Brief — Agent Reference (Sakura)

## What This Produces
A comprehensive content brief that gives a writer (human or AI) everything needed to produce a top-ranking article: target keywords, competitor analysis from real SERP data, content structure, E-E-A-T requirements, internal linking map, and featured snippet targeting instructions.

## Professional Standard
What separates a $500 output from a $5,000 output:
- **Real SERP reverse-engineering.** Brief is built from actual top-10 analysis — competitor word counts, heading structures, content gaps — not guessed patterns.
- **Content scoring methodology.** A Surfer/Clearscope-equivalent approach: term frequency targets, semantic coverage requirements, and a measurable score the writer can hit.
- **E-E-A-T requirements specific to the topic.** Not generic "add author bio" — specific credentials needed, experience signals required, citation standards for this topic's YMYL level.
- **Internal linking architecture.** Not "add internal links" — specific pages to link to and from, with anchor text suggestions based on the client's existing site structure.
- **Featured snippet and AI citation targeting.** Specific structural patterns (paragraph, list, table) matched to the snippet type that currently wins for this keyword.

---

## Build Process (Ordered Steps)

1. **Receive keyword data.** Accept primary keyword, secondary keywords, intent classification, and SERP feature data from keyword_research service or direct input. If no keyword research exists, run a lightweight version: query Serper API for the primary keyword, extract related searches and PAA questions.

2. **Pull top-10 SERP data via Serper API.** For the primary keyword, extract for each of the top 10 results: URL, title tag, meta description, domain. Where possible via site scraper, also extract: estimated word count, H1, H2 headings, presence of images/video, schema markup detected.

3. **Analyze competitor content.** For the top 3-5 ranking pages (scrape via site scraper if available):
   - Word count range (establish target: match or exceed median by 10-20%)
   - H2/H3 heading structure (what subtopics do ALL top pages cover?)
   - Content gaps (what do only 1-2 pages cover that others miss? These are differentiation opportunities)
   - Content format (listicle, how-to, comparison, long-form guide)
   - Media usage (images, videos, infographics, tables)

4. **Build semantic term list.** From top-10 competitor pages, extract recurring terms and phrases that appear across multiple ranking pages. These become the "must-include" semantic terms for content scoring. Group into:
   - **Required terms** (appear in 7+ of top 10 pages)
   - **Recommended terms** (appear in 4-6 of top 10 pages)
   - **Differentiator terms** (appear in 1-3 pages — opportunities to stand out)

5. **Define E-E-A-T requirements.** Based on topic sensitivity:
   - **YMYL topics** (health, finance, legal, safety): Require named author with verifiable credentials, citations to primary sources (studies, official docs), clear editorial standards note
   - **Standard topics:** Author bio with relevant experience, links to authoritative sources, first-person experience signals where applicable
   - **Low-sensitivity topics:** Basic authorship attribution, general source quality standards

6. **Map internal linking.** From the client's site structure (via BFS crawler or site scrape):
   - Identify 3-5 existing pages to link TO from this new content
   - Identify 2-3 existing pages that should link BACK to this new content
   - Suggest anchor text for each link based on target keywords

7. **Design featured snippet targeting.** Based on SERP feature analysis:
   - If paragraph snippet: Write a 40-60 word direct answer immediately after the relevant H2
   - If list snippet: Use numbered/bulleted list with 5-8 items
   - If table snippet: Include a comparison table with clear headers
   - If PAA boxes present: Create dedicated H2/H3 sections answering each PAA question in 40-80 words

8. **Set content scoring targets.** Define measurable quality criteria:
   - Word count target (based on competitor median + 10-20%)
   - Semantic term coverage (% of required terms included)
   - Readability target (Flesch-Kincaid grade 6-8 for most content)
   - Heading density (one H2 per 200-350 words)
   - Image/media recommendations (minimum count based on competitor analysis)

9. **Compile the brief.** Structure per Output Structure below.

---

## Critical Patterns

### 1. SERP Reverse-Engineering — The Foundation
**WHEN:** Every brief, no exceptions.
**HOW:**
1. Query Serper API: `GET /search?q={primary_keyword}&num=10`
2. For each result, record: URL, title, meta description, position, domain
3. Scrape top 3-5 pages (via site scraper) for: full text, headings, word count, images, schema
4. Build a competitive matrix: rows = competitor pages, columns = subtopics covered (derived from H2/H3 headings)
5. Identify the "table stakes" subtopics (covered by 7+ pages) and "gap" subtopics (covered by 1-3 pages)

**WHY:** The SERP is Google's answer to "what content satisfies this query." Reverse-engineering it tells you the minimum bar to rank and the gaps to differentiate.
**DON'T:** "Mentally simulate" what top pages probably contain. This is the single biggest quality gap between current output and premium agency work. Use real data.

### 2. Content Scoring Methodology (Surfer/Clearscope Equivalent)
**WHEN:** Setting measurable optimization targets in every brief.
**HOW:**
1. From scraped competitor pages, extract all significant terms (nouns, noun phrases, technical terms) with their frequency
2. Calculate average frequency of each term across top-10 pages
3. Create three tiers:
   - **Must-include (weight: 3x):** Terms appearing in 70%+ of top pages at high frequency
   - **Should-include (weight: 2x):** Terms appearing in 40-69% of top pages
   - **Could-include (weight: 1x):** Terms appearing in 20-39% of top pages — differentiators
4. Set a coverage target: "Include at least 80% of must-include terms, 60% of should-include terms"
5. Present as a scored checklist the writer can validate against

**WHY:** Without measurable scoring, "optimize for SEO" is meaningless. A score gives the writer a concrete target and the client a verifiable quality metric.
**DON'T:** List keywords with target densities like "use keyword 3-5 times." This is 2015 SEO. Semantic coverage across related terms matters more than repeating the primary keyword.

### 3. E-E-A-T Requirements — Topic-Specific, Not Generic
**WHEN:** Every brief must specify E-E-A-T requirements calibrated to the topic.
**HOW:**
- **Experience signals:** Specify what first-person experience looks like for this topic. "I tested 12 CRM tools over 6 months" not "we researched CRM tools." Include specific prompts: "Include at least 2 first-person observations or test results."
- **Expertise signals:** Define what credentials matter. For a health topic: "Author must be a licensed practitioner or cite one." For a SaaS review: "Author should have documented usage of the tool."
- **Authoritativeness signals:** List citation requirements. "Cite at least 3 primary sources (official documentation, peer-reviewed studies, government databases). Blog posts citing other blog posts do not count."
- **Trustworthiness signals:** "Include publication date, last-updated date, author bio with verifiable credentials, and editorial standards note."

**WHY:** Google's September 2025 Quality Rater Guidelines expanded YMYL definitions. Trust is the most important E-E-A-T factor. Generic "add an author bio" advice misses the specificity that drives rankings.
**DON'T:** Apply the same E-E-A-T template to every topic. A recipe blog and a medical advice article have vastly different E-E-A-T requirements.

### 4. Competitor Content Gap Analysis
**WHEN:** Analyzing top-ranking pages during SERP reverse-engineering.
**HOW:**
1. Build the subtopic matrix (Pattern 1, step 4)
2. Identify subtopics covered by ONLY 1-3 top pages — these are differentiation opportunities
3. Identify subtopics NOT covered by ANY top page — these are high-risk (Google may not reward them) but high-reward if they match user intent
4. Identify outdated information in competitor pages (dates, statistics, product features that have changed)
5. Include in the brief: "Cover all table-stakes topics + these specific gaps to differentiate"

**WHY:** Matching competitors gets you in the game. Exploiting their gaps wins it. The brief should make the differentiation strategy explicit.
**DON'T:** Only list what competitors cover. The gaps are where ranking advantage lives.

### 5. Featured Snippet Targeting
**WHEN:** Primary keyword triggers a featured snippet or PAA box (detected in Serper API response).
**HOW:**
- **Paragraph snippet (definition queries):** Write a 40-60 word direct answer in the first paragraph under the relevant H2. Start with "[Keyword] is..." or "A [keyword] is..."
- **List snippet (how-to, best-of):** Use an ordered or unordered list with 5-8 items immediately after the H2. Each item should be a clear, concise step or entry.
- **Table snippet (comparison, data):** Include a comparison table with 3-5 columns and 4-8 rows. Use clear header row with the comparison dimensions.
- **PAA targeting:** Create dedicated H2 sections for each PAA question. Answer in 40-80 words, then expand with detail below.

**WHY:** Featured snippet CTR is ~42.9% when present. AI Overviews often cite content structured for snippets. Even if the snippet itself isn't won, the structural discipline improves AI citation chances.
**DON'T:** Recommend FAQ schema for snippet targeting. Google restricted FAQ rich results to authoritative/government sites in 2026. Use Article and TechArticle schema instead.

### 6. Internal Linking Architecture
**WHEN:** Client has an existing site with 10+ pages.
**HOW:**
1. From BFS crawler or site scrape, build a map of existing pages and their target keywords
2. Identify 3-5 pages on the client's site topically related to the new content
3. For each, specify:
   - **Link direction:** New page → Existing page, or Existing page → New page
   - **Anchor text:** Use a variation of the target keyword for the destination page
   - **Placement:** Within body content, not in a generic "Related Articles" sidebar
4. Identify the highest-authority page in the cluster and ensure it links to/from the new content

**WHY:** Internal links distribute PageRank and signal topical relationships to Google. A deliberate linking architecture is how topic clusters build authority — random links don't achieve this.
**DON'T:** Say "add 3-5 internal links." Specify exactly which pages, what anchor text, and in which direction. Vague linking instructions produce random, unhelpful links.

### 7. Content Format Selection — SERP-Driven
**WHEN:** Deciding the format recommendation in the brief.
**HOW:**
- Analyze what format dominates the top 10 results:
  - If 7+ are long-form guides (2,000+ words) → Recommend comprehensive guide
  - If 7+ are listicles → Recommend list format
  - If comparison tables appear frequently → Recommend comparison/review format
  - If video results appear in top 5 → Note that video content may outperform written
  - If mixed formats → Recommend the format used by position 1-3 specifically
- Recommend word count: median of top 5 results + 15%

**WHY:** Google has already revealed what format satisfies this query. Fighting the SERP's format preference is fighting Google's understanding of user intent.
**DON'T:** Default to "long-form guide" for everything. If the SERP shows listicles ranking, a 4,000-word essay won't outperform a well-structured list.

### 8. Schema Markup Recommendations
**WHEN:** Every brief should include schema recommendations.
**HOW:**
- **Article schema:** Always include for blog/article content. Specify: headline, author (with url to author page), datePublished, dateModified, publisher
- **TechArticle schema:** For technical/how-to content — Google uses this for AI citation
- **HowTo schema:** For step-by-step instructional content
- **Do NOT recommend FAQ schema** unless the site is an authoritative/government domain — Google restricted this in 2026
- **Review/Product schema:** For comparison and review content

**WHY:** Schema markup helps Google understand content structure and is correlated with SERP feature eligibility. TechArticle and Article schema specifically support AI Overview citation.
**DON'T:** Recommend FAQ schema broadly. This is outdated advice that marks the brief as non-current.

### 9. Readability and Audience Calibration
**WHEN:** Setting readability targets for the writer.
**HOW:**
- Default target: Flesch-Kincaid Grade Level 6-8 (8th grade reading level)
- For technical B2B content: Grade Level 8-10 is acceptable
- For consumer content: Grade Level 5-7
- Specify: short paragraphs (3-4 sentences max), one idea per paragraph, active voice, concrete language over abstractions
- Heading density: one H2 every 200-350 words minimum

**WHY:** The average American reads at an 8th-grade level. Content that's easier to read gets more engagement, lower bounce rates, and better ranking signals.
**DON'T:** Set readability targets without considering the audience. A medical research brief for practitioners can be more complex than a consumer health article.

### 10. Media and Visual Requirements
**WHEN:** Every brief should specify media needs.
**HOW:**
1. Count images/videos/infographics in top-5 competitor pages
2. Set minimum: match competitor median
3. Specify types needed: screenshots, data visualizations, comparison tables, hero image
4. Include alt text guidance: descriptive, includes target keyword naturally (not keyword-stuffed)
5. Note if video content appears in SERP — may warrant embedded video recommendation

**WHY:** Pages with images rank higher on average. Google Image Search drives significant secondary traffic. Competitors set the visual bar.
**DON'T:** Say "add relevant images." Specify how many, what type, and where in the content they should appear.

---

## Data Sources

| Source | What It Provides | Format | Access |
|---|---|---|---|
| **Serper API** | Top-10 organic results, SERP features, PAA questions, related searches | JSON | Available — primary SERP data |
| **Site Scraper** | Competitor page content: headings, word count, text, schema | Structured data | Available for scraping competitor URLs |
| **BFS Crawler** | Client's existing site structure, pages, internal links | Structured data | Available for client site mapping |
| **keyword_research output** | Pre-researched keywords, clusters, intent, difficulty | JSON/structured | From Haruki agent |
| **GSC/GA4** | Current ranking data, top pages, engagement metrics | JSON via OAuth | When client connects |

---

## Output Structure

The content brief MUST contain these sections:

### 1. Brief Overview
- Primary keyword + search volume (with source)
- Secondary keywords (5-10)
- Search intent (type + subtype)
- SERP features present
- Target content format
- Target word count

### 2. SERP Analysis Summary
- Top 5 competitor pages with: URL, title, word count, key headings
- Competitive matrix showing subtopic coverage
- Content gaps identified
- Current featured snippet holder (if applicable)

### 3. Content Scoring Targets
- Must-include semantic terms (with target frequency)
- Should-include semantic terms
- Readability target (grade level)
- Heading density target
- Media requirements (count and type)

### 4. Content Structure (Recommended Outline)
- H1 recommendation
- H2 sections with subtopics (ordered for flow AND snippet targeting)
- H3 subsections where needed
- PAA questions to address (with section placement)
- Featured snippet targeting section (with format: paragraph/list/table)

### 5. E-E-A-T Requirements
- Author credential requirements for this topic
- Experience signals to include
- Citation requirements (number, type, quality)
- Trust signals (dates, editorial note, author bio specs)

### 6. Internal Linking Plan
- Pages to link TO (with anchor text suggestions)
- Pages to request links FROM (with anchor text)
- Link placement notes

### 7. Schema Markup
- Recommended schema types
- Key properties to include

### 8. Competitor Differentiation Strategy
- What all competitors cover (table stakes — must match)
- What competitors miss (gaps — opportunities to win)
- Unique angle recommendation

---

## Quality Gate

1. [ ] SERP analysis uses real Serper API data, not simulated competitor pages
2. [ ] Top 3-5 competitor pages analyzed with actual word counts and heading structures
3. [ ] Semantic term list derived from real competitor content, not generated from intuition
4. [ ] E-E-A-T requirements are topic-specific, not generic boilerplate
5. [ ] Content scoring targets are measurable (term coverage %, word count, readability grade)
6. [ ] Internal linking plan specifies exact pages and anchor text, not "add internal links"
7. [ ] Featured snippet targeting matches the actual snippet type present in SERP
8. [ ] Schema recommendations exclude FAQ schema (restricted in 2026) unless site qualifies
9. [ ] Content format recommendation matches what actually ranks in top 5, not default "long-form guide"
10. [ ] Brief is actionable: a writer who has never seen the SERP could produce competitive content from this brief alone

---

## Cross-Service Connections

- **Receives from:** `keyword_research` (primary/secondary keywords, intent, SERP features, difficulty, clusters), client onboarding (brand voice, target audience, existing content)
- **Sends to:** `content_article` (the brief IS the primary input for article production), `content_rewrite` (brief structure guides rewrite priorities), `content_calendar` (brief completion status feeds calendar scheduling)

---

## Output Examples

### Good Example: SERP Analysis Section

> **SERP Analysis — "best crm for small business"**
>
> | Rank | URL | Title | Word Count | Key Headings |
> |------|-----|-------|-----------|--------------|
> | 1 | hubspot.com/blog/best-crm-small-business | 15 Best CRMs for Small Business (2026) | 4,200 | How We Evaluated, Top Picks, Pricing Comparison, FAQ |
> | 2 | pcmag.com/picks/the-best-crm-software | Best CRM Software for 2026 | 5,100 | Testing Methodology, Editor's Choice, Feature Matrix |
> | 3 | forbes.com/advisor/business/best-crm-small-business | Best CRM for Small Business of 2026 | 3,800 | How We Chose, Detailed Reviews, Pros/Cons Tables |
>
> **Table stakes (all 3 cover):** Pricing comparison table, pros/cons per CRM, free tier details, integration lists, mobile app coverage.
>
> **Gaps (only 1 covers):** Industry-specific CRM recommendations (only Forbes), migration guides from spreadsheets (none), real ROI calculations with specific dollar figures (none).
>
> **Differentiation strategy:** Lead with real-world implementation stories and measurable ROI data. Every competitor lists features — none show actual business outcomes from switching. Include a "CRM selection calculator" interactive element (no competitor has one).

### Bad Example: SERP Analysis Section

> **SERP Analysis — "best crm for small business"**
>
> The top results for this keyword cover various CRM tools and their features. Most articles are comprehensive guides that compare multiple CRM options. Competitors tend to include pricing information and feature comparisons. We recommend creating a detailed guide that covers the topic thoroughly and provides unique value to the reader.

**Why it fails:** No actual URLs, no word counts, no specific heading structures. "Competitors tend to include pricing information" is useless — WHICH competitors, WHAT pricing format? "Provide unique value" without saying what unique angle to take. A writer receiving this brief would need to research the SERP themselves, defeating the purpose of the brief.

---

### Good Example: Keyword Target Section

> **Primary Keyword:** best crm for small business
> - Search volume: 14,800/mo (Serper API, March 2026)
> - Keyword difficulty: Medium-Term — top 5 dominated by HubSpot, PCMag, Forbes (DR 80+), but positions 6-10 include DR 40-60 sites
> - Intent: Commercial Investigation (top 10 is 90% comparison/listicle content)
> - SERP features: AI Overview present (covers top 3 picks), Featured Snippet (list format — current holder: HubSpot), PAA box (6 questions)
>
> **Secondary Keywords:**
> - "small business crm software" — 6,200/mo, 72% SERP overlap with primary
> - "crm for startups" — 3,100/mo, 48% overlap (consider separate article)
> - "free crm for small business" — 8,900/mo, 65% overlap
> - "simple crm for small business" — 2,400/mo, 71% overlap

### Bad Example: Keyword Target Section

> **Primary Keyword:** best crm for small business (high volume)
>
> **Secondary Keywords:** crm software, crm tools, small business software, customer management, business tools, crm system, crm platform
>
> Include these keywords naturally throughout the article.

**Why it fails:** No search volume numbers (or sources). "High volume" is meaningless without a number. Secondary keywords are generic terms with no SERP overlap analysis — "business tools" has zero SERP overlap with "best crm for small business." "Include naturally" provides no measurable optimization target. No difficulty assessment, no intent classification, no SERP feature data.

---

### Good Example: Differentiation Strategy

> **Competitor Differentiation Strategy:**
>
> **What ALL top 5 cover (table stakes — must include):**
> - Feature comparison tables with pricing tiers
> - Pros/cons lists per CRM
> - Free plan availability
> - Integration ecosystems
>
> **What NONE of the top 5 cover (blue ocean):**
> - Actual implementation timelines with real data ("We deployed HubSpot for a 12-person team in 4 days")
> - Cost-per-lead calculations showing CRM ROI by business size
> - Migration difficulty ratings (how hard to switch FROM each CRM)
>
> **Our angle:** "The CRM guide that shows real business outcomes, not just feature lists." Lead every CRM section with a real company's results after 6+ months of use. This requires sourcing 5-8 case studies or testimonials — the investment is the moat.

### Bad Example: Differentiation Strategy

> **Differentiation:** Create a more comprehensive and detailed guide than competitors. Include unique insights and expert opinions. Make sure the content is well-researched and provides value to the reader. Consider adding original graphics or data visualizations.

**Why it fails:** "More comprehensive and detailed" is not a strategy. Every content brief says this. No identification of specific gaps in competitor content. No concrete angle or unique hook. "Unique insights" without specifying WHAT insights. This differentiation section could apply to literally any article on any topic — it tells the writer nothing actionable.

## Anti-Patterns

| Pattern | Why It's Wrong | What To Do Instead |
|---|---|---|
| "Mentally simulating" top 3 results | Produces generic, unverifiable competitor analysis | Query Serper API and scrape actual pages |
| Generic E-E-A-T checklist | Same author bio template for health and lifestyle content | Calibrate E-E-A-T to topic YMYL sensitivity |
| "Include keywords naturally" | Unmeasurable, unhelpful instruction | Provide semantic term list with coverage targets |
| Recommending FAQ schema | Restricted to authoritative sites since 2026 | Use Article, TechArticle, HowTo schema |
| Word count without SERP basis | "Write 2,000 words" with no justification | Set word count from competitor median + 10-20% |
| "Add internal links" | Vague, produces random linking | Specify exact pages, anchor text, direction |
| Same brief template for all intents | Informational and commercial queries need different structures | Adapt format to SERP-verified intent type |
| No differentiation strategy | Matching competitors produces "me too" content | Explicitly identify gaps and unique angles |
| Ignoring AI Overview presence | 47% of searches show AI Overviews | Note AI Overview for keyword, structure for citation |
| Brief that requires SERP research to use | Writer shouldn't need to re-research what the brief covers | Brief must be self-contained and complete |
