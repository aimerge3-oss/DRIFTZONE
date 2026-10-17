// DRIFTZONE — реферальная система и друзья (Telegram share + t.startparam).
'use strict';

const Friends = {
  // ссылка приглашения: bot username из Telegram WebApp, fallback — локальный бот
  inviteLink() {
    const bot = (tg && tg.initDataUnsafe && tg.initDataUnsafe.bot_username) || 'driftzone_bot';
    const myId = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) || 'me';
    return `https://t.me/${bot}?start=ref_${myId}`;
  },

  render(el) {
    el.innerHTML = `
      <div class="card">
        <h3>👥 Друзья и рефералы</h3>
        <p class="muted small">Пригласи друга — получишь 100 000 ₽, когда он выиграет первую гонку.</p>
        <button class="btn" id="share">📣 Пригласить</button>
        <div class="row between"><span>Приглашено:</span><b>${(State.data.referrals || []).length}</b></div>
        <div id="reflist">${(State.data.referrals || []).map(r => `<div class="inv-row"><span>@${r}</span><b>—</b></div>`).join('')}</div>
      </div>`;
    el.querySelector('#share').onclick = () => {
      const link = this.inviteLink();
      if (tg && tg.openTelegramLink) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Заезжай в DRIFTZONE — гонки, кейсы, тачки!')}`);
      } else {
        navigator.clipboard && navigator.clipboard.writeText(link);
        UI.toast('Ссылка скопирована');
      }
    };
  },

  // вызывается при старте: разбираем startapp-параметр ref_<id>
  captureReferral() {
    try {
      const params = new URLSearchParams(location.search);
      const startParam = (tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param) || params.get('startapp') || '';
      if (/^ref_\d+$/.test(startParam)) State.data.myReferrer = startParam.slice(4);
    } catch {}
  },
};

UI.register('friends', el => Friends.render(el));
