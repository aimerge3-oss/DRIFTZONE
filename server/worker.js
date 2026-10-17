// DRIFTZONE — Cloudflare Worker, точка входа и роутинг API.
// Деплой: npx wrangler deploy (см. README.md)
import { verifyInitData } from './handlers/auth.js';
import * as balance from './handlers/balance.js';
import * as cases from './handlers/cases.js';
import * as races from './handlers/races.js';
import * as admin from './handlers/admin.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Rate limiting через KV: не чаще 1 запроса в секунду на эндпоинт
async function checkRateLimit(env, userId, endpoint) {
  const key = `rl:${userId}:${endpoint}`;
  const now = Date.now();
  const last = Number((await env.GAME_KV.get(key)) || 0);
  if (now - last < 1000) return false;
  await env.GAME_KV.put(key, String(now), { expirationTtl: 60 });
  return true;
}

export default {
  async fetch(req, env, ctx) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

    let body;
    try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }

    // Все приватные эндпоинты требуют подписанный Telegram initData
    const t = body.t;
    const PUBLIC = ['ping'];
    let user = null;

    try {
      if (!PUBLIC.includes(t)) {
        user = await verifyInitData(body.initData, env.BOT_TOKEN);
        if (!user) return json({ error: 'auth_failed' }, 401);

        // upsert пользователя, блокировка
        const row = await balance.ensureUser(env.DB, user);
        if (row.banned) return json({ error: 'banned' }, 403);

        // rate limit для игровых действий
        const LIMITED = ['open_car_case', 'open_part_case', 'race_start', 'sell_car', 'collect_income'];
        if (LIMITED.includes(t) && !(await checkRateLimit(env, row.id, t)))
          return json({ error: 'rate_limited' }, 429);
      }

      switch (t) {
        case 'ping':            return json({ ok: true, ts: Date.now() });
        case 'sync':            return json(await balance.syncState(env.DB, user));
        case 'sell_car':        return json(await balance.sellCar(env, user, body.carUid));
        case 'collect_income':  return json(await balance.collectIncome(env.DB, user, body.now));
        case 'buy_slot':        return json(await balance.buySlot(env.DB, user));
        case 'paint_car':       return json(await balance.paintCar(env.DB, user, body.carUid, body.color));
        case 'upgrade_car':     return json(await balance.upgradeCar(env.DB, user, body.carUid));
        case 'open_car_case':   return json(await cases.openCarCase(env, user, body.caseId, body.count, body.autoSellBelow));
        case 'open_part_case':  return json(await cases.openPartCase(env, user, body.caseId));
        case 'merge_parts':     return json(await cases.mergeParts(env, user, body.partIds));
        case 'install_part':    return json(await cases.installPart(env.DB, user, body.partId, body.carUid, body.slot));
        case 'uninstall_part':  return json(await cases.uninstallPart(env.DB, user, body.partId));
        case 'race_start':      return json(await races.startRace(env, user, body.rivalTier));
        case 'claim_daily':     return json(await balance.claimDaily(env.DB, user));
        case 'claim_quest':     return json(await balance.claimQuest(env.DB, user, body.questId));
        case 'redeem_promo':    return json(await balance.redeemPromo(env.DB, user, body.code));
        case 'admin':           return json(await admin.handle(env, user, body.action, body.payload));
        default:                return json({ error: 'unknown_type' }, 400);
      }
    } catch (e) {
      // Бизнес-ошибки отдаём как 400 с кодом, клиент покажет toast
      return json({ error: e.message || 'internal' }, 400);
    }
  },
};
