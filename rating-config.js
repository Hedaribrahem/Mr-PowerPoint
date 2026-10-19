window.RATING_CFG = {
  projectId: 'mr-powerpoint',
  apiKey: 'AIzaSyCu2KeY3_gBc4EMhntkAGwm4w67App1x1I',
  appId: '1:591022544323:web:f843147991f754c8c29976',
  recaptchaSiteKey: '6Lf7NvUtAAAAAPcO-HMLbG6nTIZVEU2CgNoJr8iP',
  recaptchaType: 'enterprise'
};

/* Google Analytics (GA4): يُحمَّل في كل صفحة تستدعي هذا الملف، ولا يُحتسب العمل المحلي (localhost) */
(function () {
  var id = 'G-NJBJ1N70M4', h = location.hostname;
  if (!/^[\w-]+(\.[\w-]+)+$/.test(h) || /^\d+\.\d+\.\d+\.\d+$/.test(h)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id);
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.appendChild(s);
})();

/* تتبّع النقرات في Analytics: واتساب، خمسات، يوتيوب، التواصل الاجتماعي، وتحميل القوالب.
   window.mrTrack(اسم_الحدث, معاملات) آمنة دائماً؛ على localhost تطبع في الـ Console فقط للتجربة. */
(function () {
  var local = !/^[\w-]+(\.[\w-]+)+$/.test(location.hostname) || /^\d+\.\d+\.\d+\.\d+$/.test(location.hostname);
  window.mrTrack = function (name, params) {
    try {
      if (local) { if (window.console) console.log('[track]', name, params || {}); return; }
      if (window.gtag) window.gtag('event', name, params || {});
    } catch (e) {}
  };
  function where(a) {
    if (a.closest('.whatsapp-float')) return 'floating_button';
    if (a.closest('#navbar')) return 'navbar';
    if (a.closest('#mobileMenu')) return 'mobile_menu';
    if (a.closest('footer')) return 'footer';
    var s = a.closest('section[id]');
    return s ? s.id : 'other';
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '', loc = where(a), m;
    if (/^https?:\/\/wa\.me\//i.test(h)) window.mrTrack('contact_click', { method: 'whatsapp', link_location: loc });
    else if (/^https?:\/\/(www\.)?khamsat\.com\//i.test(h)) window.mrTrack('contact_click', { method: 'khamsat', link_location: loc });
    else if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(h)) window.mrTrack('video_click', { link_location: loc, link_url: h.slice(0, 100) });
    else if ((m = h.match(/^https?:\/\/(www\.)?(facebook|instagram)\.com\//i))) window.mrTrack('social_click', { network: m[2].toLowerCase(), link_location: loc });
  }, true);
})();
