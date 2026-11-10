# Derimod TalentX — geliştirici ve Claude Code devir notu

Derimod İnsan ve Kültür ekibinin yetenek platformu. Sahibi: Metin Usta (İnsan ve Kültür Direktörü).
Kariyer sayfası, iç ve dış aday başvuruları (ATS), yetenek profili, kariyer yolları (iş mimarisi),
Talent Review ve çalışan deneyimi içerikleri tek uygulamada. Arayüzün tamamı Türkçedir.

Bu dosya, depoya bağlanan her yeni Claude Code oturumunun ve geliştiricinin başlangıç noktasıdır.
Kod değiştirmeden önce sonuna kadar oku.

---

## 1. Altın kurallar

1. **Tek kaynak `source/src.html`.** `site/index.html` ve `api/src/core.client.js` bu dosyadan
   üretilir; ikisini asla elle düzenleme. Her değişiklikten sonra `python3 source/build.py` çalıştır
   ve üretilen dosyaları da commit'e ekle.
2. **İş kuralları tek yerde.** Yetkiler (`PERMS`, `can`, `canSeeApp`), başvuru akışı (`submitApp`,
   `setStage`), e-posta şablonları (`MT`, `mailBuild`) ve onay metinleri (`CN`) istemci kodunda
   yazılıdır. Sunucu aynı kodu Node `vm` içinde çalıştırır (`api/src/core.js`). Kuralı sunucuya
   ayrıca kopyalama; `src.html`'de değiştir.
3. **Sunucu her şeyi yeniden denetler.** İstemciden gelen hiçbir değişikliğe güvenilmez;
   `api/src/sync.js` alan bazında yetki kontrolü yapar. Yeni bir veri alanı eklediğinde
   `sync.js`'te kimin değiştirebileceğini de tanımla.
4. **Gizli bilgi yok.** Bağlantı anahtarları, şifreler ve token'lar depoya, koda, sohbete ya da
   e-postaya yazılmaz. Yalnızca Azure Static Web Apps → Environment variables'a IT girer.
5. **`DEV_SHOW_CODES` yalnızca yerelde.** Doğrulama kodlarını yanıtta döndürür; canlıda asla
   tanımlanmaz.
6. **KVKK metinleri hukuki metindir.** `CN` içindeki bir metni değiştirirsen `CN.v` sürümünü
   yükselt; böylece kullanıcılardan yeniden onay alınır. Metin değişikliklerini Metin Usta'nın
   onayı olmadan yapma; hukuk teyidi gerekebilir.
7. **Onay kayıtları yalnızca eklenir.** `consent` ve `cntext` bölümlerindeki kayıtlar silinmez,
   değiştirilmez.
8. **Kullanıcı verisi asla ham HTML olarak basılmaz.** Arayüze giden her değişken `esc()`'den
   geçer; bağlantılar yalnızca `https?:` ile, CSV hücreleri yalnızca `csvQ()` ile üretilir. Satır
   içi `on*=` olay işleyicisi, `eval`, `new Function` ve ikinci bir `<script>` bloğu eklenmez
   (canlı sürümün CSP'si buna izin vermez). Güvenlik bölümüne (§5a) bak.

---

## 2. Dosya haritası

```
derimod-talentx-site/
├─ CLAUDE.md                 bu dosya
├─ source/
│  ├─ src.html               TEK KAYNAK: arayüz + uygulama kodu (HTML/CSS/JS, tek dosya)
│  ├─ logo.svg               Derimod logosu; derlemede __LOGO__ yerine konur
│  ├─ vendor/                pdf.js 3.11.174 ve SheetJS 0.18.5 (canlıda site/vendor'a kopyalanır)
│  └─ build.py               derleme betiği
├─ site/                     yayınlanan sayfa
│  ├─ index.html             ÜRETİLİR (build.py) — CSP ile
│  ├─ vendor/                ÜRETİLİR (build.py, source/vendor'dan)
│  ├─ staticwebapp.config.json  güvenlik başlıkları
│  └─ README.md
├─ api/                      sunucu: Azure Functions v4, Node 20 (SWA yönetilen API)
│  ├─ package.json, host.json
│  ├─ dev-server.js          yerel sunucu (sayfayı ve /api'yi aynı porttan sunar)
│  └─ src/
│     ├─ index.js            tek HTTP route: /api/{*path}
│     ├─ handler.js          tüm uç noktalar
│     ├─ core.js             core.client.js'i vm içinde çalıştırır (DOM taklidi)
│     ├─ core.client.js      ÜRETİLİR (build.py) — elle düzenleme
│     ├─ state.js            veritabanı yükleme/kaydetme, kullanıcıya göre süzme (view), e-posta kuyruğu
│     ├─ sync.js             istemciden gelen değişiklikleri yetki kontrolüyle uygular
│     ├─ auth.js             giriş, OTP, şifre, oturum, güvenilen cihaz
│     ├─ store.js            Azure Table/Blob ya da bellek içi depo
│     ├─ mailer.js           Azure Communication Services Email
│     ├─ clean.js            kullanıcı metni temizleme ve biçim doğrulama (güvenlik)
│     └─ ai.js               Azure OpenAI (akıllı okuma)
└─ tests/
   ├─ run.sh                 derle + yerel sunucu + sahte Azure OpenAI + uçtan uca test
   ├─ e2e-server.js          Playwright senaryosu
   ├─ mock-openai.js         sahte Azure OpenAI
   ├─ security.sh            güvenlik testleri (sanitize.js, csp-check.js, xss-fuzz.js)
   └─ fixtures/ornek-cv.pdf  kurgusal test özgeçmişi
```

`build/` klasörü derlemede oluşur ve depoya girmez: `build/preview.html` Claude önizlemesi
(artifact) içindir, `build/e2e.log` son test çıktısıdır.

---

## 3. Mimari

### İki çalışma modu (aynı kod)
- **Sunucu modu** (`SERVER=true`): alan adı `azurestaticapps.net`, `derimod.com` ya da `localhost`
  ise ya da adreste `?server=1` varsa. Veriler `/api/*` üzerinden sunucuda.
- **Yerel/önizleme modu** (`SERVER=false`): `?local=1` ile ya da Claude önizlemesinde. Veriler
  tarayıcının `localStorage`'ında (`derimodLife.proto.v1`), e-postalar ekrandaki "Demo posta
  kutusu"nda. Demo ve tasarım denemeleri için kullanılır; gerçek veri girilmez.

### İstemci → sunucu akışı
- Açılışta `GET /api/state` → kullanıcının görmeye yetkili olduğu veri (`state.view`).
- İstemci `DB` üzerinde değişiklik yapar, `save()` → `srvSave()` farkı (`diffOf`) 450 ms sonra
  `POST /api/sync` ile gönderir. Sunucu yetkiyi kontrol eder, uygular, kaydeder ve güncel
  `state`'i döner.
- Giriş akışları `/api/auth/*` (start, register, password, verify, setpw, forgot, resend, logout).

### Uç noktalar (`api/src/handler.js`)
| Uç nokta | Ne yapar | Yetki |
|---|---|---|
| `GET health` | depo/e-posta/yapay zekâ durumu | herkes |
| `GET state` | kullanıcıya göre süzülmüş veri | herkes (anonime yalnızca yayındaki dış ilanlar) |
| `POST auth/*` | giriş, kayıt, OTP, şifre | herkes |
| `POST sync` | veri değişiklikleri | oturum + alan bazında yetki |
| `GET consents` | onay kayıtları dışa aktarımı | `users` ya da `audit` |
| `POST mail/remind` | profil hatırlatma e-postası | `talent` |
| `POST mail/test` | şablon test e-postası (kendine) | `mail` |
| `POST/GET cv` | CV yükleme/indirme/görüntüleme (`?inline=1`) | kendisi, `talent` ya da başvuruyu görebilen |
| `POST ai` | akıllı okuma: `kind:'cv'` (onay şart) / `kind:'crit'` | oturum; `crit` için `jobs` |

### Depolama (Azure Table Storage, tablo `talentx`)
Bölümler (PartitionKey): `user`, `job`, `app`, `cfg` (analytics, mailCfg, prList, seq),
`tdemo`, `audit`, `outbox`, `cred`, `otp`, `sess`, `consent`, `cntext`, `ailim` (günlük akıllı
okuma sayacı). JSON değerler 30 000 karakterlik `j0..jn` alanlarına bölünür. `audit`, `outbox`,
`consent` satır anahtarları ters zaman damgasıdır (en yeni önce).
CV dosyaları Blob container `cv` içinde, adı e-postanın SHA-256 özeti. Kaldırılan ya da silinen
kullanıcının CV'si Blob'dan da silinir.
`STORAGE_CONNECTION_STRING` yoksa bellek içi depo kullanılır (`/api/health` → `"bellek (test)"`);
sunucu her yeniden başladığında veriler kaybolur.

### Kimlik doğrulama
PBKDF2-SHA256 (210 000 tur) şifre · 6 haneli OTP (SHA-256 özetiyle saklanır, 5 dk, 5 deneme,
30 sn yeniden gönderim aralığı) · 5 hatalı şifrede 15 dk kilit · `tx_s` oturum çerezi
(HttpOnly, Secure, SameSite=Lax, 8 saat) · `tx_d` güvenilen cihaz (30 gün).

### Kullanıcı kimlikleri
Çalışanlar `E` + sicil numarası (ör. `E10234`), dış adaylar `P` + sıra (ör. `P000001`).
Toplu içe aktarma (Excel/CSV) sicil sütununu kullanır.

### Roller (`PERMS` — `source/src.html`, "ROLLER VE YETKİLER")
Yönetim rolleri: `exec` (Executive Admin), `hr` (HR Admin), `rec` (Recruiter), `hm` (Hiring
Manager). Yetkiler: roles, users, type, jobs, apps, appsOwn, hmview, notes, talent, mail,
analytics, audit, system. Son Executive Admin kaldırılamaz; HR Admin Executive Admin atayamaz.

### KVKK ve onaylar (`CN` — "ÜYELİK SÖZLEŞMESİ VE AÇIK RIZA")
- Veri sorumluları (müşterek): Derimod Konfeksiyon Ayakkabı Deri Sanayi ve Tic. A.Ş. ve Derimod
  Deri Konfeksiyon Pazarlama Sanayi ve Tic. A.Ş.
- Metinler (TR/EN): `aydinlatma` (Aydınlatma Metni, 10 bölüm), `uyelik`, `riza_isleme`,
  `riza_aktarim`. Hepsi zorunlu; sürüm `CN.v`. Sürüm değişince kullanıcı `V.onay` ekranında
  yeniden onaylar.
- Akıllı doldurma için kullanım anında ayrı onay: `CN.ai` (`yz_anlik`). Sunucu `consent:true`
  olmadan isteği reddeder ve onayı kayda yazar.
- Her onay kaydı: tarih, e-posta, kullanıcı ID, metin, sürüm, dil, onay adımı, IP, tarayıcı,
  metnin SHA-256 özeti. Metnin kendisi `cntext`'te sürüm başına bir kez saklanır.

### Akıllı okuma
PDF metni tarayıcıda pdf.js (3.11.174; canlıda kendi alanımızdan, önizlemede cdnjs) ile çıkarılır. Temel okuma kural tabanlıdır ve
her zaman çalışır. Akıllı okuma yalnızca Azure OpenAI tanımlıysa görünür; dosya değil yalnızca
metin gönderilir, öneriler kullanıcı onaylamadan profile yazılmaz. Taranmış PDF ve Word (.docx) dosyaları
okunmaz (yalnızca saklanır). Kişi başı günlük sınır `AI_DAILY_LIMIT` (varsayılan 20).

---

## 4. Ortam değişkenleri (SWA → Environment variables)

| Değişken | Amaç |
|---|---|
| `STORAGE_CONNECTION_STRING` | Table + Blob (yoksa bellek içi test deposu) |
| `TABLE_NAME` | varsayılan `talentx` |
| `ACS_CONNECTION_STRING`, `MAIL_SENDER` | e-posta gönderimi |
| `SITE_URL` | e-postalardaki bağlantıların kökü (sonunda `/`) |
| `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_KEY`, `AZURE_OPENAI_DEPLOYMENT` | akıllı okuma |
| `AZURE_OPENAI_API_VERSION` | varsayılan `2024-10-21` |
| `AI_DAILY_LIMIT` | kişi başı günlük akıllı okuma hakkı |
| `DEV_SHOW_CODES` | **yalnızca yerel test** |

Durum kontrolü: `https://<alan-adı>/api/health` (sitenin klasör yolu olmadan, kökte).

---

## 5. Geliştirme döngüsü

```bash
# ilk kurulum
(cd api && npm install)
(cd tests && npm install)            # pdfjs-dist; Playwright + Chromium ortamda kurulu olmalı

# her değişiklikten sonra
python3 source/build.py              # üretir + JS sözdizimi denetimi
./tests/run.sh                       # uçtan uca test; sonunda "SONUÇ: sayfa hatası yok" görmeli

# elle denemek için
(cd api && DEV_SHOW_CODES=1 node dev-server.js)   # http://localhost:4280/
```

Test senaryosu (`tests/e2e-server.js`) şunları doğrular: yönetici ilk girişi ve onaylar, kullanıcı
ekleme ve rol atama, aday kaydı, profil, CV yükleme/görüntüleme, başvuru, ATS aşama ve not,
adayın iç notları görememesi, yetkisiz CV erişiminin engellenmesi, akıllı okuma onayı ve
günlük akış, onay kayıtları ve CSV dışa aktarımı, güvenilen cihazla giriş.
Yeni bir özellik eklediğinde senaryoya kontrolünü de ekle.

### 5a. Güvenlik (XSS ve veri sızıntısına karşı katmanlar)
Kasım 2026'da "sahte CV ile blind XSS" senaryosuna karşı denetlendi. Katmanlar:
1. **Çıktı kaçışı:** tüm şablonlarda `esc()`; tarih (`dLong`), e-posta düğmesi (`mBtn`), etkinlik
   bağlantıları dahil. E-posta önizlemesi `sandbox` iframe'de (betik çalışmaz).
2. **Sunucu tarafı temizleme (`api/src/clean.js`):** kullanıcıdan gelen tüm metinlerde `<`/`>` →
   `‹`/`›`, kontrol karakterleri silinir, `__proto__` anahtarları atılır. İlan kimliği
   `[A-Za-z0-9_-]`, son başvuru `YYYY-AA-GG`, ilan bağlantısı yalnızca `https`, LinkedIn yalnızca
   `http(s)`. E-posta yalnızca güvenli karakterler (`EMAIL_RE`, istemci ve sunucuda aynı).
3. **CSP:** `build.py` canlı sayfaya, tek `<script>` bloğunun SHA-256 özetine dayalı katı bir
   İçerik Güvenlik Politikası ekler; pdf.js ve SheetJS `site/vendor/`'dan sunulur (üçüncü taraf
   CDN yok). Kaçış bir yerde unutulsa bile enjekte HTML çalışmaz.
4. **CV dosyaları:** tür, istemcinin bildirdiğine değil dosya imzasına göre belirlenir (yalnızca
   PDF ve DOCX; makro taşıyabilen `.doc` reddedilir). İndirme/görüntüleme yanıtı
   `Content-Security-Policy: sandbox` ve `nosniff` ile döner.
5. **CSV:** `=`, `+`, `-`, `@` ile başlayan hücreler metne çevrilir (Excel formül enjeksiyonu).
6. **Erişim:** veriler sunucuda role göre süzülür (`state.view`); aday iç notları/puanları göremez.

Güvenlik testleri: `./tests/security.sh` (sunucu temizleme + CSP + kayıtlı XSS taraması; tarama
~2 400 metin alanına zararlı HTML ekleyip yönetici ve aday görünümündeki tüm sayfa/çekmeceleri gezer).
Arayüze yeni bir veri alanı eklediğinde bu testi çalıştır.

Görsel değişikliklerde ayrıca kontrol et: 1280 px ve 390 px (mobil) genişlikte yatay kaydırma
olmamalı; metin/arka plan kontrastı WCAG AA'yı sağlamalı.

### Tasarım dili
Derimod tasarım sistemi: Poppins (gövde) ve Archivo (başlık); ana renk mor `#AC0065`,
vurgu vermilyon `#FF4B00`. Logoda "Derimod | TALENT X" kilidi; X'in vaadi: dijital becerilerle
donatılmış yetenek deneyimi (Vizyon 2030 · Kültürel Dönüşüm). Adaylara "sen" diliyle hitap edilir.
Arayüzde belirli bir yapay zekâ markası adı kullanılmaz ("Akıllı doldur", "Akıllı analiz et").

---

## 6. Dağıtım

GitHub Actions (Azure Static Web Apps CI/CD) `main`'e her push'ta yayınlar. API klasörü Oryx ile
derlenir ve SWA'nın **yönetilen Functions**'ı olarak çalışır; portalda ayrı bir Function App
kaynağı görünmez (SWA → APIs → "Managed").

Eski depoda (kenan-ular/swa-hr-linkedin) iş akışı `app_location: "/"`,
`api_location: "derimod-talentx-site/api"` idi ve site `/derimod-talentx-site/site/` altında
yayınlanıyordu.

**Derimod kurumsal GitHub hesabındaki yeni depoya taşırken:**
- `app_location` olarak `site` klasörünü göster (ör. `derimod-talentx-site/site` ya da depo kökü
  bu klasörse `site`). Böylece `source/`, `tests/` ve bu dosya web'e açılmaz ve
  `site/staticwebapp.config.json` güvenlik başlıkları uygulanır. Bu dosyaya
  `"platform": {"apiRuntime": "node:20"}` satırını ekle.
- `api_location` → `api` klasörü.
- Site yeni alan adının köküne taşınınca `SITE_URL` ortam değişkenini güncelle
  (`source/src.html` içindeki `SITE_URL` yedek değeri ile `api/src/core.js`'teki varsayılan da eski
  adrestir).
- SSO eklenecekse Entra yönlendirme adresi: `https://<alan-adı>/.auth/login/aad/callback`.

---

## 7. Bekleyen işler

- [ ] IT: yeni depo (Derimod GitHub) + Claude GitHub uygulamasının bu depoya kurulumu.
- [ ] IT: yeni subdomain; ardından Storage Account, ACS Email, Azure OpenAI (Avrupa, EU Data Zone).
- [ ] Kurulum sonrası canlı test: `/api/health` → `"Azure Storage"`, `"hazır"`, `"hazır"`;
      gerçek kayıt, OTP e-postası, onay kayıtlarında IP.
- [ ] Microsoft Entra ID ile tek oturum (@derimod.com). Kişisel e-postalı mağaza çalışanları
      şifre + OTP ile devam eder. SWA Standard plan gerekir. Tenant ID ve Client ID gelince
      kodlanacak (henüz yok).
- [ ] Hukuk: şirket adres/KEP bilgileri, saklama süreleri, zorunlu rızaların değerlendirilmesi,
      Azure OpenAI veri saklama koşulları ve "model eğitiminde kullanılmaz" ifadesinin teyidi,
      "TalentX" adı için TÜRKPATENT araştırması (sınıf 35, 41, 42).
- [ ] Analitik panolar: Business Line eşleşmesiyle ayrı yayın (şu an erişime kapalı).
- [ ] Potansiyel Değerlendirmesi (2027) ve `pr_davet` e-posta içeriği.
- [ ] İsteğe bağlı: taranmış PDF için Azure AI Document Intelligence; "Dijital beceriler" beceri
      grubu ve sloganın ana sayfaya eklenmesi (öneri aşamasında).
- [ ] Ölçek: tüm veri her istekte yükleniyor (`state.loadDB`). Birkaç bin kullanıcıya kadar
      yeterli; ötesi ya da Power BI/Oracle entegrasyonu için Azure SQL'e geçiş `store.js`
      üzerinden yapılır.

---

## 8. Çalışma biçimi

- Metin Usta teknik değil, karar verici. Açıklamaları Türkçe, sade ve sonuç odaklı yaz; ne
  değiştiğini ve neyin test edildiğini söyle, adımları uzun uzun anlatma.
- IT'ye gidecek talepleri hazır e-posta metni olarak ver; anahtarların e-postayla
  gönderilmemesini her seferinde hatırlat.
- Değişiklikleri küçük commit'lerle ve açıklayıcı Türkçe mesajlarla yap; yayına girecek her
  değişiklikten önce `./tests/run.sh` çalıştır.
