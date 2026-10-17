// DRIFTZONE — обёртка над fetch для общения с Cloudflare Worker.
// Все запросы: POST {t, initData, ...payload}. Ответ: JSON или {error}.
'use strict';

const API = {
  offline: false,           // true = работаем на локальном кэше (API недоступен)
  _backoff: 1000,

  initData() {
    return tg && tg.initData ? tg.initData : '';
  },

  /**
   * Базовый запрос. retryOnce — одна повторная попытка при сетевой ошибке.
   * Ошибки сервера бросают Error(code); клиент рисует toast по словарю ERRORS.
   */
  async call(t, payload = {}, { timeoutMs = 8000 } = {}) {
    const body = JSON.stringify({ t, initData: this.initData(), ...payload });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({ error: 'bad_response' }));
      if (!res.ok || data.error) {
        const e = new Error(data.error || ('http_' + res.status));
        e.status = res.status;
        throw e;
      }
      this.offline = false;
      this._backoff = 1000;
      return data;
    } catch (err) {
      // сетевая ошибка/таймаут → помечаем офлайн-режим, не спамим запросами
      if (err.name === 'AbortError' || err instanceof TypeError) {
        this.offline = true;
        throw new Error('offline');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  },

  sync()           { return this.call('sync'); },
  openCarCase(caseId, count, autoSellBelow) {
    return this.call('open_car_case', { caseId, count, autoSellBelow });
  },
  openPartCase(caseId) { return this.call('open_part_case', { caseId }); },
  sellCar(carUid)  { return this.call('sell_car', { carUid }); },
  collectIncome()  { return this.call('collect_income', {}); },
  raceStart(rivalTier) { return this.call('race_start', { rivalTier }); },
  installPart(partId, carUid, slot) { return this.call('install_part', { partId, carUid, slot }); },
  uninstallPart(partId) { return this.call('uninstall_part', { partId }); },
  mergeParts(partIds) { return this.call('merge_parts', { partIds }); },
  upgradeCar(carUid) { return this.call('upgrade_car', { carUid }); },
  paintCar(carUid, color) { return this.call('paint_car', { carUid, color }); },
  claimDaily()     { return this.call('claim_daily', {}); },
  redeemPromo(code){ return this.call('redeem_promo', { code }); },
  admin(action, payload) { return this.call('admin', { action, payload }); },
};

// Человекочитаемые тексты ошибок сервера
const ERRORS = {
  insufficient_funds: 'Недостаточно денег 💸',
  rate_limited: 'Слишком быстро! Подожди секунду',
  no_fuel: 'Нет топлива ⛽',
  no_active_car: 'Выбери машину в гараже',
  auth_failed: 'Telegram-авторизация не пройдена',
  banned: 'Аккаунт заблокирован',
  already_claimed: 'Уже получено сегодня',
  invalid_code: 'Промокод не найден',
  already_used: 'Этот код ты уже активировал',
  sold_out: 'Код закончился',
  offline: 'Сервер недоступен — играй локально',
  parts_changed: 'Детали изменились, повтори',
};
const errText = e => ERRORS[e.message] || e.message || 'Ошибка';
