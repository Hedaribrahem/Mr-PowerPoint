/* صفحة رابط تقييم العميل (review.html?n=اسم_العميل): نجوم + اسم + رأي، يُحفظ بحالة pending في comments بمفتاح r_site
   ويظهر في قسم "آراء زوار الموقع" بعد موافقتك من لوحة التحكم ← التعليقات. يعتمد على rating.js (window.MrFS). */
(function () {
  var f = document.getElementById('rvForm'), FS = window.MrFS; if (!f) return;
  var EN = function () { return document.documentElement.lang === 'en'; };
  var S = {
    ar: { eName: 'اكتب اسماً (حرفان على الأقل).', eRate: 'اختر عدد النجوم.', eText: 'اكتب رأياً من 10 أحرف على الأقل.', wait: 'انتظر لحظة ثم أعد المحاولة.', limit: 'وصلت إلى الحد اليومي، جرّب غداً.', fail: 'تعذّر الإرسال الآن، حاول لاحقاً.' },
    en: { eName: 'Enter a name (2+ characters).', eRate: 'Choose a star rating.', eText: 'Write at least 10 characters.', wait: 'Please wait a moment and try again.', limit: "You've reached the daily limit, try again tomorrow.", fail: "Couldn't send right now, try again later." }
  };
  var L = function () { return EN() ? S.en : S.ar; };
  var lsG = function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  var lsS = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var msg = document.getElementById('rvMsg'), pick = document.getElementById('rvPick'), grade = 0, t0 = Date.now();
  var say = function (t, c) { msg.textContent = t; msg.className = 'cm-msg' + (c ? ' ' + c : ''); };

  /* الاسم من الرابط ?n= أو من آخر اسم كتبه الزائر */
  var m = /[?&]n=([^&]*)/.exec(location.search), nm = '';
  try { nm = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; } catch (e) {}
  f.elements.n.value = (nm || lsG('mr_cm_name', '')).slice(0, 40);

  pick.addEventListener('click', function (e) {
    var b = e.target.closest('.rv-st'); if (!b) return;
    grade = +b.getAttribute('data-v');
    [].forEach.call(pick.children, function (x, j) { x.classList.toggle('on', j < grade); x.setAttribute('aria-checked', j === grade - 1 ? 'true' : 'false'); });
    if (window.MrRating && MrRating.warm) MrRating.warm();
  });
  f.addEventListener('focusin', function () { if (window.MrRating && MrRating.warm) MrRating.warm(); }, { once: true });

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var s = L(), btn = f.querySelector('.cm-send');
    var name = f.elements.n.value.replace(/\s+/g, ' ').trim();
    var text = f.elements.d.value.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    if (f.elements.website.value) { done(); return; } /* فخ الروبوتات */
    if (name.length < 2) return say(s.eName, 'err');
    if (!grade) return say(s.eRate, 'err');
    if (text.length < 10) return say(s.eText, 'err');
    if (Date.now() - t0 < 3000) return say(s.wait, 'err');
    if (!FS || !FS.ok) return say(s.fail, 'err');
    var now = Date.now(), ts = lsG('mr_rvp_t', []).filter(function (t) { return now - t < 864e5; });
    if (ts.length >= 3) return say(s.limit, 'err');
    var id = 'c' + now.toString(36) + Math.random().toString(36).slice(2, 10);
    btn.disabled = true; say('…');
    FS.commit([{
      update: { name: FS.doc + '/comments/' + id, fields: {
        k: { stringValue: 'r_site' }, n: { stringValue: name }, t: { stringValue: text },
        g: { integerValue: String(grade) }, s: { stringValue: 'pending' } } },
      updateTransforms: [{ fieldPath: 'c', setToServerValue: 'REQUEST_TIME' }],
      currentDocument: { exists: false }
    }]).then(function (r) {
      if (!r.ok) throw 0;
      try { localStorage.removeItem('mr_rv_cache'); } catch (x) {}
      ts.push(now); lsS('mr_rvp_t', ts); lsS('mr_cm_name', name);
      if (window.mrTrack) window.mrTrack('generate_lead', { method: 'client_review' });
      FS.notify('review');
      done();
    }).catch(function () { btn.disabled = false; say(s.fail, 'err'); });
  });
  function done() { f.hidden = true; document.querySelector('.rvp-sub').hidden = true; document.getElementById('rvDone').hidden = false; scrollTo(0, 0); }

  /* اللغة */
  var els = [].slice.call(document.querySelectorAll('.rvp [data-en]'));
  els.forEach(function (e) { e._ar = e.textContent; });
  function lang() { els.forEach(function (e) { var v = EN() ? e.getAttribute('data-en') : e._ar; if (v) e.textContent = v; }); }
  lang(); new MutationObserver(lang).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
