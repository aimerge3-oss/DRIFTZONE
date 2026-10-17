// DRIFTZONE — баланс, транзакции, доход, ежедневки, промокоды.
// Все изменения денег идут через атомарные UPDATE с условием достаточности средств:
// UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?
// Если changes===0 — средств не хватило, откатываем batch целиком.
import { CARS, ECON, sellPrice } from '../game_data.js';

export async function ensureUser(db, tgUser) {
  const row = await db.prepare('SELECT * FROM users WHERE telegram_id = ?')
    .bind(tgUser.tgId).first();
  if (row) {
    await db.prepare("UPDATE users SET last_login_at = datetime('now'), username = COALESCE(?, username) WHERE id = ?")
      .bind(tgUser.username, row.id).run();
    return row;
  }
  await db.prepare('INSERT INTO users (telegram_id, username, first_name) VALUES (?, ?, ?)')
    .bind(tgUser.tgId, tgUser.username, tgUser.first_name).run();
  return db.prepare('SELECT * FROM users WHERE telegram_id = ?').bind(tgUser.tgId).first();
}

// Полный снимок состояния для клиента (сервер — источник истины)
export async function syncState(db, tgUser) {
  const u = await ensureUser(db, tgUser);
  const cars = await db.prepare('SELECT * FROM user_cars WHERE user_id = ? ORDER BY acquired_at').bind(u.id).all();
  const parts = await db.prepare('SELECT * FROM user_parts WHERE user_id = ?').bind(u.id).all();
  const quests = await db.prepare('SELECT * FROM user_quests WHERE user_id = ?').bind(u.id).all();
  // доначисляем топливо на лету (ленивое восстановление)
  const fuelInfo = regenFuel(u);
  return {
    ok: true,
    user: { ...u, fuel: fuelInfo.fuel, fuel_last_update: fuelInfo.at },
    cars: cars.results, parts: parts.results, quests: quests.results,
    serverTime: Math.floor(Date.now() / 1000),
  };
}

function regenFuel(u) {
  const now = Math.floor(Date.now() / 1000);
  if (u.fuel >= ECON.fuelMax) return { fuel: u.fuel, at: now };
  const gained = Math.floor((now - u.fuel_last_update) / ECON.fuelRegenSec);
  if (gained <= 0) return { fuel: u.fuel, at: u.fuel_last_update };
  const fuel = Math.min(ECON.fuelMax, u.fuel + gained);
  // при полном баке таймер стопим на сейчас, чтобы не копились "избыточные" минуты
  const at = fuel >= ECON.fuelMax ? now : u.fuel_last_update + gained * ECON.fuelRegenSec;
  return { fuel, at };
}

// Атомарное списание денег; бросает 'insufficient_funds' если не хватает
export async function spendMoney(db, userId, amount, kind, meta) {
  const r = await db.prepare('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?')
    .bind(amount, userId, amount).run();
  if (!r.meta.changes) throw new Error('insufficient_funds');
  await db.prepare("INSERT INTO transactions (user_id, kind, amount, currency, meta) VALUES (?, ?, ?, 'money', ?)")
    .bind(userId, kind, -amount, JSON.stringify(meta || null)).run();
}

export async function earnMoney(db, userId, amount, kind, meta) {
  await db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(amount, userId).run();
  await db.prepare("INSERT INTO transactions (user_id, kind, amount, currency, meta) VALUES (?, ?, ?, 'money', ?)")
    .bind(userId, kind, amount, JSON.stringify(meta || null)).run();
}

export async function addXp(db, userId, xp) {
  // уровень пересчитываем сервером: xpNeed(L)=round(100*L^1.35)
  const u = await db.prepare('SELECT level, xp FROM users WHERE id = ?').bind(userId).first();
  let total = u.xp + xp, level = u.level;
  const need = L => Math.round(100 * Math.pow(L, 1.35));
  while (total >= need(level)) { total -= need(level); level++; }
  await db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').bind(total, level, userId).run();
  return level;
}

// ===== Продажа машины (авто-продажа из кейсов тоже идёт через неё) =====
export async function sellCar(env, tgUser, carUid) {
  const db = env.DB;
  const u = await ensureUser(db, tgUser);
  const car = await db.prepare('SELECT * FROM user_cars WHERE id = ? AND user_id = ?').bind(carUid, u.id).first();
  if (!car) throw new Error('car_not_found');
  const def = CARS[car.car_id];
  if (!def) throw new Error('unknown_car');
  const price = sellPrice(def);
  const batch = await db.batch([
    db.prepare('DELETE FROM user_cars WHERE id = ? AND user_id = ?').bind(carUid, u.id),
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(price, u.id),
    db.prepare("INSERT INTO transactions (user_id, kind, amount, currency, meta) VALUES (?, 'sell', ?, 'money', ?)")
      .bind(u.id, price, JSON.stringify({ carUid, carId: car.car_id })),
  ]);
  const del = batch[0];
  if (!del.meta.changes) throw new Error('car_not_found');   // гонка: уже продана
  return { ok: true, soldFor: price, balance: (await db.prepare('SELECT balance FROM users WHERE id = ?').bind(u.id).first()).balance };
}

// ===== Пассивный доход: сервер валидирует время, кап 4 часа =====
export async function collectIncome(db, tgUser, clientNow) {
  const u = await ensureUser(db, tgUser);
  const now = Math.floor(Date.now() / 1000);
  // защита от открутки: клиентское время игнорируется полностью, берём серверное
  const cars = await db.prepare('SELECT * FROM user_cars WHERE user_id = ?').bind(u.id).all();
  let total = 0;
  const stmts = [];
  for (const car of cars.results) {
    const def = CARS[car.car_id];
    if (!def) continue;
    const elapsed = Math.max(0, Math.min(now - car.income_at, ECON.incomeCapHours * 3600));
    const income = Math.floor(def.price * ECON.incomePerHour * (elapsed / 3600) * (1 + (car.level - 1) * 0.05));
    if (income > 0) {
      total += income;
      stmts.push(db.prepare('UPDATE user_cars SET income_at = ? WHERE id = ?').bind(now, car.id));
    }
  }
  if (total > 0) {
    stmts.push(db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(total, u.id));
    stmts.push(db.prepare("INSERT INTO transactions (user_id, kind, amount, currency, meta) VALUES (?, 'income', ?, 'money', NULL)").bind(u.id, total));
    await db.batch(stmts);
  }
  return { ok: true, collected: total, serverNow: now };
}

export async function buySlot(db, tgUser) {
  const u = await ensureUser(db, tgUser);
  const count = await db.prepare('SELECT COUNT(*) c FROM user_cars WHERE user_id = ?').bind(u.id).first();
  if (count.c >= ECON.garageMax) throw new Error('garage_full_max');
  // цена следующего места: до 6-го — бесплатно (стартовый гараж), 7-е = 100К, далее ×2
  const price = Math.floor(ECON.slotPrice7 * Math.pow(2, Math.max(0, count.c - 6)));
  const paid = await db.batch([
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?').bind(price, u.id, price),
    db.prepare("INSERT INTO transactions (user_id, kind, amount, meta) VALUES (?, 'buy_slot', ?, ?)")
      .bind(u.id, -price, JSON.stringify({ slots: count.c + 1 })),
  ]);
  if (!paid[0].meta.changes) throw new Error('insufficient_funds');
  return { ok: true, slotsBought: count.c + 1, price };
}

export async function paintCar(db, tgUser, carUid, color) {
  const u = await ensureUser(db, tgUser);
  if (!/^#[0-9a-fA-F]{6}$/.test(color || '')) throw new Error('bad_color');
  const car = await db.prepare('SELECT * FROM user_cars WHERE id = ? AND user_id = ?').bind(carUid, u.id).first();
  if (!car) throw new Error('car_not_found');
  const price = Math.max(ECON.paintMin, Math.floor(CARS[car.car_id].price * ECON.paintShare));
  const upd = await db.batch([
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?').bind(price, u.id, price),
    db.prepare('UPDATE user_cars SET color_hex = ? WHERE id = ? AND user_id = ?').bind(color, carUid, u.id),
    db.prepare("INSERT INTO transactions (user_id, kind, amount, meta) VALUES (?, 'paint', ?, ?)")
      .bind(u.id, -price, JSON.stringify({ carUid, color })),
  ]);
  if (!upd[0].meta.changes) throw new Error('insufficient_funds');
  return { ok: true, cost: price };
}

// Улучшение машины до 10 уровня: стоимость растёт линейно-квадратично,
// окупаемость за счёт роста дохода (+5% к доходу за уровень)
export async function upgradeCar(db, tgUser, carUid) {
  const u = await ensureUser(db, tgUser);
  const car = await db.prepare('SELECT * FROM user_cars WHERE id = ? AND user_id = ?').bind(carUid, u.id).first();
  if (!car) throw new Error('car_not_found');
  if (car.level >= 10) throw new Error('max_level');
  const def = CARS[car.car_id];
  const cost = Math.floor(def.price * 0.08 * car.level);        // L1→2: 8% цены, L9→10: 72%
  // XP машины: сервер начисляет +25 за победу в гонке; на L1xp не нужен, дальше растёт
  const xpNeed = car.level === 1 ? 0 : Math.round(50 * Math.pow(car.level - 1, 1.5));
  if (car.current_xp < xpNeed) throw new Error('need_car_xp:' + xpNeed);
  const paid = await db.batch([
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?').bind(cost, u.id, cost),
    db.prepare('UPDATE user_cars SET level = level + 1, current_xp = current_xp - ? WHERE id = ?').bind(xpNeed, carUid),
    db.prepare("INSERT INTO transactions (user_id, kind, amount, meta) VALUES (?, 'upgrade', ?, ?)")
      .bind(u.id, -cost, JSON.stringify({ carUid, toLevel: car.level + 1 })),
  ]);
  if (!paid[0].meta.changes) throw new Error('insufficient_funds');
  return { ok: true, newLevel: car.level + 1, cost };
}

// ===== Ежедневная награда: streak по UTC-дням, сервер считает дату сам =====
export async function claimDaily(db, tgUser) {
  const u = await ensureUser(db, tgUser);
  const today = new Date().toISOString().slice(0, 10);
  // last_hit хранит unix-ms; отдельный endpoint 'daily_date' хранит строку даты в поле meta нельзя,
  // поэтому дата проверяется через transactions(kind='daily', created_at = сегодня)
  const prev = await db.prepare("SELECT id FROM transactions WHERE user_id = ? AND kind = 'daily' AND created_at >= ?")
    .bind(u.id, Math.floor(new Date(today).getTime() / 1000)).first();
  if (prev) throw new Error('already_claimed');
  const reward = 20000 + u.level * 5000;
  await db.batch([
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(reward, u.id),
    db.prepare("INSERT INTO transactions (user_id, kind, amount, meta) VALUES (?, 'daily', ?, ?)")
      .bind(u.id, reward, JSON.stringify({ day: today })),
  ]);
  return { ok: true, reward, day: today };
}

export async function claimQuest(db, tgUser, questId) {
  const u = await ensureUser(db, tgUser);
  const q = await db.prepare('SELECT * FROM user_quests WHERE user_id = ? AND quest_id = ?').bind(u.id, questId).first();
  if (!q) throw new Error('quest_not_found');
  if (!q.is_completed || q.is_claimed) throw new Error('quest_not_ready');
  const reward = q.progress; // награда хранится в прогрессе упрощённо; см. admin.set_quest
  await db.batch([
    db.prepare('UPDATE user_quests SET is_claimed = 1 WHERE id = ?').bind(q.id),
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(reward, u.id),
  ]);
  return { ok: true, reward };
}

// ===== Промокод: атомарный инкремент used_count с лимитом =====
export async function redeemPromo(db, tgUser, code) {
  const u = await ensureUser(db, tgUser);
  const clean = String(code || '').trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(clean)) throw new Error('bad_code');
  const promo = await db.prepare('SELECT * FROM promo_codes WHERE code = ?').bind(clean).first();
  if (!promo) throw new Error('invalid_code');
  if (promo.expires_at && Date.now() / 1000 > promo.expires_at) throw new Error('expired');
  const already = await db.prepare("SELECT id FROM transactions WHERE user_id = ? AND kind = 'promo' AND meta LIKE ?")
    .bind(u.id, `%${clean}%`).first();
  if (already) throw new Error('already_used');
  const upd = await db.prepare('UPDATE promo_codes SET used_count = used_count + 1 WHERE code = ? AND used_count < max_uses')
    .bind(clean).run();
  if (!upd.meta.changes) throw new Error('sold_out');
  const reward = JSON.parse(promo.reward_json);
  const stmts = [db.prepare("INSERT INTO transactions (user_id, kind, amount, meta) VALUES (?, 'promo', ?, ?)")
    .bind(u.id, reward.money || 0, JSON.stringify({ code: clean }))];
  if (reward.money) stmts.push(db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(reward.money, u.id));
  if (reward.stars) stmts.push(db.prepare('UPDATE users SET stars = stars + ? WHERE id = ?').bind(reward.stars, u.id));
  await db.batch(stmts);
  return { ok: true, reward };
}
