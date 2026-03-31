# Data Flow — Cross-Service Reference

## What This Produces

A complete map of how Tenkai's 26 services connect, what data transfers between them, and how the system ensures no service operates in isolation. This reference defines the service chain architecture, client context persistence, and the data formats that flow between services.

---

## The 26 Services by Phase

### Phase 1: Discovery & Audit (6 services)
| Service | Agent | Deliverable Type |
|---------|-------|-----------------|
| `site_audit` | Haruki | audit_report |
| `technical_audit` | Kenji | technical_report |
| `on_page_audit` | Mika | on_page_report |
| `local_seo_audit` | Hana | local_report |
| `analytics_audit` | Yumi | audit_report |
| `geo_audit` | Daichi | geo_report |

### Phase 2: Research & Strategy (3 services)
| Service | Agent | Deliverable Type |
|---------|-------|-----------------|
| `keyword_research` | Haruki | keyword_list |
| `competitor_analysis` | Haruki | competitive_report |
| `entity_optimization` | Daichi | entity_report |

### Phase 3: Planning (3 services)
| Service | Agent | Deliverable Type |
|---------|-------|-----------------|
| `content_calendar` | Ryo | content_plan |
| `topic_cluster_map` | Ryo | cluster_map |
| `content_brief` | Sakura | content_draft |

### Phase 4: Execution (10 services)
| Service | Agent | Deliverable Type |
|---------|-------|-----------------|
| `content_article` | Sakura | article |
| `content_rewrite` | Sakura | article |
| `meta_optimization` | Mika | meta_report |
| `schema_generation` | Kenji | schema_code |
| `redirect_map` | Kenji | redirect_config |
| `robots_sitemap` | Kenji | robots_config |
| `gbp_optimization` | Hana | gbp_report |
| `outreach_emails` | Takeshi | outreach_templates |
| `guest_post_draft` | Takeshi | article |
| `directory_submissions` | Takeshi | directory_profiles |

### Phase 5: Measurement (4 services)
| Service | Agent | Deliverable Type |
|---------|-------|-----------------|
| `monthly_report` | Yumi | performance_report |
| `content_decay_audit` | Yumi | decay_report |
| `link_analysis` | Takeshi | link_report |
| `review_responses` | Hana | review_responses |
| `review_campaign` | Hana | campaign_templates |

---

## The Service Chain Map (CHAIN_MAP)

Defined in `src/lib/service-chain.ts`. When a service completes, it can auto-trigger downstream services.

```
keyword_research    → content_calendar, content_brief
site_audit          → redirect_map, schema_generation, meta_optimization
link_analysis       → outreach_emails
competitor_analysis → content_brief, keyword_research
content_decay_audit → content_rewrite
local_seo_audit     → gbp_optimization
```

**Auto-chain eligibility:** Only clients on `growth`, `pro`, `admin`, or `demo` tiers get auto-chaining. Checked by `shouldAutoChain()` and filtered by `tierAllowsRequestType()`.

**Provenance tracking:** Chained requests have `triggered_by` set to the parent request's ID. This creates a traceable chain: keyword_research → content_brief → (approved) → content_article.

---

## The 9 Critical Data Handoffs

### 1. Technical Audit → Content Calendar
**What transfers:** Thin pages, missing topic coverage, keyword cannibalization findings
**Format:** `from_site_audit` array (up to 10 issues), `site_health_score`
**How:** Audit output → content calendar priorities for what needs to be written or rewritten

### 2. Technical Audit → Technical Fix Queue
**What transfers:** Crawl issues, CWV problems, schema gaps, broken links
**Format:** `broken_urls` array (up to 20 URLs), `site_health_score`
**How:** Audit output → redirect_map, schema_generation, meta_optimization (via CHAIN_MAP)

### 3. Keyword Research → Content Briefs
**What transfers:** Keyword clusters, primary/secondary keywords, search intent, SERP data
**Format:** `seed_keywords` (comma-separated string), `from_keyword_research` array (up to 10 keywords)
**How:** keyword_research output → content_brief and content_calendar (via CHAIN_MAP)

### 4. Competitor Analysis → Content Strategy
**What transfers:** Content gaps (topics competitors cover that the client doesn't)
**Format:** `competitor_domains` (up to 5), `keyword_gaps` (up to 15), `from_competitor_analysis` (up to 10 topics)
**How:** competitor_analysis output → content_brief and keyword_research (via CHAIN_MAP)

### 5. Competitor Analysis → Link Strategy
**What transfers:** Backlink gaps, referring domains competitors have
**Format:** Stored in `client_seo_context.competitors`
**How:** Competitor data persisted to context → link_analysis reads competitor context

### 6. Content Published → Link Outreach
**What transfers:** New URLs to build links to, topical angles for pitching
**Format:** Content articles promoted to `content_posts` table → Takeshi (link_analysis → outreach_emails chain)
**How:** content_article output creates content_posts row → link building targets from published URLs

### 7. Link Analysis → Internal Linking
**What transfers:** Authority pages that should link to priority ranking targets
**Format:** `backlink_count`, `link_opportunities` (up to 10), `competitor_links` (up to 5)
**How:** link_analysis output → outreach_emails (via CHAIN_MAP) + authority donor pages inform on_page_audit

### 8. Content Decay Audit → Content Rewrite Queue
**What transfers:** Declining pages triaged: refresh vs. rewrite vs. merge vs. retire
**Format:** `decaying_pages` (up to 5), `target_url` (top priority page), `from_decay_audit: true`
**How:** content_decay_audit output → content_rewrite (via CHAIN_MAP)

### 9. All Execution → Monthly Report
**What transfers:** Every deliverable created in the reporting period
**Format:** Query `deliverables` table by client_id and date range
**How:** Monthly cron aggregates all deliverables → monthly report sections

---

## Client SEO Context — Persistent Cross-Service Memory

**Table:** `client_seo_context` (Supabase, one row per client, upserted on conflict)

**Purpose:** Every service request reads the accumulated context from prior services. This is how keyword_research knows about audit findings, content_brief knows about keyword data, and monthly_report knows about everything.

### What Gets Written Back (by `writeBackClientContext()`)

| Service Type | Context Stored | Fields |
|---|---|---|
| `keyword_research` | Top 20 keywords with positions and trends | `top_keywords` |
| `site_audit`, `technical_audit`, `on_page_audit`, `local_seo_audit` | Top 20 audit findings with severity + health score + CWV status | `audit_findings`, `last_audit_score`, `cwv_status` |
| `competitor_analysis` | Top 10 competitor domains | `competitors` |
| `content_calendar` | Top 20 content gaps with priority | `content_gaps` |

### What Gets Read (by `fetchClientSeoContext()`)

Every service request receives a `CLIENT SEO CONTEXT` block prepended to the system prompt containing:
- Business context: industry, target audience, geography, goals
- Last audit score
- CWV status
- Top 5 keywords with positions
- Top 3 critical/high-severity issues
- Top 3 content gaps
- Top 3 competitors

This is capped at ~500 tokens to keep prompts efficient.

---

## How Data Transfers Between Services

### Chain Data Extraction (`extractChainData()`)

When a service completes and triggers downstream services, `extractChainData()` extracts the relevant findings from the completed deliverable and formats them as `parameters` on the chained service request.

**keyword_research → downstream:**
```json
{
  "chain_source": "keyword_research",
  "target_url": "...",
  "seed_keywords": "keyword1, keyword2, keyword3",
  "from_keyword_research": ["keyword1", "keyword2", ...]
}
```

**site_audit → downstream:**
```json
{
  "chain_source": "site_audit",
  "target_url": "...",
  "site_health_score": 72,
  "from_site_audit": [{"issue": "...", "severity": "..."}],
  "broken_urls": ["url1", "url2"]
}
```

**competitor_analysis → downstream:**
```json
{
  "chain_source": "competitor_analysis",
  "target_url": "...",
  "competitor_domains": ["comp1.com", "comp2.com"],
  "keyword_gaps": ["kw1", "kw2"],
  "from_competitor_analysis": ["topic1", "topic2"]
}
```

**link_analysis → downstream:**
```json
{
  "chain_source": "link_analysis",
  "target_url": "...",
  "backlink_count": 450,
  "link_opportunities": [...],
  "competitor_links": [...]
}
```

**content_decay_audit → downstream:**
```json
{
  "chain_source": "content_decay_audit",
  "target_url": "most-decayed-page-url",
  "decaying_pages": [...],
  "from_decay_audit": true
}
```

**local_seo_audit → downstream:**
```json
{
  "chain_source": "local_seo_audit",
  "target_url": "...",
  "local_issues": [...],
  "gbp_gaps": [...]
}
```

---

## Data Enrichment Pipeline

When a service request is processed (`processServiceRequest()`), data is enriched based on request type:

### URL-Based Services (20 services)
All services except keyword_research, content_brief, content_article, content_calendar, topic_cluster_map, and content_rewrite get:
1. **Site scraping** — title, meta description, headings, body text, link counts
2. **Site data enrichment** — PageSpeed API, GSC data, GA4 data (via `fetchAllSiteData()`)
3. **Google Search grounding** — Gemini can use Google Search for real-time data

### Crawl-Enhanced Services (3 services)
`site_audit`, `technical_audit`, `link_analysis` additionally get:
- **BFS crawl** — multi-page crawl via `crawlSite()` for comprehensive site analysis

### Keyword-Enriched Services (7 services)
`keyword_research`, `content_brief`, `content_article`, `content_calendar`, `topic_cluster_map`, `content_rewrite`, `content_decay_audit` get:
- **Real SERP data** — `fetchKeywordSerpData()` via Serper API for up to 5 seed keywords

### All Services
- **Client SEO context** — accumulated knowledge from prior service executions
- **Chain parameters** — if triggered by another service, the extracted chain data

---

## The Monthly Snapshot Pipeline

### `captureMonthlySnapshot()` in `src/lib/metrics-snapshot.ts`

Runs on the 1st of each month. Captures and stores:

| Metric | Source | Fallback |
|--------|--------|----------|
| `organic_traffic` | GA4 sessions (if OAuth connected) | null |
| `keyword_count_page1` | GSC top queries with position ≤ 10 | null |
| `keyword_count_top10` | Same as page1 (reserved for future granularity) | null |
| `health_score` | `audits` table → `deliverables` table | null |
| `backlink_count` | null (populated by link_analysis deliverable) | null |
| `content_pieces_published` | `content_posts` table where status = 'published' | 0 |
| `domain_authority_estimate` | null (reserved) | null |

**Storage:** `client_metrics_history` table, upserted on `(client_id, snapshot_date)`. Up to 13 months retrieved by `getClientHistory()` for MoM and YoY comparison.

---

## Model Routing by Service

| Model | Services |
|-------|----------|
| **gemini-2.5-pro** | site_audit, technical_audit, analytics_audit, content_brief, on_page_audit, content_calendar, local_seo_audit, gbp_optimization, geo_audit, competitor_analysis, monthly_report, content_article, outreach_emails, guest_post_draft |
| **gemini-2.5-flash** | keyword_research, link_analysis, topic_cluster_map, meta_optimization, content_decay_audit, entity_optimization, content_rewrite, schema_generation, redirect_map, robots_sitemap, directory_submissions, review_responses, review_campaign |

---

## The SEO Flywheel in Service Terms

```
Technical Health (site_audit, technical_audit → fixes)
    ↓
Content Gets Discovered (keyword_research → content_brief → content_article → indexed)
    ↓
Quality Content Earns Links (outreach_emails, guest_post_draft → links acquired)
    ↓
Links Build Authority (link_analysis confirms → authority grows)
    ↓
Authority Makes Ranking Easier (harder keywords become achievable)
    ↓
Rankings Generate Data (GSC data → client_metrics_history)
    ↓
Data Informs Better Content (monthly_report → competitor_analysis → next cycle)
    ↓
    └── back to Technical Health (content_decay_audit → refresh cycle)
```

Each phase feeds the next. No service operates in isolation.

---

## Output Examples

### Good Example: Data Handoff (keyword_research → content_brief)

> **Chain data passed from keyword_research to content_brief:**
>
> ```json
> {
>   "chain_source": "keyword_research",
>   "target_url": "https://example.com",
>   "seed_keywords": "best crm for small business, crm for startups, free crm software",
>   "from_keyword_research": [
>     {
>       "keyword": "best crm for small business",
>       "volume": 14800,
>       "volume_source": "serper_api",
>       "difficulty_tier": "medium_term",
>       "intent": "commercial",
>       "intent_subtype": "best_of",
>       "serp_features": ["ai_overview", "featured_snippet_list", "paa_x6"],
>       "cpc": 12.40,
>       "cluster_id": "crm-selection",
>       "funnel_stage": "mofu",
>       "top_3_competitors": [
>         {"url": "hubspot.com/blog/best-crm-small-business", "word_count": 4200, "format": "listicle"},
>         {"url": "pcmag.com/picks/the-best-crm-software", "word_count": 5100, "format": "listicle"},
>         {"url": "forbes.com/advisor/business/best-crm-small-business", "word_count": 3800, "format": "listicle"}
>       ]
>     },
>     {
>       "keyword": "crm for startups",
>       "volume": 3100,
>       "volume_source": "serper_api",
>       "difficulty_tier": "quick_win",
>       "intent": "commercial",
>       "intent_subtype": "best_of",
>       "serp_features": ["paa_x4"],
>       "cpc": 8.75,
>       "cluster_id": "crm-selection",
>       "funnel_stage": "mofu",
>       "serp_overlap_with_primary": 0.48
>     }
>   ],
>   "cluster_context": {
>     "cluster_id": "crm-selection",
>     "combined_volume": 40000,
>     "pillar_exists": false,
>     "existing_cluster_pages": 0,
>     "recommended_format": "listicle",
>     "recommended_word_count": 4500
>   },
>   "paa_questions": [
>     "What is the best CRM for a small business?",
>     "Is HubSpot CRM really free?",
>     "What CRM do most small businesses use?",
>     "How much does a CRM cost for small business?",
>     "What is the easiest CRM to use?",
>     "Do I need a CRM for my small business?"
>   ]
> }
> ```
>
> **What the content_brief agent does with this:**
> - Uses `top_3_competitors` to skip its own SERP scraping (data already collected)
> - Uses `serp_features` to design featured snippet targeting (list format)
> - Uses `paa_questions` to structure H2 sections in the brief outline
> - Uses `recommended_word_count` from cluster context as the target
> - Uses `difficulty_tier` to calibrate E-E-A-T requirements (medium_term = need strong signals)

### Bad Example: Data Handoff (keyword_research → content_brief)

> ```json
> {
>   "chain_source": "keyword_research",
>   "target_url": "https://example.com",
>   "seed_keywords": "crm, crm software, best crm",
>   "from_keyword_research": ["crm", "crm software", "best crm", "crm tools", "customer management"]
> }
> ```

**Why it fails:** `from_keyword_research` is a flat string array with no volume, difficulty, intent, or SERP data attached. The content_brief agent receives keyword strings but has to research everything else from scratch — the chain adds no value. No cluster context, no competitor data, no PAA questions passed forward. The "seed_keywords" are generic head terms, not the specific researched targets. This handoff forces the downstream service to redo 80% of the work the upstream service already completed.

---

### Good Example: Data Handoff (content_decay_audit → content_rewrite)

> ```json
> {
>   "chain_source": "content_decay_audit",
>   "target_url": "https://example.com/blog/best-savings-accounts",
>   "from_decay_audit": true,
>   "decaying_pages": [
>     {
>       "url": "/blog/best-savings-accounts",
>       "primary_keyword": "best savings accounts",
>       "clicks_change_pct": -40,
>       "impressions_trend": "stable",
>       "ctr_trend": "declining",
>       "ctr_change": "4.7% → 2.8%",
>       "position_change": "4.2 → 6.8",
>       "last_updated": "2025-01-15",
>       "triage_action": "rewrite",
>       "decay_type": "traffic_and_position",
>       "competitive_displacement": {
>         "new_leader": "nerdwallet.com/best-savings-accounts",
>         "leader_word_count": 5200,
>         "leader_updated": "2026-02-28",
>         "leader_advantages": ["interactive rate comparison tool", "updated weekly", "author is certified financial planner"]
>       },
>       "rewrite_instructions": [
>         "Restructure as weekly-updated rate comparison (NerdWallet's key advantage)",
>         "Add interactive rate comparison table with sorting",
>         "Cite FDIC insurance details for every bank listed",
>         "Include author credentials — needs named financial expert",
>         "Target word count: 5,500 (exceed NerdWallet's 5,200)"
>       ],
>       "revenue_impact": "$4,200/mo affiliate revenue at risk"
>     }
>   ]
> }
> ```

### Bad Example: Data Handoff (content_decay_audit → content_rewrite)

> ```json
> {
>   "chain_source": "content_decay_audit",
>   "target_url": "https://example.com/blog/best-savings-accounts",
>   "from_decay_audit": true,
>   "decaying_pages": ["/blog/best-savings-accounts"]
> }
> ```

**Why it fails:** The content_rewrite agent receives a URL and nothing else. No decline metrics, no competitive context, no specific rewrite instructions. The rewrite agent would need to run its own GSC analysis, SERP comparison, and content audit — work the decay audit already did. No revenue impact data means the rewrite can't be prioritized correctly. This handoff is essentially saying "rewrite this page" without explaining why it's declining or what needs to change — the definition of a wasted chain.
