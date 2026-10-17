// DRIFTZONE — админ-эндпоинты. Доступ: users.is_admin = 1 (ставится вручную через D1)
// или telegram_id в ENV.ADMIN_IDS ('123,456').
import { ensureUser } from './balance.js';

function isAdmin(u, env) {
  if (u.is_admin) return true;
  const list = (env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  return list.includes(u.telegram_id);
}

export async function handle(env, tgUser, action, payload) {
  const db = env.DB;
  const u = await ensureUser(db, tgUser);
  if (!isAdmin(u, env)) throw new Error('forbidden');

  switch (action) {
    case 'give_money': {                       // начислить деньги (награды донатерам и т.п.)
      const amount = Math.floor(Number(payload.amount));
      if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) throw new Error('bad_amount');
      await db.batch([
        db.prepare('UPDATE users SET balance = balance + ? WHERE id = (SELECT id FROM users WHERE telegram_id = ?)')
          .bind(amount, payload.tgId),
        db.prepare("INSERT INTO transactions (user_id, kind, amount, meta) VALUES ((SELECT id FROM users WHERE telegram_id = ?), 'admin', ?, ?)")
          .bind(payload.tgId, amount, JSON.stringify({ reason: payload.reason || 'admin' })),
      ]);
      return { ok: true };
    }
    case 'give_car': {
      await db.prepare('INSERT INTO user_cars (user_id, car_id) SELECT id, ? FROM users WHERE telegram_id = ?')
        .bind(String(payload.carId), payload.tgId).run();
      return { ok: true };
    }
    case 'set_stars': {
      await db.prepare('UPDATE users SET stars = ? WHERE telegram_id = ?').bind(Math.max(0, Math.floor(Number(payload.stars))), payload.tgId).run();
      return { ok: true };
    }
    case 'ban': {
      await db.prepare('UPDATE users SET banned = ? WHERE telegram_id = ?').bind(payload.ban ? 1 : 0, payload.tgId).run();
      return { ok: true };
    }
    case 'promo_create': {
      const code = String(payload.code || '').trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,32}$/.test(code)) throw new Error('bad_code');
      const reward = JSON.stringify({ money: Number(payload.money) || 0, stars: Number(payload.stars) || 0 });
      await db.prepare(`INSERT INTO promo_codes (code, reward_json, max_uses, expires_at) VALUES (?, ?, ?, ?)
        ON CONFLICT(code) DO UPDATE SET reward_json = excluded.reward_json, max_uses = excluded.max_uses`)
        .bind(code, reward, Number(payload.maxUses) || 1000, payload.expiresAt ? Number(payload.expiresAt) : null).run();
      return { ok: true, code };
    }
    case 'stats': {
      const total = await db.prepare('SELECT COUNT(*) users, SUM(balance) money FROM users').first();
      const recent = await db.prepare('SELECT kind, SUM(-amount) burned, SUM(CASE WHEN amount>0 THEN amount ELSE 0 END) minted FROM transactions WHERE created_at > ? GROUP BY kind')
        .bind(Math.floor(Date.now() / 1000) - 86400).all();
      return { ok: true, total, recent: recent.results };
    }
    default: throw new Error('unknown_action');
  }
}
