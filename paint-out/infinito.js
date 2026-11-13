// Modo infinito (prototipo): UNA pila de capas que no se acaba. Se juega la de arriba y se ven las dos siguientes
// (máximo tres en el visor). Al vaciar la de arriba se baja y aparece una capa nueva al fondo, conectada por portales
// con la que tiene encima. Cada capa nueva se valida con el solucionador junto con las de encima, desde el estado actual.
// ponytail: generador por prueba y error con el solucionador; el definitivo es el «hacia atrás» de la fase 4 (en Swift).
(function (root) {
  const R = root.Reglas || require('./reglas.js');
  const W = 6, H = 9, COLORS = ['red', 'blue', 'yellow', 'green'], EDGES = ['up', 'down', 'left', 'right'];
  const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
  const vert = (d) => d === 'up' || d === 'down';
  const MAX_STATES = 3000;

  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const pick = (r, xs) => xs[Math.floor(r() * xs.length)];
  const shuffle = (r, xs) => xs.map((x) => [r(), x]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  const overlaps = (doors, d) => doors.some((e) => e.edge === d.edge && d.from < e.from + e.len && e.from < d.from + d.len);
  function laneCells(l) { const s = new Set(); for (const n of l.lanes) for (let d = 0; d < n.len; d++) s.add(R.laneCell(n, d, l.w, l.h).join(',')); return s; }

  // Capa auxiliar debajo de la última: recibe lo que cae por sus portales y lo deja salir (para validar sin conocer el futuro).
  const stub = (b) => ({ w: W, h: H, arrows: [], nextLanes: [], lanes: b.nextLanes.map(({ edge, index, len }) => ({ edge, index, len })),
    doors: b.nextLanes.map((n) => ({ edge: OPP[n.edge], from: n.index, len: 1, colors: ['white'] })) });
  const withStub = (ls) => ({ id: 0, name: '∞', moves: 0, layers: [...ls, stub(ls[ls.length - 1])] });

  // ¿Se puede vaciar todo desde el principio de la capa de arriba? (con tope de estados para no colgar el navegador)
  function solvable(lv, incoming) {
    const b = R.makeBoard(lv, 0, incoming);
    const S = R.Solver(lv, { maxStates: MAX_STATES }); // capas que piden demasiado cálculo se descartan (el juego no se atasca)
    try { return S.minMoves(b) != null; } catch { return false; }
  }

  // `only`: si se da, la flecha tiene que ir a esa puerta (para que ningún portal se quede sin nada que enviar)
  function addArrow(l, r, cols, check, only) {
    const lc = laneCells(l), used = new Set();
    l.arrows.forEach((a) => R.cells(a).forEach(([x, y]) => used.add(x + ',' + y)));
    for (let t = 0; t < (only ? 60 : 30); t++) {
      let x = Math.floor(r() * W), y = Math.floor(r() * H), dir = pick(r, EDGES);
      if (only) { dir = only.edge; const k = only.from + Math.floor(r() * only.len); if (vert(dir)) x = k; else y = k; }
      const idx = vert(dir) ? x : y;
      const door = l.doors.find((d) => d.edge === dir && idx >= d.from && idx < d.from + d.len);
      if (!door || door.colors.length > 1 || (only && door !== only)) continue;
      const color = door.colors[0] === 'white' ? pick(r, cols) : door.colors[0];
      const a = { x, y, dir, len: 1 + Math.floor(r() * 3), color };
      if (R.cells(a).some(([cx, cy]) => cx < 0 || cy < 0 || cx >= W || cy >= H || used.has(cx + ',' + cy) || lc.has(cx + ',' + cy))) continue;
      l.arrows.push(a);
      if (check()) return true;
      l.arrows.pop();
    }
    return false;
  }

  // Juega al azar (sin meterse en callejones) hasta vaciar la última capa de `lv` antes del auxiliar; devuelve lo que mandó abajo.
  function playthrough(lv, incoming, r) {
    const S = R.Solver(lv, { maxStates: MAX_STATES * 4 }), last = lv.layers.length - 2;
    let b = R.makeBoard(lv, 0, incoming);
    for (let guard = 0; guard < 400; guard++) {
      if (R.isEmpty(b)) { if (b.layer === last) return b.outgoing; b = R.makeBoard(lv, b.layer + 1, b.outgoing); continue; }
      let ok;
      try { ok = b.arrows.map((_, i) => i).filter((i) => b.live[i] && R.probe(b, i).door != null)
        .map((i) => R.apply(b, i, R.probe(b, i).door)).filter((nb) => S.minMoves(nb) != null); } catch { return null; }
      if (!ok.length) return null;
      b = pick(r, ok);
    }
    return null;
  }

  function Chain(seed) {
    const r = rng(seed);
    const layers = [];
    let top = 0, incoming = [], tags = 0;
    // letras de los portales blancos: siguen en orden por toda la pila; no se reutilizan hasta dar la vuelta al abecedario
    const nextTag = () => String.fromCharCode(65 + (tags++ % 26));

    // Genera la capa `i` (absoluta) debajo de las ya existentes, validando la ventana desde la capa de arriba actual.
    function gen(i) {
      const depth = i + 1, prev = layers[i - 1];
      const nCol = depth < 4 ? 2 : depth < 9 ? 3 : 4, cols = shuffle(r, COLORS).slice(0, nCol);
      for (let attempt = 0; attempt < 25; attempt++) {
        const l = { w: W, h: H, arrows: [], doors: [], lanes: [], nextLanes: [] };
        // carriles de llegada (desde los portales de la capa de arriba) y su salida al borde opuesto
        if (prev) for (const n of prev.nextLanes) {
          l.lanes.push({ edge: n.edge, index: n.index, len: n.len });
          l.doors.push({ edge: OPP[n.edge], from: n.index, len: 1, colors: [n.color], lane: true });
        }
        // portales hacia la capa de abajo (1 al principio, 2 después), con sus carriles (verticales, columnas distintas)
        // carriles de la capa de abajo: todos verticales o todos horizontales (así no se cruzan), en columnas/filas distintas
        const horiz = r() < .5, nP = depth < 3 ? 1 : 2, laneCols = shuffle(r, horiz ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [0, 1, 2, 3, 4, 5]);
        for (let p = 0, tries = 0; p < nP && tries < 30; tries++) {
          // los portales blancos (el orden importa) son cada vez más frecuentes al bajar
          const color = depth >= 5 && p === 0 && r() < Math.min(.9, .35 + depth * .04) ? 'white' : pick(r, cols);
          const edge = pick(r, EDGES), len = 2 + Math.floor(r() * 2), from = Math.floor(r() * ((vert(edge) ? W : H) - len + 1));
          const d = { edge, from, len, colors: [color], portal: p, ...(color === 'white' ? { tag: nextTag() } : {}) };
          if (overlaps(l.doors, d)) continue;
          l.doors.push(d);
          l.nextLanes.push({ edge: horiz ? (r() < .5 ? 'left' : 'right') : (r() < .5 ? 'up' : 'down'), index: laneCols[p], len: horiz ? 3 + Math.floor(r() * 3) : 4 + Math.floor(r() * 3), color });
          p++;
        }
        if (!l.nextLanes.length) continue;
        // una salida lateral de color
        for (let t = 0; t < 10; t++) {
          const edge = pick(r, ['left', 'right']), len = 2 + Math.floor(r() * 2), d = { edge, from: Math.floor(r() * (H - len + 1)), len, colors: [pick(r, cols)] };
          if (!overlaps(l.doors, d)) { l.doors.push(d); break; }
        }
        const above = layers.slice(top, i);
        // puerta de un carril blanco: su secuencia es el orden de una partida posible de las capas de encima
        const wdoor = l.doors.find((d) => d.lane && d.colors[0] === 'white');
        if (wdoor) {
          const sent = above.length ? playthrough(withStub(above), incoming, r) : null;
          const lane = prev.nextLanes.findIndex((n) => n.color === 'white');
          const seq = sent ? sent[lane].map((p) => p.color) : [];
          wdoor.colors = seq.length ? seq : [pick(r, cols)];
        }
        const check = () => solvable(withStub([...above, l]), incoming);
        if (!check()) continue;
        // primero, al menos una flecha hacia cada portal: un portal sin nada que enviar no tiene sentido
        if (!l.doors.filter((d) => d.portal != null).every((d) => addArrow(l, r, cols, check, d))) continue;
        // a un portal blanco le llegan cada vez más flechas (de colores distintos): más orden que acertar abajo
        const wp = l.doors.find((d) => d.portal != null && d.colors[0] === 'white');
        if (wp) for (let k = 0, extra = Math.min(4, 1 + Math.floor((depth - 4) / 3)); k < extra; k++) addArrow(l, r, cols, check, wp);
        const n = Math.min(13, 7 + Math.floor(depth / 2)) - (prev ? 1 : 0); // tableros cargados desde el principio (admin, 2026-11-13)
        for (let k = l.arrows.length; k < n; k++) addArrow(l, r, cols, check);
        if (l.arrows.length + l.lanes.length === 0) continue;
        // ninguna puerta sin uso: o le apunta alguna flecha o es la salida de un carril (lo que llegue por él)
        const hits = (d) => l.arrows.some((a) => a.dir === d.edge && (vert(d.edge) ? a.x : a.y) >= d.from && (vert(d.edge) ? a.x : a.y) < d.from + d.len);
        l.doors = l.doors.filter((d) => d.lane || hits(d));
        if (l.doors.some((d) => d.portal != null && !hits(d))) continue; // un portal tiene que tener algo que enviar
        // cada carril de abajo mide justo lo que puede recibir: la suma de largos de las flechas que apuntan a su portal
        const before = l.nextLanes.map((n) => n.len);
        l.doors.filter((d) => d.portal != null).forEach((d) => {
          const demand = l.arrows.filter((a) => a.dir === d.edge && (vert(d.edge) ? a.x : a.y) >= d.from && (vert(d.edge) ? a.x : a.y) < d.from + d.len).reduce((s, a) => s + a.len, 0);
          l.nextLanes[d.portal].len = Math.max(1, Math.min(l.nextLanes[d.portal].len, demand));
        });
        if (!check()) l.nextLanes.forEach((n, k) => (n.len = before[k]));
        l.doors.forEach((d) => delete d.lane);
        layers[i] = l;
        return true;
      }
      return false;
    }

    return {
      init() { for (let i = 0; i < 3; i++) if (!gen(i)) return false; return true; },
      // nivel a jugar/pintar: las (hasta) tres capas visibles; y el de validar, con la capa auxiliar debajo
      level() { return { id: 0, name: '∞', moves: 0, layers: layers.slice(top, top + 3) }; },
      solveLevel() { return withStub(layers.slice(top, top + 3)); },
      get top() { return top; },
      get incoming() { return incoming; },
      // se ha vaciado la capa de arriba: bajamos y aparece una nueva al fondo
      shift(out) { top++; incoming = out; return gen(top + 2); },
    };
  }

  const api = { Chain };
  if (typeof module !== 'undefined') module.exports = api; else root.Infinito = api;
})(this);
