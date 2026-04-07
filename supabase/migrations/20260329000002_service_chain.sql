-- ============================================================
-- Tenkai Marketing — Service Chain Support
-- Adds triggered_by provenance + timeout status + index
-- ============================================================

-- Add triggered_by to track auto-chain provenance
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS triggered_by UUID REFERENCES public.service_requests(id) ON DELETE SET NULL;

-- Expand status constraint to include 'timeout'
ALTER TABLE public.service_requests DROP CONSTRAINT IF EXISTS service_requests_status_check;
ALTER TABLE public.service_requests ADD CONSTRAINT service_requests_status_check
  CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'review', 'timeout'));

-- Index for chain lookups
CREATE INDEX IF NOT EXISTS idx_service_requests_triggered_by
  ON public.service_requests(triggered_by)
  WHERE triggered_by IS NOT NULL;

-- Ensure client_seo_context has unique constraint on client_id for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'client_seo_context_client_id_key'
  ) THEN
    ALTER TABLE public.client_seo_context
      ADD CONSTRAINT client_seo_context_client_id_key UNIQUE (client_id);
  END IF;
END $$;
