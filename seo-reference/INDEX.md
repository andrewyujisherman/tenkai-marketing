# SEO Reference System — Agent Task Index

## Purpose
These reference files give each Tenkai agent the knowledge to produce **professional-grade** deliverables — the kind a $5,000/month agency would deliver, not a $500 freelancer.

Every agent reads: `agency-model.md` (the system) + the specific file(s) for their task.

---

## Service Type → Reference File Routing

| Service Type | Agent | Reference File(s) |
|---|---|---|
| `site_audit` | Haruki | `technical-seo/site-audit.md` + `cross-service/data-flow.md` |
| `technical_audit` | Kenji | `technical-seo/technical-audit.md` |
| `on_page_audit` | Mika | `technical-seo/on-page-audit.md` + `link-building/internal-linking.md` |
| `schema_generation` | Kenji | `technical-seo/schema-markup.md` |
| `redirect_map` | Kenji | `technical-seo/redirect-management.md` |
| `robots_sitemap` | Kenji | `technical-seo/redirect-management.md` |
| `keyword_research` | Haruki | `content/keyword-research.md` + `cross-service/data-flow.md` |
| `content_brief` | Sakura | `content/content-brief.md` + `content/keyword-research.md` (for context) |
| `content_article` | Sakura | `content/content-article.md` |
| `content_rewrite` | Sakura | `content/content-article.md` + `content/content-decay.md` |
| `content_calendar` | Ryo | `content/content-calendar.md` + `cross-service/data-flow.md` |
| `topic_cluster_map` | Ryo | `content/topic-clusters.md` |
| `content_decay_audit` | Yumi | `content/content-decay.md` |
| `link_analysis` | Takeshi | `link-building/link-analysis.md` + `link-building/anchor-text.md` |
| `outreach_emails` | Takeshi | `link-building/outreach.md` |
| `guest_post_draft` | Takeshi | `link-building/outreach.md` + `content/content-article.md` |
| `directory_submissions` | Takeshi | `local-seo/citations-nap.md` |
| `local_seo_audit` | Hana | `local-seo/local-audit.md` |
| `gbp_optimization` | Hana | `local-seo/gbp-optimization.md` |
| `review_responses` | Hana | `local-seo/review-management.md` |
| `review_campaign` | Hana | `local-seo/review-management.md` |
| `geo_audit` | Daichi | `ai-search/geo-audit.md` |
| `entity_optimization` | Daichi | `ai-search/entity-optimization.md` |
| `analytics_audit` | Yumi | `analytics/analytics-audit.md` |
| `monthly_report` | Yumi | `analytics/monthly-report.md` + `cross-service/data-flow.md` |
| `meta_optimization` | Mika | `technical-seo/on-page-audit.md` |

---

## Folder Structure

```
seo-reference/
├── INDEX.md                    ← you are here
├── agency-model.md             ← how a real SEO agency works (the system)
├── technical-seo/
│   ├── site-audit.md           ← comprehensive site health assessment
│   ├── technical-audit.md      ← deep technical crawl analysis
│   ├── on-page-audit.md        ← page-level optimization review
│   ├── schema-markup.md        ← structured data implementation
│   ├── redirect-management.md  ← redirects, robots.txt, sitemaps
│   └── cwv-optimization.md     ← Core Web Vitals (shared reference)
├── content/
│   ├── keyword-research.md     ← keyword discovery + clustering + intent
│   ├── content-brief.md        ← briefing writers for SEO content
│   ├── content-article.md      ← writing + optimizing articles
│   ├── content-calendar.md     ← editorial planning + scheduling
│   ├── topic-clusters.md       ← pillar/cluster architecture
│   └── content-decay.md        ← detecting + fixing declining content
├── link-building/
│   ├── link-analysis.md        ← backlink profile audit + strategy
│   ├── outreach.md             ← email outreach + guest posting + digital PR
│   ├── internal-linking.md     ← site architecture + link equity flow
│   └── anchor-text.md          ← distribution safety + optimization
├── local-seo/
│   ├── local-audit.md          ← local search presence assessment
│   ├── gbp-optimization.md     ← Google Business Profile management
│   ├── review-management.md    ← review responses + solicitation
│   └── citations-nap.md        ← citation building + NAP consistency
├── ai-search/
│   ├── geo-audit.md            ← AI search visibility assessment
│   └── entity-optimization.md  ← knowledge graph + entity signals
├── analytics/
│   ├── analytics-audit.md      ← GA4/GSC setup + tracking review
│   └── monthly-report.md       ← performance reporting + narrative
├── competitor/
│   └── competitor-analysis.md  ← competitive intelligence
└── cross-service/
    ├── data-flow.md            ← how services feed each other
    ├── quality-gates.md        ← review criteria before client delivery
    └── client-lifecycle.md     ← what to do at each engagement stage
```

---

## Reference File Format

Every file follows this structure:
1. **What This Produces** — The deliverable, in one sentence
2. **Professional Standard** — What separates a $500 output from a $5,000 output
3. **Build Process** — Ordered steps to produce the deliverable
4. **Critical Patterns** — WHEN/HOW/WHY/DON'T for key decisions
5. **Data Sources** — What real data to ingest (APIs, crawl data, tools)
6. **Output Structure** — Exact sections the deliverable must contain
7. **Quality Gate** — Checklist before output reaches client
8. **Cross-Service Connections** — What this receives from / sends to other services
9. **Anti-Patterns** — What to avoid, with real examples
