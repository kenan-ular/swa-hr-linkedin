// Kullanıcıdan gelen metinler için ikinci savunma hattı.
// Arayüz her değeri zaten kaçışlayarak (esc) basar; burada ek olarak veritabanına HTML/komut
// karakterleri hiç girmez. Böylece veriyi ileride okuyacak başka sistemler (rapor, Excel, Oracle
// aktarımı vb.) de korunur.
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u2028\u2029]/g;
function txt(v) { return String(v == null ? '' : v).replace(CTRL, '').replace(/</g, '‹').replace(/>/g, '›'); }
function deep(o, depth) {
  depth = depth || 0; if (depth > 12) return null;
  if (typeof o === 'string') return txt(o);
  if (Array.isArray(o)) return o.slice(0, 500).map((x) => deep(x, depth + 1));
  if (o && typeof o === 'object') { const r = {}; Object.keys(o).slice(0, 200).forEach((k) => { if (k === '__proto__' || k === 'constructor' || k === 'prototype') return; r[txt(k).slice(0, 80)] = deep(o[k], depth + 1); }); return r; }
  return o;
}
const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const ID_RE = /^[A-Za-z0-9_\-]{1,40}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const httpsUrl = (u) => (/^https:\/\/[^\s"'<>]+$/i.test(String(u || '').trim()) ? String(u).trim().slice(0, 500) : '');
const webUrl = (u) => { u = String(u || '').trim(); if (!u) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u.slice(0, 300) : ''; };
module.exports = { txt, deep, EMAIL_RE, ID_RE, DATE_RE, httpsUrl, webUrl };
