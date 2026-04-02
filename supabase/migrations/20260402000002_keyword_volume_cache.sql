CREATE TABLE IF NOT EXISTS public.keyword_volume_cache (
  keyword        TEXT PRIMARY KEY,
  volume         INTEGER,
  competition    TEXT,
  low_bid_cents  INTEGER,
  high_bid_cents INTEGER,
  fetched_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kvc_fetched ON public.keyword_volume_cache(fetched_at);
