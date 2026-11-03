// Kalıcı depolama: Azure Table Storage (kayıtlar) + Azure Blob Storage (CV dosyaları).
// Bağlantı yoksa (yerel test) bellek içi depo kullanılır.
const CH = 30000; // tek bir tablo alanına sığacak karakter sayısı

function pack(obj) {
  const s = JSON.stringify(obj);
  const e = {}; let i = 0;
  for (let p = 0; p < s.length; p += CH, i++) e['j' + i] = s.slice(p, p + CH);
  e.n = i;
  return e;
}
function unpack(e) {
  let s = '';
  for (let i = 0; i < (e.n || 0); i++) s += e['j' + i] || '';
  return s ? JSON.parse(s) : null;
}
const enc = (k) => encodeURIComponent(k);
const dec = (k) => decodeURIComponent(k);

class TableStore {
  constructor(conn, name) {
    const { TableClient } = require('@azure/data-tables');
    this.t = TableClient.fromConnectionString(conn, name || 'talentx', { allowInsecureConnection: /UseDevelopmentStorage|127\.0\.0\.1|localhost/.test(conn) });
    this.ready = this.t.createTable().catch((e) => { if (e.statusCode !== 409) throw e; });
  }
  async get(pk, rk) {
    await this.ready;
    try { return unpack(await this.t.getEntity(pk, enc(rk))); }
    catch (e) { if (e.statusCode === 404) return null; throw e; }
  }
  async put(pk, rk, obj) { await this.ready; await this.t.upsertEntity({ partitionKey: pk, rowKey: enc(rk), ...pack(obj) }, 'Replace'); }
  async del(pk, rk) {
    await this.ready;
    try { await this.t.deleteEntity(pk, enc(rk)); } catch (e) { if (e.statusCode !== 404) throw e; }
  }
  async list(pk, top) {
    await this.ready;
    const out = [];
    const it = this.t.listEntities({ queryOptions: { filter: `PartitionKey eq '${pk}'` } });
    for await (const e of it) { out.push({ rk: dec(e.rowKey), v: unpack(e) }); if (top && out.length >= top) break; }
    return out;
  }
}

class MemStore {
  constructor() { this.m = new Map(); }
  k(pk, rk) { return pk + '\u0000' + rk; }
  async get(pk, rk) { const v = this.m.get(this.k(pk, rk)); return v === undefined ? null : JSON.parse(v); }
  async put(pk, rk, obj) { this.m.set(this.k(pk, rk), JSON.stringify(obj)); }
  async del(pk, rk) { this.m.delete(this.k(pk, rk)); }
  async list(pk, top) {
    const out = [];
    [...this.m.keys()].filter((k) => k.startsWith(pk + '\u0000')).sort().forEach((k) => out.push({ rk: k.split('\u0000')[1], v: JSON.parse(this.m.get(k)) }));
    return top ? out.slice(0, top) : out;
  }
}

class BlobStore {
  constructor(conn, container) {
    const { BlobServiceClient } = require('@azure/storage-blob');
    this.c = BlobServiceClient.fromConnectionString(conn).getContainerClient(container || 'cv');
    this.ready = this.c.createIfNotExists();
  }
  async put(name, buf, type) { await this.ready; await this.c.getBlockBlobClient(name).uploadData(buf, { blobHTTPHeaders: { blobContentType: type || 'application/octet-stream' } }); }
  async get(name) {
    await this.ready;
    try { const b = this.c.getBlockBlobClient(name); const buf = await b.downloadToBuffer(); const p = await b.getProperties(); return { buf, type: p.contentType }; }
    catch (e) { if (e.statusCode === 404) return null; throw e; }
  }
  async del(name) { await this.ready; await this.c.getBlockBlobClient(name).deleteIfExists(); }
}
class MemBlob {
  constructor() { this.m = new Map(); }
  async put(name, buf, type) { this.m.set(name, { buf: Buffer.from(buf), type }); }
  async get(name) { return this.m.get(name) || null; }
  async del(name) { this.m.delete(name); }
}

let S = null;
function stores() {
  if (S) return S;
  const conn = process.env.STORAGE_CONNECTION_STRING;
  if (conn) S = { db: new TableStore(conn, process.env.TABLE_NAME || 'talentx'), blob: new BlobStore(conn, 'cv'), mem: false };
  else S = { db: new MemStore(), blob: new MemBlob(), mem: true };
  return S;
}
function setStores(s) { S = s; }

module.exports = { stores, setStores, MemStore, MemBlob, pack, unpack };
