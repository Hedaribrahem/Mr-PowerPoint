/* عدّادان في صفحة كل النماذج: عدد القوالب وإجمالي التحميلات (الأرقام من Firestore عبر MrStats، مثل الصفحة الرئيسية) */
(function () {
  var grid = document.getElementById('templatesGrid');
  if (!grid || !window.TEMPLATES) return;
  var EN = function () { return document.documentElement.lang === 'en'; };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mk(id) {
    var w = document.createElement('div'); w.className = 'strip-item';
    var n = document.createElement('span'); n.className = 'strip-num'; n.textContent = '+0';
    var l = document.createElement('span'); l.className = 'strip-label';
    w.appendChild(n); w.appendChild(l); return { w: w, n: n, l: l, v: 0, shown: false };
  }
  var box = document.createElement('div'); box.className = 'tpl-stats';
  var A = mk(), B = mk(); B.w.hidden = true;
  box.appendChild(A.w); box.appendChild(B.w);
  grid.parentNode.insertBefore(box, grid);

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (x) {
      if (!x.isIntersecting) return;
      io.unobserve(x.target);
      var e = x.target._e; e.shown = true; run(e);
    });
  }, { threshold: 0.6 });
  function fmt(v) { return '+' + Math.floor(v).toLocaleString('en-US'); }
  function run(e) {
    var to = e.v, t0 = null; e.anim = true;
    if (reduce) { e.n.textContent = fmt(to); return; }
    (function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / 1600);
      e.n.textContent = fmt(p < 1 ? to * (1 - Math.pow(1 - p, 4)) : to);
      if (p < 1) requestAnimationFrame(step); else e.anim = false;
    })(performance.now());
  }
  function set(e, v) {
    var first = !e.w._e;
    e.v = v;
    if (first) { e.w._e = e; io.observe(e.w); }
    else if (e.shown && !e.anim) e.n.textContent = fmt(v);
  }
  function total() { var s = 0; (window.TEMPLATES || []).forEach(function (t) { s += window.MrStats ? MrStats.get('t_' + t.name).n : 0; }); return s; }
  function paint() {
    var en = EN(), d = total();
    A.l.textContent = en ? 'ready templates' : 'قالب جاهز';
    B.l.textContent = en ? 'total downloads' : 'تحميل للقوالب';
    set(A, window.TEMPLATES.length);
    if (d > 0) { B.w.hidden = false; set(B, d); } else B.w.hidden = true;
  }
  paint();
  if (window.MrStats) MrStats.onData(paint);
  new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
