-- ============================================================
-- Tenkai Marketing — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- clients
CREATE TABLE public.clients (
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
CREATE TABLE public.audits (
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
CREATE TABLE public.content_posts (
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
CREATE TABLE public.approvals (
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
CREATE TABLE public.reports (
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

-- ============================================================
-- INDEXES
-- ============================================================

-- client_id indexes on all child tables
CREATE INDEX idx_audits_client_id        ON public.audits(client_id);
CREATE INDEX idx_content_posts_client_id ON public.content_posts(client_id);
CREATE INDEX idx_approvals_client_id     ON public.approvals(client_id);
CREATE INDEX idx_reports_client_id       ON public.reports(client_id);

-- status indexes
CREATE INDEX idx_audits_status           ON public.audits(status);
CREATE INDEX idx_content_posts_status    ON public.content_posts(status);
CREATE INDEX idx_approvals_status        ON public.approvals(status);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_content_posts_updated_at
    BEFORE UPDATE ON public.content_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.clients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports       ENABLE ROW LEVEL SECURITY;

-- ---- clients ----
-- Authenticated users can only see/modify their own client row
-- (matched by email from Supabase auth)
CREATE POLICY "clients: select own"
    ON public.clients FOR SELECT
    TO authenticated
    USING (email = auth.email());

CREATE POLICY "clients: update own"
    ON public.clients FOR UPDATE
    TO authenticated
    USING (email = auth.email())
    WITH CHECK (email = auth.email());

-- ---- audits ----
-- Unauthenticated INSERT allowed (free audit form)
CREATE POLICY "audits: anon insert"
    ON public.audits FOR INSERT
    TO anon
    WITH CHECK (client_id IS NULL);  -- unauthenticated submits have no client_id

-- Authenticated clients can insert with their own client_id
CREATE POLICY "audits: authenticated insert"
    ON public.audits FOR INSERT
    TO authenticated
    WITH CHECK (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

-- Authenticated clients can only read their own audits
CREATE POLICY "audits: select own"
    ON public.audits FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

-- ---- content_posts ----
CREATE POLICY "content_posts: select own"
    ON public.content_posts FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

CREATE POLICY "content_posts: insert own"
    ON public.content_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

CREATE POLICY "content_posts: update own"
    ON public.content_posts FOR UPDATE
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

-- ---- approvals ----
CREATE POLICY "approvals: select own"
    ON public.approvals FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

CREATE POLICY "approvals: update own"
    ON public.approvals FOR UPDATE
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );

-- ---- reports ----
CREATE POLICY "reports: select own"
    ON public.reports FOR SELECT
    TO authenticated
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE email = auth.email()
        )
    );
