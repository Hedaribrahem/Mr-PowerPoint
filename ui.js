(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ── إحصائيات من site-data.js (عدد العملاء والتقييم) ──
  var ST = (window.SITE && window.SITE.stats) || {};
  [].forEach.call(document.querySelectorAll('.strip-num[data-site]'), function (el) {
    var v = ST[el.getAttribute('data-site')];
    if (v == null) return;
    el.setAttribute('data-to', v);
    el.textContent = (el.getAttribute('data-pre') || '') + (+v).toFixed(+el.getAttribute('data-dec') || 0) + (el.getAttribute('data-suf') || '');
  });

  // ── أرقام القوالب والدروس تُقرأ من ملفات البيانات بدل كتابتها يدوياً ──
  [].forEach.call(document.querySelectorAll('.strip-num[data-count]'), function (el) {
    var n = el.getAttribute('data-count') === 'templates'
      ? (window.TEMPLATES || []).filter(function (t) { return !t.bonus; }).length
      : (window.LESSONS || []).length;
    if (n) { el.setAttribute('data-to', n); el.textContent = '+' + n; }
  });

  // ── عدّاد الأرقام: يبدأ سريعاً ثم يتباطأ حتى يقف على الرقم النهائي ──
  var nums = [].slice.call(document.querySelectorAll('.strip-num[data-to]'));
  function fmt(el, v) {
    el.textContent = (el.getAttribute('data-pre') || '') + v.toFixed(+el.getAttribute('data-dec') || 0) + (el.getAttribute('data-suf') || '');
  }
  if (nums.length && !reduce) {
    nums.forEach(function (el) { fmt(el, 0); });
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, to = parseFloat(el.getAttribute('data-to')), t0 = null, dur = 2200;
        (function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          fmt(el, p < 1 ? to * (1 - Math.pow(1 - p, 4)) : to);
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { cio.observe(el); });
  }

  // ── الأكاديمية: مشغّل على اليمين + قائمة دروس على اليسار (مثل يوتيوب) ──
  var LS = window.LESSONS || [], box = document.getElementById('acBox');
  if (box && LS.length) {
    var list = LS.slice().reverse(), sel = 0, playing = false;
    var EN2 = function () { return document.documentElement.lang === 'en'; };
    var AR_RE = /[؀-ۿ]/;
    var DD = { ar: 'في هذا الدرس نتعلم خطوة جديدة في تصميم العروض التقديمية بأسلوب مبسّط وعملي.', en: 'In this lesson we learn a new step in presentation design, in a simple and practical way.' };
    // الوصف الإنجليزي: المترجم إن وُجد، أو الوصف الأصلي إن كان إنجليزياً أصلاً، وإلا النص الافتراضي
    var ld = function (l) { return EN2() ? (l.e || (l.d && !AR_RE.test(l.d) ? l.d : DD.en)) : (l.d || DD.ar); };
    // العنوان الإنجليزي (te) إن وُجد
    var lt = function (l) { return (EN2() && l.te) ? l.te : (l.t || ((EN2() ? 'Lesson ' : 'درس ') + l.n)); };
    var th = function (l, q) { return 'https://img.youtube.com/vi/' + l.id + '/' + q + '.jpg'; };
    var esc2 = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
    var PLAY = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
    box.innerHTML =
      '<div class="ac-main reveal"><div class="ac-player"></div><div class="ac-info"><h3 class="video-title ac-title"></h3><p class="ac-desc"></p><a class="ac-more" target="_blank" rel="noopener noreferrer" hidden></a>' +
      '<div class="ac-meta"><div class="rt"></div><a class="ac-yt" target="_blank" rel="noopener noreferrer"><span data-translate="ac_watch">شاهد على يوتيوب</span></a></div></div></div>' +
      '<aside class="ac-side reveal reveal-delay-2"><div class="ac-side-in"><div class="ac-side-h" data-translate="ac_list">قائمة الدروس</div><div class="ac-list">' +
      list.map(function (l, i) {
        return '<button type="button" class="ac-item" data-i="' + i + '"><span class="ac-th"><img loading="lazy" decoding="async" src="' + th(l, 'mqdefault') + '" alt="" /><span class="ac-n">' + l.n + '</span></span>' +
          '<span class="ac-tx">' + (i === 0 ? '<span class="ac-new" data-translate="ac_newest">الأحدث</span>' : '') + '<b class="video-title"></b><small class="ac-ds"></small><span class="rt-ro" data-lr="l_' + l.id + '"></span></span></button>';
      }).join('') + '</div></div></aside>';

    // يُظهر "عرض المزيد" فقط إذا كان الوصف أطول من سطرين
    var chkMore = function () {
      var d = box.querySelector('.ac-desc'), m = box.querySelector('.ac-more');
      if (!d || !m) return;
      m.hidden = !(d.scrollHeight > d.clientHeight + 1);
    };

    var paint = function () {
      var l = list[sel], p = box.querySelector('.ac-player');
      if (!playing) p.innerHTML = '<img src="' + th(l, 'maxresdefault') + '" alt="' + esc2(lt(l)) + '" onload="if(this.naturalWidth<200)this.src=\'' + th(l, 'hqdefault') + '\'" /><button class="ac-play" type="button" aria-label="' + (EN2() ? 'Play' : 'تشغيل') + '">' + PLAY + '</button>';
      box.querySelector('.ac-title').textContent = lt(l);
      box.querySelector('.ac-desc').textContent = ld(l);
      box.querySelector('.ac-yt').href = 'https://youtu.be/' + l.id;
      var more = box.querySelector('.ac-more');
      more.href = 'https://youtu.be/' + l.id;
      more.textContent = EN2() ? 'Show more' : 'عرض المزيد';
      more.hidden = true;
      requestAnimationFrame(chkMore);
      if (window.MrRating) MrRating.mount(box.querySelector('.ac-meta .rt'), 'l_' + l.id);
      [].forEach.call(box.querySelectorAll('.ac-item'), function (b, i) {
        var x = list[i];
        b.classList.toggle('on', i === sel);
        b.querySelector('.video-title').textContent = lt(x);
        b.querySelector('.ac-ds').textContent = ld(x);
        if (window.MrRating) MrRating.mount(b.querySelector('.rt-ro'), 'l_' + x.id, true);
      });
    };
    box.addEventListener('click', function (e) {
      var it = e.target.closest('.ac-item');
      if (it) {
        sel = +it.getAttribute('data-i'); playing = false; paint();
        if (window.innerWidth < 900) box.querySelector('.ac-main').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      if (e.target.closest('.ac-play')) {
        playing = true; var l = list[sel];
        var src = l.emb || ('https://www.youtube-nocookie.com/embed/' + l.id + '?rel=0');
        src += (src.indexOf('?') < 0 ? '?' : '&') + 'autoplay=1';
        box.querySelector('.ac-player').innerHTML = '<iframe src="' + esc2(src) + '" title="' + esc2(lt(l)) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
      }
    });
    paint();
    window.addEventListener('resize', chkMore);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(chkMore);
    new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  // ── بطاقات الأعمال (مروحة) تُرسم من works-data.js ──
  var WK = window.WORKS || [], wkGrid = document.getElementById('wkGrid');
  if (wkGrid && WK.length) {
    var ea = function (s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
    var sheet = function (p) { return '<span class="wk-sheet" style="--img:url(\'' + ea(encodeURI(p).replace(/'/g, '%27')) + '\')"></span>'; };
    wkGrid.innerHTML = WK.map(function (w, i) {
      return '<article class="wk-card" data-full-img="' + ea(w.img) + '" style="--d:' + ((i % 3) * 0.1).toFixed(1) + 's" tabindex="0" role="button">' +
        '<span class="wk-badge">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
        '<div class="wk-cap" data-ar="' + ea(w.ar) + '" data-en="' + ea(w.en) + '"></div>' +
        '<div class="wk-desc" data-ar="' + ea(w.d || '') + '" data-en="' + ea(w.e || '') + '"></div>' +
        '<div class="wk-stack">' + [0, 1, 2, 3].map(function (k) { return sheet((w.imgs && w.imgs[k]) || w.img); }).join('') +
        '<span class="wk-art"><img class="wk-img" loading="lazy" decoding="async" src="' + ea(encodeURI(w.img)) + '" alt="" /></span></div></article>';
    }).join('');
    [].forEach.call(wkGrid.querySelectorAll('.wk-card'), function (c, i) {
      c.style.setProperty('--img', 'url("' + encodeURI(WK[i].img) + '")');
    });
    var wkLang = function () {
      var en = document.documentElement.lang === 'en';
      [].forEach.call(wkGrid.querySelectorAll('.wk-cap'), function (c) {
        c.textContent = c.getAttribute(en ? 'data-en' : 'data-ar');
        var label = (en ? 'Work sample: ' : 'نموذج عمل: ') + c.textContent, card = c.closest('.wk-card');
        card.setAttribute('aria-label', label);
        card.querySelector('.wk-img').alt = label;
        var ds = card.querySelector('.wk-desc'); if (ds) ds.textContent = ds.getAttribute(en ? 'data-en' : 'data-ar');
      });
    };
    wkLang();
    new MutationObserver(wkLang).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  // ── ظهور متدرج + معاينة ──
  var cards = [].slice.call(document.querySelectorAll('.wk-card'));
  if (!cards.length) return;
  var wio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); wio.unobserve(e.target); } });
  }, { threshold: 0.15 });
  cards.forEach(function (c) {
    wio.observe(c);
    var open = function () {
      if (window.openImagePreview) {
        var w = WK[cards.indexOf(c)] || {}, name = c.querySelector('.wk-cap').textContent.trim(), desc = (c.querySelector('.wk-desc') || {}).textContent || '';
        var gal = [c.getAttribute('data-full-img')].concat(w.imgs || []).map(function (p) { return { name: name, img: p, desc: desc }; });
        window.openImagePreview(gal, 0);
      }
    };
    c.addEventListener('click', open);
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
})();
