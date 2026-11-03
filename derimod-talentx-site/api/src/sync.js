// İstemciden gelen değişiklikleri yetki kurallarına göre uygular.
// İstemciye güvenilmez: her alan, oturumdaki kişinin rolüne göre tek tek kontrol edilir.
const { clone, J } = require('./state');

const str = (v, n) => String(v == null ? '' : v).slice(0, n || 200);
const bool = (v) => !!v;

function sanProfile(p) {
  if (!p || typeof p !== 'object') return null;
  const s = J(p);
  if (s.length > 200000) return null;
  const o = JSON.parse(s);
  if (o.cv && typeof o.cv === 'object') { delete o.cv.data; o.cv = { name: str(o.cv.name, 200), size: +o.cv.size || 0, type: str(o.cv.type, 80), at: +o.cv.at || Date.now(), blob: bool(o.cv.blob) }; }
  return o;
}

// Onaylar: yalnızca güncel sürüm kabul edilir; tarih sunucuda atanır
function setConsents(C, u, src, langOf) {
  const got = [];
  C.CN.docs.forEach((d) => {
    const has = u.consents && u.consents[d.k] && u.consents[d.k].v === C.CN.v;
    const want = src && src[d.k] && (typeof src[d.k] === 'string' || src[d.k].v === C.CN.v);
    if (want && !has) { u.consents = u.consents || {}; const l = langOf(d.k) === 'en' ? 'en' : 'tr'; u.consents[d.k] = { v: C.CN.v, at: Date.now(), lang: l }; got.push(d.k); }
  });
  if (got.length) { u.consentLog = (u.consentLog || []).concat(got.map((k) => ({ k, v: C.CN.v, at: Date.now() }))).slice(-50); C.log(u.email, 'Onay verildi · ' + got.join(', ') + ' · sürüm ' + C.CN.v); }
}

function apply(C, db, me, d) {
  const errs = [];
  const deny = (m) => errs.push(m);
  const can = (p) => C.can(p, me);
  const mex = me.arole === 'exec';
  const find = (e) => db.users.find((u) => u.email === e) || null;

  /* ---------- kullanıcılar ---------- */
  const U = (d.users || {});
  (U.upsert || []).slice(0, 2000).forEach((nu) => {
    if (!nu || typeof nu !== 'object') return;
    const email = str(nu.email, 254).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    const cur = find(email);
    if (!cur) {
      if (!can('users')) return deny('Kullanıcı ekleme yetkin yok.');
      let ar = C.AROLES.some((r) => r.k === nu.arole) ? nu.arole : '';
      if (ar && !can('roles')) ar = '';
      if (ar === 'exec' && !mex) ar = '';
      const u = {
        email, name: str(nu.name, 120) || C.nameFrom(email), dept: C.DEPTS.indexOf(nu.dept) > -1 ? nu.dept : (nu.role === 'aday' ? 'Dış aday' : ''),
        role: nu.role === 'aday' && !ar ? 'aday' : 'calisan', arole: ar, bl: [], status: 'davetli', created: Date.now(), lastLogin: null, src: 'admin', prep: {}
      };
      if (can('roles') && Array.isArray(nu.bl) && u.role !== 'aday') u.bl = nu.bl.filter((b) => (b === '*' ? mex : C.BLS.indexOf(b) > -1));
      if (nu.uid && !nu.uidTemp && u.role !== 'aday' && C.eidValid(nu.uid) && !C.uidOwner(nu.uid)) { u.uid = nu.uid; u.uidTemp = false; }
      db.users.push(u);
      C.log(email, 'Kullanıcı eklendi · ' + (u.role === 'aday' ? 'Dış aday' : 'Çalışan') + (ar ? ' · ' + C.aroleName(ar) : ''));
      u._new = true;
      return;
    }
    if (email === me.email) {
      if (nu.name) cur.name = str(nu.name, 120);
      if (nu.profile) { const p = sanProfile(nu.profile); if (p) cur.profile = p; }
      if (nu.prep && typeof nu.prep === 'object') cur.prep = { yonetici: bool(nu.prep.yonetici), kurs: bool(nu.prep.kurs) };
      if (nu.consents && typeof nu.consents === 'object') setConsents(C, cur, nu.consents, (k) => nu.consents[k] && nu.consents[k].lang);
      return;
    }
    const adminAny = can('users') || can('type') || can('roles');
    if (!adminAny) return deny('Başka bir kullanıcıyı değiştirme yetkin yok.');
    if (cur.arole === 'exec' && !mex) return deny('Executive Admin hesabını yalnızca Executive Admin değiştirebilir.');
    if (can('users')) {
      if (nu.name) cur.name = str(nu.name, 120);
      if (nu.dept !== undefined && (C.DEPTS.indexOf(nu.dept) > -1 || nu.dept === '' || nu.dept === 'Dış aday')) cur.dept = nu.dept;
      if (nu.status === 'askida' && cur.status !== 'askida') { cur.status = 'askida'; cur._kill = true; C.log(cur.email, 'Hesap askıya alındı'); }
      else if (nu.status && nu.status !== 'askida' && cur.status === 'askida') { cur.status = cur.hasPw ? 'aktif' : 'davetli'; C.log(cur.email, 'Hesap yeniden etkinleştirildi'); }
      if (nu.pwReset && nu.pwReset !== cur.pwReset) { cur.pwReset = nu.pwReset; cur._pwReset = true; cur.hasPw = false; if (cur.status !== 'askida') cur.status = 'davetli'; C.log(cur.email, 'Şifre yönetici tarafından sıfırlandı'); }
      if (nu.uid && nu.uid !== cur.uid && !nu.uidTemp && cur.role !== 'aday' && C.eidValid(nu.uid) && !C.uidOwner(nu.uid, cur.email)) C.setUid(cur, nu.uid, false, 'Elle güncellendi');
    }
    if (can('type') && !cur.arole && (nu.role === 'aday' || nu.role === 'calisan') && nu.role !== cur.role) { cur.role = nu.role; if (cur.role === 'aday') cur.bl = []; C.log(cur.email, 'Kullanıcı tipi · ' + (cur.role === 'aday' ? 'Dış aday' : 'Çalışan')); }
    if (can('roles')) {
      const ar = nu.arole === '' || C.AROLES.some((r) => r.k === nu.arole) ? nu.arole : cur.arole;
      if (ar !== undefined && ar !== cur.arole) {
        if ((ar === 'exec' || cur.arole === 'exec') && !mex) deny('Executive Admin rolünü yalnızca Executive Admin atayabilir.');
        else if (cur.arole === 'exec' && ar !== 'exec' && C.execCount() <= 1) deny('En az bir Executive Admin kalmalı.');
        else { const old = cur.arole; cur.arole = ar; if (ar) cur.role = 'calisan'; C.log(cur.email, 'Yönetim rolü · ' + (C.aroleName(ar) || 'kaldırıldı')); if (ar && ar !== old) C.mailSend('rol_atandi', cur.email, { name: cur.name, role: ar, by: me.name }); }
      }
      if (Array.isArray(nu.bl) && cur.role !== 'aday') {
        const nb = nu.bl.filter((b) => (b === '*' ? mex || (cur.bl || []).indexOf('*') > -1 : C.BLS.indexOf(b) > -1));
        if (J(nb) !== J(cur.bl || [])) { cur.bl = nb; C.log(cur.email, 'Analitik erişimi güncellendi'); }
      }
    }
  });
  (U.del || []).forEach((email) => {
    const cur = find(email);
    if (!cur) return;
    if (!can('users')) return deny('Kullanıcı silme yetkin yok.');
    if (cur.email === me.email) return deny('Kendi hesabını silemezsin.');
    if (cur.arole === 'exec' && (!mex || C.execCount() <= 1)) return deny('Bu Executive Admin kaldırılamaz.');
    db.users.splice(db.users.indexOf(cur), 1);
    C.log(email, 'Kullanıcı kaldırıldı');
    db._removed = (db._removed || []).concat([email]);
  });

  /* ---------- ilanlar ---------- */
  const Jb = (d.jobs || {});
  (Jb.upsert || []).forEach((nj) => {
    if (!nj || typeof nj !== 'object' || !nj.id) return;
    if (!can('jobs')) return deny('İlan düzenleme yetkin yok.');
    const j = clone(nj);
    j.id = str(j.id, 40);
    j.hms = (j.hms || []).filter((e) => { const u = find(e); return u && u.arole; });
    if (['yayinda', 'kapali', 'taslak'].indexOf(j.status) < 0) j.status = 'yayinda';
    const cur = db.jobs.find((x) => x.id === j.id);
    const oldH = cur ? (cur.hms || []) : [];
    if (cur) Object.keys(cur).forEach((k) => delete cur[k]), Object.assign(cur, j);
    else { j.created = j.created || Date.now(); db.jobs.unshift(j); }
    j.hms.filter((e) => oldH.indexOf(e) < 0).forEach((e) => { const hu = find(e); const md = C.mailJobData(j); md.name = hu ? hu.name : ''; C.mailSend('hm_atandi', e, md); });
  });
  (Jb.del || []).forEach((id) => {
    const cur = db.jobs.find((x) => x.id === id); if (!cur) return;
    if (!can('jobs')) return deny('İlan silme yetkin yok.');
    db.jobs.splice(db.jobs.indexOf(cur), 1); C.log(me.email, 'İlan kaldırıldı · ' + cur.title);
  });

  /* ---------- başvurular ---------- */
  const A = (d.apps || {});
  (A.upsert || []).slice(0, 2000).forEach((na) => {
    if (!na || typeof na !== 'object' || !na.id) return;
    const cur = db.apps.find((x) => x.id === na.id);
    if (!cur) {
      if (na.demo) { if (!can('system')) return deny('Örnek veri yetkin yok.'); if (!/\.test$/i.test(na.email || '')) return; db.apps.push(clone(na)); return; }
      // Gerçek başvuru: istemcinin kaydı kullanılmaz; başvuru sunucuda sitenin kendi kurallarıyla yeniden oluşturulur.
      if (na.email !== me.email) return deny('Başkası adına başvuru yapılamaz.');
      const j = C.jobById(na.jobId);
      if (!j || j.status !== 'yayinda') return deny('İlan yayında değil.');
      if (!j.external && !C.isEmp(me)) return deny('Bu ilan yalnızca çalışanlara açık.');
      if (db.apps.some((x) => !x.demo && x.email === me.email && x.jobId === j.id)) return deny('Bu ilana zaten başvurdun.');
      C.S.k = { ans: (na.ansRaw && typeof na.ansRaw === 'object') ? JSON.parse(J(na.ansRaw)) : {}, kvkk: true, open: null };
      if (!C.submitApp(me, j)) return deny(String(C.S.k.err || 'Başvuru tamamlanamadı.').replace(/<[^>]+>/g, ''));
      return;
    }
    if (!C.canSeeApp(cur, me)) return; // aday kendi başvurusunu değiştiremez
    const owner = C.ownsJob(C.jobById(cur.jobId), me);
    if (can('apps') && na.status && na.status !== cur.status && C.PIPE.some((p) => p[0] === na.status)) C.setStage(cur, na.status, str(na.reason, 120));
    else if (can('apps') && na.status === 'red' && na.reason !== undefined && na.reason !== cur.reason) cur.reason = str(na.reason, 120);
    if (can('notes')) {
      const have = new Set((cur.notes || []).map((n) => n.t + '|' + n.at));
      (na.notes || []).filter((n) => n && n.t && !have.has(n.t + '|' + n.at)).slice(0, 5).forEach((n) => { cur.notes = cur.notes || []; cur.notes.push({ by: me.email, name: me.name, at: Date.now(), t: str(n.t, 2000) }); C.log(cur.email, 'Değerlendirme notu eklendi'); });
      const r = (na.ratings || {})[me.email], rc = (cur.ratings || {})[me.email];
      if (r !== rc) { cur.ratings = cur.ratings || {}; if (r >= 1 && r <= 5) cur.ratings[me.email] = Math.round(r); else delete cur.ratings[me.email]; }
    }
    if (owner) {
      const v = (na.hmView || {})[me.email], vc = (cur.hmView || {})[me.email];
      if (J(v) !== J(vc)) { cur.hmView = cur.hmView || {}; if (v && v.v) cur.hmView[me.email] = { v: str(v.v, 20), at: Date.now() }; else delete cur.hmView[me.email]; }
    }
  });
  (A.del || []).forEach((id) => {
    const cur = db.apps.find((x) => x.id === id); if (!cur) return;
    if (!can('system') || !cur.demo) return deny('Başvuru silinemez.');
    db.apps.splice(db.apps.indexOf(cur), 1);
  });

  /* ---------- örnek yetenek profilleri ---------- */
  const T = (d.tdemo || {});
  if ((T.upsert || []).length || (T.del || []).length) {
    if (!can('system')) deny('Örnek veri yetkin yok.');
    else {
      db.talentDemo = db.talentDemo || [];
      (T.upsert || []).forEach((p) => { if (!p || !p.id || !/\.test$/i.test(p.email || '')) return; const i = db.talentDemo.findIndex((x) => x.id === p.id); const v = clone(p); if (i > -1) db.talentDemo[i] = v; else db.talentDemo.push(v); });
      (T.del || []).forEach((id) => { db.talentDemo = db.talentDemo.filter((x) => x.id !== id); });
    }
  }

  /* ---------- ayarlar ---------- */
  const G = d.cfg || {};
  if (G.mailCfg !== undefined) {
    if (!can('mail')) deny('E-posta ayarı yetkin yok.');
    else { const o = {}; Object.keys(G.mailCfg || {}).forEach((k) => { if (C.MT[k] && !C.MT[k].lock) o[k] = bool(G.mailCfg[k]); }); db.mailCfg = o; }
  }
  if (G.prList !== undefined) {
    if (!can('talent')) deny('Talent Review yetkin yok.');
    else db.prList = (G.prList || []).map((x) => str(x, 60)).filter((v, i, a) => v && a.indexOf(v) === i).slice(0, 5000);
  }
  if (G.analytics !== undefined) {
    if (!can('analytics')) deny('Analitik ayarı yetkin yok.');
    else db.analytics = (G.analytics || []).slice(0, 200).map((it) => ({ id: str(it.id, 40), g: str(it.g, 120), k: str(it.k, 80), t: str(it.t, 200), d: str(it.d, 600), u: str(it.u, 300), sens: bool(it.sens), bl: str(it.bl, 80) }));
  }

  /* ---------- erişim kayıtları (istemcinin yazdığı olaylar, gerçek kişi adına) ---------- */
  const seen = new Set((db.audit || []).map((a) => a.ev + '|' + a.email));
  (d.audit || []).slice(0, 30).forEach((a) => {
    if (!a || !a.ev) return;
    const ev = str(a.ev, 300);
    if (/^(Giriş|Çıkış|Hesap etkinleştirildi|Şifre|Aktivasyon|Yeni cihaz|E-posta kodu|Aday hesabı|Kullanıcı ID|Yönetim rolü|Kullanıcı eklendi|Aşama|Başvuru)/.test(ev)) return; // bunları sunucu kendisi yazar
    if (seen.has(ev + '|' + a.email)) return;
    db.audit.unshift({ at: Date.now(), who: me.email, email: str(a.email, 254), ev });
  });

  return errs;
}

// İşlem sonrası: ID ataması, davet ve profil e-postaları
function after(C, db, me) {
  C.uidSync();
  db.users.filter((u) => u._new).forEach((u) => { delete u._new; C.mailSend('davet', u.email, C.mailUserData(u)); });
  // profil tamamlandı
  const u = db.users.find((x) => x.email === me.email);
  if (u && !u.readyMailed && C.pstat(u).ready) { u.readyMailed = Date.now(); const p = u.profile || {}; C.mailSend('profil_tamam', u.email, C.mailUserData(u, { sk: (p.skills || []).length, cp: (p.comps || []).length })); }
}

module.exports = { apply, after, setConsents };
