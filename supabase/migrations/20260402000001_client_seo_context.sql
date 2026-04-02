-- Cross-service SEO memory layer
-- Written to by service-chain.ts writeBackClientContext()
-- Read by process-service-request.ts fetchClientSeoContext()

CREATE TABLE IF NOT EXISTS public.client_seo_context (
  client_id        UUID PRIMARY KEY REFERENCES public.clients(id) ON DELETE CASCADE,
  top_keywords     JSONB DEFAULT '[]',
  audit_findings   JSONB DEFAULT '[]',
  content_gaps     JSONB DEFAULT '[]',
  competitors      JSONB DEFAULT '[]',
  business_context JSONB DEFAULT '{}',
  cwv_status       JSONB DEFAULT '{}',
  last_audit_score INTEGER,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_seo_context ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by server-side code)
CREATE POLICY "service_role_full_access" ON public.client_seo_context
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Clients can read their own context
CREATE POLICY "clients_read_own" ON public.client_seo_context
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());
