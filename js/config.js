// DRIFTZONE — глобальные константы и настройки клиента.
'use strict';

const CONFIG = {
  APP_NAME: 'DRIFTZONE',
  API_URL: location.hostname.includes('localhost')
    ? 'http://localhost:8787'                       // wrangler dev
    : 'https://driftzone-api.aimerge.workers.dev',  // прод-воркер
  VERSION: '2.0.0',
  SAVE_KEY: 'driftzone_save_v1',
  ADMIN_TAPS: 7,                                    // 7 тапов по заголовку = админ-панель
  SYNC_INTERVAL_MS: 30_000,                         // периодический pull состояния с сервера
  OFFLINE_GRACE_MS: 5 * 60_000,                     // при недоступности API играем на локальном кэше до 5 мин
};

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (tg && tg.ready) { tg.ready(); tg.expand(); try { tg.setHeaderColor('#0f172a'); } catch {} }
