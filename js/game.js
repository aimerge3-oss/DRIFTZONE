// DROPZONE: AUTO — логика, UI, кейсы-рулетка, экономика, гонки
'use strict';

const $ = s => document.querySelector(s);
const fmt = n => {
  if (n >= 1e9) return (n/1e9).toFixed(n%1e9?1:0).replace('.',',') + ' млрд';
  if (n >= 1e6) return (n/1e6).toFixed(n%1e6?1:0).replace('.',',') + ' млн';
  if (n >= 1e4) return Math.round(n/1e3) + 'К';
  return new Intl.NumberFormat('ru-RU').format(Math.floor(n));
};
const money = n => fmt(n) + ' ₽';
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rnd = (a,b) => a + Math.random()*(b-a);
const pickW = arr => { const t=arr.reduce((s,x)=>s+x.w,0); let r=Math.random()*t; for(const x of arr){ r-=x.w; if(r<=0) return x; } return arr[arr.length-1]; };

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>t.classList.remove('show'), 2400);
}
function haptic(type){ try{ tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(type||'light'); }catch(e){} }

const carImg = carId => `<img class="car-img" src="img/cars/${carId}.webp" alt="" loading="lazy" onerror="this.outerHTML='<div class=&quot;silhouette&quot;>🚗</div>'">`;
const rarityTag = r => `<span class="tag" style="background:${RARITY[r].color}">${r}</span>`;

// ===== Характеристики =====
function tunedHp(entry) {
  const car = carById(entry.carId);
  let mul = 1;
  for (const slot of PART_SLOTS) {
    const lvl = entry.parts && entry.parts[slot.id];
    if (lvl != null) mul += slot.bonus * PART_LEVELS[lvl].share;
  }
  return Math.round(car.hp * mul);
}
function carValue(entry) {
  const car = carById(entry.carId);
  let v = car.price;
  for (const slot of PART_SLOTS) {
    const lvl = entry.parts && entry.parts[slot.id];
    if (lvl != null) v += PART_LEVELS[lvl].price;
  }
  return v;
}

// ===== Доход =====
function pendingIncome() {
  const cap = ECON.incomeCapHours * 3600e3;
  let sum = 0;
  for (const e of State.data.garage) {
    if (State.data.museum.includes(e.uid)) continue; // в музее не копится
    const dt = Math.min(Date.now() - (e.incomeAt||Date.now()), cap);
    sum += carValue(e) * ECON.incomePerHour * (dt/3600e3);
  }
  sum *= 1 + 0.01 * State.data.museum.length; // витрина: +1% за машину
  return Math.floor(sum);
}
function collectIncome() {
  const inc = pendingIncome();
  if (inc <= 0) { toast('Дохода пока нет'); return; }
  State.data.money += inc;
  State.data.stats.incomeCollected += inc;
  for (const e of State.data.garage) e.incomeAt = Date.now();
  State.save(); refreshHeader(); renderTab(); checkCollectionRewards();
  toast('+' + money(inc) + ' доход 🚗');
}

// ===== XP =====
function addXp(n, kind) {
  const d = State.data;
  const today = new Date().toISOString().slice(0,10);
  if (d.xpDay.date !== today) d.xpDay = { date: today, total: 0 };
  const farmKinds = ['carCase','partCase','merge','installPart'];
  let add = n;
  if (farmKinds.includes(kind)) {
    add = Math.min(n, Math.max(0, XP_RULES.dailyCap - d.xpDay.total));
    d.xpDay.total += add;
  }
  d.xp += add;
  while (d.xp >= xpNeed(d.level)) {
    d.xp -= xpNeed(d.level); d.level++;
    const gift = levelGift(d.level); d.money += gift;
    toast(`Уровень ${d.level}! Подарок ${money(gift)} 🎉`);
  }
  State.save(); renderHeaderAvatar();
}

// ===== Выдача =====
function giveCar(carId, silent) {
  const d = State.data;
  const isNew = !d.collection[carId];
  d.collection[carId] = true;
  if (isNew) addXp(XP_RULES.newCar);
  if (!silent && !State.garageFree()) {
    const v = Math.floor(carById(carId).price * ECON.sellShare);
    d.money += v; State.save();
    toast(`Гараж полон — ${carById(carId).name} продана за ${money(v)}`);
    return null;
  }
  const entry = { uid: State.newUid(), carId, parts:{}, paint:null, incomeAt: Date.now() };
  d.garage.push(entry);
  if (!d.carFuel[entry.uid]) d.carFuel[entry.uid] = { fuel: RACE.fuelPerCar, at: Date.now() };
  State.save(); return entry;
}
function givePart(slotId, lvlIdx) {
  const key = slotId + '|' + lvlIdx;
  State.data.inventory[key] = (State.data.inventory[key]||0) + 1;
  State.save();
}
function partName(key) {
  const [slot, lvl] = key.split('|');
  return PART_SLOTS.find(s=>s.id===slot).name + ' · ' + PART_LEVELS[+lvl].name;
}

// ===== Рулетка =====
const Roulette = { busy:false };
function showRoulette(decoHtmlList, winHtml, resultHtml, onDone) {
  if (Roulette.busy) return; Roulette.busy = true;
  const ov = $('#roulette-overlay'), strip = $('#rt-strip');
  const N = 32, WIN = 26;
  let html = '';
  for (let i=0;i<N;i++) html += `<div class="rt-item">${i===WIN ? winHtml : decoHtmlList[i % decoHtmlList.length]}</div>`;
  strip.innerHTML = html;
  strip.style.transition = 'none'; strip.style.transform = 'translateX(0)';
  ov.classList.add('show'); $('#rt-result').classList.remove('show');
  requestAnimationFrame(()=>{
    const itemW = 118;
    const target = -(WIN*itemW - (ov.clientWidth/2 - itemW/2)) + rnd(-35,35);
    strip.style.transition = 'transform 4.2s cubic-bezier(.12,.68,.16,1)';
    strip.style.transform = `translateX(${target}px)`;
  });
  setTimeout(()=>{
    Roulette.busy = false;
    $('#rt-result').innerHTML = resultHtml;
    $('#rt-result').classList.add('show');
    $('#rt-take').onclick = () => { ov.classList.remove('show'); onDone && onDone(); };
    haptic('heavy');
  }, 4400);
}
const rtCarHtml = car => `${carImg(car.id)}${rarityTag(car.rarity)}<div class="muted" style="font-size:11px">${esc(car.name)}</div>`;

const SECRET_IDS = Object.values(SECRET_CARS); // секретки не дропают из кейсов
function rollCarCaseItem(cs) {
  const pool = CARS.filter(c => !SECRET_IDS.includes(c.id) && (cs.pool[c.rarity]||0) > 0 &&
    (!cs.country || c.country===cs.country) && c.price >= cs.minPrice);
  const byR = {};
  for (const c of pool) (byR[c.rarity] ||= []).push(c);
  const entries = Object.keys(byR).filter(r=>cs.pool[r]).map(r=>({r, w:cs.pool[r]}));
  if (!entries.length) return pool[Math.floor(Math.random()*pool.length)] || CARS[0];
  const chosen = pickW(entries);
  const list = byR[chosen.r];
  return list[Math.floor(Math.random()*list.length)];
}

function openCarCase(caseId) {
  if (Roulette.busy) return;
  const cs = CAR_CASES.find(c=>c.id===caseId);
  const d = State.data;
  if (!State.spend(cs.price)) { toast('Недостаточно денег'); return; }
  d.stats.carCases++; addXp(XP_RULES.carCase,'carCase');
  const win = rollCarCaseItem(cs);
  const deco = [];
  for (let i=0;i<8;i++) deco.push(rtCarHtml(CARS[Math.floor(Math.random()*CARS.length)]));
  State.save();
  showRoulette(deco, rtCarHtml(win),
    `<div class="big">${rarityTag(win.rarity)} ${esc(win.name)}</div><div class="muted">${money(win.price)}</div>`,
    ()=>{
      const e = giveCar(win.id);
      checkCollectionRewards();
      State.save(); refreshHeader(); renderTab();
      if (e) toast(`${win.name} в гараже! 🚗`);
    });
}

// ===== Кейсы деталей =====
function rollPart(caseDef, slotFilter) {
  const slot = slotFilter || PART_SLOTS[Math.floor(Math.random()*PART_SLOTS.length)].id;
  const lvls = caseDef.weights.map((w,i)=>({i,w})).filter(x=>x.w>0);
  const chosen = pickW(lvls);
  return { slot, lvl: chosen.i };
}
function openPartCase(caseId, count, slotFilter) {
  const d = State.data;
  const pc = PART_CASES.find(c=>c.id===caseId);
  const now = Date.now();
  if (now - d.lastPartCaseAt < 10000) { toast('Кейсы деталей — не чаще раза в 10 секунд'); return; }
  if (pc.topOnly && slotFilter) { toast('«Заводской тюнинг» — только случайная деталь'); return; }
  const total = Math.floor(pc.price * (slotFilter?1.15:1) * count);
  if (!State.spend(total)) { toast('Недостаточно денег'); return; }
  d.lastPartCaseAt = now; d.stats.partCases += count;
  addXp(XP_RULES.partCase*count,'partCase');
  const results = [];
  for (let i=0;i<count;i++) results.push(rollPart(pc, slotFilter));
  State.save();
  // рулетка с деталями
  const rtPartHtml = r => `<div style="font-size:26px">🔧</div><div style="font-weight:800;color:${RARITY[PART_LEVELS[r.lvl].r].color}">${PART_LEVELS[r.lvl].name}</div><div class="muted" style="font-size:10px">${esc(PART_SLOTS.find(x=>x.id===r.slot).name)}</div>`;
  const deco = [];
  for (let i=0;i<8;i++) deco.push(rtPartHtml(rollPart(pc)));
  const resHtml = results.map(r=>`<div>${rarityTag(PART_LEVELS[r.lvl].r)} ${esc(partName(r.slot+'|'+r.lvl))}</div>`).join('');
  showRoulette(deco, rtPartHtml(results[0]), resHtml,
    ()=>{ for (const r of results) givePart(r.slot, r.lvl); refreshHeader(); renderTab(); toast('Детали на складе 🔧'); });
  haptic('medium');
}

// ===== Продажа =====
function sellCar(uid) {
  const d = State.data;
  const idx = d.garage.findIndex(e=>e.uid===uid);
  if (idx<0) return;
  const e = d.garage[idx];
  const car = carById(e.carId);
  if (SECRET_CARS[car.country] === car.id && d.questsDone['claim_'+car.country]) {
    toast('Секретные машины не продаются'); return;
  }
  const v = Math.floor(carValue(e)*ECON.sellShare);
  d.garage.splice(idx,1); delete d.carFuel[uid];
  d.museum = d.museum.filter(u=>u!==uid);
  d.money += v; State.save(); closeModal(); refreshHeader(); renderTab();
  toast(`Продано за ${money(v)} 💸`);
}
function sellPart(key) {
  const inv = State.data.inventory;
  if (!inv[key]) return;
  const lvl = +key.split('|')[1];
  const v = Math.floor(PART_LEVELS[lvl].price * ECON.sellShare);
  inv[key]--; if (!inv[key]) delete inv[key];
  State.data.money += v; State.save(); refreshHeader(); renderTab();
  toast(`${partName(key)} → +${money(v)}`);
}

// ===== Слияние =====
function mergeParts(key) {
  const d = State.data;
  const [slot,lvlS] = key.split('|'); const lvl = +lvlS;
  if (lvl >= 4) { toast('Выше Elite нет'); return; }
  if ((d.inventory[key]||0) < 3) { toast('Нужно 3 одинаковые детали'); return; }
  const chance = MERGE_CHANCE[PART_LEVELS[lvl].r];
  d.inventory[key] -= 3; if (!d.inventory[key]) delete d.inventory[key];
  d.stats.merges++; addXp(XP_RULES.merge,'merge');
  if (Math.random() < chance) { givePart(slot, lvl+1); toast(`✨ Успех! ${partName(slot+'|'+(lvl+1))}`); haptic('heavy'); }
  else { toast('💥 Неудача — все 3 детали сгорели'); haptic('error'); }
  State.save(); refreshHeader(); renderTab();
}

// ===== Установка деталей =====
function canInstall(entry, lvlIdx) {
  const car = carById(entry.carId);
  return lvlIdx >= R_ORDER.indexOf(raceClass(car.rarity));
}
function removePart(uid, slotId, quiet) {
  const d = State.data;
  const e = d.garage.find(x=>x.uid===uid); if(!e || e.parts[slotId]==null) return false;
  if (d.museum.includes(uid)) { if(!quiet) toast('Машина в музее — нельзя снимать'); return false; }
  if (!quiet && Date.now()-d.lastRemoveAt < 20*60e3) { toast('Перерыв 20 минут после снятия детали'); return false; }
  if (!quiet) d.lastRemoveAt = Date.now();
  givePart(slotId+'|'+e.parts[slotId]);
  delete e.parts[slotId];
  State.save(); return true;
}
function installPart(uid, slotId, key) {
  const d = State.data;
  const e = d.garage.find(x=>x.uid===uid); if(!e) return;
  if (d.museum.includes(uid)) { toast('Машина в музее — нельзя тюнинговать'); return; }
  const lvl = +key.split('|')[1];
  if (!canInstall(e, lvl)) { toast('Детали ниже класса машины не ставятся'); return; }
  if (!(d.inventory[key]>0)) return;
  removePart(uid, slotId, true); // старая на склад
  d.inventory[key]--; if(!d.inventory[key]) delete d.inventory[key];
  e.parts[slotId] = lvl;
  d.stats.installs++; addXp(XP_RULES.installPart,'installPart');
  State.save(); closeModal(); openCarCard(uid); refreshHeader(); renderTab();
  toast('Деталь установлена 🔧');
}
function pickPartFor(uid, slotId) {
  const d = State.data; const e = d.garage.find(x=>x.uid===uid);
  const opts = Object.keys(d.inventory).filter(k=>k.startsWith(slotId+'|') && d.inventory[k]>0 && canInstall(e, +k.split('|')[1]));
  if (!opts.length) { toast('На складе нет подходящих деталей'); return; }
  openModal(`<h3>${PART_SLOTS.find(s=>s.id===slotId).name}</h3>` + opts.sort().map(k=>
    `<div class="card row"><div class="grow"><b style="color:${RARITY[PART_LEVELS[+k.split('|')[1]].r].color}">${partName(k)}</b><div class="muted">есть: ${d.inventory[k]}</div></div>
     <button class="btn small" onclick="installPart(${uid},'${slotId}','${k}')">Ставить</button></div>`).join(''));
}

// ===== Покраска (CSS-тонирование фото) =====
function paintCost(e) { return Math.max(ECON.paintMin, Math.floor(carById(e.carId).price*ECON.paintShare)); }
function doPaint(uid, color) {
  const d = State.data; const e = d.garage.find(x=>x.uid===uid); if(!e) return;
  if (NO_PAINT.includes(e.carId)) { toast('Эту машину нельзя красить'); return; }
  if (color===null || color==='null') { e.paint=null; State.save(); openCarCard(uid); renderTab(); toast('Заводской цвет'); return; }
  const c = paintCost(e);
  if (!State.spend(c)) { toast('Недостаточно денег'); return; }
  e.paint = color; State.save(); openCarCard(uid); renderTab(); refreshHeader(); toast('Покрашено! 🎨');
}
function openPaint(uid) {
  const sw = PAINT_COLORS.map(([c,n])=>`<span title="${n}" class="swatch" style="background:${c}" onclick="doPaint(${uid},'${c}')"></span>`).join('');
  openModal(`<h3>🎨 Покраска</h3><div>${sw}</div>
    <div class="btns" style="margin-top:12px"><button class="btn sec" onclick="doPaint(${uid},null)">Вернуть заводской (бесплатно)</button></div>`);
}

// ===== Музей =====
function museumCap() { return ECON.museumSlots + (State.data.museumExtra||0); }
function toMuseum(uid) {
  const d = State.data;
  if (d.museum.length >= museumCap()) { toast('Витрина полна — купи место'); return; }
  if (!d.museum.includes(uid)) d.museum.push(uid);
  State.save(); closeModal(); renderTab(); toast('Машина в музее 🏛️');
}
function fromMuseum(uid) {
  State.data.museum = State.data.museum.filter(u=>u!==uid);
  State.save(); closeModal(); renderTab(); toast('Машина вернулась в гараж');
}
function buyMuseumSlot() {
  const d = State.data;
  const extra = d.museumExtra||0;
  if (ECON.museumSlots+extra >= ECON.museumMax) { toast('Максимум 20 мест'); return; }
  const price = ECON.museumPrice * Math.pow(2, extra);
  if (!State.spend(price)) { toast('Недостаточно денег'); return; }
  d.museumExtra = extra+1; State.save(); renderTab(); refreshHeader(); toast('+1 место в музее');
}

// ===== Места в гараже =====
function buyGarageSlot() {
  const d = State.data;
  if (d.garageSlots >= ECON.garageMax) { toast('Максимум 30 мест'); return; }
  const price = State.slotPrice(d.garageSlots+1);
  if (!State.spend(price)) { toast('Недостаточно денег'); return; }
  d.garageSlots++; State.save(); refreshHeader(); renderTab(); toast('+1 место в гараже 🏠');
}

// ===== Коллекция =====
function collectionCount() { return Object.keys(State.data.collection).length; }
function countryProgress(country) {
  const all = CARS.filter(c=>c.country===country && !SECRET_IDS.includes(c.id));
  const got = all.filter(c=>State.data.collection[c.id]).length;
  return { got, total: all.length, done: got===all.length };
}
function checkCollectionRewards() {
  const d = State.data;
  for (const rw of ECON.collectionRewards) {
    const k = 'col_'+rw.n;
    if (!d.questsDone[k] && collectionCount() >= rw.n) {
      d.questsDone[k] = true; d.money += rw.money;
      if (rw.slot) d.garageSlots = Math.min(ECON.garageMax, d.garageSlots + rw.slot);
      toast(`Коллекция ${rw.n}: +${money(rw.money)}${rw.slot?' +'+rw.slot+' мест':''} 🏆`);
    }
  }
  for (const co in ECON.countryRewards) {
    const k = 'ctry_'+co;
    if (!d.questsDone[k] && countryProgress(co).done) {
      d.questsDone[k] = true;
      toast(`Полная коллекция ${co.toUpperCase()}! Награда в разделе Коллекция ⭐`);
    }
  }
  State.save();
}
function claimCountryReward(co) {
  const d = State.data;
  if (d.questsDone['claim_'+co] || !d.questsDone['ctry_'+co]) return;
  if (!State.garageFree()) { toast('Гараж полон — освободи место'); return; }
  d.questsDone['claim_'+co] = true;
  d.money += ECON.countryRewards[co];
  giveCar(SECRET_CARS[co]);
  toast(`Секретка ${carById(SECRET_CARS[co]).name} + ${money(ECON.countryRewards[co])} ⭐`);
  State.save(); refreshHeader(); renderTab();
}

// ===== Ежедневка и кейс наград =====
const dayStr = () => new Date().toISOString().slice(0,10);
function dailyAvailable() { return State.data.daily.lastDay !== dayStr(); }
function claimDaily() {
  const d = State.data;
  if (!dailyAvailable()) return;
  const yesterday = new Date(Date.now()-864e5).toISOString().slice(0,10);
  d.daily.streak = (d.daily.lastDay === yesterday) ? Math.min(d.daily.streak+1, 7) : 1;
  d.daily.lastDay = dayStr();
  const b = ECON.dailyBonus[d.daily.streak-1];
  const parts = [];
  let msg = `День ${d.daily.streak}: `;
  if (b.money) { d.money += b.money; msg += money(b.money); }
  if (b.carCase) { const cs=CAR_CASES.find(c=>c.id===b.carCase); const w=rollCarCaseItem(cs); giveCar(w.id); msg += (msg.endsWith(': ')?'':' + ')+w.name; }
  if (b.parts) {
    const pc = PART_CASES.find(c=>c.id===b.parts[0]);
    for (let i=0;i<b.parts[1];i++) { const r=rollPart(pc); parts.push(r); givePart(r.slot,r.lvl); }
    msg += (msg.endsWith(': ')?'':' + ')+`${b.parts[1]} детал.`;
  }
  addXp(XP_RULES.daily);
  State.save(); refreshHeader(); renderTab(); updateGiftDot(); checkCollectionRewards();
  toast('🎁 ' + msg);
}
function rewardReady() { return Date.now() - State.data.rewardCaseAt >= ECON.rewardCaseHours*3600e3; }
function rewardCdText() {
  const left = ECON.rewardCaseHours*3600e3 - (Date.now() - State.data.rewardCaseAt);
  const h = Math.floor(left/3600e3), m = Math.floor(left%3600e3/60e3);
  return `${h}ч ${m}м`;
}
function openRewardCase() {
  const d = State.data;
  if (!rewardReady()) { toast('Кейс наград будет готов через ' + rewardCdText()); return; }
  d.rewardCaseAt = Date.now();
  const r = pickW(ECON.rewardCase);
  if (r.type==='money') { const inc = Math.max(20000, pendingIncome()); d.money += inc; toast('🎁 Кейс наград: ' + money(inc)); }
  else if (r.type==='part') { const p = rollPart(PART_CASES[1]); givePart(p.slot,p.lvl); toast('🎁 Кейс наград: ' + partName(p.slot+'|'+p.lvl)); }
  else if (r.type==='fuel') { d.fuel = RACE.fuelMax; toast('🎁 Кейс наград: полный бак ⛽'); }
  else { const w = rollCarCaseItem(CAR_CASES[1]); giveCar(w.id); toast('🎁 Кейс наград: ' + w.name); }
  checkCollectionRewards();
  State.save(); refreshHeader(); renderTab(); updateGiftDot();
}
function updateGiftDot() {
  const g = $('.gift-btn'); if (g) g.classList.toggle('has', dailyAvailable() || rewardReady());
}
function openRewards() {
  const d = State.data;
  const rows = ECON.dailyBonus.map((b,i)=>{
    let txt = b.money ? money(b.money) : '';
    if (b.carCase) txt += (txt?', ':'') + CAR_CASES.find(c=>c.id===b.carCase).name + ' кейс';
    if (b.parts) txt += (txt?', ':'') + b.parts[1] + ' детал.';
    const taken = d.daily.streak > i && d.daily.lastDay === dayStr() || (i < (d.daily.streak||0));
    return `<div class="stat-line"><span>День ${i+1}</span><span>${txt} ${i+1===(d.daily.streak||0)&&d.daily.lastDay===dayStr()?'✅':''}</span></div>`;
  }).join('');
  openModal(`<h3>🎁 Награды</h3>
    <button class="btn" style="width:100%;margin-bottom:10px" ${dailyAvailable()?'':'disabled'} onclick="claimDaily()">Ежедневный бонус${d.daily.streak?` (серия ${d.daily.streak})`:''}</button>
    <button class="btn sec" style="width:100%;margin-bottom:10px" ${rewardReady()?'':'disabled'} onclick="openRewardCase()">
      ${rewardReady()?'Открыть кейс наград':'Кейс наград: '+rewardCdText()}</button>
    <div class="muted" style="margin-bottom:6px">Кейс наград каждые 4 часа: деньги 50%, деталь Ателье 25%, полный бак 15%, машина Городского 10%</div>
    ${rows}`);
}

// ===== Топливо =====
function regenFuel() {
  const d = State.data; const now = Date.now();
  const add = Math.floor((now - d.fuelAt)/(RACE.fuelRegenMin*60e3));
  if (add>0) { d.fuel = Math.min(RACE.fuelMax, d.fuel+add); d.fuelAt += add*RACE.fuelRegenMin*60e3; State.save(); }
  for (const e of d.garage) {
    const cf = d.carFuel[e.uid]; if(!cf) continue;
    const a = Math.floor((now-cf.at)/(RACE.fuelRegenMin*60e3));
    if (a>0) { cf.fuel = Math.min(RACE.fuelPerCar, cf.fuel+a); cf.at += a*RACE.fuelRegenMin*60e3; State.save(); }
  }
}

// ===== Задания =====
function activeQuest() {
  const d = State.data;
  for (const q of QUESTS_NEWBIE) if (!d.questsDone[q.id]) return q;
  return null;
}
function checkQuests() {
  const d = State.data;
  const q = activeQuest();
  if (q && q.check(d)) {
    d.questsDone[q.id] = true; d.money += q.reward;
    addXp(50);
    toast(`Задание: ${q.text} +${money(q.reward)} ✅`);
  }
  State.save();
}

// ===== Модалки =====
function openModal(html) { $('#modal-body').innerHTML = html; $('#modal').classList.add('show'); }
function closeModal() { $('#modal').classList.remove('show'); }

function openProfile() {
  const d = State.data;
  const need = xpNeed(d.level);
  openModal(`<h3>Профиль</h3>
    <div class="stat-line"><span>Уровень</span><b>${d.level}</b></div>
    <div class="stat-line"><span>Опыт</span><b>${d.xp} / ${need}</b></div>
    <div class="progress" style="margin:6px 0 12px"><i style="width:${100*d.xp/need}%"></i></div>
    <div class="stat-line"><span>Машин в коллекции</span><b>${collectionCount()}</b></div>
    <div class="stat-line"><span>Гонок проведено</span><b>${d.stats.races}</b></div>
    <div class="stat-line"><span>Побед</span><b>${d.stats.wins}</b></div>
    <div class="stat-line"><span>Всего заработано</span><b>${money(d.stats.moneyEarned)}</b></div>
    <div class="stat-line"><span>Потрачено</span><b>${money(d.stats.spent)}</b></div>
    <div class="muted" style="margin-top:10px">За каждый уровень — денежный подарок. Опыт фармится кейсами до 300/день.</div>`);
}

// ===== ГОНКИ =====
function viewRace() {
  const d = State.data;
  let html = `<div class="card row"><div class="grow"><b>⛽ Общий бак</b><div class="muted">${d.fuel}/${RACE.fuelMax} • +1 каждые ${RACE.fuelRegenMin} мин</div></div>
    <div class="progress" style="width:40%"><i style="width:${100*d.fuel/RACE.fuelMax}%"></i></div></div>`;
  html += '<h2 class="sec">Выбери машину</h2>';
  if (!d.garage.length) html += '<div class="empty-hint">Нет машин для гонок</div>';
  for (const e of d.garage) {
    const car = carById(e.carId);
    const cls = raceClass(car.rarity);
    const cf = d.carFuel[e.uid] || {fuel:0};
    const prize = RACE.prizeByRarity[cls];
    html += `<div class="card"><div class="row"><div class="grow">
        ${rarityTag(cls)} <b>${esc(car.name)}</b>
        <div class="muted">${tunedHp(e)} л.с. • ⛽ ${cf.fuel}/${RACE.fuelPerCar} • приз ${money(prize)}</div></div>
      </div>
      <div class="btns" style="margin-top:8px">
        ${RACE.rivals.map(rv=>`<button class="btn small ${rv.id==='mid'?'sec':''}" onclick="startRace(${e.uid},'${rv.id}')">${rv.name}</button>`).join('')}
      </div>
      <div class="muted" style="font-size:11px;margin-top:4px">Взнос 30% приза — сгорает при проигрыше. Лёгкий ×0.5, Средний ×1, Сложный ×2 к призу.</div></div>`;
  }
  return html;
}

function startRace(uid, rivalId) {
  const d = State.data;
  const e = d.garage.find(x=>x.uid===uid); if(!e) return;
  if (d.museum.includes(uid)) { toast('Машина в музее'); return; }
  const car = carById(e.carId);
  const cls = raceClass(car.rarity);
  const rv = RACE.rivals.find(r=>r.id===rivalId);
  const prize = Math.floor(RACE.prizeByRarity[cls]*rv.prizeMul);
  const fee = Math.floor(prize*RACE.entryFee);
  const cf = d.carFuel[uid] || (d.carFuel[uid]={fuel:0,at:Date.now()});
  if (cf.fuel < 1) { toast('Мало топлива у машины (+1 каждые 20 мин)'); return; }
  if (d.fuel < 1) { toast('Общий бак пуст (+1 каждые 20 мин)'); return; }
  if (d.money < fee) { toast('Недостаточно денег на взнос ('+money(fee)+')'); return; }
  d.money -= fee; d.stats.spent += fee;
  cf.fuel--; d.fuel--;
  d.stats.races++; addXp(XP_RULES.race);

  // соперник
  const myHp = Math.round(tunedHp(e) * (1 + rnd(-RACE.luck, RACE.luck)));
  const rivalHp = Math.round(car.hp * rnd(rv.lo, rv.hi));
  const rivalPrize = Math.floor(prize * rnd(0.7, 1.3));

  const scr = $('#race-screen');
  scr.classList.add('show');
  $('#race-lane-you .name').textContent = `${car.name} — ${myHp} л.с.`;
  $('#race-lane-you img').src = `img/cars/${car.id}.webp`;
  const rc = CARS[Math.floor(Math.random()*CARS.length)];
  $('#race-lane-riv .name').textContent = `Соперник — ${rivalHp} л.с.`;
  $('#race-lane-riv img').src = `img/cars/${rc.id}.webp`;
  $('#race-board .time').textContent = '0.000';
  $('#race-board .dist').textContent = '0 м / 402';
  $('#traffic').classList.remove('go'); $('#traffic .label').textContent = 'Готовьсь...';
  $('#race-finish').classList.add('hidden');

  const hpPerTenth = Math.sqrt(myHp) * 0.55;
  const tenthTime = 1.6 * Math.sqrt(RACE.weight/10/hpPerTenth);
  const totalT = tenthTime*10;
  const dist = t => RACE.distance * Math.min(1, Math.pow(t/totalT, 0.72));
  const speed = t => Math.min(360, 360*Math.pow(t/totalT,0.5));
  const laneW = scr.clientWidth - 140;

  const rivalK = rnd(0.97, 1.03);
  let start = null, raf;
  function frame(ts) {
    if (!start) start = ts;
    const t = (ts-start)/1000;
    const yd = dist(t), rd = dist(t*rivalK);
    $('#race-lane-you img').style.transform = `translateX(${yd/RACE.distance*laneW}px)`;
    $('#race-lane-riv img').style.transform = `translateX(${rd/RACE.distance*laneW}px)`;
    $('#race-lane-you .bar i').style.width = (100*yd/RACE.distance)+'%';
    $('#race-lane-riv .bar i').style.width = (100*rd/RACE.distance)+'%';
    $('#race-board .time').textContent = Math.min(t,totalT).toFixed(3);
    $('#race-board .dist').textContent = Math.floor(yd) + ' м / 402';
    $('.speedo b').textContent = Math.floor(speed(t));
    if (yd >= RACE.distance || rd >= RACE.distance) { finishRace(); return; }
    raf = requestAnimationFrame(frame);
  }
  function finishRace() {
    cancelAnimationFrame(raf);
    const win = myHp >= rivalHp;

    d.stats.wins += win?1:0;
    if (win) { d.money += prize; addXp(XP_RULES.raceWin); }
    State.save(); checkQuests(); refreshHeader();
    $('#race-finish').classList.remove('hidden');
    $('#race-finish').innerHTML = win
      ? `<div class="big" style="color:#4ade80">ПОБЕДА! +${money(prize)}<br>${myHp} vs ${rivalHp} л.с.</div>`
      : `<div class="big" style="color:#f87171">Поражение. Взнос сгорел (${money(fee)})</div>
         <div class="muted">${myHp} vs ${rivalHp} л.с. — соперник был быстрее</div>`;
    $('#race-finish').insertAdjacentHTML('beforeend',
      `<button class="btn" onclick="closeRace()">Забрать</button>`);
    $('#race-finish')._result = { win, prize, rivalPrize };
  }
  window._raceFrame = frame;
  setTimeout(()=>{
    $('#traffic').classList.add('go'); $('#traffic .label').textContent = 'ПОЕХАЛИ!';
    raf = requestAnimationFrame(t=>window._raceFrame && frame(t));
  }, 1500);
}
function closeRace() { $('#race-screen').classList.remove('show'); window._raceFrame=null; renderTab(); }

// ===== Рендер табов =====
let curTab = 'garage';
window._shopTab = 'cases';
const TABS = [ ['garage','🏠','Гараж'], ['cases','📦','Кейсы'], ['shop','🔧','Мастерская'], ['race','🏁','Гонки'], ['collect','⭐','Коллекция'] ];

function renderTab() {
  const m = $('#main');
  if (curTab==='garage') m.innerHTML = viewGarage();
  else if (curTab==='cases') m.innerHTML = viewCases();
  else if (curTab==='shop') m.innerHTML = viewShop();
  else if (curTab==='race') m.innerHTML = viewRace();
  else m.innerHTML = viewCollection();
  checkQuests();
}

function viewGarage() {
  const d = State.data;
  const inc = pendingIncome();
  let html = `<div class="card row"><div class="grow"><div class="big">Доход: ${money(inc)}</div>
    <div class="muted">3%/час • до 4 ч • Гараж ${d.garage.length}/${d.garageSlots}</div></div>
    <button class="btn" onclick="collectIncome()">Забрать</button></div>`;
  if (!d.garage.length) html += `<div class="empty-hint">Гараж пуст.<br>Открой кейс машин во вкладке «Кейсы» 👇</div>`;
  for (const e of d.garage) {
    const car = carById(e.carId);
    const inMus = d.museum.includes(e.uid);
    const bgStyle = e.paint ? `style="border-radius:12px;background:radial-gradient(ellipse at center, ${e.paint}44 30%, transparent 72%)"` : '';
    html += `<div class="card">
      <div class="row"><div class="grow">${rarityTag(car.rarity)} <b>${esc(car.name)}</b>${inMus?' 🏛️':''}
        <div class="muted">${tunedHp(e)} л.с. • ${money(carValue(e))} • ${money(Math.floor(carValue(e)*ECON.incomePerHour))}/ч</div></div>
        <button class="btn small sec" onclick="openCarCard(${e.uid})">Открыть</button></div>
      <div ${bgStyle}>${carImg(e.carId)}</div></div>`;
  }
  if (d.garageSlots < ECON.garageMax)
    html += `<button class="btn sec" style="width:100%" onclick="buyGarageSlot()">+1 место в гараже — ${money(State.slotPrice(d.garageSlots+1))}</button>`;
  return html;
}

function openCarCard(uid) {
  const d = State.data; const e = d.garage.find(x=>x.uid===uid); if(!e) return;
  const car = carById(e.carId);
  const inMus = d.museum.includes(uid);
  const isSecret = SECRET_CARS[car.country]===car.id && d.questsDone['claim_'+car.country];
  let slots = '';
  for (const s of PART_SLOTS) {
    const lvl = e.parts[s.id];
    slots += `<div class="slot ${lvl==null?'empty':''}" onclick="${lvl==null?`pickPartFor(${uid},'${s.id}')`:`removePart(${uid},'${s.id}');openCarCard(${uid})`}">
      <div>${s.name}</div><div class="lvl" style="color:${lvl==null?'inherit':RARITY[PART_LEVELS[lvl].r].color}">${lvl==null?'—':PART_LEVELS[lvl].name}</div></div>`;
  }
  const bgStyle = e.paint ? `style="border-radius:12px;background:radial-gradient(ellipse at center, ${e.paint}55 30%, transparent 72%)"` : '';
  openModal(`
    <h3>${isSecret?'⭐ ':rarityTag(car.rarity)} ${esc(car.name)}</h3>
    <div ${bgStyle}>${carImg(e.carId)}</div>
    <div class="muted">${car.brand} • ${car.country.toUpperCase()} • сток ${car.hp} л.с.</div>
    <div class="big">Тюнинг: ${tunedHp(e)} л.с. • Цена: ${money(carValue(e))}</div>
    <div class="slots">${slots}</div>
    <div class="btns">
      ${PAINT_ENABLED && !NO_PAINT.includes(e.carId) && !inMus ? `<button class="btn sec" onclick="openPaint(${uid})">🎨 Покраска (${money(paintCost(e))})</button>`:''}
      ${inMus ? `<button class="btn sec" onclick="fromMuseum(${uid})">← Из музея</button>`
              : `<button class="btn sec" onclick="toMuseum(${uid})">🏛️ В музей</button>`}
      ${!isSecret && !inMus ? `<button class="btn danger" onclick="sellCar(${uid})">Продать ${money(Math.floor(carValue(e)*ECON.sellShare))}</button>`:''}
    </div>
    <div class="muted" style="margin-top:8px">Ставятся детали не ниже класса ${raceClass(car.rarity)}. Снятие — перерыв 20 мин. В музее: +1% дохода за штуку, но доход не копится.</div>
  `);
}

function viewCases() {
  let html = '<h2 class="sec">Кейсы машин</h2><div class="grid2">';
  for (const cs of CAR_CASES) {
    html += `<div class="card case-card" onclick="openCarCase('${cs.id}')">
      <div style="font-size:34px">${cs.icon}</div><b>${cs.name}</b>
      <div class="muted">${money(cs.price)}</div></div>`;
  }
  html += '</div><div class="muted" style="margin-top:8px">Из кейса не может выпасть машина дешевле половины его цены.</div>';
  return html;
}

function viewShop() {
  const d = State.data;
  const tab = window._shopTab;
  let html = `<div class="btns" style="margin-bottom:10px">
    <button class="btn ${tab==='cases'?'':'sec'}" onclick="_shopTab='cases';renderTab()">Кейсы деталей</button>
    <button class="btn ${tab==='stock'?'':'sec'}" onclick="_shopTab='stock';renderTab()">Склад (${Object.values(d.inventory).reduce((a,b)=>a+b,0)})</button></div>`;
  if (tab==='cases') {
    for (const pc of PART_CASES) {
      html += `<div class="card"><b>${pc.name}</b> — ${money(pc.price)}
        <div class="muted">Целевая деталь +15%${pc.topOnly?' (только случайная)':''}</div>
        <div class="btns" style="margin-top:8px">
          ${[1,3,5,10].map(n=>`<button class="btn small ${n===1?'':'sec'}" onclick="openPartCase('${pc.id}',${n})">×${n}</button>`).join('')}
        </div>
        <div class="btns" style="margin-top:6px">${PART_SLOTS.map(s=>`<button class="btn small sec" style="font-size:11px" onclick="openPartCase('${pc.id}',1,'${s.id}')">${s.name}</button>`).join('')}</div>
      </div>`;
    }
  } else {
    const keys = Object.keys(d.inventory).filter(k=>d.inventory[k]>0);
    if (!keys.length) html += '<div class="empty-hint">Склад пуст. Открой кейсы деталей! 🔧</div>';
    const groups = {};
    for (const k of keys) { const s=k.split('|')[0]; (groups[s] ||= []).push(k); }
    for (const s of PART_SLOTS.filter(x=>groups[x.id])) {
      html += `<h2 class="sec">${s.name}</h2>`;
      for (const k of groups[s.id].sort()) {
        const lvl = +k.split('|')[1];
        html += `<div class="card row"><div class="grow"><b style="color:${RARITY[PART_LEVELS[lvl].r].color}">${partName(k)}</b> ×${d.inventory[k]}
          <div class="muted">${money(PART_LEVELS[lvl].price)} • шанс слияния ${Math.round(MERGE_CHANCE[PART_LEVELS[lvl].r]*100)}%</div></div>
          <div class="btns"><button class="btn small" onclick="mergeParts('${k}')">Слить ×3</button>
          <button class="btn small sec" onclick="sellPart('${k}')">Продать</button></div></div>`;
      }
    }
  }
  return html;
}

function viewCollection() {
  const d = State.data;
  let html = `<div class="card"><div class="big">Коллекция: ${collectionCount()}/${CARS.length}</div>
    <div class="progress" style="margin-top:6px"><i style="width:${100*collectionCount()/CARS.length}%"></i></div></div>`;
  html += '<h2 class="sec">Награды за количество</h2>';
  for (const rw of ECON.collectionRewards) {
    html += `<div class="card row"><div class="grow">${d.questsDone['col_'+rw.n]?'✅':'⬜'} ${rw.n} машин — ${money(rw.money)}${rw.slot?' +'+rw.slot+' мест':''}</div></div>`;
  }
  html += '<h2 class="sec">Страны</h2>';
  for (const co of ['ru','jp','de','it','us']) {
    const p = countryProgress(co);
    const claimed = d.questsDone['claim_'+co];
    html += `<div class="card"><div class="row"><div class="grow"><b>${co.toUpperCase()}</b> ${p.got}/${p.total}
      <div class="progress" style="margin-top:6px"><i style="width:${100*p.got/p.total}%"></i></div></div>
      ${p.done && !claimed ? `<button class="btn small" onclick="claimCountryReward('${co}')">Забрать ⭐</button>`:''}
      ${claimed ? '✅':''}</div>
      <div class="muted">Награда: ${money(ECON.countryRewards[co])} + ${carById(SECRET_CARS[co]).name}</div></div>`;
  }
  html += `<h2 class="sec">Музей 🏛️ (${d.museum.length}/${museumCap()})</h2>`;
  if (d.museum.length) {
    html += `<div class="card muted">Бонус витрины: +${d.museum.length}% к общему доходу гаража. Машины на витрине не тюнинговатся, не продаются и не копят доход.</div>`;
    html += `<div class="grid2">${d.museum.map(uid=>{
      const e = State.data.garage.find(x=>x.uid===uid); if(!e) return '';
      return `<div class="card case-card" onclick="openCarCard(${uid})">${carImg(e.carId)}<div class="muted" style="font-size:11px">${esc(carById(e.carId).name)}</div></div>`;
    }).join('')}</div>`;
  }
  if (museumCap() < ECON.museumMax)
    html += `<button class="btn sec" style="width:100%" onclick="buyMuseumSlot()">+1 место в музее — ${money(ECON.museumPrice*Math.pow(2,d.museumExtra||0))}</button>`;
  return html;
}

// ===== Инициализация =====
function initTabs() {
  const nav = $('#nav');
  nav.innerHTML = TABS.map(([id,ico,label])=>
    `<button data-tab="${id}" class="${id===curTab?'active':''}"><span class="ico">${ico}</span>${label}</button>`).join('');
  nav.querySelectorAll('button').forEach(b=>b.onclick=()=>{
    curTab = b.dataset.tab;
    nav.querySelectorAll('button').forEach(x=>x.classList.toggle('active', x===b));
    renderTab(); haptic('light');
  });
}
function refreshHeader() { $('#hdr-money').textContent = money(State.data.money); renderHeaderAvatar(); updateGiftDot(); }
function renderHeaderAvatar() {
  const d = State.data;
  const pct = Math.min(1, d.xp/xpNeed(d.level));
  const R=16, C=2*Math.PI*R;
  $('#hdr-avatar').innerHTML = `
    <svg viewBox="0 0 38 38">
      <circle cx="19" cy="19" r="${R}" fill="none" stroke="var(--line)" stroke-width="3"/>
      <circle cx="19" cy="19" r="${R}" fill="none" stroke="var(--accent)" stroke-width="3"
        stroke-dasharray="${C*pct} ${C}" stroke-linecap="round" transform="rotate(-90 19 19)"/>
      <path d="M9 24 Q19 7 29 24 Z" fill="var(--hint)" opacity=".5"/>
    </svg>
    <span class="lvl-badge">${d.level}</span>`;
}

window.addEventListener('DOMContentLoaded', ()=>{
  State.load();
  regenFuel();
  initTabs();
  refreshHeader();
  renderTab();
  setInterval(()=>{ regenFuel(); if(curTab==='garage'||curTab==='race') renderTab(); updateGiftDot(); }, 30000);
  $('#hdr-money').onclick = collectIncome;
  $('#hdr-avatar').onclick = openProfile;
  $('.gift-btn').onclick = openRewards;
  $('#modal-close').onclick = closeModal;
  $('#modal').addEventListener('click', e=>{ if(e.target.id==='modal') closeModal(); });
  if (tg && tg.onCloudData) tg.onCloudData(raw=>{
    try {
      const obj = JSON.parse(raw && raw.text ? raw.text : raw);
      const remote = obj && obj[State.key];
      if (remote && remote.garage && (!State.data.uidSeq || remote.uidSeq > State.data.uidSeq)) {
        State.data = Object.assign(State.fresh(), remote); State.save(); refreshHeader(); renderTab();
      }
    } catch(e){}
  });
  if (dailyAvailable()) setTimeout(openRewards, 500);
});
