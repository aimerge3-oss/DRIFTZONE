// DRIFTZONE — гонки: матчмейкинг ±15%, симуляция драг-заезда, награды.
'use strict';

const Races = {
  render(el) {
    const d = State.data;
    State.refreshFuel();
    el.innerHTML = `
      <div class="card">
        <div class="row between"><h3>Дрэг 402 м</h3><span>⛽ ${d.fuel}/${RACE.fuelMax}</span></div>
        <small class="muted">Восстановление: 1 шт / ${RACE.fuelRegenMin} мин</small>
        <div class="row tiers">${RACE.rivals.map(r =>
          `<button class="btn tier" data-tier="${r.id}">${r.name}<br><small>x${r.prizeMul} приз</small></button>`).join('')}</div>
      </div>
      <div class="card"><h3>Статистика</h3>
        Гонки: ${d.stats.races} · Победы: ${d.stats.wins} (${d.stats.races ? Math.round(d.stats.wins / d.stats.races * 100) : 0}%)</div>`;
    el.querySelectorAll('.tier').forEach(b => b.onclick = () => this.start(b.dataset.tier));
  },

  async start(tierId) {
    const d = State.data;
    State.refreshFuel();
    if (d.fuel < 1) { UI.toast('Нет топлива ⛽'); return; }
    const car = d.garage[0];
    if (!car) { UI.toast('Нужна машина в гараже'); return; }

    let result;
    if (State.online) {
      try { result = await API.raceStart(tierId); await Game.pullSync(); }
      catch (e) { UI.toast(errText(e)); return; }
      d.fuel = result.fuelLeft;
    } else {
      d.fuel--; d.fuelAt = Date.now();
      // локальная симуляция по той же формуле, что и сервер
      const myPower = Workshop.statsOf(car).power;
      const tier = RACE.rivals.find(r => r.id === tierId);
      const rivalDef = this.pickRival(myPower, tier);
      const rivalPower = Math.round(myPower * (tier.lo + Math.random() * (tier.hi - tier.lo)));
      const myRoll = myPower * (0.9 + Math.random() * 0.2);
      const rivRoll = rivalPower * (0.9 + Math.random() * 0.2);
      const win = myRoll > rivRoll;
      const basePrize = RACE.prizeByRarity[raceClass(rivalDef.rarity)] ?? 10000;
      result = {
        win, reward: win ? Math.round(basePrize * tier.prizeMul) : Math.round(basePrize * 0.1),
        rival: { carId: rivalDef.id, power: rivalPower }, you: { power: myPower },
      };
      d.stats.races++; if (win) d.stats.wins++;
      State.earn(result.reward); State.save(); UI.renderHeader(); UI.animateMoney(result.reward);
    }
    this.animateRace(car, result);
  },

  pickRival(myPower, tier) {
    // пул машин с Power Score в окне tier (для клиента hp*редкость-вес как на сервере)
    const RW = { D: 1.0, C: 1.6, B: 2.4, A: 3.4, S: 5.0 };
    const lo = myPower * tier.lo, hi = myPower * tier.hi;
    const pool = CARS.filter(c => !Object.values(SECRET_CARS).includes(c.id) &&
      c.hp * RW[c.rarity] >= lo && c.hp * RW[c.rarity] <= hi);
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
    return CARS.filter(c => !Object.values(SECRET_CARS).includes(c.id))
      .sort((a, b) => Math.abs(a.hp - myPower) - Math.abs(b.hp - myPower))[0];
  },

  animateRace(car, result) {
    const scr = document.getElementById('race-screen');
    scr.classList.add('open');
    const you = document.getElementById('race-lane-you'), riv = document.getElementById('race-lane-riv');
    const def = carById(car.carId), rdef = carById(result.rival.carId);
    you.querySelector('.name').textContent = def.name;
    you.querySelector('img').src = `img/cars/${def.id}.webp`;
    riv.querySelector('.name').textContent = rdef.name;
    riv.querySelector('img').src = `img/cars/${rdef.id}.webp`;
    const finish = document.getElementById('race-finish');
    finish.classList.add('hidden'); finish.innerHTML = '';

    // светофор: 3-2-1-GO
    const lights = document.getElementById('traffic');
    let step = 0;
    const seq = ['🟥', '🟨', '🟩 GO!'];
    const tick = setInterval(() => {
      lights.querySelector('.label').textContent = seq[step] || 'GO!';
      if (++step >= 3) { clearInterval(tick); run(); }
    }, 700);

    const run = () => {
      const dur = 3800 + Math.random() * 900;
      const t0 = performance.now();
      const board = scr.querySelector('#race-board .time'), distEl = scr.querySelector('.dist');
      const spd = scr.querySelector('.speedo b');
      const youBar = you.querySelector('.bar i'), rivBar = riv.querySelector('.bar i');
      // заранее решённый исход (серверный или локальный) распределяем по кадрам
      const targetYou = result.win ? 1 : 0.92 + Math.random() * 0.05;
      const targetRiv = result.win ? 0.9 + Math.random() * 0.06 : 1;
      const frame = now => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        youBar.style.width = (targetYou * e * 100) + '%';
        rivBar.style.width = (targetRiv * e * 100) + '%';
        board.textContent = (p * dur / 1000 * 3.2).toFixed(3);
        distEl.textContent = Math.round(RACE.distance * e) + ' м / ' + RACE.distance;
        spd.textContent = Math.round(e * (result.you.power / 2 + 80));
        if (p < 1) requestAnimationFrame(frame);
        else {
          finish.classList.remove('hidden');
          finish.innerHTML = result.win
            ? `<b class="win">🏆 ПОБЕДА!</b> +${fmtFull(result.reward)} ₽`
            : `<b class="lose">Финиш второй</b> утешительные +${fmtFull(result.reward)} ₽`;
          UI.haptic(result.win ? 'heavy' : 'light');
          setTimeout(() => { scr.classList.remove('open'); UI.go('garage'); }, 2500);
        }
      };
      requestAnimationFrame(frame);
    };
  },
};

// Экран 'race' регистрирует js/game.js (нативный движок драга).
// Races.start(tierId) остаётся как серверный API для будущего PvP.
