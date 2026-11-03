// E-posta gönderimi: Azure Communication Services Email.
// ACS_CONNECTION_STRING ve MAIL_SENDER tanımlı değilse gönderim yapılmaz (kayıt "yapılandırılmadı" olur).
let client = null;
function acs() {
  if (client !== null) return client;
  const conn = process.env.ACS_CONNECTION_STRING;
  if (!conn || !process.env.MAIL_SENDER) { client = false; return client; }
  const { EmailClient } = require('@azure/communication-email');
  client = new EmailClient(conn);
  return client;
}
function plain(html) {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<div style="display:none[\s\S]*?<\/div>/i, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|h1|tr|div|table)>/gi, '\n')
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&shy;/g, '')
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
async function send(to, subject, html) {
  const c = acs();
  if (!c) return { st: 'yapilandirilmadi' };
  try {
    await c.beginSend({
      senderAddress: process.env.MAIL_SENDER,
      content: { subject, html, plainText: plain(html) },
      recipients: { to: [{ address: to }] }
    });
    return { st: 'gonderildi' };
  } catch (e) {
    return { st: 'hata', err: String(e && e.message || e).slice(0, 300) };
  }
}
function configured() { return !!acs(); }
module.exports = { send, plain, configured };
