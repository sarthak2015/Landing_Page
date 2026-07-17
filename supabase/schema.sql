-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Replaces the old file-based src/data/leads.json "database", which does not
-- work on Vercel's read-only serverless filesystem.

create table if not exists leads (
  id text primary key,
  type text not null,
  status text not null default 'pending',
  form_data jsonb not null,
  payment jsonb,
  booking jsonb,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id text primary key,
  title text not null,
  message text not null,
  type text not null,
  created_at timestamptz not null default now()
);

-- All reads/writes go through the Next.js API routes using the service role
-- key (server-only), which bypasses Row Level Security. RLS is enabled with
-- no policies so the tables are inaccessible from the client-side anon key.
alter table leads enable row level security;
alter table notifications enable row level security;
