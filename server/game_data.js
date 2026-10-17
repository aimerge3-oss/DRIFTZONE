// DRIFTZONE — серверный реестр игровых данных.
// Зеркалирует js/data.js: сервер единственный источник истины по дропу и ценам.
'use strict';

export const CARS = {
  vaz2101:{rarity:'D',price:60000,hp:64},   vaz2106:{rarity:'D',price:80000,hp:72},
  vaz2107:{rarity:'D',price:90000,hp:75},   vaz2109:{rarity:'D',price:120000,hp:90},
  moskvich412:{rarity:'D',price:70000,hp:75}, volga24:{rarity:'D',price:130000,hp:95},
  priora:{rarity:'D',price:150000,hp:98},   niva:{rarity:'D',price:140000,hp:83},
  fiat500:{rarity:'D',price:180000,hp:69},  mini:{rarity:'D',price:220000,hp:112},
  polo:{rarity:'D',price:200000,hp:110},    golf2:{rarity:'D',price:190000,hp:90},
  corolla:{rarity:'D',price:250000,hp:121}, cresta:{rarity:'D',price:350000,hp:175},
  markii:{rarity:'D',price:380000,hp:175},  w124:{rarity:'D',price:400000,hp:150},
  e36:{rarity:'D',price:420000,hp:150},     impala64:{rarity:'D',price:450000,hp:270},
  jolion:{rarity:'D',price:300000,hp:143},  monjaro:{rarity:'D',price:450000,hp:238},
  tiggo7:{rarity:'D',price:280000,hp:143},  vestasport:{rarity:'D',price:250000,hp:145},
  civictyper:{rarity:'C',price:600000,hp:185}, ae86:{rarity:'C',price:700000,hp:130},
  golfgti:{rarity:'C',price:800000,hp:230}, mustang67:{rarity:'C',price:900000,hp:271},
  charger70:{rarity:'C',price:1200000,hp:370}, bydhan:{rarity:'C',price:1500000,hp:517},
  lil9:{rarity:'C',price:1400000,hp:449},   zeekr001:{rarity:'C',price:1800000,hp:544},
  s15:{rarity:'C',price:1100000,hp:250},    wrxsti:{rarity:'C',price:1300000,hp:300},
  crownvic:{rarity:'C',price:700000,hp:215}, camaro:{rarity:'C',price:1600000,hp:455},
  rangerover:{rarity:'C',price:2000000,hp:395}, wrangler:{rarity:'C',price:1500000,hp:285},
  sclass:{rarity:'C',price:2500000,hp:449}, raptor:{rarity:'C',price:2200000,hp:450},
  escalade:{rarity:'C',price:2300000,hp:420}, cybertruck:{rarity:'C',price:3000000,hp:845},
  evo9:{rarity:'B',price:2200000,hp:291},   rx7:{rarity:'B',price:2400000,hp:276},
  supra:{rarity:'B',price:3000000,hp:326},  m3e30:{rarity:'B',price:3500000,hp:215},
  m3e46:{rarity:'B',price:3200000,hp:343},  m3touring:{rarity:'B',price:4500000,hp:510},
  m4g82:{rarity:'B',price:7000000,hp:500},  m5f90:{rarity:'B',price:6500000,hp:600},
  r34:{rarity:'B',price:4000000,hp:280},    gtr35:{rarity:'B',price:5500000,hp:570},
  p911ts:{rarity:'B',price:8000000,hp:650}, rs6:{rarity:'B',price:6000000,hp:600},
  rs7:{rarity:'B',price:6500000,hp:600},    taycan:{rarity:'B',price:9000000,hp:761},
  giuliaqv:{rarity:'B',price:5000000,hp:510}, g63:{rarity:'B',price:9500000,hp:585},
  hellcat:{rarity:'B',price:4500000,hp:707}, r8:{rarity:'B',price:7500000,hp:610},
  plaid:{rarity:'B',price:8000000,hp:1020}, urus:{rarity:'B',price:12000000,hp:650},
  gt500:{rarity:'B',price:5000000,hp:760},  gt63:{rarity:'B',price:7000000,hp:585},
  nsx:{rarity:'B',price:6000000,hp:500},
  f812:{rarity:'A',price:25000000,hp:720},  huracan:{rarity:'A',price:22000000,hp:640},
  svj:{rarity:'A',price:40000000,hp:770},   mclarenf1:{rarity:'A',price:45000000,hp:627},
  lfa:{rarity:'A',price:35000000,hp:477},   db11:{rarity:'A',price:18000000,hp:630},
  cullinan:{rarity:'A',price:30000000,hp:563}, aurus:{rarity:'A',price:25000000,hp:598},
  fordgt:{rarity:'A',price:50000000,hp:660},viper:{rarity:'A',price:15000000,hp:640},
  chiron:{rarity:'S',price:350000000,hp:1500}, f40:{rarity:'S',price:90000000,hp:478},
  laferrari:{rarity:'S',price:120000000,hp:963}, p918:{rarity:'S',price:100000000,hp:887},
  amgone:{rarity:'S',price:70000000,hp:1063}, grgt3:{rarity:'S',price:60000000,hp:650},
  jesko:{rarity:'S',price:300000000,hp:1600}, tuatara:{rarity:'S',price:250000000,hp:1750},
  zondar:{rarity:'S',price:150000000,hp:750}, marussia:{rarity:'S',price:80000000,hp:700},
};

// Секретные машины не дропаются из кейсов вообще (выдаются только админом/ивентом)
export const SECRET_IDS = new Set(['marussia','grgt3','p918','zondar','tuatara']);

export const CAR_CASES = {
  rust:   { price:50000,   minPrice:25000,   pool:{D:100} },
  city:   { price:500000,  minPrice:200000,  pool:{D:70,C:26,B:4} },
  sport:  { price:2500000, minPrice:1400000, pool:{C:55,B:38,A:7} },
  elite:  { price:8000000, minPrice:4000000, pool:{B:55,A:38,S:7} },
  case_ru:{ price:350000,  minPrice:175000,  country:'ru', pool:{D:80,C:16,B:3,A:1} },
  case_jp:{ price:1700000, minPrice:850000,  country:'jp', pool:{D:40,C:35,B:20,A:5} },
  case_de:{ price:2600000, minPrice:1300000, country:'de', pool:{D:30,C:35,B:28,A:6,S:1} },
  case_it:{ price:6500000, minPrice:3250000, country:'it', pool:{C:30,B:40,A:25,S:5} },
  case_us:{ price:2550000, minPrice:1275000, country:'us', pool:{D:25,C:40,B:25,A:9,S:1} },
};

export const PART_SLOTS = ['engine','turbo','gearbox','exhaust','susp','wheels','brakes','bodykit'];
export const PART_LEVELS = [
  {r:'D',share:0.15,price:20000},{r:'C',share:0.30,price:60000},{r:'B',share:0.50,price:220000},
  {r:'A',share:0.75,price:1100000},{r:'S',share:1.00,price:8000000},
];
export const PART_CASES = {
  pc1:{price:14000,weights:[100,0,0,0]}, pc2:{price:49000,weights:[40,50,10,0]},
  pc3:{price:245000,weights:[0,25,55,20]}, pc4:{price:720000,weights:[0,0,20,80]},
};

// Продажная цена машины: доля от базовой цены. 0.125 => кейс окупается в среднем ~50% (EV <= цены)
export const sellPrice = car => Math.floor(car.price * 0.125);

export const ECON = {
  startMoney:50000, sellShare:0.125, incomePerHour:0.03, incomeCapHours:4,
  fuelMax:15, fuelRegenSec:900,            // 1 топливо / 15 минут
  garageMax:30, slotPrice7:100000,         // 7-е место = 100К, далее ×2
  paintShare:0.05, paintMin:5000,          // покраска = 5% цены машины, но не дешевле 5К
  racePrizeByRarity:{D:10000,C:50000,B:200000,A:800000,S:5000000},
  luck:0.10,                                // разброс статов в гонке ±10%
  matchTolerance:0.15,                      // подбор соперника ±15% Power Score
};

// Страна машины — нужна для страновых кейсов (зеркало data.js)
export const CAR_COUNTRY = {
  vaz2101:'ru',vaz2106:'ru',vaz2107:'ru',vaz2109:'ru',moskvich412:'ru',volga24:'ru',
  priora:'ru',niva:'ru',jolion:'ru',monjaro:'ru',tiggo7:'ru',vestasport:'ru',aurus:'ru',
  fiat500:'it',mclarenf1:'it',db11:'it',cullinan:'it',chiron:'it',f40:'it',laferrari:'it',jesko:'it',zondar:'it',svj:'it',huracan:'it',f812:'it',
  mini:'de',polo:'de',golf2:'de',w124:'de',e36:'de',golfgti:'de',m3e30:'de',m3e46:'de',m3touring:'de',m4g82:'de',m5f90:'de',p911ts:'de',rs6:'de',rs7:'de',taycan:'de',g63:'de',r8:'de',gt63:'de',amgone:'de',p918:'de',rangerover:'de',
  corolla:'jp',cresta:'jp',markii:'jp',civictyper:'jp',ae86:'jp',s15:'jp',wrxsti:'jp',evo9:'jp',rx7:'jp',supra:'jp',r34:'jp',gtr35:'jp',nsx:'jp',lfa:'jp',grgt3:'jp',
  impala64:'us',mustang67:'us',charger70:'us',crownvic:'us',camaro:'us',wrangler:'us',raptor:'us',escalade:'us',cybertruck:'us',hellcat:'us',plaid:'us',gt500:'us',fordgt:'us',viper:'us',tuatara:'us',
};

// Взвешенный выбор rarity → конкретной машины из пула.
// Если редкость не найдена (пустой пул) — откат к ближайшей доступной редкости ниже/выше,
// чтобы ролл никогда не возвращал null.
export function rollCar(caseId, rng = Math.random) {
  const def = CAR_CASES[caseId];
  if (!def) return null;
  const candidatesFor = r => Object.entries(CARS).filter(([id, c]) =>
    c.rarity === r && c.price >= def.minPrice &&
    !SECRET_IDS.has(id) && (!def.country || CAR_COUNTRY[id] === def.country));

  const total = Object.values(def.pool).reduce((a, b) => a + b, 0);
  let roll = rng() * total, pickedRarity = 'D';
  for (const [r, w] of Object.entries(def.pool)) {
    if (roll < w) { pickedRarity = r; break; }
    roll -= w;
  }
  let cand = candidatesFor(pickedRarity);
  if (!cand.length) {
    // fallback: все непустые пулы этого кейса, равновероятно по машинам
    const all = [];
    for (const r of Object.keys(def.pool)) all.push(...candidatesFor(r));
    if (!all.length) return null; // теоретически недостижимо
    cand = all;
  }
  const [id] = cand[Math.floor(rng() * cand.length)];
  return id;
}
