-- Upload tokens for the uploads.babalola.dev page
-- Tokens are HMAC-SHA256 hashed; never store plaintext

CREATE TABLE IF NOT EXISTS upload_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  TEXT        NOT NULL,
  project     TEXT        NOT NULL,
  description TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_upload_tokens_hash       ON upload_tokens (token_hash);
CREATE INDEX idx_upload_tokens_project    ON upload_tokens (project);
CREATE INDEX idx_upload_tokens_expires_at ON upload_tokens (expires_at);

-- Rate limiting: track failed TOTP attempts per IP
CREATE TABLE IF NOT EXISTS upload_rate_limits (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ip          TEXT        NOT NULL,
  success     BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_upload_rate_limits_ip_time ON upload_rate_limits (ip, created_at);

-- Clean up expired tokens and old rate limit records automatically
CREATE OR REPLACE FUNCTION cleanup_upload_data() RETURNS void AS $$
BEGIN
  DELETE FROM upload_tokens     WHERE expires_at < now() - interval '7 days';
  DELETE FROM upload_rate_limits WHERE created_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Disable RLS for service role access (this table is admin-only, no user-facing RLS needed)
ALTER TABLE upload_tokens      DISABLE ROW LEVEL SECURITY;
ALTER TABLE upload_rate_limits DISABLE ROW LEVEL SECURITY;
