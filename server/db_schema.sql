-- DRIFTZONE — схема Cloudflare D1 (SQLite)
-- Применить: npx wrangler d1 execute driftzone --file=./server/db_schema.sql

PRAGMA foreign_keys = ON;

-- 1. Пользователи
CREATE TABLE IF NOT EXISTS users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id     TEXT    NOT NULL UNIQUE,          -- uid из Telegram initData
  username        TEXT,
  first_name      TEXT,
  balance         INTEGER NOT NULL DEFAULT 50000 CHECK (balance >= 0),   -- монеты ₽
  stars           INTEGER NOT NULL DEFAULT 0    CHECK (stars >= 0),      -- ⭐ premium
  fuel            INTEGER NOT NULL DEFAULT 15   CHECK (fuel >= 0 AND fuel <= 15),
  fuel_last_update INTEGER NOT NULL DEFAULT (strftime('%s','now')),      -- unix-секунды
  level           INTEGER NOT NULL DEFAULT 1,
  xp              INTEGER NOT NULL DEFAULT 0,
  referrer_id     INTEGER REFERENCES users(id),      -- реферальная цепочка
  is_admin        INTEGER NOT NULL DEFAULT 0,
  banned          INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  last_login_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_tg       ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_referrer ON users(referrer_id);

-- 2. Машины в гараже игрока
CREATE TABLE IF NOT EXISTS user_cars (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id       TEXT    NOT NULL,                    -- ключ из data.js CARS
  level        INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 10),
  current_xp   INTEGER NOT NULL DEFAULT 0,
  color_hex    TEXT,                                -- NULL = без покраски
  is_active    INTEGER NOT NULL DEFAULT 0,          -- текущая машина для гонок
  acquired_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  income_at    INTEGER NOT NULL DEFAULT (strftime('%s','now'))  -- старт накопления дохода
);
CREATE INDEX IF NOT EXISTS idx_usercars_user  ON user_cars(user_id);
CREATE INDEX IF NOT EXISTS idx_usercars_carid ON user_cars(car_id);

-- 3. Детали (инвентарь и установленные)
CREATE TABLE IF NOT EXISTS user_parts (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part_id            TEXT    NOT NULL,              -- 'engine', 'turbo', ...
  stage              INTEGER NOT NULL DEFAULT 1 CHECK (stage BETWEEN 1 AND 5),
  equipped_to_car_id INTEGER REFERENCES user_cars(id) ON DELETE SET NULL,  -- NULL = на складе
  acquired_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_userparts_user    ON user_parts(user_id);
CREATE INDEX IF NOT EXISTS idx_userparts_equipped ON user_parts(equipped_to_car_id);

-- 4. Квесты
CREATE TABLE IF NOT EXISTS user_quests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id    TEXT    NOT NULL,
  progress    INTEGER NOT NULL DEFAULT 0,
  is_completed INTEGER NOT NULL DEFAULT 0,
  is_claimed   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, quest_id)
);
CREATE INDEX IF NOT EXISTS idx_userquests_user ON user_quests(user_id, quest_id);

-- 5. История гонок
CREATE TABLE IF NOT EXISTS race_history (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opponent_user_id INTEGER REFERENCES users(id),     -- NULL = бот/пул
  opponent_car_id  TEXT,
  result           TEXT NOT NULL CHECK (result IN ('win','lose','draw')),
  reward           INTEGER NOT NULL DEFAULT 0,
  power_you        INTEGER,                          -- Power Score для аудита баланса
  power_rival      INTEGER,
  timestamp        INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX IF NOT EXISTS idx_racehist_user ON race_history(user_id, timestamp DESC);

-- 6. Рефералы
CREATE TABLE IF NOT EXISTS referrals (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id    INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  reward_claimed INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_refs_referrer ON referrals(referrer_id);

-- 7. Журнал транзакций (аудит экономики, защита от рассинхрона)
CREATE TABLE IF NOT EXISTS transactions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT    NOT NULL,          -- 'case_open','sell','race','income','daily','admin'...
  amount     INTEGER NOT NULL,          -- + начисление / − списание
  currency   TEXT    NOT NULL DEFAULT 'money',
  meta       TEXT,                      -- JSON: детали операции
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id, created_at DESC);

-- 8. Промокоды
CREATE TABLE IF NOT EXISTS promo_codes (
  code        TEXT PRIMARY KEY,
  reward_json TEXT NOT NULL,             -- {"money":100000,"stars":5}
  max_uses    INTEGER NOT NULL DEFAULT 1000,
  used_count  INTEGER NOT NULL DEFAULT 0,
  expires_at  INTEGER                    -- unix-секунды, NULL = бессрочно
);

-- 9. Пополнения (Stars → внутренняя валюта, webhook-ориентированная таблица)
CREATE TABLE IF NOT EXISTS purchases (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tg_payment_id TEXT   NOT NULL UNIQUE,  -- идемпотентность: повторный webhook не начислит
  stars        INTEGER NOT NULL,
  payload      TEXT,
  credited     INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 10. Rate-limit счётчики (быстрый путь через KV; D1 — fallback)
CREATE TABLE IF NOT EXISTS rate_limits (
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint  TEXT    NOT NULL,
  last_hit  INTEGER NOT NULL,            -- unix-ms
  PRIMARY KEY (user_id, endpoint)
);
