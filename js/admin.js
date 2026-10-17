// DRIFTZONE — скрытая админ-панель: 7 тапов по заголовку.
// В онлайне команды уходят на /admin (сервер проверяет is_admin), в офлайне — локальные читы для отладки.
'use strict';

const Admin = {
  // активация: 7 тапов по заголовку — обработчик вешает UI.bindAdminTaps()

  open() {
    UI.modal(`
      <h3>🛠 ADMIN</h3>
      <div class="row"><input id="ad-tg" class="input grow" placeholder="telegram_id (пусто = я)">
        <input id="ad-amt" class="input" type="number" placeholder="сумма"></div>
      <div class="row">
        <button class="btn small" data-a="money">+ Деньги</button>
        <button class="btn small" data-a="stars">+ ⭐100</button>
        <button class="btn small" data-a="fuel">Топливо max</button>
        <button class="btn small" data-a="car">Выдать машину</button>
      </div>
      <div class="row"><input id="ad-carid" class="input grow" placeholder="car_id, напр. chiron">
        <button class="btn small" data-a="paintall">Снять NO_PAINT</button></div>
      <div class="row"><input id="ad-promo" class="input grow" placeholder="код промо">
        <button class="btn small" data-a="promo">Создать промо +100K</button></div>
      <hr><button class="btn small sec" data-a="wipe">♻️ Сбросить сохранение</button>`);
    document.querySelectorAll('[data-a]').forEach(b => b.onclick = () => this.exec(b.dataset.a));
  },

  async exec(a) {
    const amt = Number(document.getElementById('ad-amt')?.value || 1000000);
    const tgId = document.getElementById('ad-tg')?.value ||
      ((tg && tg.initDataUnsafe?.user?.id) ? String(tg.initDataUnsafe.user.id) : '');
    if (State.online) {
      try {
        switch (a) {
          case 'money': await API.admin('give_money', { tgId, amount: amt }); break;
          case 'stars': await API.admin('set_stars', { tgId, stars: 100 }); break;
          case 'car':   await API.admin('give_car', { tgId, carId: document.getElementById('ad-carid').value }); break;
          case 'promo': await API.admin('promo_create', { code: document.getElementById('ad-promo').value, money: 100000 }); break;
          default: UI.toast('Недоступно из веба'); return;
        }
        await Game.pullSync(); UI.closeModal(); UI.toast('Готово ✅');
      } catch (e) { UI.toast(errText(e)); }
      return;
    }
    // офлайн-читы (только для отладки, в проде сервер их не примет)
    const d = State.data;
    switch (a) {
      case 'money': State.earn(amt); UI.renderHeader(); break;
      case 'stars': d.stars = (d.stars || 0) + 100; State.save(); break;
      case 'fuel': d.fuel = RACE.fuelMax; d.fuelAt = Date.now(); State.save(); break;
      case 'car': { const id = document.getElementById('ad-carid').value; if (carById(id)) State.addCar(id); break; }
      case 'paintall': window.NO_PAINT = []; break;
      case 'wipe': localStorage.removeItem(CONFIG.SAVE_KEY); location.reload(); return;
    }
    UI.closeModal(); UI.go(UI.current); UI.toast('ADMIN OK');
  },
};
