// 🧪 نسخة تجريبية — أدوات مشتركة لمحاكاة المندوب والأدمن (متوصّلة بمشروع dragon-TEST-tracking بس)
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => Number(n || 0).toLocaleString('ar-EG');
// نفس kStatusStyles في theme.dart
const ST = {
  warehouse: ['في المخزن', '#9AB0C6', '🏢'], assigned: ['بانتظار استلام المندوب', '#4A9BEA', '📨'],
  with_courier: ['مع المندوب', '#4A9BEA', '🛵'], with_carrier: ['مع شركة شحن', '#7C6BF0', '🚚'],
  delivered: ['تم التسليم', '#5EE6A8', '✅'], partial: ['تسليم جزئي', '#A879F7', '➗'],
  postponed: ['مؤجل', '#F2C14E', '⏸️'], return_pending: ['مرتجع — بانتظار المراجعة', '#F2C14E', '⏳'],
  returned: ['مرتجع', '#F0555F', '↩️'], lost: ['مفقود — تحقيق', '#FF8A91', '⚠️'], settled: ['تم التسليم ومورّد', '#5EE6A8', '🔒']
};
function pill(s, big) { const x = ST[s] || [s, '#8FA6C0', '•']; return '<span class="pill" style="color:' + x[1] + ';background:' + x[1] + '22;border:1px solid ' + x[1] + '5A' + (big ? ';font-size:12px' : '') + '">' + x[2] + ' ' + x[0] + '</span>'; }
function tag(t, c, cls) { return '<span class="tag ' + (cls || '') + '"' + (c ? ' style="color:' + c + ';border-color:' + c + '55"' : '') + '>' + t + '</span>'; }
function toast(t, bad) { const e = $('toast'); e.textContent = t; e.className = 'toast on' + (bad ? ' bad' : ''); clearTimeout(e._t); e._t = setTimeout(() => e.className = 'toast', 2600); }
function openSheet(html) { $('shBody').innerHTML = html; document.body.classList.add('open'); }
function closeSheet() { document.body.classList.remove('open'); }
// مزامنة الشاشات التلاتة جوه صفحة المحاكاة
function sync() { try { if (parent !== window) parent.postMessage('dx-sync', '*'); } catch (_) { } }
let BUSY = false;
async function act(fn, args, okMsg) {
  if (BUSY) return false; BUSY = true;
  try { await rpc(fn, args); if (okMsg) toast(okMsg); sync(); BUSY = false; await load(); return true; }
  catch (e) { toast(e.message, true); return false; } finally { BUSY = false; }
}
function trackLink(o) { return location.href.replace(/[^/]*$/, '') + 'index.html?k=' + o.token; }
function waMsg(o) {
  return '👋 أهلاً أ/ ' + o.customer.split(' ')[0] + '\n📦 شحنتك من ' + o.company + ' خرجت مع المندوب ' + (o.courier || '') +
    '\n💰 المبلغ: ' + fmt(o.cod) + ' ج\n\n👇 حدّد مكان التسليم وأكّد الاستلام من هنا:\n' + trackLink(o) + '\n\n🐉 Dragon Express [تجريبي]';
}
function copyWa(o) { const m = waMsg(o); navigator.clipboard.writeText(m).then(() => toast('رسالة الواتساب اتنسخت'), () => prompt('انسخ الرسالة:', m)); }
function slotTxt(o) {
  if (!o.slot_day) return '';
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' });
  const k = Math.round((new Date(o.slot_day) - new Date(today)) / 864e5);
  const d = ['النهاردة', 'بكرة', 'بعد بكرة'][k] || o.slot_day;
  const h = x => { x = +x; return (x % 12 || 12) + (x < 12 ? 'ص' : 'م'); };
  return d + ' ' + h(o.slot_from) + '–' + h(o.slot_to);
}
// كارت «من صفحة العميل» — نفس الكارت عند المندوب والأدمن
function custCard(o, who) {
  let h = '<div class="card tight newfeat" style="margin-top:14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:13px">📲 من صفحة متابعة العميل</b>' +
    (o.confirmed ? tag('✓ أكّد الاستلام', '#5EE6A8') : o.link_sent ? tag('لسه ماأكّدش', '#F2C14E') : tag('اللينك لسه مااتبعتش', '#8FA6C0')) + '</div>';
  if (!o.link_sent && who === 'courier' && ['with_courier', 'postponed'].includes(o.status))
    h += '<p class="small mut" style="margin:8px 0">العميل لسه ماوصلوش لينك يحدّد فيه مكانه ويأكّد. ابعتهوله قبل ما تتحرك.</p><button class="big" style="min-height:44px;background:#25D366;color:#06210f" data-a="send" data-c="' + o.code + '">💬 ابعتله لينك المتابعة على الواتساب</button>';
  if (o.cancel === 'pending')
    h += '<div style="margin-top:9px;padding:9px 10px;border-radius:10px;background:rgba(240,85,95,.12);border:1px solid rgba(240,85,95,.45);color:#ffb3b8;font-size:12px;font-weight:800">🛑 العميل طالب يلغي: «' + esc(o.cancel_reason) + '»<br><span style="font-weight:600">' + (who === 'courier' ? 'ماتسلّمش ولا تتحرك لها لحد ما الإدارة تقرّر.' : 'محتاج قرارك — كلّمه الأول.') + '</span></div>';
  if (o.cancel === 'continued') h += '<div class="small" style="margin-top:8px;color:var(--ok);font-weight:800">✓ الإدارة كلّمت العميل وهنكمّل التوصيل</div>';
  if (o.cancel === 'cancelled') h += '<div class="small" style="margin-top:8px;color:var(--bad);font-weight:800">✕ اتلغت بطلب العميل — بترجع للتاجر</div>';
  if (o.loc) {
    h += '<div class="hline"></div><div class="lbl">📍 المكان اللي حدّده على الخريطة</div><div style="font-weight:700;margin-top:3px;line-height:1.6">' + esc(o.loc) + '</div>' +
      '<div class="minimap" data-lat="' + o.lat + '" data-lng="' + o.lng + '"></div>' +
      '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><a class="btn acc" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + o.lat + ',' + o.lng + '">🧭 وديني هناك</a><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps?q=' + o.lat + ',' + o.lng + '">افتح في الخرايط</a></div>';
  }
  if (o.slot_day) h += '<div class="hline"></div><div style="display:flex;justify-content:space-between;gap:8px"><span class="lbl">⏰ الميعاد اللي يناسبه</span><b style="color:var(--warn)">' + slotTxt(o) + '</b></div>' + (o.slot_reopen ? '<div class="small mut">الشحنة رجعت المخزن، فالميعاد اتفتح له يختار من جديد</div>' : '');
  if (o.note) h += '<div class="hline"></div><div class="lbl">📝 تعليماته للمندوب</div><div style="margin-top:3px;font-weight:700;color:var(--acc2)">«' + esc(o.note) + '»</div>';
  if (o.phone2) h += '<div class="hline"></div><div style="display:flex;align-items:center;gap:8px"><div style="flex:1"><div class="lbl">📞 رقم تاني' + (o.phone2_name ? ' — ' + esc(o.phone2_name) : '') + '</div><b class="mono">' + esc(o.phone2) + '</b></div><a class="round wa" href="https://wa.me/2' + esc(o.phone2) + '" target="_blank" rel="noopener">💬</a><a class="round" href="tel:' + esc(o.phone2) + '">📞</a></div>';
  if (o.rating || o.feedback) h += '<div class="hline"></div><div class="lbl">⭐ تقييمه بعد الاستلام</div><div style="color:var(--warn);font-size:16px">' + '★'.repeat(o.rating || 0) + '<span style="color:var(--line2)">' + '★'.repeat(5 - (o.rating || 0)) + '</span></div>' + (o.feedback ? '<div class="small">«' + esc(o.feedback) + '»</div>' : '');
  if (o.link_sent && !o.loc && !o.slot_day && !o.note && !o.phone2 && o.cancel !== 'pending') h += '<p class="small mut" style="margin:8px 0 0">اللينك اتبعت، والعميل لسه مابعتش أي بيانات.</p>';
  return h + '</div>';
}
function initMaps(root) {
  if (!window.L) return;
  (root || document).querySelectorAll('.minimap[data-lat]').forEach(el => {
    if (el._m) return; const ll = [+el.dataset.lat, +el.dataset.lng];
    const m = L.map(el, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, keyboard: false }).setView(ll, 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m); L.marker(ll).addTo(m); el._m = m;
    setTimeout(() => m.invalidateSize(), 250);
  });
}
addEventListener('message', e => { if (e.data === 'dx-reload' && !document.body.classList.contains('open') && !BUSY) load(); });
