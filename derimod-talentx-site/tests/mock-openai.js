// Sahte Azure OpenAI uç noktası (yalnızca test). Gerçek anahtar gerektirmez.
require('http').createServer((q,r)=>{let b='';q.on('data',c=>b+=c);q.on('end',()=>{const j=JSON.parse(b);const p=j.messages[1].content;console.log('MOCK',q.url.slice(0,80),q.headers['api-key'],p.slice(0,60).replace(/\n/g,' '));
const out=/iş ilanı/.test(p)?{skills:['Excel'],comps:[]}:{phone:'0555 111 22 33',city:'İstanbul',skills:['Excel','SAP'],langs:[{lang:'İngilizce',level:'İleri'}]};
r.setHeader('Content-Type','application/json');r.end(JSON.stringify({choices:[{message:{content:JSON.stringify(out)}}]}))})}).listen(+process.env.MOCK_PORT||4399);
