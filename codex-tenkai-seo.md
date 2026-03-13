# Codex Tenkai SEO — Operational Reference

> Complete reference for autonomous operation of the Tenkai SEO agent team.

---

## Architecture

Queue-driven AI SEO agency. Clients submit requests → Supabase queue → worker claims & processes with Gemini → deliverable saved back to Supabase → client views in portal.

**Stack:** Next.js App Router, Supabase (auth + DB), Stripe (billing), Gemini (AI), Vercel (hosting)

**Deployed:** https://tenkai-marketing.vercel.app

---

## Repo Structure

```
tenkai-marketing/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Public marketing site
│   │   ├── (portal)/             # Client portal (auth required)
│   │   │   ├── dashboard/        # Client dashboard
│   │   │   ├── audit/            # Audit results viewer
│   │   │   ├── content/          # Content deliverables
│   │   │   ├── reports/          # Analytics reports
│   │   │   ├── integrations/     # Client onboarding / API connections
│   │   │   ├── settings/         # Client settings
│   │   │   └── onboarding/       # Onboarding flow
│   │   ├── (admin)/              # Admin panel
│   │   ├── auth/                 # Auth pages (login, signup, etc.)
│   │   └── api/                  # API routes (see below)
│   ├── lib/
│   │   ├── agents/
│   │   │   ├── index.ts          # Agent registry — 9 agents, 27 request types
│   │   │   └── prompts.ts        # All agent system prompts
│   │   ├── integrations/
│   │   │   ├── index.ts          # Barrel export + fetchAllSiteData()
│   │   │   ├── pagespeed.ts      # PageSpeed Insights API
│   │   │   ├── serper.ts         # Serper.dev SERP data
│   │   │   ├── google-search-console.ts  # GSC via OAuth
│   │   │   ├── google-analytics.ts       # GA4 via OAuth
│   │   │   └── client-store.ts   # Per-client credential loader
│   │   └── supabase/             # Supabase client helpers
│   └── workers/
│       └── queue-worker.ts       # Main worker — claims, processes, saves deliverables
├── scripts/
│   └── setup-google-auth.ts      # OAuth2 flow for GSC + GA4
├── config/
│   └── google-oauth-token.json   # OAuth token (gitignored)
├── supabase/
│   └── migrations/               # DB migration files
├── .env.local                    # All secrets (gitignored)
└── package.json
```

---

## Agents (9)

| Agent | Kanji | Role | Request Types |
|-------|-------|------|---------------|
| Haruki | 春樹 | SEO Strategist | site_audit, keyword_research, competitor_analysis |
| Sakura | 桜 | Content Specialist | content_brief, content_article, content_rewrite |
| Kenji | 健二 | Technical SEO | technical_audit, schema_generation, redirect_map, robots_sitemap |
| Yumi | 由美 | Analytics | analytics_audit, monthly_report, content_decay_audit |
| Takeshi | 武 | Link Builder | link_analysis, outreach_emails, guest_post_draft, directory_submissions |
| Mika | 美花 | On-Page Optimizer | on_page_audit, meta_optimization |
| Ryo | 涼 | Content Planner | content_calendar, topic_cluster_map |
| Hana | 花 | Local SEO | local_seo_audit, gbp_optimization, review_responses, review_campaign |
| Daichi | 大地 | GEO/AI Search | geo_audit, entity_optimization |

---

## Request Types (27)

### Analysis (17)
`site_audit`, `keyword_research`, `competitor_analysis`, `content_brief`, `technical_audit`, `analytics_audit`, `link_analysis`, `on_page_audit`, `meta_optimization`, `content_calendar`, `topic_cluster_map`, `local_seo_audit`, `gbp_optimization`, `geo_audit`, `entity_optimization`, `monthly_report`, `content_decay_audit`

### Execution (10)
`content_article`, `content_rewrite`, `schema_generation`, `redirect_map`, `robots_sitemap`, `outreach_emails`, `guest_post_draft`, `directory_submissions`, `review_responses`, `review_campaign`

---

## Model Routing

| Model | Types |
|-------|-------|
| gemini-2.5-pro | site_audit, content_brief, technical_audit, analytics_audit, on_page_audit, meta_optimization, content_calendar, topic_cluster_map, local_seo_audit, gbp_optimization, geo_audit, entity_optimization, competitor_analysis, monthly_report, content_decay_audit, content_article, outreach_emails, guest_post_draft |
| gemini-2.5-flash | keyword_research, link_analysis, content_rewrite, schema_generation, redirect_map, robots_sitemap, directory_submissions, review_responses, review_campaign |

**Rule:** Pro for customer-facing deliverables and writing. Flash for research and structured data.

---

## Running the Worker

```bash
cd tenkai-marketing
set -a && source .env.local && set +a
npx tsx src/workers/queue-worker.ts
```

Or: `npm run worker` (requires env vars loaded)

**Before running:** Always check for phantom workers:
```bash
ps aux | grep queue-worker | grep -v grep
```

The worker polls every 10 seconds. It claims one request at a time using atomic `.eq('status', 'queued')` on update to prevent double-claim.

---

## Queuing Requests

### Via Supabase API
```bash
curl -s -X POST "https://mvhuxiswjtomvebcgpqr.supabase.co/rest/v1/service_requests" \
  -H "apikey: <ANON_KEY>" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "00000000-0000-0000-0000-000000000001",
    "request_type": "site_audit",
    "target_url": "https://example.com",
    "parameters": {},
    "status": "queued",
    "priority": 1
  }'
```

### Via Supabase Management API (for SQL)
```bash
curl -s -X POST "https://api.supabase.com/v1/projects/mvhuxiswjtomvebcgpqr/database/query" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"query": "INSERT INTO public.service_requests ..."}'
```

### Important
- Status MUST be `'queued'` (not 'pending')
- `client_id` is UUID FK to `clients` table
- Test client: `00000000-0000-0000-0000-000000000001`
- `target_url` required for most types; topic-based types use `parameters.topic`
- `parameters` is JSONB — pass topic, keyword, etc. as needed

---

## Database

**Supabase project:** `mvhuxiswjtomvebcgpqr`
**Region:** us-west-2
**URL:** https://mvhuxiswjtomvebcgpqr.supabase.co
**DB host:** db.mvhuxiswjtomvebcgpqr.supabase.co
**Pooler host:** aws-0-us-west-2.pooler.supabase.co

### Key Tables
| Table | Purpose |
|-------|---------|
| `service_requests` | Queue — request_type, target_url, parameters, status, priority |
| `deliverables` | Agent output — content (JSONB), score, title, summary, agent_name |
| `clients` | Client accounts — linked to auth.users |
| `client_integrations` | Per-client OAuth tokens and API keys |
| `subscriptions` | Stripe subscription state |
| `profiles` | User profiles |

### Status Flow
`queued` → `processing` → `completed` | `failed`

### Score Constraint
`deliverables_score_check`: score must be 0–100 or null.

---

## Credentials

### Credential Vault (single source of truth)
**Path:** `/Users/andrewsherman_1/External Clawd/credentials/vault.json`

Tenkai credentials are in `vault.tier_1.supabase_tenkai`:
- `url` — Supabase project URL
- `anon_key` — Supabase anon key (client-side)
- `service_role_key` — Supabase service role key (server-side, full access)
- `access_token` — Supabase Management API token (for SQL queries)
- `db_host` — Direct DB connection host
- `db_user` — DB username
- `pooler_host` — Connection pooler host

### Environment Variables (.env.local)
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<from vault>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from vault>
SUPABASE_SERVICE_ROLE_KEY=<from vault>

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_GROWTH=
STRIPE_PRICE_PRO=

# App
NEXT_PUBLIC_APP_URL=https://tenkai-marketing.vercel.app

# Admin
ADMIN_MASTER_PASSWORD=
ADMIN_EMAILS=
GEMINI_API_KEY=            # Google AI Studio key for Gemini models

# Data Integrations
PAGESPEED_API_KEY=         # Google PageSpeed Insights
SERPER_API_KEY=            # Serper.dev SERP data

# Google OAuth (GSC + GA4)
GOOGLE_CLIENT_ID=          # OAuth client ID
GOOGLE_CLIENT_SECRET=      # OAuth client secret
GSC_TOKEN_PATH=./config/google-oauth-token.json
GA4_TOKEN_PATH=./config/google-oauth-token.json
```

### API Keys by Integration
| Integration | Env Var | Vault Location |
|-------------|---------|----------------|
| Gemini AI | `GEMINI_API_KEY` | vault.tier_3 (check gemini entries) |
| PageSpeed | `PAGESPEED_API_KEY` | vault.tier_3.pagespeed_api_key |
| Serper | `SERPER_API_KEY` | vault.tier_3.serper_api_key |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | .env.local (generated via GCP console) |
| Supabase | `SUPABASE_SERVICE_ROLE_KEY` | vault.tier_1.supabase_tenkai.service_role_key |
| Stripe | `STRIPE_SECRET_KEY` | vault (check tier_0 or tier_1) |

---

## Data Enrichment Pipeline

The worker enriches requests with real data before passing to Gemini:

1. **HTML Scraping** — `scrapeUrl()` fetches target URL, extracts title, meta description, headings, body text
2. **PageSpeed Insights** — CWV scores (LCP, FID, CLS), performance score, opportunities
3. **Serper SERP Data** — Current rankings, PAA questions, AI Overview detection, competitor snippets
4. **GSC Data** (if OAuth token) — Real clicks, impressions, CTR, striking distance keywords
5. **GA4 Data** (if OAuth token) — Traffic, engagement, conversions, top pages

GSC/GA4 gracefully degrade to null if no token — agents work with less data, not zero data.

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/services/request` | POST | Queue a new service request |
| `/api/services/deliverables` | GET | Fetch deliverables for a client |
| `/api/services/status/[id]` | GET | Check request status |
| `/api/onboarding/status` | GET | Integration status + completion % |
| `/api/onboarding/save` | POST | Save client integration credentials |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/webhooks/stripe` | POST | Stripe webhook handler |
| `/api/admin/*` | Various | Admin panel operations |
| `/api/portal/*` | Various | Portal user operations |

---

## Deployment

**Platform:** Vercel
**Git repo:** github.com/andrewyujisherman/tenkai-marketing
**Branch:** main (auto-deploys on push)

```bash
cd tenkai-marketing
git add <files>
git commit -m "message"
git push  # triggers Vercel deploy
```

Vercel env vars must match `.env.local`. Update via Vercel dashboard or CLI.

---

## Worker Processing Flow

```
1. Poll: SELECT * FROM service_requests WHERE status = 'queued' ORDER BY priority, created_at LIMIT 1
2. Claim: UPDATE ... SET status = 'processing' WHERE id = X AND status = 'queued'
3. Route: getAgentForRequest(type) → agent ID + prompt
4. Enrich: If URL-based, fetch site data (scrape + PageSpeed + SERP + GSC + GA4)
5. Build message: buildTaskMessage() injects real data + parameters into agent prompt
6. Call Gemini: Selected model based on MODEL_MAP[type]
7. Parse: Extract JSON from response, validate
8. Score: extractScore() pulls score from agent-specific keys
9. Summary: generateSummary() creates human-readable summary
10. Save: INSERT INTO deliverables (content, score, title, summary, agent_name, deliverable_type)
11. Complete: UPDATE service_requests SET status = 'completed'
```

---

## Common Operations

### Queue all 27 types for testing
```sql
INSERT INTO public.service_requests (client_id, request_type, target_url, parameters, status, priority)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'site_audit', 'https://example.com', '{}', 'queued', 1),
  ('00000000-0000-0000-0000-000000000001', 'keyword_research', NULL, '{"topic": "AI SEO tools"}', 'queued', 1),
  -- ... etc for all types
```

### Check deliverable quality
```sql
SELECT sr.request_type, sr.status, d.title, d.score, d.deliverable_type, d.agent_name,
       length(d.content::text) as content_chars
FROM service_requests sr
LEFT JOIN deliverables d ON d.request_id = sr.id
WHERE sr.client_id = '00000000-0000-0000-0000-000000000001'
ORDER BY sr.created_at DESC;
```

### Reset failed requests
```sql
UPDATE service_requests SET status = 'queued' WHERE status = 'failed';
```

### OAuth refresh
```bash
cd tenkai-marketing
set -a && source .env.local && set +a
npx tsx scripts/setup-google-auth.ts
```

---

## Key Design Decisions

- **Queue-driven, not real-time** — reliability for customer-facing services
- **Prompt-level output sizing** — agents self-regulate length (no MAX_TOKENS)
- **Atomic claim pattern** — `.eq('status', 'queued')` prevents double-processing
- **3-layer data strategy** — scraping + APIs + OAuth data. Each layer optional.
- **Isolated from Openclaw** — Tenkai has its own agents, DB, deployment. No shared queues or resources.
- **Aiko (social strategy) was removed** — do not re-add

---

## Research & Knowledge Base References

These files contain the deep research, execution playbooks, and domain expertise that the agents are built on. Read these to understand HOW to execute, not just WHAT to execute.

### SEO Execution Skills (full playbooks)

| Skill | Path | What It Covers |
|-------|------|----------------|
| **SEO Mastery** | `~/.claude/skills/seo-mastery/SKILL.md` | Expert-level SEO knowledge — technical audits, content strategy, link building, AI search optimization, E-E-A-T, Core Web Vitals. The comprehensive "how to do SEO" reference. |
| **SEO Specialist (Orchestrator)** | `~/.claude/skills/seo-specialist/SKILL.md` | Department-level SEO coordination. Analyzes site type, delegates to subcategories, produces unified audit reports with prioritized action plans. |
| **Technical SEO** | `~/.claude/skills/seo-specialist/technical-seo/SKILL.md` | Crawlability, speed, mobile, schema, canonicalization, site architecture. How Kenji executes. |
| **On-Page SEO** | `~/.claude/skills/seo-specialist/on-page-seo/SKILL.md` | Title tags, meta descriptions, headers, content optimization, internal linking. How Mika executes. |
| **Content SEO** | `~/.claude/skills/seo-specialist/content-seo/SKILL.md` | Keyword research, content planning, topic clustering, content gaps. How Ryo and Haruki execute. |
| **Off-Page SEO** | `~/.claude/skills/seo-specialist/off-page-seo/SKILL.md` | Link building, outreach, digital PR, link analysis. How Takeshi executes. |
| **Local SEO** | `~/.claude/skills/seo-specialist/local-seo/SKILL.md` | GMB/GBP optimization, citations, local rankings, review management. How Hana executes. |
| **Ecommerce SEO** | `~/.claude/skills/seo-specialist/ecommerce-seo/SKILL.md` | Product optimization, category pages, faceted navigation, product schema. |
| **International SEO** | `~/.claude/skills/seo-specialist/international-seo/SKILL.md` | Hreflang, geo-targeting, multilingual content. |

### Agency & Business Skills

| Skill | Path | What It Covers |
|-------|------|----------------|
| **Marketing Agency** | `~/.claude/skills/marketing-agency/SKILL.md` | Master orchestrator for 15 marketing disciplines (487+ capabilities). Full audit flow, campaign launch support, resource planning. The "what does a real agency do?" reference. |
| **AI Agency Pricing** | `~/.claude/skills/ai-agency-pricing-mastery/SKILL.md` | Pricing models, packaging, competitive positioning for AI-powered agencies. How to price Tenkai's services. |
| **Market Research** | `~/.claude/skills/market-research-mastery/SKILL.md` | Professional market research playbook — competitive analysis, personas, positioning. |

### Handoff Files (build history & decisions)

| File | Path | What It Covers |
|------|------|----------------|
| **SEO Expansion** | `.claude/handoffs/handoff_20260312_tenkai_seo_expansion.md` | The main build record: gap analysis vs real agencies, what was built, architecture decisions, phase progress. **Read this first for context.** |
| **Tenkai Strategy** | `.claude/handoffs/handoff_20260309_tenkai_strategy.md` | Original strategic vision for Tenkai as a product. |
| **Portal Rebuild** | `.claude/handoffs/handoff_20260311_100000_tenkai_portal_rebuild.md` | Portal UI architecture, layout groups, component structure. |
| **SQL Migration** | `.claude/handoffs/handoff_20260311_110000_tenkai_sql_migration.md` | Database schema decisions, migration history. |
| **Tenkai Build** | `.claude/handoffs/handoff_20260311_040500_tenkai_build.md` | Initial build session — worker, agents, queue system. |
| **Auth Fix** | `.claude/handoffs/handoff_20260311_054500_tenkai_auth_fix.md` | Auth system debugging, Supabase RLS. |
| **Original SEO Research** | `.claude/handoffs/handoff_20260308_001_seo.md` | First SEO research session — foundational decisions. |

### Quality Reports

| File | Path | What It Covers |
|------|------|----------------|
| **Quality Report** | `tenkai-marketing/test-results/quality-report-20260312.md` | Per-deliverable analysis of all 6 original request types. Scores, completeness, actionability, bugs found. The quality bar reference. |

### How to Use These References

1. **For understanding agent capabilities:** Read the SEO Mastery skill + the specific subcategory skill matching the agent's role
2. **For improving agent prompts:** Read the subcategory skill to understand what a real expert would deliver, then compare to agent output
3. **For pricing/packaging:** Read AI Agency Pricing Mastery
4. **For onboarding new request types:** Read Marketing Agency skill for the full capability map, identify gaps, follow the pattern in `prompts.ts`
5. **For quality assessment:** Use the quality report format and scoring rubric from the test results
6. **For architecture decisions:** Read the SEO Expansion handoff — documents WHY each decision was made
