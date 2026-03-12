-- ============================================================
-- Tenkai Marketing — Service Request Queue & Deliverables
-- Migration: 005_service_queue.sql
-- Adds the queue-driven agent processing system
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- Service requests queue
CREATE TABLE public.service_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    request_type    TEXT NOT NULL CHECK (request_type IN (
                      'site_audit', 'content_brief', 'keyword_research',
                      'technical_audit', 'link_analysis', 'social_strategy'
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

-- Deliverables (results from agent processing)
CREATE TABLE public.deliverables (
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

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_service_requests_client_id ON public.service_requests(client_id);
CREATE INDEX idx_service_requests_status ON public.service_requests(status);
CREATE INDEX idx_service_requests_queue ON public.service_requests(status, priority DESC, created_at ASC)
  WHERE status = 'queued';

CREATE INDEX idx_deliverables_client_id ON public.deliverables(client_id);
CREATE INDEX idx_deliverables_request_id ON public.deliverables(request_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER trg_deliverables_updated_at
    BEFORE UPDATE ON public.deliverables
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- service_requests: clients see their own, admins see all
CREATE POLICY "service_requests: select own or admin" ON public.service_requests
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

CREATE POLICY "service_requests: insert own or admin" ON public.service_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

CREATE POLICY "service_requests: update own or admin" ON public.service_requests
  FOR UPDATE TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- deliverables: clients see their own, admins see all
CREATE POLICY "deliverables: select own or admin" ON public.deliverables
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

CREATE POLICY "deliverables: insert admin only" ON public.deliverables
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

CREATE POLICY "deliverables: update own feedback or admin" ON public.deliverables
  FOR UPDATE TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- Service role bypass for the queue worker (uses service_role key)
-- The supabaseAdmin client already bypasses RLS, so no additional
-- policies are needed for the worker.
