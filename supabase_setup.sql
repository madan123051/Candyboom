-- ══════════════════════════════════════════════
--  CandyBoom / King of Jungle — Supabase Setup
--  Run this in Supabase → SQL Editor → New Query
-- ══════════════════════════════════════════════

-- 1. LEADERBOARD TABLE
create table if not exists leaderboard (
  id           bigserial primary key,
  player_name  text not null unique,
  best_score   integer not null default 0,
  level_reached integer not null default 1,
  updated_at   timestamptz not null default now()
);

-- 2. GAME SAVES TABLE (cloud progress)
create table if not exists game_saves (
  id            bigserial primary key,
  player_name   text not null unique,
  current_level integer not null default 1,
  total_score   integer not null default 0,
  updated_at    timestamptz not null default now()
);

-- 3. ENABLE ROW LEVEL SECURITY
alter table leaderboard  enable row level security;
alter table game_saves   enable row level security;

-- 4. LEADERBOARD POLICIES (public read, anyone can upsert their own row)
create policy "leaderboard_select" on leaderboard
  for select using (true);

create policy "leaderboard_insert" on leaderboard
  for insert with check (true);

create policy "leaderboard_update" on leaderboard
  for update using (true);

-- 5. GAME SAVES POLICIES
create policy "saves_select" on game_saves
  for select using (true);

create policy "saves_insert" on game_saves
  for insert with check (true);

create policy "saves_update" on game_saves
  for update using (true);

-- Done! ✅
