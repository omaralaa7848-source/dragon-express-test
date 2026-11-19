// 🧪 نسخة تجريبية فقط — متوصّلة بمشروع dragon-TEST-tracking (بيانات وهمية).
//    ممنوع تتغيّر لمشروع asema الحي.
window.TEST_CFG = {
  url: 'https://ykinvgglwxgwvjiuyzvp.supabase.co',
  key: 'sb_publishable_AaGqeslHcfUL0quj2yl8yw_8CLXONcW'
};
window.rpc = async function (fn, args) {
  const r = await fetch(TEST_CFG.url + '/rest/v1/rpc/' + fn, {
    method: 'POST',
    headers: { apikey: TEST_CFG.key, 'Content-Type': 'application/json' },
    body: JSON.stringify(args || {})
  });
  const t = await r.text(); let j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
  if (!r.ok) throw new Error((j && j.message) || 'حصل خطأ، جرّب تاني');
  return j;
};
