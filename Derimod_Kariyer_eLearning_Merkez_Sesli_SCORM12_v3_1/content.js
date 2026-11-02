window.COURSE = {
  title: 'Derimod’da Kariyerini Yönet',
  sections: [
    { n: '00', t: 'Giriş' },
    { n: '01', t: 'Kariyer yaklaşımımız' },
    { n: '02', t: 'Derimod İş Mimarisi' },
    { n: '03', t: 'Kariyer yolları' },
    { n: '04', t: 'Kariyerini yönetmek için araçların' },
    { n: '05', t: 'İç aday sistemi' },
    { n: '06', t: 'Kapanış' }
  ],
  screens: [
    /* ---------------- GİRİŞ ---------------- */
    { sec: 0, type: 'cover', eyebrow: 'İnsan ve Kültür · Çevrim içi eğitim', title: 'Derimod’da kariyerini yönet',
      sub: 'İş Mimarisi, kariyer yolları ve kariyerini yönetmek için sana sunulan araçlar: GROW, kariyer konuşması, gelişim planı, yetenek değerlendirme ve iç aday sistemi.',
      meta: ['Yaklaşık 25 dakika', '5 bölüm', 'Kendini dene soruları'], start: 'Eğitime başla' },
    { sec: 0, type: 'objectives', eyebrow: 'Bu eğitimde', title: 'Eğitimin sonunda neler yapabileceksin?',
      items: [
        'Derimod’da kariyer gelişiminin neyle ölçüldüğünü açıklayabileceksin.',
        'İş Mimarisi’ni okuyabilecek; kendi rolünün ailesini, bandını ve profilini anlayabileceksin.',
        'Kariyerinin büyüyebileceği üç yönü ve ilerlemenin iki yolunu ayırt edebileceksin.',
        'GROW döngüsünü, kariyer konuşmasını ve 70-20-10 gelişim planını kendi kariyerin için kullanabileceksin.',
        'İç aday sistemiyle bir role nasıl hazırlanacağını ve nasıl başvuracağını bileceksin.'
      ],
      howto: [
        'Sağ alttaki İleri düğmesiyle ya da klavyedeki sağ ok tuşuyla ilerle.',
        'İçerik menüsünden istediğin bölüme geçebilirsin.',
        'Kendini dene sorularında puan yok; devam etmek için bir yanıt seçmen yeterli.',
        'Ara verirsen bir sonraki girişinde kaldığın yerden devam edebilirsin.'
      ] },

    /* ---------------- 01 ---------------- */
    { sec: 1, type: 'section', num: '01', title: 'Kariyer yaklaşımımız', sub: 'Kapsam ve etki alanıyla büyüyen kariyer; sen, yöneticin ve İnsan ve Kültür' },
    { sec: 1, type: 'fromto', eyebrow: 'Kariyer yaklaşımımız', title: 'Kariyer gelişimi, kapsam ve etki alanıyla ölçülür',
      sub: 'Derimod’da ilerlemek yalnızca bir üst unvana geçmek demek değildir.',
      from: 'Kıdem ve unvan', to: 'Kapsam ve etki alanı',
      big: 'Rolünün kapsamı ve etki alanı büyüdükçe kariyerin de büyür. <em>Yatay geçişler ve uzmanlıkta derinleşme</em> de bu yolun eşit değerdeki adımlarıdır.' },
    { sec: 1, type: 'cards', eyebrow: 'Kariyer yaklaşımımız', title: 'Derimod’un sana dört taahhüdü', cols: 4,
      sub: 'Çalışan Değer Önermemizdeki büyüme vaadi, kariyer sisteminde bu dört taahhüde dönüşür.',
      cards: [
        { n: '01', t: 'Fırsatlara açıklık', p: 'Açık roller şirket genelinde tüm çalışanlara duyurulur.' },
        { n: '02', t: 'Görünürlük', p: 'Hedeflerini, gelişimini ve kariyer tercihini HR Fusion’da izleyebilirsin.' },
        { n: '03', t: 'Şeffaf geçişler', p: 'Roller arası geçişin ölçütleri başvurmadan önce bellidir.' },
        { n: '04', t: 'Araç ve bilgi', p: 'Kariyerini yönetmen için gereken araçlar ve bilgi sana sunulur.' }
      ] },
    { sec: 1, type: 'columns', eyebrow: 'Sorumluluk paylaşımı', title: 'Kariyerinin sahibi sensin',
      sub: 'Yöneticin ve İnsan ve Kültür ekibi bu yolda yanında yer alır.',
      cols: [
        { t: 'Sen', s: 'Kariyerinin sahibi', items: ['Kariyer hedefini netleştirir, yöneticinle paylaşırsın.', 'HR Fusion yetenek profilini güncel tutarsın: ilgi alanların, kariyer tercihin, hareketlilik bilgin.', 'Gelişim planını sahiplenir, açık rolleri takip edersin.'] },
        { t: 'Yöneticin', s: 'Gelişiminin destekçisi', items: ['Kariyer konuşmasını açık ve destekleyici bir zeminde yapar.', 'Gelişimin için iş üzerinde fırsat yaratır, düzenli geri bildirim verir.', 'İç başvurunu destekler, olası geçişi birlikte planlar.'] },
        { t: 'İnsan ve Kültür', s: 'Yapının ve sürecin sahibi', items: ['İş Mimarisi’ni, rol profillerini ve ölçütleri şeffaf tutar.', 'İç ilanları ve değerlendirme sürecini yönetir.', 'Adil ve tutarlı değerlendirmeyi güvence altına alır.'] }
      ],
      callout: { t: 'Her aşamada bir muhatabın var', p: 'Kariyer hedefin, gelişim planın ya da bir iç başvuru hakkında sorun olduğunda İnsan ve Kültür İş Ortağınla görüşebilirsin.' } },
    { sec: 1, type: 'question', tag: 'Kendini dene · 1', q: 'Kariyer hedefini netleştirip yöneticinle paylaşmak öncelikle kimin sorumluluğudur?',
      opts: ['Yöneticinin', 'Senin', 'İnsan ve Kültür ekibinin'], correct: 1,
      ok: { t: 'Doğru.', p: 'Kariyerinin sahibi sensin. Yöneticin konuşmayı destekleyici bir zeminde yapar, İnsan ve Kültür yapıyı ve süreci şeffaf tutar; hedefi netleştirmek ise senin adımındır.' },
      no: { t: 'Tam olarak değil.', p: 'Yöneticin ve İnsan ve Kültür bu yolda yanında; ancak hedefini netleştirip paylaşmak kariyerinin sahibi olarak senin adımındır.' } },

    /* ---------------- 02 ---------------- */
    { sec: 2, type: 'section', num: '02', title: 'Derimod İş Mimarisi', sub: 'İş aileleri, kariyer bantları ve seviyeler, rol profilleri' },
    { sec: 2, type: 'cards', eyebrow: 'İş Mimarisi', title: 'İş Mimarisi üç soruya yanıt verir', cols: 3,
      sub: 'Derimod’daki her rol, Willis Towers Watson yaklaşımına benzer ortak bir dille tanımlanır.',
      cards: [
        { n: '01', t: 'İş ailesi', q: 'Hangi alanda çalışıyorum?', p: '13 iş ailesi ve 55 alt aile. Benzer bilgi ve beceri gerektiren işler aynı ailede yer alır.' },
        { n: '02', t: 'Kariyer bandı ve seviyesi', q: 'İşin büyüklüğü ne?', p: 'Altı bant ve her bantta seviyeler. İşin karmaşıklığını, sorumluluğunu ve etki alanını gösterir.' },
        { n: '03', t: 'İş profili', q: 'Rol benden ne bekler?', p: 'Görev tanımı, beceri ve yeterlilikler, i³ yetkinliklerinde hedef seviye.' }
      ],
      callout: { t: 'Sistem kişiye değil role odaklanır', p: 'Bir rolün yeri, rolün gerektirdikleriyle belirlenir. Kıdem, performans ya da kapasite gibi bireysel konular bu değerlendirmenin parçası değildir; onlar GROW döngüsünde ele alınır.' } },
    { sec: 2, type: 'bands', eyebrow: 'Kariyer bantları ve seviyeleri', title: 'Altı kariyer bandı',
      sub: 'İşin karmaşıklığı İş Destek bandından Yönetim Kurulu bandına doğru artar.',
      note: ['<b>Kariyer bandı</b> rolün şirkete nasıl katkı sağladığını ve sorumluluğunu anlatır.', '<b>Seviye</b> bu katkının derecesini anlatır.'],
      bands: [
        { name: 'İş Destek', code: 'B', n: 5, x: 3.4, y: 380, w: 28.8, color: '#F3D3E4', dark: true },
        { name: 'Mağaza Operasyon', code: 'O', n: 5, x: 21.6, y: 228, w: 28.8, color: '#C2508F' },
        { name: 'Uzmanlık Rolleri', code: 'S', n: 7, x: 27.9, y: 304, w: 40.4, color: '#D98AB6', dark: true },
        { name: 'Profesyonel', code: 'P', n: 5, x: 33.8, y: 152, w: 28.8, color: '#AC0065' },
        { name: 'Liderlik', code: 'M', n: 5, x: 51.8, y: 76, w: 28.8, color: '#871520' },
        { name: 'Yönetim Kurulu', code: 'Y', n: 4, x: 75.2, y: 0, w: 22.9, color: '#2E3A45' }
      ] },
    { sec: 2, type: 'reveal', eyebrow: 'Kariyer bantları ve seviyeleri', title: 'Her bandı yakından tanı',
      hint: 'Bandın tanımını ve unvan örneklerini görmek için soldaki başlıklara tıkla',
      items: [
        { label: 'İş Destek', color: '#F3D3E4', code: 'B1 – B5', desc: 'Diğer rolleri ve süreçleri destekler.', ex: 'Takım Asistanı · Yönetim Asistanı · Uzman Yardımcısı' },
        { label: 'Uzmanlık Rolleri', color: '#D98AB6', code: 'S1 – S7', desc: 'Mesleki eğitimle edinilen sertifikasyon ya da uzun yıllara dayalı mesleki tecrübe gerektirir.', ex: 'Kalite Kontrol · Modelist · Kıdemli Uzman · Kalıp Numune' },
        { label: 'Mağaza Operasyon', color: '#C2508F', code: 'O1 – O5', desc: 'Sahada satışa yönelik operasyonel görevleri yerine getirir.', ex: 'Satış / Kasa Danışmanı · Mağaza Müdür Yardımcısı · Mağaza Müdürü · Mağaza Bölge Lideri' },
        { label: 'Profesyonel', color: '#AC0065', code: 'P1 – P5', desc: 'Küçük bir ekip yönetebilir; sonuçları büyük ölçüde kendi çalışmasıyla üretir. Üst düzey bilgi birikimi gerektirir.', ex: 'Uzman / Analist · Kıdemli Uzman / Yönetmen · Müdür · Kıdemli Müdür' },
        { label: 'Liderlik', color: '#871520', code: 'M1 – M5', desc: 'Stratejiye katkıda bulunur, uygular; hedeflere kendi çalışmasından çok başkalarının çalışmasıyla ulaşır.', ex: 'Müdür · Kıdemli Müdür · Direktör · Kıdemli Direktör · Chief' },
        { label: 'Yönetim Kurulu', color: '#2E3A45', code: 'Y1 – Y4', desc: 'Derimod stratejisini tanımlar ve/veya önemli ölçüde etkiler.', ex: 'YK Üyesi · YK Başkan Yardımcısı · YK Başkanı' }
      ] },
    { sec: 2, type: 'families', eyebrow: 'İş aileleri', title: 'On üç iş ailesi',
      sub: 'Aileler arası geçiş de bir kariyer yoludur; hedef rolün ailesi, ihtiyaç duyacağın bilgi ve becerileri gösterir.',
      fams: [['YON', 'Üst Yönetim'], ['KAT', 'Kategori ve Ürün Yönetimi'], ['TED', 'Tedarik, Üretim ve Kalite'], ['MAG', 'Mağazacılık ve Perakende Operasyonları'], ['MGY', 'Mağaza Geliştirme ve Gayrimenkul'], ['ETI', 'E-Ticaret'], ['PAZ', 'Pazarlama ve Marka'], ['MUS', 'Müşteri, CRM ve Deneyim'], ['LOJ', 'Lojistik ve Dış Ticaret'], ['FIN', 'Finans, Denetim ve Kontrol'], ['INK', 'İnsan ve Kültür'], ['BTD', 'Bilgi Teknolojileri ve Dijital Dönüşüm'], ['IDR', 'İdari İşler ve Destek Hizmetleri']],
      stats: [[55, 'alt aile'], [191, 'tanımlı iş']] },
    { sec: 2, type: 'gate', eyebrow: 'Rol değerlendirmesi', title: 'Rolün seviyesi nasıl belirlenir?',
      sub: 'Değerlendirme rol için yapılır; çalışan herhangi bir form doldurmaz.',
      gate: { h: 'Önce: rol tipi', q: 'Rol zamanının yarısından fazlası insan yönetimine mi ayrılıyor?', yes: 'Liderlik bandı (M)', no: 'Profesyonel bandı (P)', note: 'Bu yüzden “Müdür” unvanlı bir rol, M1 ya da P3–P4 seviyesinde olabilir.' },
      crit: [
        { t: 'İşe olan etkisi', p: 'Sorumluluk kapsamı, bütçe, ekip büyüklüğü, karar yetkisi', x2: true },
        { t: 'Fonksiyonel bilgi', p: 'Rolün gerektirdiği teorik ve pratik bilgi' },
        { t: 'İş tecrübesi', p: 'İlgili deneyim ve sektör bilgisi' },
        { t: 'Liderlik seviyesi', p: 'Kendine liderlikten başkalarına rehberliğe' },
        { t: 'Problem çözme', p: 'Analitik düşünme ve problem çözme kapsamı' },
        { t: 'Beşeri ilişkiler', p: 'İletişim, etkileme ve iş birliği' }
      ],
      callout: { t: 'Değerlendirmeyi İnsan ve Kültür yapar', p: 'Altı kriter, algoritmik hesaplama yapan bir soru formuyla puanlanır. Mağaza Operasyon, Uzmanlık Rolleri, İş Destek ve Yönetim Kurulu bantlarında seviye, unvan yapısıyla belirlenir.' } },
    { sec: 2, type: 'question', tag: 'Kendini dene · 2', q: '“Müdür” unvanlı bir rolün Liderlik (M) mi yoksa Profesyonel (P) bandında mı olduğunu ne belirler?',
      opts: ['Unvanın kendisi', 'Rol zamanının yarısından fazlasının insan yönetimine ayrılıp ayrılmadığı', 'Rolde çalışan kişinin kıdemi', 'Rolde çalışan kişinin performansı'], correct: 1,
      ok: { t: 'Doğru.', p: 'Önce rol tipi sorulur: Zamanın yarısından fazlası insan yönetimine ayrılıyorsa rol Liderlik, değilse Profesyonel bandındadır. Unvan tek başına belirleyici değildir.' },
      no: { t: 'Tam olarak değil.', p: 'Sistem kişiye değil role odaklanır. Belirleyici soru, rol zamanının yarısından fazlasının insan yönetimine ayrılıp ayrılmadığıdır.' } },
    { sec: 2, type: 'profile', eyebrow: 'İş profili', title: 'Her rolün bir profili var',
      sub: 'Hedef rolün profiliyle bugünkü seviyen arasındaki fark, gelişim planının başlangıç noktasıdır.',
      levels: [[1, 'Temel', '#F3D3E4'], [2, 'Uygulayan', '#D98AB6'], [3, 'Yetkin', '#C2508F'], [4, 'Uzman', '#AC0065']],
      a: { t: 'Beceriler', p: 'Her beceri dört seviyeyle tanımlanır.' },
      b: { t: 'Yeterlilikler', p: 'Rolün gerektirdiği temel koşullar.', li: ['Eğitim düzeyi', 'Yabancı dil (CEFR seviyesi)', 'Deneyim aralığı', 'Sertifikalar'] },
      c: { t: 'i³ yetkinlikleri', p: 'Altı yetkinlikte hedef seviye, rolün liderlik düzeyine göre belirlenir.', pills: [['Kendine Liderlik', '#D98AB6'], ['Başkalarına Liderlik', '#C2508F'], ['Liderlere Liderlik', '#AC0065']] },
      callout: { t: 'Altı i³ yetkinliği', p: 'Büyük Düşünme · Değişimi Yönetimi · İlham Verme · Takım Çalışması · İş Bitiricilik · Değer Yaratma' } },
    { sec: 2, type: 'scale', eyebrow: 'Tek ölçek, tek dil', title: 'Performans, yetkinlik ve beceri aynı ölçekle konuşulur',
      sub: 'Hangi alanda değerlendirilirsen değerlendiril, aynı dört basamak aynı anlamı taşır.',
      levels: [[1, 'Gelişime Açık', '#F3D3E4'], [2, 'İyi', '#D98AB6'], [3, 'Güçlü', '#C2508F'], [4, 'Olağanüstü', '#AC0065']],
      callout: { t: 'Neden önemli?', p: 'Kariyer konuşmasında güçlü yönlerini ve gelişim alanlarını bu ortak dille anlatırsın; hedef rolün profiliyle karşılaştırma da aynı ölçekle yapılır.' } },
    { sec: 2, type: 'question', tag: 'Kendini dene · 3', q: 'Rolünün bandı ve seviyesi belirlenirken senin bireysel performansın dikkate alınır mı?',
      opts: ['Evet, performansım seviyemi belirler.', 'Hayır; değerlendirme role yapılır, performans GROW döngüsünde ele alınır.'], correct: 1,
      ok: { t: 'Doğru.', p: 'İş Mimarisi kişiye değil role odaklanır. Performansın ayrıca, GROW döngüsünde değerlendirilir.' },
      no: { t: 'Tam olarak değil.', p: 'Rolün yeri rolün gerektirdikleriyle belirlenir. Kıdem, performans ya da kapasite bu değerlendirmenin parçası değildir.' } },

    /* ---------------- 03 ---------------- */
    { sec: 3, type: 'section', num: '03', title: 'Kariyer yolları', sub: 'Üç yön, ilerlemenin iki yolu ve örnek bir yolculuk' },
    { sec: 3, type: 'columns', eyebrow: 'Kariyer yolları', title: 'Kariyerin üç yönde büyür',
      sub: 'Hangi yönün sana uyduğunu kariyer konuşmasında yöneticinle birlikte netleştirirsin.',
      cols: [
        { t: 'Yukarı ve ileri', s: 'Dikey hareket', items: ['Bant içinde bir üst seviyeye ya da bir üst banda geçiş', 'Daha büyük rolde daha fazla sorumluluk', 'İnsanlara ya da projelere liderlik'], chips: ['Mağaza Operasyon', 'Profesyonel', { t: 'Liderlik', on: true }] },
        { t: 'Deneyimi genişlet', s: 'Birimler ve aileler arası geçiş', items: ['Daha geniş beceri isteyen benzer seviyede rol', 'Merkez–saha ve kategori–kanal geçişleri', 'Yeni beceri gerektiren yeni bir kariyer'], chips: ['Mağazacılık', 'E-Ticaret', 'Pazarlama', 'CRM', 'Finans', 'BT'] },
        { t: 'Deneyimi derinleştir', s: 'Uzmanlık yolu', items: ['Yönetsel role geçmeden alanında daha kıdemli uzman olmak', 'Rolde uzmanlık becerisini güçlendirerek büyümek'], chips: ['P1', 'P3', { t: 'P5 · Bilirkişi', on: true }] }
      ],
      callout: { t: 'Proje ve komite deneyimi her üç yönü destekler', p: 'Rol değiştirmeden proje ve komite gruplarında yer almak; görünürlük, yeni beceri ve bir sonraki adıma hazırlık sağlar.' } },
    { sec: 3, type: 'cards', eyebrow: 'Kariyer yolları', title: 'İlerlemenin iki yolu', cols: 2,
      sub: 'Yeni bir role geçebilir ya da rolünün kendisi büyüyebilir.',
      cards: [
        { tag: 'İç aday sistemi', n: '01', t: 'Üst ya da farklı bir role geçiş', p: 'Boş ya da yeni oluşturulan bir role geçiştir. Rol kariyer portalında duyurulur; iç ve dış adaylar aynı süreçten, aynı ölçütlerle geçer.' },
        { tag: 'Rol değerlendirmesi', n: '02', t: 'Rolün büyümesi', p: 'Rolünün iş tanımı kalıcı olarak genişlediğinde sorumlulukların artar. Bu durumda rol, İş Mimarisi’ne göre bir üst seviye için yeniden değerlendirilir; iç ilan gerekmez.' }
      ],
      callout: { t: 'Rolün büyümesinde ölçü, rolün kapsamıdır', p: 'Yeniden değerlendirmeyi başlatan, rolün kapsamındaki kalıcı değişimdir. Kişisel performans GROW döngüsünde ayrıca ele alınır.' } },
    { sec: 3, type: 'journey', eyebrow: 'Örnek yolculuk', title: 'Ayşe’nin kariyer yolculuğu',
      sub: 'Bantlar ve seviyeler arasında bir yol; her adımın yönü farklı olabilir.',
      steps: [
        { k: '01 · İş Destek', code: 'B3', t: 'Takım Asistanı', p: 'Yeni mezun olarak başladı.', c: '#F3D3E4', c2: '#AC0065' },
        { k: '02 · İş Destek', code: 'B5', t: 'Uzman Yardımcısı', p: 'Alanını öğrenerek ilerledi.', c: '#F3D3E4', c2: '#AC0065' },
        { k: '03 · Profesyonel', code: 'P1', t: 'Uzman', p: 'Alanında kalifiye oldu.', c: '#AC0065' },
        { k: '04 · Profesyonel', code: 'P2', t: 'Kıdemli Uzman', p: 'Küçük bir ekibe rehberlik etmeye başladı.', c: '#AC0065' },
        { k: '05 · Liderlik', code: 'M1', t: 'Müdür', p: 'Sonuçları ekibiyle üreten bir role geçti.', c: '#871520' },
        { k: '06 · Liderlik', code: 'M2', t: 'Kıdemli Müdür', p: 'Daha geniş bir alanın sorumluluğunu aldı.', c: '#871520' }
      ],
      alt: { h: 'P5', p: 'Alternatif yol: Ayşe, yönetsel role geçmek yerine uzmanlığını derinleştirip Profesyonel bantta ilerleyebilir ve şirket içinde bilirkişi rolüne ulaşabilirdi. İki yol da İş Mimarisi’nde eşit değerdedir.' } },
    { sec: 3, type: 'question', tag: 'Kendini dene · 4 · Senaryo',
      scenario: 'Selin, finansal raporlama alanında Uzman olarak çalışıyor. Ekip yönetmek yerine alanında şirketin başvurduğu kişi olmak istiyor.',
      q: 'Selin’in hedefi hangi kariyer yönüne uyar?',
      opts: ['Yukarı ve ileri', 'Deneyimi genişlet', 'Deneyimi derinleştir'], correct: 2,
      ok: { t: 'Doğru.', p: 'Uzmanlık yolu, yönetsel role geçmeden Profesyonel bantta ilerlemeyi ve bilirkişi rolüne ulaşmayı mümkün kılar.' },
      no: { t: 'Tam olarak değil.', p: 'Selin yönetsel role geçmek istemiyor; alanında derinleşmek istiyor. Bu, “deneyimi derinleştir” yani uzmanlık yoludur.' } },

    /* ---------------- 04 ---------------- */
    { sec: 4, type: 'section', num: '04', title: 'Kariyerini yönetmek için araçların', sub: 'GROW döngüsü, kariyer konuşması, gelişim planı, yetenek değerlendirme ve yedekleme' },
    { sec: 4, type: 'cards', eyebrow: 'Araçların', title: 'Kariyerini yönetmek için beş araç', cols: 5,
      sub: 'İç aday sistemi bu araçlardan biridir; diğerleriyle birlikte en güçlü sonucu verir.',
      cards: [
        { tag: 'Q1', n: '01', t: 'GROW hedefleri', p: 'OKR temelli hedeflerine bir gelişim hedefi de eklenir.' },
        { tag: 'Q2', n: '02', t: 'Kariyer konuşması', p: 'Kariyer hedefini ve motivasyonunu yöneticinle paylaşırsın.' },
        { tag: 'Q3', n: '03', t: 'Gelişim planı', p: 'Deneyim, etkileşim ve eğitimle hedef rolüne hazırlanırsın.' },
        { tag: 'Q2', n: '04', t: 'Yetenek değerlendirme ve yedekleme', p: 'Potansiyel görünür olur; kritik roller için hazırlık planlanır.' },
        { tag: 'Yıl boyunca', n: '05', t: 'İç aday sistemi', p: 'Açık rollere kariyer portalından başvurursun.', hl: true }
      ],
      callout: { t: 'HR Fusion yetenek profilin güncel olsun', p: 'İlgi alanların, kariyer tercihin ve hareketlilik bilgin HR Fusion’daki yetenek profilinde yer alır. Kariyer konuşması ve yetenek değerlendirmesi bu bilgilere dayanır.' } },
    { sec: 4, type: 'cycle', eyebrow: 'GROW döngüsü', title: 'Yıl boyunca dört an',
      sub: 'Hedef, kariyer konuşması, gelişim ve geri bildirim aynı ritimde ilerler.',
      items: [
        { q: 'Q1', t: 'Yıl sonu ve hedefler', li: ['Yıl sonu performans değerlendirmesi', 'Yeni OKR’ler, gelişim hedefi dahil'] },
        { q: 'Q2', t: 'Kariyer konuşması', li: ['Kariyer hedefin ve motivasyonun', 'Yetenek değerlendirme ve yedekleme'] },
        { q: 'Q3', t: 'Gelişim', li: ['Gelişim planı birlikte oluşturulur', 'Hedef takibi, gerekirse güncelleme'] },
        { q: 'Q4', t: 'Geri bildirim', li: ['Katkı (ne): OKR sonuçları', 'Davranış (nasıl): i³ yetkinlikleri'] }
      ],
      callout: { t: 'İç ilanlar bir takvime bağlı değildir', p: 'Roller açıldıkça kariyer portalında duyurulur. Döngüdeki hazırlığın, bir ilan açıldığında başvurunu güçlendirir.' } },
    { sec: 4, type: 'steps', eyebrow: 'Kariyer konuşması · Q2', title: 'Kariyer konuşmasının üç ekseni',
      sub: 'Yöneticin, potansiyeli değerlendirmeden önce kariyer hedefini ve motivasyonunu dinler.',
      list: [
        { n: '1', t: 'Kariyer hedefi ve motivasyon', p: 'İlgi alanların, tercih ettiğin yön, hareketliliğin.' },
        { n: '2', t: 'Güçlü yönlerin', p: 'Beceri, yeterlilik ve deneyim; aynı 4’lü ölçekle.' },
        { n: '3', t: 'Gelişim ihtiyacın', p: 'Hedef rolün profiline göre açık.' }
      ],
      callout: { t: 'Konuşmadan sonra', p: 'HR Fusion’daki yetenek profilini ve kariyer tercihlerini güncelle; konuştuklarınızı gelişim planına taşı.' } },
    { sec: 4, type: 'flips', eyebrow: 'Kariyer konuşması · Q2', title: 'Konuşmadan önce kendine sor',
      hint: 'Her soruya tıkla; hazırlık ipucunu gör',
      items: [
        { q: 'Önümüzdeki iki üç yılda hangi işi yapıyor olmak istiyorum?', tip: 'Bir unvan yerine, yapmak istediğin işi ve yaratmak istediğin etkiyi tarif et.' },
        { q: 'Hangi yön bana uyar: yukarı, genişlemek ya da derinleşmek?', tip: 'Üç yön de eşit değerdedir; seni en çok motive edeni seç.' },
        { q: 'Hangi becerilerimde Güçlü ya da Olağanüstü seviyedeyim?', tip: 'Her biri için son dönemden somut bir örnek hazırla.' },
        { q: 'Hedef rolün profiline göre en büyük açığım hangisi?', tip: 'Açığı beceri, yeterlilik ya da i³ yetkinliği olarak adlandır.' },
        { q: 'Hareketlilik tercihim ne: farklı birim, şehir ya da ülke?', tip: 'Açık olduğun seçenekler fırsat yelpazeni genişletir.' },
        { q: 'Bu yıl gelişimim için hangi deneyimi istiyorum?', tip: 'Bir proje, bir sorumluluk ya da bir mentor; 70-20-10’u düşün.' }
      ] },
    { sec: 4, type: 'ratio', eyebrow: 'Gelişim planı · Q3', title: 'Gelişim planın üç kaynaktan beslenir',
      sub: 'Kariyer yönün gelişimin amacını, hedef rolün profili içeriğini belirler.',
      left: [
        { t: 'Ne için?', p: 'Yukarı ve ileri, genişlet ya da derinleştir; güçlü yönler ve açıklar bu yöne göre belirlenir.' },
        { t: 'Hangi hızda?', p: 'Mevcut rol ve iş yükü, rolde geçen süre, kişisel koşullar ve kapasite.' },
        { t: 'Nasıl izlenir?', p: 'Plan, HR Fusion’da kariyer gelişim planı olarak yöneticinle birlikte izlenir.' }
      ],
      items: [
        { pct: 70, t: 'Deneyim', k: 'İş üzerinde', cls: 'r70', li: ['Yeni mağaza açılışı, sezon ya da kampanya sorumluluğu', 'Birimler arası proje ve komite', 'Dönüşüm projelerinde rol'] },
        { pct: 20, t: 'Etkileşim', k: 'Başkalarından', cls: 'r20', li: ['Mentorluk ve ters mentorluk', 'Sunumlar ve forumlar', 'Rol modelini gölgeleme'] },
        { pct: 10, t: 'Eğitim', k: 'Resmi programlar', cls: 'r10', li: ['HR Fusion Grow öğrenme yolları: mikro ve makro', 'Liderlik programları, sertifikalar'] }
      ] },
    { sec: 4, type: 'question', tag: 'Kendini dene · 5', q: 'Bir sezon kampanyasının sorumluluğunu üstlenmek, 70-20-10 modelinde hangi kaynağa girer?',
      opts: ['Deneyim (%70)', 'Etkileşim (%20)', 'Eğitim (%10)'], correct: 0,
      ok: { t: 'Doğru.', p: 'İş üzerinde üstlenilen yeni sorumluluklar, gelişimin en büyük kaynağı olan deneyimdir.' },
      no: { t: 'Tam olarak değil.', p: 'Kampanya sorumluluğu iş üzerinde öğrenmedir; bu da 70-20-10 modelinde deneyime (%70) karşılık gelir.' } },
    { sec: 4, type: 'cards', eyebrow: 'Yetenek değerlendirme · Q2', title: 'Geleceğe hazırlığın üç göstergesi', cols: 3,
      sub: 'Performans bugünü, potansiyel geleceği ölçer; üç gösterge de geliştirilebilir davranışlardır.',
      cards: [
        { tag: 'i³ · İnovasyonla Fark Yarat', t: 'Öğrenme Çevikliği', p: 'Deneyimden öğrenmek ve öğrendiğini yeni durumda uygulamak.', li: ['Belirsizlikte fırsatı ve sorunu önceden görür', 'Analizden karara rahat geçer', 'Yeni sistem ve AI araçlarını hızla işine katar'] },
        { tag: 'i³ · İlham Ver', t: 'Duygusal Zekâ', p: 'Kendi duygularını yönetmek, başkalarını tanıyıp etkileyerek sonuç almak.', li: ['Güçlü ve sınırlı yönlerini bilir', 'Farklı kademelerde bağ kurar', 'Saha–merkez farkını iş birliğine çevirir'] },
        { tag: 'i³ · İyilikle Etkile', t: 'Etki Tutkusu', p: 'Sonuç teslim etmenin ötesinde geniş etki isteği ve özgüven.', li: ['Kurumda büyümek ister, engelde iyimserdir', 'Zor dönemlerde kararlılığını korur', 'Statükoyu sorgular, inisiyatif alır'] }
      ] },
    { sec: 4, type: 'compare', eyebrow: 'Yedekleme planlaması · Q2', title: 'Yedekleme planlaması senin için ne anlama gelir?',
      sub: 'Kritik roller için olası adaylar ve hazırlık seviyeleri her yıl birlikte planlanır.',
      pre: [['Hemen Hazır', 'Gerekli deneyim ve yetkinliğe sahip', '#AC0065'], ['1–2 Yıl', 'Belirli becerilerde gelişim gerekir', '#C2508F'], ['3–5 Yıl', 'Liderlik gelişimi gerekir', '#D98AB6'], ['5+ Yıl', 'Önemli gelişim gerekir', '#F3D3E4']],
      a: { lbl: 'Anlama gelir', li: ['Gelişim yatırımı, kritik rollere hazırlık için planlanır.', 'Planda yer alan çalışanın yöneticisi bilgilendirilir ve gelişimini destekler.', 'Hazırlık açığı, uygulanabilir iki üç gelişim aksiyonuyla kapatılır.'] },
      b: { lbl: 'Anlama gelmez', li: ['Planda yer almak bir atama garantisi değildir.', 'Planda yer almamak kapıyı kapatmaz: açık roller kariyer portalında herkese duyurulur.', 'Yetenek değerlendirmesindeki yerleşimler paylaşılmaz; konuşma gelişim üzerinden yapılır.'] } },
    { sec: 4, type: 'question', tag: 'Kendini dene · 6', q: '“Yedekleme planında yer almıyorsam açık bir role başvuramam.” Bu ifade doğru mu?',
      opts: ['Doğru', 'Yanlış'], correct: 1,
      ok: { t: 'Doğru bildin: ifade yanlış.', p: 'Açık roller kariyer portalında herkese duyurulur ve tüm adaylar aynı süreçten geçer. Planda yer almak da atama garantisi değildir.' },
      no: { t: 'Aslında ifade yanlış.', p: 'Yedekleme planında yer almamak kapıyı kapatmaz; açık rollere herkes başvurabilir ve tüm adaylar aynı süreçten geçer.' } },

    /* ---------------- 05 ---------------- */
    { sec: 5, type: 'section', num: '05', title: 'İç aday sistemi', sub: 'Aynı süreç ve ölçüt, başvuru adımları, yönetici teyidi ve sonuç' },
    { sec: 5, type: 'cards', eyebrow: 'İç aday sistemi', title: 'Aynı süreç, aynı ölçüt', cols: 3,
      sub: 'Açık rollere şirket içinden ve dışından gelen adaylar birlikte değerlendirilir.',
      cards: [
        { n: '01', t: 'Şeffaflık', p: 'Açık roller, bant ve seviyeleri, ölçütler ve süreç adımları herkes için görünürdür.' },
        { n: '02', t: 'Adil yönetişim', p: 'İç ve dış adaylar aynı adımlardan geçer; aynı değerlendirme formu kullanılır.' },
        { n: '03', t: 'Öngörülebilirlik', p: 'Hedef rolün profili, rolün senden ne beklediğini başvurmadan önce gösterir.' }
      ],
      callout: { t: 'Başvurmak, öncelik anlamına gelmez', p: 'İşe alım yöneticisi bazı rollerde ekibe dışarıdan yeni bir bilgi birikimi ya da beceri seti kazandırmak isteyebilir. Karar, rolün ihtiyacına en iyi yanıt veren profile göre verilir. Derimod’u, müşterilerimizi ve iş yapış biçimimizi tanıman ise değerlendirmede gerçek bir güçtür.' } },
    { sec: 5, type: 'question', tag: 'Kendini dene · 7', q: 'İç aday olarak bir role başvurduğunda dış adaylara göre öncelik kazanır mısın?',
      opts: ['Evet, iç adaylar her zaman önce değerlendirilir.', 'Hayır; iç ve dış adaylar aynı süreçte, aynı ölçütlerle birlikte değerlendirilir.'], correct: 1,
      ok: { t: 'Doğru.', p: 'Karar adayın nereden geldiğine göre değil, rolün ihtiyacına en iyi yanıt veren profile göre verilir. Derimod’u tanıman ise değerlendirmede bir güçtür.' },
      no: { t: 'Tam olarak değil.', p: 'Başvurmak öncelik anlamına gelmez. Aynı ölçütler herkes için geçerli olduğunda karar adil olur.' } },
    { sec: 5, type: 'steps', eyebrow: 'İç aday sistemi', title: 'Başvuru adım adım',
      sub: 'Başvuru öncesi adımları tamamladıktan sonra kariyer portalından başvurman yeterlidir; ayrıca form doldurmazsın.',
      groups: [
        { lbl: 'Başvurudan önce · senin adımların', list: [
          { n: '01', t: 'Açık rolleri incele', p: 'İç ilanlar kariyer portalında yayınlanır. Her ilanda rolün bandı, seviyesi ve profili yer alır.' },
          { n: '02', t: 'Kendini rolle karşılaştır', p: 'Bant ve seviye farkına, beceri ve yetkinlik beklentilerine bak; GROW kanıtlarını gözden geçir.' },
          { n: '03', t: 'Yöneticinle konuş, teyidini al', p: 'Niyetini başvurmadan önce mevcut yöneticinle paylaş.' },
          { n: '04', t: 'Kariyer portalından başvur', p: 'Önceki adımları tamamladıktan sonra başvurunu portaldan yap.' }] },
        { lbl: 'Başvurudan sonra · süreç', list: [
          { n: '05', t: 'Değerlendirme ve mülakat', p: 'Dış adaylarla birlikte, aynı ölçütlerle. i³ yetkinliklerine dayalı yapılandırılmış mülakat; role göre vaka ya da beceri değerlendirmesi.' },
          { n: '06', t: 'Karar ve geri bildirim', p: 'Sonuç on beş iş günü içinde paylaşılır; seçilsen de seçilmesen de yapılandırılmış geri bildirim alırsın.' },
          { n: '07', t: 'Geçiş', p: 'Başlangıç tarihin mevcut ve yeni yöneticin arasında planlanır; devir süresi en fazla altı haftadır.' }] }
      ] },
    { sec: 5, type: 'figs', eyebrow: 'Başvuru koşulları', title: 'Başvurmadan önce üç koşulu kontrol et',
      figs: [
        { v: 18, u: 'ay', p: 'Mevcut rolünde en az on sekiz ay çalışmış olman beklenir.' },
        { pre: '', v: 2, post: '+', u: '«İyi» ve üzeri performans', p: '4’lü ölçekte en az «İyi» performans koşulu aranır.' },
        { v: 3, u: 'rol', p: 'Aynı anda en fazla üç role başvurabilirsin.' }
      ],
      callout: { t: 'Koşullar neden var?', p: 'Mevcut rolünde katkını tamamlaman ve yeni rolüne güçlü bir zeminle geçmen için. Koşulları sağlamıyorsan bu süreyi gelişim planınla değerlendir.' } },
    { sec: 5, type: 'compare', eyebrow: 'Yönetici teyidi', title: 'Yöneticinin teyidi ne anlama gelir?',
      sub: 'Teyit, kariyer konuşmanızın açık bir zeminde yürümesini ve olası geçişin birlikte planlanmasını sağlar.',
      a: { lbl: 'Anlama gelir', li: ['Yöneticin başvurundan haberdardır.', 'Geçiş zamanlaması ve devir birlikte planlanır.', 'Başvurun, kariyer konuşmanızın doğal bir parçası olur.'] },
      b: { lbl: 'Anlama gelmez', li: ['Teyit, değerlendirmenin sonucunu belirlemez.', 'Başvurun, mevcut performans değerlendirmeni etkilemez.', 'Başvurduğun için olumsuz bir uygulamayla karşılaşmazsın.'] },
      callout: { t: 'Yöneticinle uzlaşamazsan', p: 'Başvurun konusunda ortak bir noktaya varamazsan İnsan ve Kültür İş Ortağınla görüşebilirsin.' } },
    { sec: 5, type: 'compare', eyebrow: 'Sonuç', title: 'Sonuç ne olursa olsun',
      sub: 'Her başvuru, gelişim döngüne geri dönen bir öğrenme fırsatıdır.',
      a: { lbl: 'Seçilirsen', li: ['Geçiş planın iki yönetici ve İnsan ve Kültür ile netleşir.', 'Yeni rolündeki uyum dönemin yapılandırılmış biçimde izlenir.', 'Hedeflerin ve gelişim planın yeni rolüne göre güncellenir.'] },
      b: { lbl: 'Seçilmezsen', li: ['Sonucu ve gerekçesini içeren geri bildirim alırsın.', 'Belirlenen farklar gelişim planına aktarılır.', 'Farkı kapatacak mikro ve makro öğrenme yolları önerilir.'] },
      callout: { t: 'Seçilmemek, kapının kapandığı anlamına gelmez', p: 'Bir ilanın sonucu, o rolün o andaki ihtiyacını yansıtır. Aldığın geri bildirim GROW döngüsüne döner ve seni bir sonraki fırsata daha hazır kılar.' } },
    { sec: 5, type: 'question', tag: 'Kendini dene · 8 · Senaryo',
      scenario: 'Emre, Kategori ekibindeki bir role başvurdu ve seçilmedi. Hayal kırıklığı yaşıyor ve bir daha başvurup başvurmamayı düşünüyor.',
      q: 'Emre için sıradaki en doğru adım hangisi?',
      opts: ['Bir yıl boyunca yeni bir başvuru yapmamak', 'Geri bildirimdeki farkları gelişim planına aktarıp yeni fırsatlara hazırlanmak', 'Yöneticisinin teyidini geri çekmesini istemek'], correct: 1,
      ok: { t: 'Doğru.', p: 'Seçilmeyen aday, sonucu ve gerekçesini içeren geri bildirim alır. Belirlenen farklar gelişim planına aktarılır; farkları kapattıktan sonra yeni bir ilana yeniden başvurabilir.' },
      no: { t: 'Tam olarak değil.', p: 'Seçilmemek kapının kapandığı anlamına gelmez. Geri bildirim gelişim planına döner ve seni bir sonraki fırsata daha hazır kılar.' } },
    { sec: 5, type: 'checklist', eyebrow: 'Proaktif ol', title: 'Kariyerin için altı adım: kendi listeni işaretle',
      sub: 'Hazırlık, bir ilan açılmadan çok önce başlar. Tamamladığın ya da planladığın adımları işaretle.',
      items: ['Hedef rolünü ve kariyer yönünü netleştir.', 'HR Fusion yetenek profilini ve kariyer tercihlerini güncelle.', 'Gelişim hedefini OKR’lerine ekle.', 'Kariyer konuşmasına somut örneklerle hazırlan.', 'Hedef rolün profiline göre açığını belirle, 70-20-10 planını kur.', 'Kariyer portalındaki iç ilanları düzenli takip et.'],
      done: 'Harika! Kariyerini yönetmek için listen hazır.' },
    { sec: 5, type: 'faq', eyebrow: 'Sık sorulan sorular', title: 'Aklındaki sorular',
      items: [
        ['Hangi rollere başvurabilirim?', 'Kariyer portalında iç ilana açılan, İş Mimarisi’nde tanımlı rollere; başvuru koşullarını sağladığın sürece.'],
        ['İç aday olduğum halde neden öncelik almıyorum?', 'Amaç, her role ihtiyacına en iyi yanıt veren kişiyi getirmektir. Aynı ölçütler herkes için geçerli olduğunda karar adil olur.'],
        ['Başvurumu kimler görür?', 'Yalnızca süreçte yer alan kişiler: mevcut yöneticin, işe alım yöneticisi ve İnsan ve Kültür ekibi.'],
        ['Farklı bir iş ailesine geçebilir miyim?', 'Evet. Değerlendirme, hedef rolün fonksiyonel bilgi ve beceri setine hazırlığına odaklanır.'],
        ['Yedekleme planında değilsem başvurabilir miyim?', 'Evet. Açık roller herkese duyurulur ve tüm adaylar aynı süreçten geçer.'],
        ['Seçilmezsem yeniden başvurabilir miyim?', 'Evet. Geri bildirimdeki farkları gelişim planınla kapattıktan sonra yeni bir ilana başvurabilirsin.']
      ] },

    /* ---------------- KAPANIŞ ---------------- */
    { sec: 6, type: 'end', title: 'Kariyerinin bir sonraki adımı için hazırsın',
      p: ['Bu eğitimi tamamladın. Kariyerinin sahibi sensin; yapı, ölçütler ve fırsatlar şeffaf biçimde önünde.', 'Bugün atabileceğin ilk adım: yetenek profilini güncellemek ve yöneticinle kariyer konuşmanı planlamak.'],
      contact: { t: 'Sorun mu var? Konuşalım.', p: 'İnsan ve Kültür İş Ortağın ya da ik@derimod.com' } }
  ]
};
