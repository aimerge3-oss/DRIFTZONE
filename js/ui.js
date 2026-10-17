// DRIFTZONE — форматирование денег по-русски: 1,2 млн / 350К / 12 345.
// Числа в интерфейсе (шапка, доход, кейсы) используются отсюда.
'use strict';

const fmt = n => {
  if (n >= 1e9) return (n/1e9).toFixed(n%1e9?1:0).replace('.',',') + ' млрд';
  if (n >= 1e6) return (n/1e6).toFixed(n%1e6?1:0).replace('.',',') + ' млн';
  if (n >= 1e4) return Math.round(n/1e3) + 'К';
  return new Intl.NumberFormat('ru-RU').format(Math.floor(n));
};
const money = n => fmt(n) + ' ₽';

const UI = {
  screens: {},          // id -> {render(el), onShow?()}
  current: 'garage',
  adminTaps: 0,

  register(id, renderFn) { this.screens[id] = { render: renderFn }; },

  go(id) {
    if (!this.screens[id]) return;
    this.current = id;
    const main = document.getElementById('main');
    main.innerHTML = '';
    this.screens[id].render(main);
    this.renderNav();
    window.scrollTo(0, 0);
  },

  renderNav() {
    const nav = document.getElementById('nav');
    const tabs = [
      ['garage', '🏠', 'Гараж'], ['cases', '📦', 'Кейсы'], ['race', '🏁', 'Гонки'],
      ['workshop', '🔧', 'Цех'], ['profile', '👤', 'Профиль'],
    ];
    nav.innerHTML = tabs.map(([id, icon, label]) =>
      `<button class="tab ${this.current === id ? 'active' : ''}" data-tab="${id}">
         <span>${icon}</span><small>${label}</small></button>`).join('');
    nav.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => this.go(b.dataset.tab));
  },

  renderHeader() {
    State.refreshFuel && State.refreshFuel();
    const d = State.data;
    document.getElementById('hdr-money').textContent = fmt(d.money) + ' ₽';
    const av = document.getElementById('hdr-avatar');
    av.textContent = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) ? '🙂' : '🏎️';
  },

  // скрытая админ-панель: 7 тапов по заголовку подряд (окно 1.5 с)
  bindAdminTaps() {
    const hdr = document.querySelector('header .title');
    if (!hdr) return;
    hdr.addEventListener('click', () => {
      this.adminTaps++;
      clearTimeout(this._tapTimer);
      this._tapTimer = setTimeout(() => { this.adminTaps = 0; }, 1500);
      if (this.adminTaps >= CONFIG.ADMIN_TAPS) { this.adminTaps = 0; Admin.open(); }
    });
  },

  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  },

  modal(html, onOpen) {
    const w = document.getElementById('modal');
    document.getElementById('modal-body').innerHTML = html;
    w.classList.add('open');
    document.getElementById('modal-close').onclick = () => w.classList.remove('open');
    if (onOpen) onOpen(w);
  },
  closeModal() { document.getElementById('modal').classList.remove('open'); },

  modal(html) {
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal').classList.add('show');
  },
  closeModal() {
    document.getElementById('modal').classList.remove('show');
  },
  haptic(style) { try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(style || 'light'); } catch {} },
};

function fmt(n) {
  n = Math.round(n);
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
  return String(n);
}
function fmtFull(n) { return Math.round(n).toLocaleString('ru-RU'); }
