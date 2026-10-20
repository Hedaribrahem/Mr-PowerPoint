/* الأسئلة الشائعة: تُقرأ من faq-data.js وتُدار من لوحة التحكم (تبويب الأسئلة).
   يُبنى القسم داخل <section id="faq"></section> في index.html ويتبدّل مع اللغة. */
(function () {
  var sec = document.getElementById('faq');
  if (!sec) return;
  var EN = function () { return document.documentElement.lang === 'en'; };
  var T = {
    ar: { label: 'أسئلة شائعة', title: 'أجوبة على ما يسألنا عنه العملاء', sub: 'لم تجد جوابك؟ اطلب عبر النموذج أو راسلنا على واتساب.' },
    en: { label: 'FAQ', title: 'Answers to what clients ask us', sub: "Didn't find your answer? Use the request form or message us on WhatsApp." }
  };
  var FAQ = window.FAQ || [];
  if (!FAQ.length) { sec.hidden = true; return; }
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function build() {
    var en = EN(), s = T[en ? 'en' : 'ar'];
    var open = [].map.call(sec.querySelectorAll('details'), function (d) { return d.open; });
    sec.innerHTML = '';
    var hd = h('div', 'section-header'), inner = h('div');
    inner.appendChild(h('div', 'section-label', s.label));
    inner.appendChild(h('h2', 'section-title', s.title));
    inner.appendChild(h('p', 'section-subtitle', s.sub));
    hd.appendChild(inner); sec.appendChild(hd);
    var list = h('div', 'fq-list');
    FAQ.forEach(function (f, i) {
      var d = h('details', 'fq-i'); if (open[i]) d.open = true;
      d.appendChild(h('summary', 'fq-q', (en && f.qe) || f.q));
      d.appendChild(h('p', 'fq-a', (en && f.ae) || f.a));
      list.appendChild(d);
    });
    sec.appendChild(list);
  }
  build();
  new MutationObserver(build).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
