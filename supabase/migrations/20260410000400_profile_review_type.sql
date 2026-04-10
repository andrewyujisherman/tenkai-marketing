-- Add 'profile_review' to approvals type constraint
-- Fires after all 3 onboarding services complete to let client confirm business understanding
ALTER TABLE approvals DROP CONSTRAINT IF EXISTS approvals_type_check;
ALTER TABLE approvals ADD CONSTRAINT approvals_type_check
  CHECK (type IN ('content', 'strategy', 'audit', 'strategy_review', 'report_review', 'profile_review'));
