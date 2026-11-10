// Canlı sürümün İçerik Güvenlik Politikası kontrolü: uygulama CSP ihlali üretmemeli, enjekte HTML çalışmamalı.
// Kullanım: yerel sunucu açıkken node tests/csp-check.js http://localhost:4280/
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const v=[],hits=[];
await p.route(/fonts\.g/,r=>r.fulfill({body:''}));
p.on('console',m=>{if(/Content Security Policy|Refused/i.test(m.text()))v.push(m.text().slice(0,160))});
await p.exposeFunction('__xssHit',k=>hits.push(k));await p.addInitScript(()=>{window.__xss=k=>window.__xssHit(String(k))});
await p.goto(process.argv[2]+'?local=1#anasayfa');await p.waitForTimeout(600);
await p.evaluate(()=>{var u=DB.users.find(x=>x.arole==='exec');u.status='aktif';DB.session={email:u.email,exp:Date.now()+36e5};u.consents={};CN.docs.forEach(d=>u.consents[d.k]={v:CN.v,at:Date.now(),lang:'tr'});save();atsDemo(5);talDemo(3)});
for(const h of ['kariyer','profil','yonetim','etkinlikler','degerler','uygulamalar']){await p.evaluate(h=>{location.hash='#'+h;route()},h);await p.waitForTimeout(250)}
// kütüphaneler
console.log('pdf.js:',await p.evaluate(()=>loadPdf().then(L=>!!L.getDocument).catch(e=>'HATA '+e.message)));
console.log('xlsx:',await p.evaluate(()=>new Promise(r=>{var s=document.createElement('script');s.src='vendor/xlsx/0.18.5/xlsx.full.min.js';s.onload=()=>r(!!window.XLSX);s.onerror=()=>r('HATA');document.head.appendChild(s)})));
// hata olsa bile enjekte HTML çalışmamalı
await p.evaluate(()=>{var d=document.createElement('div');d.innerHTML='<img src=x onerror="__xss(\'img\')"><svg onload="__xss(\'svg\')"></svg>';document.body.appendChild(d)});
await p.waitForTimeout(500);
console.log('enjekte payload çalıştı mı:',JSON.stringify(hits));
console.log('CSP ihlali (uygulama kaynaklı):',v.filter(x=>!/__xss|onerror|onload|inline event/i.test(x)).slice(0,5));
console.log('CSP engelledi (beklenen):',v.filter(x=>/inline event|onerror|onload/i.test(x)).length);
const bad=hits.length||v.filter(x=>!/__xss|onerror|onload|inline event/i.test(x)).length;console.log(bad?'SONUÇ: CSP SORUNU':'SONUÇ: CSP uygulanıyor');await b.close();process.exit(bad?1:0)})();
