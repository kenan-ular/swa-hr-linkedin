// Sunucu tarafı temizleme testi: HTML/komut karakterleri veritabanına girmemeli, ilan alanları doğrulanmalı.
const path = require('path');
const api = path.join(__dirname, '..', 'api', 'src');
const { loadDB, bindCore } = require(path.join(api, 'state'));
const sync = require(path.join(api, 'sync'));
const K = require(path.join(api, 'clean'));
let fail = 0; const ok = (c, m) => { console.log((c ? 'GEÇTİ  ' : 'KALDI  ') + m); if (!c) fail++; };
(async () => {
  const db = await loadDB(); const E = 'metin.usta@derimod.com';
  db.users.find((x) => x.email === E).status = 'aktif';
  const C = bindCore(db, E); const me = C.me();
  const nu = JSON.parse(JSON.stringify(me));
  nu.name = 'Ad <script>alert(1)</script>';
  nu.profile = Object.assign({}, nu.profile, { city: '<img src=x onerror=alert(1)>', linkedin: 'javascript:alert(1)', skills: ['<svg onload=1>'] });
  const errs = sync.apply(C, db, me, { users: { upsert: [nu] }, jobs: { upsert: [{ id: 'j1"><x', title: 'a' }, { id: 'j9', title: '<b>Uzman</b>', deadline: '2026<img src=x>', url: 'javascript:alert(1)', status: 'taslak' }] } }, { ip: '', ua: '' });
  const u = db.users.find((x) => x.email === E), j9 = db.jobs.find((j) => j.id === 'j9');
  ok(!/[<>]/.test(JSON.stringify({ n: u.name, p: u.profile })), 'profil ve ad alanlarında < > kalmadı');
  ok(/^https:\/\//.test(u.profile.linkedin), 'LinkedIn adresi https ile sınırlandı');
  ok(errs.includes('Geçersiz ilan kimliği.') && !db.jobs.some((j) => /"/.test(j.id)), 'geçersiz ilan kimliği reddedildi');
  ok(j9 && j9.deadline === '' && j9.url === '' && !/[<>]/.test(j9.title), 'ilan tarihi, bağlantısı ve başlığı temizlendi');
  ok(!K.EMAIL_RE.test('"><svg/onload=alert(1)>@a.co') && K.EMAIL_RE.test('ayse.aday@gmail.com'), 'e-posta biçimi denetimi');
  ok(JSON.stringify(K.deep(JSON.parse('{"__proto__":{"x":1},"a":"<b>"}'))) === '{"a":"‹b›"}', 'prototip kirletme anahtarları atıldı');
  // CSV formül enjeksiyonu (istemci fonksiyonu)
  const src = require('fs').readFileSync(path.join(__dirname, '..', 'source', 'src.html'), 'utf8');
  const csvQ = new Function(src.match(/function csvQ\(v\)\{[^\n]*\}/)[0] + ';return csvQ')();
  ok(csvQ('=HYPERLINK("http://x","a")').startsWith('"\'=') && csvQ('@SUM(1)').startsWith("'@") && csvQ('Ayşe') === 'Ayşe', 'CSV formül enjeksiyonu engellendi');
  console.log(fail ? 'SONUÇ: ' + fail + ' kontrol kaldı' : 'SONUÇ: temizleme testleri geçti'); process.exit(fail ? 1 : 0);
})();
