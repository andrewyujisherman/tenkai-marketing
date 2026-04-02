CREATE TABLE IF NOT EXISTS public.backlink_cache (
  cache_key   TEXT PRIMARY KEY,
  payload     JSONB NOT NULL,
  fetched_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_backlink_cache_fetched ON public.backlink_cache(fetched_at);
