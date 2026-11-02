/* Derimod e-öğrenme oynatıcısı · SCORM 1.2 */
(function () {
  'use strict';
  var C = window.COURSE;

  /* ---------- SCORM 1.2 ---------- */
  var scorm = {
    api: null, started: Date.now(), finished: false,
    find: function (w) {
      var n = 0;
      while (w && !w.API && w.parent && w.parent !== w && n < 500) { n++; w = w.parent; }
      return w && w.API ? w.API : null;
    },
    init: function () {
      try {
        this.api = this.find(window) || (window.opener ? this.find(window.opener) : null);
        if (!this.api) return false;
        this.api.LMSInitialize('');
        var st = this.get('cmi.core.lesson_status');
        if (!st || st === 'not attempted') { this.set('cmi.core.lesson_status', 'incomplete'); this.commit(); }
        return true;
      } catch (e) { this.api = null; return false; }
    },
    get: function (k) { try { return this.api ? String(this.api.LMSGetValue(k) || '') : ''; } catch (e) { return ''; } },
    set: function (k, v) { try { if (this.api) this.api.LMSSetValue(k, String(v)); } catch (e) {} },
    commit: function () { try { if (this.api) this.api.LMSCommit(''); } catch (e) {} },
    time: function () {
      var s = Math.round((Date.now() - this.started) / 1000);
      var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
      var p = function (v) { return (v < 10 ? '0' : '') + v; };
      return (h < 1000 ? ('000' + h).slice(-4) : h) + ':' + p(m) + ':' + p(x);
    },
    finish: function () {
      if (!this.api || this.finished) return;
      this.finished = true;
      this.set('cmi.core.session_time', this.time());
      this.set('cmi.core.exit', state.completed ? '' : 'suspend');
      this.commit();
      try { this.api.LMSFinish(''); } catch (e) {}
    }
  };

  /* ---------- state ---------- */
  var state = { i: 0, visited: {}, answers: {}, checks: {}, completed: false };
  function save() {
    scorm.set('cmi.core.lesson_location', state.i);
    var data = JSON.stringify({ v: Object.keys(state.visited).map(Number), a: state.answers, c: state.checks });
    if (data.length > 4000) data = JSON.stringify({ v: [], a: {}, c: {} });
    scorm.set('cmi.suspend_data', data);
    scorm.commit();
  }
  function load() {
    var loc = parseInt(scorm.get('cmi.core.lesson_location'), 10);
    try {
      var d = JSON.parse(scorm.get('cmi.suspend_data') || '{}');
      (d.v || []).forEach(function (k) { state.visited[k] = true; });
      state.answers = d.a || {}; state.checks = d.c || {};
    } catch (e) {}
    var st = scorm.get('cmi.core.lesson_status');
    state.completed = (st === 'completed' || st === 'passed');
    return isNaN(loc) ? 0 : loc;
  }

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s == null ? '' : s); } // içerik güvenilir kaynaklıdır (ders dosyası)
  function d(n) { return ' style="--d:' + n + '"'; }
  var SIG = function (cls, fill, ops) {
    ops = ops || [0.12, 0.14, 0.16];
    return '<svg class="' + cls + '" viewBox="0 0 780 780" aria-hidden="true">' +
      '<path d="M0 0 H280 A280 280 0 0 1 280 560 H0 Z" fill="' + fill + '" fill-opacity="' + ops[0] + '"/>' +
      '<path d="M110 110 H390 A280 280 0 0 1 390 670 H110 Z" fill="' + fill + '" fill-opacity="' + ops[1] + '"/>' +
      '<path d="M220 220 H500 A280 280 0 0 1 500 780 H220 Z" fill="' + fill + '" fill-opacity="' + ops[2] + '"/></svg>';
  };
  var ARROW = '<svg viewBox="0 0 64 32" aria-hidden="true"><path d="M0 12 H40 V2 L64 16 L40 30 V20 H0 Z" fill="#AC0065"/></svg>';
  function head(s) {
    var h = '<svg class="small-signet" viewBox="0 0 74 74" aria-hidden="true"><path d="M0 0 H25 A25 25 0 0 1 25 50 H0 Z" fill="#AC0065" fill-opacity=".25"/><path d="M12 12 H37 A25 25 0 0 1 37 62 H12 Z" fill="#AC0065" fill-opacity=".25"/><path d="M24 24 H49 A25 25 0 0 1 49 74 H24 Z" fill="#AC0065" fill-opacity=".25"/></svg>';
    h += '<div class="head">';
    if (s.eyebrow) h += '<p class="eyebrow a"' + d(0) + '>' + esc(s.eyebrow) + '</p>';
    if (s.title) h += '<h2 class="t a"' + d(.08) + '>' + esc(s.title) + '</h2>';
    if (s.sub) h += '<p class="sub a"' + d(.16) + '>' + esc(s.sub) + '</p>';
    return h + '</div>';
  }
  function callout(c, t) {
    if (!c) return '';
    return '<div class="callout a' + (c.info ? ' info' : '') + '"' + d(t || .9) + '><div><h3>' + esc(c.t) + '</h3>' + (c.p ? '<p>' + esc(c.p) + '</p>' : '') + '</div></div>';
  }
  function list(li) { return '<ul>' + (li || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }
  function card(c, t) {
    return '<div class="card a' + (c.hl ? ' hl' : '') + '"' + d(t) + '>' +
      (c.tag ? '<span class="tag">' + esc(c.tag) + '</span>' : '') +
      (c.n ? '<p class="n">' + esc(c.n) + '</p>' : '') +
      '<h3>' + esc(c.t) + '</h3>' + (c.q ? '<p class="q">' + esc(c.q) + '</p>' : '') +
      (c.p ? '<p>' + esc(c.p) + '</p>' : '') + (c.li ? list(c.li) : '') + '</div>';
  }

  /* ---------- templates ---------- */
  var T = {};
  T.cover = function (s) {
    return '<div class="cover">' + SIG('signet', '#AC0065') + '<div class="copy">' +
      '<p class="eyebrow a"' + d(.2) + '>' + esc(s.eyebrow) + '</p>' +
      '<h1 class="a"' + d(.35) + '>' + esc(s.title) + '</h1>' +
      '<div class="rule a-grow"' + d(.6) + '></div>' +
      '<p class="body a"' + d(.75) + '>' + esc(s.sub) + '</p>' +
      '<div class="meta a"' + d(.9) + '>' + (s.meta || []).map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('') + '</div>' +
      '<button class="start a"' + d(1.05) + ' data-act="next">' + esc(s.start || 'Başla') + '</button>' +
      '</div></div>';
  };
  T.objectives = function (s) {
    return head(s) + '<div class="obj"><ol>' + s.items.map(function (x, i) { return '<li class="a-left"' + d(.25 + i * .12) + '>' + esc(x) + '</li>'; }).join('') +
      '</ol><div class="howto a"' + d(.8) + '><h3>Nasıl ilerlenir?</h3>' + s.howto.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div></div>';
  };
  T.section = function (s) {
    return '<p class="num a"' + d(0) + '>' + esc(s.num) + '</p>' + SIG('signet', '#FFFFFF', [.14, .16, .2]) +
      '<div class="inner"><p class="eyebrow a"' + d(.4) + '>Bölüm ' + esc(s.num) + '</p><h2 class="a"' + d(.5) + '>' + esc(s.title) + '</h2>' +
      (s.sub ? '<p class="a"' + d(.65) + '>' + esc(s.sub) + '</p>' : '') + '</div>';
  };
  T.fromto = function (s) {
    var h = head(s) + '<div class="fromto"><div class="box from a-left"' + d(.3) + '><p class="lbl">' + esc(s.fromLbl || 'Buradan') + '</p><p class="w">' + esc(s.from) + '</p></div>' +
      '<div class="a-pop"' + d(.7) + '>' + ARROW + '</div>' +
      '<div class="box to a"' + d(.9) + '><p class="lbl">' + esc(s.toLbl || 'Buraya') + '</p><p class="w">' + esc(s.to) + '</p></div></div>';
    if (s.cardsLabel) h += '<p class="eyebrow a"' + d(1.1) + '>' + esc(s.cardsLabel) + '</p>';
    if (s.cards) h += '<div class="grid c' + (s.cols || s.cards.length) + '">' + s.cards.map(function (c, i) { return card(c, 1.2 + i * .12); }).join('') + '</div>';
    if (s.big) h += '<p class="big a"' + d(1.2) + '>' + s.big + '</p>';
    return h + callout(s.callout, 1.7);
  };
  T.cards = function (s) {
    return head(s) + (s.label ? '<p class="eyebrow a"' + d(.2) + '>' + esc(s.label) + '</p>' : '') +
      '<div class="grid c' + (s.cols || s.cards.length) + '">' + s.cards.map(function (c, i) { return card(c, .3 + i * .12); }).join('') + '</div>' +
      callout(s.callout, .4 + s.cards.length * .12 + .2);
  };
  T.columns = function (s) {
    return head(s) + '<div class="grid c' + s.cols.length + '">' + s.cols.map(function (c, i) {
      return '<div class="colh a"' + d(.3 + i * .18) + '><div class="top"><h3>' + esc(c.t) + '</h3>' + (c.s ? '<span>' + esc(c.s) + '</span>' : '') + '</div>' + list(c.items) +
        (c.chips ? '<div class="chips">' + c.chips.map(function (x) { return '<span class="chip' + (x.on ? ' on' : '') + '">' + esc(x.t || x) + '</span>'; }).join('') + '</div>' : '') + '</div>';
    }).join('') + '</div>' + callout(s.callout, .4 + s.cols.length * .18 + .2);
  };
  T.bands = function (s) {
    var h = head(s) + '<div class="stairs">';
    if (s.note) h += '<div class="note a"' + d(.2) + '>' + s.note.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '</div>';
    s.bands.forEach(function (b, i) {
      var cells = '';
      for (var k = 1; k <= b.n; k++) cells += '<span>' + b.code + k + '</span>';
      h += '<div class="band a" style="--d:' + (.35 + i * .22) + ';left:' + b.x + '%;top:' + b.y + 'px;width:' + b.w + '%">' +
        '<div class="bn" style="background:' + b.color + (b.dark ? ';color:#1F1E23' : '') + (b.n ? '' : ';padding:14px 10px;font-size:19px') + '">' + esc(b.name) + '</div>' + (b.n ? '<div class="cells">' + cells + '</div>' : '') + '</div>';
    });
    return h + '</div>' + callout(s.callout, 1.8);
  };
  T.reveal = function (s, idx) {
    var h = head(s) + '<p class="hint a"' + d(.2) + '>' + esc(s.hint || 'Ayrıntıyı görmek için her birine tıkla') + '</p><div class="rev"><div class="tabs" role="tablist">';
    s.items.forEach(function (it, i) {
      h += '<button role="tab" class="a-left" style="--d:' + (.3 + i * .08) + ';--c:' + (it.color || '#AC0065') + '" data-rev="' + i + '">' + esc(it.label) + '<span class="ck">✓ görüldü</span></button>';
    });
    return h + '</div><div class="panel a"' + d(.6) + ' aria-live="polite"></div></div>' + callout(s.callout, 1);
  };
  T.families = function (s) {
    return head(s) + '<div class="fam">' + s.fams.map(function (f, i) { return '<div class="a-pop"' + d(.25 + i * .05) + '><b>' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></div>'; }).join('') +
      (s.stats || []).map(function (f, i) { return '<div class="stat a-pop"' + d(.25 + (s.fams.length + i) * .05) + '><b data-count="' + f[0] + '">0</b><span>' + esc(f[1]) + '</span></div>'; }).join('') + '</div>' + callout(s.callout, 1.3);
  };
  T.gate = function (s) {
    var g = s.gate;
    return head(s) + '<div class="gate"><div class="g a-left"' + d(.3) + '><div class="gh">' + esc(g.h) + '</div><div class="gb"><p>' + esc(g.q) + '</p><p><span class="yes">Evet</span> → ' + esc(g.yes) + '<br><span class="yes">Hayır</span> → ' + esc(g.no) + '</p><p>' + esc(g.note) + '</p></div></div>' +
      '<div class="grid c3 crit">' + s.crit.map(function (c, i) {
        return '<div class="card a"' + d(.6 + i * .1) + '><p class="n">0' + (i + 1) + (c.x2 ? '<span class="x2">×2 ağırlık</span>' : '') + '</p><h3>' + esc(c.t) + '</h3><p>' + esc(c.p) + '</p></div>';
      }).join('') + '</div></div>' + callout(s.callout, 1.4);
  };
  T.profile = function (s) {
    var lv = s.levels.map(function (l, i) {
      return '<div class="r a-left"' + d(.5 + i * .12) + '><b style="background:' + l[2] + (i > 1 ? ';color:#FFFFFF' : '') + '">' + l[0] + '</b><span>' + esc(l[1]) + '</span></div>';
    }).join('');
    return head(s) + '<div class="grid c3">' +
      '<div class="card a"' + d(.3) + '><h3>' + esc(s.a.t) + '</h3><p>' + esc(s.a.p) + '</p><div class="scale">' + lv + '</div></div>' +
      '<div class="card a"' + d(.45) + '><h3>' + esc(s.b.t) + '</h3><p>' + esc(s.b.p) + '</p>' + list(s.b.li).replace('<ul>', '<ul style="padding-left:20px;margin-top:12px;color:#4A4950">') + '</div>' +
      '<div class="card a"' + d(.6) + '><h3>' + esc(s.c.t) + '</h3><p>' + esc(s.c.p) + '</p><div class="scale">' + s.c.pills.map(function (p, i) {
        return '<div class="r a-left"' + d(.9 + i * .12) + '><span class="bar" style="background:#FBF0F6;border-left:5px solid ' + p[1] + ';width:100%">' + esc(p[0]) + '</span></div>';
      }).join('') + '</div></div></div>' + callout(s.callout, 1.4);
  };
  T.scale = function (s) {
    var hs = [34, 56, 78, 100];
    return head(s) + '<div class="lvl">' + s.levels.map(function (l, i) {
      return '<div class="a" style="--d:' + (.3 + i * .18) + ';height:' + hs[i] + '%;background:' + l[2] + (i > 1 ? ';color:#FFFFFF' : '') + '"><b>' + l[0] + '</b><span>' + esc(l[1]) + '</span></div>';
    }).join('') + '</div>' + callout(s.callout, 1.2);
  };
  T.journey = function (s) {
    var h = head(s) + '<div class="journey" style="--n:' + s.steps.length + '">' + s.steps.map(function (st, i) {
      return '<div class="st a" style="--d:' + (.3 + i * .3) + ';--c:' + st.c + ';--c2:' + (st.c2 || st.c) + ';margin-bottom:' + (i * 18) + 'px"><p class="k">' + esc(st.k) + '</p><p class="code">' + esc(st.code) + '</p><h4>' + esc(st.t) + '</h4><p>' + esc(st.p) + '</p></div>';
    }).join('') + '</div>';
    if (s.alt) h += '<div class="altpath a"' + d(.4 + s.steps.length * .3) + '><strong>' + esc(s.alt.h) + '</strong><p>' + esc(s.alt.p) + '</p></div>';
    return h;
  };
  T.cycle = function (s) {
    return head(s) + '<div class="cycle">' + s.items.map(function (it, i) {
      return '<div class="a-left"' + d(.3 + i * .25) + '><p class="q">' + esc(it.q) + '</p><h3>' + esc(it.t) + '</h3>' + list(it.li) + '</div>';
    }).join('') + '</div>' + callout(s.callout, 1.5);
  };
  T.ratio = function (s) {
    var h = head(s) + '<div class="grid" style="grid-template-columns:' + (s.left ? 'minmax(0,.9fr) ' : '') + 'minmax(0,2.4fr);gap:20px">';
    if (s.left) h += '<div style="display:flex;flex-direction:column;gap:12px">' + s.left.map(function (c, i) { return card(c, .3 + i * .12); }).join('') + '</div>';
    h += '<div class="grid c3">' + s.items.map(function (it, i) {
      return '<div class="ratio ' + it.cls + ' a"' + d(.5 + i * .2) + '><p class="pct"><span data-count="' + it.pct + '">0</span><small>%</small></p><h3>' + esc(it.t) + '</h3><p class="k">' + esc(it.k) + '</p>' + list(it.li) + '</div>';
    }).join('') + '</div></div>';
    return h + callout(s.callout, 1.4);
  };
  T.figs = function (s) {
    return head(s) + '<div class="figs">' + s.figs.map(function (f, i) {
      return '<div class="fig a"' + d(.3 + i * .2) + '><p class="v">' + (f.pre || '') + '<span data-count="' + f.v + '">0</span>' + (f.post || '') + '</p><p class="u">' + esc(f.u) + '</p><p>' + esc(f.p) + '</p></div>';
    }).join('') + '</div>' + callout(s.callout, 1.2);
  };
  T.compare = function (s) {
    function cmp(a, b, t) {
      return '<div class="cmp"><div class="a"' + d(t) + '><p class="lbl">' + esc(a.lbl) + '</p>' + list(a.li) + '</div><div class="b a"' + d(t + .25) + '><p class="lbl">' + esc(b.lbl) + '</p>' + list(b.li) + '</div></div>';
    }
    var h = head(s) + (s.pre ? '<div class="grid c4" style="margin-bottom:22px">' + s.pre.map(function (p, i) {
      return '<div class="a-pop" style="--d:' + (.25 + i * .12) + ';background:' + p[2] + ';padding:18px 20px;' + (i < 2 ? 'color:#FFFFFF' : '') + '"><h3 style="font-size:22px;font-weight:400">' + esc(p[0]) + '</h3><p style="font-size:16px;margin-top:4px">' + esc(p[1]) + '</p></div>';
    }).join('') + '</div>' : '') + cmp(s.a, s.b, s.pre ? .8 : .3);
    return h + callout(s.callout, 1.1);
  };
  T.steps = function (s) {
    var cols = s.groups || [{ list: s.list }];
    return head(s) + '<div class="grid c' + cols.length + '" style="gap:36px">' + cols.map(function (g, gi) {
      return '<div>' + (g.lbl ? '<p class="eyebrow a" style="--d:' + (.2 + gi * .5) + ';' + (gi ? 'color:#333236;' : '') + 'border-bottom:2px solid ' + (gi ? '#333236' : '#AC0065') + ';padding-bottom:10px;margin-bottom:0">' + esc(g.lbl) + '</p>' : '') +
        '<div class="steps' + (gi ? ' dark' : '') + '">' + g.list.map(function (st, i) {
          return '<div class="s a" style="--d:' + (.3 + gi * .5 + i * .14) + '"><p class="n">' + esc(st.n) + '</p><div><h4>' + esc(st.t) + '</h4>' + (st.who ? '<p class="who">' + esc(st.who) + '</p>' : '') + '<p>' + esc(st.p) + '</p></div></div>';
        }).join('') + '</div></div>';
    }).join('') + '</div>' + callout(s.callout, 1.6);
  };
  T.question = function (s, idx) {
    var L = 'ABCDEF';
    return '<div class="qbox"><p class="tag a"' + d(0) + '>' + esc(s.tag || 'Kendini dene') + '</p>' +
      (s.scenario ? '<p class="scenario a"' + d(.15) + '>' + esc(s.scenario) + '</p>' : '') +
      '<h2 class="a"' + d(.25) + '>' + esc(s.q) + '</h2><div class="opts">' +
      s.opts.map(function (o, i) { return '<button class="a" style="--d:' + (.4 + i * .1) + '" data-opt="' + i + '"><span class="l">' + L[i] + '</span><span>' + esc(o) + '</span></button>'; }).join('') +
      '</div><div class="fbwrap" aria-live="polite"></div></div>';
  };
  T.checklist = function (s, idx) {
    return head(s) + '<div class="checks">' + s.items.map(function (x, i) {
      return '<button class="a" style="--d:' + (.3 + i * .1) + '" data-chk="' + i + '" aria-pressed="false"><span class="bx"></span><span>' + esc(x) + '</span></button>';
    }).join('') + '</div><p class="checks-done" aria-live="polite"></p>' + callout(s.callout, 1.2);
  };
  T.faq = function (s) {
    return head(s) + '<div class="acc">' + s.items.map(function (q, i) {
      return '<details class="a"' + d(.25 + i * .08) + '><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>';
    }).join('') + '</div>' + callout(s.callout, 1);
  };
  T.flips = function (s) {
    return head(s) + '<p class="hint a"' + d(.2) + '>' + esc(s.hint || 'Her soruya tıkla; ipucunu gör') + '</p><div class="flips">' + s.items.map(function (it, i) {
      return '<button class="a-pop" style="--d:' + (.3 + i * .1) + '" data-flip aria-expanded="false"><span>' + esc(it.q) + '</span><span class="tap">İpucu için tıkla</span><span class="tip">' + esc(it.tip) + '</span></button>';
    }).join('') + '</div>' + callout(s.callout, 1.2);
  };
  T.end = function (s) {
    return '<div class="end"><div class="badge a-pop"' + d(.2) + '><svg viewBox="0 0 56 56" aria-hidden="true"><path d="M14 29 L24 39 L43 18" stroke="#FFFFFF" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
      '<p class="eyebrow a"' + d(.4) + '>' + esc(s.eyebrow || 'Tamamlandı') + '</p><h2 class="a"' + d(.5) + '>' + esc(s.title) + '</h2>' +
      (s.p || []).map(function (p, i) { return '<p class="a"' + d(.65 + i * .1) + '>' + esc(p) + '</p>'; }).join('') +
      '<div class="contact a"' + d(1) + '><h3 style="font-weight:400;font-size:22px">' + esc(s.contact.t) + '</h3><p style="font-size:18px;margin-top:4px">' + esc(s.contact.p) + '</p></div></div>';
  };

  /* ---------- interactions ---------- */
  function countUp(root) {
    root.querySelectorAll('[data-count]').forEach(function (el) {
      var to = parseFloat(el.getAttribute('data-count')), t0 = null, delay = 600;
      if (window.VIDEO_MODE) { el.textContent = to; return; }
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to; return; }
      setTimeout(function () {
        function step(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 900); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
        requestAnimationFrame(step);
      }, delay);
    });
  }
  function bind(s, root, idx) {
    countUp(root);
    if (s.type === 'reveal') {
      var panel = root.querySelector('.panel');
      var show = function (i) {
        var it = s.items[i];
        root.querySelectorAll('[data-rev]').forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-rev') === i); b.setAttribute('aria-selected', +b.getAttribute('data-rev') === i); });
        root.querySelector('[data-rev="' + i + '"]').classList.add('seen');
        panel.innerHTML = '<h3>' + esc(it.title || it.label) + '</h3>' + (it.code ? '<p class="code">' + esc(it.code) + '</p>' : '') + '<p>' + esc(it.desc) + '</p>' + (it.ex ? '<p class="lbl">' + esc(it.exLbl || 'Unvan örnekleri') + '</p><p>' + esc(it.ex) + '</p>' : '');
        panel.style.borderTopColor = it.color || '#AC0065';
      };
      root.querySelectorAll('[data-rev]').forEach(function (b) { b.addEventListener('click', function () { show(+b.getAttribute('data-rev')); }); });
      show(0);
    }
    if (s.type === 'question') {
      var wrap = root.querySelector('.fbwrap'), btns = root.querySelectorAll('[data-opt]');
      var answer = function (i, silent) {
        btns.forEach(function (b) {
          var k = +b.getAttribute('data-opt'); b.disabled = true;
          if (k === s.correct) b.classList.add('right'); else if (k === i) b.classList.add('wrong');
        });
        var ok = i === s.correct, f = ok ? s.ok : s.no;
        wrap.innerHTML = '<div class="fb' + (ok ? '' : ' x') + '"><h3>' + esc(f.t) + '</h3><p>' + esc(f.p) + '</p></div>' + (ok ? '' : '<button class="retry">Yeniden dene</button>');
        var r = wrap.querySelector('.retry');
        if (r) r.addEventListener('click', function () { delete state.answers[idx]; render(); });
        state.answers[idx] = i; if (!silent) save(); updateNav();
      };
      btns.forEach(function (b) { b.addEventListener('click', function () { answer(+b.getAttribute('data-opt')); }); });
      if (state.answers[idx] != null) answer(state.answers[idx], true);
    }
    if (s.type === 'checklist') {
      var on = state.checks[idx] || [];
      var done = root.querySelector('.checks-done');
      var upd = function () {
        var n = on.length;
        done.textContent = n === s.items.length ? (s.done || 'Harika! Listen hazır.') : (n ? n + ' / ' + s.items.length + ' adım işaretlendi' : '');
      };
      root.querySelectorAll('[data-chk]').forEach(function (b) {
        var k = +b.getAttribute('data-chk');
        if (on.indexOf(k) > -1) { b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); }
        b.addEventListener('click', function () {
          var p = on.indexOf(k);
          if (p > -1) on.splice(p, 1); else on.push(k);
          b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on'));
          state.checks[idx] = on; upd(); save();
        });
      });
      upd();
    }
    if (s.type === 'flips') {
      root.querySelectorAll('[data-flip]').forEach(function (b) {
        b.addEventListener('click', function () { b.classList.toggle('on'); b.setAttribute('aria-expanded', b.classList.contains('on')); });
      });
    }
    root.querySelectorAll('[data-act="next"]').forEach(function (b) { b.addEventListener('click', next); });
  }


  /* ---------- narration (sesli sürüm) ---------- */
  var NARRATED = !!window.NARRATED, au = null, interacted = false, muted = false, capOn = false, capEl = null, playB = null;
  function narr(i) { var s = C.screens[i]; return s.n || (window.NARR && window.NARR[i]) || ''; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function setPlayIcon() {
    if (!playB) return;
    var playing = au && !au.paused && !au.ended;
    playB.innerHTML = playing
      ? '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="3.5" height="12" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" fill="currentColor"/></svg>'
      : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2 L14 8 L4 14 Z" fill="currentColor"/></svg>';
    playB.setAttribute('aria-label', playing ? 'Anlatımı duraklat' : 'Anlatımı oynat');
  }
  function loadAudio(i) {
    if (!NARRATED) return;
    au.pause();
    au.src = 'audio/s' + pad(i + 1) + '.mp3';
    capEl.textContent = narr(i);
    if (interacted && !muted) { var pr = au.play(); if (pr && pr.catch) pr.catch(function () {}); }
    setPlayIcon();
  }
  function audioControls() {
    if (!NARRATED) return '';
    return '<div class="aud"><button class="aud-b aud-play" aria-label="Anlatımı oynat"></button>' +
      '<button class="aud-b aud-re" aria-label="Anlatımı baştan dinle"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3a5 5 0 1 1-4.6 3" stroke="currentColor" stroke-width="2" fill="none"/><path d="M1.5 2.5 L4 6.5 L7.6 4" stroke="currentColor" stroke-width="2" fill="none"/></svg></button>' +
      '<button class="aud-b aud-cc" aria-pressed="false" aria-label="Altyazıyı aç">CC</button>' +
      '<button class="aud-b aud-mute" aria-pressed="false" aria-label="Sesi kapat"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/><path d="M11 5.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" stroke-width="1.6" fill="none"/></svg></button></div>';
  }
  function bindAudio() {
    if (!NARRATED) return;
    au = new Audio(); au.preload = 'auto';
    capEl = $('.cap'); playB = $('.aud-play');
    ['play', 'pause', 'ended'].forEach(function (ev) { au.addEventListener(ev, setPlayIcon); });
    var mark = function () { interacted = true; };
    document.addEventListener('pointerdown', mark, true); document.addEventListener('keydown', mark, true);
    playB.addEventListener('click', function () { if (au.paused) { muted = false; syncMute(); au.play().catch(function () {}); } else au.pause(); });
    $('.aud-re').addEventListener('click', function () { au.currentTime = 0; muted = false; syncMute(); au.play().catch(function () {}); });
    var cc = $('.aud-cc');
    cc.addEventListener('click', function () { capOn = !capOn; capEl.hidden = !capOn; cc.setAttribute('aria-pressed', capOn); cc.classList.toggle('on', capOn); cc.setAttribute('aria-label', capOn ? 'Altyazıyı kapat' : 'Altyazıyı aç'); });
    var mb = $('.aud-mute');
    function syncMute() { au.muted = muted; mb.setAttribute('aria-pressed', muted); mb.classList.toggle('on', muted); mb.setAttribute('aria-label', muted ? 'Sesi aç' : 'Sesi kapat'); }
    mb.addEventListener('click', function () { muted = !muted; syncMute(); if (!muted && au.paused) au.play().catch(function () {}); });
    setPlayIcon();
  }

  /* ---------- navigation ---------- */
  var stage, prevB, nextB, count, bar;
  function blocked() { var s = C.screens[state.i]; return s.type === 'question' && state.answers[state.i] == null; }
  function updateNav() {
    var n = C.screens.length, last = state.i === n - 1;
    prevB.disabled = state.i === 0;
    nextB.disabled = last || blocked();
    nextB.textContent = state.i === n - 2 ? 'Bitir' : 'İleri';
    nextB.classList.toggle('pulse', C.screens[state.i].type === 'question' && !blocked());
    nextB.title = blocked() ? 'Devam etmek için bir yanıt seç' : '';
    count.textContent = (state.i + 1) + ' / ' + n;
    bar.style.width = (state.i / (n - 1) * 100) + '%';
  }
  function render() {
    var s = C.screens[state.i];
    var el = document.createElement('div');
    el.className = 'screen' + (s.type === 'section' ? ' sec' : '');
    el.setAttribute('aria-label', s.title || s.type);
    el.innerHTML = T[s.type](s, state.i);
    stage.innerHTML = '';
    stage.appendChild(el);
    stage.scrollTop = 0;
    bind(s, el, state.i);
    state.visited[state.i] = true;
    if (state.i === C.screens.length - 1 && !state.completed) {
      state.completed = true;
      scorm.set('cmi.core.lesson_status', 'completed');
    }
    updateNav(); markToc(); save(); loadAudio(state.i);
    var h = el.querySelector('h1,h2'); if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) {} }
  }
  function go(i) { if (i < 0 || i >= C.screens.length) return; state.i = i; render(); }
  function next() { if (!blocked()) go(state.i + 1); }
  function prev() { go(state.i - 1); }

  /* ---------- menu ---------- */
  var drawer;
  function markToc() {
    if (!drawer) return;
    var cur = C.screens[state.i].sec;
    drawer.querySelectorAll('[data-go]').forEach(function (b) { b.classList.toggle('cur', +b.getAttribute('data-sec') === cur); });
  }
  function buildMenu() {
    drawer = document.createElement('div');
    drawer.className = 'drawer';
    var items = '';
    C.sections.forEach(function (sec, k) {
      var first = -1, cnt = 0;
      C.screens.forEach(function (s, i) { if (s.sec === k) { if (first < 0) first = i; cnt++; } });
      items += '<button data-go="' + first + '" data-sec="' + k + '"><span class="n">' + esc(sec.n) + '</span><span class="t">' + esc(sec.t) + '</span><span class="s">' + cnt + ' ekran</span></button>';
    });
    drawer.innerHTML = '<div class="scrim"></div><div class="panel" role="dialog" aria-label="İçerik"><button class="close" aria-label="Kapat">×</button><h2>İçerik</h2><div class="toc">' + items + '</div></div>';
    document.body.appendChild(drawer);
    var close = function () { drawer.classList.remove('open'); };
    drawer.querySelector('.scrim').addEventListener('click', close);
    drawer.querySelector('.close').addEventListener('click', close);
    drawer.querySelectorAll('[data-go]').forEach(function (b) { b.addEventListener('click', function () { close(); go(+b.getAttribute('data-go')); }); });
  }

  /* ---------- boot ---------- */
  function boot() {
    document.title = C.title;
    var app = document.getElementById('app');
    app.innerHTML =
      '<header class="bar"><img class="logo" src="assets/logo.png" alt="Derimod"><span class="mod">' + esc(C.title) + '</span>' + audioControls() +
      '<button class="menu-btn" aria-label="İçerik menüsü"><svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><path d="M0 1h16M0 6h16M0 11h16" stroke="currentColor" stroke-width="2"/></svg>İçerik</button></header>' +
      '<div><div class="progress"><i></i></div><main class="stage" aria-live="polite"></main>' + (NARRATED ? '<div class="cap" hidden aria-live="off"></div>' : '') + '</div>' +
      '<nav class="nav"><button class="prev">Geri</button><span class="count"></span><button class="next">İleri</button></nav>';
    app.children[1].style.cssText = 'display:grid;grid-template-rows:auto 1fr auto;min-height:0';
    stage = $('.stage'); prevB = $('.prev'); nextB = $('.next'); count = $('.count'); bar = $('.progress i');
    prevB.addEventListener('click', prev); nextB.addEventListener('click', next);
    buildMenu(); bindAudio();
    $('.menu-btn').addEventListener('click', function () { drawer.classList.add('open'); });
    document.addEventListener('keydown', function (e) {
      if (drawer.classList.contains('open')) { if (e.key === 'Escape') drawer.classList.remove('open'); return; }
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'summary') return;
      if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev();
    });
    window.__P = { go: go, state: state };
    if (window.VIDEO_MODE) { document.body.classList.add('video'); render(); return; }
    scorm.init();
    var resume = load();
    if (resume > 0 && resume < C.screens.length) {
      state.i = 0; render();
      var dlg = document.createElement('div');
      dlg.className = 'dialog';
      dlg.innerHTML = '<div class="box" role="dialog" aria-label="Kaldığın yer"><h3>Tekrar hoş geldin</h3><p>Bu eğitime daha önce başlamıştın. Kaldığın yerden (' + (resume + 1) + ' / ' + C.screens.length + ') devam etmek ister misin?</p><div class="row"><button class="a">Kaldığım yerden devam et</button><button class="b">Baştan başla</button></div></div>';
      document.body.appendChild(dlg);
      dlg.querySelector('.a').addEventListener('click', function () { dlg.remove(); go(resume); });
      dlg.querySelector('.b').addEventListener('click', function () { dlg.remove(); });
    } else { render(); }
    window.addEventListener('beforeunload', function () { save(); scorm.finish(); });
    window.addEventListener('pagehide', function () { save(); scorm.finish(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
