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
