// DRIFTZONE — серверная валидация Telegram WebApp initData (HMAC-SHA256).
// Алгоритм из официальной документации: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
'use strict';

const enc = new TextEncoder();

// constant-time сравнение байт (защита от timing-атак)
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacSha256(keyBytes, message) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

/**
 * Проверяет initData и возвращает объект пользователя {tgId, username, first_name, authHash}.
 * Возвращает null, если подпись невалидна или initData протух (>24ч).
 */
export async function verifyInitData(initData, botToken) {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');

  // 1. data_check_string: ключи отсортированы по возрастанию, join '\n'
  const keys = [...params.keys()].sort();
  const dataCheckString = keys.map(k => `${k}=${params.get(k)}`).join('\n');

  // 2. secret_key = HMAC-SHA256("WebAppData", botToken)
  const secretKey = await hmacSha256(enc.encode('WebAppData'), botToken);

  // 3. expected = HMAC-SHA256(secret_key, data_check_string) → hex
  const expected = await hmacSha256(secretKey, dataCheckString);
  const expectedHex = [...expected].map(b => b.toString(16).padStart(2, '0')).join('');

  if (expectedHex !== hash) return null;

  // 4. свежая ли сессия
  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || Date.now() / 1000 - authDate > 86400) return null;

  let user = {};
  try { user = JSON.parse(params.get('user') || '{}'); } catch { /* без user-блока */ }

  return {
    tgId: String(user.id || params.get('uid') || ''),
    username: user.username || null,
    first_name: user.first_name || null,
    initData,                       // сохраняем для возможной проверки bot验证 later
  };
}
