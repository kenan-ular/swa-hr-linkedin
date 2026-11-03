// Sitenin uygulama kodunu (core.client.js) sunucuda yalıtılmış bir bağlamda çalıştırır.
// Böylece yetki kuralları, profil hesabı, ID ataması ve e-posta şablonları tek bir kaynaktan gelir.
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const nodeCrypto = require('crypto');

process.env.TZ = process.env.TZ || 'Europe/Istanbul';

function stub() {
  const f = function () { return P; };
  const P = new Proxy(f, {
    get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'then' ? undefined : P),
    apply: () => P, construct: () => P, set: () => true
  });
  return P;
}

let CORE = null;
function core() {
  if (CORE) return CORE;
  const code = fs.readFileSync(path.join(__dirname, 'core.client.js'), 'utf8');
  const site = process.env.SITE_URL || 'https://zealous-pond-00b82b103.5.azurestaticapps.net/derimod-talentx-site/site/';
  const su = new URL(site);
  const host = su.hostname;
  const ctx = {
    window: { __TX_CORE__: true, addEventListener() {} },
    location: { hostname: host, origin: su.origin, pathname: su.pathname, hash: '', search: '' },
    document: stub(), navigator: {},
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    crypto: nodeCrypto.webcrypto, setInterval: () => 0, clearInterval() {}, setTimeout, clearTimeout, console,
    matchMedia: () => ({ matches: false, addEventListener() {} }), MutationObserver: function () { this.observe = () => {}; },
    URL, TextEncoder, TextDecoder, atob, btoa, Intl, Blob: function () {}, fetch: () => Promise.reject(new Error('no fetch'))
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext(code + '\n;globalThis.__X={get DB(){return DB},set DB(v){DB=v},get S(){return S}};', ctx, { filename: 'core.client.js' });
  CORE = ctx;
  return ctx;
}

// Sunucunun kullandığı ortak işlevler (tümü sitenin kendi kodundan gelir)
function X() { return core(); }

module.exports = { core, X };
