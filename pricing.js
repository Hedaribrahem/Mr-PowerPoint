/* أسعار تقريبية للخدمات: تُقرأ من pricing-data.js وتُدار من لوحة التحكم (تبويب الأسعار).
   القسم مخفي إن كان "show" خطأ أو لم تُكتب أسعار. زر "اطلب هذه الخدمة" يختار الخدمة في نموذج الطلب ويمرّر الصفحة إليه. */
(function () {
  var sec = document.getElementById('pricing'), P = window.PRICING;
  if (!sec || !P || !P.show) { if (sec) sec.hidden = true; return; }
  var items = (P.items || []).filter(function (x) { return x && x.p && String(x.p).trim(); });
  if (!items.length) { sec.hidden = true; return; }
  var EN = function () { return document.documentElement.lang === 'en'; };
  var NAMES = { s1: ['تصميم عرض تقديمي احترافي', 'Professional presentation design'], s2: ['تحويل عرض عادي إلى احترافي', 'Upgrade an existing presentation'],
    s3: ['قالب PowerPoint حسب هويتك', 'Custom branded template'], s4: ['عرض للمستثمرين أو الشركات', 'Investor / corporate deck'],
    s5: ['تحويل بيانات إلى إنفوغرافيك', 'Data to infographic'], s6: ['توحيد هوية العروض', 'Presentation branding'] };
  var T = { ar: { label: 'الأسعار', title: 'أسعار تقريبية لخدماتنا', sub: 'اختر الخدمة وأرسل تفاصيلك، ونرد عليك بعرض سعر نهائي.', btn: 'اطلب هذه الخدمة' },
            en: { label: 'Pricing', title: 'Approximate prices', sub: 'Pick a service and send your details. We reply with a final quote.', btn: 'Request this service' } };
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function build() {
    var en = EN(), s = T[en ? 'en' : 'ar'];
    sec.innerHTML = ''; sec.hidden = false;
    var hd = h('div', 'section-header'), inner = h('div');
    inner.appendChild(h('div', 'section-label', s.label)); inner.appendChild(h('h2', 'section-title', s.title)); inner.appendChild(h('p', 'section-subtitle', s.sub));
    hd.appendChild(inner); sec.appendChild(hd);
    var grid = h('div', 'pc-grid');
    items.forEach(function (x) {
      var nm = NAMES[x.id]; if (!nm) return;
      var c = h('div', 'pc-card');
      c.appendChild(h('h3', 'pc-name', nm[en ? 1 : 0]));
      c.appendChild(h('div', 'pc-price', (en && x.pe) || x.p));
      var d = (en && x.de) || x.d; if (d) c.appendChild(h('p', 'pc-note', d));
      var b = h('a', 'btn-outline pc-btn', s.btn); b.href = '#request';
      b.addEventListener('click', function () { document.dispatchEvent(new CustomEvent('mr-pick-service', { detail: x.id })); });
      c.appendChild(b); grid.appendChild(c);
    });
    sec.appendChild(grid);
    var n = (en && P.noteE) || P.note; if (n) sec.appendChild(h('p', 'pc-foot', n));
  }
  build();
  new MutationObserver(build).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
