// Kayıtlı XSS taraması (CSP'siz önizleme sürümünde): verideki her metin alanına zararlı HTML ekler,
// tüm sayfa, sekme, çekmece ve e-posta görünümlerini gezer; tek bir payload bile çalışırsa başarısız olur.
// Kullanım: node tests/xss-fuzz.js [admin|cand]   (önce: python3 source/build.py)
const {chromium}=require('playwright');const path=require('path');
const URL0='file://'+require('path').join(__dirname,'..','build','preview.html')+'?local=1'; const MODE=process.argv[2]||'admin';
(async()=>{
const b=await chromium.launch();const c=await b.newContext({viewport:{width:1280,height:900}});
await c.route('https://cdnjs.cloudflare.com/**',r=>r.fulfill({body:''}));await c.route(/fonts\.g/,r=>r.fulfill({body:''}));
await c.route('**/x*',r=>r.fulfill({status:404,body:''}));
const p=await c.newPage();const hits=new Set(),errs=[];
p.on('pageerror',e=>errs.push(e.message));
await p.exposeFunction('__xssHit',k=>hits.add(k));
await p.addInitScript(()=>{window.__xss=k=>window.__xssHit(String(k))});
await p.goto(URL0+'#anasayfa');await p.waitForTimeout(800);
// demo verilerini doldur, admin oturumu
const map=await p.evaluate((MODE)=>{
  var adm=DB.users.find(u=>u.arole==='exec');
  adm.status='aktif';DB.session={email:adm.email,exp:Date.now()+36e5};
  DB.users.forEach(u=>{u.consents={};CN.docs.forEach(d=>u.consents[d.k]={v:CN.v,at:Date.now(),lang:'tr'})});
  save();
  atsDemo(40);talDemo(30);
  Object.keys(MT).forEach(function(k){try{var d=MT[k].x({});mailSend(k,adm.email,d,true)}catch(e){}});
  DB.audit=(DB.audit||[]);log(adm.email,'test kaydı');save();
  if(MODE==='cand'){var E='aday.test@example.com';DB.users.push({email:E,name:'Aday Test',role:'aday',arole:'',status:'aktif',created:Date.now(),profile:emptyProfile({email:E}),consents:adm.consents,prep:{}});DB.apps.slice(0,3).forEach(function(a){a.email=E;a.demo=false});DB.session={email:E,exp:Date.now()+36e5};save()}
  return 1},MODE);
// demo verisi butonları
for(const a of ['atsDemo','talDemo']){await p.evaluate(()=>{location.hash='#yonetim'});await p.waitForTimeout(300);
  const tabs=await p.$$('[data-act=atab]');for(const t of tabs){await t.click().catch(()=>{});await p.waitForTimeout(150);const d=await p.$('[data-act='+a+']');if(d){await d.click().catch(()=>{});await p.waitForTimeout(400);break}}}
// tüm string alanlara payload
const fields=await p.evaluate(()=>{
  var SKIP=/^(id|jobId|email|uid|status|stage|type|arole|role|k|at|created|v|lang|st|rk|exp|hms|by|from|to|device|session|level|state|func|sector|dept|school|tab|src|blob|hash|ver)$/;
  var list=[],n=0;
  function walk(o,pathS){ if(!o||typeof o!=='object')return;
    Object.keys(o).forEach(function(k){var v=o[k];var ps=pathS+'.'+k;
      if(typeof v==='string'&&!SKIP.test(k)&&!/@/.test(v)){var id=list.length;list.push(ps.replace(/\.\d+/g,'[]'));o[k]=v+'"\'><img src=x'+id+' onerror=__xss('+id+') data-pwn='+id+'>';}
      else if(typeof v==='object')walk(v,ps)})}
  ['users','jobs','apps','talentDemo','prList','analytics','audit','outbox'].forEach(function(k){walk(DB[k],k)});
  // dizi içindeki düz string'ler (beceriler, diller)
  function walkArr(o){if(!o||typeof o!=='object')return;Object.keys(o).forEach(function(k){var v=o[k];if(Array.isArray(v)){v.forEach(function(x,i){if(typeof x==='string'&&!/@/.test(x)&&k!=='hms'){var id=list.length;list.push(k+'[]');v[i]=x+'"\'><img src=x'+id+' onerror=__xss('+id+') data-pwn='+id+'>'}else walkArr(x)})}else if(typeof v==='object')walkArr(v)})}
  ['users','jobs','apps','talentDemo','prList'].forEach(function(k){walkArr(DB[k])});
  save();return list});
console.log('veri:',await p.evaluate(()=>DB.users.length+' kullanıcı, '+DB.apps.length+' başvuru, '+(DB.talentDemo||[]).length+' talent demo, '+DB.jobs.length+' ilan, outbox '+(DB.outbox||[]).length));console.log('payload eklenen alan:',fields.length,'oturum:',await p.evaluate(()=>me()&&me().arole));
const pwnSeen=new Map();const clicked={};
async function scan(where){const ids=await p.$$eval('[data-pwn]',e=>e.map(x=>x.getAttribute('data-pwn')));ids.forEach(i=>{if(!pwnSeen.has(i))pwnSeen.set(i,where)});
  const fr=p.frames();for(const f of fr){if(f===p.mainFrame())continue;try{const j=await f.$$eval('[data-pwn]',e=>e.map(x=>x.getAttribute('data-pwn')));j.forEach(i=>{if(!pwnSeen.has(i))pwnSeen.set(i,where+' (e-posta iframe)')})}catch(e){}}}
const OPEN=/^(applyOpen|ans|atab|ktab|atsOpen|atsJob|atsView|atsMore|atsNav|talOpen|talPick|mlOpen|mlList|mlTpl|mlToggle|cnRead|applyOpen|jobEdit|uidEdit|caJump|rfilter|atsStageList|toProfile|prep|impTpl|atsCrit|draftNew)$/;
const pages=['anasayfa','kariyer','degerler','etkinlikler','uygulamalar','analitik','profil','yonetim'];
const jobs=await p.evaluate(()=>DB.jobs.map(j=>j.id));
for(const j of jobs.slice(0,4))pages.push('ilan-'+j);
for(const pg of (process.env.SKIP?[]:pages)){
  await p.evaluate(h=>{location.hash='#'+h;route()},pg);await p.waitForTimeout(350);await scan(pg);
  const done=new Set(),per={};
  for(let it=0;it<260;it++){
    const cand=await p.$$eval('[data-act]',els=>els.map((e,i)=>({i,a:e.getAttribute('data-act'),k:[...e.attributes].filter(x=>x.name.startsWith('data-')).map(x=>x.name+'='+x.value.slice(0,40)).join('&')})));
    const ok=c=>OPEN.test(c.a)&&!done.has(c.k)&&(per[c.a]||0)<8;const nx=cand.find(c=>ok(c)&&!/^(atab|ktab)$/.test(c.a))||cand.find(ok);
    if(!nx)break;done.add(nx.k);per[nx.a]=(per[nx.a]||0)+1;clicked[nx.a]=(clicked[nx.a]||0)+1;
    const el=(await p.$$('[data-act]'))[nx.i];if(!el)continue;
    await el.click({timeout:800}).catch(()=>{});await p.waitForTimeout(110);await scan(pg+' › '+nx.a);
    if(!/^(atab|ktab)$/.test(nx.a)){for(const ca of ['cnClose','atsClose','talClose','mlClose','closeInbox','mlBack','uidCancel']){const x=await p.$('[data-act='+ca+']');if(x){await x.click({timeout:500}).catch(()=>{});await p.waitForTimeout(80)}}await p.keyboard.press('Escape').catch(()=>{});}
  }
}

// hedefli: çekmeceler
await p.evaluate(()=>{location.hash='#yonetim';route()});await p.waitForTimeout(300);
for(const [tab,op,cl] of [['ats','atsOpen','atsClose'],['talent','talOpen','talClose'],['jobs','jobEdit','draftCancel'],['jobs','atsJob',null],['mail','mlTpl',null]]){
  await p.click('[data-act=atab][data-t='+tab+']').catch(e=>console.log('tab',tab,e.message.slice(0,80)));await p.waitForTimeout(250);
  for(const r of ['atsReset','talReset','atsClr','talClr']){const x=await p.$('[data-act='+r+']');if(x){await x.click({timeout:500}).catch(()=>{});await p.waitForTimeout(150)}}
  await p.evaluate(()=>{try{A2.job='';}catch(e){}});
  const n=await p.$$eval('[data-act='+op+']',e=>e.length);let c2=0;
  for(let i=0;i<Math.min(n,6);i++){const el=(await p.$$('[data-act='+op+']'))[i];if(!el)break;await el.click({timeout:1000}).then(()=>c2++).catch(()=>{});await p.waitForTimeout(250);await scan('yonetim › '+op);
    // çekmece içindeki sekmeler
    for(const inner of await p.$$('[data-act=atsNav],[data-act=atsHMV],[data-act=talSet]')){}
    if(cl){const x=await p.$('[data-act='+cl+']');if(x)await x.click({timeout:500}).catch(()=>{});await p.waitForTimeout(100)}
    if(op==='atsJob'){await p.click('[data-act=atab][data-t=ats]').catch(()=>{});await p.waitForTimeout(200);const o=await p.$('[data-act=atsOpen]');if(o){await o.click().catch(()=>{});await p.waitForTimeout(250);await scan('yonetim › atsJob›atsOpen');const x=await p.$('[data-act=atsClose]');if(x)await x.click().catch(()=>{})}await p.click('[data-act=atab][data-t=jobs]').catch(()=>{});await p.waitForTimeout(200)}
  }
  console.log('hedefli',tab,op,'bulunan',n,'açılan',c2);
}
console.log('çalışan payload (onerror):',hits.size,[...hits].slice(0,40).map(i=>fields[i]).join(', '));
const uniq={};for(const [i,w] of pwnSeen){const f=fields[i];(uniq[f]=uniq[f]||new Set()).add(w.split(' › ')[0]+(w.includes('iframe')?' [iframe]':''))}
console.log('DOM\'a enjekte olan alan:',Object.keys(uniq).length);
for(const f in uniq)console.log('  ',f,'→',[...uniq[f]].slice(0,4).join(' | '));
console.log('tıklanan:',JSON.stringify(clicked));console.log('errs',errs.slice(0,5));
const bad=hits.size+pwnSeen.size;console.log(bad?'SONUÇ: XSS BULUNDU':'SONUÇ: XSS bulunmadı ('+MODE+')');
await b.close();process.exit(bad?1:0)})();
