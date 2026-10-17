// DRIFTZONE — серверное открытие кейсов, слияние и установка деталей.
// Клиент присылает только НАМЕРЕНИЕ (caseId, count). Дроп считает сервер crypto-рандомом.
import { CAR_CASES, PART_CASES, PART_SLOTS, PART_LEVELS, CARS, rollCar, sellPrice } from '../game_data.js';
import { ensureUser, spendMoney, earnMoney, addXp } from './balance.js';

// Криптостойкий ролл вместо Math.random (Worker WebCrypto)
function secureRandom() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 4294967296;
}

async function grantCar(db, userId, carId) {
  const r = await db.prepare('INSERT INTO user_cars (user_id, car_id) VALUES (?, ?)').bind(userId, carId).run();
  return r.meta.last_row_id;
}

export async function openCarCase(env, tgUser, caseId, count = 1, autoSellBelow = null) {
  const db = env.DB;
  const def = CAR_CASES[caseId];
  if (!def) throw new Error('unknown_case');
  count = [1, 3, 5, 10].includes(Number(count)) ? Number(count) : 1;   // мульти-открыть только разрешёнными пачками
  const totalCost = def.price * count;

  // === Защита от отрицательного баланса: атомарное списание с условием balance >= price ===
  const u = await ensureUser(db, tgUser);
  if (u.balance < totalCost) throw new Error('insufficient_funds');
  const paid = await db.batch([
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?').bind(totalCost, u.id, totalCost),
    db.prepare("INSERT INTO transactions (user_id, kind, amount, meta) VALUES (?, 'open_car_case', ?, ?)")
      .bind(u.id, -totalCost, JSON.stringify({ caseId, count })),
  ]);
  if (!paid[0].meta.changes) throw new Error('insufficient_funds');   // гонка запросов — деньги не взяты

  const drops = [];
  let soldTotal = 0;
  const R_ORDER = ['D', 'C', 'B', 'A', 'S'];
  for (let i = 0; i < count; i++) {
    const carId = rollCar(caseId, secureRandom);
    if (!carId) throw new Error('roll_failed');                       // пул пуст → вернём деньги ниже
    const carDef = CARS[carId];
    const isDup = !!(await db.prepare('SELECT id FROM user_cars WHERE user_id = ? AND car_id = ? LIMIT 1')
      .bind(u.id, carId).first());
    // Авто-продажа: дубликат или редкость ниже порога клиента
    const shouldSell = isDup || (autoSellBelow && R_ORDER.indexOf(carDef.rarity) < R_ORDER.indexOf(autoSellBelow));
    if (shouldSell) {
      const p = sellPrice(carDef);
      soldTotal += p;
      drops.push({ carId, sold: true, price: p });
    } else {
      const uid = await grantCar(db, u.id, carId);
      drops.push({ carId, sold: false, uid });
    }
    await addXp(db, u.id, 10);                                        // XP за кейс
  }
  if (soldTotal > 0) await earnMoney(db, u.id, soldTotal, 'auto_sell', { caseId });
  return { ok: true, drops, soldTotal, balance: (await db.prepare('SELECT balance FROM users WHERE id = ?').bind(u.id).first()).balance };
}

export async function openPartCase(env, tgUser, caseId) {
  const db = env.DB;
  const def = PART_CASES[caseId];
  if (!def) throw new Error('unknown_case');
  const u = await ensureUser(db, tgUser);
  if (u.balance < def.price) throw new Error('insufficient_funds');
  const paid = await db.batch([
    db.prepare('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?').bind(def.price, u.id, def.price),
    db.prepare("INSERT INTO transactions (user_id, kind, amount, meta) VALUES (?, 'open_part_case', ?, ?)")
      .bind(u.id, -def.price, JSON.stringify({ caseId })),
  ]);
  if (!paid[0].meta.changes) throw new Error('insufficient_funds');

  // выбор стадии по весам [D,C,B,A]
  const total = def.weights.reduce((a, b) => a + b, 0);
  let roll = secureRandom() * total, stageIdx = 0;
  for (let i = 0; i < def.weights.length; i++) {
    if (roll < def.weights[i]) { stageIdx = i; break; }
    roll -= def.weights[i];
  }
  const slot = PART_SLOTS[Math.floor(secureRandom() * PART_SLOTS.length)];
  const ins = await db.prepare('INSERT INTO user_parts (user_id, part_id, stage) VALUES (?, ?, ?)')
    .bind(u.id, slot, stageIdx + 1).run();
  await addXp(db, u.id, 3);
  return { ok: true, part: { id: ins.meta.last_row_id, slot, stage: stageIdx + 1, rarity: PART_LEVELS[stageIdx].r } };
}

// Слияние 3 одинаковых деталей -> 1 стадией выше (шанс зависит от редкости, как в data.js MERGE_CHANCE)
const MERGE_CHANCE = { D: 1.0, C: 0.8, B: 0.6, A: 0.4 };
export async function mergeParts(env, tgUser, partIds) {
  const db = env.DB;
  const u = await ensureUser(db, tgUser);
  if (!Array.isArray(partIds) || partIds.length !== 3) throw new Error('need_3_parts');
  const rows = await db.batch(partIds.map(id =>
    db.prepare('SELECT * FROM user_parts WHERE id = ? AND user_id = ? AND equipped_to_car_id IS NULL').bind(id, u.id)));
  const parts = rows.filter(r => r);
  if (parts.length !== 3) throw new Error('parts_not_owned');
  if (new Set(parts.map(p => p.part_id)).size !== 1 || new Set(parts.map(p => p.stage)).size !== 1)
    throw new Error('parts_not_identical');
  if (parts[0].stage >= 5) throw new Error('max_stage');

  const chance = MERGE_CHANCE[PART_LEVELS[parts[0].stage - 1].r] ?? 0.5;
  const success = secureRandom() < chance;
  const del = await db.batch(parts.map(p => db.prepare('DELETE FROM user_parts WHERE id = ? AND user_id = ?').bind(p.id, u.id)));
  if (del.some(d => !d.meta.changes)) throw new Error('parts_changed');     // кто-то успел установить/продать
  if (success) {
    const ins = await db.prepare('INSERT INTO user_parts (user_id, part_id, stage) VALUES (?, ?, ?)')
      .bind(u.id, parts[0].part_id, parts[0].stage + 1).run();
    await addXp(db, u.id, 8);
    return { ok: true, success: true, part: { id: ins.meta.last_row_id, slot: parts[0].part_id, stage: parts[0].stage + 1 } };
  }
  await addXp(db, u.id, 2);                                                 // утешительный опыт
  return { ok: true, success: false };
}

export async function installPart(db, tgUser, partId, carUid, slot) {
  const u = await ensureUser(db, tgUser);
  const part = await db.prepare('SELECT * FROM user_parts WHERE id = ? AND user_id = ? AND equipped_to_car_id IS NULL')
    .bind(partId, u.id).first();
  if (!part) throw new Error('part_not_available');
  const car = await db.prepare('SELECT * FROM user_cars WHERE id = ? AND user_id = ?').bind(carUid, u.id).first();
  if (!car) throw new Error('car_not_found');
  if (part.part_id !== slot) throw new Error('slot_mismatch');
  // если в слоте уже стоит деталь — она просто возвращается на склад (SET NULL)
  await db.batch([
    db.prepare('UPDATE user_parts SET equipped_to_car_id = NULL WHERE equipped_to_car_id = ? AND part_id = ?').bind(carUid, slot),
    db.prepare('UPDATE user_parts SET equipped_to_car_id = ? WHERE id = ? AND user_id = ?').bind(carUid, partId, u.id),
  ]);
  await addXp(db, u.id, 5);
  return { ok: true };
}

export async function uninstallPart(db, tgUser, partId) {
  const u = await ensureUser(db, tgUser);
  const r = await db.prepare('UPDATE user_parts SET equipped_to_car_id = NULL WHERE id = ? AND user_id = ?')
    .bind(partId, u.id).run();
  if (!r.meta.changes) throw new Error('part_not_found');
  return { ok: true };
}
