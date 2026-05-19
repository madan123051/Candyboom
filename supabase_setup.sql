-- ═══════════════════════════════════════════════════════════════
-- King of Jungle — Supabase Schema
-- Run this in: supabase.com → Your Project → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── Leaderboard ────────────────────────────────────────────────
create table if not exists leaderboard (
  id             bigserial primary key,
  player_name    text not null unique,
  best_score     integer not null default 0,
  level_reached  integer not null default 1,
  updated_at     timestamptz not null default now()
);

-- ── Game Saves ─────────────────────────────────────────────────
create table if not exists game_saves (
  id             bigserial primary key,
  player_name    text not null unique,
  current_level  integer not null default 1,
  total_score    integer not null default 0,
  updated_at     timestamptz not null default now()
);

-- ── Row Level Security ─────────────────────────────────────────
alter table leaderboard  enable row level security;
alter table game_saves   enable row level security;

-- Leaderboard: anyone can read; anyone can insert/update (anon key)
do $$ begin
  if not exists (select 1 from pg_policies where policyname='lb_select'   and tablename='leaderboard') then
    create policy "lb_select" on leaderboard for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='lb_insert'   and tablename='leaderboard') then
    create policy "lb_insert" on leaderboard for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='lb_update'   and tablename='leaderboard') then
    create policy "lb_update" on leaderboard for update using (true);
  end if;
end $$;

-- Game saves: same open policy (guest-friendly)
do $$ begin
  if not exists (select 1 from pg_policies where policyname='saves_select' and tablename='game_saves') then
    create policy "saves_select" on game_saves for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='saves_insert' and tablename='game_saves') then
    create policy "saves_insert" on game_saves for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='saves_update' and tablename='game_saves') then
    create policy "saves_update" on game_saves for update using (true);
  end if;
end $$;

-- ── Auth: Enable Google OAuth ──────────────────────────────────
-- Go to: supabase.com → Your Project → Authentication → Providers → Google
-- Toggle Google ON, then add:
--   Client ID     → from Google Cloud Console (OAuth 2.0)
--   Client Secret → from Google Cloud Console
--
-- In Google Cloud Console:
--   1. Go to: console.cloud.google.com → APIs & Services → Credentials
--   2. Create OAuth 2.0 Client ID (Web application)
--   3. Add Authorized redirect URIs:
--      https://ziznivooactegfbcvgiy.supabase.co/auth/v1/callback
--   4. Copy Client ID + Secret → paste in Supabase Google provider settings
