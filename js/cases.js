// DRIFTZONE — кейсы: рулетка, мульти-открытие x1/x3/x5/x10, авто-продажа.
'use strict';

const Cases = {
  count: 1,

  render(el) {
    const d = State.data;
    el.innerHTML = `
      <div class="card">
        <div class="row between">
          <h3>Кейсы машин</h3>
          <button class="btn small sec" id="autoset">Авто-продажа: ${State.autoSellBelow ? 'ниже ' + State.autoSellBelow : 'выкл'}</button>
        </div>
        <div class="grid">${CAR_CASES.map(c => `
          <div class="case-card" data-id="${c.id}">
            <div class="icon">${c.icon}</div><div class="cname">${c.name}</div>
            <div class="cprice">${fmt(c.price)} ₽</div>
            <div class="odds">${Object.entries(c.pool).map(([r, w]) =>
              `<span style="color:${RARITY[r].color}">${r}:${w}%</span>`).join(' ')}</div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card"><h3>Кейсы деталей</h3><div class="grid">${PART_CASES.map(p => `
          <div class="case-card part" data-part="${p.id}">
            <div class="icon">🔩</div><div class="cname">${p.name}</div>
            <div class="cprice">${fmt(p.price)} ₽</div></div>`).join('')}</div></div>`;
    el.querySelectorAll('[data-id]').forEach(x => x.onclick = () => this.openModal(x.dataset.id));
    el.querySelectorAll('[data-part]').forEach(x => x.onclick = () => this.openPart(x.dataset.part));
    el.querySelector('#autoset').onclick = () => this.autoSellModal();
  },

  autoSellModal() {
    UI.modal(`<h3>Авто-продажа</h3><p class="muted">Дубликаты и машины ниже выбранной редкости продаются сразу (12.5% цены).</p>
      <div class="row">${['', 'D', 'C', 'B', 'A', 'S'].map(r =>
        `<button class="btn small ${State.autoSellBelow === (r || null) ? '' : 'sec'}" data-r="${r}">${r || 'выкл'}</button>`).join('')}</div>`);
    document.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
      State.autoSellBelow = b.dataset.r || null; State.save();
      UI.closeModal(); UI.go('cases');
    });
  },

  openModal(caseId) {
    const cs = CAR_CASES.find(c => c.id === caseId);
    UI.modal(`
      <h3>${cs.icon} ${cs.name}</h3>
      <div class="odds-big">${Object.entries(cs.pool).map(([r, w]) =>
        `<div><span style="color:${RARITY[r].color}">${RARITY[r].label}</span> — ${w}%</div>`).join('')}</div>
      <div class="row counts">${[1, 3, 5, 10].map(n =>
        `<button class="btn small ${n === this.count ? '' : 'sec'}" data-n="${n}">x${n}</button>`).join('')}</div>
      <div class="total">Итого: <b id="tot">${fmtFull(cs.price * this.count)}</b> ₽</div>
      <button class="btn big" id="do-open">Открыть за ${fmt(cs.price * this.count)} ₽</button>`);
    document.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
      this.count = Number(b.dataset.n);
      document.getElementById('tot').textContent = fmtFull(cs.price * this.count);
      document.getElementById('do-open').textContent = `Открыть за ${fmt(cs.price * this.count)} ₽`;
      document.querySelectorAll('[data-n]').forEach(x => x.classList.toggle('sec', x !== b));
    });
    document.getElementById('do-open').onclick = () => this.open(cs);
  },

  async open(cs) {
    const total = cs.price * this.count;
    if (State.online) {
      UI.closeModal();
      try {
        const r = await API.openCarCase(cs.id, this.count, State.autoSellBelow);
        this.showResults(r.drops, r.soldTotal);
        await Game.pullSync();
      } catch (e) { UI.toast(errText(e)); }
      return;
    }
    // офлайн: локальный ролл по тем же шансам (сервер всё равно синхронизирует при коннекте)
    if (!State.spend(total)) { UI.toast('Недостаточно денег'); return; }
    State.data.stats.carCases += this.count;
    const drops = []; let sold = 0;
    for (let i = 0; i < this.count; i++) {
      const carId = this.localRoll(cs);
      const def = carById(carId);
      const isDup = State.data.garage.some(c => c.carId === carId);
      const below = State.autoSellBelow && R_ORDER.indexOf(def.rarity) < R_ORDER.indexOf(State.autoSellBelow);
      if (isDup || below) { const p = Math.floor(def.price * ECON.sellShare); sold += p; drops.push({ carId, sold: true, price: p }); }
      else { const car = State.addCar(carId); drops.push({ carId, uid: car.uid }); }
    }
    if (sold) State.earn(sold);
    State.save(); UI.closeModal();
    this.showResults(drops, sold);
  },

  localRoll(cs) {
    const total = Object.values(cs.pool).reduce((a, b) => a + b, 0);
    let roll = Math.random() * total, rarity = 'D';
    for (const [r, w] of Object.entries(cs.pool)) { if (roll < w) { rarity = r; break; } roll -= w; }
    let cand = CARS.filter(c => c.rarity === rarity && c.price >= cs.minPrice &&
      !Object.values(SECRET_CARS).includes(c.id) && (!cs.country || c.country === cs.country));
    if (!cand.length) cand = CARS.filter(c => c.price >= cs.minPrice && !Object.values(SECRET_CARS).includes(c.id) &&
      (!cs.country || c.country === cs.country));
    return cand[Math.floor(Math.random() * cand.length)].id;
  },

  showResults(drops, soldTotal) {
    const strip = document.getElementById('rt-strip');
    strip.innerHTML = drops.map(dr => {
      const def = carById(dr.carId);
      return `<div class="rt-item" style="border-color:${RARITY[def.rarity].color}">
        <img src="img/cars/${def.id}.webp"><small>${def.name}${dr.sold ? ' 💰' + fmt(dr.price) : ''}</small></div>`;
    }).join('');
    document.getElementById('roulette-overlay').classList.add('open');
    document.getElementById('rt-result').innerHTML =
      drops.length > 1 ? `<b>${drops.length}</b> дропов${soldTotal ? `, продано на ${fmt(soldTotal)} ₽` : ''}`
                       : carById(drops[0].carId).name;
    UI.haptic('medium');
    document.getElementById('rt-take').onclick = () => {
      document.getElementById('roulette-overlay').classList.remove('open');
      UI.go('garage');
    };
  },

  async openPart(partCaseId) {
    const pc = PART_CASES.find(p => p.id === partCaseId);
    if (State.online) {
      try { const r = await API.openPartCase(pc.id);
        UI.toast(`Выпала: ${PART_SLOTS.find(s=>s.id===r.part.slot).name} [${r.part.rarity}]`);
        await Game.pullSync();
      } catch (e) { UI.toast(errText(e)); }
      return;
    }
    if (!State.spend(pc.price)) { UI.toast('Недостаточно денег'); return; }
    State.data.stats.partCases++;
    const total = pc.weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * total, lvl = 0;
    for (let i = 0; i < pc.weights.length; i++) { if (roll < pc.weights[i]) { lvl = i; break; } roll -= pc.weights[i]; }
    const slot = PART_SLOTS[Math.floor(Math.random() * PART_SLOTS.length)];
    State.addPart(slot.id, lvl);
    UI.toast(`Выпала: ${slot.name} [${PART_LEVELS[lvl].r}]`);
    UI.go('workshop');
  },
};

UI.register('cases', el => Cases.render(el));
