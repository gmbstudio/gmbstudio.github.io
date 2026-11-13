// Telemetría propia gmb-events (regla 12 del estudio): anónima, con ID de instalación aleatorio.
// Sin opción de desactivarla: es un prototipo web, no una app de tienda (decisión del admin, 2026-11-13).
// Lotes al receptor de config/telemetry.json; se envía al llegar a 10 eventos y al pasar a segundo plano.
// paint-out entra SIN token desde gmbstudio.cc y Dash (CORS del Worker, store-monitor f6b2e09); props como strings, ≤500 car.
(function (root) {
  const URL_E = 'https://eventos.gmbstudio.cc/e';
  const VERSION = '0.60+60';
  const KEY = 'po-install';
  const store = (() => { try { return localStorage; } catch { return null; } })();
  let install = store?.getItem(KEY);
  if (!install) { install = crypto.randomUUID?.() || String(Math.random()).slice(2); store?.setItem(KEY, install); }
  const host = location.hostname;
  const env = host === 'gmbstudio.cc' || host === 'www.gmbstudio.cc' ? 'prod' : 'dev';
  const ua = navigator.userAgent;
  const os = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Macintosh/.test(ua) ? 'Mac' : undefined;
  const region = (navigator.language.split('-')[1] || '').toUpperCase() || undefined;
  let q = [];

  function flush() {
    if (!q.length) return;
    const body = JSON.stringify({ app: 'paint-out', install, platform: 'Web', version: VERSION, region, env, os, events: q });
    q = [];
    fetch(URL_E, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body }).catch(() => {});
  }
  function track(name, props = {}) {
    q.push({ name, ts: Date.now(), props: Object.fromEntries(Object.entries(props).map(([k, v]) => [k, String(v)])) });
    if (root.PO_DEBUG) console.log('[tel]', name, props);
    if (q.length >= 10) flush();
  }
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { track('app_background'); flush(); } });
  addEventListener('error', (e) => track('error', { kind: 'js', code: 'uncaught', detail: String(e.message).slice(0, 120) }));

  root.Tel = {
    track, flush,
    once(k) { if (store?.getItem('po-' + k)) return false; store?.setItem('po-' + k, '1'); return true; },
  };
  // src: de qué vídeo o sitio llega (enlaces con ?v=yt1…yt7, ?v=reddit…); se guarda para toda la visita
  const src = (new URLSearchParams(location.search).get('v') || '').slice(0, 24);
  track('app_open', { ref: document.referrer ? new URL(document.referrer).hostname : 'directo', ...(src ? { src } : {}) });
})(this);
