(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

  // ── الأكاديمية: الأحدث مميّز + صف دروس أفقي (من الأحدث للأقدم) ──
  var LS = window.LESSONS || [], box = document.getElementById('acBox');
  if (box && LS.length) {
    var list = LS.slice().reverse(), top = list[0], rest = list.slice(1);
    var url = function (l) { return 'https://youtu.be/' + l.id; };
    box.innerHTML =
      '<a class="ac-feature video-link reveal" href="' + url(top) + '" target="_blank" rel="noopener noreferrer">' +
        '<img src="https://img.youtube.com/vi/' + top.id + '/maxresdefault.jpg" alt="درس ' + top.n + '" decoding="async" onerror="this.onerror=null;this.src=\'https://img.youtube.com/vi/' + top.id + '/hqdefault.jpg\'" />' +
        '<span class="ac-badge" data-translate="ac_newest">الأحدث</span>' +
        '<span class="ac-play"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg></span>' +
        '<div class="ac-fcap"><h4 class="video-title">درس ' + top.n + '</h4><span class="btn-primary ac-fbtn"><span data-translate="ac_watch">شاهد على يوتيوب</span></span></div></a>' +
      '<div class="ac-head reveal"><h3 data-translate="ac_older">الدروس السابقة</h3><div class="ac-nav"><button class="ac-btn ac-prev" type="button" aria-label="السابق"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="ac-btn ac-next" type="button" aria-label="التالي"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M7.5 4.5 13 10l-5.5 5.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>' +
      '<div class="ac-row reveal">' + rest.map(function (l) {
        return '<a class="ac-card video-link" href="' + url(l) + '" target="_blank" rel="noopener noreferrer">' +
          '<img loading="lazy" decoding="async" src="https://img.youtube.com/vi/' + l.id + '/hqdefault.jpg" alt="درس ' + l.n + '" />' +
          '<span class="ac-play"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg></span>' +
          '<div class="ac-glass"><h4 class="video-title">درس ' + l.n + '</h4></div></a>';
      }).join('') + '</div>';
    var row = box.querySelector('.ac-row'), prevB = box.querySelector('.ac-prev'), nextB = box.querySelector('.ac-next');
    var rtl = function () { return document.documentElement.dir === 'rtl'; };
    var upd = function () {
      var max = row.scrollWidth - row.clientWidth - 2, x = Math.abs(row.scrollLeft);
      prevB.disabled = x <= 2; nextB.disabled = x >= max;
    };
    var go = function (d) { row.scrollBy({ left: d * row.clientWidth * 0.8 * (rtl() ? -1 : 1), behavior: reduce ? 'auto' : 'smooth' }); };
    prevB.addEventListener('click', function () { go(-1); });
    nextB.addEventListener('click', function () { go(1); });
    row.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  // ── بطاقات الأعمال: ظهور متدرج + ميلان ثلاثي الأبعاد + بقعة ضوء + معاينة ──
  var cards = [].slice.call(document.querySelectorAll('.wk-card'));
  if (!cards.length) return;
  var wio = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); wio.unobserve(e.target); } });
  }, { threshold: 0.15 });
  cards.forEach(function (c) {
    wio.observe(c);
    var open = function () {
      if (window.openImagePreview) {
        var list = cards.map(function (x) { return { name: x.querySelector('.wk-cap').textContent.trim(), img: x.getAttribute('data-full-img') }; });
        window.openImagePreview(list, cards.indexOf(c));
      }
    };
    c.addEventListener('click', open);
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    if (!fine || reduce) return;
    var inner = c.querySelector('.wk-inner'), raf = false, px = 0.5, py = 0.5;
    c.addEventListener('mouseenter', function () { c.classList.add('tilt'); });
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width; py = (e.clientY - r.top) / r.height;
      if (raf) return; raf = true;
      requestAnimationFrame(function () {
        raf = false;
        inner.style.setProperty('--rx', ((0.5 - py) * 7).toFixed(2) + 'deg');
        inner.style.setProperty('--ry', ((px - 0.5) * 9).toFixed(2) + 'deg');
        inner.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        inner.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
    });
    c.addEventListener('mouseleave', function () {
      c.classList.remove('tilt');
      inner.style.setProperty('--rx', '0deg'); inner.style.setProperty('--ry', '0deg');
    });
  });
})();
