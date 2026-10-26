/* بعد ضغط "تحميل" على قالب: نافذة صغيرة غير حاجبة تدعو لتقييم القالب (تظهر بعد لحظات، وتختفي وحدها).
   لا تمنع التحميل ولا تغطي الصفحة، ولا تظهر لمن قيّم القالب سابقاً أو ظهرت له في هذه الجلسة. */
(function () {
  var EN = function () { return document.documentElement.lang === 'en'; };
  var sk = function (k) { return String(k).replace(/[^\w-]+/g, '-'); };
  var lsG = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  var shown = {}, box = null, timer = 0;
  function close() {
    clearTimeout(timer);
    if (!box) return;
    var b = box; box = null; b.classList.remove('on');
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 350);
  }
  function show(name) {
    if (!window.MrRating || !name) return;
    var key = 't_' + name;
    if (shown[key] || (lsG('mr_ratings', {})[sk(key)])) return;
    shown[key] = 1;
    setTimeout(function () {
      close();
      var en = EN();
      box = document.createElement('div'); box.className = 'rp'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-live', 'polite');
      var x = document.createElement('button'); x.type = 'button'; x.className = 'rp-x'; x.textContent = '×'; x.setAttribute('aria-label', en ? 'Close' : 'إغلاق');
      var t = document.createElement('div'); t.className = 'rp-t';
      t.appendChild(document.createTextNode(en ? 'Thanks for downloading ' : 'شكراً لتحميلك '));
      var b = document.createElement('b'); b.textContent = name; t.appendChild(b);
      t.appendChild(document.createTextNode(en ? '! How was it? Rate it:' : '! ما رأيك به؟ قيّمه:'));
      var s = document.createElement('div'); s.className = 'rp-s';
      box.appendChild(x); box.appendChild(t); box.appendChild(s);
      document.body.appendChild(box);
      window.MrRating.mount(s, key);
      requestAnimationFrame(function () { box && box.classList.add('on'); });
      x.addEventListener('click', close);
      var cur = box;
      s.addEventListener('click', function (e) {
        if (!e.target.closest('.rt-s')) return;
        setTimeout(function () {
          if (box !== cur) return;
          t.textContent = en ? 'Thank you for your rating ♥' : 'شكراً لتقييمك ♥';
          clearTimeout(timer); timer = setTimeout(close, 1800);
        }, 700);
      });
      var arm = function () { clearTimeout(timer); timer = setTimeout(close, 14000); };
      box.addEventListener('mouseenter', function () { clearTimeout(timer); });
      box.addEventListener('mouseleave', arm);
      arm();
    }, 1200);
  }
  window.MrRatePrompt = { show: show };
})();
