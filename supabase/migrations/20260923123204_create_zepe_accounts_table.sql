/*
# Create zepe_accounts table

1. New Tables
- `zepe_accounts`
  - `user_id` (text, primary key) — external identity provider user ID
  - `state` (jsonb, not null) — serialized account state (profile, cart, plan, etc.)
  - `version` (integer, not null, default 0) — optimistic concurrency counter
  - `updated_at` (timestamptz, not null, default now()) — last write timestamp

2. Security
- Enable RLS on `zepe_accounts`.
- The server-side API route reads/writes using the service role key (bypasses RLS).
- No direct client access to this table; all access is mediated by the API route.
- Policies: deny-by-default (no anon/authenticated policies). Only the service role can access.

3. Notes
- This table replaces the Cloudflare D1 `zepe_accounts` table for Netlify deployment.
- The `user_id` comes from ChatGPT auth headers verified by the server, not from Supabase auth.
- `version` provides optimistic concurrency control to prevent lost updates.
*/

CREATE TABLE IF NOT EXISTS zepe_accounts (
  user_id text PRIMARY KEY,
  state jsonb NOT NULL,
  version integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE zepe_accounts ENABLE ROW LEVEL SECURITY;