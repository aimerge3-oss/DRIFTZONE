// DRIFTZONE — профиль: уровень/опыт, ежедневная награда, квесты, промокоды.
'use strict';

const Profile = {
  render(el) {
    const d = State.data;
    const need = xpNeed(d.level);
    const today = new Date().toISOString().slice(0, 10);
    const dailyReady = d.daily.lastDay !== today;

    el.innerHTML = `
      <div class="card">
        <div class="row between"><h3>${(tg && tg.initDataUnsafe?.user?.first_name) || 'Гонщик'}</h3>
          <span>Ур. ${d.level}</span></div>
        <div class="xpbar"><i style="width:${Math.min(100, d.xp / need * 100)}%"></i></div>
        <small class="muted">${d.xp}/${need} XP · ⭐ ${d.stars || 0}</small>
      </div>
      <div class="card">
        <button class="btn ${dailyReady ? '' : 'sec'}" id="daily" ${dailyReady ? '' : 'disabled'}>
          📅 Ежедневная награда ${dailyReady ? '— доступна!' : '— уже получена'}</button>
        ${dailyReady ? `<small class="muted">Серия: ${d.daily.streak + 1} дн.</small>` : ''}
      </div>
      <div class="card"><h3>Квесты</h3><div id="quests"></div></div>
      <div class="card"><h3>Промокод</h3>
        <div class="row"><input id="promo" class="input grow" placeholder="DRIFT2026" maxlength="32">
        <button class="btn" id="redeem">OK</button></div></div>
      <div class="card muted small">DRIFTZONE v${CONFIG.VERSION} · ${State.online ? '🟢 онлайн' : '🟡 офлайн-режим'}</div>`;

    const qWrap = el.querySelector('#quests');
    qWrap.innerHTML = QUESTS_NEWBIE.map(q => {
      const done = q.check(d), claimed = d.questsDone[q.id];
      return `<div class="quest ${claimed ? 'claimed' : done ? 'ready' : ''}" data-q="${q.id}">
        <span>${q.text}</span><b>${claimed ? '✅' : done ? fmtFull(q.reward) + ' ₽ →' : fmt(q.reward) + ' ₽'}</b></div>`;
    }).join('');
    qWrap.querySelectorAll('[data-q]').forEach(x => x.onclick = () => this.claimQuest(x.dataset.q));

    el.querySelector('#daily').onclick = () => this.claimDaily();
    el.querySelector('#redeem').onclick = () => this.redeemPromo();
  },

  async claimDaily() {
    const d = State.data;
    const today = new Date().toISOString().slice(0, 10);
    if (State.online) {
      try { const r = await API.claimDaily(); UI.toast('+' + fmt(r.reward) + ' ₽'); await Game.pullSync(); }
      catch (e) { UI.toast(errText(e)); }
      return;
    }
    if (d.daily.lastDay === today) { UI.toast('Уже получено'); return; }
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    d.daily.streak = d.daily.lastDay === y ? d.daily.streak + 1 : 0;
    d.daily.lastDay = today;
    const reward = ECON.dailyBonus[d.daily.streak % ECON.dailyBonus.length];
    if (reward.money) State.earn(reward.money);
    if (reward.parts) for (let i = 0; i < reward.parts[1]; i++) Cases.openPartLocal && Cases.openPartLocal(reward.parts[0]);
    State.save(); UI.toast('Награда получена 🎁'); UI.go('profile');
  },

  claimQuest(id) {
    const d = State.data;
    const q = QUESTS_NEWBIE.find(x => x.id === id);
    if (!q || !q.check(d) || d.questsDone[id]) return;
    d.questsDone[id] = true; State.earn(q.reward);
    d.xp += XP_RULES.questMin; State.save();
    UI.toast('Квест выполнен: +' + fmt(q.reward) + ' ₽'); UI.go('profile');
  },

  async redeemPromo() {
    const code = document.getElementById('promo').value.trim();
    if (!code) return;
    if (State.online) {
      try { const r = await API.redeemPromo(code); UI.toast('Промокод: +' + fmt(r.reward.money || 0) + ' ₽'); await Game.pullSync(); }
      catch (e) { UI.toast(errText(e)); }
      return;
    }
    // офлайн: локальные коды (в проде проверяются только сервером!)
    const LOCAL = { 'DRIFT2026': 100000, 'START': 50000 };
    if (LOCAL[code.toUpperCase()]) {
      if (State.data.promoUsed && State.data.promoUsed[code]) { UI.toast('Уже использован'); return; }
      State.data.promoUsed = State.data.promoUsed || {}; State.data.promoUsed[code] = true;
      State.earn(LOCAL[code.toUpperCase()]); UI.toast('+' + fmt(LOCAL[code]) + ' ₽');
    } else UI.toast('Код не найден (в онлайне проверка на сервере)');
    UI.go('profile');
  },
};

UI.register('profile', el => Profile.render(el));
