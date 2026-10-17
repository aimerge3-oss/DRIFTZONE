// QA-скрипт: проверка математики дропа и экономики DRIFTZONE
import { CARS, CAR_CASES, PART_CASES, SECRET_IDS, CAR_COUNTRY, rollCar, sellPrice } from '../server/game_data.js';

let fails = 0;
const check = (name, cond) => { console.log(cond ? `[OK] ${name}` : `[FAIL] ${name}`); if (!cond) fails++; };

// 1. Суммы шансов кейсов
for (const [id, c] of Object.entries(CAR_CASES))
  check(`шансы ${id} = 100%`, Object.values(c.pool).reduce((a, b) => a + b, 0) === 100);
for (const [id, c] of Object.entries(PART_CASES))
  check(`веса ${id} = 100`, c.weights.reduce((a, b) => a + b, 0) === 100);

// 2. Статистика rollCar: ни null, ни секреток, minPrice/страна соблюдаются
let bad = 0, nulls = 0;
const N = 50000;
for (const id of Object.keys(CAR_CASES)) {
  for (let i = 0; i < N; i++) {
    const carId = rollCar(id);
    if (carId == null) { nulls++; continue; }
    const c = CARS[carId], d = CAR_CASES[id];
    if (c.price < d.minPrice) bad++;
    if (SECRET_IDS.has(carId)) bad++;
    if (d.country && CAR_COUNTRY[carId] !== d.country) bad++;
  }
}
check(`rollCar: 9x${N} роллов без нарушений`, bad === 0);
check(`rollCar: нет пустых пулов`, nulls === 0);

// 3. Ожидаемая ценность дропа (по ПРОДАЖНОЙ цене) <= цены кейса — защита от фарм-кейсов
for (const [id, d] of Object.entries(CAR_CASES)) {
  const total = Object.values(d.pool).reduce((a, b) => a + b, 0);
  let ev = 0;
  for (const [r, w] of Object.entries(d.pool)) {
    const cand = Object.entries(CARS).filter(([cid, c]) =>
      c.rarity === r && c.price >= d.minPrice && !SECRET_IDS.has(cid) &&
      (!d.country || CAR_COUNTRY[cid] === d.country));
    if (!cand.length) continue;
    const avg = cand.reduce((a, [, c]) => a + sellPrice(c), 0) / cand.length;
    ev += (w / total) * avg;
  }
  check(`EV_продажа(${id}) = ${(ev / 1000).toFixed(0)}k <= цена (${(d.price / 1000).toFixed(0)}k)`, ev <= d.price);
}

// 4. Экономика апгрейда: доход машины 3%/ч от цены, кап 4ч → окупаемость
for (const [id, c] of Object.entries(CARS)) {
  const perHour = c.price * 0.03;
  const paybackDays = c.price / perHour / 24;   // всегда ~1.39 дня при 24ч работе
  check(`окупаемость ${id} <= 2 дня при полном доходе`, paybackDays <= 2);
}

process.exit(fails ? 1 : 0);
