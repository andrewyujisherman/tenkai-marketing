-- ============================================================
-- Tenkai Marketing — Auth Improvements
-- Migration: 002_auth_improvements.sql
-- ============================================================

-- Add auth_user_id to clients (links to auth.users)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_clients_auth_user_id ON public.clients(auth_user_id);

-- Update existing rows (match by email)
UPDATE public.clients c
SET auth_user_id = u.id
FROM auth.users u
WHERE c.email = u.email AND c.auth_user_id IS NULL;

-- ============================================================
-- UPDATED RLS POLICIES — use auth_user_id + admin role bypass
-- ============================================================

-- ---- clients ----
DROP POLICY IF EXISTS "clients: select own" ON public.clients;
DROP POLICY IF EXISTS "clients: update own" ON public.clients;

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

CREATE POLICY "reports: select own or admin" ON public.reports
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE auth_user_id = (SELECT auth.uid())
    )
    OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
  );

-- ============================================================
-- CUSTOM ACCESS TOKEN HOOK
-- Injects user_role claim into JWT from app_metadata
-- IMPORTANT: Must be enabled manually in Supabase Dashboard > Auth > Hooks
-- ============================================================

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
