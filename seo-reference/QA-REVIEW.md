# SEO Reference Files — Quality Review

**Reviewer:** QA Agent (Opus 4.6)
**Date:** 2026-03-31
**Files Reviewed:** 28
**Criteria:** Depth, Examples, Specificity, Completeness, Practical Execution, Cross-Service Connections

## Summary
- **Total files:** 28
- **Pass (7+ avg):** 22
- **Needs improvement (4-6 avg):** 6
- **Fail (<4 avg):** 0

**Overall assessment:** This is a remarkably strong reference library. The best files (content-article, content-brief, keyword-research, content-decay, site-audit) are genuinely world-class — specific, data-backed, pattern-rich, and operationally complete. The weakest files (link-analysis, outreach, internal-linking, anchor-text) share a common trait: they were written in a different structural format (JSON output spec instead of markdown deliverable sections) and are thinner on good/bad examples. The six content files are the strongest category; the four link-building files are the weakest.

---

## File-by-File Scores

---

### technical-seo/site-audit.md (177 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 12 critical patterns covering orphans, redirects, CWV, canonicals, security, schema, mobile, anchor text, thin content, performance — thorough |
| Examples | 5/10 | Anti-patterns table provides BAD examples implicitly, but NO explicit good/bad output examples showing what a section of the deliverable looks like |
| Specificity | 9/10 | Exact thresholds (300 words for thin, 2+ hop chains, 5% anchor text limit), specific tool paths, health score 0-100 |
| Completeness | 9/10 | Agent reading only this file could produce a comprehensive audit. Build process is 14 steps. |
| Practical | 8/10 | Covers BFS crawler usage, PSI API, GSC integration. Missing: sample executive summary showing what good looks like |
| Cross-service | 9/10 | Sends to 6 services with exact data fields that transfer |
| **Average** | **8.2/10** | |

**Missing:** Good/bad output examples (e.g., a sample executive summary paragraph, a sample finding row). The anti-patterns table partially compensates but doesn't show what a GOOD audit section looks like.
**Recommendation:** PASS — add 1-2 sample output sections (executive summary example, sample finding row with before/after).

---

### technical-seo/technical-audit.md (173 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 13 patterns: robots.txt, sitemaps, TTFB, redirects, JS rendering, crawl depth, duplicates, faceted nav, pagination, status codes, hreflang, log files, mixed content |
| Examples | 5/10 | Anti-patterns give implicit bad examples. No explicit good/bad output samples. |
| Specificity | 9/10 | TTFB thresholds (600ms), sitemap limits (50K/50MB), ISO code format (en-US not en_US), specific Ahrefs stat (68% hreflang errors) |
| Completeness | 9/10 | 10-step build process covers full technical audit scope including international SEO |
| Practical | 8/10 | JS rendering gap analysis methodology is excellent. Missing: sample JSON-LD validation example, sample robots.txt annotated |
| Cross-service | 8/10 | Receives from site_audit, sends to 4 downstream services with data field specs |
| **Average** | **8.0/10** | |

**Missing:** Good/bad examples for deliverable sections. A sample annotated robots.txt would be powerful.
**Recommendation:** PASS — add sample outputs for key sections.

---

### technical-seo/on-page-audit.md (165 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 10 patterns covering title tags, meta descriptions, H1-H6 hierarchy, images, internal links, content quality, keyword placement, URL structure, thin content, cannibalization |
| Examples | 6/10 | Anti-patterns table contains specific before/after examples (e.g., "Our Services" → "Commercial Plumbing Services in Austin TX"). Better than most files. |
| Specificity | 9/10 | 7-point keyword placement score, 50-60 char titles, 150-160 char descriptions, 300-word thin threshold, <75 char URLs |
| Completeness | 9/10 | 13-step build process, 10-section output structure, 12-item quality gate |
| Practical | 8/10 | Title tag examples against SERP context, anchor text analysis connecting to business priorities |
| Cross-service | 8/10 | Clear receives from 3 services, sends to 5 services with data field specs |
| **Average** | **8.2/10** | |

**Missing:** Standalone good/bad example blocks (the anti-patterns come close but are in table format, not extended examples).
**Recommendation:** PASS — the anti-patterns table with concrete before/after titles is above average for examples.

---

### technical-seo/schema-markup.md (158 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 10 patterns covering 2026 restrictions, JSON-LD format, Organization, LocalBusiness, Article, Product, BreadcrumbList, WebSite+SearchAction, AI credibility, nested schema |
| Examples | 4/10 | Lists all 31 active types. Anti-patterns give bad examples. But NO actual JSON-LD code samples showing what a complete Article or Organization block looks like |
| Specificity | 9/10 | Full list of 31 active rich result types, specific property requirements per schema type, @graph pattern recommendation |
| Completeness | 8/10 | 8-step build process. Missing: actual JSON-LD code templates that agents could use as starting points |
| Practical | 6/10 | Critical gap: no actual JSON-LD code examples. An agent writing schema needs to see a complete, valid JSON-LD block — this file tells them what to include but doesn't show them what it looks like |
| Cross-service | 8/10 | Receives from 3 services, sends to 4 services |
| **Average** | **7.3/10** | |

**Missing:** Actual JSON-LD code examples for the most common types (Organization, Article, LocalBusiness, BreadcrumbList). This is a significant gap for an agent that needs to generate valid JSON-LD.
**Recommendation:** NEEDS IMPROVEMENT — add complete JSON-LD code templates for at least Organization, Article, and LocalBusiness. These are the most frequently generated types and agents need reference code.

---

### technical-seo/redirect-management.md (162 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 10 patterns: 301/302 classification, chain resolution, loop detection, robots.txt engineering, AI crawler management, sitemap hygiene, migration planning, platform-specific implementation, soft 404s, monitoring |
| Examples | 5/10 | Anti-patterns provide good implicit examples. One good example in anti-patterns ("Chain: /old-page → /temp-page → /final-page"). No extended good/bad output samples. |
| Specificity | 9/10 | 15% equity loss per hop, 50K URL sitemap limits, specific platform instructions (Apache, Nginx, Cloudflare, WordPress, Shopify, Vercel/Netlify) |
| Completeness | 9/10 | 11-step build process, 10-section output, 11-item quality gate. Covers migration planning in detail. |
| Practical | 8/10 | Platform-specific implementation instructions are excellent. AI crawler user-agent list is current (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, Bytespider, CCBot) |
| Cross-service | 8/10 | Receives from 3 services, sends to 4 services with data field specs |
| **Average** | **8.0/10** | |

**Missing:** Sample robots.txt (annotated), sample redirect resolution table showing 2-3 entries.
**Recommendation:** PASS — add sample annotated outputs for 1-2 key sections.

---

### technical-seo/cwv-optimization.md (169 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 12 patterns: LCP hero image, TTFB, render-blocking, INP long tasks, third-party scripts, CLS dimensions, font CLS, dynamic content CLS, CrUX methodology, mobile-first, preloading, JS bundle optimization |
| Examples | 5/10 | Anti-patterns contain specific examples (hero.jpg 2.4MB → WebP < 200KB). No standalone good/bad report section examples. |
| Specificity | 10/10 | Exact thresholds (LCP 2.5s, INP 200ms, CLS 0.1), specific CSS techniques (font-display: swap, size-adjust), fetchpriority API, <150KB JS target |
| Completeness | 9/10 | 10-step build process, 7-section output, 11-item quality gate. Covers every CWV metric with specific diagnostic approaches |
| Practical | 9/10 | Extremely actionable — specific techniques for each metric, code-level guidance (preload tags, async patterns, aspect-ratio CSS) |
| Cross-service | 8/10 | Receives from 3, sends to 5 with data field specs |
| **Average** | **8.3/10** | |

**Missing:** Good/bad output example showing what a CWV diagnosis section looks like in practice.
**Recommendation:** PASS — one of the strongest files technically. Add a sample per-page diagnosis.

---

### content/keyword-research.md (269 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 10/10 | 10 patterns: intent classification (with subtypes table), search volume honesty, difficulty tiering, SERP features, SERP clustering (60% overlap), gap analysis, cannibalization, seasonal trends, CPC as value proxy, long-tail mining |
| Examples | 6/10 | Intent classification table is an excellent reference. Anti-patterns provide implicit bad examples. Missing: sample keyword database entries, sample cluster output |
| Specificity | 10/10 | 60% SERP overlap threshold, 91% GKP overestimation stat, 47% AI Overview presence, 42.9% snippet CTR, CPC thresholds ($5+ = high commercial), 200-500 raw keyword minimum |
| Completeness | 10/10 | 10-step build process, 8-section output, 12-item quality gate, 9 anti-patterns. An agent could produce premium keyword research from this alone |
| Practical | 9/10 | Excellent methodology (SERP-based clustering, honesty about fabricated volumes). Missing: sample output table showing 3-5 keyword entries |
| Cross-service | 8/10 | Clear sends/receives. Data flows well into content_brief and content_calendar |
| **Average** | **8.8/10** | |

**Missing:** Sample keyword database rows showing the expected output format. Sample cluster visualization.
**Recommendation:** PASS — top-tier file. Sample output entries would make it perfect.

---

### content/content-brief.md (291 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 10/10 | 10 patterns: SERP reverse-engineering, content scoring (Surfer/Clearscope equivalent), E-E-A-T requirements, gap analysis, snippet targeting, internal linking, format selection, schema recommendations, readability, media requirements |
| Examples | 5/10 | Anti-patterns table provides implicit bad examples. Missing: sample brief section showing what a completed SERP analysis or content scoring checklist looks like |
| Specificity | 10/10 | Term frequency tiers (70%+ = must-include, 40-69% = should, 20-39% = could), word count formula (median + 10-20%), heading density (1 H2 per 200-350 words), Flesch-Kincaid grade targets |
| Completeness | 10/10 | 9-step build process, 8-section output, 10-item quality gate. Truly comprehensive. |
| Practical | 9/10 | Serper API query format, scraper usage, semantic term list methodology — highly practical |
| Cross-service | 9/10 | Clear receives from keyword_research, sends to content_article, content_calendar |
| **Average** | **8.8/10** | |

**Missing:** Good/bad output examples showing what a completed content scoring section or competitive matrix looks like.
**Recommendation:** PASS — top-tier file. Add sample output sections for 1-2 key deliverable parts.

---

### content/content-article.md (265 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 10/10 | 15 patterns: opening hook, H2/H3 hierarchy, fact density, E-E-A-T, keyword placement, internal links, images, schema, readability, conclusion/CTA, external citations, rewrites, AI citation, snippets/PAA, word count calibration |
| Examples | 10/10 | **GOOD and BAD examples for**: opening hooks, H2 structure, conclusion/CTA. Extended block quote examples with clear labels. This is the gold standard for examples across all files. |
| Specificity | 10/10 | 0.5-1.5% keyword density, 150-200 word fact density interval, 40-60 word snippet answers, 8th grade readability, 3-5 internal links, 3-5 external links, image <200KB, WebP format |
| Completeness | 10/10 | 13-step build process, 7-component output structure, 16-item quality gate, 10 anti-patterns. Complete enough for an agent to write a publication-ready article |
| Practical | 10/10 | Covers actual writing mechanics: H1/H2 hierarchy, meta description writing, image alt text, JSON-LD schema, author bio, internal link placement. The most operationally detailed file. |
| Cross-service | 10/10 | Receives from 7 services, sends to 5 services with specific data field transfer specs |
| **Average** | **10.0/10** | |

**Missing:** Nothing significant. This is the benchmark file.
**Recommendation:** PASS — this is the best file in the entire collection. Every other file should aspire to this level of good/bad examples and practical specificity.

---

### content/content-calendar.md (191 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 11 patterns: priority scoring formula, content mix ratios, TOFU/MOFU/BOFU mapping, publishing cadence by tier, seasonal planning, refresh/rewrite slots, cluster integration, keyword-to-format mapping, cannibalization prevention, velocity vs quality, AI citation slots |
| Examples | 4/10 | Priority scoring formula with weight math is good. But no sample calendar entries, no good/bad calendar comparison |
| Specificity | 10/10 | Exact formula: (audit_urgency x3) + (keyword_opportunity x2) + (business_value x2) + (decay_signal x1). Tier cadences (4/8/12/month). Mix ratios (60/25/15 default). Seasonal lead time (4-6 weeks). |
| Completeness | 9/10 | 10-step build, 7-section output, 11-item quality gate. |
| Practical | 8/10 | Scoring formula is immediately actionable. Missing: sample calendar entry, sample quarterly view |
| Cross-service | 9/10 | Receives from 6 services, sends to 3 with exact data fields |
| **Average** | **8.2/10** | |

**Missing:** Sample calendar entries showing what a week looks like. A good/bad calendar comparison (data-driven vs. gut-feeling calendar).
**Recommendation:** PASS — add sample output entries. The scoring formula is excellent.

---

### content/topic-clusters.md (186 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 10/10 | 12 patterns: SERP-overlap clustering, pillar page specs, cluster size (8-15), interlinking rules, gap analysis, prioritization, cannibalization, hub-and-spoke visual, content type diversity, cross-cluster linking, authority measurement, maintenance lifecycle |
| Examples | 4/10 | No good/bad examples of cluster maps, pillar page outlines, or interlinking structures |
| Specificity | 9/10 | 60% overlap threshold, 2500-5000 word pillar, 8-15 cluster pages, minimum 5 viable cluster, bidirectional linking rules, 3-6 month authority timeline |
| Completeness | 9/10 | 10-step build, 6-section output, 11-item quality gate |
| Practical | 8/10 | Excellent interlinking architecture rules. Missing: sample cluster diagram, sample pillar page H2 outline |
| Cross-service | 9/10 | Receives from 5 services, sends to 5 with data fields |
| **Average** | **8.2/10** | |

**Missing:** Sample hub-and-spoke diagram (even text-based), sample pillar page outline, good/bad interlinking example.
**Recommendation:** PASS — add visual/text cluster diagram example and sample pillar outline.

---

### content/content-decay.md (184 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 10/10 | 12 patterns: four-action triage, CTR leading indicators, competitive displacement, revenue page escalation, freshness signals, cadence by page type, merge protocol, monitoring dashboard, seasonal vs true decay, post-recovery verification, AI Overview displacement, cluster-level decay |
| Examples | 5/10 | Anti-patterns provide implicit examples. No explicit good/bad triage outputs or sample decay detection tables |
| Specificity | 10/10 | >20% traffic drop over 8 weeks threshold, 15% CTR decline threshold, 4-week verification window, refresh effort (2-4 hours), rewrite effort (8-16 hours), merge effort (4-8 hours) |
| Completeness | 10/10 | 10-step build, 8-section output, 11-item quality gate. Covers the full lifecycle from detection to recovery verification |
| Practical | 9/10 | Triage framework with specific effort estimates and criteria is immediately actionable. AI Overview displacement detection is forward-looking |
| Cross-service | 9/10 | Receives from 6 services, sends to 6 with detailed data field specs |
| **Average** | **8.8/10** | |

**Missing:** Sample triage table showing 3-5 pages with different actions assigned and reasoning. Good/bad triage comparison.
**Recommendation:** PASS — excellent file. Add sample triage output.

---

### link-building/link-analysis.md (221 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 8/10 | 10 patterns: anchor text distribution, SpamBrain network analysis, toxic link tiering, competitor gap, velocity spikes, follow/nofollow ratio, DR distribution, lost links, link type diversity, disavow files |
| Examples | 3/10 | No good/bad examples at all. Anti-patterns table provides some context but no output samples, no sample anchor text distribution, no sample disavow file entries |
| Specificity | 8/10 | Anchor text ratios (branded 30-50%, exact <5%), velocity spike threshold (>3x average), dofollow ratio (60-80%), DR 61 average, 42 domains per campaign |
| Completeness | 7/10 | 8-step build process. Output structure is JSON spec but missing section-by-section deliverable guidance. Less narrative instruction than content files. |
| Practical | 7/10 | JSON output format is clear but lacks the "how to present findings to client" guidance that other files have. No sample report narrative. |
| Cross-service | 8/10 | Good cross-service table connecting to outreach, internal linking, anchor text, content brief, monthly report, local audit, geo audit |
| **Average** | **6.8/10** | |

**Missing:** Good/bad examples (anchor text distribution example, sample disavow file entry, sample competitor gap table). The file follows a different format (JSON output spec) than the content/technical files (section-by-section deliverable guidance). It's noticeably thinner on narrative instruction.
**Recommendation:** NEEDS IMPROVEMENT — add good/bad examples for anchor text distributions, sample disavow entries with comments, and expand the build process with more operational detail. Consider aligning format with the stronger content files.

---

### link-building/outreach.md (233 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 8/10 | 10 patterns: personalization mandatory, HARO/Featured.com strategy, proactive digital PR, SpamBrain-safe guest posts, A/B subject lines, follow-up sequences, anchor text safety, DR thresholds, content strategy connection, monthly tracking |
| Examples | 3/10 | No good/bad example emails. No sample subject lines. No sample pitch templates. This is a critical gap — outreach is one of the most template-driven services |
| Specificity | 8/10 | DR thresholds (50+ for PR, 30+ for guest posts), response time (<2 hours for HARO), 200-300 word HARO responses, 4-7 day follow-up spacing, ~$750 cost per link |
| Completeness | 7/10 | 10-step build process. JSON output is clear. But an agent writing outreach emails needs to see example emails — the file describes what to do but doesn't demonstrate it |
| Practical | 5/10 | **Critical gap:** No sample outreach emails, no sample subject lines, no sample guest post pitches. For a service that's fundamentally about writing persuasive emails, not showing examples is a major weakness |
| Cross-service | 8/10 | Good connections to link_analysis, anchor_text, content_brief, content_article, internal_linking, monthly_report, keyword_research |
| **Average** | **6.5/10** | |

**Missing:** Sample outreach emails (initial + follow-ups), sample subject line variants, sample guest post pitch, sample HARO response. These are the core deliverables and none are demonstrated.
**Recommendation:** NEEDS IMPROVEMENT — this file urgently needs good/bad email examples. Show a personalized initial outreach email vs. a generic template. Show good vs. bad subject lines. Show a HARO response example. Without these, an agent produces generic outreach.

---

### link-building/internal-linking.md (217 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 8/10 | 10 patterns: authority page → target linking, orphan elimination, silo structure, hub/spoke, descriptive anchor text, intentional equity flow, navigation vs content links, new content linking, deep page bridges, quarterly re-audits |
| Examples | 3/10 | No good/bad examples of internal link recommendations, no sample link equity flow visualization, no sample anchor text comparisons |
| Specificity | 7/10 | 3-5 contextual links per article, 0-1 inbound = orphan, hub links to every spoke and back, 5-15 spokes per hub. Less specific than best files. |
| Completeness | 7/10 | 10-step build process. JSON output structure. Covers the concepts well but lacks the granularity of the content files |
| Practical | 6/10 | Missing: sample recommendation entry ("FROM /blog/bathroom-remodel TO /services/plumbing with anchor 'residential plumbing services'"), sample equity flow diagram |
| Cross-service | 8/10 | Good connections to link_analysis, content_brief, content_article, site_audit, outreach, keyword_research, monthly_report |
| **Average** | **6.5/10** | |

**Missing:** Good/bad example of a link recommendation entry. Sample equity flow analysis. Sample anchor text comparison (descriptive vs. generic).
**Recommendation:** NEEDS IMPROVEMENT — add concrete examples of link recommendations with FROM/TO/ANCHOR format, and a before/after internal linking analysis.

---

### link-building/anchor-text.md (240 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 11 patterns: exact match danger line, profile-level evaluation, branded dominance, internal vs external rules, per-page analysis, naked URLs, image alt anchors, competitor benchmarking, historical trends, remediation via dilution, compound anchors |
| Examples | 3/10 | No good/bad examples. No sample anchor text distribution chart. No sample remediation plan entries |
| Specificity | 9/10 | Exact match <5% safe, >10% danger. Branded 30-50%. Generic 10-25%. Partial 5-15%. Good threshold definitions |
| Completeness | 8/10 | 10-step build process. JSON output. 12-item quality gate |
| Practical | 6/10 | Thresholds are actionable but missing: sample distribution analysis, sample remediation timeline, sample competitor benchmark table |
| Cross-service | 8/10 | Good connections to 7 services |
| **Average** | **7.2/10** | |

**Missing:** Sample anchor text distribution visualization, sample per-page analysis, good/bad anchor text examples in context.
**Recommendation:** PASS (borderline) — add a sample anchor text distribution with safe vs. danger assessment, and a sample remediation plan.

---

### local-seo/local-audit.md (250 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 8/10 | 10 patterns: GBP primary category, NAP consistency, review recency, geo-grid ranking, competitor comparison, schema validation, 2026 ranking factors, SAB vs storefront, photo geo-tagging, AI search for local |
| Examples | 4/10 | Anti-patterns provide implicit examples. No sample audit section, no sample competitor comparison table, no sample NAP inconsistency table |
| Specificity | 9/10 | GBP signals 32% weight, 40+ citations = 53% higher ranking, 520% more calls with 100+ photos, specific tier/platform hierarchy |
| Completeness | 9/10 | 10-step build, JSON output, 13-item quality gate. Comprehensive local audit scope. |
| Practical | 8/10 | 2026 ranking factor weights for prioritization are excellent. SAB vs storefront differentiation is important. |
| Cross-service | 9/10 | Connects to 8 services including geo_audit |
| **Average** | **7.8/10** | |

**Missing:** Sample NAP inconsistency table, sample competitor comparison table, sample GBP completeness audit section.
**Recommendation:** PASS — add sample output tables for NAP and competitor comparison.

---

### local-seo/gbp-optimization.md (245 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 8/10 | 10 patterns: primary category selection, Google Posts strategy, photo geo-tagging, Q&A seeding, service menu, hours management, attributes, SAB strategy, business description guidelines, monthly insights |
| Examples | 4/10 | No sample Google Posts, no sample Q&A entries, no sample business description. Anti-patterns provide some context |
| Specificity | 9/10 | 750-char description limit, 4 posts/month minimum, 10+ photos minimum, 150-300 char service descriptions, specific prohibited practices |
| Completeness | 8/10 | 11-step build, JSON output, 12-item quality gate |
| Practical | 7/10 | Missing: sample Google Post with image/CTA, sample Q&A entries, sample business description following guidelines |
| Cross-service | 8/10 | Connects to 7 services |
| **Average** | **7.3/10** | |

**Missing:** Sample Google Post, sample Q&A entries (10-15 recommended but none shown), sample business description, sample service menu entry.
**Recommendation:** PASS — add sample outputs for the key deliverables (post, Q&A, description, service entry).

---

### local-seo/review-management.md (257 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 8/10 | 10 patterns: prohibited practices, allowed practices, personalized responses, negative review framework, velocity as metric, 24-48 hour response, solicitation timing, competitor benchmarking, sentiment analysis, keyword inclusion in responses |
| Examples | 4/10 | No sample review responses for any tier. No sample solicitation email. No sample sentiment analysis output. Describes the framework but doesn't demonstrate it |
| Specificity | 9/10 | 24-hour negative response target, 1-3 days post-service solicitation timing, 150 reviews at 4.8 > 30 reviews at 5.0, specific prohibited/allowed practices lists |
| Completeness | 9/10 | 10-step build, JSON output, 13-item quality gate. Prohibited/allowed practices documentation is thorough |
| Practical | 6/10 | **Gap:** No sample review responses. Agents need to see what a personalized 5-star response vs. a templated 1-star recovery response looks like. The framework is described but not demonstrated. |
| Cross-service | 7/10 | Connects to 5 services |
| **Average** | **7.2/10** | |

**Missing:** Sample review responses for each tier (especially 1-star and 5-star). Sample solicitation email/SMS. Sample sentiment analysis output.
**Recommendation:** PASS (borderline) — urgently add sample review responses for at least 3 tiers. This is the core deliverable.

---

### local-seo/citations-nap.md (245 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 8/10 | 10 patterns: Single Source of Truth, Tier 1 priority, data aggregators, industry-specific directories, character-level consistency, duplicate detection, minimum citation targets, old address detection, structured vs unstructured, quarterly monitoring |
| Examples | 5/10 | Good implicit examples of NAP inconsistencies ("Suite 100" vs "Ste 100"). No sample Source of Truth document, no sample correction priority table |
| Specificity | 9/10 | 40+ citations = 53% higher ranking, specific Tier 1 list (Google, Bing, Apple Maps, Yelp, Facebook), specific aggregators (InfoGroup, Neustar, Factual), 10 minimum for small business |
| Completeness | 9/10 | 11-step build, JSON output, 13-item quality gate |
| Practical | 8/10 | Character-level comparison methodology is excellent. Tiered priority system is actionable |
| Cross-service | 8/10 | Connects to 6 services |
| **Average** | **7.8/10** | |

**Missing:** Sample Single Source of Truth document, sample correction table showing 3-5 directory entries with inconsistencies flagged.
**Recommendation:** PASS — add sample Source of Truth and sample correction priority table.

---

### ai-search/geo-audit.md (208 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 12 patterns: platform-specific (Google AIO, Perplexity, ChatGPT, Bing Copilot), first 40-60 words, original research, 12% overlap finding, quarterly freshness, fact density scoring, conversational specificity, schema for AI credibility |
| Examples | 4/10 | No sample citability audit entries, no sample platform-specific recommendation, no good/bad content opening comparisons |
| Specificity | 9/10 | 21+ Perplexity citations per response, 82% Perplexity responsiveness to 30-day content, 7.8% Wikipedia citation rate for ChatGPT, 45.8% old domain preference, 18.85% Bing Copilot new domain citations |
| Completeness | 8/10 | 9-step build, JSON output, 12-item quality gate. Covers all 4 major AI platforms |
| Practical | 7/10 | Platform-specific patterns are excellent. Missing: sample citability audit for a page, sample content improvement recommendation |
| Cross-service | 8/10 | Connects to 7 services |
| **Average** | **7.5/10** | |

**Missing:** Sample page citability audit, sample fact density score, good/bad opening paragraph comparison for AI citation.
**Recommendation:** PASS — add sample outputs. The platform-specific data points are excellent.

---

### ai-search/entity-optimization.md (243 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 8/10 | 10 patterns: 4+ platform threshold, consistency > breadth, sameAs array, Wikidata, entity home page, Knowledge Graph, industry directories, schema accuracy, health checks, third-party mentions |
| Examples | 3/10 | No sample sameAs array, no sample entity home page evaluation, no sample Wikidata entry outline, no sample Organization schema block |
| Specificity | 8/10 | 2.8x citation likelihood from 4+ platforms, specific platform checklist (LinkedIn, Crunchbase, Wikidata, etc.), quarterly audit cadence |
| Completeness | 8/10 | 8-step build, JSON output, 11-item quality gate |
| Practical | 6/10 | Missing: sample Organization schema with sameAs, sample entity home page evaluation showing good vs. thin About page, sample Wikidata property list |
| Cross-service | 7/10 | Connects to 6 services |
| **Average** | **6.7/10** | |

**Missing:** Sample Organization schema JSON-LD with comprehensive sameAs array. Sample entity home page evaluation. Sample Wikidata entry. The file describes requirements well but doesn't show what good output looks like.
**Recommendation:** NEEDS IMPROVEMENT — add a complete sample Organization schema with sameAs, and a sample entity home page evaluation (good vs. bad About page).

---

### analytics/analytics-audit.md (241 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 8/10 | 10 patterns: data retention, conversion tracking, internal filters, GSC property type, UTM naming, attribution models, cross-domain, anomaly baseline, phone call tracking, sitemap in GSC |
| Examples | 4/10 | Anti-patterns provide some context. No sample audit finding, no sample conversion tracking matrix, no sample UTM taxonomy |
| Specificity | 8/10 | 14-month retention (vs 2-month default), domain vs URL-prefix property types, specific conversion types listed (forms, calls, purchases, chats, downloads, video, scroll) |
| Completeness | 8/10 | 10-step build, JSON output, 12-item quality gate |
| Practical | 7/10 | Conversion completeness methodology is good. Missing: sample GA4 configuration checklist, sample UTM taxonomy document |
| Cross-service | 8/10 | "Analytics audit is P0 prerequisite" — connects to all services. 6 specific connections listed |
| **Average** | **7.2/10** | |

**Missing:** Sample UTM taxonomy, sample conversion tracking audit table, sample anomaly baseline document.
**Recommendation:** PASS — add sample outputs for key sections.

---

### analytics/monthly-report.md (281 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 10 patterns: business impact framing, MoM+YoY, action-outcome connection, 8th grade readability, standalone executive summary, anomaly flagging, leading/lagging indicators, keywords at risk, content performance attribution, specific next steps |
| Examples | 5/10 | Business impact framing examples inline ("35% more potential customers found your business through Google"). No sample executive summary, no sample keyword performance section |
| Specificity | 9/10 | 8-section report structure fully defined, 8th grade reading level, 5 business days delivery target (instant via cron), 64% budget increase correlation with report understanding |
| Completeness | 9/10 | 9-step build, 8-section structure, JSON output, 12-item quality gate. Automated cron execution via Vercel |
| Practical | 8/10 | 8-section structure is immediately implementable. Automated monthly snapshot pipeline is technically detailed |
| Cross-service | 9/10 | Receives from ALL services. 9 specific connections listed |
| **Average** | **8.2/10** | |

**Missing:** Sample executive summary paragraph (good vs. bad). Sample keyword performance section. Sample "next steps" section.
**Recommendation:** PASS — add good/bad executive summary examples. This is the most client-facing deliverable.

---

### competitor/competitor-analysis.md (240 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | 11 patterns: SERP-overlap competitors, content gap vs keyword gap distinction, share of voice, page-level attribution, backlink gap with quality filter, link velocity, SERP features, three tiers of opportunities, blue ocean, competitive intelligence shelf life, aspirational competitor |
| Examples | 4/10 | No sample share of voice table, no sample content gap matrix, no sample competitive positioning summary |
| Specificity | 9/10 | DR 20+ quality filter, 3-5 competitors + 1 aspirational + 1 adjacent, share of voice calculation formula, three-tier prioritization framework |
| Completeness | 9/10 | 9-step build, JSON output with chain data extraction, 12-item quality gate |
| Practical | 8/10 | Share of voice calculation methodology, page-level attribution analysis, blue ocean identification. Missing: sample output tables |
| Cross-service | 9/10 | Auto-chains to content_brief and keyword_research. Connects to 7 services. Chain data extraction format specified |
| **Average** | **8.0/10** | |

**Missing:** Sample share of voice table, sample content gap matrix, sample competitive positioning paragraph.
**Recommendation:** PASS — add sample output tables for the key deliverable sections.

---

### cross-service/data-flow.md (302 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | Maps all 26 services across 5 phases, defines 9 critical data handoffs, covers client context persistence, chain data extraction, data enrichment pipeline, monthly snapshot pipeline, model routing |
| Examples | 7/10 | Includes actual JSON examples for chain data extraction (keyword_research, site_audit, competitor_analysis, link_analysis, content_decay_audit, local_seo_audit). Good format examples. |
| Specificity | 10/10 | Exact function names (extractChainData, writeBackClientContext, fetchClientSeoContext), table names (client_seo_context, client_metrics_history), API endpoints, model routing per service |
| Completeness | 9/10 | Comprehensive system architecture document. Missing: error handling, retry logic, rate limiting |
| Practical | 9/10 | Service chain map, auto-chain eligibility, provenance tracking. Highly operational |
| Cross-service | 10/10 | This IS the cross-service document. Maps every connection. |
| **Average** | **9.0/10** | |

**Missing:** Error handling documentation, what happens when a chain fails, rate limiting considerations.
**Recommendation:** PASS — excellent architecture reference. One of the best files.

---

### cross-service/quality-gates.md (220 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 8/10 | 8 universal criteria, per-category criteria for 6 categories, common quality failures with prevention/detection |
| Examples | 7/10 | Good inline examples: "Your homepage loads in 4.2 seconds; compress the hero image to get under 2.5 seconds" vs "Consider improving page speed." The "test" questions for each gate are practical. |
| Specificity | 9/10 | Specific test questions per gate ("Could a developer act on this without asking 'which page?'"), CWV thresholds, deliverable status flow diagram |
| Completeness | 8/10 | Covers all 26 services by category. 8 common failure types with prevention. Missing: scoring rubric for how to numerically evaluate gates |
| Practical | 9/10 | The test questions are immediately usable as a review checklist. "Which page?" test, "so what?" test, "coffee conversation" test are memorable. |
| Cross-service | 9/10 | Covers quality gates across all service categories |
| **Average** | **8.3/10** | |

**Missing:** Numerical scoring rubric (how do failures translate to score deductions). Automated check details beyond JSON parsing.
**Recommendation:** PASS — strong quality gate document.

---

### cross-service/client-lifecycle.md (283 lines)

| Criteria | Score | Notes |
|---|---|---|
| Depth | 9/10 | Covers Phase 0 (onboarding), Phase 1 (foundation), Phase 2 (quick wins), Phase 3+ (compound/scale), strategy pivot triggers (7 types), metrics tracking, tier-based service availability, flywheel visualization |
| Examples | 6/10 | ASCII flow diagrams for Phase 1 dependencies and the flywheel. Strategy pivot triggers are described as scenarios with signal/response pairs. No sample client timeline. |
| Specificity | 9/10 | Week-by-week Phase 2 breakdown, monthly cycle by week, content velocity progression (2-4 → 4-8 → 6-12 → 4-8), link building progression, tier-based feature table |
| Completeness | 9/10 | Full lifecycle from onboarding to month 12+. Strategy pivot triggers cover all major scenarios |
| Practical | 9/10 | Monthly cadence table is immediately implementable. Auto-chaining rules specified. Gate requirements clear |
| Cross-service | 10/10 | This IS the lifecycle orchestration document — maps all 26 services into temporal phases |
| **Average** | **8.7/10** | |

**Missing:** Sample client timeline showing a real engagement. Sample Phase 1 report showing what gets delivered in month 1.
**Recommendation:** PASS — excellent operational document.

---

## Priority Improvements

### Tier 1 — Fix These First (highest impact on deliverable quality)

1. **outreach.md** (avg 6.5) — **Most critical improvement needed.** Add 2-3 sample outreach emails (personalized initial email, value-add follow-up, clean exit). Add 3-5 sample subject line variants. Add a sample HARO response. Add a sample guest post pitch. This file describes what to do but never shows what good output looks like — for a service that is fundamentally about writing persuasive copy, this is a critical gap.

2. **entity-optimization.md** (avg 6.7) — Add a complete sample Organization JSON-LD block with comprehensive sameAs array (10+ URLs). Add a sample entity home page evaluation comparing a thin About page vs. a comprehensive one. Add a sample Wikidata property list.

3. **link-analysis.md** (avg 6.8) — Add a sample anchor text distribution analysis (showing safe vs. danger profile). Add a sample disavow file section with domain-level and URL-level entries with comments. Add a sample competitor gap table (3-5 entries).

4. **internal-linking.md** (avg 6.5) — Add 3-5 sample link recommendations in FROM/TO/ANCHOR/RATIONALE format. Add a sample equity flow analysis showing a bottleneck and its resolution.

### Tier 2 — Improve These Next

5. **schema-markup.md** (avg 7.3) — Add complete JSON-LD code templates for Organization, Article, LocalBusiness, BreadcrumbList, and Product. These are the most frequently generated types and agents need reference code blocks to ensure valid output.

6. **review-management.md** (avg 7.2) — Add sample review responses for at least 5-star, 3-star, and 1-star tiers. Show personalization in action. Add a sample solicitation email.

7. **gbp-optimization.md** (avg 7.3) — Add a sample Google Post (with topic, image description, body text, CTA). Add 3-5 sample Q&A entries. Add a sample business description following Google guidelines.

### Tier 3 — Polish These

8. **All content files except content-article.md** — Add 1-2 good/bad output examples following the pattern set by content-article.md. content-article.md's good/bad examples for opening hooks, H2 structure, and conclusions are the gold standard — replicate this pattern in content-brief (sample SERP analysis), keyword-research (sample keyword database entries), content-calendar (sample calendar entries), topic-clusters (sample cluster diagram), and content-decay (sample triage table).

9. **All technical SEO files** — Add sample output sections showing what a finding row looks like in the final deliverable. The anti-patterns tables partially compensate but agents benefit from seeing complete, positive examples.

10. **analytics-audit.md and monthly-report.md** — Add a sample executive summary (good vs. bad) and a sample UTM taxonomy. The monthly report is the most client-facing deliverable and should demonstrate what good narrative framing looks like.

---

## Structural Observations

### Format Inconsistency Between Categories

The **content** and **technical SEO** files follow a consistent, strong format: What This Produces → Professional Standard → Build Process → Critical Patterns (with WHEN/HOW/WHY/DON'T) → Data Sources → Output Structure → Quality Gate → Cross-Service Connections → Anti-Patterns.

The **link-building** files follow a slightly different format and include model/agent metadata at the top. They're also thinner overall and use JSON output specs rather than section-by-section deliverable descriptions. Consider aligning these to the stronger format.

### Line Count vs. Quality Correlation

Files under 200 lines flagged for review:
- schema-markup.md (158 lines) — thin on code examples. Needs JSON-LD templates.
- redirect-management.md (162 lines) — actually fine despite length. Dense and complete.
- on-page-audit.md (165 lines) — fine. Dense and well-structured.
- cwv-optimization.md (169 lines) — fine. Technically excellent.
- technical-audit.md (173 lines) — fine. Thorough despite length.
- site-audit.md (177 lines) — fine.
- content-decay.md (184 lines) — excellent despite length.
- topic-clusters.md (186 lines) — fine.
- content-calendar.md (191 lines) — fine.

**Conclusion:** Line count alone is not a reliable quality indicator. The content-article.md (265 lines) sets the quality bar, but several shorter files (cwv-optimization at 169 lines) are equally excellent for their domain.

### The Gold Standard

**content-article.md is the benchmark file.** It demonstrates:
- Good AND bad examples with extended block quotes
- 15 critical patterns (proportional to task complexity)
- Specific numbers for every recommendation
- Complete build process from brief ingestion to final quality pass
- Full cross-service connection map with data field transfer specs
- Anti-patterns table with before/after comparisons

Every other file should be compared against this standard.
