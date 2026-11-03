/* مولّد صفحات القوالب. تستخدمه لوحة التحكم عند حفظ القوالب لتوليد:
   - template/اسم_القالب.html لكل قالب (صفحة ثابتة يفهرسها Google: عنوان ووصف وصورة ومعاينات وتقييم وتعليقات وقوالب مشابهة)
   - تحديث sitemap.xml
   القوالب الهدية (bonus:true) لا تُنشأ لها صفحة، وتظهر داخل صفحة القالب الأصلي (الذي يبدأ اسمها باسمه). */
(function (root) {
  var B = root.BlogGen || (typeof require !== 'undefined' ? require('./blog-gen.js') : null);
  var SITE = B.SITE, esc = B.esc;

  function slug(t) { return String(t.name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function url(t) { return SITE + 'template/' + slug(t) + '.html'; }
  function num(t) { return (String(t.name).match(/\d+/) || [''])[0]; }
  function ip(p) { return encodeURI(String(p)).replace(/'/g, '%27'); }
  function mains(list) { return (list || []).filter(function (t) { return !t.bonus; }); }
  function gifts(list, t) { return (list || []).filter(function (g) { return g.bonus && String(g.name).indexOf(t.name + ' ') === 0; }); }

  var KIND = {
    'إنفوغرافيك': ['قالب إنفوغرافيك PowerPoint جاهز يحوّل أرقامك ومعلوماتك إلى مخطط بصري واضح وجذاب. تعدّل النصوص والألوان والأرقام مباشرة داخل PowerPoint دون الحاجة إلى برامج تصميم إضافية.',
      'Ready PowerPoint infographic template that turns your numbers and information into a clear, attractive visual. Edit text, colors and figures directly in PowerPoint.'],
    'برزنتيشن كتاب': ['قالب عرض تقديمي بتصميم كتاب يناسب تلخيص الكتب والمحاضرات والتقارير الدراسية. تصميمه منظّم وسهل التعديل، وتستبدل محتواه بمحتواك خلال دقائق.',
      'A book-style presentation template suited to book summaries, lectures and study reports. Well organised and easy to edit; replace the content with yours in minutes.'],
    'برزنتيشن استعراض صور': ['قالب عرض تقديمي مخصص لاستعراض الصور والمعارض والألبومات بتصميم أنيق يُبرز الصورة. يناسب عروض المشاريع والرحلات والمنتجات.',
      'A presentation template built to showcase photos, galleries and albums with an elegant look that lets the picture lead. Great for projects, trips and products.'],
    'عرض جمالي': ['قالب عرض جمالي بتصميم عصري وألوان متناسقة يمنح عرضك مظهراً راقياً، ويصلح لعروض التعريف بالأفكار والمشاريع والأنشطة.',
      'A modern aesthetic template with harmonious colors that gives your presentation a polished look. Suitable for introducing ideas, projects and activities.'],
    'عرض متسلسل': ['قالب عرض متسلسل ينقل المشاهد من نقطة إلى أخرى بسلاسة، مناسب لشرح الخطوات والمراحل وتسلسل الأفكار.',
      'A sequential template that guides viewers smoothly from one point to the next, ideal for explaining steps, stages and a flow of ideas.'],
    'تايم لاين': ['قالب تايم لاين جاهز لعرض الأحداث والمراحل والخطط الزمنية بشكل مرتب وواضح، ويناسب عروض المشاريع والسيرة الذاتية والتاريخ.',
      'A ready timeline template for presenting events, stages and schedules clearly. Works for project plans, résumés and history.'],
    'عرض 3D': ['قالب عرض ثلاثي الأبعاد يضيف عمقاً وحركة لعرضك التقديمي ويجعله أكثر لفتاً للانتباه، ويعمل داخل PowerPoint مباشرة.',
      'A 3D-style template that adds depth and motion to your presentation and makes it stand out. Works directly inside PowerPoint.']
  };
  function kind(t) { return KIND[t.d] || ['قالب عرض تقديمي احترافي بتصميم عصري وقابل للتعديل بالكامل داخل PowerPoint.', 'A modern, fully editable professional PowerPoint presentation template.']; }

  function titleOf(t) { return 'قالب PowerPoint جاهز: ' + (t.d || 'عرض تقديمي') + ' (' + t.name + ') | Mr PowerPoint'; }
  function descOf(t) { return 'حمّل قالب PowerPoint جاهزاً مجاناً: ' + (t.d || 'عرض تقديمي') + ' رقم ' + num(t) + '. معاينة الشرائح، تقييمات وتعليقات الزوار، وقابل للتعديل بالكامل.'; }

  function relCard(t) {
    return '<a class="tp-rc" href="template/' + slug(t) + '.html"><span class="tp-rci"><img loading="lazy" decoding="async" src="' + esc(ip(t.img)) + '" alt="' + esc('قالب PowerPoint جاهز ' + (t.d || '') + ' رقم ' + num(t)) + '" /></span>' +
      '<b>' + esc(t.name) + '</b><span>' + esc(t.d || '') + '</span></a>';
  }

  function pageHtml(t, list) {
    var all = mains(list), u = url(t), ds = kind(t), g = gifts(list, t);
    var same = all.filter(function (x) { return x !== t && x.d === t.d; });
    var rel = same.slice(0, 4);
    if (rel.length < 4) all.forEach(function (x) { if (rel.length < 4 && x !== t && rel.indexOf(x) < 0) rel.push(x); });
    var thumbs = [t.img].concat(t.imgs || []).filter(function (p, i, a) { return a.indexOf(p) === i; });
    var alt = 'قالب PowerPoint جاهز ' + (t.d || '') + ' رقم ' + num(t);
    var image = SITE + ip(t.img);
    var ld = { '@context': 'https://schema.org', '@graph': [
      { '@type': 'CreativeWork', '@id': u + '#template', url: u, name: 'قالب PowerPoint: ' + (t.d || t.name) + ' (' + t.name + ')', description: descOf(t), inLanguage: 'ar',
        image: image, genre: t.d || 'PowerPoint template', isAccessibleForFree: true, isPartOf: { '@id': SITE + 'templates.html#page' }, publisher: { '@id': SITE + '#org' } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'القوالب', item: SITE + 'templates.html' },
        { '@type': 'ListItem', position: 3, name: t.name, item: u } ] }
    ] };
    var shareTx = 'حمّل هذا القالب من Mr PowerPoint: ' + t.name + '\n' + u;
    return B.head({ title: titleOf(t), desc: descOf(t), url: u, type: 'website', ld: ld, base: true, image: image }) + B.NAV +
      '    <main class="bl-main tp-main" data-name="' + esc(t.name) + '">\n' +
      '      <div class="bl-crumb" role="navigation" aria-label="مسار التنقل"><a href="index.html" data-en="Home">الرئيسية</a><span>/</span><a href="templates.html" data-en="Templates">القوالب</a><span>/</span><span>' + esc(t.name) + '</span></div>\n' +
      '      <article class="tp">\n' +
      '        <header class="bl-head"><span class="bl-tag" data-en="' + esc(t.e || '') + '">' + esc(t.d || 'قالب') + '</span><h1 data-en="Ready PowerPoint template: ' + esc(t.e || t.name) + ' (' + esc(t.name) + ')">قالب PowerPoint جاهز: ' + esc(t.d || t.name) + ' (' + esc(t.name) + ')</h1></header>\n' +
      '        <div class="tp-grid">\n' +
      '          <div class="tp-media"><figure class="tp-fig"><img id="tpMain" src="' + esc(ip(t.img)) + '" alt="' + esc(alt) + '" fetchpriority="high" decoding="async" /></figure>' +
      (thumbs.length > 1 ? '<div class="tp-thumbs" id="tpThumbs" role="list">' + thumbs.map(function (p, i) {
        return '<button type="button" class="tp-th' + (i ? '' : ' on') + '" data-src="' + esc(ip(p)) + '" aria-label="معاينة ' + (i + 1) + '"><img loading="lazy" decoding="async" src="' + esc(ip(p)) + '" alt="" /></button>';
      }).join('') + '</div>' : '') + '</div>\n' +
      '          <div class="tp-side">\n' +
      '            <p class="tp-desc" data-en="' + esc(t.pe || ds[1]) + '">' + esc(t.p || ds[0]) + '</p>\n' +
      '            <div class="tp-line"><div class="tp-rt" id="tpRt"></div><span class="tp-ct" id="tpCt"></span></div>\n' +
      '            <a class="btn-primary tp-dl" id="tpDl" href="' + esc(t.url) + '" target="_blank" rel="noopener" data-en="Download template">تحميل القالب مجاناً</a>\n' +
      '            <div class="tp-share"><a class="tp-sh" href="https://wa.me/?text=' + encodeURIComponent(shareTx) + '" target="_blank" rel="noopener" data-en="Share on WhatsApp">مشاركة عبر واتساب</a>' +
      '<button class="tp-sh" type="button" id="tpCopy" data-en="Copy link">نسخ الرابط</button></div>\n' +
      (g.length ? '            <div class="tp-gifts"><b data-en="Free gifts with this template">هدايا مع هذا القالب</b>' + g.map(function (x, i) {
        return '<a href="' + esc(x.url) + '" target="_blank" rel="noopener" class="tp-gift" data-name="' + esc(x.name) + '">' + esc(x.d || 'هدية') + ' ' + (i + 1) + '</a>';
      }).join('') + '</div>\n' : '') +
      '          </div>\n        </div>\n' +
      '        <section class="tp-text"><h2 data-en="About this template">عن هذا القالب</h2><p data-en="' + esc(t.pe || ds[1]) + '">' + esc(t.p || ds[0]) + '</p>' +
      '<h2 data-en="How to use it">كيف تستخدمه؟</h2><ol><li data-en="Press Download and open the file from Google Drive.">اضغط «تحميل القالب» وافتح الملف من Google Drive.</li>' +
      '<li data-en="Open it in PowerPoint and replace the text, colors and images with yours.">افتحه في PowerPoint، واستبدل النصوص والألوان والصور بمحتواك.</li>' +
      '<li data-en="Need a custom design? Message us on WhatsApp.">تحتاج تصميماً خاصاً بهويتك؟ راسلنا على واتساب.</li></ol></section>\n' +
      '        <section class="tp-cm" id="tpCm" aria-label="تعليقات"></section>\n' +
      '      </article>\n' +
      '      <section class="bl-more tp-more"><h2 data-en="Similar templates">قوالب مشابهة</h2><div class="tp-rg">' + rel.map(relCard).join('') + '</div></section>\n' +
      '      <aside class="bl-cta"><h2 data-en="Want a design made for you?">تريد تصميماً خاصاً بك؟</h2><p data-en="Tell us about your project and we will reply with a no-obligation quote.">أخبرنا عن مشروعك وسنرد عليك بعرض سعر بدون التزام.</p>' +
      '<div class="bl-cta-b"><a class="btn-primary" href="index.html#request" data-en="Request via form">اطلب عبر النموذج</a><a class="btn-outline" href="https://wa.me/' + B.WA + '" target="_blank" rel="noopener">WhatsApp</a></div></aside>\n' +
      '      <p class="bl-back"><a class="btn-outline" href="templates.html" data-en="All templates">كل القوالب</a></p>\n    </main>\n' +
      '    <script src="rating-config.js"></script>\n    <script src="rating.js"></script>\n    <script src="rate-prompt.js"></script>\n    <script src="tpl-page.js"></script>\n' + B.FOOT;
  }

  /* ───── sitemap: نحذف روابط /template/ القديمة ونضيف الحالية (ونحافظ على lastmod الموجود لما لم يتغيّر) ───── */
  function sitemap(xml, list, today) {
    xml = String(xml || '');
    var old = {};
    xml.replace(/<url>\s*<loc>([^<]*\/template\/[^<]*)<\/loc>\s*<lastmod>([^<]*)<\/lastmod>/g, function (m, l, d) { old[l] = d; return m; });
    xml = xml.replace(/\s*<url>\s*<loc>[^<]*\/template\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');
    var add = '';
    mains(list).forEach(function (t) {
      var u = url(t);
      add += '\n  <url>\n    <loc>' + u + '</loc>\n    <lastmod>' + (old[u] || today) + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>';
    });
    return xml.replace('</urlset>', add + '\n</urlset>');
  }

  var api = { slug: slug, url: url, pageHtml: pageHtml, sitemap: sitemap, mains: mains, kind: kind };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TemplateGen = api;
})(typeof window !== 'undefined' ? window : this);
