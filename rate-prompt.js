/* نافذة التحميل: عند الضغط على "تحميل" تُفتح نافذة فيها مؤقت 10 ثوانٍ ودعوة لتقييم القالب،
   وبعدها يظهر زر "تحميل الآن" الذي يفتح الرابط مباشرة. يُحتسب التحميل (العدّاد وAnalytics) عند ضغط الزر الأخير فقط. */
(function () {
  var WAIT = 10;
  var EN = function () { return document.documentElement.lang === 'en'; };
  var done = {}, cur = null;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function close() {
    if (!cur) return;
    var c = cur; cur = null;
    clearInterval(c.iv); document.removeEventListener('keydown', c.key, true);
    c.root.classList.remove('on');
    setTimeout(function () { if (c.root.parentNode) c.root.parentNode.removeChild(c.root); }, 250);
    if (c.prev && c.prev.focus) try { c.prev.focus(); } catch (e) {}
  }

  function open(name, url, loc) {
    close();
    var en = EN(), left = done[name] ? 0 : WAIT;
    var root = el('div', 'dlm'), card = el('div', 'dlm-card');
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', en ? 'Download' : 'تحميل القالب');
    var x = el('button', 'dlm-x', '×'); x.type = 'button'; x.setAttribute('aria-label', en ? 'Close' : 'إغلاق');
    var h = el('h3', 'dlm-h'); h.appendChild(document.createTextNode(en ? 'Downloading ' : 'تحميل ')); h.appendChild(el('b', '', name));
    var p = el('p', 'dlm-p', en ? 'Your download will be ready in a moment. Meanwhile, what do you think of this template?' : 'سيكون التحميل جاهزاً بعد لحظات. وإلى ذلك الحين، ما رأيك بهذا القالب؟');
    var rt = el('div', 'dlm-rt');
    var bar = el('div', 'dlm-bar'), fill = el('span'); bar.appendChild(fill);
    var go = el('a', 'dlm-go'); go.href = url; go.target = '_blank'; go.rel = 'noopener'; go.setAttribute('aria-disabled', 'true');
    card.appendChild(x); card.appendChild(h); card.appendChild(p); card.appendChild(rt); card.appendChild(bar); card.appendChild(go);
    root.appendChild(card); document.body.appendChild(root);
    if (window.MrRating) window.MrRating.mount(rt, 't_' + name); else rt.hidden = true;

    function label() {
      if (left > 0) { go.textContent = en ? 'Download in ' + left + 's' : 'التحميل بعد ' + left + ' ثوانٍ'; }
      else { go.textContent = en ? 'Download now' : 'تحميل الآن'; go.classList.add('ready'); go.removeAttribute('aria-disabled'); }
    }
    fill.style.transition = 'none'; fill.style.width = left ? '0%' : '100%';
    label();
    if (left > 0) {
      requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.transition = 'width ' + left + 's linear'; fill.style.width = '100%'; }); });
    }
    var iv = setInterval(function () { if (left > 0) { left--; label(); if (left === 0) { done[name] = 1; clearInterval(iv); try { go.focus(); } catch (e) {} } } }, 1000);
    go.addEventListener('click', function (e) {
      if (left > 0) { e.preventDefault(); return; }
      if (window.MrCount) window.MrCount.hit('t_' + name);
      if (window.mrTrack) window.mrTrack('template_download', { template_name: name, link_location: loc || 'templates_page' });
      setTimeout(close, 400);
    });
    rt.addEventListener('click', function (e) {
      if (!e.target.closest('.rt-s')) return;
      setTimeout(function () { if (cur && cur.root === root) p.textContent = en ? 'Thank you for your rating ♥' : 'شكراً لتقييمك ♥'; }, 700);
    });
    var key = function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', key, true);
    x.addEventListener('click', close);
    root.addEventListener('click', function (e) { if (e.target === root) close(); });
    cur = { root: root, iv: iv, key: key, prev: document.activeElement };
    requestAnimationFrame(function () { root.classList.add('on'); });
    try { x.focus(); } catch (e) {}
  }
  window.MrDl = { open: open };
})();
