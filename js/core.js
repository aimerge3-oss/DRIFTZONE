// DRIFTZONE — ядро офлайн-режима: единый ролл дропа, честная рулетка, корректный баланс.
// Здесь живёт ОДИН источник правды для выпадения машин (Cases.roll) и одна точка
// обновления баланса (UI.renderHeader + Game.credit). Модули экранов только вызывают их.
'use strict';

// ===== Единый ролл машины по кейсу =====
// Возвращает объект машины из CARS. Шансы rarity берутся из cs.pool и суммируются в 100%
// (проверка qa_check.mjs). Секретные машины не дропаются.
function rollCarFromCase(cs) {
  const secret = Object.values(SECRET_CARS);
  // кандидаты на каждую редкость с учётом страны и минимальной цены кейса
  const byR = {};
  for (const [r] of Object.entries(cs.pool)) {
    let cand = CARS.filter(c => c.rarity === r && !secret.includes(c.id) &&
      (!cs.country || c.country === cs.country) && c.price >= cs.minPrice);
    if (!cand.length) cand = CARS.filter(c => c.rarity === r && !secret.includes(c.id) &&
      (!cs.country || c.country === cs.country));
    if (cand.length) byR[r] = cand;
  }
  const entries = Object.entries(cs.pool)
    .filter(([r, w]) => w > 0 && byR[r])
    .map(([r, w]) => ({ r, w }));
  if (!entries.length) return CARS[0];
  const totalW = entries.reduce((a, e) => a + e.w, 0);
  let roll = Math.random() * totalW, chosen = entries[entries.length - 1];
  for (const e of entries) { roll -= e.w; if (roll <= 0) { chosen = e; break; } }
  const list = byR[chosen.r];
  return list[Math.floor(Math.random() * list.length)];
}

// ===== Начисление денег с анимацией счётчика =====
// Единственная точка «заработал» для офлайна: обновляет баланс, статистику, шапку.
Game.credit = function (n, label) {
  if (!(n > 0)) return;
  State.earn(n);
  UI.animateMoney(n);
  if (label) UI.toast(label);
};

// ===== Честная рулетка =====
// Лента строится ПОСЛЕ определения результата: выигрышный предмет стоит ровно
// под маркером остановки (с малым смещением, но не шире половины карточки),
// поэтому показываемая машина ВСЕГДА совпадает с реально выданной.
const RouletteFX = {
  busy: false,
  ITEM_W: 118,   // ширина карточки 110 + поля 2×4
  N: 32,         // всего карточек в ленте
  WIN: 26,       // индекс выигрышной карточки

  itemHtml(car) {
    const rc = RARITY[car.rarity];
    return `<div class="rt-item" style="border-color:${rc.color}">
        <img src="img/cars/${car.id}.webp" alt="${car.name}" onerror="this.outerHTML='<div class=&quot;silhouette&quot;>🚗</div>'">
        <span class="tag" style="background:${rc.color}">${car.rarity}</span>
        <div class="muted rt-name">${car.name}</div></div>`;
  },

  decoPool(cs) {
    // декорации берём из пула того же кейса — лента выглядит честно
    const secret = Object.values(SECRET_CARS);
    let pool = CARS.filter(c => (cs.pool[c.rarity] || 0) > 0 && !secret.includes(c.id) &&
      (!cs.country || c.country === cs.country));
    if (!pool.length) pool = CARS.filter(c => !secret.includes(c.id));
    return pool;
  },

  // winners — массив объектов CARS (уже определённых игровой логикой ДО прокрутки)
  spin(winners, onDone) {
    if (this.busy) return false;
    this.busy = true;
    const ov = document.getElementById('roulette-overlay');
    const strip = document.getElementById('rt-strip');
    const res = document.getElementById('rt-result');
    const takeBtn = document.getElementById('rt-take');
    res.classList.remove('show'); res.innerHTML = '';
    takeBtn.classList.add('hidden');

    const win = winners[0]; // показываем ровно ПЕРВЫЙ выигрыш — он же и главный результат
    const pool = this.decoPool(CURRENT_CASE_DEF());
    let html = '';
    for (let i = 0; i < this.N; i++) {
      if (i === this.WIN) html += this.itemHtml(win);
      else html += this.itemHtml(pool[Math.floor(Math.random() * pool.length)]);
    }
    strip.innerHTML = html;
    strip.style.transition = 'none';
    strip.style.transform = 'translateX(0)';
    ov.classList.add('show');

    requestAnimationFrame(() => requestAnimationFrame(() => {
      // точная остановка: центр карточки WIN под маркером + небольшой честный разброс
      const jitter = (Math.random() - 0.5) * (this.ITEM_W - 34);
      const target = -(this.WIN * this.ITEM_W - (ov.clientWidth / 2 - this.ITEM_W / 2)) + jitter;
      strip.style.transition = 'transform 4.2s cubic-bezier(.12,.68,.16,1)';
      strip.style.transform = `translateX(${target}px)`;
    }));

    setTimeout(() => {
      this.busy = false;
      // главный результат — тот же автомобиль, что остановился под маркером (winners[0])
      const main = winners[0];
      const mrc = RARITY[main.rarity];
      res.innerHTML = `<div class="drop-line drop-main" style="border-color:${mrc.color}">
          <span class="tag" style="background:${mrc.color}">${mrc.label}</span>
          <b>${main.name}</b><span class="muted">${fmt(main.price)} ₽</span></div>` +
        winners.slice(1).map(w => {
          const rc = RARITY[w.rarity];
          return `<div class="drop-line"><span class="tag" style="background:${rc.color}">${rc.label}</span>
            <b>${w.name}</b><span class="muted">${fmt(w.price)} ₽</span></div>`;
        }).join('') +
        (winners.length > 1 ? `<div class="muted" style="margin-top:4px">Итого ${winners.length} шт.</div>` : '');
      res.classList.add('show');
      takeBtn.classList.remove('hidden');
      takeBtn.onclick = () => {
        ov.classList.remove('show');
        onDone && onDone();
      };
      UI.haptic('heavy');
    }, 4400);
    return true;
  },
};

// последний открытый кейс — чтобы декор ленты брался из того же кейса
let _lastCase = CAR_CASES[0];
const CURRENT_CASE_DEF = () => _lastCase;
window.markCaseOpen = cs => { _lastCase = cs; };
