-- ============================================================
-- Tenkai Marketing — Combined Migration
-- Migrations 001–005 + analytics_audit request_type patch
-- Safe to run on a fresh Supabase project in one shot.
-- All DDL uses IF NOT EXISTS / OR REPLACE / ON CONFLICT where
-- possible for idempotency.
-- ============================================================


-- ============================================================
-- SECTION 1: 20260311000001_initial_schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- clients
CREATE TABLE IF NOT EXISTS public.clients (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                   TEXT UNIQUE NOT NULL,
    name                    TEXT,
    company_name            TEXT,
    website_url             TEXT,
    tier                    TEXT CHECK (tier IN ('starter', 'growth', 'pro')),
    stripe_customer_id      TEXT,
    stripe_subscription_id  TEXT,
    status                  TEXT DEFAULT 'active',
    onboarding_data         JSONB,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- audits
CREATE TABLE IF NOT EXISTS public.audits (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id        UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    url              TEXT NOT NULL,
    overall_score    INTEGER,
    technical_score  INTEGER,
    content_score    INTEGER,
    authority_score  INTEGER,
    issues           JSONB,
    recommendations  JSONB,
    status           TEXT DEFAULT 'pending',
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- content_posts
CREATE TABLE IF NOT EXISTS public.content_posts (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id            UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title                TEXT NOT NULL,
    content              TEXT,
    status               TEXT CHECK (status IN ('draft', 'pending_approval', 'approved', 'published', 'rejected')),
    topic                TEXT,
    keywords             TEXT[],
    agent_author         TEXT,
    seo_score            INTEGER,
    ai_detection_score   FLOAT,
    client_feedback      TEXT,
    published_url        TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- approvals
CREATE TABLE IF NOT EXISTS public.approvals (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id        UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    content_post_id  UUID REFERENCES public.content_posts(id) ON DELETE CASCADE,
    type             TEXT CHECK (type IN ('content', 'strategy', 'audit')),
    status           TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewer_notes   TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    resolved_at      TIMESTAMPTZ
);

-- reports
CREATE TABLE IF NOT EXISTS public.reports (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id        UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    type             TEXT CHECK (type IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
    period_start     DATE,
    period_end       DATE,
    metrics          JSONB,
    insights         JSONB,
    agent_commentary JSONB,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audits_client_id        ON public.audits(client_id);
CREATE INDEX IF NOT EXISTS idx_content_posts_client_id ON public.content_posts(client_id);
CREATE INDEX IF NOT EXISTS idx_approvals_client_id     ON public.approvals(client_id);
CREATE INDEX IF NOT EXISTS idx_reports_client_id       ON public.reports(client_id);
CREATE INDEX IF NOT EXISTS idx_audits_status           ON public.audits(status);
CREATE INDEX IF NOT EXISTS idx_content_posts_status    ON public.content_posts(status);
CREATE INDEX IF NOT EXISTS idx_approvals_status        ON public.approvals(status);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_clients_updated_at'
  ) THEN
    CREATE TRIGGER trg_clients_updated_at
      BEFORE UPDATE ON public.clients
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_content_posts_updated_at'
  ) THEN
    CREATE TRIGGER trg_content_posts_updated_at
      BEFORE UPDATE ON public.content_posts
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- RLS
ALTER TABLE public.clients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports       ENABLE ROW LEVEL SECURITY;

-- clients policies (initial — overwritten by migration 002)
DROP POLICY IF EXISTS "clients: select own" ON public.clients;
CREATE POLICY "clients: select own"
    ON public.clients FOR SELECT
    TO authenticated
    USING (email = auth.email());

DROP POLICY IF EXISTS "clients: update own" ON public.clients;
CREATE POLICY "clients: update own"
    ON public.clients FOR UPDATE
    TO authenticated
    USING (email = auth.email())
    WITH CHECK (email = auth.email());

-- audits policies (initial — overwritten by migration 002)
DROP POLICY IF EXISTS "audits: anon insert" ON public.audits;
CREATE POLICY "audits: anon insert"
    ON public.audits FOR INSERT
    TO anon
    WITH CHECK (client_id IS NULL);

DROP POLICY IF EXISTS "audits: authenticated insert" ON public.audits;
CREATE POLICY "audits: authenticated insert"
    ON public.audits FOR INSERT
    TO authenticated
    WITH CHECK (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

DROP POLICY IF EXISTS "audits: select own" ON public.audits;
CREATE POLICY "audits: select own"
    ON public.audits FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

-- content_posts policies (initial — overwritten by migration 002)
DROP POLICY IF EXISTS "content_posts: select own" ON public.content_posts;
CREATE POLICY "content_posts: select own"
    ON public.content_posts FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

DROP POLICY IF EXISTS "content_posts: insert own" ON public.content_posts;
CREATE POLICY "content_posts: insert own"
    ON public.content_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

DROP POLICY IF EXISTS "content_posts: update own" ON public.content_posts;
CREATE POLICY "content_posts: update own"
    ON public.content_posts FOR UPDATE
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

-- approvals policies (initial — overwritten by migration 002)
DROP POLICY IF EXISTS "approvals: select own" ON public.approvals;
CREATE POLICY "approvals: select own"
    ON public.approvals FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

DROP POLICY IF EXISTS "approvals: update own" ON public.approvals;
CREATE POLICY "approvals: update own"
    ON public.approvals FOR UPDATE
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

-- reports policies (initial — overwritten by migration 002)
DROP POLICY IF EXISTS "reports: select own" ON public.reports;
CREATE POLICY "reports: select own"
    ON public.reports FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );


-- ============================================================
-- SECTION 2: 20260311000002_auth_improvements.sql
-- ============================================================

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_clients_auth_user_id ON public.clients(auth_user_id);

-- Backfill auth_user_id for existing rows
UPDATE public.clients c
SET auth_user_id = u.id
FROM auth.users u
WHERE c.email = u.email AND c.auth_user_id IS NULL;

-- ---- clients ----
DROP POLICY IF EXISTS "clients: select own" ON public.clients;
DROP POLICY IF EXISTS "clients: update own" ON public.clients;
DROP POLICY IF EXISTS "clients: select own or admin" ON public.clients;
DROP POLICY IF EXISTS "clients: admin all" ON public.clients;

CREATE POLICY "clients: select own or admin" ON public.clients
  FOR SELECT TO authenticated
  USING (
    auth_user_id = (SELECT auth.uid())
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

CREATE POLICY "clients: update own" ON public.clients
  FOR UPDATE TO authenticated
  USING (auth_user_id = (SELECT auth.uid()))
  WITH CHECK (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "clients: admin all" ON public.clients
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt()->'app_metadata'->>'role') = 'admin');

-- ---- audits ----
DROP POLICY IF EXISTS "audits: authenticated insert" ON public.audits;
DROP POLICY IF EXISTS "audits: select own" ON public.audits;
DROP POLICY IF EXISTS "audits: select own or admin" ON public.audits;

CREATE POLICY "audits: authenticated insert" ON public.audits
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

CREATE POLICY "audits: select own or admin" ON public.audits
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- ---- content_posts ----
DROP POLICY IF EXISTS "content_posts: select own" ON public.content_posts;
DROP POLICY IF EXISTS "content_posts: insert own" ON public.content_posts;
DROP POLICY IF EXISTS "content_posts: update own" ON public.content_posts;
DROP POLICY IF EXISTS "content_posts: select own or admin" ON public.content_posts;
DROP POLICY IF EXISTS "content_posts: insert own or admin" ON public.content_posts;
DROP POLICY IF EXISTS "content_posts: update own or admin" ON public.content_posts;

CREATE POLICY "content_posts: select own or admin" ON public.content_posts
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

CREATE POLICY "content_posts: insert own or admin" ON public.content_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

CREATE POLICY "content_posts: update own or admin" ON public.content_posts
  FOR UPDATE TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- ---- approvals ----
DROP POLICY IF EXISTS "approvals: select own" ON public.approvals;
DROP POLICY IF EXISTS "approvals: update own" ON public.approvals;
DROP POLICY IF EXISTS "approvals: select own or admin" ON public.approvals;
DROP POLICY IF EXISTS "approvals: update own or admin" ON public.approvals;

CREATE POLICY "approvals: select own or admin" ON public.approvals
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

CREATE POLICY "approvals: update own or admin" ON public.approvals
  FOR UPDATE TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- ---- reports ----
DROP POLICY IF EXISTS "reports: select own" ON public.reports;
DROP POLICY IF EXISTS "reports: select own or admin" ON public.reports;

CREATE POLICY "reports: select own or admin" ON public.reports
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- Custom access token hook (inject user_role into JWT)
-- NOTE: Must be enabled manually in Supabase Dashboard > Auth > Hooks
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  claims := event->'claims';
  user_role := coalesce(claims->'app_metadata'->>'role', 'client');
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;


-- ============================================================
-- SECTION 3: 20260311000003_schema_gaps.sql
-- ============================================================

ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS agent_name TEXT;
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notification_preferences JSONB
  DEFAULT '{"content_ready": true, "weekly_report": true, "strategy_updates": true, "billing_alerts": true}'::jsonb;

CREATE OR REPLACE VIEW public.audit_results AS
SELECT id, client_id, url, overall_score, technical_score, content_score, authority_score,
       issues, recommendations, status, created_at
FROM public.audits;

GRANT SELECT ON public.audit_results TO authenticated;
GRANT SELECT ON public.audit_results TO anon;


-- ============================================================
-- SECTION 4: 20260311000004_demo_data.sql
-- ============================================================

INSERT INTO public.clients (
  id, email, name, company_name, website_url, tier, status, onboarding_data, created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'sarah@premierplumbing.com',
  'Sarah Chen',
  'Premier Plumbing Co.',
  'https://premierplumbing.com',
  'pro',
  'demo',
  '{"industry": "Home Services / Plumbing"}'::jsonb,
  NOW() - INTERVAL '90 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.content_posts (id, client_id, title, content, status, topic, keywords, agent_author, seo_score, ai_detection_score, published_url, created_at) VALUES

('00000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
 '7 Signs You Need to Replace Your Water Heater Before It Fails',
 'Most homeowners wait until their water heater completely fails before calling a plumber. Here are the seven warning signs every homeowner should know...',
 'published', 'Water Heaters', ARRAY['water heater replacement', 'plumbing maintenance', 'water heater signs'],
 'Sakura', 92, 10.3, 'https://premierplumbing.com/blog/water-heater-replacement-signs',
 NOW() - INTERVAL '60 days'),

('00000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
 'Emergency Plumbing: What to Do Before the Plumber Arrives',
 'A burst pipe or major leak can cause thousands in water damage within minutes. Knowing these emergency steps can save your home and your wallet...',
 'published', 'Emergency Services', ARRAY['emergency plumber', 'burst pipe', 'water damage prevention'],
 'Sakura', 89, 9.1, 'https://premierplumbing.com/blog/emergency-plumbing-guide',
 NOW() - INTERVAL '45 days'),

('00000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
 'The Complete Guide to Drain Cleaning: DIY vs Professional',
 'Clogged drains are the most common plumbing issue homeowners face. Here is when to grab the plunger yourself and when to call a professional...',
 'approved', 'Drain Services', ARRAY['drain cleaning', 'clogged drain', 'professional plumber'],
 'Sakura', 85, 13.7, NULL,
 NOW() - INTERVAL '30 days'),

('00000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
 'Tankless vs Traditional Water Heaters: Which Saves You More?',
 'The tankless water heater market has exploded, but is it really worth the higher upfront cost? We break down the numbers for homeowners...',
 'approved', 'Water Heaters', ARRAY['tankless water heater', 'water heater comparison', 'energy savings'],
 'Sakura', 81, 11.4, NULL,
 NOW() - INTERVAL '20 days'),

('00000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
 'How to Prepare Your Pipes for Winter: A Homeowner''s Checklist',
 'Frozen pipes cause over $1 billion in damage across the US every winter. This checklist will protect your home from costly burst pipes...',
 'pending_approval', 'Seasonal Tips', ARRAY['frozen pipes', 'winter plumbing', 'pipe insulation'],
 'Sakura', 87, 8.9, NULL,
 NOW() - INTERVAL '10 days'),

('00000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
 '5 Bathroom Renovation Plumbing Mistakes That Cost Thousands',
 'Planning a bathroom remodel? These five plumbing mistakes are shockingly common — and expensive. Here is how to avoid them...',
 'pending_approval', 'Renovations', ARRAY['bathroom renovation', 'plumbing mistakes', 'remodel plumbing'],
 'Sakura', 78, 12.6, NULL,
 NOW() - INTERVAL '7 days'),

('00000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001',
 'Why Your Water Bill Keeps Going Up (And How to Fix It)',
 'An unexpectedly high water bill usually means a hidden leak. Here is how to find it and what a professional plumber will check...',
 'draft', 'Water Conservation', ARRAY['high water bill', 'hidden leak', 'water conservation'],
 'Sakura', NULL, NULL, NULL,
 NOW() - INTERVAL '3 days'),

('00000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001',
 'Sump Pump Maintenance: The 15-Minute Check That Prevents Flooding',
 'Most homeowners forget about their sump pump until their basement floods. This quick quarterly check takes 15 minutes and can save you thousands...',
 'draft', 'Maintenance', ARRAY['sump pump', 'basement flooding', 'plumbing maintenance'],
 'Sakura', NULL, NULL, NULL,
 NOW() - INTERVAL '1 day'),

('00000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001',
 'Hard Water Solutions: Water Softeners, Filters, and What Actually Works',
 'Hard water damages fixtures, appliances, and even your skin. Here are the real solutions — from whole-house softeners to point-of-use filters...',
 'draft', 'Water Quality', ARRAY['hard water', 'water softener', 'water filtration'],
 'Sakura', NULL, NULL, NULL,
 NOW()),

('00000001-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001',
 'How Premier Plumbing Reduced Emergency Calls by 40% with Preventive Maintenance Plans',
 'Our new preventive maintenance program has transformed how our customers think about plumbing. Here are the results after six months...',
 'draft', 'Case Study', ARRAY['preventive maintenance', 'plumbing plan', 'customer retention'],
 'Sakura', NULL, NULL, NULL,
 NOW() - INTERVAL '2 hours')

ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audits (id, client_id, url, overall_score, technical_score, content_score, authority_score, issues, recommendations, status, created_at) VALUES (
  '00000002-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'https://premierplumbing.com',
  74, 81, 72, 69,
  '[
    {"severity": "critical", "title": "Missing meta descriptions on 14 pages", "description": "14 pages are missing meta descriptions, which reduces click-through rates from search results.", "agent": "Kenji", "affected_count": 14},
    {"severity": "critical", "title": "3 broken internal links detected", "description": "Internal links pointing to 404 pages create a poor user experience and waste crawl budget.", "agent": "Kenji", "affected_count": 3},
    {"severity": "warning", "title": "Images missing alt text", "description": "22 images lack descriptive alt text, hurting both accessibility and image search visibility.", "agent": "Kenji", "affected_count": 22},
    {"severity": "warning", "title": "Page load speed below 2.5s threshold", "description": "Average page load time is 3.8 seconds. Google recommends under 2.5s for good Core Web Vitals.", "agent": "Kenji"},
    {"severity": "warning", "title": "Low domain authority (DA 31)", "description": "Domain authority is below the competitive threshold for your target keywords. Link building campaign recommended.", "agent": "Kenji"},
    {"severity": "passed", "title": "SSL certificate valid", "description": "HTTPS is properly configured with a valid certificate.", "agent": "Kenji"},
    {"severity": "passed", "title": "XML sitemap present and valid", "description": "Sitemap is accessible and contains 47 URLs.", "agent": "Kenji"},
    {"severity": "passed", "title": "Mobile-friendly design", "description": "Site passes Google Mobile-Friendly Test with no issues.", "agent": "Kenji"},
    {"severity": "passed", "title": "Robots.txt configured correctly", "description": "No critical pages are being blocked by robots.txt.", "agent": "Kenji"}
  ]'::jsonb,
  '[
    {"priority": "high", "title": "Fix broken internal links", "description": "Update or remove the 3 broken internal links immediately to restore crawl flow.", "agent": "Kenji"},
    {"priority": "high", "title": "Add meta descriptions to priority pages", "description": "Focus on top 5 trafficked pages first. Target 150-160 characters with primary keyword inclusion.", "agent": "Sakura"},
    {"priority": "medium", "title": "Image optimization sprint", "description": "Add descriptive alt text to all 22 flagged images. Compress images to reduce load time.", "agent": "Kenji"},
    {"priority": "medium", "title": "Launch targeted link-building campaign", "description": "Secure 5-8 high-quality backlinks from industry publications to raise DA above 40.", "agent": "Kenji"}
  ]'::jsonb,
  'complete',
  NOW() - INTERVAL '14 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reports (id, client_id, type, period_start, period_end, metrics, insights, agent_commentary, created_at) VALUES

('00000003-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000001',
 'monthly',
 (NOW() - INTERVAL '60 days')::date,
 (NOW() - INTERVAL '31 days')::date,
 '{"organic_traffic": 3420, "organic_traffic_change": 18.5, "keywords_ranked": 127, "keywords_top_10": 23, "avg_position": 14.2, "impressions": 48300, "clicks": 1840, "ctr": 3.8}'::jsonb,
 '["Organic traffic grew 18.5% month-over-month, driven by two newly published articles entering top-10 positions.", "The SEO audit fixes from last month contributed to a 0.6 point improvement in average position.", "High-volume keyword ''local seo services'' moved from position 18 to position 9."]'::jsonb,
 '{"recommendations": ["Publish 2 more pillar content pieces targeting your highest-volume keyword clusters.", "The link-building campaign is showing early results — continue outreach to 3 more domains."], "agent": "Kenji"}'::jsonb,
 NOW() - INTERVAL '31 days'),

('00000003-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000001',
 'monthly',
 (NOW() - INTERVAL '30 days')::date,
 NOW()::date,
 '{"organic_traffic": 4105, "organic_traffic_change": 20.0, "keywords_ranked": 143, "keywords_top_10": 31, "avg_position": 12.8, "impressions": 57200, "clicks": 2290, "ctr": 4.0}'::jsonb,
 '["Organic traffic hit 4,105 sessions — a 20% increase and the highest month on record.", "8 new keywords entered the top 10, bringing the total to 31 tracked keywords ranking in position 1-10.", "CTR improved from 3.8% to 4.0% following meta description optimizations.", "The two published pillar articles are already generating backlinks organically."]'::jsonb,
 '{"recommendations": ["Expand the content cluster around ''technical seo'' — 3 supporting articles would significantly strengthen topical authority.", "Consider targeting featured snippets for the 12 keywords currently ranking positions 4-8."], "agent": "Kenji"}'::jsonb,
 NOW() - INTERVAL '1 day'),

('00000003-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000001',
 'quarterly',
 (NOW() - INTERVAL '90 days')::date,
 NOW()::date,
 '{"organic_traffic": 11840, "organic_traffic_change": 34.2, "keywords_ranked": 143, "keywords_top_10": 31, "avg_position": 12.8, "impressions": 164000, "clicks": 6520, "ctr": 3.97, "new_backlinks": 18, "domain_authority": 34}'::jsonb,
 '["Q1 2026 delivered 34% organic growth quarter-over-quarter — ahead of the 25% target.", "Domain authority increased from 28 to 34 following the link-building campaign.", "Top performing content: ''10 SEO Strategies That Actually Work in 2026'' generated 1,240 organic sessions.", "Technical SEO fixes (broken links, meta descriptions) contributed measurably to improved crawl efficiency."]'::jsonb,
 '{"recommendations": ["Q2 priority: deepen topical authority in core content clusters before expanding to new topics.", "DA 40+ target is achievable by end of Q2 with continued link acquisition pace.", "Recommend A/B testing title tag formats to further improve CTR on position 5-15 keywords."], "agent": "Kenji"}'::jsonb,
 NOW() - INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;

INSERT INTO public.approvals (id, client_id, content_post_id, title, type, agent_name, description, status, created_at) VALUES

('00000004-0000-0000-0000-000000000001',
 '00000000-0000-0000-0000-000000000001',
 '00000001-0000-0000-0000-000000000005',
 'How to Prepare Your Pipes for Winter: A Homeowner''s Checklist',
 'content', 'Sakura',
 'Seasonal plumbing article ready for review. Covers pipe insulation, thermostat settings, and outdoor faucet prep. 1,800 words, SEO score 87/100.',
 'pending',
 NOW() - INTERVAL '10 days'),

('00000004-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000001',
 '00000001-0000-0000-0000-000000000006',
 '5 Bathroom Renovation Plumbing Mistakes That Cost Thousands',
 'content', 'Sakura',
 'Renovation plumbing article ready for review. Covers common remodel mistakes with cost estimates and prevention tips. 2,100 words.',
 'pending',
 NOW() - INTERVAL '7 days'),

('00000004-0000-0000-0000-000000000003',
 '00000000-0000-0000-0000-000000000001',
 '00000001-0000-0000-0000-000000000003',
 'Drain Cleaning Guide — Publish to WordPress',
 'content', 'Kenji',
 'The drain cleaning guide has been approved and is ready to publish. High search volume keyword. Recommend scheduling for Tuesday 9am ET.',
 'approved',
 NOW() - INTERVAL '25 days'),

('00000004-0000-0000-0000-000000000004',
 '00000000-0000-0000-0000-000000000001',
 NULL,
 'Q2 Content Strategy: Seasonal Plumbing Campaigns',
 'strategy', 'Kenji',
 'Q2 content calendar targeting summer plumbing topics: sprinkler systems, sewer line maintenance, outdoor plumbing. 10 planned articles across 3 clusters.',
 'approved',
 NOW() - INTERVAL '35 days')

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION 5: 20260311000005_service_queue.sql
-- ============================================================

-- service_requests
-- NOTE: request_type check constraint is defined inline here with analytics_audit
-- already included (see Section 6 patch below for the ALTER if table already exists).
CREATE TABLE IF NOT EXISTS public.service_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    request_type    TEXT NOT NULL CHECK (request_type IN (
                      'site_audit', 'content_brief', 'keyword_research',
                      'technical_audit', 'link_analysis', 'social_strategy',
                      'analytics_audit'
                    )),
    target_url      TEXT,
    parameters      JSONB DEFAULT '{}'::jsonb,
    status          TEXT DEFAULT 'queued' CHECK (status IN (
                      'queued', 'processing', 'completed', 'failed', 'review'
                    )),
    assigned_agent  TEXT CHECK (assigned_agent IN (
                      'haruki', 'sakura', 'kenji', 'yumi', 'takeshi', 'aiko'
                    )),
    priority        INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    attempts        INTEGER DEFAULT 0,
    max_attempts    INTEGER DEFAULT 3,
    error_message   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ
);

-- deliverables
CREATE TABLE IF NOT EXISTS public.deliverables (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id        UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
    client_id         UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    agent_name        TEXT NOT NULL CHECK (agent_name IN (
                        'haruki', 'sakura', 'kenji', 'yumi', 'takeshi', 'aiko'
                      )),
    deliverable_type  TEXT NOT NULL CHECK (deliverable_type IN (
                        'audit_report', 'content_draft', 'keyword_list',
                        'technical_report', 'link_report', 'social_plan'
                      )),
    title             TEXT NOT NULL,
    content           JSONB NOT NULL,
    summary           TEXT,
    score             INTEGER CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
    status            TEXT DEFAULT 'draft' CHECK (status IN (
                        'draft', 'review', 'approved', 'rejected'
                      )),
    client_feedback   TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON public.service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status    ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_queue     ON public.service_requests(status, priority DESC, created_at ASC)
  WHERE status = 'queued';

CREATE INDEX IF NOT EXISTS idx_deliverables_client_id  ON public.deliverables(client_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_request_id ON public.deliverables(request_id);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_deliverables_updated_at'
  ) THEN
    CREATE TRIGGER trg_deliverables_updated_at
      BEFORE UPDATE ON public.deliverables
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_requests: select own or admin" ON public.service_requests;
CREATE POLICY "service_requests: select own or admin" ON public.service_requests
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

DROP POLICY IF EXISTS "service_requests: insert own or admin" ON public.service_requests;
CREATE POLICY "service_requests: insert own or admin" ON public.service_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

DROP POLICY IF EXISTS "service_requests: update own or admin" ON public.service_requests;
CREATE POLICY "service_requests: update own or admin" ON public.service_requests
  FOR UPDATE TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

DROP POLICY IF EXISTS "deliverables: select own or admin" ON public.deliverables;
CREATE POLICY "deliverables: select own or admin" ON public.deliverables
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

DROP POLICY IF EXISTS "deliverables: insert admin only" ON public.deliverables;
CREATE POLICY "deliverables: insert admin only" ON public.deliverables
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

DROP POLICY IF EXISTS "deliverables: update own feedback or admin" ON public.deliverables;
CREATE POLICY "deliverables: update own feedback or admin" ON public.deliverables
  FOR UPDATE TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- Service role bypass for the queue worker uses service_role key — no extra policies needed.


-- ============================================================
-- SECTION 6: analytics_audit — request_type constraint patch
-- ============================================================
-- The service_requests.request_type column uses a plain CHECK constraint
-- (not an enum). PostgreSQL does not support ALTER CHECK constraints
-- in-place — we must drop the old one and add a new one.
--
-- If the table was freshly created above (CREATE TABLE IF NOT EXISTS),
-- the constraint already includes 'analytics_audit' and this block is a
-- no-op (dropping a non-existent constraint with IF EXISTS is safe).
--
-- If the table already existed from a prior migration run (the original
-- 005 without analytics_audit), this block drops the old constraint and
-- adds the new one that includes 'analytics_audit'.
-- ============================================================

-- Identify and drop the existing request_type check constraint by name.
-- Supabase names inline CHECK constraints as <table>_<column>_check.
ALTER TABLE public.service_requests
  DROP CONSTRAINT IF EXISTS service_requests_request_type_check;

-- Re-add with analytics_audit included.
ALTER TABLE public.service_requests
  ADD CONSTRAINT service_requests_request_type_check
  CHECK (request_type IN (
    'site_audit', 'content_brief', 'keyword_research',
    'technical_audit', 'link_analysis', 'social_strategy',
    'analytics_audit'
  ));

-- No ENUM types are used for request_type in any migration —
-- all constraints are plain CHECK constraints, so no ALTER TYPE needed.
