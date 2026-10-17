// DRIFTZONE — гонки: матчмейкинг, симуляция заезда, награды.
// Формула победы (как в ТЗ):
//   score = PowerScore * (0.9 + random*0.2)  → у кого больше, тот победил.
// Соперник подбирается из пула машин с Power Score в пределах ±15% (tier смещает окно).
import { CARS, ECON } from '../game_data.js';
import { ensureUser, earnMoney, addXp } from './balance.js';

const RARITY_HP = { D: 1.0, C: 1.6, B: 2.4, A: 3.4, S: 5.0 };

// Детали дают мультипликативный бонус: каждая деталь stage*(slot bonus) к именованному стату.
// На сервере агрегируем просто как множитель мощности: +8% за стадию детали.
const PART_POWER_PER_STAGE = 0.08;

export function powerScore(carDef, level, parts) {
  const statBase = carDef.hp * RARITY_HP[carDef.rarity];
  const lvlMul = 1 + (level - 1) * 0.05;                       // +5% за уровень машины
  const partMul = 1 + parts.reduce((a, p) => a + p.stage * PART_POWER_PER_STAGE, 0);
  return Math.round(statBase * lvlMul * partMul);
}

// Активная машина: is_active=1, иначе — первая купленная (fallback, чтобы гонка не падала)
async function getActiveCar(db, userId) {
  let car = await db.prepare('SELECT * FROM user_cars WHERE user_id = ? AND is_active = 1')
    .bind(userId).first();
  if (!car) car = await db.prepare('SELECT * FROM user_cars WHERE user_id = ? ORDER BY acquired_at LIMIT 1')
    .bind(userId).first();
  return car;
}

function secureRandom() {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] / 4294967296;
}

const TIERS = {
  easy: { lo: 0.85, hi: 1.00, prizeMul: 0.5 },
  mid:  { lo: 1.10, hi: 1.30, prizeMul: 1.0 },
  hard: { lo: 1.45, hi: 1.80, prizeMul: 2.0 },
};

export async function startRace(env, tgUser, rivalTier) {
  const db = env.DB;
  const tier = TIERS[rivalTier] || TIERS.easy;
  const u = await ensureUser(db, tgUser);

  // топливо: серверный источник истины, ленивое восстановление
  const now = Math.floor(Date.now() / 1000);
  let fuel = u.fuel, fuAt = u.fuel_last_update;
  if (fuel < ECON.fuelMax) {
    const gained = Math.floor((now - fuAt) / ECON.fuelRegenSec);
    if (gained > 0) { fuel = Math.min(ECON.fuelMax, fuel + gained); fuAt += gained * ECON.fuelRegenSec; }
  }
  if (fuel < 1) throw new Error('no_fuel');

  // активная машина (fallback на первую, если флаг не выставлен)
  const car = await getActiveCar(db, u.id);
  if (!car) throw new Error('no_active_car');
  const def = CARS[car.car_id];
  if (!def) throw new Error('unknown_car');
  const parts = (await db.prepare('SELECT stage FROM user_parts WHERE equipped_to_car_id = ?').bind(car.id).all()).results;
  const myPower = powerScore(def, car.level, parts);

  // === Матчмейкинг: случайная машина-эталон из диапазона tier по Power Score ===
  const lo = myPower * tier.lo, hi = myPower * tier.hi;
  const pool = Object.entries(CARS)
    .map(([id, c]) => ({ id, power: powerScore(c, 1, []) }))
    .filter(x => x.power >= lo && x.power <= hi);
  // если в окне никого нет (крайне слабая/сильная машина) — берём ближайшую по мощности
  let rival = pool.length
    ? pool[Math.floor(secureRandom() * pool.length)]
    : Object.entries(CARS).map(([id, c]) => ({ id, power: powerScore(c, 1, []) }))
        .sort((a, b) => Math.abs(a.power - myPower) - Math.abs(b.power - myPower))[0];
  const rivalPower = Math.round(rival.power * tier.lo + secureRandom() * (rival.power * tier.hi - rival.power * tier.lo));

  // === Симуляция заезда: luck-множитель (0.9..1.1) для обеих сторон ===
  const myRoll = myPower * (0.9 + secureRandom() * 0.2);
  const rivRoll = rivalPower * (0.9 + secureRandom() * 0.2);
  const win = myRoll > rivRoll;

  // награда: призовой фонд по редкости соперника * множитель тира; за проигрыш — утешительные 10%
  const rivalDef = CARS[rival.id];
  const basePrize = ECON.racePrizeByRarity[rivalDef.rarity] ?? 10000;
  const reward = win ? Math.round(basePrize * tier.prizeMul) : Math.round(basePrize * 0.1);

  // атомарно: списать топливо + начислить награду + история + опыт машины
  const stmts = [
    db.prepare('UPDATE users SET fuel = ?, fuel_last_update = ? WHERE id = ?').bind(fuel - 1, fuAt, u.id),
    db.prepare("INSERT INTO race_history (user_id, opponent_car_id, result, reward, power_you, power_rival) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(u.id, rival.id, win ? 'win' : 'lose', reward, myPower, rivalPower),
  ];
  if (reward > 0) stmts.push(db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').bind(reward, u.id));
  if (win) stmts.push(db.prepare('UPDATE user_cars SET current_xp = current_xp + 25 WHERE id = ?').bind(car.id));
  await db.batch(stmts);

  await addXp(db, u.id, win ? 15 : 5);

  return {
    ok: true, win, reward,
    rival: { carId: rival.id, power: rivalPower },
    you: { power: myPower, roll: Math.round(myRoll) },
    rivalRoll: Math.round(rivRoll),
    fuelLeft: fuel - 1,
  };
}
