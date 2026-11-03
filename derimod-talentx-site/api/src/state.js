// Veritabanını yükleme, kaydetme, kullanıcıya göre süzme ve e-posta kuyruğu.
const crypto = require('crypto');
const { stores } = require('./store');
const { core } = require('./core');
const mailer = require('./mailer');

const J = (o) => JSON.stringify(o, (k, v) => (k && k[0] === '_' ? undefined : v));
const clone = (o) => JSON.parse(J(o));
const inv = (at) => String(9999999999999 - at).padStart(13, '0') + crypto.randomBytes(3).toString('hex');

async function seedAll() {
  const C = core();
  const db = C.migrate(C.seed());
  C.DB = db; db.session = null;
  db.analytics = C.seedAnalytics();
  db.mailCfg = {}; db.prList = []; db.talentDemo = []; db.outbox = [];
  C.uidSync();
  db.device = 'server';
  await persist(emptySnap(), db);
}

function emptySnap() { return { users: {}, jobs: {}, apps: {}, tdemo: {}, cfg: {}, audit: new Set(), outbox: new Set() }; }
function snap(db) {
  const m = (arr, k) => { const o = {}; (arr || []).forEach((x) => { o[x[k]] = J(x); }); return o; };
  return {
    users: m(db.users, 'email'), jobs: m(db.jobs, 'id'), apps: m(db.apps, 'id'), tdemo: m(db.talentDemo, 'id'),
    cfg: { analytics: J(db.analytics || []), mailCfg: J(db.mailCfg || {}), prList: J(db.prList || []), seq: J(db.seq || {}) },
    audit: new Set((db.audit || []).map(J)), outbox: new Set((db.outbox || []).map((x) => x.id))
  };
}

async function loadDB() {
  const { db } = stores();
  let users = await db.list('user');
  if (!users.length) { await seedAll(); users = await db.list('user'); }
  const [jobs, apps, cfg, tdemo, audit, outbox] = await Promise.all([
    db.list('job'), db.list('app'), db.list('cfg'), db.list('tdemo'), db.list('audit', 300), db.list('outbox', 300)
  ]);
  const C = {}; cfg.forEach((x) => { C[x.rk] = x.v; });
  const v = (a) => a.map((x) => x.v).filter(Boolean);
  const D = {
    users: v(users).sort((a, b) => (a.created || 0) - (b.created || 0)),
    jobs: v(jobs).sort((a, b) => (b.created || 0) - (a.created || 0)),
    apps: v(apps).sort((a, b) => (b.at || 0) - (a.at || 0)),
    analytics: C.analytics || [], mailCfg: C.mailCfg || {}, prList: C.prList || [], seq: C.seq || { P: 0, T: 0 },
    talentDemo: v(tdemo), audit: v(audit), outbox: v(outbox), session: null, device: 'server', blv2: 1
  };
  return D;
}

async function persist(before, db) {
  const { db: st } = stores();
  const ops = [];
  const diffArr = (pk, arr, key, prev) => {
    const seen = {};
    (arr || []).forEach((x) => { const id = x[key]; seen[id] = 1; const s = J(x); if (prev[id] !== s) ops.push(() => st.put(pk, id, JSON.parse(s))); });
    Object.keys(prev).forEach((id) => { if (!seen[id]) ops.push(() => st.del(pk, id)); });
  };
  diffArr('user', db.users, 'email', before.users);
  diffArr('job', db.jobs, 'id', before.jobs);
  diffArr('app', db.apps, 'id', before.apps);
  diffArr('tdemo', db.talentDemo, 'id', before.tdemo);
  [['analytics', db.analytics || []], ['mailCfg', db.mailCfg || {}], ['prList', db.prList || []], ['seq', db.seq || {}]].forEach(([k, v]) => {
    if (before.cfg[k] !== J(v)) ops.push(() => st.put('cfg', k, clone(v)));
  });
  (db.audit || []).forEach((a) => { if (!before.audit.has(J(a))) ops.push(() => st.put('audit', inv(a.at || Date.now()), clone(a))); });
  (db.outbox || []).forEach((m) => {
    if (!before.outbox.has(m.id)) { if (!m.st) m.st = 'kuyrukta'; ops.push(() => st.put('outbox', m.rk || (m.rk = inv(m.at)), clone(m))); }
  });
  // sınırlı eşzamanlılıkla yaz
  const N = 8; let i = 0;
  await Promise.all(Array.from({ length: Math.min(N, ops.length) }, async () => { while (i < ops.length) { const f = ops[i++]; await f(); } }));
}

// Kuyruktaki e-postaları gönder (istek başına sınırlı sayıda)
async function drainMail(db, limit) {
  const { db: st } = stores();
  const C = core();
  const q = (db.outbox || []).filter((m) => m.st === 'kuyrukta').slice(0, limit || 25);
  const N = 6; let i = 0;
  await Promise.all(Array.from({ length: Math.min(N, q.length) }, async () => {
    while (i < q.length) {
      const m = q[i++];
      let r;
      try { const b = C.mailBuild(m.k, m.d); r = await mailer.send(m.to, b.s, b.html); }
      catch (e) { r = { st: 'hata', err: String(e && e.message || e).slice(0, 300) }; }
      m.st = r.st; if (r.err) m.err = r.err; m.sentAt = Date.now();
      if (m.rk) await st.put('outbox', m.rk, clone(m));
    }
  }));
}

function bindCore(db, email) {
  const C = core();
  C.DB = db;
  db.session = email ? { email, exp: Date.now() + 8 * 3600 * 1000 } : null;
  C.S.sess = [];
  return C;
}

// Oturumdaki kullanıcının görmesine izin verilen veriler
function view(db, email) {
  const C = bindCore(db, email);
  const me = C.me();
  const base = { users: [], jobs: [], apps: [], analytics: [], audit: [], outbox: [], mailCfg: {}, prList: [], talentDemo: [], session: null, device: 'server', blv2: 1, server: true, mailReady: mailer.configured() };
  if (!me) {
    base.jobs = clone(db.jobs.filter((j) => j.status === 'yayinda' && j.external));
    return base;
  }
  const emp = C.isEmp(me);
  const staff = ['users', 'apps', 'jobs', 'talent'].some((p) => C.can(p, me));
  const apps = db.apps.filter((a) => C.canSeeApp(a, me) || a.email === me.email);
  let users;
  if (staff) users = db.users;
  else {
    const em = new Set([me.email]);
    apps.forEach((a) => { if (C.canSeeApp(a, me)) em.add(a.email); });
    users = db.users.filter((u) => em.has(u.email));
  }
  const out = Object.assign(base, {
    users: clone(users),
    jobs: clone(C.can('jobs', me) ? db.jobs : db.jobs.filter((j) => (j.status === 'yayinda' && (emp || j.external)) || C.ownsJob(j, me))),
    apps: clone(apps).map((a) => {
      if (C.canSeeApp(a, me)) return a;
      // adayın kendi başvurusu: iç değerlendirme bilgileri gösterilmez
      return { id: a.id, uid: a.uid, jobId: a.jobId, email: a.email, name: a.name, at: a.at, status: a.status, type: a.type, answers: a.answers, profile: a.profile, history: [], ratings: {}, hmView: {}, notes: [] };
    }),
    analytics: emp ? clone(db.analytics || []) : [],
    mailCfg: C.can('mail', me) ? clone(db.mailCfg || {}) : {},
    outbox: C.can('mail', me) ? clone((db.outbox || []).slice(0, 300)) : [],
    prList: C.can('talent', me) ? clone(db.prList || []) : [],
    talentDemo: C.can('talent', me) ? clone(db.talentDemo || []) : [],
    audit: C.can('audit', me) ? clone((db.audit || []).slice(0, 200)) : [],
    session: { email: me.email, exp: Date.now() + 8 * 3600 * 1000 }
  });
  return out;
}

module.exports = { loadDB, persist, snap, view, bindCore, drainMail, clone, J, inv };
