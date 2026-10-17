// DRIFTZONE — кейсы: экран с большим авто и свечением, честная рулетка ×1/×3/×5.
// Результат определяется логикой ДО анимации (Cases.roll), лента показывает ровно его.
'use strict';

const Cases = {
  count: 1,
  selectedId: 'rust',
  previewCar: null,        // объект CARS для центральной витрины
  _previewTimer: null,
  _spinGuard: false,

  // ===== Ролл результата (единый для ×1 и мульти-открытий) =====
  roll(cs, n) {
    const wins = [];
    for (let i = 0; i < n; i++) wins.push(rollCarFromCase(cs));
    return wins;
  },

  // ===== Экран =====
  render(el) {
    const d = State.data;
    const cats = CASE_CATEGORIES.map(c =>
      `<button class="chip ${c.id === this.selectedId ? 'on' : ''}" data-cat="${c.id}">${c.name}</button>`).join('');
    el.innerHTML = `
      <div class="card" style="padding-bottom:8px">
        <div class="chips">${cats}</div>
        <div class="row between" style="margin-top:6px"><span class="muted small">Дубликаты продаются автоматически</span>
          <button class="btn small sec" id="autoset">Авто-продажа: ${State.autoSellBelow ? 'ниже ' + State.autoSellBelow : 'выкл'}</button></div>
      </div>
      <div class="case-hero card">
        <div class="hero-glow" id="hero-glow"></div>
        <img id="hero-car" src="" alt="">
        <div class="hero-name" id="hero-name"></div>
        <div class="hero-sub"><span class="tag" id="hero-rarity"></span><span class="muted" id="hero-price"></span></div>
        <div class="hero-case" id="hero-case"></div>
      </div>
      <div class="card">
        <div class="row between"><h3>Количество</h3><span class="muted" id="odds-mini"></span></div>
        <div class="row counts" id="counts">${[1, 3, 5].map(n =>
          `<button class="btn small ${n === this.count ? '' : 'sec'}" data-n="${n}">×${n}</button>`).join('')}</div>
        <button class="btn big" id="do-open">Открыть за — ₽</button>
        <div class="muted small" style="margin-top:8px">Баланс: <b id="cases-money" data-money="full">${fmtFull(d.money)} ₽</b> ·
          свободных мест: <b>${Math.max(0, d.garageSlots - d.garage.length)}</b></div>
      </div>
      <div class="card"><h3>Состав кейса</h3><div class="odds-big" id="pool-list"></div></div>`;

    el.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => {
      this.selectedId = b.dataset.cat; this.previewCar = null; UI.go('cases'); UI.haptic('light');
    });
    el.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
      this.count = Number(b.dataset.n);
      el.querySelectorAll('[data-n]').forEach(x => x.classList.toggle('sec', x !== b));
      this._sync(); UI.haptic('light');
    });
    el.querySelector('#do-open').onclick = () => this.open();
    el.querySelector('#autoset').onclick = () => this.autoSellModal();
    this._sync();
    this._startPreview();
  },

  category() {
    return CAR_CASES.filter(c => c.cat === this.selectedId);
  },

  currentCase() {
    const cat = this.category();
    return cat.find(c => c.id === this.selectedId) || cat[0] || CAR_CASES[0];
  },

  // синхронизация витрины/кнопок с выбранным кейсом
  _sync() {
    const cs = this.currentCase();
    const glow = document.getElementById('hero-glow');
    const img = document.getElementById('hero-car');
    if (!glow || !img) return;
    const car = this.previewCar || cs.featured || null;
    const shown = car || this._fallbackFeatured(cs);
    const rc = RARITY[shown.rarity];
    img.src = `img/cars/${shown.id}.webp`;
    img.onerror = () => { img.onerror = null; img.style.display = 'none'; };
    img.style.display = '';
    glow.style.background = `radial-gradient(closest-side, ${rc.color}55, transparent)`;
    document.getElementById('hero-name').textContent = shown.name;
    const hr = document.getElementById('hero-rarity');
    hr.textContent = rc.label; hr.style.background = rc.color;
    document.getElementById('hero-price').textContent = money(shown.price);
    document.getElementById('hero-case').innerHTML =
      `${cs.icon} <b>${cs.name}</b> · ${fmt(cs.price * this.count)} ₽ за ×${this.count}`;
    const btn = document.getElementById('do-open');
    btn.textContent = `Открыть ×${this.count} за ${fmt(cs.price * this.count)} ₽`;
    btn.disabled = State.data.money < cs.price * this.count;
    document.getElementById('odds-mini').innerHTML = Object.entries(cs.pool)
      .map(([r, w]) => `<span style="color:${RARITY[r].color}">${w}%</span>`).join(' ');
    document.getElementById('pool-list').innerHTML = Object.entries(cs.pool).map(([r, w]) => {
      const list = CARS.filter(c => c.rarity === r && (!cs.country || c.country === cs.country) &&
        !Object.values(SECRET_CARS).includes(c.id)).map(c => c.name).slice(0, 6);
      return `<div class="row between pool-row"><span class="tag" style="background:${RARITY[r].color}">${RARITY[r].label} · ${w}%</span>
        <span class="muted small">${list.join(', ')}${CARS.filter(c => c.rarity === r && (!cs.country || c.country === cs.country) && !Object.values(SECRET_CARS).includes(c.id)).length > 6 ? '…' : ''}</span></div>`;
    }).join('');
    const m = document.getElementById('cases-money');
    if (m) m.textContent = fmtFull(State.data.money) + ' ₽';
  },

  // если у кейса нет featured-машины — берём самую дорогую из его пула
  _fallbackFeatured(cs) {
    let best = null;
    for (const [r] of Object.entries(cs.pool)) {
      const cand = CARS.filter(c => c.rarity === r && (!cs.country || c.country === cs.country) &&
        !Object.values(SECRET_CARS).includes(c.id));
      if (cand.length) { const t = cand.reduce((a, b) => a.price > b.price ? a : b); if (!best || t.price > best.price) best = t; }
    }
    return best || CARS[0];
  },

  // превью «крутится» по пулу кейса каждые 2.5 с — чисто визуальный обзор состава
  _startPreview() {
    clearInterval(this._previewTimer);
    this._previewTimer = setInterval(() => {
      if (UI.current !== 'cases' || RouletteFX.busy) return;
      const cs = this.currentCase();
      const pool = RouletteFX.decoPool(cs);
      this.previewCar = pool[Math.floor(Math.random() * pool.length)];
      this._sync();
    }, 2500);
  },

  // ===== Открытие =====
  open() {
    if (RouletteFX.busy || this._spinGuard) return;
    const cs = this.currentCase();
    const n = this.count;
    const total = cs.price * n;
    const d = State.data;

    // онлайн — серверный ролл (сервер источник истины)
    if (State.online) {
      this._spinGuard = true;
      UI.closeModal();
      API.openCarCase(cs.id, n, State.autoSellBelow).then(r => {
        markCaseOpen(cs);
        const cars = r.drops.map(dr => carById(dr.carId)).filter(Boolean);
        RouletteFX.spin(cars, async () => {
          await Game.pullSync();
          this._spinGuard = false;
        });
      }).catch(e => { this._spinGuard = false; UI.toast(errText(e)); });
      return;
    }

    // офлайн: места под дропы нужны, иначе часть машин продастся сразу
    const free = d.garageSlots - d.garage.length;
    if (free < 1) { UI.toast('Гараж полон — продай машины или купи место'); return; }
    if (!State.spend(total)) { UI.toast('Недостаточно денег'); return; }
    window.markCaseOpen(cs);
    d.stats.carCases += n;
    addXp(XP_RULES.carCase * n, 'carCase');

    // 1) результат определяется ЗДЕСЬ, до всякой анимации
    const wins = this.roll(cs, n);
    const kept = wins.slice(0, free);        // влезает в гараж
    const soldWins = wins.slice(free);       // что не влезло — продаём
    State.save();
    UI.renderHeader();

    // 2) анимация показывает ровно эти машины
    this._spinGuard = true;
    UI.haptic('medium');
    RouletteFX.spin(wins, () => {
      this._spinGuard = false;
      let soldMoney = 0;
      for (const w of kept) {
        const isDup = d.garage.some(c => c.carId === w.id);
        const below = State.autoSellBelow && R_ORDER.indexOf(w.rarity) < R_ORDER.indexOf(State.autoSellBelow);
        if (isDup || below) soldMoney += Math.floor(w.price * ECON.sellShare);
        else giveCar(w.id);
      }
      for (const w of soldWins) soldMoney += Math.floor(w.price * ECON.sellShare);
      if (soldMoney) Game.credit(soldMoney, `Дубли проданы +${money(soldMoney)} 💸`);
      checkCollectionRewards(); checkQuests();
      State.save(); UI.renderHeader(); UI.go('garage');
    });
  },

  autoSellModal() {
    UI.modal(`<h3>Авто-продажа</h3><p class="muted">Дубликаты и машины ниже выбранной редкости продаются сразу (12.5% цены).</p>
      <div class="row">${['', 'D', 'C', 'B', 'A', 'S'].map(r =>
        `<button class="btn small ${State.autoSellBelow === (r || null) ? '' : 'sec'}" data-r="${r || ''}">${r || 'выкл'}</button>`).join('')}</div>`);
    document.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
      State.autoSellBelow = b.dataset.r || null; State.save();
      UI.closeModal(); UI.go('cases');
    });
  },
};

UI.register('cases', el => Cases.render(el));
