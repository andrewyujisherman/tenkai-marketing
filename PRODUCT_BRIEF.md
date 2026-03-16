# PRODUCT_BRIEF.md — Tenkai Marketing
## Product Experience Blueprint (Phases 0-1 of /deployment)
Generated: 2026-03-16

---

## 1. PRODUCT IDENTITY

**Product:** Tenkai Marketing
**One-liner:** AI-powered SEO agency with a team of 9 named Japanese AI agents that handle content, audits, link building, local SEO, and reporting — from $150/mo.
**URL:** https://tenkai-marketing.vercel.app
**Tech Stack:** Next.js 14.2.35 (App Router), Supabase (PostgreSQL + Auth + RLS), Stripe (live mode), Google Gemini 2.5 (Flash + Pro), Resend (email), Tailwind CSS + shadcn/ui, Vercel hosting
**Design Direction:** Classical Japanese tea house meets Linear SaaS — restrained, warm, premium. Ivory/cream base, Torii Gate Red (#C1554D) accent, Noto Serif JP headings, Inter body.

---

## 2. CUSTOMER PERSONA

### Who: Small Business Owner / Marketing Manager at a Local Service Business

**Name archetype:** Sarah, 38, owns a plumbing company in Austin, TX with 12 employees.

**Her day looks like this:** She starts at 6:30 AM answering service calls, manages a crew of plumbers, handles billing in the afternoon, and tries to squeeze in "marketing stuff" between 8-10 PM when she's exhausted. She knows she needs better Google rankings because her competitor who showed up 2 years ago already outranks her for "plumber near me." She has a WordPress site her nephew built 3 years ago. She's tried SEO tools like Semrush — they're confusing. She hired an SEO agency once — they charged $3,000/month, sent her reports she couldn't understand, and she never knew if they actually did anything. She canceled after 4 months.

**Demographics:**
- Small business owner OR marketing manager at a company with 5-50 employees
- Local service business (plumbing, dental, HVAC, legal, real estate, restaurants)
- Revenue: $500K-$5M/year
- Age: 30-55
- Technical sophistication: Low to moderate. Can use WordPress admin but doesn't know what "schema markup" means.
- Location: US-based, primarily serves a local geographic area

**Pain points (ranked by intensity):**
1. **"I know I need SEO but I don't know what to do."** Overwhelmed by jargon, tools, and conflicting advice. Paralyzed by complexity.
2. **"Agencies are too expensive and I can't tell if they're working."** Past agency experience was opaque — black box reports, no visibility into what's actually happening. $2-10K/mo feels like gambling.
3. **"I don't have time to learn SEO or manage content."** Running a business is already 60+ hours/week. SEO becomes the thing that "I'll get to next quarter" indefinitely.
4. **"My competitors are outranking me and I'm losing business."** Can see competitors above them in search results. Knows this costs them real revenue.
5. **"I want to stay in control without doing the work."** Doesn't want AI publishing content without their approval. Needs to review and sign off, but doesn't want to write or strategize.

**What she'd pay for (and feel good about):**
- Someone/something that DOES the work but lets her stay in charge
- Clear, jargon-free reports in English she can understand
- Content she can approve before it goes live
- A price she can afford month-to-month without contracts
- Visible evidence that things are happening (activity feed, agent updates)

---

## 3. PROBLEM BEING SOLVED

**Core problem:** Small businesses need professional SEO but can't afford agencies ($2-10K/mo), can't figure out DIY tools (Semrush/Ahrefs are built for SEO pros), and don't have time to learn. The market has a massive gap between "$50/mo confusing tools" and "$3,000/mo opaque agencies."

**Tenkai's solution:** An AI team that operates like a boutique agency — named agents with specific roles who do the actual work (audits, content, link building, monitoring) — at agency-reject prices ($150-500/mo), with full transparency via a client dashboard and a multi-stage content approval workflow that keeps the business owner in control.

**Why this specific approach:**
- **Named agents** (not "our AI") → Creates trust and accountability. "Sakura wrote your article" is more credible than "AI generated content."
- **Japanese branding** → Differentiation in a sea of generic "AI Marketing" products. Memorable, premium-feeling, culturally distinct.
- **Client approval gates** → Addresses the #1 objection: "I don't trust AI to publish stuff for my business." Nothing goes live without sign-off.
- **Plain English reporting** → Solves the opacity problem that kills agency relationships.

---

## 4. FEATURE INVENTORY

### 4.1 Landing Page (Marketing Site)

#### F-LP-1: Hero Section
- **What:** Full-screen hero with headline "Your heavenly SEO team, working 24/7", URL input field, "Analyze My Site" CTA, dashboard preview mock, sakura petal animations
- **WHY it exists:** The URL input is the primary conversion mechanism. It creates an immediate action (not "learn more") and pre-fills the onboarding flow. The mock dashboard shows what they'll get before signing up.
- **Quality bar:** CTA must be the most prominent element. URL input must be obvious. "No credit card required" must be visible. Dashboard mock must show real agent names and realistic activity.
- **Connections:** URL input → Onboarding page (pre-fills business URL) → Service request queue (triggers first audit)

#### F-LP-2: Agent Showcase
- **What:** Grid of 6 agents (Haruki, Sakura, Kenji, Yumi, Takeshi, Aiko) with Japanese names, roles, and descriptions
- **WHY it exists:** Makes the "AI team" concept tangible. People buy from people, even AI people. Each agent having a name and specialty makes the service feel like a real team, not a chatbot.
- **Quality bar:** Each agent must have a clear, distinct role. No overlapping descriptions. Japanese names with kanji characters visible. Icons differentiate at a glance.
- **Connections:** Agent names appear throughout the portal — in activity feeds, deliverables, content authorship. Landing page introduces them; portal shows them working.
- **NOTE:** Landing page shows 6 agents but the system actually has 9 (Mika, Ryo, Hana, Daichi added later). The landing page should be updated to show all 9, or the 6 shown should be the most customer-relevant.

#### F-LP-3: How It Works (3 steps)
- **What:** "Free Audit → Custom Strategy → Execution & Growth" three-step flow
- **WHY it exists:** Reduces perceived complexity. Customer needs to believe: "I can do this in 5 minutes and it just works." Three steps is the magic number for onboarding promises.
- **Quality bar:** Steps must be accurate to the real flow. Step 1 promise "60 seconds" must be achievable (audit is queued, not instant — this is a MISMATCH to verify).
- **Connections:** Step 1 → Hero CTA → Onboarding. Step 2 → Dashboard deliverables. Step 3 → Content/Health/Reports pages.

#### F-LP-4: Content Workflow (6-step)
- **What:** Visual timeline showing Topic Generation → Client Approval → EEAT Check → AI Drafting → Internal Review → Client Final Approval
- **WHY it exists:** Directly addresses the fear "AI will publish garbage under my name." Shows the customer has TWO approval gates. Demonstrates quality standards (EEAT compliance).
- **Quality bar:** Client approval steps must be visually distinct (red/highlighted). Must communicate that nothing publishes without sign-off.
- **Connections:** This workflow is implemented in the Content page's topic approval → draft review pipeline.

#### F-LP-5: Pricing Section
- **What:** Three tiers — Starter ($150/mo), Growth ($275/mo, "Most Popular"), Pro ($500/mo). Feature comparison per tier. "Start with [Tier]" CTAs that trigger Stripe Checkout.
- **WHY it exists:** Anchoring psychology — Growth is the target (positioned as "Most Popular" with visual emphasis). Starter exists to make Growth look like a deal. Pro exists for high-value clients and to make Growth feel affordable.
- **Quality bar:** Prices must match Stripe price IDs. Feature descriptions must be accurate. "Month-to-month" and "Cancel anytime" and "14-day money-back" must be prominent. CTA buttons must successfully create Stripe checkout sessions.
- **Connections:** CTA → `/api/checkout` → Stripe Checkout Session → Success redirects to `/dashboard?welcome=true` → Stripe webhook updates client tier in DB
- **Pricing rationale:**
  - **Starter $150/mo:** Undercuts all traditional agencies (min $2K). Low enough to be a no-brainer for a business doing $500K+ revenue. Includes 2 blog posts, basic audit, monthly reports, top 10 keywords. Cost per customer: ~$8-15/mo (Gemini API). Margin: ~90%.
  - **Growth $275/mo:** Sweet spot. Doubles content output (4 posts), adds GBP management, bi-weekly reports, competitor tracking. Cost: ~$15-30/mo. Margin: ~89%.
  - **Pro $500/mo:** Full service. 8 posts, weekly reports, unlimited keywords, bi-weekly strategy sessions. Cost: ~$30-60/mo. Margin: ~88%.

#### F-LP-6: Comparison Table
- **What:** Tenkai vs. Traditional Agency vs. DIY Tools vs. "MEGA" across 6 dimensions (Price, Content Quality, Control, Transparency, Contracts, Support)
- **WHY it exists:** Competitive positioning. Shows Tenkai wins on price vs. agencies, wins on quality vs. DIY, and wins on control/transparency vs. both.
- **Quality bar:** Must be truthful. "MEGA" column is ambiguous — should reference specific competitors or be removed.
- **Connections:** Reinforces pricing section positioning.

#### F-LP-7: FAQ (8 questions)
- **What:** Accordion FAQ covering pricing, content quality, EEAT, AI detection, how agents work, cancellation, onboarding speed, results timeline
- **WHY it exists:** Objection handling. Each FAQ directly addresses a common customer fear or question that prevents conversion.
- **Quality bar:** Answers must be accurate and specific. "6 AI experts" claim in FAQ should match the actual agent count shown elsewhere. "Under 5 minutes" onboarding claim must be testable.
- **Connections:** References agents by name, pricing tiers, content workflow.

#### F-LP-8: Footer (Final CTA + Links)
- **What:** Final CTA with URL input ("Get Free Audit") + "Book a Live Demo" button. Footer links: Features, Pricing, Book a Demo, About, Sign Up, Log In, Privacy, Terms, Contact.
- **WHY it exists:** Last-chance conversion. Users who scrolled all the way down are engaged but hesitant. Give them one more push.
- **Quality bar:** "Get Free Audit" CTA goes to `/auth/signup`. "Book a Live Demo" goes to cal.com. All footer links must resolve. Contact email (support@alegius.com) must be monitored.
- **Connections:** Sign Up → Auth flow. Log In → Auth flow. Privacy/Terms → Legal pages.

#### F-LP-9: Navbar
- **What:** Sticky navbar with Tenkai branding (kanji + name), anchor links (#features, #about, #pricing), "Book a Demo" link, "Sign Up" / "Log In" buttons
- **WHY it exists:** Navigation and persistent conversion affordance.
- **Quality bar:** Must be sticky. Must have both demo booking and direct signup options.
- **Connections:** Links to sections on landing page + auth pages.

---

### 4.2 Auth Flow

#### F-AUTH-1: Email/Password Signup
- **What:** Standard email + password registration via Supabase Auth
- **WHY it exists:** Core authentication. Creates auth.users record which links to clients table via auth_user_id.
- **Quality bar:** Must handle Supabase email rate limits gracefully (free tier: 3 emails/hr). Must accept real email domains. Error messages must be user-friendly.
- **Connections:** Signup → Email confirmation → Login → Onboarding OR Dashboard. Client record created in `/api/portal/onboarding` if not already existing.
- **KNOWN ISSUE (P0):** Supabase free tier rate limits signup confirmation emails to 3/hour.

#### F-AUTH-2: Login
- **What:** Email + password login, redirects to dashboard or original destination
- **WHY it exists:** Returning user access.
- **Quality bar:** Must support redirect parameter (post-login navigation to intended page). Must redirect authenticated users away from auth pages.
- **Connections:** Login → Dashboard (default) or redirect target. Middleware handles redirect logic.

#### F-AUTH-3: Set Password (Invite Flow)
- **What:** Password-setting page for invited users (admin creates client, sends invite link)
- **WHY it exists:** Admin-initiated onboarding. Admin can invite clients by email; they receive a link to set their password.
- **Quality bar:** Must not redirect invited users away from `/auth/set-password` even if authenticated.
- **Connections:** Admin invite → Email with set-password link → User sets password → Onboarding flow.

#### F-AUTH-4: Demo Mode
- **What:** Cookie-based bypass (`demo_mode=true`) that uses `DEMO_CLIENT_ID` (hardcoded UUID `00000000-0000-0000-0000-000000000001`) for all data queries. Bypasses auth in middleware.
- **WHY it exists:** Allows prospects and sales demos to experience the full portal without creating an account. Shows real-looking data.
- **Quality bar:** Demo banner must be visible. All portal pages must support demo mode. Data must look realistic.
- **Connections:** Every portal page checks `isDemoMode()` and swaps to `supabaseAdmin` with `DEMO_CLIENT_ID`.

---

### 4.3 Onboarding

#### F-ONB-1: 10-Question Onboarding Flow
- **What:** Two rounds of 5 questions each with transition screen between them. Round 1 (Getting Started): Business name + URL, Industry, Competitors (3 fields), Products/services, Location. Round 2 (Personalizing): Differentiators, Years in business, Testimonials, Biggest online challenge, 6-month goals.
- **WHY it exists:** Collects the context agents need to produce relevant work. Business URL is critical for audits. Competitors enable competitive analysis. Industry and location enable local SEO. Without this data, agent outputs are generic.
- **Quality bar:** Questions must be skippable (except implicit — all are technically skippable). URL from hero CTA must pre-fill. Progress bar must show 1-10 continuous across both rounds. Completion must trigger auto-audit.
- **Connections:**
  - Hero CTA (URL param) → Pre-fills business URL question
  - Submission → `POST /api/portal/onboarding` → Saves onboarding_data to clients table → Sets client status to "active"
  - **Auto-creates a `site_audit` service request** at priority 8 (high) so client gets immediate value
  - Completion screen → Dashboard link

#### F-ONB-2: Post-Onboarding Expectations
- **What:** Completion screen showing 3 timeline promises: (1) Within 24 hours: Kenji runs first technical SEO audit, (2) Within 48 hours: Haruki delivers keyword strategy, (3) First content drafts: Sakura starts writing within the week.
- **WHY it exists:** Sets expectations and builds excitement. Tells the customer exactly what happens next so they don't feel abandoned.
- **Quality bar:** These promises MUST be deliverable. The auto-audit from onboarding is the mechanism for promise #1. Promises #2 and #3 require additional automated service requests or manual admin triggering.
- **Connections:** Promise #1 → Auto site_audit service request. Promises #2-3 → Currently require manual intervention (gap).

---

### 4.4 Portal (Client Dashboard)

#### F-PORTAL-LAYOUT: Sidebar + Header
- **What:** Fixed left sidebar (260px) with navigation links: Dashboard, Content, Site Health, Reports, Link Building, Local SEO, Integrations, Settings. Collapsible on mobile. Portal header with user info. Demo banner when in demo mode.
- **WHY it exists:** Standard SaaS portal pattern. Sidebar provides persistent navigation. Each section maps to a category of agent work.
- **Quality bar:** Active page must be highlighted. Admin link visible only for admin users. All nav items must route to working pages. Mobile sidebar must be functional.
- **Connections:** Every portal page is wrapped by this layout. Admin visibility controlled by `isAdmin()` email check.

#### F-DASH-1: Dashboard Overview
- **What:** Stats cards (Total Content, Pending Approvals, Audit Score, Published Content), Pending Approval cards, Activity Feed (recent content posts), Recent Deliverables list.
- **WHY it exists:** The "home base." Customer should see at-a-glance: "Are my agents working? What needs my attention? How's my site doing?" This is the #1 anxiety-reducer.
- **Quality bar:** Stats must show real data. Pending approvals must have actionable buttons. Activity feed must show agent names and actions. Deliverables must be expandable with full content.
- **Connections:**
  - Stats pull from: content_posts (count), approvals (pending count), audits + deliverables (score), content_posts (published count)
  - Activity feed queries content_posts with `agent_author` field
  - Deliverables come from deliverables table filtered by client_id
- **KNOWN ISSUE (P0):** Dashboard queries `content_type` column which DOES NOT EXIST in content_posts. Activity feed type labels will be null/blank.
- **KNOWN ISSUE (P1):** Code checks for `status === 'pending_review'` but the CHECK constraint only allows: draft, pending_approval, approved, published, rejected. This branch is dead code.

#### F-CONTENT-1: Content Page
- **What:** Tabbed interface with three sections: Topics (drafts awaiting approval), Drafts (pending_approval content with full text, SEO score, AI detection score), Published posts. Plus: Content Deliverables section showing content_draft and keyword_list deliverables. Planning section showing content_plan and cluster_map deliverables. Health section showing decay_report deliverables.
- **WHY it exists:** The content approval workflow is the product's core differentiator. This page is where customers exercise their "You stay in control" promise. Topic approval → Draft review → Publish decision.
- **Quality bar:** Approve/Deny/Edit actions must work. Full article text must be readable. SEO scores must display. AI detection scores must display. Word count and reading time must calculate.
- **Connections:**
  - Topics: content_posts where status = 'draft'
  - Drafts: content_posts where status = 'pending_approval'
  - Published: content_posts where status IN ('approved', 'published')
  - Queue worker creates content_posts when processing `content_article` requests (content promotion bridge)
  - Approval actions → `PATCH /api/content/[id]` (to verify)

#### F-HEALTH-1: Site Health Page
- **What:** Overall SEO score (0-100) with category breakdown (Technical, Content, Authority), Issue cards (critical/warning/passed), Recommendations list, Technical Deliverables (technical_report, schema_code, redirect_config, robots_config, audit_report), On-Page Deliverables (on_page_report, meta_report).
- **WHY it exists:** Shows the customer their site's SEO health and what the agents are fixing. This is the tangible proof that work is happening. The score gives a simple "how am I doing?" metric.
- **Quality bar:** Score ring/circle must be visually prominent. Issues must be categorized by severity. "Fix Now" actions on critical issues must do something meaningful. Empty state must prompt running an audit.
- **Connections:**
  - Primary data: audits table (overall_score, technical_score, content_score, authority_score, issues, recommendations)
  - Fallback: deliverables table where deliverable_type = 'audit_report' (parsed from agent JSON output)
  - Technical deliverables: deliverables filtered by type
  - Triggered by: site_audit, technical_audit service requests

#### F-REPORTS-1: Reports Page
- **What:** Performance reports from reports table (weekly/biweekly/monthly/quarterly), plus deliverable sections: Keyword Research (keyword_list), Competitor Analysis (competitive_report), Analytics (analytics_report, performance_report, audit_report), AI Search (geo_report, entity_report).
- **WHY it exists:** Replaces the opaque agency report. Instead of a PDF they can't understand, customers get structured, navigable data organized by topic. Plain English insights.
- **Quality bar:** Reports must have period labels. Metrics must be formatted (numbers, percentages). Insights must be in plain English. Deliverable content must be expandable and readable.
- **Connections:**
  - Reports from: reports table
  - Deliverables from: deliverables table filtered by type
  - Triggered by: monthly_report, keyword_research, competitor_analysis, analytics_audit, geo_audit, entity_optimization service requests

#### F-LINKS-1: Link Building Page
- **What:** Three sections: Backlink Profile (link_report deliverables), Outreach (outreach_templates, guest_post_draft, article deliverables), Directory Submissions (directory_profiles deliverables). Empty state when no deliverables exist.
- **WHY it exists:** Link building is a major SEO service that customers pay for. This page shows what Takeshi (Link Builder agent) has produced — backlink analysis, outreach email templates, guest post drafts, directory submission profiles.
- **Quality bar:** Each deliverable type must render appropriately. Content must be actionable (email templates they can send, directories they can submit to).
- **Connections:**
  - Handled by agent: Takeshi (link_analysis, outreach_emails, guest_post_draft, directory_submissions)
  - Deliverable types: link_report, outreach_templates, article, directory_profiles

#### F-LOCAL-1: Local SEO Page
- **What:** Three sections: Local SEO Audits (local_report deliverables), Google Business Profile (gbp_report deliverables), Reviews (review_responses, campaign_templates deliverables). Empty state when no deliverables exist.
- **WHY it exists:** Local SEO is the highest-value service for the target customer (local service businesses). GBP optimization, review management, and local audit findings directly impact "plumber near me" rankings.
- **Quality bar:** GBP optimization recommendations must be specific and actionable. Review response drafts must be professional. Campaign templates must be usable.
- **Connections:**
  - Handled by agent: Hana (local_seo_audit, gbp_optimization, review_responses, review_campaign)
  - Growth tier adds GBP management. Starter tier does not include GBP (tier gating to verify).

#### F-INTEG-1: Integrations Page
- **What:** Two tabs — "Connections" (Google Search Console, Google Analytics 4, Google Business Profile OAuth connectors + WordPress CMS connection) and "Business Profile" (Website URL, Competitors, Target Keywords, Brand Voice, Business Information — 5 collapsible sections with save functionality).
- **WHY it exists:** Dual purpose: (1) OAuth integrations let agents pull REAL data (GSC rankings, GA4 traffic, GBP reviews) instead of relying solely on scraping/inference. (2) Business context gives agents the customer-specific information needed to produce relevant, accurate work.
- **Quality bar:** OAuth connect/disconnect must work. Integration health bar must accurately show connected count. Business profile completion bar must track properly. Save must persist via `/api/portal/profile`. Form must load existing data.
- **Connections:**
  - OAuth flow: Button → `/api/auth/oauth/google?type=[type]` → Google consent → Callback stores tokens in client_integrations table
  - Business context: Saved to clients.onboarding_data via `/api/portal/profile`
  - Agent enrichment: Queue worker calls `fetchAllSiteData()` which uses integration credentials for GSC, GA4 data alongside PageSpeed API and SERP API

#### F-SETTINGS-1: Settings Page
- **What:** Four tabs — Profile (business info form with save), Billing (Stripe Customer Portal link), Team (email-based invite request), Notifications (5 toggleable preferences: content approval, weekly summary, ranking changes, audit findings, billing receipts).
- **WHY it exists:** Standard SaaS settings. Profile lets them update business info. Billing lets them manage subscription without contacting support. Notifications give them control over communication frequency.
- **Quality bar:** Profile save must persist. Billing portal must open Stripe's hosted portal. Team tab is manual (email request) — acceptable for early stage. Notification toggles must auto-save with debounce.
- **Connections:**
  - Profile: PATCH `/api/portal/profile`
  - Billing: POST `/api/billing/portal` → Stripe Customer Portal Session → redirect
  - Notifications: GET/PATCH `/api/portal/notifications` → clients.notification_preferences JSONB column

---

### 4.5 Service Request System (The Engine)

#### F-SRV-1: Service Request API
- **What:** `POST /api/services/request` — authenticated endpoint that accepts `request_type`, `target_url`, `parameters`, `priority`. Validates against 27 valid request types. Creates a row in `service_requests` table with status 'queued'. Auto-assigns agent based on request type.
- **WHY it exists:** This is how work enters the system. Every service the customer can request — from audits to content writing to link building — flows through this single API.
- **Quality bar:** Must validate request_type strictly. Must fall back to client's stored website_url if no target_url provided. Must enforce priority range 1-10.
- **Connections:**
  - Portal UI (service request form) → This API → service_requests table → Queue worker polls and processes
  - Onboarding auto-creates a site_audit request through this same mechanism

#### F-SRV-2: Queue Worker
- **What:** Long-running Node.js process (`npx tsx src/workers/queue-worker.ts`) that polls `service_requests` table every 10 seconds for `status = 'queued'` items. Claims a request atomically, calls Google Gemini API with agent-specific system prompt and task message, parses JSON response, creates a deliverable, and marks the request as completed.
- **WHY it exists:** This is the "agent" — the thing that actually does the SEO work. It's the entire value proposition embodied in code. Without this worker, agents are just names on a website.
- **Quality bar:**
  - Must handle failures gracefully (retry up to max_attempts=3, then mark as failed)
  - Must route to correct Gemini model (Flash for research, Pro for customer-facing)
  - Must scrape target URL for context before calling AI
  - Must enrich with GSC/GA4/PageSpeed/SERP data when integrations are connected
  - Must produce parseable JSON deliverables
  - Content articles must also create content_posts for the approval workflow
  - 2-minute timeout per request
- **Connections:**
  - Reads from: service_requests (queued)
  - Writes to: deliverables (creates), service_requests (updates status), content_posts (article promotion bridge)
  - Uses: Gemini API (gemini-2.5-flash / gemini-2.5-pro), site scraping, Google Search grounding, fetchAllSiteData (GSC/GA4/PageSpeed/SERP integrations)

#### F-SRV-3: 27 Service Types (6 Categories)
- **Content (6):** content_brief, content_article, content_rewrite, content_calendar, topic_cluster_map, content_decay_audit
- **Website Health (7):** site_audit, technical_audit, on_page_audit, meta_optimization, schema_generation, redirect_map, robots_sitemap
- **Link Building (4):** link_analysis, outreach_emails, guest_post_draft, directory_submissions
- **Local & Reviews (4):** local_seo_audit, gbp_optimization, review_responses, review_campaign
- **Research & Strategy (4):** keyword_research, competitor_analysis, geo_audit, entity_optimization
- **Analytics & Reports (2):** analytics_audit, monthly_report
- **WHY this structure:** Covers the full SEO service spectrum. Each service type maps to a specific input configuration (URL-only vs. URL+topic vs. URL+context), a specific agent, a specific Gemini model, and a specific deliverable type. The 6 categories map to the 6 portal page sections.
- **Connections:** Each service type → agent assignment (9 agents) → model routing (Flash vs Pro) → deliverable type → portal page section

---

### 4.6 Agent System (9 Agents)

| Agent | Kanji | Role | Services Handled | Model |
|-------|-------|------|------------------|-------|
| Haruki | 春樹 | SEO Strategist | site_audit, keyword_research, competitor_analysis | Pro |
| Sakura | 桜 | Content Specialist | content_brief, content_article, content_rewrite | Pro (article), Flash (rewrite) |
| Kenji | 健二 | Technical SEO | technical_audit, schema_generation, redirect_map, robots_sitemap | Pro (audit), Flash (generation) |
| Yumi | 由美 | Analytics | analytics_audit, monthly_report, content_decay_audit | Pro (audit/report), Flash (decay) |
| Takeshi | 武 | Link Builder | link_analysis, outreach_emails, guest_post_draft, directory_submissions | Flash (analysis), Pro (outreach/guest post), Flash (directory) |
| Mika | 美花 | On-Page Optimizer | on_page_audit, meta_optimization | Pro (audit), Flash (meta) |
| Ryo | 涼 | Content Planner | content_calendar, topic_cluster_map | Pro (calendar), Flash (cluster) |
| Hana | 花 | Local SEO Specialist | local_seo_audit, gbp_optimization, review_responses, review_campaign | Pro (audit/gbp), Flash (reviews/campaign) |
| Daichi | 大地 | GEO / AI Search Specialist | geo_audit, entity_optimization | Pro (geo), Flash (entity) |

**WHY 9 agents instead of 1:**
- Specialization creates credibility ("our SEO strategist" vs. "our AI")
- Named agents create accountability in deliverables
- Different agents can have different system prompts optimized for their specialty
- Future: agents can "collaborate" on complex requests
- Personality creates engagement and loyalty ("Sakura wrote me a great article")

**NOTE:** Landing page only shows 6 agents (Haruki, Sakura, Kenji, Yumi, Takeshi, Aiko). The design-system.ts defines 6 agents with "Aiko" as Report Analyst, but the actual agent registry has 9 agents with "Yumi" covering analytics instead of "Aiko." The naming mismatch (Aiko on landing page vs. Yumi in backend) needs resolution.

---

### 4.7 Admin System

#### F-ADMIN-1: Admin Dashboard
- **What:** Email allowlist-protected admin area (`/admin/*`). Pages: Overview (admin/page.tsx), Clients list + detail (admin/clients), Content management (admin/content), Invites (admin/invites), Users (admin/users).
- **WHY it exists:** Business owner (Andrew/Alegius) needs to manage clients, review content across all accounts, send invites, and monitor the system.
- **Quality bar:** Must be inaccessible to non-admin users (middleware + RLS). Admin email allowlist must be configurable via env var.
- **Connections:**
  - Middleware redirects non-admins to /dashboard
  - RLS policies grant admin role (from JWT app_metadata) full access to all tables
  - **KNOWN ISSUE (P0):** Custom JWT hook must be manually enabled in Supabase Dashboard > Auth > Hooks. If not enabled, admin RLS bypass is broken.

---

### 4.8 Payment System

#### F-PAY-1: Stripe Checkout
- **What:** `POST /api/checkout` creates a Stripe Checkout Session (subscription mode) for the selected tier. Uses env-var price IDs per tier. Redirects to Stripe-hosted checkout page.
- **WHY it exists:** Payment collection. Stripe Checkout is the fastest, most secure way to collect payment without building a custom payment form.
- **Quality bar:** Must use correct price IDs per tier. Success URL must redirect to dashboard with welcome flag. Cancel URL must redirect to homepage.
- **Connections:** Pricing CTA → Checkout API → Stripe Checkout → Success → Dashboard. Stripe Webhook → Updates client tier/status.
- **KNOWN ISSUE (P1):** Checkout doesn't reuse existing stripe_customer_id — creates duplicate Stripe customers if a user checks out multiple times.

#### F-PAY-2: Stripe Webhooks
- **What:** `POST /api/webhooks/stripe` handles 5 events: checkout.session.completed (sets tier + customer ID), subscription.updated (tier/status change), subscription.deleted (cancellation), invoice.payment_failed (past_due), invoice.payment_succeeded (restores active from past_due).
- **WHY it exists:** Server-side state management. Client's tier, status, and Stripe IDs must stay in sync with Stripe's state. Webhooks are the only reliable way to do this.
- **Quality bar:** Signature verification must work. All 5 event types must be handled. Client matching must work by client_id (metadata), email (fallback), or stripe_customer_id (for updates).
- **Connections:** Stripe → Webhook → clients table update (tier, status, stripe_customer_id).

#### F-PAY-3: Billing Portal
- **What:** `POST /api/billing/portal` creates a Stripe Billing Portal Session. Redirects customer to Stripe-hosted portal to manage subscription, payment method, and invoices.
- **WHY it exists:** Self-service billing management. Customer can upgrade, downgrade, cancel, update payment method without contacting support.
- **Quality bar:** Must find the customer's stripe_customer_id. Must redirect back to /settings?tab=billing after portal use.
- **Connections:** Settings page Billing tab → Billing Portal API → Stripe Portal → Return to Settings.

---

## 5. SCHEMA DOCUMENTATION

### 5.1 Tables (8 tables, 1 view)

#### `clients` (Core entity — one per paying customer)
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| id | UUID (PK) | NO | gen_random_uuid() |
| email | TEXT (UNIQUE) | NO | Login email, lowercase |
| name | TEXT | YES | Full name |
| company_name | TEXT | YES | Business name |
| website_url | TEXT | YES | Primary site URL |
| tier | TEXT | YES | CHECK: starter, growth, pro |
| stripe_customer_id | TEXT | YES | Stripe cus_xxx |
| stripe_subscription_id | TEXT | YES | Stripe sub_xxx |
| status | TEXT | YES | Default 'active'. Values: active, onboarding, canceled, past_due |
| onboarding_data | JSONB | YES | Answers from onboarding + business context from settings |
| auth_user_id | UUID (FK→auth.users) | YES | Links to Supabase auth |
| notification_preferences | JSONB | YES | Default: content_ready, weekly_report, strategy_updates, billing_alerts all true |
| created_at | TIMESTAMPTZ | YES | |
| updated_at | TIMESTAMPTZ | YES | Auto-updated by trigger |

#### `service_requests` (Work queue)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK→clients, CASCADE) | |
| request_type | TEXT | CHECK: 27 valid types |
| target_url | TEXT | |
| parameters | JSONB | Default '{}' |
| status | TEXT | CHECK: queued, processing, completed, failed, review |
| assigned_agent | TEXT | One of 9 agent IDs |
| priority | INT | 1-10, default 5 |
| attempts | INT | Default 0 |
| max_attempts | INT | Default 3 |
| error_message | TEXT | |
| created_at | TIMESTAMPTZ | |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |

#### `deliverables` (Agent outputs)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| request_id | UUID (FK→service_requests, CASCADE) | |
| client_id | UUID (FK→clients, CASCADE) | |
| agent_name | TEXT | CHECK: 9 agent IDs |
| deliverable_type | TEXT | CHECK: 24 valid types |
| title | TEXT | |
| content | JSONB | Full agent output (parsed JSON) |
| summary | TEXT | Generated summary |
| score | INT | 0-100, nullable |
| status | TEXT | CHECK: draft, review, approved, rejected |
| client_feedback | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated |

#### `content_posts` (Content approval pipeline)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK→clients, CASCADE) | |
| title | TEXT | |
| content | TEXT | Full article text |
| status | TEXT | CHECK: draft, pending_approval, approved, published, rejected |
| topic | TEXT | |
| keywords | TEXT[] | Array of target keywords |
| agent_author | TEXT | Agent name who wrote it |
| seo_score | INT | |
| ai_detection_score | FLOAT | |
| client_feedback | TEXT | |
| published_url | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | Auto-updated |

#### `audits` (SEO audit results)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK→clients, CASCADE) | |
| url | TEXT | Audited URL |
| overall_score | INT | 0-100 |
| technical_score | INT | |
| content_score | INT | |
| authority_score | INT | |
| issues | JSONB | Array of {severity, title, description, agent, affected_count} |
| recommendations | JSONB | Array of {priority, title, description, agent} |
| status | TEXT | Default 'pending' |
| created_at | TIMESTAMPTZ | |

#### `approvals` (Approval workflow items)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK→clients, CASCADE) | |
| content_post_id | UUID (FK→content_posts, CASCADE) | |
| type | TEXT | CHECK: content, strategy, audit |
| status | TEXT | CHECK: pending, approved, rejected |
| reviewer_notes | TEXT | |
| title | TEXT | Added in migration 003 |
| agent_name | TEXT | Added in migration 003 |
| description | TEXT | Added in migration 003 |
| created_at | TIMESTAMPTZ | |
| resolved_at | TIMESTAMPTZ | |

#### `reports` (Periodic performance reports)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK→clients, CASCADE) | |
| type | TEXT | CHECK: weekly, biweekly, monthly, quarterly |
| period_start | DATE | |
| period_end | DATE | |
| metrics | JSONB | |
| insights | JSONB | |
| agent_commentary | JSONB | |
| created_at | TIMESTAMPTZ | |

#### `client_integrations` (OAuth credentials for GSC/GA4/GBP)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| client_id | UUID (FK→clients, CASCADE) | |
| integration_type | TEXT | e.g., google_search_console, google_analytics, google_business_profile |
| credentials | JSONB | OAuth tokens (encrypted at rest by Supabase) |
| metadata | JSONB | Additional config (site URL, property ID) |
| status | TEXT | Default 'pending'. Values: not_connected, pending, active, expired, error |
| last_verified_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| **NOTE:** This table exists in live DB but has NO migration file — fresh deploy from migrations would fail. |

#### `audit_results` (VIEW)
- View over `audits` table, created in migration 003
- Grants SELECT to authenticated and anon
- Used by admin dashboard

### 5.2 RLS Summary

All tables have RLS enabled. Pattern:
- **Clients see their own data** via `auth_user_id = auth.uid()` (migration 002 upgraded from email matching)
- **Admins see everything** via `auth.jwt()->'app_metadata'->>'role' = 'admin'`
- **Anon can insert audits** (free audit form) with `client_id IS NULL`
- **Service role (queue worker) bypasses RLS** entirely via service_role key

**Critical dependency:** Admin RLS bypass requires the custom_access_token_hook to be enabled in Supabase Dashboard > Auth > Hooks. This injects the `role` claim from `app_metadata` into the JWT.

---

## 6. FEATURE CONNECTION MAP

```
LANDING PAGE                    AUTH                   ONBOARDING
─────────────                   ────                   ──────────
Hero URL Input ──────────────→ /auth/signup ─────────→ /onboarding (10 questions)
  ↓ (alt path)                  ↓                      ↓
  /onboarding?url=...          Login ──→ /dashboard    Submits to /api/portal/onboarding
                                                        ↓
Pricing CTAs ─→ /api/checkout ─→ Stripe Checkout        Saves onboarding_data
  ↓                              ↓                      Creates site_audit request (P8)
  ↓                         Success redirect             ↓
  ↓                              ↓                      ↓
  ↓                         /dashboard?welcome=true     Queue Worker picks up
  ↓                              ↓                      ↓
  ↓                         Stripe Webhook fires        Calls Gemini API
  ↓                              ↓                      ↓
  ↓                         Updates clients.tier        Creates deliverable
  ↓                                                     ↓
  ↓                                                    Appears on Dashboard + Health page

PORTAL PAGES              SERVICE REQUESTS              QUEUE WORKER
────────────              ────────────────              ────────────
Dashboard ←──── reads ←── deliverables table ←── creates ←── processRequest()
                                                              ↓
Content Page ←── reads ←── content_posts table ←── creates ←── (article promotion bridge)
                    ↓                                         ↓
                 Approve/Deny →─────────→ updates status      ↓
                                                              ↓
Health Page ←── reads ←── audits table                   Gemini API
                           deliverables table              (Flash / Pro)
                                                              ↓
Reports Page ←── reads ←── reports table               scrapeUrl() + fetchAllSiteData()
                            deliverables table           (PageSpeed, SERP, GSC, GA4)

Links Page ←── reads ←── deliverables (link types)
Local Page ←── reads ←── deliverables (local types)

Integrations ──→ /api/auth/oauth/google ──→ client_integrations table
    ↓                                           ↓
Business Profile ──→ /api/portal/profile    Worker reads OAuth tokens
    ↓                                       for enriched API data
    clients.onboarding_data

Settings ──→ /api/portal/profile (Profile tab)
          ──→ /api/billing/portal (Billing tab → Stripe Portal)
          ──→ /api/portal/notifications (Notification preferences)

ADMIN
─────
/admin/* ←── middleware email allowlist check
  ↓
Admin Dashboard: all clients, all content, invites, users
  ↓
Uses supabaseAdmin (service_role) + admin RLS policies
```

---

## 7. COMPLETE CUSTOMER JOURNEY

### Stage 1: DISCOVERY
**Trigger:** Sarah Googles "affordable SEO for small business" or sees a referral/ad
**Arrives at:** Landing page (https://tenkai-marketing.vercel.app)
**Expected emotion:** Curiosity mixed with skepticism ("Another AI marketing tool...")
**What she sees:**
- Hero: "Your heavenly SEO team, working 24/7" — immediately different from generic AI tools
- URL input field — low-friction, no signup required to start
- Sakura petals animation — memorable, premium feel
- Dashboard preview — shows what she'd get
- "$150/mo — no contracts, no jargon" — addresses price/commitment fears immediately
**Key decisions:** Should I enter my URL? Should I keep scrolling?
**Success metric:** Scroll depth past hero OR URL entered

### Stage 2: EVALUATION
**What she does:** Scrolls through landing page
**Expected emotion:** Growing interest, objection resolution happening
**Sequence:**
1. **Agent Showcase** → "Oh, they have specific AI people for each task. That's different."
2. **How It Works** → "Three steps. I can do that. Under 5 minutes."
3. **Content Workflow** → "Wait, I get to approve everything before it publishes? That's what I wanted."
4. **Pricing** → "$150 for the basics... $275 with GBP management — I need that for my plumbing business."
5. **Comparison Table** → "Half the price of my old agency and I get more control."
6. **FAQ** → "14-day money-back. Month-to-month. OK, low risk."
7. **Footer CTA** → "Get Free Audit" — one more push
**Key decision:** Do I trust this enough to enter my URL or create an account?
**Success metric:** CTA click (Hero URL input, Pricing button, or Footer CTA)

### Stage 3: SIGNUP
**Path A (Hero CTA):** Enters URL → Redirected to /onboarding?url=... → Needs to create account first
**Path B (Pricing CTA):** Clicks "Start with Growth" → Stripe Checkout → Account created on payment success
**Path C (Footer CTA):** Enters URL → Redirected to /auth/signup?url=...
**Path D (Footer link):** Clicks "Sign Up" → /auth/signup
**Expected emotion:** Commitment anxiety ("Is this going to be worth it?")
**What happens:**
- Email/password signup via Supabase Auth
- Confirmation email sent (RATE LIMIT RISK: 3/hr on free Supabase)
- On confirmation → Login → Redirected to onboarding or dashboard
**Friction points:**
- Supabase email rate limiting (P0 issue)
- No social login (Google OAuth is for integrations, not user auth)
- Confirmation email may go to spam
**Success metric:** Account created and confirmed

### Stage 4: ONBOARDING
**What she does:** Answers 10 questions across 2 rounds
**Expected emotion:** "This is actually asking me useful questions" → "They care about MY business"
**Flow:**
1. Round 1 (Getting Started): Business name + URL (pre-filled if from Hero), Industry, Competitors, Products, Location
2. Transition screen: "Great start!" — positive reinforcement
3. Round 2 (Personalizing): Differentiators, Years in business, Testimonials, Biggest challenge, Goals
4. Submit → POST /api/portal/onboarding
5. Completion screen: Timeline promises (24hr audit, 48hr keywords, first week content)
**What happens in the background:**
- Client record created/updated with onboarding_data
- Status set to 'active'
- Auto site_audit service request created at priority 8
- Queue worker picks up audit within seconds-to-minutes
**Expected emotion at completion:** "OK, I'm set up. Now let's see if they deliver."
**Success metric:** Onboarding completed, site_audit request queued

### Stage 5: FIRST VALUE (Critical — 0-24 hours)
**What she does:** Goes to Dashboard for the first time
**Expected emotion:** Anticipation → hopefully delight (if audit has completed) or patience (if still processing)
**What she should see:**
- Dashboard with her company name
- Activity feed showing agent activity (Haruki running audit)
- Audit score appearing in stats card
- First deliverable in the deliverables section
**Ideal scenario:** Audit is done. She sees a score of 62/100. She clicks into Health page and sees specific issues: "3 pages missing meta descriptions" (critical), "No schema markup detected" (warning), "Mobile page speed: 2.8s" (warning). She thinks: "OK, these are real problems. This thing knows its stuff."
**Worst-case scenario:** Audit isn't done yet. Dashboard is empty. She thinks: "I signed up and there's nothing here. Was this a scam?" → She needs clear "processing" indicators.
**Success metric:** First deliverable viewed and understood

### Stage 6: CONTENT APPROVAL (Days 3-7)
**What she does:** Receives notification (if set up) or checks Content page
**Expected emotion:** "Let me see what they wrote about my business"
**What she should see:**
- Topics proposed by Haruki (draft status) — she can approve or deny
- After approval, Sakura writes the article
- Draft appears with full text, SEO score, AI detection score, word count, reading time
- She reads it, maybe requests edits, then approves
**WHY this matters:** This is the product's differentiator IN ACTION. If the content is generic garbage, the product fails. If the content references her plumbing business, her location, her services — she's sold.
**Success metric:** First content post approved

### Stage 7: ONGOING USE (Weeks 2-4)
**What she does:** Checks dashboard weekly/biweekly
**Expected emotion:** "Things are happening. My team is working."
**What she should see:**
- New deliverables appearing (keyword research, competitor analysis)
- Health page score improving as technical issues get fixed
- Reports page showing performance data
- Content page with more articles for approval
- Integrations page — she connects GSC and GA4 for richer data
**Success metric:** Repeat logins, multiple content approvals, integrations connected

### Stage 8: PAYMENT
**Path A (Pre-onboarding):** Clicked pricing CTA → Stripe Checkout → Already paid before seeing the product
**Path B (Post-onboarding):** Used free audit → Saw value → Returns to pricing page → Checkout
**Expected emotion:** "I've seen what it does. $275/month is a no-brainer compared to my old $3K agency."
**What happens:**
- Stripe Checkout creates subscription
- Webhook fires → client tier updated (starter/growth/pro)
- Dashboard may show tier-specific features
- 14-day money-back guarantee reduces risk
**Friction points:**
- Checkout creates duplicate Stripe customers (P1 issue)
- No free trial period (they get a free audit, but the subscription starts immediately)
- No proration handling visible for tier changes
**Success metric:** Active subscription

### Stage 9: RETENTION (Month 2+)
**What keeps her:**
- Monthly reports showing ranking improvements
- Regular content production she doesn't have to think about
- Health score improving over time
- Competitive analysis showing she's closing the gap with competitors
- The feeling: "I have a team handling my SEO. I don't have to think about it."
**What makes her leave:**
- No visible ranking improvement after 3 months
- Content quality declining
- Dashboard stops showing new activity (agents stop producing)
- Feeling like she's paying for nothing
**Retention mechanisms:**
- Notification preferences (keep her engaged without annoying her)
- Weekly performance summaries (show value continuously)
- Content approval workflow (creates regular touch points)
- Billing portal (easy to manage, no hassle to stay)
**Success metric:** Month-over-month retention, subscription renewal

### Stage 10: EXPANSION/ADVOCACY
**Upgrade triggers:**
- Starter → Growth: "I need GBP management and more content"
- Growth → Pro: "I want weekly reports and priority support"
**Advocacy triggers:**
- Tells another business owner: "I use this thing called Tenkai for my SEO. It's like having a team but it's only $275 a month."
- Posts about results on social media
**Success metric:** Tier upgrade, referrals

---

## 8. INTEGRATION INVENTORY

| Integration | Type | Purpose | Status |
|------------|------|---------|--------|
| Supabase | Backend DB + Auth | All data storage, user auth, RLS | ACTIVE (free tier) |
| Stripe | Payments | Subscriptions, checkout, billing portal, webhooks | ACTIVE (live mode, sk_live_) |
| Google Gemini 2.5 | AI Engine | Agent processing (Flash for research, Pro for customer-facing) | ACTIVE |
| Resend | Email | Transactional emails (signup confirmation, notifications) | CONFIGURED |
| Google Search Console | OAuth Integration | Real keyword rankings, clicks, impressions | AVAILABLE (per-client OAuth) |
| Google Analytics 4 | OAuth Integration | Traffic, engagement, conversion data | AVAILABLE (per-client OAuth) |
| Google Business Profile | OAuth Integration | Local SEO, reviews, GBP optimization | AVAILABLE (per-client OAuth) |
| PageSpeed Insights | API | Core Web Vitals, page speed metrics | AVAILABLE (via Serper/Google API) |
| SERP API | API | Search result analysis | AVAILABLE (via Serper) |
| WordPress | CMS Integration | Content publishing | CONFIGURED (credentials form, not yet automated) |
| Cal.com | External Link | Demo booking (cal.com/alegius/tenkai-demo) | EXTERNAL |
| Vercel | Hosting | Next.js deployment | ACTIVE |

---

## 9. KNOWN ISSUES SUMMARY (from Pre-Flight)

| ID | Severity | Issue | Customer Impact |
|----|----------|-------|-----------------|
| M1/M2 | **P0** | `content_type` column doesn't exist in content_posts — dashboard queries it | Activity feed type labels blank |
| AUTH-HOOK | **P0** | Supabase auth hook may not be enabled — admin RLS bypass broken | Admin can't see all client data |
| RATE-LIMIT | **P0** | Supabase free tier limits signup emails to 3/hour | Users can't sign up during testing/launch spikes |
| HERO-CTA | **P1** | Hero CTA goes to /onboarding, not /auth/signup — user may not have account yet | Onboarding fails for unauthenticated users |
| M3 | **P1** | client_integrations table has no migration file | Fresh deploy from migrations fails |
| M7 | **P1** | Code checks status 'pending_review' which doesn't exist in CHECK constraint | Dead code, no functional impact |
| STRIPE-DUP | **P1** | Checkout doesn't reuse stripe_customer_id | Duplicate Stripe customers |
| AGENT-MISMATCH | **P2** | Landing page shows 6 agents (incl. "Aiko"), backend has 9 (Aiko → Yumi) | Brand inconsistency |
| AUDIT-SPEED | **P2** | "How It Works" claims "60 seconds" for audit but it's queued (worker poll interval 10s + Gemini call time) | May take 1-3 minutes, not 60 seconds |
| PROMISES | **P2** | Post-onboarding promises (48hr keywords, 1-week content) require manual admin triggering | Unfulfilled promises if admin doesn't act |

---

## 10. VERIFICATION CHECKLIST FOR /beta-test

The following promises and claims must be verified during testing:

- [ ] Hero CTA "Analyze My Site" takes user to a functional path that ends with an audit
- [ ] "No credit card required" — can complete onboarding and get audit without paying
- [ ] "Setup in under 5 minutes" — onboarding can be completed in < 5 minutes
- [ ] All 3 pricing tiers create valid Stripe checkout sessions
- [ ] Stripe webhook correctly updates client tier on checkout.session.completed
- [ ] Demo mode works on ALL portal pages (dashboard, content, health, reports, links, local, integrations, settings)
- [ ] Each of the 27 service types can be submitted via API and is accepted
- [ ] Queue worker processes a request and creates a deliverable
- [ ] Content article deliverables also create content_posts for approval workflow
- [ ] Onboarding completion auto-creates a site_audit service request
- [ ] Dashboard shows real data (stats, approvals, activity, deliverables)
- [ ] Content page shows topics, drafts, and published posts correctly
- [ ] Health page shows audit score and issues
- [ ] Billing portal opens Stripe Customer Portal
- [ ] Notification preferences save and load correctly
- [ ] Settings profile tab saves business information
- [ ] Integrations page shows OAuth connector status
- [ ] Admin pages are inaccessible to non-admin users
- [ ] All footer links resolve (Privacy, Terms, Contact, etc.)
- [ ] Mobile responsive — sidebar collapses, forms are usable
- [ ] 14-day money-back guarantee is stated (but enforcement is manual)
- [ ] "Month-to-month, cancel anytime" — Stripe portal allows cancellation
