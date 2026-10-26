/* Cloudflare Worker: يستقبل إشعاراً من موقعك ويرسله إلى Telegram.
   المتغيرات المطلوبة (Settings ← Variables and Secrets):
     BOT_TOKEN       (Secret)  مفتاح البوت من @BotFather
     CHAT_ID         (Secret)  رقم محادثتك مع البوت
     ALLOWED_ORIGINS (Text)    https://hedaribrahem.github.io
   لا يُرسل أي اسم أو بريد أو نص من الزائر، فقط نوع الحدث (والخدمة المطلوبة عند الطلبات). */
const TITLES = {
  request: '📩 طلب خدمة جديد',
  review: '⭐ رأي جديد بانتظار موافقتك',
  comment: '💬 تعليق جديد بانتظار موافقتك',
  subscriber: '✉️ مشترك جديد في القائمة البريدية',
  rating: '⭐ تقييم جديد'
};
const SERVICES = {
  s1: 'تصميم عرض تقديمي احترافي', s2: 'تحويل عرض عادي إلى احترافي', s3: 'قالب PowerPoint حسب الهوية',
  s4: 'عرض للمستثمرين أو الشركات', s5: 'تحويل بيانات إلى إنفوغرافيك', s6: 'توحيد هوية العروض', other: 'خدمة أخرى'
};
let last = 0;

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const ok = allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': ok ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST' || !ok) return new Response('forbidden', { status: 403, headers: cors });

    let d;
    try { d = JSON.parse(await req.text()); } catch (e) { return new Response('bad request', { status: 400, headers: cors }); }
    if (!d || !TITLES[d.type]) return new Response('bad request', { status: 400, headers: cors });

    const now = Date.now();
    if (now - last < 2000) return new Response('slow down', { status: 429, headers: cors }); // حد بسيط ضد الإغراق
    last = now;

    let text = TITLES[d.type];
    if (d.type === 'request' && SERVICES[d.v]) text += '\nالخدمة: ' + SERVICES[d.v];
    if (d.type === 'rating') {
      var m = /^([tl])_([\w-]{1,60})\|([1-5])$/.exec(String(d.v || ''));
      if (!m) return new Response('bad request', { status: 400, headers: cors });
      text += '\n' + (m[1] === 't' ? 'القالب: ' : 'الدرس: ') + m[2].replace(/-/g, ' ') + '\nالتقييم: ' + '★'.repeat(+m[3]) + '☆'.repeat(5 - m[3]) + ' (' + m[3] + '/5)';
    }
    text += '\n\nافتح لوحة التحكم لرؤية التفاصيل.';

    const r = await fetch('https://api.telegram.org/bot' + env.BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text })
    });
    return new Response(r.ok ? 'ok' : 'telegram error', { status: r.ok ? 200 : 502, headers: cors });
  }
};
