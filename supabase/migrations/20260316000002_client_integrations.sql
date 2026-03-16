CREATE TABLE IF NOT EXISTS public.client_integrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    provider        TEXT NOT NULL CHECK (provider IN ('google_search_console', 'google_analytics', 'google_business_profile')),
    access_token    TEXT,
    refresh_token   TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes          TEXT[],
    status          TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, provider)
);

ALTER TABLE public.client_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_integrations: select own or admin"
    ON public.client_integrations FOR SELECT TO authenticated
    USING (
        client_id IN (SELECT id FROM public.clients WHERE auth_user_id = auth.uid())
        OR (SELECT auth.jwt()->'app_metadata'->>'role') = 'admin'
    );
