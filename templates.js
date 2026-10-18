(function () {
  var T = window.TEMPLATES || [];
  var latestList = T.filter(function (t) { return !t.bonus; }).slice(-6).reverse();
  var fullList = T.slice().reverse();
  var curList = [], curIdx = 0;
  var EN = function () { return document.documentElement.lang === 'en'; };
  var DD = { ar: 'قالب عرض تقديمي احترافي بتصميم عصري وقابل للتعديل بالكامل.', en: 'A modern, fully editable professional presentation template.' };
  function descOf(t) { return EN() ? (t.e || DD.en) : (t.d || DD.ar); }
  function escH(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  var DL_ICON = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M4.5 7 8 10.5 11.5 7M3 13.5h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ZOOM_ICON = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9.5 2H14v4.5M6.5 14H2V9.5M14 2 9.5 6.5M2 14l4.5-4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CM_ICON = '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  // بطاقة زجاجية موحّدة (الرئيسية + صفحة النماذج)
  function tlCard(t, isNew) {
    var num = (t.name.match(/\d+/) || [''])[0];
    var hs = t.imgs && t.imgs.length;
    var sheets = hs ? '<span class="tl-sheets" aria-hidden="true">' + [0, 1, 2, 3].map(function (k) {
      var p = t.imgs[k] || t.img;
      return '<span class="tl-sheet" style="--img:url(\'' + escH(encodeURI(p).replace(/'/g, '%27')) + '\')"></span>';
    }).join('') + '</span>' : '';
    var im = '<img loading="lazy" decoding="async" src="' + encodeURI(t.img) + '" alt="قالب PowerPoint جاهز رقم ' + num + '" />';
    return '<article class="tl-card' + (hs ? ' has-s' : '') + '" data-i="' + T.indexOf(t) + '" tabindex="0" role="button" aria-label="معاينة ' + t.name + '">' +
      sheets + (hs ? '<span class="tl-clip">' + im + '</span>' : im) +
      (isNew ? '<span class="tl-badge" data-translate="new_badge">جديد</span>' : '') +
      '<span class="tl-zoom" aria-hidden="true">' + ZOOM_ICON + '</span>' +
      '<div class="tl-glass"><div class="tl-info"><span class="tl-name">' + t.name + '</span><span class="tl-desc">' + escH(descOf(t)) + '</span><span class="tl-meta"><span class="rt-ro" data-rt="t_' + escH(t.name) + '"></span><span class="ct-d" data-cd="t_' + escH(t.name) + '"></span></span></div>' +
      '<a href="' + t.url + '" target="_blank" rel="noreferrer noopener" class="tl-dl">' + DL_ICON + '<span data-translate="download">تحميل</span></a></div></article>';
  }

  // ── معاينة كبيرة للصورة + تنقّل + تعليقات ──
  var lb, lastFocus, touchX = null;
  var CHEV = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'tpl-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<button class="tpl-lb-close" type="button" aria-label="إغلاق"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4 4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
      '<button class="tpl-lb-nav tpl-lb-prev" type="button" aria-label="السابق">' + CHEV + '</button>' +
      '<button class="tpl-lb-nav tpl-lb-next" type="button" aria-label="التالي">' + CHEV + '</button>' +
      '<figure class="tpl-lb-fig"><img alt="" /><figcaption><div class="tpl-lb-left"><div class="tpl-lb-meta"><span class="tpl-lb-name"></span><span class="tpl-lb-count"></span></div><p class="tpl-lb-desc"></p>' +
      '<div class="tpl-lb-line"><div class="tpl-lb-rt rt"></div><span class="tpl-lb-ct"></span><button class="tpl-lb-cmb" type="button" aria-expanded="false">' + CM_ICON + '<span class="tpl-lb-cmt"></span></button></div></div>' +
      '<a class="tl-dl" target="_blank" rel="noreferrer noopener">' + DL_ICON + '<span class="tpl-lb-dl"></span></a></figcaption></figure>' +
      '<div class="tpl-lb-cm" role="region"><button class="tpl-lb-cmx" type="button" aria-label="إغلاق التعليقات"><svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4 4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><div class="tpl-lb-cmh"></div></div>';
    document.body.appendChild(lb);
    lb.addEventListener('click', function (e) {
      if (e.target.closest('.tl-dl') || e.target.closest('.tpl-lb-nav') || e.target.closest('.tpl-lb-line') || e.target.closest('.tpl-lb-cm')) return;
      closePreview();
    });
    lb.querySelector('.tpl-lb-prev').addEventListener('click', function () { step(-1); });
    lb.querySelector('.tpl-lb-next').addEventListener('click', function () { step(1); });
    lb.querySelector('.tpl-lb-cmb').addEventListener('click', function () { toggleCm(); });
    lb.querySelector('.tpl-lb-cmx').addEventListener('click', function () { setCm(false); });
    lb.addEventListener('touchstart', function (e) { touchX = e.target.closest('.tpl-lb-cm') ? null : e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) > 50) step((dx > 0) === isRTL() ? 1 : -1);
    }, { passive: true });
  }
  function isRTL() { return document.documentElement.dir === 'rtl'; }
  function curT() { var t = curList[curIdx]; return t && t.bonus !== undefined ? t : null; }
  function loadCm() {
    var t = curT(); if (!t || !window.MrComments) return;
    MrComments.mount(lb.querySelector('.tpl-lb-cmh'), 't_' + t.name, { ar: 'تعليقات على ' + t.name, en: 'Comments on ' + t.name });
  }
  function setCm(open) {
    lb.classList.toggle('cm-open', open);
    lb.querySelector('.tpl-lb-cmb').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) loadCm();
  }
  function toggleCm() { setCm(!lb.classList.contains('cm-open')); }
  function show() {
    var t = curList[curIdx], img = lb.querySelector('.tpl-lb-fig img');
    img.classList.add('loading');
    img.onload = function () { img.classList.remove('loading'); };
    img.src = encodeURI(t.img); img.alt = t.name;
    lb.querySelector('.tpl-lb-name').textContent = t.name;
    lb.querySelector('.tpl-lb-count').textContent = (curIdx + 1) + ' / ' + curList.length;
    var isT = t.bonus !== undefined, ds = isT ? descOf(t) : (t.desc || ''), dEl = lb.querySelector('.tpl-lb-desc'), line = lb.querySelector('.tpl-lb-line');
    dEl.textContent = ds; dEl.style.display = ds ? '' : 'none';
    line.style.display = isT ? '' : 'none';
    if (isT && window.MrRating) MrRating.mount(lb.querySelector('.tpl-lb-rt'), 't_' + t.name);
    if (isT && window.MrCount) MrCount.mount(lb.querySelector('.tpl-lb-ct'), 't_' + t.name, 'd');
    var cmb = lb.querySelector('.tpl-lb-cmb');
    cmb.style.display = (isT && window.MrComments) ? '' : 'none';
    lb.querySelector('.tpl-lb-cmt').textContent = EN() ? 'Comments' : 'التعليقات';
    lb.querySelector('.tpl-lb-cmx').setAttribute('aria-label', EN() ? 'Close comments' : 'إغلاق التعليقات');
    if (!isT) lb.classList.remove('cm-open'); else if (lb.classList.contains('cm-open')) loadCm();
    var dl = lb.querySelector('.tl-dl'); dl.style.display = t.url ? '' : 'none'; if (t.url) dl.href = t.url;
    lb.querySelector('.tpl-lb-dl').textContent = EN() ? 'Download' : 'تحميل';
    lb.querySelector('.tpl-lb-close').setAttribute('aria-label', EN() ? 'Close' : 'إغلاق');
    lb.querySelector('.tpl-lb-prev').setAttribute('aria-label', EN() ? 'Previous' : 'السابق');
    lb.querySelector('.tpl-lb-next').setAttribute('aria-label', EN() ? 'Next' : 'التالي');
    lb.classList.toggle('single', curList.length < 2);
    [1, -1].forEach(function (d) { new Image().src = encodeURI(curList[(curIdx + d + curList.length) % curList.length].img); });
  }
  function step(d) {
    if (curList.length < 2) return;
    curIdx = (curIdx + d + curList.length) % curList.length;
    show();
  }
  function openPreview(list, idx) {
    if (!lb) buildLightbox();
    lastFocus = document.activeElement;
    curList = list; curIdx = idx;
    show();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.tpl-lb-close').focus();
  }
  function closePreview() {
    if (!lb || !lb.classList.contains('open')) return;
    lb.classList.remove('open', 'cm-open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function openFromCard(c) {
    var t0 = T[+c.getAttribute('data-i')];
    if (t0 && t0.imgs && t0.imgs.length) { // قالب له شرائح: المعاينة تعرض شرائحه
      openPreview([t0.img].concat(t0.imgs).map(function (p) { return Object.assign({}, t0, { img: p }); }), 0);
      return;
    }
    var list = c.closest('#tlLatest') ? latestList : fullList;
    var idx = list.indexOf(T[+c.getAttribute('data-i')]);
    openPreview(list, Math.max(0, idx));
  }
  document.addEventListener('keydown', function (e) {
    if (lb && lb.classList.contains('open')) {
      // أثناء الكتابة في التعليقات: لا تنتقل الشرائح ولا تُغلق المعاينة (Esc يغلق لوحة التعليقات فقط)
      if (e.target.closest && e.target.closest('.tpl-lb-cm')) { if (e.key === 'Escape') setCm(false); return; }
      if (e.key === 'Escape') { if (lb.classList.contains('cm-open')) setCm(false); else closePreview(); }
      else if (e.key === 'ArrowRight') step(isRTL() ? -1 : 1);
      else if (e.key === 'ArrowLeft') step(isRTL() ? 1 : -1);
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('tl-card')) {
      e.preventDefault(); openFromCard(e.target);
    }
  });
  document.addEventListener('click', function (e) {
    var dl = e.target.closest('.tl-dl');
    if (dl && window.MrCount) { // عدّاد التحميلات (من البطاقة أو من نافذة المعاينة)
      var card = dl.closest('.tl-card'), tt = card ? T[+card.getAttribute('data-i')] : (lb && lb.contains(dl) ? curT() : null);
      if (tt && tt.name) MrCount.hit('t_' + tt.name);
    }
    var c = e.target.closest('.tl-card');
    if (!c || dl) return;
    openFromCard(c);
  });

  window.openImagePreview = openPreview; // معاينة عامة: openImagePreview([{name,img,url?}], index)

  // ── الصفحة الرئيسية: خط زمني لآخر 6 قوالب ──
  var tl = document.getElementById('tlLatest');
  if (tl) {
    var latest = latestList;
    var fill = tl.querySelector('.tl-line-fill');
    latest.forEach(function (t, i) {
      var row = document.createElement('div');
      row.className = 'tl-row';
      row.innerHTML = '<div class="tl-item ' + (i % 2 === 0 ? 'start' : 'end') + '">' + tlCard(t, i === 0) + '</div><span class="tl-dot"></span>';
      tl.appendChild(row);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.25 });
    tl.querySelectorAll('.tl-row').forEach(function (r) { io.observe(r); });
    var ticking = false;
    var progress = function () {
      ticking = false;
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      fill.style.transform = 'scaleY(' + Math.min(1, Math.max(0, (vh * 0.65 - r.top) / r.height)) + ')';
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(progress); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    progress();
  }

  // ── صفحة النماذج: شبكة بنفس البطاقة (الأحدث أولاً) ──
  var grid = document.getElementById('templatesGrid');
  if (grid) {
    grid.innerHTML = fullList.map(function (t, i) {
      return '<div class="tpl-cell" style="--d:' + ((i % 3) * 90) + 'ms">' + tlCard(t, false) + '</div>';
    }).join('');
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } });
    }, { threshold: 0.12 });
    grid.querySelectorAll('.tpl-cell').forEach(function (c) { io2.observe(c); });
  }

  function mountAll() {
    [].forEach.call(document.querySelectorAll('.rt-ro[data-rt]'), function (el) { if (window.MrRating) MrRating.mount(el, el.getAttribute('data-rt'), true); });
    [].forEach.call(document.querySelectorAll('.ct-d[data-cd]'), function (el) { if (window.MrCount) MrCount.mount(el, el.getAttribute('data-cd'), 'd'); });
  }
  function relang() { [].forEach.call(document.querySelectorAll('.tl-card'), function (c) { var d = c.querySelector('.tl-desc'); if (d) d.textContent = descOf(T[+c.getAttribute('data-i')]); }); }
  mountAll(); relang();
  new MutationObserver(relang).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
