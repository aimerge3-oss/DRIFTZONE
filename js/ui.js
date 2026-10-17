// DRIFTZONE — UI-ядро: навигация, шапка, модалки, тосты, форматирование денег.
'use strict';

// Формат: 1,2 млн / 850К / 12 345 (русские запятые)
const fmt = n => {
  n = Math.round(n);
  if (Math.abs(n) >= 1e9) return (n/1e9).toFixed(2).replace('.',',').replace(/,?0+$/,'') + ' млрд';
  if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(2).replace('.',',').replace(/,?0+$/,'') + ' млн';
  if (Math.abs(n) >= 1e4) return (Math.round(n/1e3)).toLocaleString('ru-RU') + 'К';
  return n.toLocaleString('ru-RU');
};
// Полное число с разделителями: 7 500 000
const fmtFull = n => Math.round(n).toLocaleString('ru-RU');
const money = n => fmt(n) + ' ₽';

const UI = {
  screens: {},          // id -> renderFn(el)
  current: 'garage',
  adminTaps: 0,

  register(id, renderFn) { this.screens[id] = renderFn; },

  go(id) {
    if (!this.screens[id]) return;
    this.current = id;
    const main = document.getElementById('main');
    main.innerHTML = '';
    try { this.screens[id](main); } catch (e) { console.error('[UI] render error:', e); main.innerHTML = '<div class="card empty">Ошибка экрана 😅</div>'; }
    this.renderNav();
    window.scrollTo(0, 0);
  },

  refresh() { this.go(this.current); },

  renderNav() {
    const nav = document.getElementById('nav');
    const tabs = [
      ['garage', '🏠', 'Гараж'], ['cases', '📦', 'Кейсы'], ['race', '🏁', 'Гонки'],
      ['workshop', '🔧', 'Цех'], ['profile', '👤', 'Профиль'],
    ];
    nav.innerHTML = tabs.map(([id, icon, label]) =>
      `<button class="tab ${this.current === id ? 'active' : ''}" data-tab="${id}">
         <span>${icon}</span><small>${label}</small></button>`).join('');
    nav.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { this.go(b.dataset.tab); UI.haptic('light'); });
  },

  renderHeader() {
    State.refreshFuel && State.refreshFuel();
    const d = State.data;
    document.getElementById('hdr-money').textContent = fmt(d.money) + ' ₽';
    // аватар = кольцо опыта + бейдж уровня (как в оригинале)
    const av = document.getElementById('hdr-avatar');
    if (av) {
      const pct = Math.min(1, (d.xp || 0) / xpNeed(d.level || 1));
      const R = 16, C = 2 * Math.PI * R;
      av.innerHTML = `
        <svg viewBox="0 0 38 38">
          <circle cx="19" cy="19" r="${R}" fill="none" stroke="var(--line)" stroke-width="3"/>
          <circle cx="19" cy="19" r="${R}" fill="none" stroke="var(--accent)" stroke-width="3"
            stroke-dasharray="${C*pct} ${C}" stroke-linecap="round" transform="rotate(-90 19 19)"/>
          <path d="M9 24 Q19 7 29 24 Z" fill="var(--hint)" opacity=".5"/>
        </svg>
        <span class="lvl-badge">${d.level || 1}</span>`;
    }
    // точка на подарке, если есть награды
    const gift = document.querySelector('.gift-btn');
    if (typeof updateGiftDot === 'function') updateGiftDot();
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
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  },

  modal(html, onOpen) {
    document.getElementById('modal-body').innerHTML = html;
    const w = document.getElementById('modal');
    w.classList.add('show');
    document.getElementById('modal-close').onclick = () => this.closeModal();
    if (onOpen) onOpen(w);
  },
  closeModal() { document.getElementById('modal').classList.remove('show'); },

  haptic(style) { try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(style || 'light'); } catch {} },
};
