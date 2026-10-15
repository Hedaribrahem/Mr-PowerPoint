(function () {
  var hero = document.getElementById('home');
  if (!hero) return;
  var slides = [].slice.call(hero.querySelectorAll('.hx-slide'));
  var bars = [].slice.call(hero.querySelectorAll('.hx-bar'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 769px)').matches;
  var cur = 0, zin = true; // الشريحة الأولى تبدأ بتقريب
  var isRTL = function () { return document.documentElement.dir === 'rtl'; };

  function labels() {
    var en = document.documentElement.lang === 'en';
    hero.querySelector('.hx-prev').setAttribute('aria-label', en ? 'Previous' : 'السابق');
    hero.querySelector('.hx-next').setAttribute('aria-label', en ? 'Next' : 'التالي');
    hero.querySelector('.hx-scroll').setAttribute('aria-label', en ? 'Scroll down' : 'مرّر للأسفل');
  }
  labels();
  new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  function go(i) {
    var prev = cur;
    cur = (i + slides.length) % slides.length;
    if (prev !== cur) {
      var old = slides[prev];
      old.classList.add('leave');               // تبقى حركتها مستمرة أثناء التلاشي
      setTimeout(function () { old.classList.remove('leave'); }, 1300);
      zin = !zin;                               // تقريب ثم تبعيد بالتناوب: بداية كل شريحة = نهاية السابقة
      slides[cur].setAttribute('data-z', zin ? 'in' : 'out');
    }
    slides.forEach(function (s, k) { s.classList.toggle('active', k === cur); s.setAttribute('aria-hidden', k === cur ? 'false' : 'true'); });
    bars.forEach(function (b, k) {
      b.classList.remove('on', 'done');
      b.removeAttribute('aria-current');
      if (k < cur) b.classList.add('done');
      if (k === cur) { void b.offsetWidth; b.classList.add(reduce ? 'done' : 'on'); b.setAttribute('aria-current', 'true'); }
    });
  }

  bars.forEach(function (b, k) {
    b.addEventListener('click', function () { go(k); });
    b.querySelector('i').addEventListener('animationend', function () { if (k === cur) go(cur + 1); });
  });
  hero.querySelector('.hx-prev').addEventListener('click', function () { go(cur - 1); });
  hero.querySelector('.hx-next').addEventListener('click', function () { go(cur + 1); });

  var holds = { hover: false, view: false, tab: false };
  function sync() { hero.classList.toggle('paused', holds.hover || holds.view || holds.tab); }
  if (desktop) {
    hero.addEventListener('mouseenter', function () { holds.hover = true; sync(); });
    hero.addEventListener('mouseleave', function () { holds.hover = false; sync(); });
  }
  new IntersectionObserver(function (es) { holds.view = !es[0].isIntersecting; sync(); }, { threshold: 0.3 }).observe(hero);
  document.addEventListener('visibilitychange', function () { holds.tab = document.hidden; sync(); });

  var tx = null;
  hero.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) go(cur + ((dx > 0) === isRTL() ? 1 : -1));
  }, { passive: true });

  go(0);
})();
