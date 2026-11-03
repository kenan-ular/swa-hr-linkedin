// Giriş: e-posta + şifre, yeni cihazda e-posta kodu. Kodlar ve şifreler yalnızca sunucuda tutulur.
const crypto = require('crypto');
const { stores } = require('./store');
const mailer = require('./mailer');
const { inv, clone } = require('./state');

const OTP_TTL = 5 * 60 * 1000, OTP_GAP = 30 * 1000, SESS_TTL = 8 * 3600 * 1000, TRUST_TTL = 30 * 864e5;
const H = (s) => crypto.createHash('sha256').update(s).digest('hex');
const rand = (n) => crypto.randomBytes(n).toString('hex');

function pbkdf2(pw, salt) { return crypto.pbkdf2Sync(pw, salt, 210000, 32, 'sha256').toString('hex'); }
function eq(a, b) { const A = Buffer.from(a), B = Buffer.from(b); return A.length === B.length && crypto.timingSafeEqual(A, B); }

function cookies(req) {
  const o = {}; String(req.headers.get('cookie') || '').split(';').forEach((p) => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return o;
}
function secure(req) { return !/^http:\/\/(localhost|127\.0\.0\.1)/.test(req.url); }
function ck(req, name, value, maxAge) { return { name, value, path: '/', httpOnly: true, secure: secure(req), sameSite: 'Lax', maxAge }; }

async function session(req) {
  const c = cookies(req); const t = c.tx_s;
  if (!t || !/^[a-f0-9]{64}$/.test(t)) return null;
  const s = await stores().db.get('sess', t);
  if (!s || s.exp < Date.now()) return null;
  return { token: t, email: s.email };
}
async function newSession(req, res, email) {
  const t = rand(32);
  await stores().db.put('sess', t, { email, exp: Date.now() + SESS_TTL, at: Date.now() });
  res.cookies.push(ck(req, 'tx_s', t, SESS_TTL / 1000));
}
function device(req, res) {
  const c = cookies(req); let d = c.tx_d;
  if (!d || !/^[a-f0-9]{32}$/.test(d)) { d = rand(16); res.cookies.push(ck(req, 'tx_d', d, 400 * 864e2)); }
  return d;
}
async function killSessions(email) {
  const st = stores().db; const all = await st.list('sess');
  await Promise.all(all.filter((x) => x.v && x.v.email === email).map((x) => st.del('sess', x.rk)));
}

async function sendCode(C, db, email, purpose) {
  const st = stores().db;
  const prev = await st.get('otp', email);
  if (prev && Date.now() - prev.sentAt < OTP_GAP) return { wait: Math.ceil((OTP_GAP - (Date.now() - prev.sentAt)) / 1000) };
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  await st.put('otp', email, { h: H(code + email), purpose, exp: Date.now() + OTP_TTL, tries: 0, sentAt: Date.now() });
  const u = db.users.find((x) => x.email === email);
  const d = { code, purpose, name: u ? u.name : '' };
  const b = C.mailBuild('kod', d);
  const r = await mailer.send(email, b.s, b.html);
  const m = { id: 'm' + rand(4), at: Date.now(), k: 'kod', to: email, s: '•••••• · Derimod TalentX doğrulama kodun', d: { code: '••••••', purpose, name: d.name }, st: r.st, err: r.err };
  m.rk = inv(m.at);
  await st.put('outbox', m.rk, m);
  return { sent: r.st, dev: process.env.DEV_SHOW_CODES === '1' ? code : undefined };
}

function rules(C, pw, email) { const r = C.pwRules(pw, email); return r.len && r.mix && r['case'] && r.mail; }

// İstek gövdesine göre adımı yürütür. Dönüş: { ok, step, purpose, err, info, token, dev, login }
async function handle(op, body, req, res, C, db) {
  const st = stores().db;
  const email = String(body.email || '').trim().toLowerCase();
  const u = db.users.find((x) => x.email === email) || null;
  const dev = device(req, res);
  const audit = (ev, who) => { db.audit.unshift({ at: Date.now(), who: who || email, email, ev }); };

  if (op === 'logout') {
    const s = await session(req); if (s) { await st.del('sess', s.token); audit('Çıkış yapıldı', s.email); }
    res.cookies.push(ck(req, 'tx_s', '', 0));
    return { ok: true };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { err: 'Geçerli bir e-posta adresi yaz.' };
  const cred = await st.get('cred', email);
  const locked = cred && cred.lockUntil > Date.now();

  if (op === 'start') {
    if (!u) return { unknown: true };
    if (u.status === 'askida') return { err: 'Hesabınız askıya alınmış. İnsan ve Kültür ekibiyle görüşün.' };
    if (locked) return { err: 'Çok sayıda hatalı deneme nedeniyle hesap kilitli. ' + Math.ceil((cred.lockUntil - Date.now()) / 60000) + ' dakika sonra tekrar deneyin.' };
    if (!cred || !cred.hash) { const r = await sendCode(C, db, email, 'aktivasyon'); audit('Aktivasyon kodu gönderildi'); return { step: 'otp', purpose: 'aktivasyon', wait: r.wait, dev: r.dev }; }
    return { step: 'password', purpose: 'giris' };
  }
  if (op === 'register') {
    const name = String(body.name || '').trim().slice(0, 120);
    if (!name) return { err: 'Ad soyad gerekli.' };
    const cs = body.consents || {};
    if (C.CN.docs.some((d) => d.req && !cs[d.k])) return { err: 'Devam etmek için sözleşme ve onay kutularının hepsini işaretle.' };
    if (u && cred && cred.hash) return { err: 'Bu adresle bir hesap zaten var. Giriş yap ya da şifreni sıfırla.', step: 'email' };
    if (u && u.status === 'askida') return { err: 'Hesabınız askıya alınmış. İnsan ve Kültür ekibiyle görüşün.' };
    if (!u) { db.users.push({ email, name, dept: 'Dış aday', role: 'aday', arole: '', bl: [], status: 'davetli', created: Date.now(), lastLogin: null, src: 'kayit', prep: {} }); C.uidSync(); audit('Aday kaydı başlatıldı'); }
    { const nu = db.users.find((x) => x.email === email); C.DB = db; require('./sync').setConsents(C, nu, cs, (k) => cs[k]); }
    const r = await sendCode(C, db, email, 'kayit');
    return { step: 'otp', purpose: 'kayit', wait: r.wait, dev: r.dev };
  }
  if (op === 'password') {
    if (!u || !cred || !cred.hash) return { err: 'Önce hesabını etkinleştir.', step: 'email' };
    if (u.status === 'askida') return { err: 'Hesabınız askıya alınmış.' };
    if (locked) return { err: 'Hesap kilitli. ' + Math.ceil((cred.lockUntil - Date.now()) / 60000) + ' dakika sonra tekrar deneyin.' };
    if (!eq(pbkdf2(String(body.pw || ''), cred.salt), cred.hash)) {
      cred.fails = (cred.fails || 0) + 1; audit('Hatalı şifre denemesi');
      let err;
      if (cred.fails >= 5) { cred.lockUntil = Date.now() + 15 * 60000; cred.fails = 0; err = '5 hatalı deneme yapıldı. Hesap 15 dakika kilitlendi.'; audit('Hesap kilitlendi', 'sistem'); }
      else err = 'Şifre hatalı. Kalan deneme: ' + (5 - cred.fails) + '.';
      await st.put('cred', email, cred);
      return { err };
    }
    cred.fails = 0; cred.trusted = (cred.trusted || []).filter((t) => t.until > Date.now());
    if (cred.trusted.some((t) => t.device === H(dev))) {
      await st.put('cred', email, cred); await newSession(req, res, email);
      u.lastLogin = Date.now(); audit('Giriş yapıldı');
      return { ok: true, login: email };
    }
    await st.put('cred', email, cred);
    const r = await sendCode(C, db, email, 'giris'); audit('Yeni cihaz · kod gönderildi');
    return { step: 'otp', purpose: 'giris', wait: r.wait, dev: r.dev };
  }
  if (op === 'forgot') {
    if (u && cred && cred.hash && u.status !== 'askida') { const r = await sendCode(C, db, email, 'sifirlama'); audit('Şifre sıfırlama kodu gönderildi'); return { step: 'otp', purpose: 'sifirlama', wait: r.wait, dev: r.dev }; }
    return { step: 'otp', purpose: 'sifirlama' };
  }
  if (op === 'resend') {
    const o = await st.get('otp', email);
    if (!u || !o) return { err: 'Kod bulunamadı. Baştan başla.', step: 'email' };
    const r = await sendCode(C, db, email, o.purpose);
    if (r.wait) return { info: 'Yeni kod için ' + r.wait + ' saniye bekleyin.' };
    return { info: 'Yeni kod gönderildi. Önceki kod geçersiz.', dev: r.dev };
  }
  if (op === 'verify') {
    const o = await st.get('otp', email);
    const code = String(body.code || '').replace(/\D/g, '');
    if (!u || !o || o.used) return { err: 'Kod bulunamadı. Yeni kod isteyin.' };
    if (Date.now() > o.exp) return { err: 'Kodun süresi doldu. “Kodu yeniden gönder” ile yeni kod isteyin.' };
    if (o.tries >= 5) return { err: 'Deneme hakkı bitti. Yeni kod isteyin.' };
    if (!eq(H(code + email), o.h)) { o.tries++; await st.put('otp', email, o); return { err: 'Kod eşleşmedi. Kalan deneme: ' + (5 - o.tries) + '.' }; }
    audit('E-posta kodu doğrulandı');
    if (o.purpose === 'giris') {
      o.used = true; await st.put('otp', email, o);
      if (body.trust && cred) { cred.trusted = (cred.trusted || []).filter((t) => t.device !== H(dev) && t.until > Date.now()); cred.trusted.push({ device: H(dev), until: Date.now() + TRUST_TTL }); await st.put('cred', email, cred); }
      await newSession(req, res, email); u.lastLogin = Date.now(); audit('Giriş yapıldı');
      return { ok: true, login: email };
    }
    o.verified = true; o.token = rand(16); o.exp = Date.now() + 15 * 60000; await st.put('otp', email, o);
    return { step: 'setpw', token: o.token, purpose: o.purpose };
  }
  if (op === 'setpw') {
    const o = await st.get('otp', email);
    if (!u || !o || !o.verified || o.used || !o.token || !eq(String(body.token || ''), o.token) || Date.now() > o.exp) return { err: 'Doğrulama süresi doldu. Baştan başla.', step: 'email' };
    const pw = String(body.pw || '');
    if (!rules(C, pw, email)) return { err: 'Şifre kuralların hepsini karşılamalı.' };
    const salt = rand(16);
    const nc = { salt, hash: pbkdf2(pw, salt), set: Date.now(), fails: 0, lockUntil: 0, trusted: [] };
    if (body.trust) nc.trusted.push({ device: H(dev), until: Date.now() + TRUST_TTL });
    await st.put('cred', email, nc);
    o.used = true; await st.put('otp', email, o);
    if (body.consents && typeof body.consents === 'object') { C.DB = db; require('./sync').setConsents(C, u, body.consents, (k) => body.consents[k]); }
    const wasInvite = u.status === 'davetli';
    u.status = 'aktif'; u.hasPw = true; u.lastLogin = Date.now();
    audit(o.purpose === 'kayit' ? 'Aday hesabı oluşturuldu' : (wasInvite ? 'Hesap etkinleştirildi · şifre belirlendi' : 'Şifre yenilendi'));
    C.DB = db; db.session = { email, exp: Date.now() + SESS_TTL };
    if (o.purpose === 'sifirlama' || (!wasInvite && o.purpose !== 'kayit')) C.mailSend('sifre', email, { name: u.name, at: Date.now() });
    else C.mailSend('hosgeldin', email, C.mailUserData(u));
    await killSessions(email);
    await newSession(req, res, email); audit('Giriş yapıldı');
    return { ok: true, login: email };
  }
  return { err: 'Bilinmeyen işlem.' };
}

module.exports = { handle, session, killSessions, cookies, ck };
