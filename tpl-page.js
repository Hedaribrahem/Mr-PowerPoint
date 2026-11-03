/* صفحة القالب المستقلة (template/اسم.html): معرض المعاينات، التقييم، العدّاد، التعليقات، نافذة التحميل، المشاركة، وتبديل اللغة. */
(function () {
  var main = document.querySelector('.tp-main'); if (!main) return;
  var name = main.getAttribute('data-name');
  var EN = function () { return document.documentElement.lang === 'en'; };

  /* معرض المعاينات */
  var mainImg = document.getElementById('tpMain'), th = document.getElementById('tpThumbs');
  if (th && mainImg) th.addEventListener('click', function (e) {
    var b = e.target.closest('.tp-th'); if (!b) return;
    mainImg.src = b.getAttribute('data-src');
    [].forEach.call(th.children, function (x) { x.classList.toggle('on', x === b); });
  });

  /* التقييم والعدّاد والتعليقات */
  if (window.MrRating) MrRating.mount(document.getElementById('tpRt'), 't_' + name);
  if (window.MrCount) MrCount.mount(document.getElementById('tpCt'), 't_' + name, 'd');
  function cm() { if (window.MrComments) MrComments.mount(document.getElementById('tpCm'), 't_' + name, { ar: 'تعليقات على ' + name, en: 'Comments on ' + name }); }
  cm();

  /* نافذة التحميل (مؤقت + تقييم + تعليق) */
  function open(a, nm) {
    if (window.MrDl && a.href) { MrDl.open(nm, a.href, 'template_page'); return true; }
    return false;
  }
  var dl = document.getElementById('tpDl');
  if (dl) dl.addEventListener('click', function (e) { if (open(dl, name)) e.preventDefault(); });
  [].forEach.call(document.querySelectorAll('.tp-gift'), function (g) {
    g.addEventListener('click', function (e) { if (open(g, g.getAttribute('data-name'))) e.preventDefault(); });
  });

  /* نسخ الرابط */
  var cp = document.getElementById('tpCopy');
  if (cp) cp.addEventListener('click', function () {
    var u = location.href.split('#')[0].split('?')[0], t = cp.textContent;
    var done = function () { cp.textContent = EN() ? 'Copied ✓' : 'تم النسخ ✓'; setTimeout(function () { cp.textContent = t; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done, function () {}); else done();
  });
  if (window.mrTrack) mrTrack('template_page_view', { template_name: name });

  /* اللغة: النص العربي ثابت في الصفحة (للأرشفة)، والإنجليزي في data-en */
  var els = [].slice.call(main.querySelectorAll('[data-en]'));
  els.forEach(function (e) { e._ar = e.textContent; });
  function lang() { els.forEach(function (e) { var v = EN() ? e.getAttribute('data-en') : e._ar; if (v) e.textContent = v; }); }
  lang();
  new MutationObserver(function () { lang(); cm(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
