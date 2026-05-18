-- Candyboom relational schema
-- Compatible with PostgreSQL / Cloud SQL (Postgres)

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email TEXT,
  avatar_url TEXT,
  coins INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS levels (
  id BIGSERIAL PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  target_score INTEGER NOT NULL,
  moves_allowed INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  layout_grid TEXT,
  objective_description TEXT
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id BIGINT NOT NULL REFERENCES levels(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL,
  moves_made INTEGER NOT NULL,
  final_board_state TEXT
);

CREATE TABLE IF NOT EXISTS power_ups (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  cost INTEGER NOT NULL,
  effect_description TEXT NOT NULL,
  icon_url TEXT
);

CREATE TABLE IF NOT EXISTS user_power_ups (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  power_up_id BIGINT NOT NULL REFERENCES power_ups(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  PRIMARY KEY (user_id, power_up_id)
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_level_id ON game_sessions(level_id);
