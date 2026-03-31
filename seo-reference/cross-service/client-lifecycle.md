# Client Lifecycle — Cross-Service Reference

## What This Produces

A complete map of what services run at each stage of a client engagement — from onboarding through long-term compounding. Defines the monthly cadence, strategy pivot triggers, and how the system orchestrates 26 services into a coherent SEO campaign.

---

## Phase 0: Onboarding (Week 1-2) — SEQUENTIAL

This is where trust is set or lost. Speed and professionalism matter more than depth.

### Activities (in order)
1. **Welcome + onboarding questionnaire** — Collect business goals, ICP (ideal customer profile), competitors, content assets, geographic focus
2. **Credentials collection** — GSC access, GA4 access, CMS access (this is the biggest delay point)
3. **Account setup** — Client record in Supabase, tier assignment, OAuth integrations configured
4. **Baseline metrics locked** — First `captureMonthlySnapshot()` run. This is the "before" picture.
5. **Kickoff** — Confirm goals, KPIs, communication cadence, and expectations

### Services Triggered
| Service | Why Now | Agent |
|---------|---------|-------|
| `analytics_audit` | Verify tracking works before measuring anything | Yumi |
| `site_audit` | Establish baseline health + discover critical issues | Haruki |

### Gate
**Client confirms goals and priorities.** Nothing else starts until this gate passes. The analytics audit must confirm data is flowing correctly before any performance baseline is meaningful.

---

## Phase 1: Foundation (Month 1) — MOSTLY SEQUENTIAL

The research phase. Every audit and research service runs to build the strategic picture.

### Activities

```
                    ┌─── Keyword Research ──────┐
                    │                           │
Technical Audit ────┤                           ├──→ Strategy Synthesis
                    │                           │
                    ├─── Competitor Analysis ───┘
                    │
                    └─── Content Audit (existing pages)

                    ┌─── Analytics Setup (parallel)
                    ├─── GEO Audit (parallel)
                    └─── Local SEO Audit (parallel, if local client)
```

### Services Triggered

**Sequential (must complete before strategy):**
| Service | Why Now | Agent | Chains To |
|---------|---------|-------|-----------|
| `site_audit` | Foundation — what's broken | Haruki | redirect_map, schema_generation, meta_optimization |
| `technical_audit` | Deep technical analysis | Kenji | — |
| `keyword_research` | What to target | Haruki | content_calendar, content_brief |
| `competitor_analysis` | What competitors own | Haruki | content_brief, keyword_research |

**Parallel (can run simultaneously):**
| Service | Why Now | Agent | Chains To |
|---------|---------|-------|-----------|
| `analytics_audit` | Ensure tracking is correct | Yumi | — |
| `on_page_audit` | Evaluate existing content quality | Mika | — |
| `geo_audit` | AI search baseline | Daichi | — |
| `entity_optimization` | Entity presence baseline | Daichi | — |
| `local_seo_audit` | Local visibility (if applicable) | Hana | gbp_optimization |
| `content_decay_audit` | Identify declining content | Yumi | content_rewrite |

### What's Sequential
The Strategy Document (content calendar + prioritized roadmap) CANNOT be written until all audits + research complete. It synthesizes everything.

### What's Parallel
Keyword research, competitor analysis, analytics setup, GEO audit, content audit, and local SEO audit can all run simultaneously with the technical audit.

### Gate
**Strategy approval** — Client must understand and agree to the plan before execution begins. The plan should include: priority keywords, content calendar for months 2-3, technical fix priority queue, link building target list.

### Client Context After Phase 1
By the end of month 1, `client_seo_context` should contain:
- `top_keywords` — from keyword_research
- `audit_findings` — from site_audit + technical_audit + on_page_audit
- `competitors` — from competitor_analysis
- `content_gaps` — from content_calendar (if generated)
- `last_audit_score` — from site_audit
- `cwv_status` — from technical_audit or site_audit

---

## Phase 2: Execute Quick Wins (Month 2-3) — PARALLEL

Four execution tracks run simultaneously. This is where the client sees activity.

### Track 1: Technical (Kenji + Mika)
| Service | Purpose |
|---------|---------|
| `schema_generation` | Implement missing structured data identified in audit |
| `redirect_map` | Fix broken pages and redirect chains |
| `robots_sitemap` | Optimize crawl directives |
| `meta_optimization` | Fix title tags, meta descriptions on priority pages |

### Track 2: Content (Sakura + Ryo)
| Service | Purpose |
|---------|---------|
| `content_calendar` | 3-month editorial calendar based on keyword research |
| `content_brief` | Detailed briefs for priority topics |
| `content_article` | First articles written from briefs |
| `content_rewrite` | Refresh declining pages identified by decay audit |

### Track 3: Link Building (Takeshi)
| Service | Purpose |
|---------|---------|
| `link_analysis` | Baseline backlink profile + gap analysis |
| `outreach_emails` | Outreach templates for link prospects |
| `guest_post_draft` | Guest post articles for link acquisition |
| `directory_submissions` | Business directory profiles |

### Track 4: Local (Hana) — if applicable
| Service | Purpose |
|---------|---------|
| `gbp_optimization` | Optimize Google Business Profile |
| `review_campaign` | Launch review acquisition campaign |
| `review_responses` | Templates for responding to existing reviews |

### Dependencies WITHIN Phase 2
- Content briefs → must exist before articles can be written (sequential)
- Articles → must be published and indexed before link building targets them (sequential)
- Technical fixes → must be deployed before re-crawl verification (sequential)

### Phase 2 Auto-Chaining
These chains fire automatically for eligible tiers:
- `keyword_research` → `content_calendar` + `content_brief`
- `site_audit` → `redirect_map` + `schema_generation` + `meta_optimization`
- `link_analysis` → `outreach_emails`
- `competitor_analysis` → `content_brief` + `keyword_research`
- `content_decay_audit` → `content_rewrite`
- `local_seo_audit` → `gbp_optimization`

### Expected Results by End of Month 3
- **Leading indicators:** Pages indexed, backlinks acquired, content published, technical fixes deployed
- **Early lagging indicators:** Improved rankings for low-difficulty keywords, higher impressions, modest traffic growth (10-30%)
- **Month 3 check-in:** "Here's what we've moved since baseline" — compare to Phase 0 snapshot

---

## Phase 3+: Compound & Scale (Month 4+) — CYCLICAL

Work shifts from one-time to recurring. The monthly cycle becomes the heartbeat.

### The Monthly Cycle

Every month, the following cadence repeats:

| Week | Activities | Services |
|------|-----------|----------|
| Week 1 | Monthly report delivery (auto via cron), review last month's data, identify anomalies | `monthly_report` (automated) |
| Week 1-2 | Content production — new articles based on content calendar | `content_article`, `content_rewrite` |
| Week 2 | Technical re-audit (lightweight), content decay check | `content_decay_audit`, `on_page_audit` |
| Week 2-3 | Link building outreach, guest post drafting | `outreach_emails`, `guest_post_draft` |
| Week 3 | Local SEO maintenance (GBP posts, review responses) | `review_responses`, `gbp_optimization` |
| Week 4 | Competitive landscape scan, keyword refresh | `competitor_analysis`, `keyword_research` |

### Monthly Re-Audit Cadence (NOT Quarterly)

**Key principle:** Most meaningful SEO work operates on a monthly cycle. Quarterly is too slow — by the time you notice a ranking drop quarterly, you've lost 2 months of compounding. Monthly cycles catch problems within 30 days.

| Monthly Task | Service | Purpose |
|---|---|---|
| Technical health check | `on_page_audit` or `site_audit` (lightweight) | Catch new issues before they compound |
| Content decay triage | `content_decay_audit` | Identify declining pages within the refresh window |
| Keyword position refresh | `keyword_research` (with existing context) | Update position data, find new opportunities |
| Competitive scan | `competitor_analysis` | Detect competitive shifts within response window |
| Link profile check | `link_analysis` | Monitor link velocity and toxic links |
| Monthly snapshot | `captureMonthlySnapshot()` (automated) | Store metrics for MoM/YoY comparison |
| Monthly report | `monthly_report` (automated cron, 1st of month) | Aggregate all activity into client report |

### Content Velocity Progression

| Month Range | Content Volume | Focus |
|---|---|---|
| Months 1-3 | 2-4 articles/month | Quick-win, low-difficulty keywords |
| Months 4-6 | 4-8 articles/month | Medium-difficulty, topical clusters |
| Months 7-12 | 6-12 articles/month | Higher-difficulty, competitive keywords |
| Month 12+ | 4-8 articles/month + refreshes | Maintenance + strategic expansion |

### Link Building Progression

| Month Range | Focus | Approach |
|---|---|---|
| Months 1-3 | Foundational | Directory submissions, easy wins, brand mentions |
| Months 4-6 | Strategic | Guest posts, resource link building, competitor gap |
| Months 7-12 | Competitive | Digital PR, original research, linkable assets |

---

## What Triggers Strategy Pivots

The monthly cycle continues unless one of these triggers requires a strategic adjustment:

### 1. Algorithm Update
**Signal:** Google announces core update, client sees ranking volatility.
**Response:** Pause content production, run comprehensive `site_audit` + `competitor_analysis` to assess impact, adjust strategy based on findings.

### 2. Ranking Plateau
**Signal:** Target keywords not moving after 90+ days of sustained effort.
**Response:** Re-run `competitor_analysis` to understand what competitors are doing differently. Consider: content depth, link authority gap, or wrong keyword targets.

### 3. Client Business Change
**Signal:** New product/service, new market, M&A, pivot.
**Response:** Re-run `keyword_research` with new parameters. Update content calendar. May require Phase 1-level re-audit.

### 4. Competitive Shift
**Signal:** Competitor aggressively enters target keywords (detected in monthly competitive scan).
**Response:** Assess share of voice change. Prioritize defending high-value positions. May need to shift content calendar.

### 5. Wrong Intent
**Signal:** Traffic up but conversions flat (targeting informational when need transactional).
**Response:** Re-evaluate keyword targeting. Shift content mix toward commercial/transactional intent. Run `on_page_audit` on conversion pages.

### 6. Budget Change
**Signal:** Client upgrades or downgrades tier.
**Response:** Adjust service frequency and content velocity. Scale up: more content, more link building. Scale down: focus on highest-impact services only.

### 7. Data Signal
**Signal:** Content decay accelerating, link velocity dropping, CWV degrading (detected in monthly monitoring).
**Response:** Targeted intervention. Content decay → emergency refresh cycle. Link velocity → outreach campaign. CWV → technical sprint.

---

## Client Metrics Tracking

### Monthly Snapshot (Automated)
Captured by `captureMonthlySnapshot()` on the 1st of each month, stored in `client_metrics_history`:

| Metric | Source | When Available |
|--------|--------|---------------|
| organic_traffic | GA4 sessions | When GA4 OAuth connected |
| keyword_count_page1 | GSC queries with position ≤ 10 | When GSC OAuth connected |
| keyword_count_top10 | Same (reserved for granularity) | When GSC OAuth connected |
| health_score | Latest audit score | After first site_audit |
| backlink_count | Latest link_analysis | After first link_analysis |
| content_pieces_published | content_posts table | Ongoing |
| domain_authority_estimate | Reserved | Future integration |

### Historical Comparison
`getClientHistory(clientId, 13)` returns up to 13 months of snapshots, enabling:
- Month-over-month (MoM) comparison
- Year-over-year (YoY) comparison (once 12+ months of data exist)
- Trend visualization over 6-12 months

---

## Tier-Based Service Availability

Auto-chaining and service access vary by client tier:

| Feature | Starter | Growth | Pro | Admin/Demo |
|---------|---------|--------|-----|------------|
| Manual service requests | Yes | Yes | Yes | Yes |
| Auto-chaining | No | Yes | Yes | Yes |
| Monthly report (automated) | Yes | Yes | Yes | Yes |
| Content article writing | Limited | Yes | Yes | Yes |
| Full link building suite | No | Yes | Yes | Yes |
| GEO/entity optimization | No | Growth+ | Yes | Yes |

Tier gating enforced by `tierAllowsRequestType()` in `src/lib/tier-gates.ts`.

---

## The Flywheel Effect Over Time

```
Month 1:  Technical Health ──→ Content Discovered
Month 2-3: Content Earns Links ──→ Authority Grows
Month 4-6: Authority Makes Ranking Easier ──→ Rankings Generate Data
Month 7+:  Data Informs Better Content ──→ Cycle Accelerates
Month 12+: Compounding Effect ──→ Each new piece ranks faster, earns links easier
```

The fundamental principle: **each component amplifies the others.** A technical audit that doesn't drive content priorities is wasted work. Link building that doesn't support content strategy is scattershot. Content that isn't informed by keyword research is guessing.

SEO is a compounding investment. Month 1 feels slow. Month 12 feels exponential. The monthly cadence is what makes the compounding work — catching problems early, capitalizing on wins quickly, and continuously feeding the flywheel.

---

## Output Examples

### Good Example: Month 1 Service Sequence (New Local Business Client)

> **Month 1 Plan — "Precision Plumbing" (Local Plumber, Growth Tier, Portland OR)**
>
> **Week 1: Onboarding + Baseline**
>
> | Day | Activity | Service | Owner | Dependency |
> |-----|----------|---------|-------|------------|
> | Mon | Welcome call — confirm goals: "rank for emergency plumbing Portland, get 15+ new calls/month from search" | Onboarding | Account Manager | — |
> | Mon | Collect GSC + GA4 access (client's web dev has credentials) | Onboarding | Account Manager | — |
> | Tue | Configure OAuth integrations, create Supabase client record, assign Growth tier | Account setup | System | GSC/GA4 access received |
> | Tue | Run `captureMonthlySnapshot()` — lock baseline: 1,200 organic sessions/mo, 8 page-1 keywords, health score TBD | Baseline | Automated | Account setup complete |
> | Wed | `analytics_audit` — verify GA4 tracks form submissions + phone call clicks as conversions | analytics_audit (Yumi) | Auto-triggered | OAuth configured |
>
> **Week 1-2: Parallel Research Sprint**
>
> | Service | Agent | Status | Chains To | Key Findings (expected) |
> |---------|-------|--------|-----------|------------------------|
> | `site_audit` | Haruki | Runs Day 3 | → redirect_map, schema_generation, meta_optimization | Expect: missing LocalBusiness schema, thin service pages, broken old domain links |
> | `technical_audit` | Kenji | Runs Day 3 (parallel) | — | Expect: CWV issues (plumber sites typically have unoptimized images), mobile usability |
> | `keyword_research` | Haruki | Runs Day 4 | → content_calendar, content_brief | Seeds: "plumber portland", "emergency plumber near me", "drain cleaning portland" |
> | `competitor_analysis` | Haruki | Runs Day 4 (parallel) | → content_brief, keyword_research | Competitors: mr-rooter-portland.com, roto-rooter.com/portland, benjaminfranklinplumbing.com |
> | `local_seo_audit` | Hana | Runs Day 3 (parallel) | → gbp_optimization | GBP completeness, NAP consistency across 20+ directories |
> | `on_page_audit` | Mika | Runs Day 5 | — | Service page quality, title/meta optimization opportunities |
> | `content_decay_audit` | Yumi | Runs Day 5 (parallel) | → content_rewrite | Check if existing blog posts (if any) are declining |
> | `geo_audit` | Daichi | Runs Day 5 (parallel) | — | AI search visibility for "plumber portland" across Perplexity, ChatGPT, Google AIO |
>
> **Week 3: Strategy Synthesis**
>
> | Day | Activity | Output |
> |-----|----------|--------|
> | Mon | Compile all audit findings + keyword data into strategy doc | Priority keyword list: 45 keywords across 4 clusters (Emergency Services, Drain/Sewer, Water Heater, General Plumbing) |
> | Tue | Build content calendar — Q1 priority: Emergency Services cluster (highest CPC, highest business value) | 3-month calendar: 8 articles/month, 60/25/15 TOFU/MOFU/BOFU |
> | Wed | Generate first 2 content briefs — "Emergency Plumber Portland" (pillar) + "Burst Pipe What to Do" (cluster) | Briefs with SERP data, competitor analysis, semantic term lists |
> | Thu | Strategy presentation prep — client-facing deck | Business case: "Here's why we're starting with emergency plumbing keywords: $35 CPC = each organic click saves you $35 in ad spend" |
>
> **Week 4: Strategy Approval + Quick Win Execution**
>
> | Activity | Service | Gate |
> |----------|---------|------|
> | Client approves strategy and content calendar | — | **GATE: Nothing executes without client approval** |
> | Auto-chain fires: site_audit → redirect_map (fix 12 broken old-domain links) | redirect_map (Kenji) | Site audit complete |
> | Auto-chain fires: site_audit → schema_generation (add LocalBusiness + Service schema) | schema_generation (Kenji) | Site audit complete |
> | Auto-chain fires: site_audit → meta_optimization (rewrite 8 thin title tags) | meta_optimization (Mika) | Site audit complete |
> | Auto-chain fires: local_seo_audit → gbp_optimization (complete missing GBP fields) | gbp_optimization (Hana) | Local audit complete |
> | First content article begins production from approved brief | content_article (Sakura) | Brief approved |
>
> **Month 1 Deliverables Summary:**
> - 1 comprehensive site audit with health score
> - 1 technical audit with CWV recommendations
> - 1 keyword research database (45 keywords, 4 clusters)
> - 1 competitor analysis (3 competitors mapped)
> - 1 local SEO audit with NAP consistency report
> - 1 GBP optimization report
> - 1 content calendar (3-month plan)
> - 2 content briefs
> - 1 redirect map (12 broken URLs)
> - 1 schema generation (LocalBusiness + Service)
> - 1 meta optimization (8 title tags)
> - 1 content article (in production, delivery early Month 2)

### Bad Example: Month 1 Service Sequence

> **Month 1 Plan — Precision Plumbing**
>
> During the first month we'll conduct a comprehensive audit of your website, research your target keywords, analyze your competitors, and develop a content strategy. We'll also look at your local SEO presence and Google Business Profile.
>
> **Services to run:**
> - Site audit
> - Keyword research
> - Competitor analysis
> - Content calendar
> - Local SEO audit
>
> Once the audits are complete, we'll develop a strategy and share it with you for approval. Then we'll begin executing on the recommendations.

**Why it fails:** No timeline — when does each service run? No dependencies mapped — content calendar can't be built before keyword research completes. No specific expected outputs or deliverable counts. No quick wins identified. No auto-chain triggers mentioned. No baseline metrics captured. A client reading this has no idea what they'll receive in Month 1 or when. The team executing has no sequencing guidance — they might try to build a content calendar before keyword research finishes.

---

### Good Example: Strategy Pivot Decision

> **Strategy Pivot Trigger: Ranking Plateau (Detected Month 5)**
>
> **Signal detected:**
> - Target keyword "emergency plumber portland" stuck at position 8-10 for 90+ days
> - Content quality is strong (2,800 words, updated monthly, strong E-E-A-T)
> - On-page is optimized (title, meta, schema all correct)
> - 3 new competitor pages appeared in top 10 since Month 2
>
> **Diagnostic analysis (competitor_analysis re-run):**
> - Position 1-3 sites have 45-120 referring domains to their emergency plumber pages
> - Client has 6 referring domains to this page
> - Content quality is competitive — the gap is **link authority**, not content
>
> **Pivot decision:**
> - **PAUSE:** New content production for Emergency Services cluster (9/10 pages complete, content is not the bottleneck)
> - **SHIFT BUDGET TO:** Link building campaign targeting emergency plumber page specifically
>   - Guest posts on Portland home improvement blogs (3 target sites identified)
>   - Resource link building: create "Portland Emergency Home Services Directory" as linkable asset
>   - Digital PR: pitch Portland-specific plumbing statistics to local news outlets
> - **SUCCESS METRIC:** Reach 20 referring domains within 60 days. If position moves to 5-7 by Month 7, link building is the correct lever.
> - **FALLBACK:** If 20 referring domains don't move position by Month 7, investigate: potential domain-level authority ceiling, SERP intent shift, or local pack dominance absorbing clicks.
>
> **What we're NOT doing:** Publishing more content to a cluster that's already 90% complete. More content won't fix a link authority gap. This is the most common misdiagnosis — "let's write another blog post" when the real problem is backlink deficit.

### Bad Example: Strategy Pivot Decision

> **Strategy Update:**
>
> We've noticed that some of our target keywords have plateaued in rankings. We recommend adjusting our strategy to focus more on link building and content optimization. We'll continue monitoring performance and make further adjustments as needed.
>
> Next steps:
> - Focus on building more backlinks
> - Continue publishing quality content
> - Monitor rankings weekly

**Why it fails:** No specific keywords identified — which ones plateaued? No diagnostic analysis — is the issue content quality, link authority, technical problems, or intent mismatch? "Focus more on link building" is not a strategy — which pages? What type of links? From where? No success metrics defined. No timeline. No fallback plan if the pivot doesn't work. "Continue monitoring" is not an action. This pivot decision provides zero strategic value — it's a generic response that could apply to any client at any time.
