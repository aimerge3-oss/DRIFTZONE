// DRIFTZONE — данные и баланс. Все цифры меняются здесь.
'use strict';

const DATA_VERSION = 1;

// ===== Машины ===== Фото: img/cars/<id>.webp
const CARS = [
  { id:'vaz2101',    name:'ВАЗ-2101',        brand:'Lada',       country:'ru', rarity:'D', hp:64,   price:60000 },
  { id:'vaz2106',    name:'ВАЗ-2106',        brand:'Lada',       country:'ru', rarity:'D', hp:72,   price:80000 },
  { id:'vaz2107',    name:'ВАЗ-2107',        brand:'Lada',       country:'ru', rarity:'D', hp:75,   price:90000 },
  { id:'vaz2109',    name:'ВАЗ-2109',        brand:'Lada',       country:'ru', rarity:'D', hp:90,   price:120000 },
  { id:'moskvich412',name:'Москвич-412',     brand:'AZLK',       country:'ru', rarity:'D', hp:75,   price:70000 },
  { id:'volga24',    name:'Волга ГАЗ-24',    brand:'GAZ',        country:'ru', rarity:'D', hp:95,   price:130000 },
  { id:'priora',     name:'Lada Priora',     brand:'Lada',       country:'ru', rarity:'D', hp:98,   price:150000 },
  { id:'niva',       name:'Lada Niva',       brand:'Lada',       country:'ru', rarity:'D', hp:83,   price:140000 },
  { id:'fiat500',    name:'Fiat 500',        brand:'Fiat',       country:'it', rarity:'D', hp:69,   price:180000 },
  { id:'mini',       name:'Mini Cooper',     brand:'Mini',       country:'de', rarity:'D', hp:112,  price:220000 },
  { id:'polo',       name:'VW Polo',         brand:'Volkswagen', country:'de', rarity:'D', hp:110,  price:200000 },
  { id:'golf2',      name:'VW Golf 2',       brand:'Volkswagen', country:'de', rarity:'D', hp:90,   price:190000 },
  { id:'corolla',    name:'Toyota Corolla',  brand:'Toyota',     country:'jp', rarity:'D', hp:121,  price:250000 },
  { id:'cresta',     name:'Toyota Cresta',   brand:'Toyota',     country:'jp', rarity:'D', hp:175,  price:350000 },
  { id:'markii',     name:'Toyota Mark II',  brand:'Toyota',     country:'jp', rarity:'D', hp:175,  price:380000 },
  { id:'w124',       name:'Mercedes W124',   brand:'Mercedes',   country:'de', rarity:'D', hp:150,  price:400000 },
  { id:'e36',        name:'BMW 3 Series E36',brand:'BMW',        country:'de', rarity:'D', hp:150,  price:420000 },
  { id:'impala64',   name:'Chevy Impala 64', brand:'Chevrolet',  country:'us', rarity:'D', hp:270,  price:450000 },
  { id:'jolion',     name:'Haval Jolion',    brand:'Haval',      country:'ru', rarity:'D', hp:143,  price:300000 },
  { id:'monjaro',    name:'Geely Monjaro',   brand:'Geely',      country:'ru', rarity:'D', hp:238,  price:450000 },
  { id:'tiggo7',     name:'Chery Tiggo 7',   brand:'Chery',      country:'ru', rarity:'D', hp:143,  price:280000 },
  { id:'vestasport', name:'Lada Vesta Sport',brand:'Lada',       country:'ru', rarity:'D', hp:145,  price:250000 },
  { id:'civictyper', name:'Honda Civic Type R', brand:'Honda',   country:'jp', rarity:'C', hp:185,  price:600000 },
  { id:'ae86',       name:'Toyota AE86',     brand:'Toyota',     country:'jp', rarity:'C', hp:130,  price:700000 },
  { id:'golfgti',    name:'VW Golf GTI',     brand:'Volkswagen', country:'de', rarity:'C', hp:230,  price:800000 },
  { id:'mustang67',  name:'Ford Mustang 67', brand:'Ford',       country:'us', rarity:'C', hp:271,  price:900000 },
  { id:'charger70',  name:'Dodge Charger R/T 70', brand:'Dodge', country:'us', rarity:'C', hp:370,  price:1200000 },
  { id:'bydhan',     name:'BYD Han',         brand:'BYD',        country:'ru', rarity:'C', hp:517,  price:1500000 },
  { id:'lil9',       name:'Li L9',           brand:'Li Auto',    country:'ru', rarity:'C', hp:449,  price:1400000 },
  { id:'zeekr001',   name:'Zeekr 001',       brand:'Zeekr',      country:'ru', rarity:'C', hp:544,  price:1800000 },
  { id:'s15',        name:'Nissan Silvia S15',brand:'Nissan',    country:'jp', rarity:'C', hp:250,  price:1100000 },
  { id:'wrxsti',     name:'Subaru WRX STI',  brand:'Subaru',     country:'jp', rarity:'C', hp:300,  price:1300000 },
  { id:'crownvic',   name:'Ford Crown Victoria',brand:'Ford',    country:'us', rarity:'C', hp:215,  price:700000 },
  { id:'camaro',     name:'Chevy Camaro SS', brand:'Chevrolet',  country:'us', rarity:'C', hp:455,  price:1600000 },
  { id:'rangerover', name:'Range Rover',     brand:'Land Rover', country:'de', rarity:'C', hp:395,  price:2000000 },
  { id:'wrangler',   name:'Jeep Wrangler',   brand:'Jeep',       country:'us', rarity:'C', hp:285,  price:1500000 },
  { id:'sclass',     name:'Mercedes S-Class',brand:'Mercedes',   country:'de', rarity:'C', hp:449,  price:2500000 },
  { id:'raptor',     name:'Ford F-150 Raptor',brand:'Ford',      country:'us', rarity:'C', hp:450,  price:2200000 },
  { id:'escalade',   name:'Cadillac Escalade',brand:'Cadillac',  country:'us', rarity:'C', hp:420,  price:2300000 },
  { id:'cybertruck', name:'Tesla Cybertruck',brand:'Tesla',      country:'us', rarity:'C', hp:845,  price:3000000 },
  { id:'evo9',       name:'Lancer Evo IX',   brand:'Mitsubishi', country:'jp', rarity:'B', hp:291,  price:2200000 },
  { id:'rx7',        name:'Mazda RX-7 FD',   brand:'Mazda',      country:'jp', rarity:'B', hp:276,  price:2400000 },
  { id:'supra',      name:'Toyota Supra A80',brand:'Toyota',     country:'jp', rarity:'B', hp:326,  price:3000000 },
  { id:'m3e30',      name:'BMW M3 E30',      brand:'BMW',        country:'de', rarity:'B', hp:215,  price:3500000 },
  { id:'m3e46',      name:'BMW M3 E46',      brand:'BMW',        country:'de', rarity:'B', hp:343,  price:3200000 },
  { id:'m3touring',  name:'BMW M3 Touring',  brand:'BMW',        country:'de', rarity:'B', hp:510,  price:4500000 },
  { id:'m4g82',      name:'BMW M4 GTS',      brand:'BMW',        country:'de', rarity:'B', hp:500,  price:7000000 },
  { id:'m5f90',      name:'BMW M5 F90',      brand:'BMW',        country:'de', rarity:'B', hp:600,  price:6500000 },
  { id:'r34',        name:'Skyline GT-R R34',brand:'Nissan',     country:'jp', rarity:'B', hp:280,  price:4000000 },
  { id:'gtr35',      name:'Nissan GT-R R35', brand:'Nissan',     country:'jp', rarity:'B', hp:570,  price:5500000 },
  { id:'p911ts',     name:'Porsche 911 Turbo S',brand:'Porsche', country:'de', rarity:'B', hp:650,  price:8000000 },
  { id:'rs6',        name:'Audi RS6 Avant',  brand:'Audi',       country:'de', rarity:'B', hp:600,  price:6000000 },
  { id:'rs7',        name:'Audi RS7',        brand:'Audi',       country:'de', rarity:'B', hp:600,  price:6500000 },
  { id:'taycan',     name:'Porsche Taycan',  brand:'Porsche',    country:'de', rarity:'B', hp:761,  price:9000000 },
  { id:'giuliaqv',   name:'Alfa Giulia QV',  brand:'Alfa Romeo', country:'it', rarity:'B', hp:510,  price:5000000 },
  { id:'g63',        name:'Mercedes G 63 AMG',brand:'Mercedes',  country:'de', rarity:'B', hp:585,  price:9500000 },
  { id:'hellcat',    name:'Challenger Hellcat',brand:'Dodge',    country:'us', rarity:'B', hp:707,  price:4500000 },
  { id:'r8',         name:'Audi R8 V10',     brand:'Audi',       country:'de', rarity:'B', hp:610,  price:7500000 },
  { id:'plaid',      name:'Tesla Model S Plaid',brand:'Tesla',   country:'us', rarity:'B', hp:1020, price:8000000 },
  { id:'urus',       name:'Lamborghini Urus',brand:'Lamborghini',country:'it', rarity:'B', hp:650,  price:12000000 },
  { id:'gt500',      name:'Ford GT500',      brand:'Ford',       country:'us', rarity:'B', hp:760,  price:5000000 },
  { id:'gt63',       name:'Mercedes AMG GT 63',brand:'Mercedes', country:'de', rarity:'B', hp:585,  price:7000000 },
  { id:'nsx',        name:'Acura NSX',       brand:'Acura',      country:'jp', rarity:'B', hp:500,  price:6000000 },
  { id:'f812',       name:'Ferrari F8 Tributo',brand:'Ferrari',  country:'it', rarity:'A', hp:720,  price:25000000 },
  { id:'huracan',    name:'Lamborghini Huracan',brand:'Lamborghini',country:'it',rarity:'A', hp:640, price:22000000 },
  { id:'svj',        name:'Aventador SVJ',   brand:'Lamborghini',country:'it', rarity:'A', hp:770,  price:40000000 },
  { id:'mclarenf1',  name:'McLaren F1',      brand:'McLaren',    country:'it', rarity:'A', hp:627,  price:45000000 },
  { id:'lfa',        name:'Lexus LFA',       brand:'Lexus',      country:'jp', rarity:'A', hp:477,  price:35000000 },
  { id:'db11',       name:'Aston Martin DB11',brand:'Aston Martin',country:'it',rarity:'A', hp:630, price:18000000 },
  { id:'cullinan',   name:'Rolls-Royce Cullinan',brand:'Rolls-Royce',country:'it',rarity:'A', hp:563, price:30000000 },
  { id:'aurus',      name:'Aurus Senat',     brand:'Aurus',      country:'ru', rarity:'A', hp:598,  price:25000000 },
  { id:'fordgt',     name:'Ford GT',         brand:'Ford',       country:'us', rarity:'A', hp:660,  price:50000000 },
  { id:'viper',      name:'Dodge Viper SRT10',brand:'Dodge',     country:'us', rarity:'A', hp:640,  price:15000000 },
  { id:'chiron',     name:'Bugatti Chiron',  brand:'Bugatti',    country:'it', rarity:'S', hp:1500, price:350000000 },
  { id:'f40',        name:'Ferrari F40',     brand:'Ferrari',    country:'it', rarity:'S', hp:478,  price:90000000 },
  { id:'laferrari',  name:'Ferrari LaFerrari',brand:'Ferrari',   country:'it', rarity:'S', hp:963,  price:120000000 },
  { id:'p918',       name:'Porsche 918 Spyder',brand:'Porsche',  country:'de', rarity:'S', hp:887,  price:100000000 },
  { id:'amgone',     name:'Mercedes-AMG ONE',brand:'Mercedes',   country:'de', rarity:'S', hp:1063, price:70000000 },
  { id:'grgt3',      name:'Toyota GR GT3',   brand:'Toyota',     country:'jp', rarity:'S', hp:650,  price:60000000 },
  { id:'jesko',      name:'Koenigsegg Jesko',brand:'Koenigsegg', country:'it', rarity:'S', hp:1600, price:300000000 },
  { id:'tuatara',    name:'SSC Tuatara',     brand:'SSC',        country:'us', rarity:'S', hp:1750, price:250000000 },
  { id:'zondar',     name:'Pagani Zonda R',  brand:'Pagani',     country:'it', rarity:'S', hp:750,  price:150000000 },
  { id:'marussia',   name:'Marussia B2',     brand:'Marussia',   country:'ru', rarity:'S', hp:700,  price:80000000 },
];

const SECRET_CARS = { ru:'marussia', jp:'grgt3', de:'p918', it:'zondar', us:'tuatara' };
const NO_PAINT = ['marussia','chiron','jesko','tuatara','zondar','p918','laferrari','amgone'];
const PAINT_ENABLED = true;

const RARITY = {
  D:{ label:'Обычная',     color:'#9ca3af' },
  C:{ label:'Редкая',      color:'#38bdf8' },
  B:{ label:'Эпическая',   color:'#a78bfa' },
  A:{ label:'Легендарная', color:'#fbbf24' },
  S:{ label:'Мифическая',  color:'#f87171' },
  X:{ label:'Секретная',   color:'#ffd700' },
};
const R_ORDER = ['D','C','B','A','S'];
const carById = id => CARS.find(c=>c.id===id);
const raceClass = r => r==='X' ? 'S' : r;

// Кейсы машин. minPrice: дроп не дешевле половины цены кейса.
const CAR_CASES = [
  { id:'rust',   name:'Ржавый',    price:50000,   minPrice:25000,   icon:'🟤', pool:{ D:100 } },
  { id:'city',   name:'Городской', price:500000,  minPrice:200000,  icon:'🔵', pool:{ D:70, C:26, B:4 } },
  { id:'sport',  name:'Спорткар',  price:2500000, minPrice:1400000, icon:'🟣', pool:{ C:55, B:38, A:7 } },
  { id:'elite',  name:'Элита',     price:8000000, minPrice:4000000, icon:'🟡', pool:{ B:55, A:38, S:7 } },
  { id:'case_ru',name:'Кейс RU',   price:350000,  minPrice:175000,  icon:'🇷🇺', country:'ru', pool:{ D:80, C:16, B:3, A:1 } },
  { id:'case_jp',name:'Кейс JP',   price:1700000, minPrice:850000,  icon:'🇯🇵', country:'jp', pool:{ D:40, C:35, B:20, A:5 } },
  { id:'case_de',name:'Кейс DE',   price:2600000, minPrice:1300000, icon:'🇩🇪', country:'de', pool:{ D:30, C:35, B:28, A:6, S:1 } },
  { id:'case_it',name:'Кейс IT',   price:6500000, minPrice:3250000, icon:'🇮🇹', country:'it', pool:{ C:30, B:40, A:25, S:5 } },
  { id:'case_us',name:'Кейс US',   price:2550000, minPrice:1275000, icon:'🇺🇸', country:'us', pool:{ D:25, C:40, B:25, A:9, S:1 } },
];

// Детали
const PART_SLOTS = [
  { id:'engine',  name:'Двигатель',    bonus:0.22 },
  { id:'turbo',   name:'Турбина',      bonus:0.20 },
  { id:'gearbox', name:'КПП',          bonus:0.12 },
  { id:'exhaust', name:'Выхлоп',       bonus:0.10 },
  { id:'susp',    name:'Подвеска',     bonus:0.10 },
  { id:'wheels',  name:'Диски и шины', bonus:0.10 },
  { id:'brakes',  name:'Тормоза',      bonus:0.08 },
  { id:'bodykit', name:'Обвес',        bonus:0.08 },
];
const PART_LEVELS = [
  { r:'D', name:'Stock',  share:0.15, price:20000 },
  { r:'C', name:'Street', share:0.30, price:60000 },
  { r:'B', name:'Sport',  share:0.50, price:220000 },
  { r:'A', name:'Race',   share:0.75, price:1100000 },
  { r:'S', name:'Elite',  share:1.00, price:8000000 },
];
const MERGE_CHANCE = { D:1.0, C:0.8, B:0.6, A:0.4 };
const PART_CASES = [
  { id:'pc1', name:'Разборка',         price:14000,  weights:[100,0,0,0] },
  { id:'pc2', name:'Тюнинг-ателье',    price:49000,  weights:[40,50,10,0] },
  { id:'pc3', name:'Гоночный цех',     price:245000, weights:[0,25,55,20] },
  { id:'pc4', name:'Заводской тюнинг', price:720000, weights:[0,0,20,80], topOnly:true },
];

// Гонки
const RACE = {
  distance: 402, weight: 1400,
  rivals: [
    { id:'easy', name:'Лёгкий',  lo:0.85, hi:1.0,  prizeMul:0.5 },
    { id:'mid',  name:'Средний', lo:1.1,  hi:1.3,  prizeMul:1 },
    { id:'hard', name:'Сложный', lo:1.45, hi:1.8,  prizeMul:2 },
  ],
  prizeByRarity: { D:10000, C:50000, B:200000, A:800000, S:5000000 },
  entryFee: 0.3, fuelMax:15, fuelPerCar:5, fuelRegenMin:20, luck:0.10,
};

// Экономика
const ECON = {
  startMoney: 50000, incomePerHour: 0.03, incomeCapHours: 4, sellShare: 0.5,
  garageStart: 6, garageMax: 30, slotPrice7: 100000,
  museumSlots: 4, museumPrice: 500000, museumMax: 20,
  paintShare: 0.05, paintMin: 5000, rewardCaseHours: 4,
  dailyBonus: [
    { money:20000 }, { parts:['pc1',3] }, { money:60000 }, { parts:['pc2',2] },
    { carCase:'city' }, { money:250000 }, { carCase:'sport', parts:['pc3',1] },
  ],
  rewardCase: [
    { type:'money', w:50 }, { type:'part', w:25 }, { type:'fuel', w:15 }, { type:'car', w:10 },
  ],
  collectionRewards: [
    { n:5,  money:50000 }, { n:10, money:150000, slot:1 }, { n:20, money:600000 },
    { n:30, money:2000000, slot:1 }, { n:40, money:8000000 }, { n:53, money:50000000, slot:2 },
  ],
  countryRewards: { ru:1000000, jp:10000000, de:20000000, it:50000000, us:10000000 },
};

// Опыт
const XP_RULES = {
  carCase:10, partCase:3, race:5, raceWin:10, merge:8, installPart:5,
  newCar:25, daily:20, questMin:30, questMax:100, dailyCap:300,
};
const xpNeed = L => Math.round(100 * Math.pow(L, 1.35));
const levelGift = L => Math.round(15000 * Math.pow(L, 1.6));

const PAINT_COLORS = [
  ['#ef4444','Красный'], ['#3b82f6','Синий'], ['#22c55e','Зелёный'], ['#eab308','Жёлтый'],
  ['#f97316','Оранжевый'], ['#a855f7','Фиолетовый'], ['#ec4899','Розовый'], ['#06b6d4','Бирюзовый'],
  ['#111827','Чёрный'], ['#f3f4f6','Белый'], ['#6b7280','Серый'], ['#78350f','Коричневый'],
  ['#1e3a8a','Тёмно-синий'], ['#14532d','Тёмно-зелёный'],
];

const ADMIN_IDS = [];

const QUESTS_NEWBIE = [
  { id:'q_open_case', text:'Открой любой кейс машин',   check:s=>s.stats.carCases>=1,       reward:20000 },
  { id:'q_income',    text:'Собери доход с гаража',     check:s=>s.stats.incomeCollected>0, reward:30000 },
  { id:'q_case2',     text:'Открой ещё 2 кейса машин',  check:s=>s.stats.carCases>=3,       reward:40000 },
  { id:'q_partcase',  text:'Открой кейс деталей',       check:s=>s.stats.partCases>=1,      reward:40000 },
  { id:'q_install',   text:'Установи деталь на машину', check:s=>s.stats.installs>=1,       reward:50000 },
  { id:'q_win',       text:'Победи в гонке',            check:s=>s.stats.wins>=1,           reward:60000 },
  { id:'q_merge',     text:'Сслей 3 детали',            check:s=>s.stats.merges>=1,         reward:60000 },
  { id:'q_cars5',     text:'Собери 5 разных машин',     check:s=>Object.keys(s.collection).length>=5, reward:65000 },
  { id:'q_races3',    text:'Проведи 3 гонки',           check:s=>s.stats.races>=3,          reward:50000 },
  { id:'q_museum',    text:'Поставь машину в музей',    check:s=>s.museum.length>=1,        reward:100000 },
];

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg && tg.ready) { tg.ready(); tg.expand(); }
