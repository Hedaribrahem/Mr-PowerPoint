(function () {
  var C = window.RATING_CFG || {}, ok = !!(C.projectId && C.apiKey), store = {}, mine = {}, els = [];
  try { mine = JSON.parse(localStorage.getItem('mr_ratings') || '{}'); } catch (e) {}
  var EN = function () { return document.documentElement.lang === 'en'; };
  var DOC = ok ? 'projects/' + C.projectId + '/databases/(default)/documents' : '';
  var base = ok ? 'https://firestore.googleapis.com/v1/' + DOC : '';
  var sk = function (k) { return String(k).replace(/[^\w-]+/g, '-'); };
  if (!ok) Object.keys(mine).forEach(function (k) { store[k] = { sum: mine[k], count: 1 }; });

  function paint(el) {
    var k = el.getAttribute('data-rk'); if (!k) return;
    var s = store[k] || { sum: 0, count: 0 }, n = s.count, a = n ? s.sum / n : 0, m = mine[k] || 0;
    var ss = el.querySelectorAll('.rt-s');
    for (var i = 0; i < 5; i++) ss[i].style.setProperty('--f', Math.round(Math.max(0, Math.min(1, a - i)) * 100) + '%');
    var t = el.querySelector('.rt-t');
    if (el.classList.contains('rt-ro')) t.textContent = n ? a.toFixed(1) + ' (' + n + ')' : '';
    else t.textContent = n
      ? a.toFixed(1) + ' · ' + n + (EN() ? ' ratings' : ' تقييم') + (m ? (EN() ? ' · yours: ' : ' · تقييمك: ') + m : '')
      : (EN() ? 'Be the first to rate' : 'كن أول من يقيّم');
  }
  function paintAll() { els.forEach(paint); }

  function mount(el, key, ro) {
    if (!el) return;
    el.setAttribute('data-rk', sk(key));
    if (!el.getAttribute('data-m')) {
      el.setAttribute('data-m', '1'); el.classList.add('rt'); if (ro) el.classList.add('rt-ro');
      el.innerHTML = '<span class="rt-stars">' + [1, 2, 3, 4, 5].map(function (i) {
        return '<button type="button" class="rt-s" data-v="' + i + '" aria-label="' + i + '/5">★</button>';
      }).join('') + '</span><span class="rt-t"></span>';
      if (!ro) {
        el.addEventListener('click', function (e) {
          var b = e.target.closest('.rt-s'); if (b) vote(el.getAttribute('data-rk'), +b.getAttribute('data-v'));
        });
        el.addEventListener('mouseover', function (e) {
          var b = e.target.closest('.rt-s'); if (!b) return;
          [].forEach.call(el.querySelectorAll('.rt-s'), function (x) { x.classList.toggle('hov', +x.getAttribute('data-v') <= +b.getAttribute('data-v')); });
        });
        el.addEventListener('mouseleave', function () {
          [].forEach.call(el.querySelectorAll('.rt-s'), function (x) { x.classList.remove('hov'); });
        });
      }
      els.push(el);
    }
    paint(el);
  }

  function vote(k, v) {
    var old = mine[k] || 0; mine[k] = v;
    try { localStorage.setItem('mr_ratings', JSON.stringify(mine)); } catch (e) {}
    var s = store[k] || (store[k] = { sum: 0, count: 0 });
    if (old) s.sum += v - old; else { s.sum += v; s.count++; }
    paintAll();
    if (!ok) return;
    fetch(base + ':commit?key=' + C.apiKey, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes: [{ transform: { document: DOC + '/ratings/' + k, fieldTransforms: [
        { fieldPath: 'sum', increment: { integerValue: String(old ? v - old : v) } },
        { fieldPath: 'count', increment: { integerValue: old ? '0' : '1' } }
      ] } }] })
    }).catch(function () {});
  }

  if (ok) fetch(base + '/ratings?pageSize=300&key=' + C.apiKey).then(function (r) { return r.json(); }).then(function (j) {
    (j.documents || []).forEach(function (d) {
      var f = d.fields || {};
      store[d.name.split('/').pop()] = { sum: +((f.sum && f.sum.integerValue) || 0), count: +((f.count && f.count.integerValue) || 0) };
    });
    paintAll();
  }).catch(function () {});

  new MutationObserver(paintAll).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.MrRating = { mount: mount };
})();
