// Uçtan uca sunucu testi: giriş/OTP, onaylar, yetkiler, CV, akıllı okuma, onay kayıtları.
// Çalıştırma: tests/run.sh   (yerel sunucuyu ve sahte Azure OpenAI'yi kendisi başlatır)
const {chromium}=require('playwright');const path=require('path');
const U=process.env.BASE||'http://localhost:4291/';
const PDFJS=path.join(path.dirname(require.resolve('pdfjs-dist/package.json')),'build');
const CV=path.join(__dirname,'fixtures','ornek-cv.pdf');
(async()=>{const b=await chromium.launch();const errs=[];
const mk=async()=>{const c=await b.newContext({viewport:{width:1280,height:900},acceptDownloads:true});await c.route('https://cdnjs.cloudflare.com/**',r=>{const f=r.request().url().split('/').pop();r.fulfill({contentType:'application/javascript',body:require('fs').readFileSync(path.join(PDFJS,f),'utf8')})});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n').slice(1,3).join('|')));return {c,p}};
const T=(p,t)=>p.waitForTimeout(t||250);const sub=p=>p.click('#app form button[type=submit]');
const st=(p)=>p.evaluate(()=>({me:DB.session&&DB.session.email,users:DB.users.length,apps:DB.apps.length,outbox:(DB.outbox||[]).map(m=>m.k+'>'+m.to+'['+m.st+']').slice(0,8)}));
// ---- admin
const A=await mk();let p=A.p;
await p.goto(U+'#giris');await T(p,600);
await p.fill('#f-email','metin.usta@derimod.com');await sub(p);await T(p,600);
let code=await p.evaluate(()=>S.devCode);console.log('A1 step',await p.evaluate(()=>S.L.step),'code?',!!code);
await p.fill('#f-otp',code);await sub(p);await T(p,600);console.log('A2 step',await p.evaluate(()=>S.L.step));
console.log('A2b consent boxes',await p.$$eval('[data-cn]',e=>e.length));await p.fill('#f-np','Derimod2026Life');await p.fill('#f-np2','Derimod2026Life');await sub(p);await T(p,600);console.log('A2c err w/o consent:',await p.evaluate(()=>S.L.err));
for(const c of await p.$$('[data-cn]'))await c.check();await p.fill('#f-np','Derimod2026Life');await p.fill('#f-np2','Derimod2026Life');await p.click('[data-act=cnLang][data-l=en]');await T(p,200);console.log('A2d EN label',await p.textContent('[data-cnlab=uyelik]'));await sub(p);await T(p,800);
console.log('A2e consents',await p.evaluate(()=>JSON.stringify(me()&&me().consents)),'gate?',await p.evaluate(()=>needsConsent(me())));
console.log('A3',JSON.stringify(await st(p)));
await p.reload();await T(p,800);console.log('A4 after reload me=',await p.evaluate(()=>DB.session&&DB.session.email),'banner:',await p.textContent('.proto'));
// add user
await p.goto(U+'#yonetim');await T(p,500);
await p.fill('#a-email','can.demir@derimod.com');await p.fill('#a-name','Can Demir');await p.fill('#a-uid','10234');await p.click('form[data-form=addUser] button[type=submit]');await T(p,1200);
console.log('A5 can',await p.evaluate(()=>{var u=find('can.demir@derimod.com');return u&&u.uid+'/'+u.status}),JSON.stringify((await st(p)).outbox));
await p.selectOption('[data-act=arole][data-e="can.demir@derimod.com"]','hr');await T(p,1200);
console.log('A6 arole',await p.evaluate(()=>find('can.demir@derimod.com').arole),JSON.stringify((await st(p)).outbox.slice(0,2)));
// ---- candidate
const K=await mk();let q=K.p;
await q.goto(U+'#giris');await T(q,600);
await q.evaluate(()=>{S.L={step:'register',email:'',purpose:'kayit',err:'',info:''};render()});await T(q);
await q.fill('#r-email','ayse.aday@gmail.com');await q.fill('#r-name','Ayşe Aday');for(const c of await q.$$('[data-cn]'))await c.check();await sub(q);await T(q,600);
code=await q.evaluate(()=>S.devCode);await q.fill('#f-otp',code);await sub(q);await T(q,600);
await q.fill('#f-np','Kariyer2026Yol');await q.fill('#f-np2','Kariyer2026Yol');await sub(q);await T(q,900);
console.log('K1',JSON.stringify(await st(q)),'uid',await q.evaluate(()=>me().uid));
// profile via UI state + save
await q.evaluate(()=>{var u=me();u.profile=Object.assign(u.profile,{phone:'05320000000',city:'İstanbul',edu:[{level:'Lisans',school:UNIS[0],dept:LISANS[0],state:'Mezun',year:'2015'}],totalExp:TOTAL_EXP[3],exp:[{company:'Örnek A.Ş.',title:'Uzman',sector:SECTORS[0],func:FUNCS[0],sy:'2016',current:true}],skills:['SQL','Power BI','SAP'],comps:ALL_COMPS.slice(0,4),langs:[{lang:'Türkçe',level:'Ana dil'},{lang:'İngilizce',level:LANG_LV[2]}]});save()});await T(q,1200);
// CV upload
await q.goto(U+'#profil');await T(q,600);
const fs=require('fs');const inp=await q.$('input[type=file]');await inp.setInputFiles(CV);await T(q,1500);
console.log('K2 cv',JSON.stringify(await q.evaluate(()=>me().profile.cv)),'ready',await q.evaluate(()=>pstat(me()).pct));
// apply j4 (external)
await q.goto(U+'#ilan-j4');await T(q,600);
const ok=await q.evaluate(()=>{var j=jobById('j4');S.k.ans={};visibleQs(j.qs,{}).forEach(q=>{S.k.ans[q.id]=q.type==='single'?(qOpts(q,false)[0]):q.type==='multi'?[qOpts(q,false)[0]]:'Test yanıt'});S.k.kvkk=true;return submitApp(me(),j)});await T(q,1500);
console.log('K3 apply',ok,JSON.stringify(await st(q)));
// ---- security probes from candidate
const probe=async(body)=>q.evaluate(async b=>{const r=await fetch('/api/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});const j=await r.json();return r.status+' '+(j.err||'')},body);
console.log('P1 demote admin:',await probe({users:{upsert:[{email:'metin.usta@derimod.com',arole:''}]}}));
console.log('P2 self exec:',await probe({users:{upsert:[{email:'ayse.aday@gmail.com',arole:'exec',role:'calisan'}]}}),'->',await q.evaluate(async()=>{const r=await (await fetch('/api/state')).json();return r.state.users.map(u=>u.email+':'+u.arole+':'+u.role).join(',')}));
console.log('P3 app for other:',await probe({apps:{upsert:[{id:'zz1',email:'can.demir@derimod.com',jobId:'j4'}]}}));
console.log('P4 job edit:',await probe({jobs:{upsert:[{id:'j4',title:'HACK'}]}}));
console.log('P5 internal job apply:',await probe({apps:{upsert:[{id:'zz2',email:'ayse.aday@gmail.com',jobId:'j1'}]}}));
console.log('P6 cv of admin:',await q.evaluate(async()=>(await fetch('/api/cv?email=metin.usta@derimod.com')).status));
console.log('P7 cand state users/jobs/apps:',await q.evaluate(async()=>{const r=(await (await fetch('/api/state')).json()).state;return r.users.length+'/'+r.jobs.map(j=>j.id).join(',')+'/'+r.apps.length+' notes:'+JSON.stringify(r.apps[0]&&r.apps[0].notes)}));
console.log('P8 mail test:',await q.evaluate(async()=>(await fetch('/api/mail/test',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"k":"davet"}'})).status));
// ---- admin works the app
await p.reload();await T(p,900);
console.log('A7 sees apps',await p.evaluate(()=>DB.apps.filter(a=>!a.demo).map(a=>a.email+':'+a.status).join(',')));
await p.evaluate(()=>{var a=DB.apps.filter(a=>a.email==='ayse.aday@gmail.com')[0];setStage(a,'on_eleme');setStage(a,'gorusme');a.notes=(a.notes||[]).concat([{by:me().email,name:me().name,at:Date.now(),t:'Güçlü aday'}]);a.ratings[me().email]=4;save()});await T(p,1500);
console.log('A8',await p.evaluate(()=>{var a=DB.apps.filter(a=>a.email==='ayse.aday@gmail.com')[0];return a.status+' notes:'+a.notes.length+' r:'+JSON.stringify(a.ratings)+' hist:'+a.history.length}),JSON.stringify((await st(p)).outbox.slice(0,4)));
console.log('V1 inline hdr:',await p.evaluate(async()=>{const r=await fetch('/api/cv?inline=1&email=ayse.aday@gmail.com');return r.status+' '+r.headers.get('content-disposition')+' '+r.headers.get('content-type')}));
console.log('V2 cand own inline:',await q.evaluate(async()=>{const r=await fetch('/api/cv?inline=1');return r.status+' '+r.headers.get('content-disposition')}));
console.log('V3 cand other inline:',await q.evaluate(async()=>(await fetch('/api/cv?inline=1&email=metin.usta@derimod.com')).status));
await q.evaluate(()=>{location.hash="#profil";window.__o=[];window.open=function(u){window.__o.push(u);return null}});await T(q,700);
const [pop]=await Promise.all([q.context().waitForEvent('page',{timeout:4000}).catch(()=>null),q.click("[data-act=cvView]").catch(e=>console.log('noBtn',e.message))]);
if(pop){await pop.waitForTimeout(1500)};console.log("V4 open:",await q.evaluate(()=>JSON.stringify(window.__o)));
console.log('AI0 sampleOK',await q.evaluate(()=>S.sampleOK+' '+!!SAMPLE));
await q.evaluate(()=>cvxRun('ai'));await T(q,300);
console.log('C1 consent panel:',await q.evaluate(()=>S.cvx.status),await q.$$eval('[data-ok="1"]',e=>e.length));
await q.screenshot({path:require('path').join(__dirname,'..','build','cvx_consent.png')});
console.log('C2 no-consent api:',await q.evaluate(async()=>{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'cv',text:'x'.repeat(200)})});return r.status+' '+(await r.json()).err}));
await q.click('[data-ok="1"]');await T(q,2500);
console.log('AI1 cand',await q.evaluate(()=>JSON.stringify({st:S.cvx&&S.cvx.status,msg:S.cvx&&S.cvx.msg,keys:S.cvx&&S.cvx.g&&Object.keys(S.cvx.g)})));
console.log('AI2 cand crit (no perm):',await q.evaluate(async()=>(await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"kind":"crit","jobId":"j4"}'})).status));
await p.evaluate(()=>{S.ats=S.ats||{job:'j4',cs:[],cc:[]};claudeCrit(jobById('j4'))});await T(p,2000);
console.log('AI3 admin crit',await p.evaluate(()=>JSON.stringify(jobById('j4').crit)+' err:'+S.ats.critErr));
console.log('C3 consent recs:',await p.evaluate(async()=>{const r=await (await fetch('/api/consents')).json();return r.records.filter(x=>x.doc==='yz_anlik').map(x=>x.email+' '+x.v+' '+x.via+' '+x.hash.slice(0,8)).join(' | ')}));
console.log('A9 admin cv dl:',await p.evaluate(async()=>{const r=await fetch('/api/cv?email=ayse.aday@gmail.com');return r.status+' '+(await r.arrayBuffer()).byteLength}));
await q.reload();await T(q,900);console.log('K4 cand sees status',await q.evaluate(()=>DB.apps.map(a=>a.status+'/notes:'+a.notes.length+'/ratings:'+JSON.stringify(a.ratings)).join(',')));
// logout + trusted device
await q.evaluate(()=>document.querySelector('[data-act=logout]').click());await T(q,900);
console.log('K5 after logout me',await q.evaluate(()=>DB.session),'users',await q.evaluate(()=>DB.users.length));
await q.goto(U+'#giris');await T(q,500);await q.fill('#f-email','ayse.aday@gmail.com');await sub(q);await T(q,500);
await q.fill('#f-pw','Kariyer2026Yol');await sub(q);await T(q,800);console.log('K6 step after pw (trusted from setpw? no trust box)',await q.evaluate(()=>S.L.step+' '+!!(DB.session)));
if(await q.evaluate(()=>S.L.step)==='otp'){code=await q.evaluate(()=>S.devCode);await q.fill('#f-otp',code);const tb=await q.$('#f-trust');if(tb)await tb.check();await sub(q);await T(q,800)}
console.log('K7 logged',await q.evaluate(()=>!!DB.session));
await q.evaluate(()=>document.querySelector('[data-act=logout]').click());await T(q,800);
await q.goto(U+'#giris');await T(q,500);await q.fill('#f-email','ayse.aday@gmail.com');await sub(q);await T(q,500);await q.fill('#f-pw','Kariyer2026Yol');await sub(q);await T(q,800);
console.log('K8 trusted direct login',await q.evaluate(()=>!!DB.session));
// lockout
const C2=await mk();let r=C2.p;await r.goto(U+'#giris');await T(r,500);await r.fill('#f-email','ayse.aday@gmail.com');await sub(r);await T(r,400);
for(let i=0;i<5;i++){await r.fill('#f-pw','yanlis'+i);await sub(r);await T(r,350)}console.log('L1',await r.evaluate(()=>S.L.err));
console.log('C1 export:',await p.evaluate(async()=>{const r=await (await fetch('/api/consents')).json();return r.ok+' n='+r.records.length+' | '+r.records.map(x=>x.email+':'+x.doc+':'+x.via+':'+x.v+':'+x.lang+':ip='+x.ip+':ua='+(x.ua||'').slice(0,20)+':h='+(x.hash||'').slice(0,8)).join(' | ')}));
console.log('C2 cand export forbidden:',await q.evaluate(async()=>(await fetch('/api/consents')).status));
await p.goto(U+'#yonetim');await T(p,600);const [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-act=cnExport]')]);console.log('C3 csv',dl.suggestedFilename(),require('fs').readFileSync(await dl.path(),'utf8').split('\n').slice(0,2).join(' // ').slice(0,300));
console.log('errs',errs);await b.close()})();
