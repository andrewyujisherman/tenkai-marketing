-- Monthly metrics snapshots for progress-over-time tracking
CREATE TABLE IF NOT EXISTS client_metrics_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  metrics jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, snapshot_date)
);

-- metrics jsonb shape:
-- {
--   organic_traffic: number | null,
--   keyword_count_page1: number | null,
--   keyword_count_top10: number | null,
--   health_score: number | null,
--   backlink_count: number | null,
--   content_pieces_published: number,
--   domain_authority_estimate: number | null
-- }

CREATE INDEX IF NOT EXISTS idx_client_metrics_history_client_id ON client_metrics_history (client_id, snapshot_date DESC);
