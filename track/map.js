// خريطة مجانية بالكامل من غير أي مفتاح:
// 1) Esri بيظهر فورًا (صور جاهزة)
// 2) بعدها OpenFreeMap (مجاني ومسموح تجاريًا) بأسماء الشوارع بالعربي بيتركّب فوقه ويشيله
// لو موبايل العميل مش بيدعم WebGL أو السيرفر ماردّش، Esri بيفضل شغال.
(function () {
  var ML_JS = 'https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js';
  var ML_CSS = 'https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.css';
  var BR_JS = 'https://unpkg.com/@maplibre/maplibre-gl-leaflet@0.1.4/leaflet-maplibre-gl.js';
  var loading = null;

  function load(src, css) {
    return new Promise(function (ok, bad) {
      var e = document.createElement(css ? 'link' : 'script');
      if (css) { e.rel = 'stylesheet'; e.href = src; } else { e.src = src; }
      e.onload = ok; e.onerror = bad; document.head.appendChild(e);
    });
  }
  function libs() {
    if (!loading) {
      loading = (window.maplibregl ? Promise.resolve() : Promise.all([load(ML_JS), load(ML_CSS, true)]))
        .then(function () { return L.maplibreGL ? null : load(BR_JS); });
    }
    return loading;
  }
  function webgl() {
    try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
    catch (e) { return false; }
  }
  // أسماء الأماكن بالعربي لو موجودة، وإلا الاسم الأصلي
  function arabic(gl) {
    var st = gl.getStyle(); if (!st || !st.layers) return;
    st.layers.forEach(function (ly) {
      if (ly.type !== 'symbol' || !ly.layout || !ly.layout['text-field']) return;
      if (JSON.stringify(ly.layout['text-field']).indexOf('name') < 0) return;
      try { gl.setLayoutProperty(ly.id, 'text-field', ['coalesce', ['get', 'name:ar'], ['get', 'name']]); } catch (e) {}
    });
  }

  window.dxBaseMap = function (m, dark) {
    var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: '© Esri' }).addTo(m);
    if (!webgl()) return;
    libs().then(function () {
      if (!m._container || !L.maplibreGL) return;
      var lay = L.maplibreGL({
        style: 'https://tiles.openfreemap.org/styles/' + (dark ? 'dark' : 'liberty'),
        attribution: '© OpenFreeMap © OpenStreetMap'
      });
      lay.addTo(m);
      var gl = lay.getMaplibreMap();
      gl.once('load', function () { arabic(gl); m.removeLayer(esri); });
    }).catch(function () { /* Esri فاضل شغال */ });
  };
})();
