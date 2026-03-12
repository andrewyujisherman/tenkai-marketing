-- ============================================================
-- Tenkai Marketing — Schema Gap Fixes
-- Migration: 003_schema_gaps.sql
-- Already applied to production via Management API
-- ============================================================

-- Add missing columns to approvals (dashboard page queries these)
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS agent_name TEXT;
ALTER TABLE public.approvals ADD COLUMN IF NOT EXISTS description TEXT;

-- Add notification preferences to clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"content_ready": true, "weekly_report": true, "strategy_updates": true, "billing_alerts": true}'::jsonb;

-- Create audit_results as a VIEW over audits (admin dashboard queries it)
CREATE OR REPLACE VIEW public.audit_results AS
SELECT id, client_id, url, overall_score, technical_score, content_score, authority_score,
       issues, recommendations, status, created_at
FROM public.audits;

GRANT SELECT ON public.audit_results TO authenticated;
GRANT SELECT ON public.audit_results TO anon;
