/* زر "اطلب عرض سعر" عائم: يظهر بعد تجاوز أول الصفحة ويختفي عند الوصول لنموذج الطلب أو في أسفل الصفحة. */
(function () {
  var rq = document.getElementById('request'); if (!rq) return;
  var a = document.createElement('a'); a.className = 'sticky-cta'; a.href = '#request';
  var EN = function () { return document.documentElement.lang === 'en'; };
  function txt() { a.textContent = EN() ? 'Get a quote' : 'اطلب عرض سعر'; }
  txt(); document.body.appendChild(a);
  new MutationObserver(txt).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  var inView = false, tick = false;
  function upd() {
    tick = false;
    var r = rq.getBoundingClientRect(), vh = window.innerHeight;
    inView = r.top < vh * 0.75 && r.bottom > vh * 0.25;
    var ft = document.querySelector('footer'), nearEnd = ft && ft.getBoundingClientRect().top < vh;
    a.classList.toggle('show', window.scrollY > vh * 0.9 && !inView && !nearEnd);
  }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  addEventListener('resize', upd); upd();
})();
