// DRIFTZONE — гараж: пассивный доход, слоты, продажа, покраска, музей.
'use strict';

const Garage = {
  // накопленный доход машины (локальная оценка; в онлайне финализирует сервер)
  incomeOf(car) {
    const def = carById(car.carId);
    if (!def) return 0;
    const elapsed = Math.min((Date.now() - (car.incomeAt || Date.now())) / 3600000, ECON.incomeCapHours);
    return Math.floor(def.price * ECON.incomePerHour * elapsed * (1 + ((car.level || 1) - 1) * 0.05));
  },

  totalPending() { return State.data.garage.reduce((a, c) => a + this.incomeOf(c), 0); },

  async collectAll() {
    if (State.online) {
      try {
        const r = await API.collectIncome();
        UI.toast('+' + fmt(r.collected) + ' ₽');
        await Game.pullSync();
      } catch (e) { UI.toast(errText(e)); }
      return;
    }
    const sum = this.totalPending();
    if (sum <= 0) { UI.toast('Пока пусто ⏳'); return; }
    State.earn(sum);
    State.data.stats.incomeCollected += sum;
    for (const c of State.data.garage) c.incomeAt = Date.now();
    State.save();
    UI.toast('+' + fmt(sum) + ' ₽');
    UI.go('garage');
  },

  render(el) {
    const d = State.data;
    const pending = this.totalPending();
    el.innerHTML = `
      <div class="card income-card">
        <div>Доход гаража: <b>${fmt(pending)} ₽</b> <small>(кап ${ECON.incomeCapHours}ч)</small></div>
        <button class="btn" id="collect">Забрать всё</button>
      </div>
      <div class="grid cars-grid">${d.garage.length ? '' : '<div class="empty">Гараж пуст — открой кейс 📦</div>'}</div>`;
    const grid = el.querySelector('.cars-grid');
    for (const car of d.garage) {
      const def = carById(car.carId);
      if (!def) continue;
      const inc = this.incomeOf(car);
      const card = document.createElement('div');
      card.className = 'car-card';
      card.innerHTML = `
        <img src="img/cars/${def.id}.webp" alt="${def.name}" loading="lazy"
             style="${car.paint ? `filter:hue-rotate(0deg)` : ''}">
        <div class="rarity" style="color:${RARITY[def.rarity].color}">${RARITY[def.rarity].label}</div>
        <div class="name">${def.name} <small>ур.${car.level || 1}</small></div>
        <div class="inc">+${fmt(inc)} ₽</div>
        <div class="row">
          <button class="btn small act-sell">Продать ${fmt(State.sellValue(car))}₽</button>
          <button class="btn small sec act-paint">🎨</button>
        </div>`;
      if (car.paint) card.querySelector('img').style.filter = `drop-shadow(0 0 6px ${car.paint})`;
      card.querySelector('.act-sell').onclick = () => this.sell(car.uid);
      card.querySelector('.act-paint').onclick = () => this.paintModal(car.uid);
      grid.appendChild(card);
    }
    el.querySelector('#collect').onclick = () => this.collectAll();
  },

  async sell(uid) {
    const car = State.data.garage.find(c => c.uid === uid);
    if (!car) return;
    const price = State.sellValue(car);
    if (!confirm(`Продать ${carById(car.carId).name} за ${fmtFull(price)} ₽?`)) return;
    if (State.online) {
      try { await API.sellCar(uid.replace(/^s/, '')); await Game.pullSync(); UI.toast('Продано 💰'); return; }
      catch (e) { UI.toast(errText(e)); return; }
    }
    State.earn(price); State.removeCar(uid);
    UI.toast('Продано 💰'); UI.go('garage');
  },

  paintModal(uid) {
    if (!PAINT_ENABLED) { UI.toast('Покраска временно недоступна'); return; }
    const car = State.data.garage.find(c => c.uid === uid);
    const def = carById(car.carId);
    if (NO_PAINT.includes(def.id)) { UI.toast('Эту машину нельзя красить'); return; }
    const cost = Math.max(ECON.paintMin, Math.floor(def.price * ECON.paintShare));
    UI.modal(`
      <h3>Покраска ${def.name}</h3><p class="muted">Стоимость: ${fmtFull(cost)} ₽</p>
      <div class="paint-grid">${PAINT_COLORS.map(([hex, name]) =>
        `<button class="swatch" data-hex="${hex}" title="${name}" style="background:${hex}"></button>`).join('')}
        <button class="swatch reset" data-hex="">✕</button></div>`);
    document.querySelectorAll('.swatch').forEach(s => s.onclick = async () => {
      const hex = s.dataset.hex;
      if (State.online && hex) {
        try { await API.paintCar(uid.replace(/^s/, ''), hex); await Game.pullSync(); }
        catch (e) { UI.toast(errText(e)); return; }
      } else if (State.online) {
        // снятие покраски: сервер хранит цвет в color_hex — чистим тем же paint_car в null не умеем,
        // поэтому просто снимаем локально и перерисовываем (сервер обновится при следующем sync-переопределении)
        car.paint = null; State.save();
      } else {
        if (!State.spend(cost)) { UI.toast('Недостаточно денег'); return; }
        car.paint = hex || null; State.save();
      }
      UI.closeModal(); UI.go('garage'); UI.toast(hex ? 'Покрашено 🎨' : 'Покраска снята');
    });
  },
};

UI.register('garage', el => Garage.render(el));
