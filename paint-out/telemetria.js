// Telemetría propia gmb-events (regla 12 del estudio): anónima, con ID de instalación aleatorio y opt-out.
// Lotes al receptor de config/telemetry.json; se envía al llegar a 10 eventos y al pasar a segundo plano.
// ponytail: formato del cuerpo y cabecera del token pendientes de store-monitor (petición del 2026-11-13); sin token no se envía nada.
(function (root) {
  const CFG = { url: 'https://eventos.gmbstudio.cc/e', token: null, header: 'Authorization' };
  const VERSION = '0.52+52';
  const KEY = 'po-install', OFF = 'po-tel-off';
  const store = (() => { try { return localStorage; } catch { return null; } })();
  let install = store?.getItem(KEY);
  if (!install) { install = crypto.randomUUID?.() || String(Math.random()).slice(2); store?.setItem(KEY, install); }
  const host = location.hostname;
  const env = host === 'gmbstudio.cc' || host === 'www.gmbstudio.cc' ? 'prod' : 'dev';
  const ua = navigator.userAgent;
  const os = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Macintosh/.test(ua) ? 'Mac' : undefined;
  const region = (navigator.language.split('-')[1] || '').toUpperCase() || undefined;
  let q = [];

  const enabled = () => store?.getItem(OFF) !== '1';
  function flush() {
    if (!q.length || !CFG.token || !enabled()) { if (!enabled()) q = []; return; }
    const body = JSON.stringify({ app: 'paint-out', install, platform: 'Web', version: VERSION, region, env, os, events: q });
    q = [];
    fetch(CFG.url, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', [CFG.header]: CFG.token }, body }).catch(() => {});
  }
  function track(name, props = {}) {
    if (!enabled()) return;
    q.push({ name, ts: Date.now(), props });
    if (root.PO_DEBUG) console.log('[tel]', name, props);
    if (q.length >= 10) flush();
  }
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { track('app_background'); flush(); } });
  addEventListener('error', (e) => track('error', { kind: 'js', code: 'uncaught', detail: String(e.message).slice(0, 120) }));

  root.Tel = {
    track, flush, enabled,
    setEnabled(on) { on ? store?.removeItem(OFF) : store?.setItem(OFF, '1'); if (!on) q = []; },
    once(k) { if (store?.getItem('po-' + k)) return false; store?.setItem('po-' + k, '1'); return true; },
  };
  track('app_open', { ref: document.referrer ? new URL(document.referrer).hostname : 'directo' });
})(this);
