// Yerel geliştirme sunucusu: index.html'i sunar ve /api/* isteklerini Azure Functions ile aynı işleyiciye iletir.
// Kullanım: node dev-server.js  (STORAGE_CONNECTION_STRING yoksa bellek içi depo kullanılır)
const http = require('http'), fs = require('fs'), path = require('path');
const { handler } = require('./src/handler');
const ROOT = path.join(__dirname, '..');
const PORT = +process.env.PORT || 4280;
function cookieStr(c) { let s = c.name + '=' + encodeURIComponent(c.value) + '; Path=' + (c.path || '/'); if (c.maxAge !== undefined) s += '; Max-Age=' + Math.floor(c.maxAge); if (c.httpOnly) s += '; HttpOnly'; if (c.secure) s += '; Secure'; if (c.sameSite) s += '; SameSite=' + c.sameSite; return s; }
http.createServer(async (rq, rs) => {
  const url = new URL(rq.url, 'http://localhost:' + PORT);
  if (url.pathname.startsWith('/api/')) {
    const chunks = []; for await (const c of rq) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    const req = { method: rq.method, url: url.href, params: { path: url.pathname.slice(5) }, query: url.searchParams,
      headers: { get: (k) => rq.headers[k.toLowerCase()] || null }, json: async () => JSON.parse(raw || '{}') };
    const r = await handler(req);
    const h = Object.assign({}, r.headers || {});
    if (r.jsonBody !== undefined) h['Content-Type'] = 'application/json; charset=utf-8';
    if (r.cookies && r.cookies.length) h['Set-Cookie'] = r.cookies.map(cookieStr);
    rs.writeHead(r.status || 200, h);
    rs.end(r.jsonBody !== undefined ? JSON.stringify(r.jsonBody) : r.body);
    return;
  }
  const f = fs.existsSync(path.join(ROOT, 'site', 'index.html')) ? path.join(ROOT, 'site', 'index.html') : path.join(ROOT, 'index.html');
  rs.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); fs.createReadStream(f).pipe(rs);
}).listen(PORT, () => console.log('TalentX yerel sunucu: http://localhost:' + PORT));
