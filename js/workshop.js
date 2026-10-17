// DRIFTZONE — мастерская: установка/снятие деталей, слияние (merge), апгрейд уровня машины.
'use strict';

const Workshop = {
  selectedCarUid: null,

  // итоговые статы машины: база * уровень(+5%/lvl) * детали (мультипликативно по слотам)
  statsOf(car) {
    const def = carById(car.carId);
    const lvlMul = 1 + ((car.level || 1) - 1) * 0.05;
    let add = 0;
    for (const slotId in (car.parts || {})) {
      const stage = car.parts[slotId];
      const s = PART_SLOTS.find(x => x.id === slotId);
      if (s && stage != null) add += s.bonus * PART_LEVELS[stage].share;
    }
    const hp = Math.round(def.hp * lvlMul * (1 + add));
    return { hp, power: hp };
  },

  render(el) {
    const d = State.data;
    if (!d.garage.length) { el.innerHTML = '<div class="card empty">Нет машин — открой кейс 📦</div>'; return; }
    if (!this.selectedCarUid || !d.garage.some(c => c.uid === this.selectedCarUid))
      this.selectedCarUid = d.garage[0].uid;
    const car = d.garage.find(c => c.uid === this.selectedCarUid);
    const def = carById(car.carId);
    const st = this.statsOf(car);

    el.innerHTML = `
      <div class="card"><h3>Тюнинг</h3>
        <select id="carpick" class="input">${d.garage.map(c =>
          `<option value="${c.uid}" ${c.uid === car.uid ? 'selected' : ''}>${carById(c.carId).name}</option>`).join('')}</select>
        <div class="row between"><b>${def.name}</b><span class="hp">⚡ ${st.hp} л.с.</span></div>
        <div class="slots">${PART_SLOTS.map(s => {
          const stage = (car.parts || {})[s.id];
          return `<div class="slot" data-slot="${s.id}">
            <small>${s.name}</small>
            <div class="slot-val ${stage != null ? 'filled' : ''}">${stage != null ? PART_LEVELS[stage].r + ' · +' + Math.round(s.bonus * PART_LEVELS[stage].share * 100) + '%' : 'пусто'}</div>
          </div>`; }).join('')}
        </div>
        <button class="btn" id="upgrade">Улучшить до ур.${(car.level || 1) + 1} — ${fmt(Math.floor(def.price * 0.08 * (car.level || 1)))} ₽</button>
      </div>
      <div class="card"><h3>Склад деталей</h3><div class="inv" id="inv"></div></div>`;

    el.querySelector('#carpick').onchange = e => { this.selectedCarUid = e.target.value; UI.go('workshop'); };
    el.querySelector('#upgrade').onclick = () => this.upgrade(car);
    el.querySelectorAll('.slot').forEach(sl => sl.onclick = () => this.pickPartModal(car, sl.dataset.slot));

    // инвентарь + merge
    const inv = el.querySelector('#inv');
    const keys = Object.keys(d.inventory).filter(k => d.inventory[k] > 0);
    inv.innerHTML = keys.length ? keys.map(k => {
      const [slot, lvl] = k.split('|');
      const s = PART_SLOTS.find(x => x.id === slot);
      return `<div class="inv-row" data-k="${k}"><span>${s.name} [${PART_LEVELS[lvl].r}]</span><b>×${d.inventory[k]}</b></div>`;
    }).join('') + `<button class="btn small sec" id="merge3">Слить 3 одинаковые → выше стадией</button>`
      : '<div class="empty">Пусто</div>';
    if (keys.length) inv.querySelector('#merge3').onclick = () => this.mergeModal();
  },

  pickPartModal(car, slotId) {
    const d = State.data;
    const avail = Object.entries(d.inventory).filter(([k, n]) => n > 0 && k.startsWith(slotId + '|'));
    if (!avail.length) { UI.toast('Нет деталей этого слота'); return; }
    UI.modal(`<h3>Установить деталь</h3>${avail.map(([k, n]) => {
      const lvl = Number(k.split('|')[1]);
      return `<div class="inv-row" data-pick="${k}"><span>${PART_LEVELS[lvl].r} (${PART_LEVELS[lvl].name}) ×${n}</span><b>→</b></div>`;
    }).join('')}`);
    document.querySelectorAll('[data-pick]').forEach(r => r.onclick = async () => {
      const [slot, lvl] = r.dataset.pick.split('|');
      if (State.online) {
        // сервер требует id конкретной детали со склада (берём из снапшота applyServer)
        const ids = (State.data._serverPartIds || {})[r.dataset.pick];
        if (!ids || !ids.length) { UI.toast('Склад синхронизируется, повтори'); return; }
        try { await API.installPart(ids[0], car.uid.replace(/^s/, ''), slot); await Game.pullSync(); }
        catch (e) { UI.toast(errText(e)); return; }
      } else {
        d.inventory[r.dataset.pick]--;
        car.parts = car.parts || {}; car.parts[slot] = Number(lvl);   // индекс PART_LEVELS (0..4) — как в ядре game.js
        d.stats.installs++; addXp(XP_RULES.installPart, 'installPart'); checkQuests(); State.save(); UI.renderHeader();
      }
      UI.closeModal(); UI.go('workshop'); UI.haptic('light');
    });
  },

  mergeModal() {
    const d = State.data;
    const groups = Object.entries(d.inventory).filter(([k, n]) => n >= 3 && Number(k.split('|')[1]) < 4);
    if (!groups.length) { UI.toast('Нужно 3 одинаковые детали (не S-стадии)'); return; }
    UI.modal(`<h3>Слияние</h3><p class="muted">Шанс успеха: D 100% · C 80% · B 60% · A 40%</p>` +
      groups.map(([k, n]) => {
        const [slot, lvl] = k.split('|');
        return `<div class="inv-row" data-merge="${k}"><span>${PART_SLOTS.find(s => s.id === slot).name} [${PART_LEVELS[lvl].r}] ×${n}</span><b>⬆</b></div>`;
      }).join(''));
    document.querySelectorAll('[data-merge]').forEach(r => r.onclick = () => {
      const [slot, lvl] = r.dataset.merge.split('|');
      const chance = MERGE_CHANCE[PART_LEVELS[lvl].r] ?? 0.5;
      if (State.online) { UI.toast('Слияние на сервере: merge_parts'); return; }
      d.inventory[r.dataset.merge] -= 3;
      d.stats.merges++; addXp(XP_RULES.merge, 'merge');
      if (Math.random() < chance) { d.inventory[slot + '|' + (Number(lvl) + 1)] = (d.inventory[slot + '|' + (Number(lvl) + 1)] || 0) + 1; UI.toast('Слияние удалось! ⬆'); }
      else UI.toast('Не удалось 😞');
      checkQuests(); State.save(); UI.renderHeader(); UI.closeModal(); UI.go('workshop');
    });
  },

  async upgrade(car) {
    const def = carById(car.carId);
    const lvl = car.level || 1;
    if (lvl >= 10) { UI.toast('Максимальный уровень'); return; }
    const cost = Math.floor(def.price * 0.08 * lvl);
    if (State.online) {
      try { await API.upgradeCar(car.uid.replace(/^s/, '')); await Game.pullSync(); }
      catch (e) { UI.toast(errText(e)); }
      return;
    }
    if (!State.spend(cost)) { UI.toast('Недостаточно денег'); return; }
    car.level = lvl + 1; State.save(); UI.renderHeader();
    UI.toast(`Улучшено до ур.${car.level}! −${fmt(cost)} ₽`); UI.go('workshop');
  },
};

UI.register('workshop', el => Workshop.render(el));
