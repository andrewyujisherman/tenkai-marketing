# How a Real SEO Agency Works — First Principles

This is the reference model. Every Tenkai agent should understand where their work fits in this system.

---

## The 6 Functional Disciplines

Everything in SEO falls into one of six disciplines. In a real agency, these are teams. In a smaller shop, they're hats worn by fewer people — but the functions don't collapse.

| # | Discipline | What It Owns | Core Question |
|---|-----------|-------------|---------------|
| 1 | **Technical SEO** | Site health, crawlability, indexation, speed, schema, architecture | "Can Google find, render, and understand this site?" |
| 2 | **Content Strategy & Production** | Keyword-to-content mapping, briefs, articles, editorial calendar, decay monitoring | "What should we publish, for whom, and in what order?" |
| 3 | **Link Building & Digital PR** | Backlink acquisition, anchor text management, internal linking, outreach, digital PR | "How do we build authority and distribute it?" |
| 4 | **Local SEO** | GBP management, citations/NAP, reviews, geo-grid rankings, service area pages | "How do we win in the map pack and local results?" |
| 5 | **Analytics & Reporting** | Tracking setup, dashboards, monthly reports, performance attribution, anomaly detection | "What moved, why, and what does it mean for the business?" |
| 6 | **Account Strategy & Client Management** | Client relationship, strategy ownership, onboarding, lifecycle management | "Are we doing the right things in the right order for this client?" |

**Key structural insight:** Discipline 6 (Strategy) is the **brain** — it reads outputs from all other disciplines and decides what to prioritize next. Disciplines 1-4 are **execution arms**. Discipline 5 is the **nervous system** — it tells the brain what's working.

---

## The Roles (and How They Map to Tenkai Agents)

### At a 20-40 person agency:

```
SEO Director
├── Technical SEO Lead
│   └── 2-4 Specialists (crawl analysis, CWV, schema, dev coordination)
├── Content Director
│   └── Strategist, Writers (in-house + freelance), Editor
├── Link Building Lead
│   └── Outreach coordinators, Link prospectors
├── Analytics Lead
│   └── Reporting specialists
└── Account Management Lead
    └── Account Managers (1 per 4-8 clients)
```

### Tenkai Agent Mapping:

| Discipline | Agency Role | Tenkai Agent |
|---|---|---|
| Technical SEO | Technical Lead + Specialists | **Haruki** (site_audit), **Kenji** (technical, schema, redirects), **Mika** (on-page) |
| Content | Content Director + Writers | **Sakura** (briefs, articles), **Ryo** (calendar, clusters) |
| Link Building | Link Building Lead + Outreach | **Takeshi** (analysis, outreach, guest posts) |
| Local SEO | Local Specialist | **Hana** (local audit, GBP, reviews) |
| Analytics | Analytics Lead + Reporting | **Yumi** (analytics audit, monthly report, decay) |
| AI Search | (Emerging role at agencies) | **Daichi** (GEO audit, entity optimization) |
| Strategy | SEO Director / Account Manager | **The system itself** (service chaining, client context, lifecycle) |

**The critical tension at agencies:** Account Manager optimizes for client happiness. Strategist optimizes for campaign integrity. When the same person does both (common at small agencies), client pressure distorts strategy. Tenkai's advantage: AI agents don't have this tension.

---

## The Client Lifecycle — What Happens When

### Phase 0: Onboarding (Week 1-2) — SEQUENTIAL

```
Contract signed
  → Welcome + onboarding questionnaire
  → Credentials collection (GSC, GA4, CMS, hosting)  ← BIGGEST DELAY POINT
  → Internal pre-analysis
  → Project setup + baseline metrics locked
  → Kickoff (confirm goals, KPIs, communication cadence)
  → GATE: Client confirms goals and priorities
```

### Phase 1: Foundation (Month 1) — MOSTLY SEQUENTIAL

This is where trust is earned or lost. The client sees activity, not results.

```
                    ┌─── Keyword Research ──────┐
                    │                           │
Technical Audit ────┤                           ├──→ Strategy Document
                    │                           │
                    ├─── Competitor Analysis ───┘
                    │
                    └─── Content Audit (existing pages)

                    ┌─── Analytics Setup (parallel)
                    └─── Local SEO Audit (parallel, if local client)
```

**What's parallel:** Keyword research, competitor analysis, content audit, analytics setup, and local audit can all run simultaneously with the technical audit.

**What's sequential:** The Strategy Document CANNOT be written until all audits + research complete. It synthesizes everything.

**GATE: Strategy approval** — Client must sign off before execution begins.

### Phase 2: Execute Quick Wins (Month 2-3) — PARALLEL

```
Technical Team          Content Team           Link Team            Local Team
─────────────          ────────────           ─────────            ──────────
Fix critical crawl     Content briefs         Backlink audit       GBP optimization
  issues               (from keyword data)    Link prospecting     Citation cleanup
CWV optimization       First articles         Outreach prep        Review campaign
Schema implementation  Meta optimization      HARO/Featured        Google Posts
Internal linking       Existing page          responses
  architecture          refreshes
```

**All four tracks run in parallel.** This is where agencies get leverage — multiple teams executing simultaneously against the strategy.

**Dependencies WITHIN this phase:**
- Content briefs → must exist before articles can be written (sequential)
- Articles → must be published and indexed before link building targets them (sequential)
- Technical fixes → must be deployed before re-crawl verification (sequential)

### Phase 3: Compound & Scale (Month 4+) — CYCLICAL

Work shifts from one-time to recurring. The monthly cycle becomes the heartbeat.

---

## How Data Flows Between Disciplines

```
TECHNICAL AUDIT ──────────────────────────────────────────────────────┐
  Outputs: crawl issues, CWV data, orphan pages, broken links,       │
  redirect chains, schema gaps, internal link map                     │
                                                                      │
KEYWORD RESEARCH ─────────────────────────────────────────────────┐   │
  Outputs: keyword clusters, search volumes, intent classification, │   │
  difficulty scores, SERP features, competitor gaps                 │   │
                                                                    │   │
COMPETITOR ANALYSIS ──────────────────────────────────────────┐    │   │
  Outputs: competitor top pages, content gaps, backlink gaps,  │    │   │
  share of voice, SERP feature ownership                       │    │   │
                                                                │    │   │
                            ┌───────────────────────────────────┘    │   │
                            │              ┌─────────────────────────┘   │
                            ▼              ▼                             │
                    ┌──────────────────────────┐                        │
                    │    STRATEGY SYNTHESIS     │◄───────────────────────┘
                    │  (synthesizes ALL inputs) │
                    └──────────┬───────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
     Content Calendar    Technical Fix     Link Building
     + Content Briefs    Priority Queue    Target List
              │                │                 │
              ▼                ▼                 ▼
     Articles Written    Fixes Deployed    Links Acquired
              │                │                 │
              └────────────────┼─────────────────┘
                               ▼
                       MONTHLY REPORT
                    (aggregates everything)
                               │
                               ▼
                      MONTHLY REVIEW
                    (feeds back to top)
```

### The 9 Critical Data Handoffs

| # | From → To | What Transfers |
|---|-----------|---------------|
| 1 | Technical Audit → Content Calendar | Thin pages, missing topics, cannibalization findings |
| 2 | Technical Audit → Dev Queue | Crawl fixes, CWV issues, schema gaps (prioritized) |
| 3 | Keyword Research → Content Briefs | Clusters, primary/secondary KWs, intent, SERP data |
| 4 | Competitor Analysis → Content Strategy | Content gaps — topics competitors own that you don't |
| 5 | Competitor Analysis → Link Strategy | Backlink gaps — referring domains competitors have |
| 6 | Content Published → Link Outreach | New URLs to build links to, topical angles for pitching |
| 7 | Link Analysis → Internal Linking | Authority pages that should link to priority targets |
| 8 | Content Decay Audit → Content Rewrite Queue | Declining pages triaged: refresh/rewrite/merge/retire |
| 9 | All Execution → Monthly Report | Actions taken + outcomes per discipline |

**The fundamental principle:** No discipline operates in isolation. Every output is someone else's input.

---

## The SEO Flywheel

```
    Technical Health
    (site can be crawled, rendered, indexed)
            │
            ▼
    Content Gets Discovered
    (pages indexed, rankings begin)
            │
            ▼
    Quality Content Earns Links
    (editorial mentions, PR, HARO)
            │
            ▼
    Links Build Authority
    (domain authority grows)
            │
            ▼
    Authority Makes Ranking Easier
    (harder keywords become achievable)
            │
            ▼
    Rankings Generate Data
    (GSC clicks, impressions, position data)
            │
            ▼
    Data Informs Better Content
    (what to double down on, what to fix)
            │
            └──→ back to Technical Health
```

Each component amplifies the others. A technical audit that doesn't drive content priorities is wasted work. Link building that doesn't support content strategy is scattershot. Content that isn't informed by keyword research is guessing.

---

## The Cadence — What Happens How Often

| Frequency | Activities |
|-----------|-----------|
| **Continuous** | Rank tracking, review monitoring, content decay signal detection, crawl error alerts |
| **Weekly** | GBP posts, review responses, technical fix implementation, internal status check |
| **Monthly** | Content production cycle, link outreach campaigns, monthly report, strategy check, technical re-audit, keyword research refresh, competitive landscape scan, content decay triage, internal linking review, performance attribution |
| **Quarterly (max cadence)** | Full QBR with client, pricing review, tech stack evaluation, goal recalibration |

**Key principle:** Most meaningful SEO work operates on a monthly cycle. Quarterly is too slow for detection and response — by the time you notice a ranking drop quarterly, you've lost 2 months of compounding. Monthly cycles catch problems within 30 days, which is the window where content decay can be reversed with a focused update rather than an expensive rebuild.

---

## Quality Gates

| Deliverable | Gate Criteria |
|---|---|
| Technical audit | Complete coverage, priorities scored by impact, no false positives, specific URLs cited |
| Strategy document | Goals mapped to actions, KPIs specific and measurable, roadmap realistic |
| Content piece | Keyword placement verified, internal links present, E-E-A-T signals, meta optimized, schema applied |
| Monthly report | Numbers accurate, narrative explains anomalies, business impact framed (not vanity metrics) |
| Link prospects | Domain relevance confirmed, DA/DR threshold met, not spam/PBN |
| Technical fixes | Fix confirmed via re-crawl, not just "code changed" |
| Outreach emails | Personalized to recipient's recent content, not generic template |

**Common quality failures at agencies (Tenkai must avoid):**
- Reports with data but no narrative — client doesn't know what changed or why
- Content published without SEO review — readability-optimized but not search-optimized
- Technical fixes deployed without post-implementation crawl verification
- Link building targeting pages not yet indexed
- Keyword research with no connection to content calendar
- Audit recommendations with no priority scoring or business impact estimate

---

## What Triggers Strategy Pivots

1. **Algorithm update** — core update changes what ranks
2. **Ranking plateau** — keyword targets not moving after 90+ days of sustained effort
3. **Client business change** — new product, new market, M&A, pivot
4. **Competitive shift** — competitor aggressively enters target keywords
5. **Wrong intent** — traffic up but conversions flat (targeting informational when need transactional)
6. **Budget change** — scope must adjust to match resources
7. **Data signal** — content decay accelerating, link velocity dropping, CWV degrading

---

## Gaps vs. a Premium Agency (Where Tenkai Can Go Deeper)

### Data Foundation
- **Real crawl data** — not prompt-simulated. BFS crawler exists but depth is limited to 100 pages
- **Real keyword data** — search volumes, difficulty scores, SERP features from DataForSEO/Serper, not hallucinated
- **Real backlink data** — referring domains, anchor text profiles, toxic link detection from Ahrefs/Moz API
- **CrUX field data** — real user Core Web Vitals from Chrome User Experience Report API (free)
- **GSC performance data** — actual ranking positions, click-through rates, impression trends

### Depth Per Discipline
- **Technical:** JavaScript rendering diagnostics, log file analysis (enterprise), security header review, international SEO/hreflang
- **Content:** NLP content scoring (Surfer/Clearscope methodology), SERP reverse-engineering, AI-detection awareness, E-E-A-T scoring per article
- **Links:** Competitor backlink gap analysis, link velocity monitoring, toxic link disavow file generation, digital PR strategy (linkable asset creation)
- **Local:** NAP consistency audit across 10-20 directories, geo-grid rank checking, review velocity tracking, service area page strategy
- **AI Search:** Platform-specific optimization (Google AIO vs Perplexity vs ChatGPT citation patterns), entity presence audit (Wikidata, Wikipedia, social), citation tracking
- **Reporting:** Business impact framing (conversions, revenue), MoM/YoY trend comparison, strategic narrative (not just data), Loom-style walkthrough

### Cross-Service Intelligence
- Services should read each other's outputs automatically
- Client context should persist across service requests
- Monthly report should aggregate ALL service outputs from the period
- Content calendar should auto-prioritize based on audit findings + keyword research
- Link building targets should be informed by content strategy
