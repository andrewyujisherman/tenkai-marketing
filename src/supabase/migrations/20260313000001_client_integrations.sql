CREATE TABLE IF NOT EXISTS client_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id),
  integration_type TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'error')),
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_client_integrations_unique ON client_integrations(client_id, integration_type);

ALTER TABLE client_integrations ENABLE ROW LEVEL SECURITY;
