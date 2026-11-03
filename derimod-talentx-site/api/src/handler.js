// Tüm API uçları. Azure Functions'tan ve yerel test sunucusundan aynı şekilde çağrılır.
const { stores } = require('./store');
const { core } = require('./core');
const { loadDB, persist, snap, view, bindCore, drainMail, clone } = require('./state');
const auth = require('./auth');
const sync = require('./sync');

const json = (status, body, cookies) => ({ status, jsonBody: body, cookies: cookies || [], headers: { 'Cache-Control': 'no-store' } });

async function readBody(req) { try { return await req.json(); } catch (e) { return {}; } }

async function handler(req) {
  const path = String(req.params && req.params.path || '').replace(/^\/+|\/+$/g, '');
  const res = { cookies: [] };
  try {
    const C = core();
    if (path === 'health') return json(200, { ok: true, storage: stores().mem ? 'bellek (test)' : 'Azure Storage', mail: require('./mailer').configured() ? 'hazır' : 'yapılandırılmadı' });

    const db = await loadDB();
    const before = snap(db);
    const s = await auth.session(req);
    let email = s ? s.email : null;
    const meU = email ? db.users.find((u) => u.email === email && u.status === 'aktif') : null;
    if (email && !meU) email = null;

    if (path === 'state' && req.method === 'GET') {
      const out = view(db, email);
      drainMail(db, 10).catch(() => {});
      return json(200, { ok: true, state: out }, res.cookies);
    }

    if (path.startsWith('auth/')) {
      const op = path.slice(5);
      const body = await readBody(req);
      bindCore(db, null);
      const r = await auth.handle(op, body, req, res, C, db);
      const who = r.login || (op === 'logout' ? null : email);
      bindCore(db, who);
      await persist(before, db);
      await drainMail(db, 10);
      const out = Object.assign({ ok: !r.err }, r, { state: view(db, who) });
      delete out.login;
      return json(200, out, res.cookies);
    }

    if (!email) return json(401, { ok: false, err: 'Oturumun sona erdi. Yeniden giriş yap.', state: view(db, null) }, res.cookies);

    if (path === 'sync' && req.method === 'POST') {
      const body = await readBody(req);
      const Cx = bindCore(db, email);
      const me = Cx.me();
      const errs = sync.apply(Cx, db, me, body || {});
      sync.after(Cx, db, me);
      // askıya alınan / şifresi sıfırlanan kullanıcıların oturumlarını kapat
      const kill = db.users.filter((u) => u._kill || u._pwReset);
      for (const u of kill) { if (u._pwReset) await stores().db.del('cred', u.email); await auth.killSessions(u.email); delete u._kill; delete u._pwReset; }
      await persist(before, db);
      await drainMail(db, 25);
      return json(errs.length ? 403 : 200, { ok: !errs.length, err: errs.length ? errs[0] : undefined, errs, state: view(db, email) }, res.cookies);
    }

    if (path === 'mail/remind' && req.method === 'POST') {
      const body = await readBody(req);
      const Cx = bindCore(db, email);
      if (!Cx.can('talent')) return json(403, { ok: false, err: 'Yetkin yok.' });
      const ids = new Set((body.ids || []).map(String));
      let n = 0;
      db.users.forEach((u) => {
        if (!ids.has(u.uid) && !ids.has('u:' + u.email)) return;
        const ps = Cx.pstat(u); if (ps.ready) return;
        if (Cx.mailSend('profil_hatirlat', u.email, { name: u.name, v: Cx.isEmp(u) ? 'ic' : 'dis', pct: ps.pct, miss: ps.items.filter((i) => !i[1]).map((i) => i[0]) }, true)) n++;
      });
      Cx.log(email, 'Profil hatırlatma e-postası · ' + n);
      await persist(before, db);
      await drainMail(db, 25);
      return json(200, { ok: true, n, state: view(db, email) });
    }

    if (path === 'mail/test' && req.method === 'POST') {
      const body = await readBody(req);
      const Cx = bindCore(db, email);
      if (!Cx.can('mail') || !Cx.MT[body.k] || body.k === 'kod') return json(403, { ok: false, err: 'Yetkin yok.' });
      const d = Cx.MT[body.k].x(body.v); d.to = email;
      Cx.mailSend(body.k, email, d, true);
      await persist(before, db);
      await drainMail(db, 5);
      const m = (db.outbox || [])[0];
      return json(200, { ok: true, st: m && m.st, state: view(db, email) });
    }

    if (path === 'cv' && req.method === 'POST') {
      const body = await readBody(req);
      const data = String(body.data || '');
      const buf = Buffer.from(data.replace(/^data:[^,]*,/, ''), 'base64');
      if (!buf.length || buf.length > 5 * 1024 * 1024) return json(400, { ok: false, err: 'Dosya 5 MB’tan küçük olmalı.' });
      const type = /pdf/.test(body.type || '') ? 'application/pdf' : String(body.type || 'application/octet-stream').slice(0, 100);
      await stores().blob.put(blobName(email), buf, type);
      return json(200, { ok: true, cv: { name: String(body.name || 'ozgecmis.pdf').slice(0, 200), size: buf.length, type, at: Date.now(), blob: true } });
    }

    if (path === 'cv' && req.method === 'GET') {
      const who = String(req.query.get('email') || email).toLowerCase();
      const Cx = bindCore(db, email);
      const ok = who === email || Cx.can('talent') || db.apps.some((a) => a.email === who && Cx.canSeeApp(a));
      if (!ok) return json(403, { ok: false, err: 'Yetkin yok.' });
      const b = await stores().blob.get(blobName(who));
      if (!b) return json(404, { ok: false, err: 'Dosya bulunamadı.' });
      return { status: 200, body: b.buf, headers: { 'Content-Type': b.type || 'application/pdf', 'Cache-Control': 'no-store', 'Content-Disposition': 'attachment; filename="ozgecmis.pdf"' } };
    }

    return json(404, { ok: false, err: 'Bulunamadı.' });
  } catch (e) {
    console.error(e);
    return json(500, { ok: false, err: 'Sunucu hatası. Biraz sonra tekrar dene.' }, res.cookies);
  }
}
function blobName(email) { return require('crypto').createHash('sha256').update(email).digest('hex') + '.bin'; }

module.exports = { handler };
