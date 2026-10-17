// DRIFTZONE — навигация и общие примитивы интерфейса.
'use strict';

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
    // скрытая админ-панель: 7 тапов по заголовку
    clearTimeout(this._tapTimer);
    this._tapTimer = setTimeout(() => { this.adminTaps = 0; }, 1500);
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
