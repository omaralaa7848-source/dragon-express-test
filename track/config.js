// صفحة متابعة الشحنة للعميل — الاتصال بـSupabase (مفاتيح publishable بس، آمنة).
// النسخة التجريبية بتتعرف من المسار (/dragon-express-test/) فتتوصّل بالمشروع التجريبي.
(function () {
  var staging = location.pathname.indexOf('/dragon-express-test/') === 0;
  window.TRK_STAGING = staging;
  window.TEST_CFG = staging
    ? { url: 'https://ykinvgglwxgwvjiuyzvp.supabase.co', key: 'sb_publishable_AaGqeslHcfUL0quj2yl8yw_8CLXONcW' }
    : { url: 'https://xnlcdzygwxubnuedwupo.supabase.co', key: 'sb_publishable_YJmGDB-_NQjrmHTgCPlr6Q_Oto5AD4w' };
})();
window.rpc = async function (fn, args) {
  var r = await fetch(TEST_CFG.url + '/rest/v1/rpc/' + fn, {
    method: 'POST',
    headers: { apikey: TEST_CFG.key, 'Content-Type': 'application/json' },
    body: JSON.stringify(args || {})
  });
  var t = await r.text(), j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
  if (!r.ok) throw new Error((j && j.message) || 'حصل خطأ، جرّب تاني');
  return j;
};
